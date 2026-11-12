from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class NodeResponse(BaseModel):
    id: str
    label: str
    x: Optional[float] = None
    y: Optional[float] = None
    z: Optional[float] = None
    metadata: Dict[str, Any] = {}


class EdgeResponse(BaseModel):
    source: str
    target: str
    weight: Optional[float] = 1.0
    metadata: Dict[str, Any] = {}


class EnvironmentResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    graph_data: Dict[str, Any] = {}
    thumbnail_url: Optional[str] = None
    node_count: int = 0
    edge_count: int = 0

    class Config:
        from_attributes = True


class EnvironmentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    graph_data: Dict[str, Any] = {}
    thumbnail_url: Optional[str] = None
