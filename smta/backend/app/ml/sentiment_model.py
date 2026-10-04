"""Sentiment analysis model: TfidfVectorizer -> LogisticRegression.

Designed to be swappable: anything that implements `fit(texts, labels)` and
`predict(texts) -> list[(label, confidence)]` can replace this class without
touching the rest of the app (see services/data_service.py).
"""
from __future__ import annotations

import random
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

from app.ml.preprocessing import preprocess_batch

LABELS = ["positive", "negative", "neutral"]

# Small hand-written seed corpus used to train the demo model. In a
# production setting this would be replaced by a labeled dataset pulled
# from real, human-annotated social posts.
_POSITIVE_SEEDS = [
    "absolutely loving this new update, works so smoothly",
    "this is amazing news, so excited for what's next",
    "great job by the team, really impressed with the results",
    "best product launch I've seen this year, well done",
    "such a helpful feature, made my day so much easier",
    "incredible performance improvements, super happy with this",
    "this made me smile, wonderful experience overall",
    "fantastic support from the community, thank you all",
    "really proud of how far this project has come",
    "this is exactly what I needed, works perfectly",
    "love the new design, looks clean and modern",
    "huge win for everyone involved, congratulations",
    "the results exceeded my expectations, brilliant work",
    "so grateful for this opportunity, feeling positive today",
    "this trend is inspiring so many people to build cool things",
]
_NEGATIVE_SEEDS = [
    "this update broke everything, extremely frustrating",
    "worst experience ever, completely disappointed",
    "nothing works as promised, feeling ripped off",
    "the service went down again, unacceptable at this point",
    "really angry about how this was handled",
    "this is a scam, do not trust this company",
    "terrible customer support, waited hours for nothing",
    "the app keeps crashing, so annoying",
    "this decision makes no sense and hurts everyone",
    "such a waste of money, regret buying this",
    "the quality has gone downhill, very disappointing",
    "i am furious about the latest changes",
    "this bug has been ignored for months, ridiculous",
    "horrible experience, would not recommend to anyone",
    "the outage cost us so much time, very upset",
]
_NEUTRAL_SEEDS = [
    "here is a quick summary of today's announcement",
    "the meeting is scheduled for 3pm tomorrow",
    "this article explains how the new system works",
    "posting an update on the current project status",
    "the report covers quarterly numbers across regions",
    "here's a thread on how the feature was built",
    "the conference will be held next month in the city",
    "sharing some notes from the recent workshop",
    "the dataset includes records from the last six months",
    "this guide walks through the setup process step by step",
    "an overview of the changes included in this release",
    "the survey results will be published next week",
    "here is the schedule for the upcoming event",
    "a brief explainer on how the algorithm works",
    "the documentation has been updated with new examples",
]


def _build_seed_dataset(n_per_class: int = 40) -> tuple[list[str], list[str]]:
    """Expand the hand-written seeds into a larger synthetic training set
    by recombining short fragments, so the classifier sees more variety."""
    rng = random.Random(42)
    texts, labels = [], []
    for label, seeds in (
        ("positive", _POSITIVE_SEEDS),
        ("negative", _NEGATIVE_SEEDS),
        ("neutral", _NEUTRAL_SEEDS),
    ):
        for _ in range(n_per_class):
            base = rng.choice(seeds)
            extra = rng.choice(seeds)
            text = base if rng.random() < 0.6 else f"{base}. {extra}"
            texts.append(text)
            labels.append(label)
    return texts, labels


class SentimentModel:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=3000, ngram_range=(1, 2))
        self.classifier = LogisticRegression(max_iter=1000, C=2.0)
        self._is_fitted = False

    def fit(self, texts: list[str] | None = None, labels: list[str] | None = None) -> "SentimentModel":
        if texts is None or labels is None:
            texts, labels = _build_seed_dataset()
        cleaned = preprocess_batch(texts)
        X = self.vectorizer.fit_transform(cleaned)
        self.classifier.fit(X, labels)
        self._is_fitted = True
        return self

    def predict(self, texts: list[str]) -> list[tuple[str, float]]:
        if not self._is_fitted:
            self.fit()
        cleaned = preprocess_batch(texts)
        X = self.vectorizer.transform(cleaned)
        probs = self.classifier.predict_proba(X)
        classes = self.classifier.classes_
        results = []
        for row in probs:
            best_idx = row.argmax()
            results.append((classes[best_idx], float(row[best_idx])))
        return results

    def predict_one(self, text: str) -> tuple[str, float]:
        return self.predict([text])[0]
