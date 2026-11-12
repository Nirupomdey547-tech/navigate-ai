"""
Models API Router for Navigate AI.
"""
from fastapi import APIRouter, Depends
from app.services.model_service import get_model_service, ModelService

router = APIRouter(prefix="/api/models", tags=["models"])


@router.get("")
def get_models(model_service: ModelService = Depends(get_model_service)):
    """Retrieve metadata and status of all integrated models and components."""
    return model_service.get_status()
