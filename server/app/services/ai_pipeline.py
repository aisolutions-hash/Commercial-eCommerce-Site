"""AI pipeline runner: extract -> clean -> governance -> segment -> gemma -> release gate.

Model access is env-driven and degrades gracefully:
  KALIKA_GEM_MODEL  (default gemma-3-27b-it)
  KALIKA_GEM_API_KEY (Google GenAI API key) - if absent, runs deterministic demo mode
so the pipeline never breaks without keys. Progress is persisted per stage.
"""
from __future__ import annotations

import asyncio
import json
import os
import re
import urllib.request
import uuid
from datetime import datetime

from app.database import async_session_factory
from app.models.pipeline import PipelineJob, PipelineStage
from app.services.guardrails import run_guardrails

GEM_MODEL = os.getenv("KALIKA_GEM_MODEL", "gemma-3-27b-it")
GEM_API_KEY = os.getenv("KALIKA_GEM_API_KEY", "")

STAGES = [
    ("extract", "Extract source data"),
    ("clean", "Clean & normalize"),
    ("governance", "Governance guardrails"),
    ("segment", "Feature scoring & segment"),
    ("gemma", "Gemma model inference"),
    ("release_gate", "Release gate"),
]


def gemma_complete(prompt: str, system: str = "") -> str:
    """Blocking call to Google GenAI for a Gemma model; demo fallback if no key."""
    if not GEM_API_KEY:
        return json.dumps({
            "demo": True,
            "note": "No KALIKA_GEM_API_KEY set - deterministic demo output",
            "answer": "Pipeline reviewed. No blocking issues found.",
        }, ensure_ascii=False)
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEM_MODEL}:generateContent?key={GEM_API_KEY}"
    body = {
        "system_instruction": {"parts": [{"text": system}]} if system else None,
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 1024},
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode())
    parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
    return "".join(p.get("text", "") for p in parts)


def _clean_rows(rows: list[dict]) -> tuple[list[dict], dict]:
    cleaned, stats = [], {"trimmed": 0, "normalized_phones": 0, "dropped": []}
    for r in rows:
        r = {k: (v.strip() if isinstance(v, str) else v) for k, v in r.items()}
        ph = r.get("phone_primary") or ""
        if ph:
            digits = re.sub(r"[^0-9+]", "", ph)
            if digits != ph:
                r["phone_primary"] = digits
                stats["normalized_phones"] += 1
        if r.get("email") or r.get("company_name"):
            cleaned.append(r)
            if r.get("email"):
                stats["trimmed"] += 1
    return cleaned, stats


def _segment(rows: list[dict]) -> dict:
    """Heuristic pre-segment used both for demo mode and as feature input to Gemma."""
    segments = {}
    for r in rows:
        ctype = (r.get("company_type") or "").lower()
        score = 50.0
        if ctype == "enterprise":
            segment, score = "enterprise", 85
        elif ctype in ("manufacturer", "government"):
            segment, score = "strategic", 78
        elif ctype == "distributor":
            segment, score = "channel", 68
        elif ctype == "retailer":
            segment, score = "retail", 62
        else:
            segment = "smb"
        if r.get("deal_value"):
            score = min(98, score + 10)
        segments[r["id"]] = {"segment": segment, "score": round(score, 1)}
    return segments


async def _row_loader(source: str):
    """Fetch rows from source table; never raises (empty list + note on failure)."""
    try:
        from sqlalchemy import text
        async with async_session_factory() as s:
            res = await s.execute(text(f"SELECT contact_id AS id, email, phone_primary, company_name, company_type, industry, city, state, lead_status, deal_value FROM {source}"))
            cols = list(res.keys())
            return [dict(zip(cols, row)) for row in res.all()]
    except Exception as e:
        return [{"id": "load_error", "error": str(e)}]


async def run_pipeline(job_id: str):
    """Background runner. Updates PipelineJob + PipelineStage rows as it goes."""
    from sqlalchemy import select

    try:
        async with async_session_factory() as db:
            job = (await db.execute(select(PipelineJob).where(PipelineJob.id == job_id))).scalar_one()
            model = (job.options or {}).get("model") or GEM_MODEL
            job.model_name = model
            await db.commit()

        total_stages = len(STAGES)
        completed = 0
        for i, (key, label) in enumerate(STAGES):
            stage_id = str(uuid.uuid4())
            async with async_session_factory() as db:
                db.add(PipelineStage(id=stage_id, job_id=job_id, key=key, label=label, status="running",
                                     started_at=datetime.utcnow()))
                job = (await db.execute(select(PipelineJob).where(PipelineJob.id == job_id))).scalar_one()
                job.current_stage = key
                await db.commit()

            detail = await _run_stage(key, job_id, stage_id, model)

            status = "passed" if not detail.get("failed") else "failed"
            async with async_session_factory() as db:
                stage = await db.get(PipelineStage, stage_id)
                stage.status = status
                stage.detail = detail
                stage.finished_at = datetime.utcnow()
                job = (await db.execute(select(PipelineJob).where(PipelineJob.id == job_id))).scalar_one()
                completed += 1
                job.progress = round(100 * completed / total_stages)
                if key == "governance":
                    job.governance = detail.get("governance", {})
                if key == "gemma":
                    job.output_summary = {**(job.output_summary or {}), "ai_summary": detail.get("summary"), "segments": detail.get("segments")}
                if key == "release_gate":
                    job.status = "released" if detail.get("ok") else "waiting_review"
                await db.commit()

    except Exception as e:  # pipeline must never take down the app
        async with async_session_factory() as db:
            job = await db.get(PipelineJob, job_id)
            if job:
                job.status = "failed"
                job.error = str(e)[:1000]
                await db.commit()


async def _run_stage(key: str, job_id: str, stage_id: str, model: str) -> dict:
    if key == "extract":
        rows = await _row_loader("sales_contacts")
        return {"rows": len(rows), "failed": len(rows) == 1 and "error" in rows[0]}
    if key == "clean":
        rows = await _row_loader("sales_contacts")
        cleaned, stats = _clean_rows(rows)
        return {"rows": len(cleaned), "stats": stats, "failed": False}
    if key == "governance":
        rows = await _row_loader("sales_contacts")
        gov = run_guardrails(rows)
        return {"governance": gov, "failed": not gov["passed"]}
    if key == "segment":
        rows = await _row_loader("sales_contacts")
        return {"segments": _segment(rows), "rows": len(rows), "failed": False}
    if key == "gemma":
        rows = await _row_loader("sales_contacts")
        segments = _segment(rows)
        prompt = (
            f"Review this B2B lead dataset ({len(rows)} rows, model {model}). "
            f"Pre-computed segments: {json.dumps(segments)[:400]}. "
            "Return a one-paragraph English summary of data quality and the top 3 recommended actions."
        )
        try:
            raw = await asyncio.to_thread(gemma_complete, prompt, "You are Kalika's data governance assistant.")
            summary = raw
        except Exception as e:
            summary = json.dumps({"demo": True, "error": str(e)[:200]})
        return {"summary": summary[:2000], "segments": segments, "failed": False}
    if key == "release_gate":
        rows = await _row_loader("sales_contacts")
        gov = run_guardrails(rows)
        return {"ok": gov["passed"], "governance": gov, "failed": not gov["passed"]}
    return {"failed": True, "detail": f"unknown stage {key}"}