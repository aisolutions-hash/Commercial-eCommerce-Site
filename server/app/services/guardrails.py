"""Data governance guardrails for the AI pipeline.

Every check returns {check, status: pass|warn|fail, detail}. A 'fail' blocks
release; 'warn' is surfaced to the reviewer for a human call. This module is
pure/deterministic so the release gate works offline and never breaks the
existing pipeline (it only *reports*; applying is done by the syncer).
"""
from __future__ import annotations

import re

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^\+?[0-9][0-9\s\-()]{6,17}$")

# Fields considered mandatory for a usable sales lead
REQUIRED_FIELDS = ["email", "company_name", "lead_status"]


def _fill_rate(rows, field):
    if not rows:
        return 0.0
    return round(100 * sum(1 for r in rows if (r.get(field) or "").strip()) / len(rows), 1)


def _dup(values):
    seen, dup = set(), set()
    for v in values:
        v = (v or "").strip().lower()
        if v:
            if v in seen:
                dup.add(v)
            seen.add(v)
    return sorted(dup)


def run_guardrails(rows: list[dict]) -> dict:
    checks = []
    n = len(rows)

    # 1. Schema / population checks
    for f in REQUIRED_FIELDS:
        rate = _fill_rate(rows, f)
        checks.append({
            "check": f"fill_rate:{f}",
            "status": "pass" if rate >= 90 else ("warn" if rate >= 60 else "fail"),
            "detail": f"{rate}% populated",
        })

    # 2. PII presence (expected here: internal CRM). Redaction rule in logs.
    pii = sum(1 for r in rows if r.get("email"))
    checks.append({
        "check": "pii:email_present",
        "status": "warn" if n and pii == 0 else "pass",
        "detail": f"{pii} rows carry email (PII) - API logs must not echo values",
    })

    # 3. Format integrity
    bad_email = sum(1 for r in rows if r.get("email") and not EMAIL_RE.match(r["email"]))
    checks.append({
        "check": "format:email",
        "status": "pass" if bad_email == 0 else "warn",
        "detail": f"{bad_email} malformed email(s)",
    })
    bad_phone = sum(1 for r in rows if r.get("phone_primary") and not PHONE_RE.match(r["phone_primary"]))
    checks.append({
        "check": "format:phone",
        "status": "pass" if bad_phone == 0 else "warn",
        "detail": f"{bad_phone} malformed phone(s)",
    })

    # 4. Duplicates (internal duplicates waste pipeline budget)
    dups = _dup([r.get("email") for r in rows])
    checks.append({
        "check": "duplicates:email",
        "status": "fail" if n and len(dups) / n > 0.1 else ("warn" if dups else "pass"),
        "detail": f"{len(dups)} duplicate email(s): {dups[:5]}",
    })

    # 5. Domain sanity (reject obviously synthetic / disposable-heavy payloads)
    bad_domains = [d for d in _dup([r.get("email", "").split("@")[-1] for r in rows]) if d in {"", "example.com", "test.com"}]
    checks.append({
        "check": "domain:sanity",
        "status": "warn" if bad_domains else "pass",
        "detail": f"{len(bad_domains)} non-deliverable domain(s)",
    })

    # 6. Volume guard (release gate sanity)
    checks.append({
        "check": "volume:nonempty",
        "status": "fail" if n == 0 else "pass",
        "detail": f"{n} rows extracted",
    })

    statuses = {c["status"] for c in checks}
    return {
        "checks": checks,
        "passed": "fail" not in statuses,
        "warnings": sum(1 for c in checks if c["status"] == "warn"),
        "blockers": sum(1 for c in checks if c["status"] == "fail"),
    }
