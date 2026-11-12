"""
Agent state management for the navigation agent.

Provides AgentState, StateManager, and NavigationHistory.
"""
from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set

from .actions import Action, ActionResult


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

@dataclass
class AgentState:
    """Complete snapshot of the agent's navigation state."""
    # Positional
    current_node_id: str
    previous_node_id: Optional[str] = None
    current_heading: float = 0.0  # degrees, 0 = North

    # Progress tracking
    visited_nodes: Set[str] = field(default_factory=set)
    remaining_waypoints: List[str] = field(default_factory=list)
    current_objective: str = ""

    # Actions
    previous_action: Optional[Action] = None
    current_observation: Optional[Dict[str, Any]] = None

    # History
    navigation_history: List[Dict[str, Any]] = field(default_factory=list)

    # Metrics
    distance_to_goal: float = float("inf")
    instruction_completion_status: float = 0.0  # 0-1
    confidence: float = 1.0  # 0-1
    uncertainty: float = 0.0  # 0-1
    steps_taken: int = 0

    # Session
    start_node_id: str = ""
    goal_node_id: str = ""
    run_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: float = field(default_factory=time.time)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "current_node_id": self.current_node_id,
            "previous_node_id": self.previous_node_id,
            "current_heading": self.current_heading,
            "visited_nodes": list(self.visited_nodes),
            "remaining_waypoints": self.remaining_waypoints,
            "current_objective": self.current_objective,
            "previous_action": self.previous_action.to_dict() if self.previous_action else None,
            "current_observation": self.current_observation,
            "distance_to_goal": self.distance_to_goal,
            "instruction_completion_status": self.instruction_completion_status,
            "confidence": self.confidence,
            "uncertainty": self.uncertainty,
            "steps_taken": self.steps_taken,
            "start_node_id": self.start_node_id,
            "goal_node_id": self.goal_node_id,
            "run_id": self.run_id,
            "timestamp": self.timestamp,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AgentState":
        state = cls(
            current_node_id=data["current_node_id"],
            previous_node_id=data.get("previous_node_id"),
            current_heading=data.get("current_heading", 0.0),
        )
        state.visited_nodes = set(data.get("visited_nodes", []))
        state.remaining_waypoints = data.get("remaining_waypoints", [])
        state.current_objective = data.get("current_objective", "")
        state.distance_to_goal = data.get("distance_to_goal", float("inf"))
        state.instruction_completion_status = data.get("instruction_completion_status", 0.0)
        state.confidence = data.get("confidence", 1.0)
        state.uncertainty = data.get("uncertainty", 0.0)
        state.steps_taken = data.get("steps_taken", 0)
        state.start_node_id = data.get("start_node_id", "")
        state.goal_node_id = data.get("goal_node_id", "")
        state.run_id = data.get("run_id", str(uuid.uuid4()))
        state.timestamp = data.get("timestamp", time.time())
        return state


# ---------------------------------------------------------------------------
# Navigation History
# ---------------------------------------------------------------------------

@dataclass
class HistoryEntry:
    step: int
    state_snapshot: Dict[str, Any]
    action: Optional[Dict[str, Any]]
    scores: Dict[str, float]
    timestamp: float = field(default_factory=time.time)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "step": self.step,
            "state_snapshot": self.state_snapshot,
            "action": self.action,
            "scores": self.scores,
            "timestamp": self.timestamp,
        }


class NavigationHistory:
    """Ordered log of navigation steps."""

    def __init__(self) -> None:
        self._entries: List[HistoryEntry] = []

    def record(
        self,
        state: AgentState,
        action: Optional[Action],
        scores: Optional[Dict[str, float]] = None,
    ) -> None:
        entry = HistoryEntry(
            step=state.steps_taken,
            state_snapshot=state.to_dict(),
            action=action.to_dict() if action else None,
            scores=scores or {},
        )
        self._entries.append(entry)

    def __len__(self) -> int:
        return len(self._entries)

    def to_list(self) -> List[Dict[str, Any]]:
        return [e.to_dict() for e in self._entries]

    def get_visited_nodes(self) -> List[str]:
        return [e.state_snapshot["current_node_id"] for e in self._entries]

    def has_loop(self, window: int = 6) -> bool:
        """Return True if the agent has been cycling through the same nodes."""
        visited = self.get_visited_nodes()
        if len(visited) < window:
            return False
        recent = visited[-window:]
        return len(set(recent)) < window // 2


# ---------------------------------------------------------------------------
# State Manager
# ---------------------------------------------------------------------------

class StateManager:
    """
    Manages a mutable AgentState, applying action results and tracking
    waypoint completion.
    """

    def __init__(self, initial_state: AgentState) -> None:
        self.state = initial_state
        self.history = NavigationHistory()
        # Mark start node as visited
        self.state.visited_nodes.add(initial_state.current_node_id)

    def update(
        self,
        action: Action,
        result: ActionResult,
        scores: Optional[Dict[str, float]] = None,
        uncertainty: float = 0.0,
        distance_to_goal: float = float("inf"),
    ) -> AgentState:
        """
        Apply an action result to the state and return the updated state.
        """
        # Record before mutation
        self.history.record(self.state, action, scores)

        # Mutate state
        self.state.previous_node_id = self.state.current_node_id
        self.state.previous_action = action
        self.state.current_node_id = result.new_node_id
        self.state.current_heading = result.new_heading
        self.state.steps_taken += 1
        self.state.uncertainty = uncertainty
        self.state.distance_to_goal = distance_to_goal
        self.state.timestamp = time.time()

        if result.success:
            self.state.visited_nodes.add(result.new_node_id)
            # Tick off waypoints
            if (
                self.state.remaining_waypoints
                and result.new_node_id == self.state.remaining_waypoints[0]
            ):
                self.state.remaining_waypoints.pop(0)

            # Instruction completion
            if self.state.goal_node_id:
                wp_total = len(self.state.navigation_history) or 1
                wp_done = self.state.steps_taken
                self.state.instruction_completion_status = min(
                    wp_done / max(wp_total, 1), 1.0
                )

        return self.state

    def to_dict(self) -> Dict[str, Any]:
        return {
            "state": self.state.to_dict(),
            "history": self.history.to_list(),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "StateManager":
        state = AgentState.from_dict(data["state"])
        manager = cls(state)
        # History is reconstructed read-only here
        return manager
