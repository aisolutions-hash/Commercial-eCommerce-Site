"""Admin API for connectors, gateways and MCP manifest. All endpoints admin-only."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.dependencies import require_admin
from app.models.user import User
from app.services.connectors import connector_security_report, fetch_connector, list_connectors
from app.services.gateway import GatewayStatus
from app.services.mcp_server import TOOL_DEFS

router = APIRouter(prefix="/api/admin/connectors", tags=["connectors"])


class FetchRequest(BaseModel):
    connector_id: str
    params: dict = {}


@router.get("")
async def get_connectors(_admin: User = Depends(require_admin)):
    return {"connectors": list_connectors(), "security": connector_security_report()}


@router.post("/fetch")
async def fetch(body: FetchRequest, _admin: User = Depends(require_admin)):
    try:
        return await fetch_connector(body.connector_id, body.params or {})
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e)[:300])


@router.get("/gateway/status")
async def gateway_status(_admin: User = Depends(require_admin)):
    return await GatewayStatus.report()


@router.get("/mcp/manifest")
async def mcp_manifest(_admin: User = Depends(require_admin)):
    """MCP tool definitions - lets agents/UI discover what the stdio server exposes."""
    return {"server": {"name": "kalika-datahub-mcp", "version": "0.1.0"}, "tools": TOOL_DEFS}