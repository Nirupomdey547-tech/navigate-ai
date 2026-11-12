"""
Central Navigation Service for Navigate AI.

Orchestrates navigation episodes:
- Instruction parsing & multilingual normalization
- Environment graph binding
- State tracking and discrete step execution
- Hybrid decision-making policy and uncertainty evaluation
- Metrics computation (SR, SPL, NE, nDTW, SDTW)
- Real-time WebSocket broadcasting
- Persistent database run recording
"""
from __future__ import annotations

import asyncio
import logging
import math
import time
from typing import Any, Dict, List, Optional, Tuple


from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.environments.service import get_environment_service
from app.evaluation.metrics import dtw, ndtw, sdtw, spl
from app.language.instruction_parser import InstructionParser
from app.models.navigation import NavigationAction, NavigationObservation, NavigationRun
from app.navigation.actions import Action, ActionResult, ActionType
from app.navigation.environment import NavigationEnvironment
from app.navigation.policy import NavigationPolicy, PolicyDecision
from app.navigation.state import AgentState
from app.websocket.manager import (
    EVENT_ACTION_SELECTED,
    EVENT_CANDIDATE_ACTIONS,
    EVENT_MOVEMENT_COMPLETED,
    EVENT_NAVIGATION_COMPLETED,
    EVENT_NAVIGATION_FAILED,
    EVENT_NAVIGATION_PAUSED,
    EVENT_NAVIGATION_STARTED,
    EVENT_OBSERVATION_UPDATED,
    EVENT_STATE_UPDATED,
    EVENT_UNCERTAINTY_DETECTED,
    manager,
)

logger = logging.getLogger(__name__)


class ActiveEpisode:
    def __init__(
        self,
        run_id: str,
        db_id: int,
        environment_id: str,
        instruction: str,
        language: str,
        parsed_instruction: Dict[str, Any],
        start_node_id: str,
        goal_node_id: str,
        nav_env: NavigationEnvironment,
        reference_path: List[str],
        state: AgentState,
    ) -> None:
        self.run_id = run_id
        self.db_id = db_id
        self.environment_id = environment_id
        self.instruction = instruction
        self.language = language
        self.parsed_instruction = parsed_instruction
        self.start_node_id = start_node_id
        self.goal_node_id = goal_node_id
        self.nav_env = nav_env
        self.reference_path = reference_path
        self.state = state
        self.status = "running"  # running | paused | completed | failed
        self.path_traveled: List[str] = [start_node_id]
        self.coordinate_trajectory: List[List[float]] = []
        self.start_time = time.time()
        self.interventions: List[Dict[str, Any]] = []

        start_node = nav_env.get_node(start_node_id)
        if start_node:
            self.coordinate_trajectory.append(list(start_node.position))


class NavigationService:
    def __init__(self) -> None:
        self.parser = InstructionParser()
        self.policy = NavigationPolicy()
        self.env_service = get_environment_service()
        self._active_episodes: Dict[str, ActiveEpisode] = {}

    async def start_navigation(
        self,
        environment_id: str,
        instruction: str,
        language: Optional[str] = "en",
        start_node: Optional[str] = None,
        goal_node: Optional[str] = None,
        user_id: Optional[int] = None,
        db: Optional[AsyncSession] = None,
    ) -> Dict[str, Any]:
        """Initialize and start a new navigation episode."""
        env_dict = self.env_service.get_environment(environment_id)
        if not env_dict:
            raise ValueError(f"Environment '{environment_id}' not found.")

        nav_env = self.env_service.get_nav_environment(environment_id)
        if not nav_env:
            raise ValueError(f"Navigation graph for '{environment_id}' not loaded.")

        # 1. Parse instruction and detect language
        parsed_obj = self.parser.parse(instruction, lang=language)
        parsed = parsed_obj.to_dict() if hasattr(parsed_obj, "to_dict") else parsed_obj
        detected_lang = parsed.get("language", language or "en")


        # 2. Determine start and goal nodes
        actual_start = start_node or env_dict.get("start_node_id") or env_dict["nodes"][0]["id"]

        actual_goal = goal_node
        if not actual_goal:
            # Check parsed destination or default goal nodes
            parsed_dest = parsed.get("destination", "")
            if parsed_dest and nav_env.get_node(parsed_dest):
                actual_goal = parsed_dest
            else:
                goal_candidates = env_dict.get("goal_node_ids", [])
                actual_goal = goal_candidates[0] if goal_candidates else env_dict["nodes"][-1]["id"]

        # 3. Compute ground-truth shortest reference path
        ref_path = nav_env.shortest_path(actual_start, actual_goal)

        # 4. Initialize agent state
        run_uuid = f"run_{int(time.time() * 1000)}"
        state = AgentState(
            current_node_id=actual_start,
            previous_node_id=None,
            current_heading=0.0,
            visited_nodes={actual_start},
            remaining_waypoints=parsed.get("ordered_waypoints", []),
            current_objective=actual_goal,
            distance_to_goal=nav_env.shortest_path_length(actual_start, actual_goal),
            start_node_id=actual_start,
            goal_node_id=actual_goal,
            run_id=run_uuid,
        )

        db_id = int(time.time() * 1000) % 10000000
        # Save to database if session provided
        if db:
            run_record = NavigationRun(
                user_id=user_id,
                environment_id=environment_id,
                instruction=instruction,
                language=detected_lang,
                parsed_instruction=parsed,
                start_node=actual_start,
                goal_node=actual_goal,
                status="running",
                action_sequence=[],
                state_history=[state.to_dict()],
                final_path=[actual_start],
            )
            db.add(run_record)
            await db.commit()
            await db.refresh(run_record)
            db_id = run_record.id

        episode = ActiveEpisode(
            run_id=run_uuid,
            db_id=db_id,
            environment_id=environment_id,
            instruction=instruction,
            language=detected_lang,
            parsed_instruction=parsed,
            start_node_id=actual_start,
            goal_node_id=actual_goal,
            nav_env=nav_env,
            reference_path=ref_path,
            state=state,
        )
        self._active_episodes[run_uuid] = episode
        self._active_episodes[str(db_id)] = episode

        # Broadcast WebSocket start
        start_payload = {
            "run_id": run_uuid,
            "db_id": db_id,
            "environment_id": environment_id,
            "instruction": instruction,
            "language": detected_lang,
            "parsed_instruction": parsed,
            "start_node": actual_start,
            "goal_node": actual_goal,
            "reference_path": ref_path,
            "state": state.to_dict(),
        }
        await manager.send_event(run_uuid, EVENT_NAVIGATION_STARTED, start_payload)
        await manager.send_event(str(db_id), EVENT_NAVIGATION_STARTED, start_payload)

        return start_payload

    async def step_navigation(
        self,
        run_id: str,
        db: Optional[AsyncSession] = None,
    ) -> Dict[str, Any]:
        """Perform a single sequential step of the agent."""
        episode = self._active_episodes.get(str(run_id))
        if not episode:
            raise ValueError(f"Active navigation episode '{run_id}' not found.")

        if episode.status in ("completed", "failed"):
            return {
                "run_id": episode.db_id,
                "step": episode.state.steps_taken,
                "is_done": True,
                "status": episode.status,
                "state": episode.state.to_dict(),
                "metrics": self._compute_episode_metrics(episode),
            }

        state = episode.state
        nav_env = episode.nav_env

        # 1. Evaluate policy
        decision: PolicyDecision = self.policy.evaluate_step(
            state=state,
            environment=nav_env,
            parsed_instruction=episode.parsed_instruction,
            destination_node_id=episode.goal_node_id,
        )

        # Broadcast candidate actions and uncertainty
        await manager.send_event(
            episode.run_id,
            EVENT_CANDIDATE_ACTIONS,
            [c.to_dict() for c in decision.candidate_scores],
        )

        if decision.uncertainty_level in ("medium", "high"):
            await manager.send_event(
                episode.run_id,
                EVENT_UNCERTAINTY_DETECTED,
                {
                    "level": decision.uncertainty_level,
                    "confidence": decision.confidence,
                    "source": decision.uncertainty_source,
                    "recovery": decision.suggested_recovery,
                },
            )

        selected_action = decision.selected_action

        await manager.send_event(
            episode.run_id,
            EVENT_ACTION_SELECTED,
            {
                "action": selected_action.to_dict(),
                "confidence": decision.confidence,
                "explanation": decision.grounded_explanation,
            },
        )

        # 2. Execute Action & Environment Transition
        is_done = False
        success = False

        if selected_action.type == ActionType.STOP:
            is_done = True
            success = (state.current_node_id == episode.goal_node_id)
            episode.status = "completed" if success else "failed"
        else:
            target_node_id = selected_action.target_node_id or state.current_node_id
            target_node = nav_env.get_node(target_node_id)
            edge = nav_env.get_edge(state.current_node_id, target_node_id)

            # Update heading from edge direction if available
            new_heading = state.current_heading
            if edge and edge.direction:
                heading_map = {"north": 0.0, "east": 90.0, "south": 180.0, "west": 270.0}
                new_heading = heading_map.get(edge.direction.lower(), state.current_heading)

            # Transition state
            state.previous_node_id = state.current_node_id
            state.current_node_id = target_node_id
            state.current_heading = new_heading
            state.visited_nodes.add(target_node_id)
            state.steps_taken += 1
            state.previous_action = selected_action
            state.confidence = decision.confidence
            state.uncertainty = 1.0 - decision.confidence
            state.distance_to_goal = nav_env.shortest_path_length(target_node_id, episode.goal_node_id)

            episode.path_traveled.append(target_node_id)
            if target_node:
                episode.coordinate_trajectory.append(list(target_node.position))

            # Update remaining waypoints
            if state.remaining_waypoints and target_node_id == state.remaining_waypoints[0]:
                state.remaining_waypoints.pop(0)

            # Check termination conditions
            if state.current_node_id == episode.goal_node_id:
                is_done = True
                success = True
                episode.status = "completed"
            elif state.steps_taken >= 25:  # max steps guard
                is_done = True
                success = False
                episode.status = "failed"

        metrics = self._compute_episode_metrics(episode)

        # Broadcast movement and state update
        await manager.send_event(
            episode.run_id,
            EVENT_MOVEMENT_COMPLETED,
            {
                "current_node_id": state.current_node_id,
                "heading": state.current_heading,
                "step": state.steps_taken,
                "path_traveled": episode.path_traveled,
            },
        )
        await manager.send_event(
            episode.run_id,
            EVENT_STATE_UPDATED,
            state.to_dict(),
        )

        if is_done:
            event_type = EVENT_NAVIGATION_COMPLETED if success else EVENT_NAVIGATION_FAILED
            await manager.send_event(
                episode.run_id,
                event_type,
                {
                    "run_id": episode.run_id,
                    "success": success,
                    "steps": state.steps_taken,
                    "final_path": episode.path_traveled,
                    "metrics": metrics,
                },
            )

        # Update DB record if available
        if db:
            result = await db.execute(select(NavigationRun).where(NavigationRun.id == episode.db_id))
            run_row = result.scalar_one_or_none()
            if run_row:
                history_list = list(run_row.state_history or [])
                history_list.append(state.to_dict())
                run_row.state_history = history_list
                run_row.final_path = episode.path_traveled
                run_row.status = episode.status
                if is_done:
                    run_row.success = 1 if success else 0
                    run_row.metrics = metrics
                    run_row.execution_time = time.time() - episode.start_time
                await db.commit()

        # Format candidates for schema
        schema_candidates = []
        for c in decision.candidate_scores:
            schema_candidates.append({
                "action_type": c.action.type.value,
                "target_node": c.action.target_node_id or "",
                "score": c.total_score,
                "components": {
                    "instruction": c.instruction_score,
                    "landmark": c.landmark_score,
                    "progress": c.progress_score,
                    "cost": c.cost_penalty,
                    "history": c.history_penalty,
                },
                "explanation": c.explanation_component,
            })

        return {
            "run_id": episode.db_id,
            "step": state.steps_taken,
            "state": state.to_dict(),
            "candidates": schema_candidates,
            "selected_action": selected_action.to_dict(),
            "uncertainty": {
                "level": state.uncertainty,
                "reasons": [decision.uncertainty_source] if decision.uncertainty_source else [],
                "recommendation": decision.suggested_recovery,
            },
            "explanation": decision.grounded_explanation,
            "is_done": is_done,
            "success": success,
            "metrics": metrics,
        }

    async def pause_navigation(self, run_id: str) -> Dict[str, Any]:
        episode = self._active_episodes.get(str(run_id))
        if episode:
            episode.status = "paused"
            await manager.send_event(episode.run_id, EVENT_NAVIGATION_PAUSED, {"run_id": run_id, "status": "paused"})
            return {"status": "paused", "run_id": run_id}
        return {"status": "not_found"}

    async def resume_navigation(self, run_id: str) -> Dict[str, Any]:
        episode = self._active_episodes.get(str(run_id))
        if episode:
            episode.status = "running"
            return {"status": "running", "run_id": run_id}
        return {"status": "not_found"}

    async def stop_navigation(self, run_id: str, db: Optional[AsyncSession] = None) -> Dict[str, Any]:
        episode = self._active_episodes.get(str(run_id))
        if episode:
            episode.status = "completed"
            metrics = self._compute_episode_metrics(episode)
            if db:
                result = await db.execute(select(NavigationRun).where(NavigationRun.id == episode.db_id))
                row = result.scalar_one_or_none()
                if row:
                    row.status = "completed"
                    row.metrics = metrics
                    await db.commit()
            return {"status": "stopped", "metrics": metrics}
        return {"status": "not_found"}

    async def reset_navigation(self, run_id: str) -> Dict[str, Any]:
        episode = self._active_episodes.get(str(run_id))
        if episode:
            nav_env = episode.nav_env
            start_node = episode.start_node_id
            episode.state = AgentState(
                current_node_id=start_node,
                previous_node_id=None,
                current_heading=0.0,
                visited_nodes={start_node},
                remaining_waypoints=episode.parsed_instruction.get("ordered_waypoints", []),
                current_objective=episode.goal_node_id,
                distance_to_goal=nav_env.shortest_path_length(start_node, episode.goal_node_id),
                start_node_id=start_node,
                goal_node_id=episode.goal_node_id,
                run_id=episode.run_id,
            )
            episode.path_traveled = [start_node]
            episode.status = "running"
            return {"status": "reset", "state": episode.state.to_dict()}
        return {"status": "not_found"}

    async def manual_intervention(
        self,
        run_id: str,
        action_type: str,
        target_node: str,
        db: Optional[AsyncSession] = None,
    ) -> Dict[str, Any]:
        """Apply a manual user intervention to override the agent's action."""
        episode = self._active_episodes.get(str(run_id))
        if not episode:
            raise ValueError(f"Active episode '{run_id}' not found.")

        nav_env = episode.nav_env
        target_node_obj = nav_env.get_node(target_node)
        if not target_node_obj:
            raise ValueError(f"Target node '{target_node}' does not exist.")

        state = episode.state
        state.previous_node_id = state.current_node_id
        state.current_node_id = target_node
        state.visited_nodes.add(target_node)
        state.steps_taken += 1
        state.previous_action = Action(type=ActionType.MOVE_TO_NODE, target_node_id=target_node, description="Manual Intervention")

        episode.path_traveled.append(target_node)
        episode.coordinate_trajectory.append(list(target_node_obj.position))
        episode.interventions.append({
            "step": state.steps_taken,
            "from_node": state.previous_node_id,
            "to_node": target_node,
            "timestamp": time.time(),
        })

        await manager.send_event(
            episode.run_id,
            EVENT_MOVEMENT_COMPLETED,
            {
                "current_node_id": state.current_node_id,
                "step": state.steps_taken,
                "path_traveled": episode.path_traveled,
                "manual_intervention": True,
            },
        )

        return {"status": "intervention_applied", "current_node_id": target_node, "step": state.steps_taken}

    def _compute_episode_metrics(self, episode: ActiveEpisode) -> Dict[str, Any]:
        """Compute RxR standard benchmark metrics."""
        nav_env = episode.nav_env
        # Compute trajectory lengths
        shortest_len = nav_env.shortest_path_length(episode.start_node_id, episode.goal_node_id)
        if math.isinf(shortest_len):
            shortest_len = 1.0

        agent_path_length = 0.0
        for i in range(len(episode.path_traveled) - 1):
            edge = nav_env.get_edge(episode.path_traveled[i], episode.path_traveled[i + 1])
            agent_path_length += edge.distance if edge else 1.0

        success = (episode.state.current_node_id == episode.goal_node_id)

        # Success weighted by Path Length (SPL)
        spl_val = 0.0
        if success:
            spl_val = shortest_len / max(shortest_len, agent_path_length)

        # Navigation Error (distance from current agent node to goal node)
        current_pos = nav_env.get_node(episode.state.current_node_id)
        goal_pos = nav_env.get_node(episode.goal_node_id)
        ne_val = 0.0
        if current_pos and goal_pos:
            ne_val = math.sqrt(
                (current_pos.position[0] - goal_pos.position[0]) ** 2
                + (current_pos.position[2] - goal_pos.position[2]) ** 2
            )

        # Reference coordinate trajectory for nDTW / SDTW
        ref_coords = []
        for nid in episode.reference_path:
            node = nav_env.get_node(nid)
            if node:
                ref_coords.append(list(node.position))

        ndtw_val = 0.0
        sdtw_val = 0.0
        if ref_coords and episode.coordinate_trajectory:
            ndtw_val = ndtw(episode.coordinate_trajectory, ref_coords)
            sdtw_val = sdtw(episode.coordinate_trajectory, ref_coords, success=success)

        return {
            "success": success,
            "success_rate": 1.0 if success else 0.0,
            "spl": round(spl_val, 4),
            "navigation_error": round(ne_val, 2),
            "ndtw": round(ndtw_val, 4),
            "sdtw": round(sdtw_val, 4),
            "path_length": round(agent_path_length, 2),
            "shortest_path_length": round(shortest_len, 2),
            "steps": episode.state.steps_taken,
            "interventions": len(episode.interventions),
        }


_global_nav_service: Optional[NavigationService] = None


def get_navigation_service() -> NavigationService:
    global _global_nav_service
    if _global_nav_service is None:
        _global_nav_service = NavigationService()
    return _global_nav_service
