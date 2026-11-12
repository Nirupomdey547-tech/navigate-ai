"""
Environment Service for managing and retrieving Navigation Environments.
"""
from typing import Dict, List, Optional, Any
import copy
from app.navigation.environment import NavigationEnvironment, EnvironmentNode, EnvironmentEdge
from app.environments.data import DEMO_ENVIRONMENTS, DEMO_INSTRUCTIONS


class EnvironmentService:
    def __init__(self) -> None:
        self._environments: Dict[str, Dict[str, Any]] = {}
        self._graph_cache: Dict[str, NavigationEnvironment] = {}
        self._instructions: List[Dict[str, Any]] = copy.deepcopy(DEMO_INSTRUCTIONS)

        # Load predefined environments
        for env_dict in DEMO_ENVIRONMENTS:
            self._register_env_dict(env_dict)

    def _register_env_dict(self, env_dict: Dict[str, Any]) -> None:
        env_id = env_dict["id"]
        self._environments[env_id] = copy.deepcopy(env_dict)
        # Build NavigationEnvironment graph
        nav_env = NavigationEnvironment(name=env_dict["name"], description=env_dict.get("description", ""))
        for nd in env_dict["nodes"]:
            node = EnvironmentNode(
                id=nd["id"],
                position=tuple(nd["position"]),
                room_type=nd["room_type"],
                landmarks=nd.get("landmarks", []),
                description=nd.get("description", ""),
                destination_relevance=nd.get("destination_relevance", 0.0),
            )
            nav_env.add_node(node)

        for ed in env_dict["edges"]:
            edge = EnvironmentEdge(
                source=ed["source"],
                target=ed["target"],
                cost=ed.get("cost", 1.0),
                direction=ed.get("direction", "forward"),
                distance=ed.get("distance", 1.0),
                action=ed.get("action", "move_forward"),
                accessibility=ed.get("accessibility", True),
            )
            nav_env.add_edge(edge)

        self._graph_cache[env_id] = nav_env

    def get_all_environments(self) -> List[Dict[str, Any]]:
        """Return list of environment summaries with node and edge counts."""
        res = []
        for env_id, data in self._environments.items():
            res.append({
                "id": env_id,
                "name": data["name"],
                "description": data["description"],
                "start_node_id": data.get("start_node_id"),
                "goal_node_ids": data.get("goal_node_ids", []),
                "node_count": len(data.get("nodes", [])),
                "edge_count": len(data.get("edges", [])),
                "nodes": data.get("nodes", []),
                "edges": data.get("edges", []),
            })
        return res

    def get_environment(self, env_id: str) -> Optional[Dict[str, Any]]:
        return self._environments.get(env_id)

    def get_nav_environment(self, env_id: str) -> Optional[NavigationEnvironment]:
        return self._graph_cache.get(env_id)

    def get_instructions(self, env_id: Optional[str] = None, language: Optional[str] = None) -> List[Dict[str, Any]]:
        results = self._instructions
        if env_id:
            results = [i for i in results if i.get("environment_id") == env_id]
        if language:
            results = [i for i in results if i.get("language") == language]
        return results

    def add_custom_environment(self, env_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save a new custom graph environment."""
        env_id = env_data.get("id") or f"custom_{len(self._environments) + 1}"
        env_data["id"] = env_id
        self._register_env_dict(env_data)
        return env_data

    def delete_environment(self, env_id: str) -> bool:
        if env_id in self._environments:
            del self._environments[env_id]
            if env_id in self._graph_cache:
                del self._graph_cache[env_id]
            return True
        return False


_global_env_service: Optional[EnvironmentService] = None


def get_environment_service() -> EnvironmentService:
    global _global_env_service
    if _global_env_service is None:
        _global_env_service = EnvironmentService()
    return _global_env_service
