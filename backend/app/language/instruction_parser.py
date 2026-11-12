"""
Multilingual navigation instruction parser.

Supports EN, HI, ES, FR, ZH, DE, PT.
Uses sentence-transformers for embedding and langdetect for language
detection; falls back to regex-based extraction when transformers is
unavailable.
"""
from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from .language_detector import detect_with_confidence, is_supported_language
from .multilingual_encoder import MultilingualEncoder

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Keyword tables per language
# ---------------------------------------------------------------------------

_LANDMARK_PATTERNS: Dict[str, List[str]] = {
    "en": [
        r"\b(reception|desk|staircase|stairs|elevator|lift|corridor|hallway|lobby"
        r"|entrance|exit|door|gate|office|room|kitchen|restroom|bathroom|conference"
        r"|meeting\s+room|server\s+room|cafeteria|library|lab|gym|garden|atrium"
        r"|boardroom|vault|theater|parking|security|storage|balcony|study|garage"
        r"|lounge|pool|rooftop|front\s+desk|open\s+space)\b"
    ],
    "hi": [
        r"\b(रिसेप्शन|सीढ़ी|लिफ्ट|गलियारा|प्रवेश|निकास|कमरा|रसोई|बाथरूम|मीटिंग)\b"
    ],
    "es": [
        r"\b(recepción|escalera|ascensor|pasillo|entrada|salida|oficina|sala|cocina"
        r"|baño|conferencia|biblioteca|cafetería|laboratorio|gimnasio|jardín|vestíbulo)\b"
    ],
    "fr": [
        r"\b(réception|escalier|ascenseur|couloir|entrée|sortie|bureau|salle|cuisine"
        r"|salle\s+de\s+bain|conférence|bibliothèque|cafétéria|laboratoire|gymnase"
        r"|jardin|hall|salon)\b"
    ],
    "zh": [
        r"(接待处|楼梯|电梯|走廊|入口|出口|办公室|房间|厨房|卫生间|会议室|图书馆|食堂|实验室|体育馆)"
    ],
    "de": [
        r"\b(empfang|treppe|aufzug|flur|eingang|ausgang|büro|zimmer|küche|bad"
        r"|konferenzraum|bibliothek|kantine|labor|fitnessstudio|garten|halle|lounge)\b"
    ],
    "pt": [
        r"\b(recepção|escada|elevador|corredor|entrada|saída|escritório|sala|cozinha"
        r"|banheiro|conferência|biblioteca|cafeteria|laboratório|ginásio|jardim|átrio)\b"
    ],
}

_DIRECTION_PATTERNS: Dict[str, List[Tuple[str, str]]] = {
    "en": [
        (r"\bturn\s+right\b", "turn_right"),
        (r"\bturn\s+left\b", "turn_left"),
        (r"\bgo\s+straight\b|\bmove\s+forward\b|\bwalk\s+forward\b|\bproceed\s+forward\b", "forward"),
        (r"\bturn\s+around\b|\bgo\s+back\b|\bu.turn\b", "turn_around"),
        (r"\bgo\s+up\b|\btake\s+the\s+(stairs|elevator)\s+up\b", "up"),
        (r"\bgo\s+down\b|\btake\s+the\s+(stairs|elevator)\s+down\b", "down"),
        (r"\benter\b", "enter"),
        (r"\bstop\b|\byou\s+have\s+arrived\b|\bdestination\b", "stop"),
    ],
    "hi": [
        (r"दाएं\s*मुड़ें", "turn_right"),
        (r"बाएं\s*मुड़ें", "turn_left"),
        (r"सीधे\s*आगे\s*बढ़ें|आगे\s*बढ़ें", "forward"),
        (r"वापस\s*मुड़ें", "turn_around"),
        (r"ऊपर\s*जाएं", "up"),
        (r"नीचे\s*जाएं", "down"),
        (r"रुकें|पहुंच\s*गए", "stop"),
    ],
    "es": [
        (r"\bgire\s+a\s+la\s+derecha\b|\btome\s+la\s+derecha\b", "turn_right"),
        (r"\bgire\s+a\s+la\s+izquierda\b|\btome\s+la\s+izquierda\b", "turn_left"),
        (r"\bvaya\s+recto\b|\bsiga\s+recto\b|\bcamine\s+hacia\s+adelante\b", "forward"),
        (r"\bdé\s+la\s+vuelta\b|\bregrese\b", "turn_around"),
        (r"\bsuba\b|\bsuba\s+las\s+escaleras\b", "up"),
        (r"\bbaje\b|\bbaje\s+las\s+escaleras\b", "down"),
        (r"\bdeténgase\b|\bha\s+llegado\b", "stop"),
    ],
    "fr": [
        (r"\btournez\s+à\s+droite\b", "turn_right"),
        (r"\btournez\s+à\s+gauche\b", "turn_left"),
        (r"\ballez\s+tout\s+droit\b|\bavancez\b", "forward"),
        (r"\bdemi.tour\b|\bretournez\b", "turn_around"),
        (r"\bmontez\b", "up"),
        (r"\bdescendez\b", "down"),
        (r"\barrêtez.vous\b|\bvous\s+êtes\s+arrivé\b", "stop"),
    ],
    "zh": [
        (r"右转", "turn_right"),
        (r"左转", "turn_left"),
        (r"直行|向前走", "forward"),
        (r"掉头|返回", "turn_around"),
        (r"上楼|向上", "up"),
        (r"下楼|向下", "down"),
        (r"停止|到达", "stop"),
    ],
    "de": [
        (r"\bbiegen\s+Sie\s+rechts\s+ab\b|\brechts\s+abbiegen\b", "turn_right"),
        (r"\bbiegen\s+Sie\s+links\s+ab\b|\blinks\s+abbiegen\b", "turn_left"),
        (r"\bgehen\s+Sie\s+geradeaus\b|\bvorwärts\s+gehen\b", "forward"),
        (r"\bumkehren\b|\bzurückgehen\b", "turn_around"),
        (r"\bhochgehen\b|\btreppe\s+hinauf\b", "up"),
        (r"\bhuntergehen\b|\btreppe\s+hinunter\b", "down"),
        (r"\bhalten\s+Sie\b|\bsie\s+sind\s+angekommen\b", "stop"),
    ],
    "pt": [
        (r"\bvire\s+à\s+direita\b", "turn_right"),
        (r"\bvire\s+à\s+esquerda\b", "turn_left"),
        (r"\bvá\s+em\s+frente\b|\bcaminhe\s+para\s+frente\b", "forward"),
        (r"\bvolte\b|\bretorne\b", "turn_around"),
        (r"\bsuba\b", "up"),
        (r"\bdesca\b", "down"),
        (r"\bpare\b|\bchegou\b", "stop"),
    ],
}

# Spatial relationship words (English + multilingual)
_SPATIAL_PATTERNS = [
    (r"\bafter\b", "after"),
    (r"\bbefore\b", "before"),
    (r"\bnext\s+to\b|\bbeside\b|\badjacent\s+to\b", "beside"),
    (r"\bopposite\b|\bacross\s+from\b", "opposite"),
    (r"\bat\s+the\s+end\s+of\b", "at_end"),
    (r"\bpast\b|\bbeyond\b", "past"),
    (r"\bat\b", "at"),
    # Hindi
    (r"के\s*पास", "beside"),
    (r"के\s*बाद", "after"),
    # Spanish
    (r"\bdespués\s+de\b", "after"),
    (r"\bantes\s+de\b", "before"),
    (r"\bjunto\s+a\b|\bal\s+lado\s+de\b", "beside"),
]


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

@dataclass
class SpatialConstraint:
    relation: str
    landmark: str
    action: str


@dataclass
class ParsedInstruction:
    language: str
    confidence: float
    original_text: str
    initial_direction: str
    landmarks: List[str]
    spatial_constraints: List[SpatialConstraint]
    destination: Optional[str]
    ordered_waypoints: List[str]
    embedding: List[float]
    ambiguity_score: float

    def to_dict(self) -> Dict[str, Any]:
        return {
            "language": self.language,
            "confidence": self.confidence,
            "original_text": self.original_text,
            "initial_direction": self.initial_direction,
            "landmarks": self.landmarks,
            "spatial_constraints": [
                {"relation": sc.relation, "landmark": sc.landmark, "action": sc.action}
                for sc in self.spatial_constraints
            ],
            "destination": self.destination,
            "ordered_waypoints": self.ordered_waypoints,
            "embedding": self.embedding,
            "ambiguity_score": self.ambiguity_score,
        }


# ---------------------------------------------------------------------------
# Main parser
# ---------------------------------------------------------------------------

class InstructionParser:
    """
    Parses multilingual navigation instructions into structured
    ``ParsedInstruction`` objects.

    Strategy:
    1. Detect language via langdetect.
    2. Extract landmarks, directions, spatial relations using per-language
       regex tables.
    3. Generate a dense embedding via MultilingualEncoder (sentence-transformers
       or TF-IDF fallback).
    4. Compute an ambiguity score based on conflicting / missing cues.
    """

    def __init__(self, encoder: Optional[MultilingualEncoder] = None) -> None:
        self._encoder = encoder or MultilingualEncoder()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def parse(self, text: str, lang: Optional[str] = None) -> ParsedInstruction:
        """Parse *text* and return a ``ParsedInstruction``."""
        if lang and is_supported_language(lang):
            detected_lang = lang
            conf = 1.0
        else:
            detected_lang, conf = detect_with_confidence(text)
            if not is_supported_language(detected_lang):
                detected_lang = "en"
        lang = detected_lang


        landmarks = self._extract_landmarks(text, lang)
        directions = self._extract_directions(text, lang)
        spatial_constraints = self._extract_spatial_constraints(text, lang, landmarks, directions)
        initial_direction = directions[0] if directions else "forward"
        destination = self._infer_destination(text, landmarks, lang)
        waypoints = self._build_waypoints(landmarks, destination)
        embedding = self._encoder.encode(text).tolist()
        ambiguity = self._compute_ambiguity(landmarks, directions, spatial_constraints, conf)

        return ParsedInstruction(
            language=lang,
            confidence=conf,
            original_text=text,
            initial_direction=initial_direction,
            landmarks=landmarks,
            spatial_constraints=spatial_constraints,
            destination=destination,
            ordered_waypoints=waypoints,
            embedding=embedding,
            ambiguity_score=ambiguity,
        )

    # ------------------------------------------------------------------
    # Private extraction helpers
    # ------------------------------------------------------------------

    def _extract_landmarks(self, text: str, lang: str) -> List[str]:
        patterns = _LANDMARK_PATTERNS.get(lang, _LANDMARK_PATTERNS["en"])
        found: List[str] = []
        for pat in patterns:
            for m in re.finditer(pat, text, re.IGNORECASE):
                raw = m.group(0).strip().lower()
                # Normalise spaces → underscores for node id compatibility
                normalised = re.sub(r"\s+", "_", raw)
                if normalised not in found:
                    found.append(normalised)
        return found

    def _extract_directions(self, text: str, lang: str) -> List[str]:
        pairs = _DIRECTION_PATTERNS.get(lang, _DIRECTION_PATTERNS["en"])
        # Also always try English if lang != en (many instructions mix languages)
        if lang != "en":
            pairs = pairs + _DIRECTION_PATTERNS["en"]
        found: List[str] = []
        for pat, label in pairs:
            if re.search(pat, text, re.IGNORECASE):
                if label not in found:
                    found.append(label)
        return found

    def _extract_spatial_constraints(
        self,
        text: str,
        lang: str,
        landmarks: List[str],
        directions: List[str],
    ) -> List[SpatialConstraint]:
        constraints: List[SpatialConstraint] = []
        if not landmarks:
            return constraints

        for spat_pat, relation in _SPATIAL_PATTERNS:
            for m in re.finditer(spat_pat, text, re.IGNORECASE):
                # Find the nearest landmark after the spatial keyword
                tail = text[m.end():]
                for lm in landmarks:
                    readable = lm.replace("_", " ")
                    if re.search(re.escape(readable), tail, re.IGNORECASE):
                        action = directions[-1] if directions else "move_forward"
                        constraints.append(
                            SpatialConstraint(
                                relation=relation,
                                landmark=lm,
                                action=action,
                            )
                        )
                        break  # one constraint per spatial keyword occurrence
        return constraints

    def _infer_destination(
        self, text: str, landmarks: List[str], lang: str
    ) -> Optional[str]:
        """Heuristically identify the final destination from the text."""
        # Patterns that signal destination
        dest_patterns = [
            r"(?:enter|reach|arrive\s+at|go\s+to|head\s+to|navigate\s+to)\s+(?:the\s+)?([a-z_\s]+)",
            r"(?:destination\s+is|your\s+goal\s+is)\s+(?:the\s+)?([a-z_\s]+)",
        ]
        for pat in dest_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                raw = m.group(1).strip().lower()
                return re.sub(r"\s+", "_", raw)
        # Fallback: last landmark is usually the destination
        return landmarks[-1] if landmarks else None

    def _build_waypoints(
        self, landmarks: List[str], destination: Optional[str]
    ) -> List[str]:
        waypoints = list(landmarks)
        if destination and destination not in waypoints:
            waypoints.append(destination)
        return waypoints

    def _compute_ambiguity(
        self,
        landmarks: List[str],
        directions: List[str],
        constraints: List[SpatialConstraint],
        lang_confidence: float,
    ) -> float:
        score = 0.0
        if not landmarks:
            score += 0.4
        if not directions:
            score += 0.3
        if not constraints:
            score += 0.1
        if lang_confidence < 0.6:
            score += 0.2
        return min(score, 1.0)
