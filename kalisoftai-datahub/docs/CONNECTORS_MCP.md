# Connectors, MCP Tools & Data Gateways

Secured data access layer: internal data (Postgres) and external data
(Moglix, IndiaMART) flow through explicit gateways. Exposed three ways:

1. **Admin REST API** — `/api/admin/connectors/*` (admin-only)
2. **MCP tools** — dependency-free stdio server (JSON-RPC 2.0) for agents
3. **Direct service calls** — `app.services.connectors.fetch_connector()`

## Architecture

```
                     +-------------------------------------------+
                     |              KALIKA BACKEND                |
                     |                                           |
  Admin UI  -------> |  /api/admin/connectors/*  (JWT admin)     |
  MCP agent ------>  |  stdio JSON-RPC  (mcp_server.py)          |
  internal code -->  |  services.connectors.fetch_connector()    |
                     |                                           |
                     |   +----------------+  +----------------+  |
                     |   | INTERNAL GW    |  | EXTERNAL GW    |  |
                     |   | table allowlist|  | host allowlist |  |
                     |   | view allowlist |  | https-only     |  |
                     |   | read-only SQL  |  | size cap 200KB |  |
                     |   | PII redaction  |  | secrets redact |  |
                     |   +----------------+  +----------------+  |
                     +---------------------+---------------------+
                                           |
                     +---------------------+---------------------+
                     |  Postgres (sales_contacts, kalika_        |
                     |  enterprises, orders, pipeline, views)    |
                     +-------------------------------------------+

 External gateways call out only to:
   www.moglix.com, www.indiamart.com, dir.indiamart.com,
   export.indiamart.com   (override via KALIKA_EXTERNAL_ALLOWLIST)
```

## Connectors

| id | kind | source | notes |
|---|---|---|---|
| `postgres_internal` | internal | sales_contacts, kalika_enterprises, orders, products, categories, pipeline_* | read-only, PII redacted, limit ≤200 |
| `sales_views` | internal | v_sales_pipeline, v_marketing_funnel, v_monthly_sales | centralized views |
| `moglix` | external | https://www.moglix.com/ad-sales | allowlisted |
| `indiamart` | external | https://www.indiamart.com/ | allowlisted |
| `datahub_files` | internal | kalisoftai-datahub/{prompts,docs,sql} | file listing only |

## Security model

- **Auth**: every REST endpoint requires the admin JWT (`require_admin`).
- **Internal gateway**: SELECT-only on an allowlisted set of tables/views;
  PII fields (email, phone, address, notes) are `***` unless the view is
  already a curated one. Row limits enforced server-side.
- **External gateway**: HTTPS only, host allowlist (env override), 15s
  timeout, 200 KB response cap, and API-key/secret values are regex-redacted
  from any error before it is returned or logged.
- **No secrets in code**: all keys come from environment variables.
- **Audit**: connector fetches are admin actions; extend with
  `pipeline_audit_log` when the auth role matrix lands (see FUTURE_SCOPE.md).

## Using the MCP server

```bash
# stdio mode - pipe JSON-RPC lines in, read responses out
python -m app.services.mcp_server
```

```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05"}}
{"jsonrpc":"2.0","id":2,"method":"tools/list"}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"fetch_connector","arguments":{"connector_id":"sales_views","params":{"view":"v_marketing_funnel","limit":20}}}}
```

Agent integrations (Claude Code / opencode MCP client) can read the manifest
at `GET /api/admin/connectors/mcp/manifest` and drive the stdio server with
the two tools: `list_connectors`, `fetch_connector`.

## REST examples

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/admin/connectors
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"connector_id":"postgres_internal","params":{"table":"sales_contacts","limit":5}}' \
  http://localhost:8000/api/admin/connectors/fetch
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/admin/connectors/gateway/status
```

## Files

| file | purpose |
|---|---|
| `server/app/services/gateway.py` | internal + external gateways, status |
| `server/app/services/connectors.py` | connector registry + dispatcher |
| `server/app/services/mcp_server.py` | dependency-free MCP stdio server |
| `server/app/routers/connectors.py` | admin REST endpoints |
| `kalisoftai-datahub/docs/CONNECTORS_MCP.md` | this document |