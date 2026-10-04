"""End-to-end ML pipeline:

raw posts -> preprocessing -> TF-IDF -> [LogisticRegression, KMeans]
          -> posts enriched with sentiment + topic cluster
"""
from app.ml.sentiment_model import SentimentModel
from app.ml.topic_model import TopicModel


class MLPipeline:
    def __init__(self, n_topic_clusters: int = 6):
        self.sentiment_model = SentimentModel().fit()
        self.topic_model = TopicModel(n_clusters=n_topic_clusters)
        self._cluster_labels: dict[int, str] = {}
        self._cluster_keywords: dict[int, list[str]] = {}

    def run(self, posts: list[dict]) -> list[dict]:
        """Mutates and returns `posts` with sentiment + topic fields added."""
        texts = [p["text"] for p in posts]

        try:
            sentiments = self.sentiment_model.predict(texts)
        except Exception:
            sentiments = [("neutral", 0.5) for _ in texts]

        try:
            self.topic_model.fit(texts)
            clusters = self.topic_model.predict(texts)
            for c in set(clusters):
                self._cluster_labels[c] = self.topic_model.label_cluster(c)
                self._cluster_keywords[c] = self.topic_model.top_keywords(c)
        except Exception:
            clusters = [0 for _ in texts]
            self._cluster_labels = {0: "General Discussion"}
            self._cluster_keywords = {0: []}

        for post, (label, conf), cluster in zip(posts, sentiments, clusters):
            post["sentiment"] = label
            post["sentiment_confidence"] = round(conf, 4)
            post["topic_cluster"] = cluster
            post["topic_label"] = self._cluster_labels.get(cluster, f"Topic {cluster}")

        return posts

    def cluster_keywords(self, cluster_id: int) -> list[str]:
        return self._cluster_keywords.get(cluster_id, [])

    def cluster_label(self, cluster_id: int) -> str:
        return self._cluster_labels.get(cluster_id, f"Topic {cluster_id}")
