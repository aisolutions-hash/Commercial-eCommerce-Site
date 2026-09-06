from sqlalchemy import Column, String, Text, Integer, Float, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base


class PipelineJob(Base):
    """One AI data-prep run: extract -> clean -> governance -> segment -> gemma -> release gate."""
    __tablename__ = "pipeline_jobs"

    id = Column(String, primary_key=True)
    name = Column(String(255), nullable=False)
    status = Column(String(50), default="running")  # running | waiting_review | released | failed
    progress = Column(Integer, default=0)  # 0-100
    current_stage = Column(String(100))
    model_name = Column(String(100), default="gemma-3-27b-it")  # demo-safe default, overridable
    source = Column(String(100), default="sales_contacts")
    options = Column(JSON, default=dict)  # user-supplied run options
    governance = Column(JSON, default=dict)  # {checks: [...], passed: bool}
    output_summary = Column(JSON, default=dict)  # ai_summary, segments, review_thread
    error = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class PipelineStage(Base):
    """Per-stage log row with detail for intermediate views + progress bars."""
    __tablename__ = "pipeline_stages"

    id = Column(String, primary_key=True)
    job_id = Column(String, index=True, nullable=False)
    key = Column(String(100))
    label = Column(String(150))
    status = Column(String(20), default="pending")  # pending | running | passed | failed | skipped
    detail = Column(JSON, default=dict)
    started_at = Column(DateTime, server_default=func.now())
    finished_at = Column(DateTime)


class KalikaEnterprise(Base):
    """Curated mirror of sales contacts (pipeline output + AI segment/score)."""
    __tablename__ = "kalika_enterprises"

    id = Column(String, primary_key=True)  # source contact_id
    company_name = Column(String(255))
    email = Column(String(255))
    phone = Column(String(20))
    industry = Column(String(100))
    company_type = Column(String(50))
    city = Column(String(100))
    state = Column(String(100))
    lead_status = Column(String(50))
    ai_segment = Column(String(50))
    ai_score = Column(Float)
    job_id = Column(String)
    synced_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class PipelineSyncRun(Base):
    """History of sync runs to kalika_enterprises."""
    __tablename__ = "pipeline_sync_runs"

    id = Column(String, primary_key=True)
    status = Column(String(20), default="running")  # running | ok | failed
    total = Column(Integer, default=0)
    inserted = Column(Integer, default=0)
    updated = Column(Integer, default=0)
    skipped = Column(Integer, default=0)
    job_id = Column(String)
    detail = Column(JSON, default=dict)
    error = Column(Text)
    created_at = Column(DateTime, server_default=func.now())


class PipelineSchedule(Base):
    """Simple in-DB scheduler state (background loop honors next_run_at)."""
    __tablename__ = "pipeline_schedule"

    id = Column(String, primary_key=True, default="sync")
    kind = Column(String(50), default="sync")
    enabled = Column(Boolean, default=False)
    interval_minutes = Column(Integer, default=60)
    next_run_at = Column(DateTime)
    last_run_at = Column(DateTime)
