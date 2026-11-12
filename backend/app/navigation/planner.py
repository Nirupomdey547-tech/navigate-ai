"""
Route planner module using Dijkstra / A* on NetworkX graphs.

Provides RoutePlanner with support for waypoint-based routing and cost
estimation.
"""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING, List, Optional

logger = logging.getLogger(__name__)

if TYPE_CHECKING:
    from .environment import NavigationEnvironment


class RoutePlanner:
    """
    Plans optimal routes through a NavigationEnvironment.

    Uses Dijkstra (networkx) as the core algorithm.
    """

    def plan(
        self,
        source: str,
        destination: str,
        environment: "NavigationEnvironment",
    ) -> List[str]:
        """
        Return a list of node IDs representing the shortest path from
        *source* to *destination*.  Returns an empty list if no path
        exists.
        """
        if source == destination:
            return [source]
        path = environment.shortest_path(source, destination)
        if not path:
            logger.warning("No path found from '%s' to '%s'.", source, destination)
        return path

    def plan_via_waypoints(
        self,
        source: str,
        waypoints: List[str],
        destination: str,
        environment: "NavigationEnvironment",
    ) -> List[str]:
        """
        Return a path from *source* through each waypoint in order to
        *destination*.  Segments with no path are skipped with a warning.
        """
        full_path: List[str] = []
        stops = [source] + waypoints + [destination]

        for i in range(len(stops) - 1):
            seg = self.plan(stops[i], stops[i + 1], environment)
            if not seg:
                logger.warning(
                    "No path from '%s' to '%s'; waypoint skipped.", stops[i], stops[i + 1]
                )
                continue
            if full_path and full_path[-1] == seg[0]:
                # Avoid duplicate junction node
                full_path.extend(seg[1:])
            else:
                full_path.extend(seg)

        return full_path

    def estimate_cost(
        self,
        path: List[str],
        environment: "NavigationEnvironment",
    ) -> float:
        """
        Return the total edge cost of *path* according to the environment
        graph.  Returns infinity if any edge in the path is missing.
        """
        if len(path) < 2:
            return 0.0

        total = 0.0
        for i in range(len(path) - 1):
            edge = environment.get_edge(path[i], path[i + 1])
            if edge is None:
                logger.warning(
                    "Edge from '%s' to '%s' not found during cost estimation.",
                    path[i],
                    path[i + 1],
                )
                return float("inf")
            total += edge.cost
        return total

    def find_alternative_paths(
        self,
        source: str,
        destination: str,
        environment: "NavigationEnvironment",
        k: int = 3,
    ) -> List[List[str]]:
        """
        Return up to *k* simple paths from *source* to *destination* (by
        increasing total cost).  Useful for uncertainty recovery.
        """
        try:
            import networkx as nx
            gen = nx.shortest_simple_paths(
                environment.graph, source, destination, weight="weight"
            )
            paths: List[List[str]] = []
            for path in gen:
                paths.append(path)
                if len(paths) >= k:
                    break
            return paths
        except Exception as exc:  # noqa: BLE001
            logger.debug("Could not enumerate alternative paths: %s", exc)
            primary = self.plan(source, destination, environment)
            return [primary] if primary else []
