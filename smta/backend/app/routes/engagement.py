from fastapi import APIRouter, Query
from app.services.data_service import data_service

router = APIRouter(prefix="/api", tags=["engagement"])


@router.get("/engagement")
def get_engagement(top_n: int = Query(10, ge=1, le=50)):
    return {
        "mode": data_service.mode,
        "over_time": data_service.engagement_over_time(),
        "by_weekday": data_service.engagement_by_weekday(),
        "top_posts": data_service.top_posts(limit=top_n),
        "scatter": data_service.scatter_points(),
    }
