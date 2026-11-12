"""
Action space definition for the navigation agent.

Defines ActionType enum, Action and ActionResult dataclasses, and
ActionValidator / ActionExecutor classes.
"""
from __future__ import annotations

import logging
import math
from dataclasses import dataclass, field
from enum import Enum
from typing import TYPE_CHECKING, Optional

logger = logging.getLogger(__name__)

if TYPE_CHECKING:
    from .environment import NavigationEnvironment
    from .state import AgentState


# ---------------------------------------------------------------------------
# Enum
# ---------------------------------------------------------------------------

class ActionType(str, Enum):
    MOVE_FORWARD = "move_forward"
    TURN_LEFT = "turn_left"
    TURN_RIGHT = "turn_right"
    TURN_AROUND = "turn_around"
    MOVE_TO_NODE = "move_to_node"
    STOP = "stop"
    WAIT = "wait"


# ---------------------------------------------------------------------------
# Dataclasses
# ---------------------------------------------------------------------------

@dataclass
class Action:
    type: ActionType
    target_node_id: Optional[str] = None
    direction_change: float = 0.0  # degrees, positive = clockwise
    description: str = ""

    def to_dict(self) -> dict:
        return {
            "type": self.type.value,
            "target_node_id": self.target_node_id,
            "direction_change": self.direction_change,
            "description": self.description,
        }


@dataclass
class ActionResult:
    success: bool
    new_node_id: str
    new_heading: float  # degrees [0, 360)
    message: str
    reward: float = 0.0  # shaped reward for RL use

    def to_dict(self) -> dict:
        return {
            "success": self.success,
            "new_node_id": self.new_node_id,
            "new_heading": self.new_heading,
            "message": self.message,
            "reward": self.reward,
        }


# ---------------------------------------------------------------------------
# Heading helpers
# ---------------------------------------------------------------------------

_DIRECTION_DEGREES: dict[str, float] = {
    "north": 0.0,
    "east": 90.0,
    "south": 180.0,
    "west": 270.0,
    "up": 0.0,
    "down": 180.0,
    "forward": 0.0,
}

_TURN_DEGREES = {
    ActionType.TURN_LEFT: -90.0,
    ActionType.TURN_RIGHT: 90.0,
    ActionType.TURN_AROUND: 180.0,
}


def _normalise_heading(heading: float) -> float:
    return heading % 360.0


def _heading_from_direction(direction: str, current_heading: float) -> float:
    deg = _DIRECTION_DEGREES.get(direction.lower())
    if deg is not None:
        return deg
    return current_heading


# ---------------------------------------------------------------------------
# Validator
# ---------------------------------------------------------------------------

class ActionValidator:
    """Checks whether an action is legal in the current state / environment."""

    @staticmethod
    def is_valid(
        action: Action,
        state: "AgentState",
        environment: "NavigationEnvironment",
    ) -> bool:
        if action.type in (ActionType.STOP, ActionType.WAIT):
            return True

        if action.type in (ActionType.TURN_LEFT, ActionType.TURN_RIGHT, ActionType.TURN_AROUND):
            return True  # Turns are always physically possible

        if action.type == ActionType.MOVE_TO_NODE:
            if action.target_node_id is None:
                return False
            # Must be a direct neighbour
            neighbours = {n.id for n in environment.get_neighbors(state.current_node_id)}
            return action.target_node_id in neighbours

        if action.type == ActionType.MOVE_FORWARD:
            # At least one outgoing edge required
            return bool(environment.get_neighbors(state.current_node_id))

        return False


# ---------------------------------------------------------------------------
# Executor
# ---------------------------------------------------------------------------

class ActionExecutor:
    """Executes a validated action and returns the resulting ActionResult."""

    @staticmethod
    def execute(
        action: Action,
        state: "AgentState",
        environment: "NavigationEnvironment",
    ) -> ActionResult:
        current_node = state.current_node_id
        heading = state.current_heading

        # --- Turn actions ---
        if action.type in _TURN_DEGREES:
            new_heading = _normalise_heading(heading + _TURN_DEGREES[action.type])
            return ActionResult(
                success=True,
                new_node_id=current_node,
                new_heading=new_heading,
                message=f"Turned: heading now {new_heading:.0f}°",
                reward=0.0,
            )

        # --- STOP ---
        if action.type == ActionType.STOP:
            reached_goal = current_node == state.goal_node_id
            reward = 10.0 if reached_goal else -1.0
            msg = "Navigation stopped. Goal reached!" if reached_goal else "Navigation stopped."
            return ActionResult(
                success=True,
                new_node_id=current_node,
                new_heading=heading,
                message=msg,
                reward=reward,
            )

        # --- WAIT ---
        if action.type == ActionType.WAIT:
            return ActionResult(
                success=True,
                new_node_id=current_node,
                new_heading=heading,
                message="Agent waiting.",
                reward=-0.1,
            )

        # --- MOVE_TO_NODE ---
        if action.type == ActionType.MOVE_TO_NODE:
            if action.target_node_id is None:
                return ActionResult(
                    success=False,
                    new_node_id=current_node,
                    new_heading=heading,
                    message="No target node specified.",
                    reward=-1.0,
                )
            edge = environment.get_edge(current_node, action.target_node_id)
            if edge is None:
                return ActionResult(
                    success=False,
                    new_node_id=current_node,
                    new_heading=heading,
                    message=f"No edge from {current_node} to {action.target_node_id}.",
                    reward=-1.0,
                )
            new_heading = _heading_from_direction(edge.direction, heading)
            reached_goal = action.target_node_id == state.goal_node_id
            reward = 1.0 + (5.0 if reached_goal else 0.0)
            return ActionResult(
                success=True,
                new_node_id=action.target_node_id,
                new_heading=new_heading,
                message=f"Moved to {action.target_node_id} ({edge.direction}). {'Goal reached!' if reached_goal else ''}",
                reward=reward,
            )

        # --- MOVE_FORWARD (take first available neighbour) ---
        if action.type == ActionType.MOVE_FORWARD:
            neighbours = environment.get_neighbors(current_node)
            if not neighbours:
                return ActionResult(
                    success=False,
                    new_node_id=current_node,
                    new_heading=heading,
                    message="Dead end – cannot move forward.",
                    reward=-1.0,
                )
            target = neighbours[0]
            edge = environment.get_edge(current_node, target.id)
            new_heading = _heading_from_direction(edge.direction if edge else "forward", heading)
            reached_goal = target.id == state.goal_node_id
            reward = 1.0 + (5.0 if reached_goal else 0.0)
            return ActionResult(
                success=True,
                new_node_id=target.id,
                new_heading=new_heading,
                message=f"Moved forward to {target.id}.",
                reward=reward,
            )

        return ActionResult(
            success=False,
            new_node_id=current_node,
            new_heading=heading,
            message=f"Unknown action type: {action.type}",
            reward=-1.0,
        )
