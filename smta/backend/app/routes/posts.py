from fastapi import APIRouter, Query
from app.services.data_service import data_service

router = APIRouter(prefix="/api", tags=["posts"])


@router.get("/posts")
def get_posts(
    search: str = "",
    sentiment: str = "",
    topic: str = "",
    sort_by: str = "created_at",
    sort_dir: str = "desc",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
):
    return data_service.list_posts(
        search=search,
        sentiment=sentiment,
        topic=topic,
        sort_by=sort_by,
        sort_dir=sort_dir,
        page=page,
        page_size=page_size,
    )
