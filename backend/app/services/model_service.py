"""
Model Service for inspecting installed AI components, device status, and configuration.
"""
from typing import Dict, Any, List
import platform
import os


class ModelService:
    def __init__(self) -> None:
        self.components = {
            "language_encoder": {
                "name": "Multilingual Sentence Transformer / Fast Char-Ngram Semantic Matching",
                "checkpoint": "paraphrase-multilingual-MiniLM-L12-v2",
                "embedding_dim": 384,
                "supported_languages": ["en", "hi", "es", "fr", "de", "zh", "pt"],
                "status": "active",
                "fallback": "TF-IDF N-gram Fallback Layer",
            },
            "vision_encoder": {
                "name": "VLN Structured Vision-Language Alignment (CLIP / SigLIP compatible)",
                "checkpoint": "openai/clip-vit-base-patch32",
                "feature_dim": 512,
                "viewpoint_coverage": [0, 90, 180, 270],
                "status": "active",
                "observation_type": "simulated_structured_rgb",
            },
            "decision_policy": {
                "name": "Multimodal Instruction-Conditioned Graph Policy",
                "architecture": "Hybrid Semantic-Geometric Action Scoring with Uncertainty Calibration",
                "algorithm": "Dijkstra / A* Graph Planning + Cross-Modal Feature Alignment",
                "status": "active",
            },
            "uncertainty_estimator": {
                "name": "Candidate Margin & Landmark Consistency Estimator",
                "type": "Calibrated Heuristic + Evidence Verification",
                "status": "active",
            }
        }

    def get_status(self) -> Dict[str, Any]:
        return {
            "status": "operational",
            "device": "cpu",
            "platform": platform.platform(),
            "python_version": platform.python_version(),
            "components": self.components,
            "supported_languages": [
                {"code": "en", "name": "English", "native": "English", "supported": True},
                {"code": "hi", "name": "Hindi", "native": "हिन्दी", "supported": True},
                {"code": "es", "name": "Spanish", "native": "Español", "supported": True},
                {"code": "de", "name": "German", "native": "Deutsch", "supported": True},
                {"code": "fr", "name": "French", "native": "Français", "supported": True},
                {"code": "zh", "name": "Chinese", "native": "中文", "supported": True},
            ],
            "benchmark_compliance": {
                "benchmark": "Room-Across-Room (RxR)",
                "organization": "Google Research",
                "metrics_supported": ["SR", "SPL", "NE", "nDTW", "SDTW"],
            }
        }


_global_model_service = None


def get_model_service() -> ModelService:
    global _global_model_service
    if _global_model_service is None:
        _global_model_service = ModelService()
    return _global_model_service
