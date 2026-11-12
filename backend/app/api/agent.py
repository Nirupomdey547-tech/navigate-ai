"""
Agent API Router for Navigate AI.
"""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.language.instruction_parser import InstructionParser
from app.services.model_service import get_model_service, ModelService
from app.environments.service import get_environment_service, EnvironmentService
from app.perception.visual_encoder import VisualPerceptionEncoder

router = APIRouter(prefix="/api/agent", tags=["agent"])
parser = InstructionParser()
vision_encoder = VisualPerceptionEncoder()


class ParseInstructionRequest(BaseModel):
    instruction: str
    language: Optional[str] = None


class ObserveRequest(BaseModel):
    environment_id: str
    node_id: str
    heading: Optional[float] = 0.0


@router.post("/parse-instruction")
def parse_instruction(payload: ParseInstructionRequest):
    """
    Parse a natural-language navigation instruction into structured representation:
    landmarks, directional constraints, sequential constraints, destination, waypoints.
    """
    parsed_obj = parser.parse(payload.instruction, lang=payload.language)
    parsed = parsed_obj.to_dict() if hasattr(parsed_obj, "to_dict") else parsed_obj
    return {
        "raw_instruction": payload.instruction,
        "language": parsed.get("language"),
        "initial_direction": parsed.get("initial_direction"),
        "landmarks": parsed.get("landmarks"),
        "spatial_constraints": parsed.get("spatial_constraints"),
        "destination": parsed.get("destination"),
        "ordered_waypoints": parsed.get("ordered_waypoints"),
        "embedding_preview": parsed.get("embedding", [])[:8],
    }



@router.post("/observe")
def observe_viewpoint(
    payload: ObserveRequest,
    env_service: EnvironmentService = Depends(get_environment_service),
):
    """
    Retrieve sensory observation and visual features at a specific environment node.
    """
    env = env_service.get_environment(payload.environment_id)
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")

    node_data = next((n for n in env.get("nodes", []) if n["id"] == payload.node_id), None)
    if not node_data:
        raise HTTPException(status_code=404, detail="Node not found in environment")

    obs = vision_encoder.generate_node_observation(
        node_id=payload.node_id,
        heading=payload.heading or 0.0,
        node_data=node_data,
    )
    return obs.to_dict()


@router.get("/status")
def get_agent_status(model_service: ModelService = Depends(get_model_service)):
    """Retrieve operational status of all agent modules."""
    return model_service.get_status()
