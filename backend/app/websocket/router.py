"""
WebSocket router – streams navigation events to the client.
Authenticates via ?token= query param because browsers cannot send
Authorization headers with the native WebSocket API.
"""
import logging
from typing import Optional

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from jose import JWTError
from sqlalchemy import select

from app.core.security import verify_token
from app.database.base import AsyncSessionLocal
from app.models.user import User
from app.websocket.manager import manager

logger = logging.getLogger(__name__)
router = APIRouter()


@router.websocket("/ws/navigation/{run_id}")
async def websocket_navigation(
    websocket: WebSocket,
    run_id: str,
    token: Optional[str] = Query(default=None),
):
    """
    WebSocket endpoint for real-time navigation updates.

    Authentication:
      Pass the JWT access token as ?token=<jwt> in the URL.
      Unauthenticated connections are accepted in demo mode (no token required).
    """
    # Optional authentication
    user_id: Optional[int] = None
    if token:
        try:
            payload = verify_token(token)
            if payload.get("type") == "access":
                user_id = int(payload.get("sub", 0)) or None
        except JWTError:
            # Accept connection anyway in demo mode; real deployments can close here
            logger.warning("WS: invalid token for run_id=%s", run_id)

    await manager.connect(websocket, run_id)
    logger.info("WS session started: run_id=%s user_id=%s", run_id, user_id)

    try:
        while True:
            # Keep the connection alive; actual events are pushed by the service
            data = await websocket.receive_text()
            # Handle client-side ping / control messages
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        await manager.disconnect(websocket, run_id)
        logger.info("WS disconnected cleanly: run_id=%s", run_id)
    except Exception as exc:
        logger.error("WS error: run_id=%s error=%s", run_id, exc)
        await manager.disconnect(websocket, run_id)
