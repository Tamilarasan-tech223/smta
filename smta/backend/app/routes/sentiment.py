from fastapi import APIRouter
from app.services.data_service import data_service

router = APIRouter(prefix="/api", tags=["sentiment"])


@router.get("/sentiment")
def get_sentiment():
    return {
        "mode": data_service.mode,
        "breakdown": data_service.sentiment_breakdown(),
        "posts": data_service.sentiment_table(),
    }
