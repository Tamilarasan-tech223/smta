from fastapi import APIRouter
from app.services.data_service import data_service

router = APIRouter(prefix="/api", tags=["fetch-data"])


@router.post("/fetch-data")
def fetch_data():
    return data_service.fetch_new_data()


@router.get("/status")
def get_status():
    return data_service.api_status()
