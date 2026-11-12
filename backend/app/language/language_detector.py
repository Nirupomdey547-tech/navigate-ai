"""
Language detection module wrapping langdetect.
Provides ISO 639-1 language codes with confidence scores.
"""
from __future__ import annotations

import logging
from typing import Tuple

logger = logging.getLogger(__name__)

SUPPORTED_LANGUAGES: dict[str, str] = {
    "en": "English",
    "hi": "Hindi",
    "es": "Spanish",
    "fr": "French",
    "zh": "Chinese",
    "de": "German",
    "pt": "Portuguese",
}

_LANGDETECT_AVAILABLE = False
try:
    from langdetect import detect as _ld_detect, detect_langs as _ld_detect_langs
    from langdetect.lang_detect_exception import LangDetectException
    _LANGDETECT_AVAILABLE = True
except ImportError:
    logger.warning("langdetect not installed – language detection will default to 'en'.")


def detect(text: str) -> str:
    """Return ISO 639-1 language code for *text*. Falls back to 'en' on failure."""
    code, _ = detect_with_confidence(text)
    return code


def detect_with_confidence(text: str) -> Tuple[str, float]:
    """
    Return (iso_code, confidence) for *text*.

    If langdetect is unavailable or detection fails the function returns
    ('en', 0.0) so callers can always unpack two values safely.
    """
    if not _LANGDETECT_AVAILABLE or not text or not text.strip():
        return "en", 0.0

    try:
        probabilities = _ld_detect_langs(text)
        if not probabilities:
            return "en", 0.0

        best = probabilities[0]
        lang_code = best.lang
        confidence = float(best.prob)

        # Normalize zh-* variants
        if lang_code.startswith("zh"):
            lang_code = "zh"

        return lang_code, confidence

    except Exception as exc:  # noqa: BLE001
        logger.debug("Language detection failed (%s); defaulting to 'en'.", exc)
        return "en", 0.0


def is_supported_language(lang: str) -> bool:
    """Return True if *lang* is in the supported language set."""
    code = lang.lower().split("-")[0]  # strip regional subtags
    return code in SUPPORTED_LANGUAGES
