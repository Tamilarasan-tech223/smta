from fastapi import APIRouter
from app.services.data_service import data_service

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/dashboard")
def get_dashboard():
    return data_service.dashboard_summary()
