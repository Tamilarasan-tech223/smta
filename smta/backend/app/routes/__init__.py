from fastapi import APIRouter

from app.routes import dashboard, posts, trends, sentiment, topics, engagement, fetch_data

api_router = APIRouter()
api_router.include_router(dashboard.router)
api_router.include_router(posts.router)
api_router.include_router(trends.router)
api_router.include_router(sentiment.router)
api_router.include_router(topics.router)
api_router.include_router(engagement.router)
api_router.include_router(fetch_data.router)
