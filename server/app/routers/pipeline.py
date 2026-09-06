import asyncio
import json
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_admin
from app.models.pipeline import PipelineJob, PipelineStage, PipelineSyncRun, PipelineSchedule
from app.models.user import User
from app.services.ai_pipeline import run_pipeline, gemma_complete
from app.services.syncer import run_sync

router = APIRouter(prefix="/api/admin/pipeline", tags=["pipeline"])

PROMPTS_DIR = Path(__file__).resolve().parents[3] / "kalisoftai-datahub" / "prompts"


def _load_prompt(name: str) -> str:
    f = PROMPTS_DIR / name
    return f.read_text(encoding="utf-8") if f.exists() else ""


@router.post("/run")
async def start_pipeline(
    body: dict,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    job_id = str(uuid.uuid4())
    job = PipelineJob(
        id=job_id,
        name=body.get("name") or f"Data prep {datetime.utcnow():%Y-%m-%d %H:%M}",
        status="running",
        progress=0,
        options={"model": body.get("model"), "source": body.get("source") or "sales_contacts"},
    )
    db.add(job)
    await db.commit()
    asyncio.create_task(run_pipeline(job_id))
    return {"job_id": job_id, "status": "running"}


@router.get("/jobs")
async def list_jobs(
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    res = await db.execute(select(PipelineJob).order_by(PipelineJob.created_at.desc()).limit(limit))
    jobs = res.scalars().all()
    out = []
    for j in jobs:
        stages = (await db.execute(select(PipelineStage).where(PipelineStage.job_id == j.id))).scalars().all()
        out.append({
            "id": j.id, "name": j.name, "status": j.status, "progress": j.progress,
            "current_stage": j.current_stage, "model": j.model_name, "error": j.error,
            "created_at": j.created_at.isoformat() if j.created_at else None,
            "governance": j.governance or {},
            "stages": [{"key": s.key, "label": s.label, "status": s.status, "detail": s.detail} for s in stages],
        })
    return out


@router.get("/jobs/{job_id}")
async def get_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    job = await db.get(PipelineJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    stages = (await db.execute(select(PipelineStage).where(PipelineStage.job_id == job_id).order_by(PipelineStage.started_at))).scalars().all()
    return {
        "id": job.id, "name": job.name, "status": job.status, "progress": job.progress,
        "current_stage": job.current_stage, "model": job.model_name,
        "governance": job.governance or {}, "output_summary": job.output_summary or {},
        "error": job.error,
        "created_at": job.created_at.isoformat() if job.created_at else None,
        "stages": [{"key": s.key, "label": s.label, "status": s.status, "detail": s.detail} for s in stages],
    }


@router.post("/jobs/{job_id}/review")
async def review_job(
    job_id: str,
    body: dict,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Chat-assisted review: sends the prompt template + job context to Gemma
    (demo fallback if no API key). apply=true records human approval."""
    job = await db.get(PipelineJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    message = (body.get("message") or "").strip()
    template = _load_prompt("review_pipeline.md") or (
        "You are Kalika's data-governance reviewer. Job: {job}. Question: {question}. "
        "Reply with: summary, risks, recommended_changes (JSON)."
    )
    stages = (await db.execute(select(PipelineStage).where(PipelineStage.job_id == job_id))).scalars().all()
    context = json.dumps({"job_id": job.id, "status": job.status,
                          "governance": job.governance,
                          "stages": [s.key for s in stages]},
                         default=str)[:1500]
    prompt = template.replace("{job}", context).replace("{question}", message or "Review this job for release readiness.")

    try:
        answer = await asyncio.to_thread(gemma_complete, prompt, "Kalika data governance reviewer. Be concise.")
    except Exception as e:
        answer = json.dumps({"demo": True, "error": str(e)[:200]})

    thread = (job.output_summary or {}).get("review_thread") or []
    thread.append({"q": message or "Review job", "a": answer[:2000], "at": datetime.utcnow().isoformat()})

    changed = {}
    if body.get("apply"):
        job.status = "released"
        changed = {"status": "released", "note": "Human-approved via chat review"}
    job.output_summary = {**(job.output_summary or {}), "review_thread": thread}
    await db.commit()

    return {"answer": answer[:2000], "thread": thread, "changes_applied": changed}


@router.post("/jobs/{job_id}/release")
async def release_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Final release gate: re-runs guardrails on live source; only releases when green."""
    from app.services.guardrails import run_guardrails

    job = await db.get(PipelineJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    res = await db.execute(text("SELECT contact_id, email, company_name, phone_primary, lead_status FROM sales_contacts"))
    cols = list(res.keys())
    rows = [dict(zip(cols, r)) for r in res.all()]
    gov = run_guardrails(rows)
    job.governance = gov
    if gov["passed"]:
        job.status = "released"
        await db.commit()
        return {"released": True, "governance": gov}
    await db.commit()
    return {"released": False, "governance": gov}


@router.post("/sync")
async def sync_now(
    body: dict = {},
    _admin: User = Depends(require_admin),
):
    result = await run_sync(job_id=body.get("job_id"))
    return result


@router.get("/sync/last")
async def last_sync(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    res = await db.execute(select(PipelineSyncRun).order_by(PipelineSyncRun.created_at.desc()).limit(5))
    runs = res.scalars().all()
    return [{
        "id": r.id, "status": r.status, "total": r.total, "inserted": r.inserted,
        "updated": r.updated, "skipped": r.skipped, "error": r.error,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    } for r in runs]


@router.get("/schedule")
async def get_schedule(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    res = await db.execute(select(PipelineSchedule).where(PipelineSchedule.id == "sync"))
    row = res.scalar_one_or_none()
    if not row:
        return {"enabled": False, "interval_minutes": 60, "next_run_at": None, "last_run_at": None}
    return {
        "enabled": row.enabled, "interval_minutes": row.interval_minutes,
        "next_run_at": row.next_run_at.isoformat() if row.next_run_at else None,
        "last_run_at": row.last_run_at.isoformat() if row.last_run_at else None,
    }


@router.put("/schedule")
async def update_schedule(
    body: dict,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    res = await db.execute(select(PipelineSchedule).where(PipelineSchedule.id == "sync"))
    row = res.scalar_one_or_none()
    if not row:
        row = PipelineSchedule(id="sync", kind="sync")
        db.add(row)
    if "enabled" in body:
        row.enabled = bool(body["enabled"])
    if "interval_minutes" in body:
        row.interval_minutes = max(5, int(body["interval_minutes"]))
    await db.commit()
    return {"enabled": row.enabled, "interval_minutes": row.interval_minutes}