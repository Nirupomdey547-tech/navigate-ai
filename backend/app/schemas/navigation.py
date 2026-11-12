from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class NavigationStartRequest(BaseModel):
    environment_id: str
    instruction: str
    language: Optional[str] = "en"
    start_node: Optional[str] = None
    goal_node: Optional[str] = None
    config: Optional[Dict[str, Any]] = None


class CandidateAction(BaseModel):
    action_type: str
    target_node: str
    score: float
    components: Dict[str, Any] = {}
    explanation: str = ""


class UncertaintyReport(BaseModel):
    level: float
    reasons: List[str] = []
    recommendation: str = ""


class NavigationStepResponse(BaseModel):
    run_id: int
    step: int
    state: Dict[str, Any]
    candidates: List[CandidateAction]
    selected_action: Dict[str, Any]
    uncertainty: UncertaintyReport
    explanation: str
    is_done: bool
    success: bool
    metrics: Dict[str, Any]


class NavigationRunResponse(BaseModel):
    id: int
    status: str
    instruction: str
    language: str
    environment_id: str
    action_count: int
    success: Optional[int]
    metrics: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class InterventionRequest(BaseModel):
    run_id: int
    action_type: str
    target_node: str
