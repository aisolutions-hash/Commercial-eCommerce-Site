# Kalika Datahub — Architecture & Flow Diagrams

## 1. AI Process Automation Pipeline (current working feature)

```
Admin UI (AiPipeline.tsx)
   |
   | POST /api/admin/pipeline/run        GET /api/admin/pipeline/jobs/{id}   (poll 2.5s)
   v                                        |
[FastAPI] asyncio.create_task(run_pipeline) |
   |                                        | progress % per stage
   v                                        v
pipeline_jobs / pipeline_stages  <---  persisted progress + stage logs
   |
   |  STAGES
   v
 +----------------+    +----------------+    +---------------------+
 | 1. extract     | -> | 2. clean       | -> | 3. governance       |
 | sales_contacts |    | normalize      |    | guardrails (6 checks)|
 +----------------+    +----------------+    +---------------------+
                                                     | pass/fail
                                                     v
 +----------------+    +----------------+    +---------------------+
 | 4. segment     | -> | 5. gemma model | -> | 6. release gate     |
 | heuristic      |    | env-key or demo|    | fail -> waiting_review
 +----------------+    +----------------+    +---------------------+
                                                     |
                                                     v  (released)
                                    chat review /api/jobs/{id}/review
                                    (prompts from kalisoftai-datahub/prompts)
```

## 2. Sync to kalika_enterprises (Cloud-Function-ready shape)

```
UI "Sync now" / scheduler loop (60s tick)
   |
   v
run_sync()  --  same SQL a GCP Cloud Function would run
   |
   +-- SELECT ... FROM sales_contacts        (source of truth)
   |
   +-- UPSERT INTO kalika_enterprises        (curated mirror + ai_segment/score)
   |
   v
pipeline_sync_runs  (status, inserted/updated/skipped)  -> UI shows progress
```

Scheduler state: `pipeline_schedule` row (enabled, interval_minutes,
next_run_at) — editable from the UI; honored by an in-process asyncio loop.
On GCP: replace the loop with Cloud Scheduler -> Cloud Function calling the
same `run_sync()`.

## 3. Release gate & governance

```
release request
   |
   v
run_guardrails(rows)  [pure, deterministic]
   |
   +-- fill_rate:email/company/status   (pass>=90 warn>=60 fail<60)
   +-- pii:email_present                (warn if none)
   +-- format:email / format:phone      (warn on malformed)
   +-- duplicates:email                 (fail if >10%)
   +-- domain:sanity                    (warn example.com/test.com)
   +-- volume:nonempty                  (fail on 0 rows)
   |
   v
passed == true  ->  status = released   (visible in v_sales_pipeline)
passed == false ->  status = waiting_review (chat reviewer decides)
```

## 4. Views (centralized data, created at startup, additive)

```
sales_contacts ─┐
                ├─> v_sales_pipeline    (lead view for sales team)
                ├─> v_marketing_funnel  (lead_source x lead_status x avg AI score)
orders ─────────┤
                └─> v_monthly_sales     (orders, revenue, AOV by month)
```

## 5. Continuous learning loop (simplest version, current)

```
pipeline run ──> segments + scores stored in output_summary
                     |
                     v
next run re-reads prior segments (feature input to Gemma)
                     |
                     v
chat review outcomes + release verdicts logged in job.output_summary
                     |
                     v
(loop) — improvement is prompt-driven today; RLHF bandit is Future Scope #1
```

## 6. Future scope: auth pipeline & agentic RL

```
[future] User/Auth pipeline
user login -> JWT (existing) -> RBAC per role
  admin     : pipeline run/release/sync/schedule
  sales     : v_sales_pipeline + sales_contacts (read)
  marketing : v_marketing_funnel + campaigns
  ops       : sync runs + audit

[future] Agentic RL optimization
runs/feedback -> reward = release verdict + manual corrections
  -> epsilon-greedy over prompt variants / segment thresholds
  -> tracked in ai_automation_log (already in bigquery schema)
```