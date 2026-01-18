from fastapi import APIRouter, Query
from app.services.trend_engine import get_trends

router = APIRouter(prefix="/trends", tags=["Trends"])


@router.get("/")
def fetch_trends(
    category: str | None = Query(default=None),
    limit: int = Query(default=10, ge=5, le=50)
):
    return {
        "success": True,
        "data": get_trends(category=category, limit=limit)
    }

