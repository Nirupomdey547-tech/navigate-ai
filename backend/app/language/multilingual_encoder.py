"""
Multilingual embedding module.

Uses sentence-transformers (paraphrase-multilingual-MiniLM-L12-v2) when
available; falls back to TF-IDF based encoding otherwise.
"""
from __future__ import annotations

import logging
from typing import Dict, List, Optional, Tuple

import numpy as np

logger = logging.getLogger(__name__)

_ST_AVAILABLE = False
_TFIDF_AVAILABLE = False

try:
    from sentence_transformers import SentenceTransformer as _SentenceTransformer
    _ST_AVAILABLE = True
except ImportError:
    logger.warning(
        "sentence-transformers not installed – falling back to TF-IDF encoder."
    )

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    _TFIDF_AVAILABLE = True
except ImportError:
    logger.warning("scikit-learn not installed – TF-IDF fallback also unavailable.")

MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"
EMBEDDING_DIM = 384  # output size of the MiniLM model


def _cosine(a: np.ndarray, b: np.ndarray) -> float:
    """Return cosine similarity between two 1-D arrays."""
    denom = np.linalg.norm(a) * np.linalg.norm(b)
    if denom == 0.0:
        return 0.0
    return float(np.dot(a, b) / denom)


class _TFIDFEncoder:
    """Minimal TF-IDF fallback that returns L2-normalised sparse vectors as dense arrays."""

    def __init__(self) -> None:
        self._vec: Optional[TfidfVectorizer] = None
        self._corpus: List[str] = []
        self._dim = 512  # fixed vocabulary cap

    def _fit_or_partial_fit(self, texts: List[str]) -> None:
        self._corpus.extend(texts)
        self._vec = TfidfVectorizer(
            max_features=self._dim, analyzer="char_wb", ngram_range=(2, 4)
        )
        self._vec.fit(self._corpus)

    def encode(self, text: str) -> np.ndarray:
        return self.encode_batch([text])[0]

    def encode_batch(self, texts: List[str]) -> np.ndarray:
        if not _TFIDF_AVAILABLE:
            return np.zeros((len(texts), self._dim), dtype=np.float32)
        if self._vec is None:
            self._fit_or_partial_fit(texts)
        else:
            # Refit if we see new texts
            self._fit_or_partial_fit(texts)
        mat = self._vec.transform(texts).toarray().astype(np.float32)  # type: ignore[union-attr]
        norms = np.linalg.norm(mat, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return mat / norms


class MultilingualEncoder:
    """
    Encodes text into dense embeddings for semantic similarity.

    Preferred backend: sentence-transformers (paraphrase-multilingual-MiniLM-L12-v2).
    Fallback: TF-IDF character n-gram encoder.
    """

    def __init__(self) -> None:
        self._model: Optional[_SentenceTransformer] = None  # type: ignore[name-defined]
        self._fallback: Optional[_TFIDFEncoder] = None
        self._cache: Dict[str, np.ndarray] = {}
        self._using_transformers: bool = False

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _ensure_loaded(self) -> None:
        if self._model is not None or self._fallback is not None:
            return  # already loaded

        if _ST_AVAILABLE:
            try:
                logger.info("Loading sentence-transformers model '%s' …", MODEL_NAME)
                self._model = _SentenceTransformer(MODEL_NAME)
                self._using_transformers = True
                logger.info("sentence-transformers model loaded successfully.")
            except Exception as exc:  # noqa: BLE001
                logger.warning(
                    "Failed to load sentence-transformers model (%s); using TF-IDF fallback.",
                    exc,
                )

        if self._model is None:
            logger.info("Using TF-IDF character n-gram fallback encoder.")
            self._fallback = _TFIDFEncoder()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def encode(self, text: str) -> np.ndarray:
        """Return a 1-D float32 embedding for *text* (cached)."""
        if text in self._cache:
            return self._cache[text]
        result = self.encode_batch([text])[0]
        self._cache[text] = result
        return result

    def encode_batch(self, texts: List[str]) -> np.ndarray:
        """Return a 2-D array of embeddings, one row per text."""
        self._ensure_loaded()
        uncached = [t for t in texts if t not in self._cache]
        if uncached:
            if self._model is not None:
                vecs = self._model.encode(uncached, convert_to_numpy=True)
            else:
                vecs = self._fallback.encode_batch(uncached)  # type: ignore[union-attr]
            for t, v in zip(uncached, vecs):
                self._cache[t] = v.astype(np.float32)
        return np.array([self._cache[t] for t in texts], dtype=np.float32)

    def semantic_similarity(self, emb1: np.ndarray, emb2: np.ndarray) -> float:
        """Cosine similarity in [-1, 1]."""
        return _cosine(emb1.ravel(), emb2.ravel())

    def find_most_similar(
        self,
        query_emb: np.ndarray,
        candidate_embs: np.ndarray,
        candidates: List[str],
    ) -> Tuple[str, float]:
        """
        Return (candidate_text, similarity) for the candidate most similar
        to *query_emb*.
        """
        if not candidates:
            return "", 0.0
        sims = [
            _cosine(query_emb.ravel(), candidate_embs[i].ravel())
            for i in range(len(candidates))
        ]
        best_idx = int(np.argmax(sims))
        return candidates[best_idx], sims[best_idx]

    @property
    def is_using_transformers(self) -> bool:
        """True if the sentence-transformers backend is active."""
        return self._using_transformers
