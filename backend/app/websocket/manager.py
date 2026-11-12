"""
WebSocket connection manager for Navigate AI.

Maintains per-run_id subscriber lists and broadcasts structured events
to every connected client watching that run.
"""
import asyncio
import logging
from collections import defaultdict
from typing import Any, Dict, List

from fastapi import WebSocket

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Event type constants
# ---------------------------------------------------------------------------
EVENT_NAVIGATION_STARTED = "navigation_started"
EVENT_OBSERVATION_UPDATED = "observation_updated"
EVENT_STATE_UPDATED = "state_updated"
EVENT_CANDIDATE_ACTIONS = "candidate_actions"
EVENT_ACTION_SELECTED = "action_selected"
EVENT_MOVEMENT_COMPLETED = "movement_completed"
EVENT_UNCERTAINTY_DETECTED = "uncertainty_detected"
EVENT_NAVIGATION_PAUSED = "navigation_paused"
EVENT_NAVIGATION_COMPLETED = "navigation_completed"
EVENT_NAVIGATION_FAILED = "navigation_failed"


class ConnectionManager:
    """Thread-safe (asyncio) manager for WebSocket connections grouped by run_id."""

    def __init__(self) -> None:
        # run_id -> list[WebSocket]
        self._connections: Dict[str, List[WebSocket]] = defaultdict(list)
        self._lock = asyncio.Lock()

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    async def connect(self, websocket: WebSocket, run_id: str) -> None:
        """Accept the WebSocket and register it under run_id."""
        await websocket.accept()
        async with self._lock:
            self._connections[run_id].append(websocket)
        logger.info("WS connected: run_id=%s total=%d", run_id, len(self._connections[run_id]))

    async def disconnect(self, websocket: WebSocket, run_id: str) -> None:
        """Remove the WebSocket from the run_id group."""
        async with self._lock:
            conns = self._connections.get(run_id, [])
            if websocket in conns:
                conns.remove(websocket)
            if not conns:
                self._connections.pop(run_id, None)
        logger.info("WS disconnected: run_id=%s", run_id)

    # ------------------------------------------------------------------
    # Broadcasting
    # ------------------------------------------------------------------

    async def send_event(
        self,
        run_id: str,
        event_type: str,
        data: Any,
    ) -> None:
        """Broadcast a JSON event to every connection subscribed to run_id."""
        message = {"event": event_type, "run_id": run_id, "data": data}
        dead: List[WebSocket] = []

        conns = list(self._connections.get(run_id, []))
        for ws in conns:
            try:
                await ws.send_json(message)
            except Exception as exc:  # noqa: BLE001
                logger.warning("WS send failed (%s): %s", run_id, exc)
                dead.append(ws)

        # Clean up stale connections
        if dead:
            async with self._lock:
                for ws in dead:
                    try:
                        self._connections[run_id].remove(ws)
                    except ValueError:
                        pass

    # ------------------------------------------------------------------
    # Convenience helpers
    # ------------------------------------------------------------------

    def active_run_ids(self) -> List[str]:
        return list(self._connections.keys())

    def connection_count(self, run_id: str) -> int:
        return len(self._connections.get(run_id, []))


# Process-level singleton
manager = ConnectionManager()
