"""
Navigate AI — Evaluation Metrics
Implements SR, SPL, nDTW, SDTW as defined in the VLN literature.
"""
import math
from typing import List


def _haversine(a: List[float], b: List[float]) -> float:
    """Euclidean distance in 3D."""
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))


def success_rate(results: List[dict]) -> float:
    successes = sum(1 for r in results if r.get("success"))
    return successes / len(results) if results else 0.0


def spl(results: List[dict]) -> float:
    """Success weighted by (normalised inverse) Path Length."""
    if not results:
        return 0.0
    total = 0.0
    for r in results:
        if r.get("success"):
            shortest = r.get("shortest_path_length", 1.0)
            agent_len = r.get("agent_path_length", shortest)
            total += shortest / max(shortest, agent_len)
    return total / len(results)


def dtw(path_a: List[List[float]], path_b: List[List[float]]) -> float:
    """Dynamic Time Warping distance between two coordinate paths."""
    n, m = len(path_a), len(path_b)
    dp = [[float("inf")] * (m + 1) for _ in range(n + 1)]
    dp[0][0] = 0.0
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost = _haversine(path_a[i - 1], path_b[j - 1])
            dp[i][j] = cost + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[n][m]


def ndtw(agent_path: List[List[float]], ref_path: List[List[float]], threshold: float = 3.0) -> float:
    """Normalised DTW (nDTW)."""
    d = dtw(agent_path, ref_path)
    n = len(ref_path)
    return math.exp(-d / (n * threshold)) if n else 0.0


def sdtw(agent_path: List[List[float]], ref_path: List[List[float]], success: bool, threshold: float = 3.0) -> float:
    """Success weighted DTW (SDTW)."""
    return ndtw(agent_path, ref_path, threshold) if success else 0.0
