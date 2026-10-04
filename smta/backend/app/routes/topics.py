from fastapi import APIRouter
from app.services.data_service import data_service

router = APIRouter(prefix="/api", tags=["topics"])


@router.get("/topics")
def get_topics():
    return {"mode": data_service.mode, "clusters": data_service.topic_clusters()}
