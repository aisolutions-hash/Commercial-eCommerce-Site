import asyncio
import logging
import os
import time
from contextlib import asynccontextmanager
from pathlib import Path

import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIASGIMiddleware
from slowapi.util import get_remote_address
from starlette.exceptions import HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.config import settings
from app.database import Base, engine
from app.logging_config import setup_logging
from app.routers import admin, auth, categories, contact, orders, pipeline, products, sales_contacts, users, wishlist

setup_logging()
logger = logging.getLogger(__name__)

if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        traces_sample_rate=0.1,
        profiles_sample_rate=0.1,
    )

limiter = Limiter(key_func=get_remote_address)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.time()
        response: Response = await call_next(request)
        duration_ms = round((time.time() - start) * 1000)
        logger.info(
            "request",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status": response.status_code,
                "duration_ms": duration_ms,
            },
        )
        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting application")
    from sqlalchemy import text
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            for col in ["google_id", "role"]:
                try:
                    await conn.execute(text(f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {col} VARCHAR(255)"))
                except Exception:
                    pass
            await _ensure_views(conn)
            await conn.execute(text("SELECT 1"))
            logger.info("Database pool warmed up")
    except Exception as e:
        logger.warning("DB warm-up failed (non-fatal): %s", e)

    from app.services.syncer import scheduler_tick
    task = asyncio.create_task(_scheduler_loop(scheduler_tick))
    yield
    task.cancel()
    logger.info("Shutting down application")
    await engine.dispose()


async def _scheduler_loop(tick):
    while True:
        await asyncio.sleep(60)
        await tick()


async def _ensure_views(conn):
    """Additive sales/marketing views over centralized tables. Never breaks pipeline."""
    views = {
        "v_sales_pipeline": """
            CREATE OR REPLACE VIEW v_sales_pipeline AS
            SELECT contact_id, first_name || ' ' || last_name AS full_name, company_name,
                   company_type, industry, lead_status, lead_priority, ai_score,
                   deal_value, next_followup_at, assigned_to
            FROM sales_contacts""",
        "v_marketing_funnel": """
            CREATE OR REPLACE VIEW v_marketing_funnel AS
            SELECT lead_source, lead_status, COUNT(*) AS leads,
                   ROUND(AVG(ai_score), 1) AS avg_ai_score
            FROM sales_contacts GROUP BY lead_source, lead_status""",
        "v_monthly_sales": """
            CREATE OR REPLACE VIEW v_monthly_sales AS
            SELECT date_trunc('month', created_at)::date AS month,
                   COUNT(*) AS orders, SUM(total) AS revenue,
                   ROUND(AVG(total), 2) AS avg_order_value
            FROM orders WHERE status <> 'cancelled' GROUP BY 1 ORDER BY 1 DESC""",
    }
    for name, sql in views.items():
        try:
            await conn.execute(text(sql))
            logger.info("view ensured: %s", name)
        except Exception as e:
            logger.warning("view %s skipped: %s", name, e)


app = FastAPI(title="KaliSoft AI Marketplace API", version="1.0.0", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

origins = settings.cors_origins.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SlowAPIASGIMiddleware)

app.include_router(admin.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(orders.router)
app.include_router(wishlist.router)
app.include_router(contact.router)
app.include_router(sales_contacts.router)
app.include_router(pipeline.router)


STATIC_DIR = Path(__file__).parent.parent / "static"


class SPAStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope):
        try:
            return await super().get_response(path, scope)
        except HTTPException as e:
            if e.status_code == 404:
                return await super().get_response("index.html", scope)
            raise


if STATIC_DIR.exists():
    app.mount("/", SPAStaticFiles(directory=str(STATIC_DIR), html=True), name="static")


@app.get("/api/health")
async def health():
    db_ok = True
    try:
        from sqlalchemy import text
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as e:
        logger.error("Health check failed: %s", e)
        db_ok = False

    return {
        "status": "ok" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
        "version": "1.0.0",
    }
