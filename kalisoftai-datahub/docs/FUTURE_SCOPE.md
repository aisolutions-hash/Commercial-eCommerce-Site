# Future Scope — Kalika Datahub

## 1. Auth pipeline (per-role access)
- Today: JWT admin gate (`require_admin`) on all datahub endpoints.
- Future: role matrix — `admin` (run/release/sync), `sales` (read leads,
  update follow-ups), `marketing` (read funnel views, manage campaigns),
  `ops` (sync + audit). Enforce in FastAPI dependency + UI nav filtering.
- Add `pipeline_audit_log` table: who ran/released/synced what, when.

## 2. Continuous learning & optimization
- Current (shipped): prompt-driven improvement — each run's Gemma output,
  heuristic segments and chat review outcomes are persisted, so the next
  run can be given the previous run's verdicts as context.
- Future A (simplest RL): epsilon-greedy bandit over prompt variants.
  Reward = release verdict + human corrections. Track arms/outcomes in
  `ai_automation_log` (already in bigquery_schema.sql).
- Future B (agentic): autonomous agent loop — agent drafts changes, guardrails
  approve, agent self-releases with audit trail.

## 3. GCP migration
- Postgres schema is BigQuery-compatible (see bigquery_schema.sql).
- Replace in-process scheduler with Cloud Scheduler -> Cloud Function
  calling the same `run_sync()` SQL.
- Views become BigQuery views with partitioning by `_partition_date`.

## 4. Feature roadmap (next sprints)
| Feature | Status | Branch | Notes |
|---|---|---|---|
| Sales insights dashboard | shipped | main | product analytics |
| Sales contacts + leads | shipped | main | CRUD + filters |
| AI pipeline (data prep→release) | shipped | main | gemma env/demo mode |
| Sync to kalika_enterprises | shipped | main | UI button + scheduler |
| Chat-assisted review | shipped | main | prompts from /prompts |
| Sales/marketing views | shipped | main | created at startup |
| Auth role matrix | future | feat/auth-roles | see #1 |
| RL bandit optimization | future | feat/rl-bandit | see #2 |
| Cloud Function sync | future | feat/gcp-sync | Cloud Scheduler + Function |
| BigQuery warehouse sync | future | feat/bigquery | partition + batch id |