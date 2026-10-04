"""Topic / trend detection model: TfidfVectorizer -> KMeans.

Swappable the same way as SentimentModel: fit(texts) then predict(texts),
plus a helper to describe each cluster with its top keywords.
"""
from __future__ import annotations

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans

from app.ml.preprocessing import preprocess_batch


class TopicModel:
    def __init__(self, n_clusters: int = 6, random_state: int = 42):
        self.n_clusters = n_clusters
        self.vectorizer = TfidfVectorizer(max_features=4000, ngram_range=(1, 2), min_df=1)
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=random_state, n_init=10)
        self._is_fitted = False
        self._feature_names: np.ndarray | None = None

    def fit(self, texts: list[str]) -> "TopicModel":
        cleaned = preprocess_batch(texts)
        X = self.vectorizer.fit_transform(cleaned)
        self.kmeans.fit(X)
        self._feature_names = np.array(self.vectorizer.get_feature_names_out())
        self._is_fitted = True
        return self

    def predict(self, texts: list[str]) -> list[int]:
        if not self._is_fitted:
            raise RuntimeError("TopicModel must be fit() before predict().")
        cleaned = preprocess_batch(texts)
        X = self.vectorizer.transform(cleaned)
        return [int(c) for c in self.kmeans.predict(X)]

    def top_keywords(self, cluster_id: int, top_n: int = 5) -> list[str]:
        centroid = self.kmeans.cluster_centers_[cluster_id]
        top_idx = centroid.argsort()[::-1][:top_n]
        return list(self._feature_names[top_idx])

    def label_cluster(self, cluster_id: int) -> str:
        """Turn top keywords into a human-readable topic label."""
        keywords = self.top_keywords(cluster_id, top_n=2)
        return " & ".join(k.title() for k in keywords) if keywords else f"Topic {cluster_id}"
