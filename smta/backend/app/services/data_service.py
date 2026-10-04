"""Central data service.

Holds the current in-memory dataset (a simple, dependency-free stand-in for
a real database, which is enough for a project demo) and all derived
analytics: KPIs, trends, sentiment breakdown, topic clusters, engagement
series. Every route imports the shared `data_service` singleton below.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import datetime

from app.config import settings
from app.ml.pipeline import MLPipeline
from app.services.social_api_client import fetch_posts


class DataService:
    def __init__(self):
        self.pipeline = MLPipeline(n_topic_clusters=6)
        self.posts: list[dict] = []
        self.mode: str = "demo"
        self.last_update: datetime | None = None
        self._load_initial_data()

    # ------------------------------------------------------------------ #
    # Data loading
    # ------------------------------------------------------------------ #
    def _load_initial_data(self):
        raw_posts, mode = fetch_posts(max_results=settings.demo_data_size)
        self.posts = self.pipeline.run(raw_posts)
        self.mode = mode
        self.last_update = datetime.utcnow()

    def fetch_new_data(self, query: str = "trending", max_results: int = 40) -> dict:
        raw_posts, mode = fetch_posts(query=query, max_results=max_results)
        enriched = self.pipeline.run(raw_posts)
        existing_ids = {p["id"] for p in self.posts}
        new_posts = [p for p in enriched if p["id"] not in existing_ids]

        self.posts = new_posts + self.posts
        self.mode = mode
        self.last_update = datetime.utcnow()
        return {
            "status": "success",
            "new_posts": len(new_posts),
            "total_posts": len(self.posts),
            "last_update": self.last_update,
            "mode": self.mode,
        }

    # ------------------------------------------------------------------ #
    # Helpers
    # ------------------------------------------------------------------ #
    @staticmethod
    def _engagement(post: dict) -> int:
        return post["likes"] + post["comments"] + post["shares"]

    def api_status(self) -> dict:
        return {
            "connected": True,
            "mode": self.mode,
            "last_successful_request": self.last_update,
            "records_collected": len(self.posts),
        }

    # ------------------------------------------------------------------ #
    # Dashboard / KPIs
    # ------------------------------------------------------------------ #
    def dashboard_summary(self) -> dict:
        posts = self.posts
        total_posts = len(posts)
        total_engagement = sum(self._engagement(p) for p in posts)
        sentiment_counts = self.sentiment_breakdown()
        trending = self.trends(limit=5)

        return {
            "mode": self.mode,
            "last_update": self.last_update,
            "kpis": {
                "total_posts": total_posts,
                "total_engagement": total_engagement,
                "trending_topics": len(self.topic_clusters()),
                "positive_sentiment_pct": sentiment_counts["positive_pct"],
                "negative_sentiment_pct": sentiment_counts["negative_pct"],
                "neutral_sentiment_pct": sentiment_counts["neutral_pct"],
            },
            "engagement_over_time": self.engagement_over_time(),
            "sentiment_breakdown": sentiment_counts,
            "top_hashtags": self.top_hashtags(limit=8),
            "trending_topics": trending,
            "platform_distribution": self.platform_distribution(),
        }

    # ------------------------------------------------------------------ #
    # Sentiment
    # ------------------------------------------------------------------ #
    def sentiment_breakdown(self) -> dict:
        total = len(self.posts) or 1
        counts = {"positive": 0, "negative": 0, "neutral": 0}
        for p in self.posts:
            counts[p["sentiment"]] = counts.get(p["sentiment"], 0) + 1
        return {
            "positive": counts["positive"],
            "negative": counts["negative"],
            "neutral": counts["neutral"],
            "positive_pct": round(100 * counts["positive"] / total, 1),
            "negative_pct": round(100 * counts["negative"] / total, 1),
            "neutral_pct": round(100 * counts["neutral"] / total, 1),
        }

    def sentiment_table(self) -> list[dict]:
        return [
            {
                "id": p["id"],
                "post": p["text"],
                "sentiment": p["sentiment"],
                "confidence": p["sentiment_confidence"],
                "hashtags": p["hashtags"],
                "created_at": p["created_at"],
            }
            for p in self.posts
        ]

    # ------------------------------------------------------------------ #
    # Topics
    # ------------------------------------------------------------------ #
    def topic_clusters(self) -> list[dict]:
        grouped: dict[int, list[dict]] = defaultdict(list)
        for p in self.posts:
            grouped[p["topic_cluster"]].append(p)

        clusters = []
        for cluster_id, group in grouped.items():
            sentiments = [p["sentiment"] for p in group]
            dominant = max(set(sentiments), key=sentiments.count) if sentiments else "neutral"
            clusters.append({
                "cluster": cluster_id,
                "label": self.pipeline.cluster_label(cluster_id),
                "keywords": self.pipeline.cluster_keywords(cluster_id),
                "posts": len(group),
                "engagement": sum(self._engagement(p) for p in group),
                "dominant_sentiment": dominant,
                "sample_posts": [
                    {
                        "id": p["id"],
                        "text": p["text"][:140] + ("…" if len(p["text"]) > 140 else ""),
                        "author": p["author"],
                        "platform": p["platform"],
                        "url": p.get("url", ""),
                        "engagement": self._engagement(p),
                    }
                    for p in sorted(group, key=self._engagement, reverse=True)[:3]
                ],
            })
        clusters.sort(key=lambda c: c["posts"], reverse=True)
        return clusters

    # ------------------------------------------------------------------ #
    # Trends / hashtags
    # ------------------------------------------------------------------ #
    def top_hashtags(self, limit: int = 10) -> list[dict]:
        counts: dict[str, int] = defaultdict(int)
        engagement: dict[str, int] = defaultdict(int)
        for p in self.posts:
            for tag in p["hashtags"]:
                counts[tag] += 1
                engagement[tag] += self._engagement(p)
        ranked = sorted(counts.items(), key=lambda kv: kv[1], reverse=True)[:limit]
        return [{"hashtag": tag, "posts": count, "engagement": engagement[tag]} for tag, count in ranked]

    def trends(self, limit: int = 15) -> list[dict]:
        hashtags = self.top_hashtags(limit=limit)
        results = []
        for i, h in enumerate(hashtags, start=1):
            tag_posts = [p for p in self.posts if h["hashtag"] in p["hashtags"]]
            sentiments = [p["sentiment"] for p in tag_posts]
            dominant = max(set(sentiments), key=sentiments.count) if sentiments else "neutral"

            # Sparkline: post counts bucketed into 8 sequential windows.
            buckets = [0] * 8
            if tag_posts:
                sorted_posts = sorted(tag_posts, key=lambda p: p["created_at"])
                bucket_size = max(1, len(sorted_posts) // 8)
                for idx, p in enumerate(sorted_posts):
                    b = min(7, idx // bucket_size)
                    buckets[b] += 1

            trend_pct = round(((buckets[-1] - buckets[0]) / (buckets[0] or 1)) * 100, 1)

            results.append({
                "rank": i,
                "hashtag": h["hashtag"],
                "posts": h["posts"],
                "engagement": h["engagement"],
                "sentiment": dominant,
                "trend_pct": trend_pct,
                "sparkline": buckets,
            })
        return results

    # ------------------------------------------------------------------ #
    # Engagement
    # ------------------------------------------------------------------ #
    def engagement_over_time(self) -> list[dict]:
        by_day: dict[str, dict] = defaultdict(lambda: {"likes": 0, "comments": 0, "shares": 0})
        for p in self.posts:
            day = p["created_at"].strftime("%Y-%m-%d")
            by_day[day]["likes"] += p["likes"]
            by_day[day]["comments"] += p["comments"]
            by_day[day]["shares"] += p["shares"]
        return [
            {"date": day, **vals}
            for day, vals in sorted(by_day.items())
        ]

    def engagement_by_weekday(self) -> list[dict]:
        totals = defaultdict(int)
        counts = defaultdict(int)
        for p in self.posts:
            weekday = p["created_at"].strftime("%a")
            totals[weekday] += self._engagement(p)
            counts[weekday] += 1
        order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        return [
            {"day": d, "avg_engagement": round(totals[d] / counts[d], 1) if counts[d] else 0}
            for d in order
        ]

    def top_posts(self, limit: int = 10) -> list[dict]:
        ranked = sorted(self.posts, key=self._engagement, reverse=True)[:limit]
        return [self._serialize_post(p) for p in ranked]

    def scatter_points(self) -> list[dict]:
        return [{"likes": p["likes"], "comments": p["comments"], "sentiment": p["sentiment"]} for p in self.posts]

    def platform_distribution(self) -> list[dict]:
        counts = defaultdict(int)
        for p in self.posts:
            counts[p["platform"]] += 1
        return [{"platform": k, "posts": v} for k, v in counts.items()]

    # ------------------------------------------------------------------ #
    # Posts table
    # ------------------------------------------------------------------ #
    @staticmethod
    def _serialize_post(p: dict) -> dict:
        return {
            "id": p["id"],
            "text": p["text"],
            "url": p.get("url", ""),
            "platform": p["platform"],
            "created_at": p["created_at"],
            "hashtags": p["hashtags"],
            "likes": p["likes"],
            "comments": p["comments"],
            "shares": p["shares"],
            "engagement": p["likes"] + p["comments"] + p["shares"],
            "sentiment": p["sentiment"],
            "sentiment_confidence": p["sentiment_confidence"],
            "topic": p["topic_label"],
        }

    def list_posts(
        self,
        search: str = "",
        sentiment: str = "",
        topic: str = "",
        sort_by: str = "created_at",
        sort_dir: str = "desc",
        page: int = 1,
        page_size: int = 20,
    ) -> dict:
        rows = [self._serialize_post(p) for p in self.posts]

        if search:
            s = search.lower()
            rows = [r for r in rows if s in r["text"].lower() or any(s in h.lower() for h in r["hashtags"])]
        if sentiment:
            rows = [r for r in rows if r["sentiment"] == sentiment]
        if topic:
            rows = [r for r in rows if r["topic"] == topic]

        reverse = sort_dir == "desc"
        try:
            rows.sort(key=lambda r: r[sort_by], reverse=reverse)
        except (KeyError, TypeError):
            rows.sort(key=lambda r: r["created_at"], reverse=reverse)

        total = len(rows)
        start = (page - 1) * page_size
        page_rows = rows[start:start + page_size]

        return {
            "results": page_rows,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, -(-total // page_size)),
        }


# Single shared instance used by every route (simple in-process "database").
data_service = DataService()
