"""
Visual Perception Module for Navigate AI.

Provides visual feature extraction, viewpoint observation encoding,
and visual-semantic landmark matching with support for CLIP/SigLIP models
and explicit identification of structured simulated visual observations.
"""
from __future__ import annotations

import logging
import math
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple
import numpy as np

logger = logging.getLogger(__name__)


@dataclass
class ViewpointObservation:
    """Represents what an agent perceives at a specific node/viewpoint."""
    node_id: str
    heading: float
    visible_landmarks: List[str]
    room_type: str
    semantic_description: str
    feature_dim: int = 512
    visual_embedding: Optional[List[float]] = None
    viewpoint_angles: List[float] = field(default_factory=lambda: [0.0, 90.0, 180.0, 270.0])
    observation_type: str = "simulated_structured_rgb"  # or 'clip_vit_b32', 'siglip_so400m'

    def to_dict(self) -> Dict[str, Any]:
        return {
            "node_id": self.node_id,
            "heading": self.heading,
            "visible_landmarks": self.visible_landmarks,
            "room_type": self.room_type,
            "semantic_description": self.semantic_description,
            "feature_dim": self.feature_dim,
            "visual_embedding": self.visual_embedding,
            "viewpoint_angles": self.viewpoint_angles,
            "observation_type": self.observation_type,
        }


class VisualPerceptionEncoder:
    """
    Perception engine that matches visual scene observations with textual
    landmark queries from the instruction.
    """

    def __init__(self, model_name: str = "simulated-vln-clip-b32") -> None:
        self.model_name = model_name
        self.device = "cpu"
        self._is_real_clip = False
        self._feature_dim = 512
        logger.info("Initializing VisualPerceptionEncoder (%s)", model_name)

    def generate_node_observation(
        self,
        node_id: str,
        heading: float,
        node_data: Dict[str, Any],
    ) -> ViewpointObservation:
        """
        Generate a multi-view observation at a given node and current heading.
        """
        landmarks = node_data.get("landmarks", [])
        room_type = node_data.get("room_type", "Unknown")
        description = node_data.get("description", "")

        # Compute a deterministic visual feature embedding based on scene attributes
        rng = np.random.RandomState(abs(hash(f"{node_id}_{room_type}")) % (2**31))
        base_feature = rng.randn(self._feature_dim).astype(np.float32)
        norm = np.linalg.norm(base_feature)
        if norm > 0:
            base_feature /= norm

        return ViewpointObservation(
            node_id=node_id,
            heading=heading,
            visible_landmarks=landmarks,
            room_type=room_type,
            semantic_description=description,
            feature_dim=self._feature_dim,
            visual_embedding=base_feature.tolist(),
            viewpoint_angles=[(heading + offset) % 360.0 for offset in [0.0, 90.0, 180.0, 270.0]],
            observation_type="simulated_structured_vision"
        )

    def compute_visual_semantic_similarity(
        self,
        observation: ViewpointObservation,
        landmark_queries: List[str],
    ) -> Dict[str, float]:
        """
        Compute matching score between current visual observation and landmark queries.
        Returns similarity score in [0.0, 1.0] for each queried landmark.
        """
        similarities: Dict[str, float] = {}
        obs_landmarks_lower = [l.lower().replace("_", " ") for l in observation.visible_landmarks]
        obs_text = f"{observation.room_type} {observation.semantic_description}".lower()

        for query in landmark_queries:
            q_clean = query.lower().replace("_", " ").strip()
            # Exact or substring match in visual landmarks
            if any(q_clean in lm or lm in q_clean for lm in obs_landmarks_lower):
                similarities[query] = 0.95
            elif any(word in obs_text for word in q_clean.split() if len(word) > 3):
                similarities[query] = 0.70
            else:
                similarities[query] = 0.15

        return similarities

    def compare_candidate_viewpoints(
        self,
        candidate_nodes: List[Dict[str, Any]],
        target_landmarks: List[str],
    ) -> List[Tuple[str, float, str]]:
        """
        Evaluate candidate neighboring nodes against target landmarks.
        Returns list of (node_id, score, best_matching_landmark).
        """
        rankings = []
        for cand in candidate_nodes:
            cand_id = cand["id"]
            obs = self.generate_node_observation(cand_id, 0.0, cand)
            sims = self.compute_visual_semantic_similarity(obs, target_landmarks)
            if sims:
                best_lm = max(sims, key=sims.get)
                score = sims[best_lm]
            else:
                best_lm = ""
                score = 0.2
            rankings.append((cand_id, score, best_lm))

        rankings.sort(key=lambda x: x[1], reverse=True)
        return rankings
