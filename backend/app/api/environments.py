"""
Environment API Router for Navigate AI.
"""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.environments.service import get_environment_service, EnvironmentService

router = APIRouter(prefix="/api/environments", tags=["environments"])


class CustomEnvironmentRequest(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = ""
    start_node_id: Optional[str] = None
    goal_node_ids: Optional[List[str]] = []
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]


@router.get("")
def list_environments(service: EnvironmentService = Depends(get_environment_service)):
    """List all available indoor navigation environments."""
    return service.get_all_environments()


@router.get("/{env_id}")
def get_environment(env_id: str, service: EnvironmentService = Depends(get_environment_service)):
    """Retrieve detailed topology, nodes, and edges for an environment."""
    env = service.get_environment(env_id)
    if not env:
        raise HTTPException(status_code=404, detail=f"Environment '{env_id}' not found")
    return env


@router.get("/{env_id}/instructions")
def get_environment_instructions(
    env_id: str,
    language: Optional[str] = None,
    service: EnvironmentService = Depends(get_environment_service),
):
    """Retrieve sample navigation instructions for a specific environment."""
    return service.get_instructions(env_id=env_id, language=language)


@router.post("", status_code=201)
def create_environment(
    payload: CustomEnvironmentRequest,
    service: EnvironmentService = Depends(get_environment_service),
):
    """Create a new custom navigation environment graph."""
    created = service.add_custom_environment(payload.model_dump())
    return created


@router.delete("/{env_id}")
def delete_environment(
    env_id: str,
    service: EnvironmentService = Depends(get_environment_service),
):
    """Delete a custom environment."""
    if not service.delete_environment(env_id):
        raise HTTPException(status_code=404, detail="Environment not found")
    return {"message": "Environment deleted successfully"}
