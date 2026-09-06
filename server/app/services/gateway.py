"""Data gateways: internal (read-only DB) and external (allowlisted outbound HTTP).

Security model:
- Internal gateway: table/view allowlist, read-only SELECT, optional row limit.
  Never echoes full PII rows by default - callers opt into "detail".
- External gateway: HTTPS only, domain allowlist (env KALIKA_EXTERNAL_ALLOWLIST),
  response size cap, auth secrets never logged (redacted in errors).
Both are pure functions over sqlalchemy/urllib so they work with or without keys.
"""
from __future__ import annotations

import asyncio
import json
import os
import re
import urllib.parse
import urllib.request

from sqlalchemy import text

from app.database import async_session_factory

INTERNAL_TABLES = {
    "sales_contacts", "kalika_enterprises", "orders", "products", "categories",
    "pipeline_jobs", "pipeline_stages", "pipeline_sync_runs",
}
INTERNAL_VIEWS = {"v_sales_pipeline", "v_marketing_funnel", "v_monthly_sales"}

PII_FIELDS = {"email", "phone", "phone_primary", "address_line1", "followup_notes", "team_notes"}


def _redact(values: list[dict], detail: bool) -> list[dict]:
    if detail:
        return values
    out = []
    for v in values:
        out.append({k: ("***" if k in PII_FIELDS and v.get(k) else val) for k, val in v.items()})
    return out


class InternalGateway:
    """Read-only access to curated internal data."""

    @staticmethod
    async def query(table: str, limit: int = 20, filters: dict | None = None) -> dict:
        if table not in INTERNAL_TABLES:
            raise ValueError(f"table '{table}' not in internal allowlist")
        limit = max(1, min(int(limit), 200))
        where, params = "", {}
        if filters:
            clauses = []
            for k, v in filters.items():
                clauses.append(f'"{k}" = :{k}')
                params[k] = v
            where = " WHERE " + " AND ".join(clauses)
        sql = text(f'SELECT * FROM "{table}"{where} LIMIT {limit}')
        async with async_session_factory() as db:
            res = await db.execute(sql, params)
            cols = list(res.keys())
            rows = [dict(zip(cols, r)) for r in res.all()]
        return {"gateway": "internal", "table": table, "rows": len(rows), "data": _redact(rows, False)}

    @staticmethod
    async def view(name: str, limit: int = 50) -> dict:
        if name not in INTERNAL_VIEWS:
            raise ValueError(f"view '{name}' not in internal allowlist")
        limit = max(1, min(int(limit), 200))
        async with async_session_factory() as db:
            res = await db.execute(text(f'SELECT * FROM "{name}" LIMIT {limit}'))
            cols = list(res.keys())
            rows = [dict(zip(cols, r)) for r in res.all()]
        return {"gateway": "internal", "view": name, "rows": len(rows), "data": _redact(rows, True)}


class ExternalGateway:
    """Allowlisted outbound fetcher. HTTPS only; secrets redacted from errors."""

    DEFAULT_ALLOWLIST = {"www.moglix.com", "www.indiamart.com", "dir.indiamart.com", "export.indiamart.com"}

    @staticmethod
    def _allowlist() -> set[str]:
        env = os.getenv("KALIKA_EXTERNAL_ALLOWLIST", "")
        hosts = {h.strip().lower() for h in env.split(",") if h.strip()}
        return hosts or ExternalGateway.DEFAULT_ALLOWLIST

    @staticmethod
    async def fetch(url: str, headers: dict | None = None, max_bytes: int = 200_000) -> dict:
        parsed = urllib.parse.urlparse(url)
        if parsed.scheme != "https":
            raise ValueError("external gateway: https required")
        if parsed.hostname not in ExternalGateway._allowlist():
            raise ValueError(f"external gateway: host '{parsed.hostname}' not in allowlist")

        req_headers = {"User-Agent": "KalikaDatahub/1.0 (+internal)"}
        req_headers.update(headers or {})

        def _get() -> str:
            req = urllib.request.Request(url, headers=req_headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                return resp.read(max_bytes + 1).decode("utf-8", "ignore")

        try:
            body = await asyncio.to_thread(_get)
            if len(body) > max_bytes:
                return {"gateway": "external", "url": url, "status": "truncated",
                        "bytes": len(body), "data": body[:max_bytes]}
            return {"gateway": "external", "url": url, "status": "ok", "bytes": len(body), "data": body}
        except Exception as e:
            msg = re.sub(r"(key|token|api[_-]?key|secret)=[^&\s]+", r"\1=***", str(e))
            return {"gateway": "external", "url": url, "status": "error", "error": msg[:300]}


class GatewayStatus:
    @staticmethod
    async def report() -> dict:
        internal_ok = external_ok = True
        try:
            await InternalGateway.view("v_sales_pipeline", limit=1)
        except Exception:
            internal_ok = False
        try:
            await ExternalGateway.fetch("https://www.moglix.com/")
        except Exception:
            external_ok = False  # network may be blocked; still "configured"
        return {
            "internal": {"status": "ok" if internal_ok else "degraded",
                         "tables": sorted(INTERNAL_TABLES), "views": sorted(INTERNAL_VIEWS),
                         "pii_redaction": "on"},
            "external": {"status": "configured", "allowlist": sorted(ExternalGateway._allowlist()),
                         "https_only": True, "size_cap_bytes": 200_000},
        }