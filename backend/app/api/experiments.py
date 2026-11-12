"""
Experiments API Router for Navigate AI.
"""
from typing import Any, Dict, List, Optional
import time
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.models.experiment import Experiment
from app.environments.service import get_environment_service, EnvironmentService
from app.services.navigation_service import get_navigation_service, NavigationService

router = APIRouter(prefix="/api/experiments", tags=["experiments"])


class CreateExperimentRequest(BaseModel):
    name: str
    environment_ids: List[str]
    languages: Optional[List[str]] = ["en", "hi"]
    confidence_threshold: Optional[float] = 0.65
    max_steps: Optional[int] = 20
    model_config: Optional[Dict[str, Any]] = {}


@router.get("")
async def list_experiments(db: AsyncSession = Depends(get_db)):
    """List all saved research experiments."""
    result = await db.execute(select(Experiment).order_by(Experiment.created_at.desc()))
    experiments = result.scalars().all()
    return [
        {
            "id": exp.id,
            "name": exp.name,
            "environment_ids": exp.environment_ids,
            "status": exp.status,
            "results": exp.results,
            "created_at": exp.created_at.isoformat() if exp.created_at else None,
        }
        for exp in experiments
    ]


@router.post("", status_code=201)
async def create_experiment(
    payload: CreateExperimentRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create a new research experiment."""
    exp = Experiment(
        name=payload.name,
        environment_ids=payload.environment_ids,
        instruction_ids=payload.languages,
        config={
            "confidence_threshold": payload.confidence_threshold,
            "max_steps": payload.max_steps,
            "model_config": payload.model_config,
        },
        status="pending",
        results={},
    )
    db.add(exp)
    await db.commit()
    await db.refresh(exp)
    return {
        "id": exp.id,
        "name": exp.name,
        "environment_ids": exp.environment_ids,
        "status": exp.status,
        "config": exp.config,
    }


@router.get("/{exp_id}")
async def get_experiment(exp_id: int, db: AsyncSession = Depends(get_db)):
    """Retrieve details and outcomes of an experiment."""
    result = await db.execute(select(Experiment).where(Experiment.id == exp_id))
    exp = result.scalar_one_or_none()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return {
        "id": exp.id,
        "name": exp.name,
        "environment_ids": exp.environment_ids,
        "status": exp.status,
        "config": exp.config,
        "results": exp.results,
        "created_at": exp.created_at.isoformat() if exp.created_at else None,
    }


@router.post("/{exp_id}/run")
async def run_experiment(
    exp_id: int,
    db: AsyncSession = Depends(get_db),
    env_service: EnvironmentService = Depends(get_environment_service),
    nav_service: NavigationService = Depends(get_navigation_service),
):
    """
    Execute batch episodes for this experiment across selected environments and instructions.
    Calculates RxR benchmark metrics: SR, SPL, NE, nDTW, SDTW.
    """
    result = await db.execute(select(Experiment).where(Experiment.id == exp_id))
    exp = result.scalar_one_or_none()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    exp.status = "running"
    await db.commit()

    environments = exp.environment_ids or ["office_floor", "residential_apartment"]
    languages = exp.instruction_ids or ["en", "hi"]

    # Gather matching instructions
    all_instructions = []
    for env_id in environments:
        for lang in languages:
            insts = env_service.get_instructions(env_id=env_id, language=lang)
            all_instructions.extend(insts)

    if not all_instructions:
        # Fallback to any instructions
        all_instructions = env_service.get_instructions()[:6]

    episode_results = []
    for inst_data in all_instructions[:10]:  # Run up to 10 representative benchmark episodes
        start_payload = await nav_service.start_navigation(
            environment_id=inst_data["environment_id"],
            instruction=inst_data["instruction"],
            language=inst_data.get("language", "en"),
            db=db,
        )
        run_id = start_payload["run_id"]

        # Step agent automatically until done
        step_res = {}
        for _ in range(15):
            step_res = await nav_service.step_navigation(run_id=run_id, db=db)
            if step_res.get("is_done"):
                break

        episode_results.append({
            "instruction_id": inst_data.get("id"),
            "environment_id": inst_data.get("environment_id"),
            "language": inst_data.get("language", "en"),
            "success": step_res.get("success", False),
            "metrics": step_res.get("metrics", {}),
        })

    # Compute aggregates
    total_episodes = len(episode_results)
    successes = sum(1 for ep in episode_results if ep["success"])
    sr = successes / total_episodes if total_episodes else 0.0
    avg_spl = sum(ep["metrics"].get("spl", 0.0) for ep in episode_results) / total_episodes if total_episodes else 0.0
    avg_ne = sum(ep["metrics"].get("navigation_error", 0.0) for ep in episode_results) / total_episodes if total_episodes else 0.0
    avg_ndtw = sum(ep["metrics"].get("ndtw", 0.0) for ep in episode_results) / total_episodes if total_episodes else 0.0
    avg_sdtw = sum(ep["metrics"].get("sdtw", 0.0) for ep in episode_results) / total_episodes if total_episodes else 0.0

    # Aggregate by language
    lang_stats: Dict[str, Dict[str, Any]] = {}
    for ep in episode_results:
        lang = ep["language"]
        if lang not in lang_stats:
            lang_stats[lang] = {"total": 0, "success": 0, "spl_sum": 0.0}
        lang_stats[lang]["total"] += 1
        if ep["success"]:
            lang_stats[lang]["success"] += 1
        lang_stats[lang]["spl_sum"] += ep["metrics"].get("spl", 0.0)

    for l_key, l_val in lang_stats.items():
        cnt = l_val["total"]
        l_val["success_rate"] = round(l_val["success"] / cnt, 4) if cnt else 0.0
        l_val["avg_spl"] = round(l_val["spl_sum"] / cnt, 4) if cnt else 0.0

    final_results = {
        "total_episodes": total_episodes,
        "success_rate": round(sr, 4),
        "spl": round(avg_spl, 4),
        "navigation_error": round(avg_ne, 2),
        "ndtw": round(avg_ndtw, 4),
        "sdtw": round(avg_sdtw, 4),
        "episodes": episode_results,
        "by_language": lang_stats,
    }

    exp.status = "completed"
    exp.results = final_results
    await db.commit()

    return {
        "id": exp.id,
        "status": "completed",
        "results": final_results,
    }
