from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.schemas.response import AnalyticsResponse, FareStatusResponse
from app.services.analytics import get_analytics_summary, get_fare_status

router = APIRouter(tags=["Analytics & Status"])

@router.get("/analytics", response_model=AnalyticsResponse, summary="Get Pricing Analytics & Anomaly Detection")
def get_analytics(
    route_id: Optional[str] = Query(None, description="Optional route filter (e.g. 'DEL-BOM')"),
    db: Session = Depends(get_db)
):
    """
    Retrieve comprehensive airfare price analytics:
    - 7-day route price percentage changes
    - 7-day overall price index change
    - Rolling 7-day average fares
    - Pricing anomaly detection based on statistical Z-scores (|Z| > 2.0)
    """
    r_id = route_id.strip().upper() if route_id else None
    return get_analytics_summary(db=db, route_id=r_id)

@router.get("/fare-status", response_model=FareStatusResponse, summary="Database Fare Data Status & Counts")
def get_status(db: Session = Depends(get_db)):
    """
    Summary of scraped fare observations, active routes, and date coverage in SQLite database.
    """
    return get_fare_status(db=db)
