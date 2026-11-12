"""
Instruction-Conditioned Decision Policy & Uncertainty Estimator for Navigate AI.

Implements hybrid decision-making:
1. Instruction alignment (directional and sequential)
2. Visual-semantic landmark alignment
3. Graph-based shortest path progress (A* / Dijkstra)
4. History cycle penalties
5. Calibrated uncertainty estimation
6. Grounded decision explanations
"""
from __future__ import annotations

import logging
import math
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

from app.navigation.actions import Action, ActionType
from app.navigation.environment import NavigationEnvironment, EnvironmentNode
from app.navigation.state import AgentState
from app.perception.visual_encoder import VisualPerceptionEncoder, ViewpointObservation

logger = logging.getLogger(__name__)


@dataclass
class ActionCandidateScore:
    action: Action
    total_score: float
    instruction_score: float
    landmark_score: float
    progress_score: float
    cost_penalty: float
    history_penalty: float
    explanation_component: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "action": self.action.to_dict(),
            "total_score": round(self.total_score, 4),
            "instruction_score": round(self.instruction_score, 4),
            "landmark_score": round(self.landmark_score, 4),
            "progress_score": round(self.progress_score, 4),
            "cost_penalty": round(self.cost_penalty, 4),
            "history_penalty": round(self.history_penalty, 4),
            "explanation": self.explanation_component,
        }


@dataclass
class PolicyDecision:
    selected_action: Action
    confidence: float
    uncertainty_level: str  # low | medium | high
    uncertainty_source: str
    suggested_recovery: str
    grounded_explanation: str
    candidate_scores: List[ActionCandidateScore]
    current_target_waypoint: Optional[str] = None
    goal_reached: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return {
            "selected_action": self.selected_action.to_dict(),
            "confidence": round(self.confidence, 4),
            "uncertainty_level": self.uncertainty_level,
            "uncertainty_source": self.uncertainty_source,
            "suggested_recovery": self.suggested_recovery,
            "grounded_explanation": self.grounded_explanation,
            "candidate_scores": [c.to_dict() for c in self.candidate_scores],
            "current_target_waypoint": self.current_target_waypoint,
            "goal_reached": self.goal_reached,
        }


class NavigationPolicy:
    """
    Multimodal Instruction-Conditioned Navigation Policy with Uncertainty Estimation.
    """

    def __init__(
        self,
        weight_instruction: float = 0.35,
        weight_landmark: float = 0.35,
        weight_progress: float = 0.30,
        cost_weight: float = 0.10,
        history_penalty_weight: float = 0.40,
        confidence_threshold: float = 0.65,
    ) -> None:
        self.w_inst = weight_instruction
        self.w_lm = weight_landmark
        self.w_prog = weight_progress
        self.w_cost = cost_weight
        self.w_hist = history_penalty_weight
        self.confidence_threshold = confidence_threshold
        self.vision_encoder = VisualPerceptionEncoder()

    def evaluate_step(
        self,
        state: AgentState,
        environment: NavigationEnvironment,
        parsed_instruction: Dict[str, Any],
        destination_node_id: str,
    ) -> PolicyDecision:
        """
        Evaluate all candidate actions and select the optimal decision.
        """
        current_node_id = state.current_node_id
        valid_actions = environment.get_valid_actions(current_node_id)
        current_node = environment.get_node(current_node_id)

        # Determine target waypoint / destination
        remaining_waypoints = list(state.remaining_waypoints)
        target_goal = remaining_waypoints[0] if remaining_waypoints else destination_node_id

        # Check if already at ultimate destination
        if current_node_id == destination_node_id:
            stop_action = Action(type=ActionType.STOP, description="Reached specified destination")
            return PolicyDecision(
                selected_action=stop_action,
                confidence=1.0,
                uncertainty_level="low",
                uncertainty_source="None (Task goal reached)",
                suggested_recovery="complete_navigation",
                grounded_explanation=f"Agent has reached final destination '{current_node_id}'. Executing STOP.",
                candidate_scores=[],
                current_target_waypoint=destination_node_id,
                goal_reached=True,
            )

        # Extract parsed direction and landmarks
        landmarks = parsed_instruction.get("landmarks", [])
        initial_direction = parsed_instruction.get("initial_direction", "forward")

        # Visual observation at current node
        node_data = current_node.to_dict() if current_node else {"id": current_node_id, "landmarks": []}
        curr_obs = self.vision_encoder.generate_node_observation(current_node_id, state.current_heading, node_data)
        state.current_observation = curr_obs.to_dict()

        # Score every valid action
        candidate_scores: List[ActionCandidateScore] = []
        for action in valid_actions:
            score_item = self._score_action(
                action=action,
                current_node_id=current_node_id,
                target_goal=target_goal,
                destination_id=destination_node_id,
                state=state,
                environment=environment,
                parsed_instruction=parsed_instruction,
            )
            candidate_scores.append(score_item)

        # Sort candidate scores descending
        candidate_scores.sort(key=lambda x: x.total_score, reverse=True)

        if not candidate_scores:
            # Fallback stop
            return PolicyDecision(
                selected_action=Action(type=ActionType.STOP, description="No valid actions available"),
                confidence=0.0,
                uncertainty_level="high",
                uncertainty_source="No valid reachable edges from current node",
                suggested_recovery="replan",
                grounded_explanation="Graph dead-end encountered. Cannot make further progress.",
                candidate_scores=[],
                goal_reached=False,
            )

        best_candidate = candidate_scores[0]
        second_best = candidate_scores[1] if len(candidate_scores) > 1 else None

        # Uncertainty calculations
        confidence, unc_level, unc_source, recovery = self._estimate_uncertainty(
            best_candidate=best_candidate,
            second_best=second_best,
            state=state,
            environment=environment,
            landmarks=landmarks,
            destination_id=destination_node_id,
        )

        # Construct grounded explanation
        explanation = self._build_grounded_explanation(
            best_candidate=best_candidate,
            second_best=second_best,
            current_node_id=current_node_id,
            target_goal=target_goal,
            environment=environment,
        )

        return PolicyDecision(
            selected_action=best_candidate.action,
            confidence=confidence,
            uncertainty_level=unc_level,
            uncertainty_source=unc_source,
            suggested_recovery=recovery,
            grounded_explanation=explanation,
            candidate_scores=candidate_scores,
            current_target_waypoint=target_goal,
            goal_reached=(best_candidate.action.type == ActionType.STOP and current_node_id == destination_node_id),
        )

    def _score_action(
        self,
        action: Action,
        current_node_id: str,
        target_goal: str,
        destination_id: str,
        state: AgentState,
        environment: NavigationEnvironment,
        parsed_instruction: Dict[str, Any],
    ) -> ActionCandidateScore:
        """Score an individual candidate action."""
        if action.type == ActionType.STOP:
            # STOP is only high scoring if at destination
            if current_node_id == destination_id:
                return ActionCandidateScore(
                    action=action,
                    total_score=1.5,
                    instruction_score=1.0,
                    landmark_score=1.0,
                    progress_score=1.0,
                    cost_penalty=0.0,
                    history_penalty=0.0,
                    explanation_component="STOP selected because target destination has been reached.",
                )
            else:
                return ActionCandidateScore(
                    action=action,
                    total_score=-0.5,
                    instruction_score=0.0,
                    landmark_score=0.0,
                    progress_score=0.0,
                    cost_penalty=0.5,
                    history_penalty=0.0,
                    explanation_component="Premature stop penalized before reaching destination.",
                )

        if action.type == ActionType.WAIT:
            return ActionCandidateScore(
                action=action,
                total_score=0.0,
                instruction_score=0.0,
                landmark_score=0.0,
                progress_score=0.0,
                cost_penalty=0.1,
                history_penalty=0.0,
                explanation_component="WAIT keeps agent stationary.",
            )

        target_node_id = action.target_node_id or current_node_id
        target_node = environment.get_node(target_node_id)
        edge = environment.get_edge(current_node_id, target_node_id)
        edge_direction = edge.direction.lower() if edge else "forward"
        edge_cost = edge.cost if edge else 1.0

        # 1. Instruction Direction Alignment
        inst_dir = parsed_instruction.get("initial_direction", "").lower()
        inst_score = 0.5
        if inst_dir:
            if "left" in inst_dir and ("west" in edge_direction or "left" in edge_direction):
                inst_score = 0.95
            elif "right" in inst_dir and ("east" in edge_direction or "right" in edge_direction):
                inst_score = 0.95
            elif ("forward" in inst_dir or "straight" in inst_dir) and ("south" in edge_direction or "forward" in edge_direction or "north" in edge_direction):
                inst_score = 0.90
            elif "back" in inst_dir or "around" in inst_dir:
                inst_score = 0.85
            else:
                inst_score = 0.35

        # 2. Landmark Alignment
        landmarks = parsed_instruction.get("landmarks", [])
        lm_score = 0.3
        target_landmarks = target_node.landmarks if target_node else []
        target_lm_lower = [l.lower() for l in target_landmarks]

        for lm in landmarks:
            lm_clean = lm.lower().replace(" ", "_")
            if any(lm_clean in t or t in lm_clean for t in target_lm_lower):
                lm_score = 0.95
                break
            # Also check if target node description matches
            if target_node and lm.lower() in target_node.description.lower():
                lm_score = 0.80
                break

        # 3. Goal Progress using shortest path distance
        curr_dist_to_goal = environment.shortest_path_length(current_node_id, target_goal)
        next_dist_to_goal = environment.shortest_path_length(target_node_id, target_goal)

        if math.isinf(curr_dist_to_goal) or math.isinf(next_dist_to_goal):
            prog_score = 0.1
        elif next_dist_to_goal < curr_dist_to_goal:
            # Positive progress toward goal
            prog_score = 0.95
        elif next_dist_to_goal == curr_dist_to_goal:
            prog_score = 0.50
        else:
            # Moving away from goal
            prog_score = 0.15

        # 4. History Penalty (penalize loops)
        hist_penalty = 0.0
        if target_node_id in state.visited_nodes:
            hist_penalty = 0.60
        if target_node_id == state.previous_node_id:
            hist_penalty = 0.80  # immediate backtrack penalty

        # 5. Cost Penalty
        cost_penalty = min(0.3, edge_cost * self.w_cost)

        # Composite score
        total = (
            self.w_inst * inst_score
            + self.w_lm * lm_score
            + self.w_prog * prog_score
            - hist_penalty
            - cost_penalty
        )

        expl = (
            f"Action towards '{target_node_id}' ({edge_direction}): "
            f"progress={prog_score:.2f}, landmark_match={lm_score:.2f}, "
            f"instruction_match={inst_score:.2f}, loop_penalty={hist_penalty:.2f}"
        )

        return ActionCandidateScore(
            action=action,
            total_score=total,
            instruction_score=inst_score,
            landmark_score=lm_score,
            progress_score=prog_score,
            cost_penalty=cost_penalty,
            history_penalty=hist_penalty,
            explanation_component=expl,
        )

    def _estimate_uncertainty(
        self,
        best_candidate: ActionCandidateScore,
        second_best: Optional[ActionCandidateScore],
        state: AgentState,
        environment: NavigationEnvironment,
        landmarks: List[str],
        destination_id: str,
    ) -> Tuple[float, str, str, str]:
        """
        Compute calibrated uncertainty score and identify sources.
        """
        # If destination unreachable from current position
        dist_to_goal = environment.shortest_path_length(state.current_node_id, destination_id)
        if math.isinf(dist_to_goal):
            return (
                0.20,
                "high",
                f"Destination '{destination_id}' is unreachable in environment graph.",
                "replan",
            )

        # Check for missing landmark evidence in graph
        missing_lms = []
        for lm in landmarks:
            if not environment.landmark_nodes(lm):
                missing_lms.append(lm)

        if missing_lms:
            return (
                0.45,
                "medium",
                f"Landmark(s) {missing_lms} not found in environment nodes.",
                "request_observation",
            )

        # Ambiguity between top candidate and alternative candidate
        if second_best is not None:
            margin = best_candidate.total_score - second_best.total_score
            if margin < 0.08:
                return (
                    0.55,
                    "medium",
                    f"Action ambiguity: Small score margin ({margin:.3f}) between '{best_candidate.action.target_node_id}' and '{second_best.action.target_node_id}'.",
                    "proceed_with_caution",
                )

        confidence = max(0.65, min(0.98, 0.5 + best_candidate.total_score * 0.45))
        return (
            confidence,
            "low",
            "None (Consistent instruction and landmark trajectory)",
            "proceed",
        )

    def _build_grounded_explanation(
        self,
        best_candidate: ActionCandidateScore,
        second_best: Optional[ActionCandidateScore],
        current_node_id: str,
        target_goal: str,
        environment: NavigationEnvironment,
    ) -> str:
        """Build clear readable grounded explanation."""
        act = best_candidate.action
        target = act.target_node_id or current_node_id
        target_node = environment.get_node(target)
        room_name = target_node.room_type if target_node else target

        if act.type == ActionType.STOP:
            return f"Action 'STOP' was selected because the agent arrived at the target destination '{room_name}' ({target})."

        base = (
            f"Moving towards '{room_name}' ({target}) was chosen with confidence score {best_candidate.total_score:.2f}. "
            f"This transition directly advances towards objective '{target_goal}' (progress score {best_candidate.progress_score:.2f})."
        )
        if best_candidate.landmark_score > 0.7:
            base += f" Visual features confirm alignment with relevant landmarks in '{room_name}'."
        if second_best:
            sec_target = second_best.action.target_node_id or "alternative"
            base += f" Alternative path to '{sec_target}' was scored lower ({second_best.total_score:.2f}) due to higher path cost or weaker instruction alignment."

        return base
