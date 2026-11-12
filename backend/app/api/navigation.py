"""
Navigation API Router for Navigate AI.
"""
from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.services.navigation_service import get_navigation_service, NavigationService
from app.schemas.navigation import NavigationStartRequest, InterventionRequest

router = APIRouter(prefix="/api/navigation", tags=["navigation"])


@router.post("/start")
async def start_navigation_run(
    payload: NavigationStartRequest,
    db: AsyncSession = Depends(get_db),
    nav_service: NavigationService = Depends(get_navigation_service),
):
    """Start an interactive navigation run."""
    try:
        res = await nav_service.start_navigation(
            environment_id=payload.environment_id,
            instruction=payload.instruction,
            language=payload.language,
            start_node=payload.start_node,
            goal_node=payload.goal_node,
            db=db,
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{run_id}/step")
async def step_navigation_run(
    run_id: str,
    db: AsyncSession = Depends(get_db),
    nav_service: NavigationService = Depends(get_navigation_service),
):
    """Execute a single agent decision step."""
    try:
        step_res = await nav_service.step_navigation(run_id=run_id, db=db)
        return step_res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{run_id}/pause")
async def pause_navigation_run(
    run_id: str,
    nav_service: NavigationService = Depends(get_navigation_service),
):
    """Pause an active navigation episode."""
    return await nav_service.pause_navigation(run_id)


@router.post("/{run_id}/resume")
async def resume_navigation_run(
    run_id: str,
    nav_service: NavigationService = Depends(get_navigation_service),
):
    """Resume a paused navigation episode."""
    return await nav_service.resume_navigation(run_id)


@router.post("/{run_id}/stop")
async def stop_navigation_run(
    run_id: str,
    db: AsyncSession = Depends(get_db),
    nav_service: NavigationService = Depends(get_navigation_service),
):
    """Stop navigation run immediately."""
    return await nav_service.stop_navigation(run_id, db=db)


@router.post("/{run_id}/reset")
async def reset_navigation_run(
    run_id: str,
    nav_service: NavigationService = Depends(get_navigation_service),
):
    """Reset agent back to starting position."""
    return await nav_service.reset_navigation(run_id)


@router.post("/{run_id}/intervene")
async def manual_intervention(
    run_id: str,
    payload: InterventionRequest,
    db: AsyncSession = Depends(get_db),
    nav_service: NavigationService = Depends(get_navigation_service),
):
    """Override agent decision with manual human movement intervention."""
    try:
        return await nav_service.manual_intervention(
            run_id=run_id,
            action_type=payload.action_type,
            target_node=payload.target_node,
            db=db,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
