from fastapi import APIRouter, Query
from app.services.data_service import data_service

router = APIRouter(prefix="/api", tags=["trends"])


@router.get("/trends")
def get_trends(limit: int = Query(15, ge=1, le=100)):
    return {"mode": data_service.mode, "trends": data_service.trends(limit=limit)}
