"""Minimal Model Context Protocol (MCP) server - stdio transport, JSON-RPC 2.0.

No external deps: speaks the MCP protocol subset (initialize, tools/list,
tools/call) over stdin/stdout lines. Exposes the connector registry as tools,
all secured behind the same gateways (internal allowlist, external allowlist).

Run standalone:  python -m app.services.mcp_server
Or via API manifest: GET /api/admin/connectors/mcp/manifest (returns tool JSON).
"""
from __future__ import annotations

import asyncio
import json
import sys

from app.services.connectors import fetch_connector, list_connectors

SERVER_INFO = {"name": "kalika-datahub-mcp", "version": "0.1.0"}

TOOL_DEFS = [
    {
        "name": "list_connectors",
        "description": "List all available data connectors (internal + external).",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "fetch_connector",
        "description": "Fetch data from a connector. Internal tables/views are allowlisted and PII-redacted; external hosts are allowlisted, https-only.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "connector_id": {"type": "string", "enum": [c["id"] for c in list_connectors()]},
                "params": {"type": "object", "description": "connector-specific params (table, limit, view, url)"},
            },
            "required": ["connector_id"],
        },
    },
]


async def _call_tool(name: str, args: dict) -> dict:
    if name == "list_connectors":
        return {"content": [{"type": "text", "text": json.dumps(list_connectors(), indent=2)}]}
    if name == "fetch_connector":
        try:
            result = await fetch_connector(args["connector_id"], args.get("params") or {})
            return {"content": [{"type": "text", "text": json.dumps(result, indent=2, default=str)[:8000]}]}
        except Exception as e:
            return {"isError": True, "content": [{"type": "text", "text": f"error: {e}"}]}
    return {"isError": True, "content": [{"type": "text", "text": f"unknown tool {name}"}]}


async def _handle(line: str) -> str:
    try:
        req = json.loads(line)
    except json.JSONDecodeError:
        return json.dumps({"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": "parse error"}})
    rid, method, params = req.get("id"), req.get("method"), req.get("params") or {}

    if method == "initialize":
        return json.dumps({"jsonrpc": "2.0", "id": rid, "result": {
            "protocolVersion": params.get("protocolVersion") or "2024-11-05",
            "capabilities": {"tools": {}}, "serverInfo": SERVER_INFO}})
    if method == "notifications/initialized":
        return ""
    if method == "tools/list":
        return json.dumps({"jsonrpc": "2.0", "id": rid, "result": {"tools": TOOL_DEFS}})
    if method == "tools/call":
        result = await _call_tool(params.get("name", ""), params.get("arguments") or {})
        return json.dumps({"jsonrpc": "2.0", "id": rid, "result": result})
    return json.dumps({"jsonrpc": "2.0", "id": rid, "error": {"code": -32601, "message": f"method not found: {method}"}})


async def stdio_loop():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        out = await _handle(line)
        if out:
            sys.stdout.write(out + "\n")
            sys.stdout.flush()


def run():
    asyncio.run(stdio_loop())


if __name__ == "__main__":
    run()