"""Simple data-transfer sync: sales_contacts -> kalika_enterprises (curated mirror).

Upsert semantics, rows skipped when no email/company. Used by the UI "Sync now"
button and the in-DB scheduler loop. Mirrors the same shape a Cloud Function
would use, so migration to GCP = point it at the same SQL.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta

from sqlalchemy import select, text

from app.database import async_session_factory
from app.models.pipeline import KalikaEnterprise, PipelineSyncRun


async def run_sync(job_id: str | None = None) -> dict:
    run_id = str(uuid.uuid4())
    async with async_session_factory() as db:
        db.add(PipelineSyncRun(id=run_id, status="running", job_id=job_id,
                               created_at=datetime.utcnow()))
        await db.commit()

    total = inserted = updated = skipped = 0
    try:
        async with async_session_factory() as db:
            res = await db.execute(text(
                "SELECT contact_id, company_name, email, phone_primary, industry, company_type, "
                "city, state, lead_status FROM sales_contacts"
            ))
            cols = list(res.keys())
            rows = [dict(zip(cols, r)) for r in res.all()]
            total = len(rows)
            for r in rows:
                if not (r.get("email") or r.get("company_name")):
                    skipped += 1
                    continue
                existing = await db.get(KalikaEnterprise, r["contact_id"])
                payload = {
                    "company_name": r.get("company_name"), "email": r.get("email"),
                    "phone": r.get("phone_primary"), "industry": r.get("industry"),
                    "company_type": r.get("company_type"), "city": r.get("city"),
                    "state": r.get("state"), "lead_status": r.get("lead_status"),
                    "job_id": job_id,
                }
                if existing:
                    for k, v in payload.items():
                        setattr(existing, k, v)
                    existing.updated_at = datetime.utcnow()
                    updated += 1
                else:
                    db.add(KalikaEnterprise(id=r["contact_id"], **payload))
                    inserted += 1
            await db.commit()

        async with async_session_factory() as db:
            run = await db.get(PipelineSyncRun, run_id)
            run.status = "ok"
            run.total, run.inserted, run.updated, run.skipped = total, inserted, updated, skipped
            await db.commit()
        return {"status": "ok", "total": total, "inserted": inserted, "updated": updated, "skipped": skipped}

    except Exception as e:
        async with async_session_factory() as db:
            run = await db.get(PipelineSyncRun, run_id)
            run.status = "failed"
            run.error = str(e)[:1000]
            await db.commit()
        return {"status": "failed", "error": str(e)[:500]}


async def scheduler_tick():
    """Honor pipeline_schedule: run sync when due. Called from lifespan loop."""
    from sqlalchemy import text
    try:
        async with async_session_factory() as db:
            res = await db.execute(text(
                "SELECT id, enabled, interval_minutes, next_run_at FROM pipeline_schedule WHERE id='sync'"
            ))
            row = res.first()
            if not row or not row.enabled:
                return
            due = row.next_run_at is None or datetime.utcnow() >= row.next_run_at
            if not due:
                return
            await db.execute(text(
                "UPDATE pipeline_schedule SET last_run_at=:now, next_run_at=:next WHERE id='sync'"
            ), {"now": datetime.utcnow(),
                "next": datetime.utcnow() + timedelta(minutes=row.interval_minutes)})
            await db.commit()
        await run_sync(job_id="scheduled")
    except Exception:
        return