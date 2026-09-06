"""Connector registry: unified way to pull data from internal + external sources.

Each connector declares id, name, kind (internal|external), description and
how to fetch. No secrets in code - external auth comes from env
(KALIKA_<CONNECTOR>_KEY etc.) and is applied per fetch.
"""
from __future__ import annotations

import json
import os
from pathlib import Path

from app.services.gateway import ExternalGateway, InternalGateway

DATAHUB_DIR = Path(__file__).resolve().parents[3] / "kalisoftai-datahub"

CONNECTORS = [
    {
        "id": "postgres_internal",
        "name": "PostgreSQL (internal)",
        "kind": "internal",
        "description": "Read-only gateway to sales_contacts, kalika_enterprises, orders, pipeline tables and sales/marketing views. PII redacted by default.",
        "params": {"table": "sales_contacts", "limit": 20, "filters": {}},
    },
    {
        "id": "sales_views",
        "name": "Sales & Marketing views",
        "kind": "internal",
        "description": "Centralized views: v_sales_pipeline, v_marketing_funnel, v_monthly_sales.",
        "params": {"view": "v_sales_pipeline", "limit": 50},
    },
    {
        "id": "moglix",
        "name": "Moglix (external)",
        "kind": "external",
        "description": "B2B marketplace page fetch (ad-sales / homepage) through the external gateway allowlist.",
        "params": {"url": "https://www.moglix.com/ad-sales"},
    },
    {
        "id": "indiamart",
        "name": "IndiaMART (external)",
        "kind": "external",
        "description": "B2B marketplace page fetch through the external gateway allowlist.",
        "params": {"url": "https://www.indiamart.com/"},
    },
    {
        "id": "datahub_files",
        "name": "Datahub files (local)",
        "kind": "internal",
        "description": "Lists prompt/docs/sql files in kalisoftai-datahub (no content of sales data).",
        "params": {"dir": "prompts"},
    },
]


def list_connectors() -> list[dict]:
    return [{k: c[k] for k in ("id", "name", "kind", "description", "params")} for c in CONNECTORS]


async def fetch_connector(connector_id: str, params: dict | None = None) -> dict:
    conn = next((c for c in CONNECTORS if c["id"] == connector_id), None)
    if not conn:
        raise ValueError(f"unknown connector '{connector_id}'")
    p = {**(conn["params"] or {}), **(params or {})}

    if conn["id"] == "postgres_internal":
        return await InternalGateway.query(p.get("table", "sales_contacts"), p.get("limit", 20), p.get("filters") or {})
    if conn["id"] == "sales_views":
        return await InternalGateway.view(p.get("view", "v_sales_pipeline"), p.get("limit", 50))
    if conn["id"] == "moglix":
        return await ExternalGateway.fetch(p.get("url", "https://www.moglix.com/ad-sales"))
    if conn["id"] == "indiamart":
        return await ExternalGateway.fetch(p.get("url", "https://www.indiamart.com/"))
    if conn["id"] == "datahub_files":
        sub = (p.get("dir") or "prompts").replace("..", "")
        d = DATAHUB_DIR / sub
        if not d.is_dir():
            return {"connector": conn["id"], "status": "error", "error": f"dir {sub} not found"}
        files = sorted(f.name for f in d.iterdir() if f.is_file())
        return {"connector": conn["id"], "dir": sub, "files": files, "count": len(files)}
    raise ValueError(f"connector '{connector_id}' has no fetch implementation")


def connector_security_report() -> list[dict]:
    return [
        {"connector": c["id"], "kind": c["kind"], "auth": "env-based, never logged",
         "gateway": "internal allowlist" if c["kind"] == "internal" else "external allowlist + https"}
        for c in CONNECTORS
    ]