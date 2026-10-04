from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class Post(BaseModel):
    id: str
    text: str
    url: Optional[str] = ""
    platform: str
    author: str
    created_at: datetime
    likes: int
    comments: int
    shares: int
    hashtags: list[str]
    sentiment: str
    sentiment_confidence: float
    topic_cluster: int
    topic_label: str

    @property
    def engagement(self) -> int:
        return self.likes + self.comments + self.shares


class KPI(BaseModel):
    label: str
    value: float
    unit: str = ""
    change_pct: float = 0.0


class TrendItem(BaseModel):
    rank: int
    hashtag: str
    posts: int
    engagement: int
    sentiment: str
    trend_pct: float
    sparkline: list[int]


class SentimentBreakdown(BaseModel):
    positive: int
    negative: int
    neutral: int
    positive_pct: float
    negative_pct: float
    neutral_pct: float


class PostLink(BaseModel):
    id: str
    text: str
    author: str
    platform: str
    url: str
    engagement: int


class TopicCluster(BaseModel):
    cluster: int
    label: str
    keywords: list[str]
    posts: int
    engagement: int
    dominant_sentiment: str
    sample_posts: list[PostLink] = []


class EngagementPoint(BaseModel):
    date: str
    likes: int
    comments: int
    shares: int


class ApiStatus(BaseModel):
    connected: bool
    mode: str  # "live" | "demo"
    last_successful_request: Optional[datetime]
    records_collected: int


class FetchDataResponse(BaseModel):
    status: str
    new_posts: int
    total_posts: int
    last_update: datetime
    mode: str
