import logging
import os
import time
from contextlib import asynccontextmanager

import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIASGIMiddleware
from slowapi.util import get_remote_address
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.config import settings
from app.database import engine
from app.logging_config import setup_logging
from app.routers import auth, categories, contact, orders, products, users, wishlist

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
    yield
    logger.info("Shutting down application")
    await engine.dispose()


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

app.include_router(categories.router)
app.include_router(products.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(orders.router)
app.include_router(wishlist.router)
app.include_router(contact.router)


@app.get("/api/health")
async def health():
    db_ok = True
    try:
        async with engine.connect() as conn:
            await conn.execute(await conn.connection.get_dbapi_type(20))
    except Exception as e:
        logger.error("Health check failed: %s", e)
        db_ok = False

    return {
        "status": "ok" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
        "version": "1.0.0",
    }
