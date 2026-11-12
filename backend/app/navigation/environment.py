"""
Environment graph representation using NetworkX.

Provides EnvironmentNode, EnvironmentEdge, and NavigationEnvironment
for representing indoor navigation spaces as directed graphs.
"""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

try:
    import networkx as nx
    _NX_AVAILABLE = True
except ImportError:
    logger.error("networkx is required: pip install networkx")
    _NX_AVAILABLE = False

from .actions import Action, ActionType  # noqa: E402  (circular-safe)


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

@dataclass
class EnvironmentNode:
    """A node in the navigation graph (a room, junction, or landmark)."""
    id: str
    position: Tuple[float, float, float]  # (x, y, z) in metres
    room_type: str
    landmarks: List[str] = field(default_factory=list)
    description: str = ""
    visual_embedding: Optional[List[float]] = None
    destination_relevance: float = 0.0  # 0-1, how likely this is a goal node

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "position": list(self.position),
            "room_type": self.room_type,
            "landmarks": self.landmarks,
            "description": self.description,
            "visual_embedding": self.visual_embedding,
            "destination_relevance": self.destination_relevance,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "EnvironmentNode":
        return cls(
            id=data["id"],
            position=tuple(data["position"]),  # type: ignore[arg-type]
            room_type=data["room_type"],
            landmarks=data.get("landmarks", []),
            description=data.get("description", ""),
            visual_embedding=data.get("visual_embedding"),
            destination_relevance=data.get("destination_relevance", 0.0),
        )


@dataclass
class EnvironmentEdge:
    """A directed edge between two nodes in the navigation graph."""
    source: str
    target: str
    cost: float = 1.0
    direction: str = "forward"  # north/south/east/west/up/down/forward
    distance: float = 1.0  # metres
    action: str = "move_forward"
    accessibility: bool = True  # False = blocked / inaccessible

    def to_dict(self) -> Dict[str, Any]:
        return {
            "source": self.source,
            "target": self.target,
            "cost": self.cost,
            "direction": self.direction,
            "distance": self.distance,
            "action": self.action,
            "accessibility": self.accessibility,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "EnvironmentEdge":
        return cls(
            source=data["source"],
            target=data["target"],
            cost=data.get("cost", 1.0),
            direction=data.get("direction", "forward"),
            distance=data.get("distance", 1.0),
            action=data.get("action", "move_forward"),
            accessibility=data.get("accessibility", True),
        )


# ---------------------------------------------------------------------------
# Navigation Environment
# ---------------------------------------------------------------------------

class NavigationEnvironment:
    """
    Directed graph environment for indoor navigation.

    Wraps a ``networkx.DiGraph`` and provides higher-level helpers used by
    the navigation policy and planner.
    """

    def __init__(self, name: str = "unnamed", description: str = "") -> None:
        if not _NX_AVAILABLE:
            raise RuntimeError("networkx must be installed to use NavigationEnvironment.")
        self.name = name
        self.description = description
        self.graph: nx.DiGraph = nx.DiGraph()
        self._nodes: Dict[str, EnvironmentNode] = {}
        self._edges: Dict[Tuple[str, str], EnvironmentEdge] = {}

    # ------------------------------------------------------------------
    # Node / edge management
    # ------------------------------------------------------------------

    def add_node(self, node: EnvironmentNode) -> None:
        self._nodes[node.id] = node
        self.graph.add_node(
            node.id,
            position=node.position,
            room_type=node.room_type,
            landmarks=node.landmarks,
            description=node.description,
        )

    def add_edge(self, edge: EnvironmentEdge) -> None:
        if not edge.accessibility:
            return  # do not add inaccessible edges to graph
        self._edges[(edge.source, edge.target)] = edge
        self.graph.add_edge(
            edge.source,
            edge.target,
            weight=edge.cost,
            direction=edge.direction,
            distance=edge.distance,
            action=edge.action,
        )

    def get_node(self, node_id: str) -> Optional[EnvironmentNode]:
        return self._nodes.get(node_id)

    def get_neighbors(self, node_id: str) -> List[EnvironmentNode]:
        return [
            self._nodes[n]
            for n in self.graph.successors(node_id)
            if n in self._nodes
        ]

    def get_edge(self, source: str, target: str) -> Optional[EnvironmentEdge]:
        return self._edges.get((source, target))

    def get_all_nodes(self) -> List[EnvironmentNode]:
        return list(self._nodes.values())

    def get_all_edges(self) -> List[EnvironmentEdge]:
        return list(self._edges.values())

    # ------------------------------------------------------------------
    # Path planning helpers
    # ------------------------------------------------------------------

    def shortest_path(self, source: str, target: str) -> List[str]:
        """Return shortest path as list of node IDs; empty list if unreachable."""
        try:
            return nx.dijkstra_path(self.graph, source, target, weight="weight")
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return []

    def shortest_path_length(self, source: str, target: str) -> float:
        """Return total cost of shortest path; inf if unreachable."""
        try:
            return nx.dijkstra_path_length(self.graph, source, target, weight="weight")
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return float("inf")

    # ------------------------------------------------------------------
    # Action helpers
    # ------------------------------------------------------------------

    def get_valid_actions(self, node_id: str) -> List[Action]:
        """Return the list of actions available from *node_id*."""
        actions: List[Action] = []
        for neighbor_id in self.graph.successors(node_id):
            edge = self.get_edge(node_id, neighbor_id)
            if edge is None:
                continue
            actions.append(
                Action(
                    type=ActionType.MOVE_TO_NODE,
                    target_node_id=neighbor_id,
                    direction_change=0.0,
                    description=f"Move to {neighbor_id} ({edge.direction})",
                )
            )
        # Always allow STOP and WAIT
        actions.append(Action(type=ActionType.STOP, description="Stop navigation"))
        actions.append(Action(type=ActionType.WAIT, description="Wait in place"))
        return actions

    def landmark_nodes(self, landmark_name: str) -> List[str]:
        """Return IDs of nodes where *landmark_name* is visible."""
        normalised = landmark_name.lower().replace(" ", "_")
        return [
            nid
            for nid, node in self._nodes.items()
            if any(normalised in lm.lower() for lm in node.landmarks)
        ]

    # ------------------------------------------------------------------
    # Serialisation
    # ------------------------------------------------------------------

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "nodes": [n.to_dict() for n in self._nodes.values()],
            "edges": [e.to_dict() for e in self._edges.values()],
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "NavigationEnvironment":
        env = cls(name=data.get("name", ""), description=data.get("description", ""))
        for nd in data.get("nodes", []):
            env.add_node(EnvironmentNode.from_dict(nd))
        for ed in data.get("edges", []):
            env.add_edge(EnvironmentEdge.from_dict(ed))
        return env

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent)

    @classmethod
    def from_json(cls, json_str: str) -> "NavigationEnvironment":
        return cls.from_dict(json.loads(json_str))
