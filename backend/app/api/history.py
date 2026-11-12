"""
History and Run Inspector API Router for Navigate AI.
"""
from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.models.navigation import NavigationRun

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("")
async def list_history(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """List historical navigation episodes."""
    result = await db.execute(
        select(NavigationRun).order_by(NavigationRun.created_at.desc()).limit(limit)
    )
    runs = result.scalars().all()
    return [
        {
            "id": r.id,
            "environment_id": r.environment_id,
            "instruction": r.instruction,
            "language": r.language,
            "status": r.status,
            "success": r.success,
            "start_node": r.start_node,
            "goal_node": r.goal_node,
            "steps": len(r.final_path or []) - 1 if r.final_path else 0,
            "metrics": r.metrics,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in runs
    ]


@router.get("/{run_id}")
async def get_run_details(run_id: int, db: AsyncSession = Depends(get_db)):
    """Retrieve full trace of an individual navigation episode."""
    result = await db.execute(select(NavigationRun).where(NavigationRun.id == run_id))
    r = result.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Run not found")

    return {
        "id": r.id,
        "environment_id": r.environment_id,
        "instruction": r.instruction,
        "language": r.language,
        "parsed_instruction": r.parsed_instruction,
        "start_node": r.start_node,
        "goal_node": r.goal_node,
        "status": r.status,
        "success": r.success,
        "final_path": r.final_path,
        "state_history": r.state_history,
        "metrics": r.metrics,
        "execution_time": r.execution_time,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    }


@router.get("/{run_id}/replay")
async def get_run_replay(run_id: int, db: AsyncSession = Depends(get_db)):
    """Retrieve step-by-step playback data for the run inspector timeline."""
    result = await db.execute(select(NavigationRun).where(NavigationRun.id == run_id))
    r = result.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Run not found")

    steps = []
    state_hist = r.state_history or []
    for idx, s in enumerate(state_hist):
        steps.append({
            "step_index": idx,
            "node_id": s.get("current_node_id"),
            "heading": s.get("current_heading", 0.0),
            "visited_nodes": s.get("visited_nodes", []),
            "confidence": s.get("confidence", 1.0),
            "uncertainty": s.get("uncertainty", 0.0),
            "current_objective": s.get("current_objective"),
            "timestamp": s.get("timestamp"),
        })

    return {
        "run_id": r.id,
        "environment_id": r.environment_id,
        "instruction": r.instruction,
        "language": r.language,
        "final_path": r.final_path,
        "success": bool(r.success),
        "metrics": r.metrics,
        "steps": steps,
    }
