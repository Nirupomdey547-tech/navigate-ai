"""
Analytics API Router for Navigate AI.
"""
from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.models.navigation import NavigationRun

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/overview")
async def get_analytics_overview(db: AsyncSession = Depends(get_db)):
    """Aggregate high-level research metrics across all completed runs."""
    result = await db.execute(select(NavigationRun))
    runs = result.scalars().all()

    total_runs = len(runs)
    completed_runs = [r for r in runs if r.status in ("completed", "failed")]
    successful_runs = [r for r in completed_runs if r.success == 1]

    sr = len(successful_runs) / len(completed_runs) if completed_runs else 0.0
    avg_spl = sum(r.metrics.get("spl", 0.0) for r in completed_runs if r.metrics) / len(completed_runs) if completed_runs else 0.0
    avg_ne = sum(r.metrics.get("navigation_error", 0.0) for r in completed_runs if r.metrics) / len(completed_runs) if completed_runs else 0.0

    return {
        "total_runs": total_runs,
        "completed_runs": len(completed_runs),
        "successful_runs": len(successful_runs),
        "success_rate": round(sr, 4),
        "average_spl": round(avg_spl, 4),
        "average_navigation_error": round(avg_ne, 2),
        "model_status": "Operational",
        "benchmark_reference": "Google Research RxR",
    }


@router.get("/languages")
async def get_language_analytics(db: AsyncSession = Depends(get_db)):
    """Performance breakdown by instruction language."""
    result = await db.execute(select(NavigationRun))
    runs = result.scalars().all()

    stats: Dict[str, Dict[str, Any]] = {}
    for r in runs:
        lang = r.language or "en"
        if lang not in stats:
            stats[lang] = {"language": lang, "total": 0, "success": 0, "spl_sum": 0.0, "ne_sum": 0.0}
        stats[lang]["total"] += 1
        if r.success == 1:
            stats[lang]["success"] += 1
        if r.metrics:
            stats[lang]["spl_sum"] += r.metrics.get("spl", 0.0)
            stats[lang]["ne_sum"] += r.metrics.get("navigation_error", 0.0)

    rows = []
    for l_code, data in stats.items():
        total = data["total"]
        rows.append({
            "language": l_code,
            "total_runs": total,
            "success_rate": round(data["success"] / total, 4) if total else 0.0,
            "spl": round(data["spl_sum"] / total, 4) if total else 0.0,
            "navigation_error": round(data["ne_sum"] / total, 2) if total else 0.0,
        })
    return rows


@router.get("/environments")
async def get_environment_analytics(db: AsyncSession = Depends(get_db)):
    """Performance breakdown by navigation environment."""
    result = await db.execute(select(NavigationRun))
    runs = result.scalars().all()

    stats: Dict[str, Dict[str, Any]] = {}
    for r in runs:
        env_id = r.environment_id or "unknown"
        if env_id not in stats:
            stats[env_id] = {"environment_id": env_id, "total": 0, "success": 0, "spl_sum": 0.0}
        stats[env_id]["total"] += 1
        if r.success == 1:
            stats[env_id]["success"] += 1
        if r.metrics:
            stats[env_id]["spl_sum"] += r.metrics.get("spl", 0.0)

    rows = []
    for env_id, data in stats.items():
        total = data["total"]
        rows.append({
            "environment_id": env_id,
            "total_runs": total,
            "success_rate": round(data["success"] / total, 4) if total else 0.0,
            "spl": round(data["spl_sum"] / total, 4) if total else 0.0,
        })
    return rows


@router.get("/metrics")
async def get_metrics_distribution(db: AsyncSession = Depends(get_db)):
    """Returns distribution of SPL, Navigation Error, and steps taken."""
    result = await db.execute(select(NavigationRun).order_by(NavigationRun.id.desc()).limit(50))
    runs = result.scalars().all()

    records = []
    for r in runs:
        if r.metrics:
            records.append({
                "run_id": r.id,
                "environment": r.environment_id,
                "language": r.language,
                "success": bool(r.success),
                "spl": r.metrics.get("spl", 0.0),
                "navigation_error": r.metrics.get("navigation_error", 0.0),
                "steps": r.metrics.get("steps", 0),
                "ndtw": r.metrics.get("ndtw", 0.0),
            })
    return records
