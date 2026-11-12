from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class ExperimentCreate(BaseModel):
    name: str
    config: Dict[str, Any] = {}
    environment_ids: List[str] = []
    instruction_ids: List[str] = []


class ExperimentResponse(BaseModel):
    id: int
    name: str
    config: Dict[str, Any]
    environment_ids: List[str]
    instruction_ids: List[str]
    status: str
    results: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class ExperimentResult(BaseModel):
    experiment_id: int
    success_rate: float
    avg_spl: float
    avg_ne: float
    total_runs: int
    by_language: Dict[str, Any] = {}
    by_environment: Dict[str, Any] = {}
    details: List[Dict[str, Any]] = []
