from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.schemas.response import IndexResponse, IndexHistoryResponse
from app.services.index_engine import calculate_index, get_index_history

router = APIRouter(prefix="/index", tags=["Airfare Price Index"])

@router.get("", response_model=IndexResponse, summary="Calculate Real-Time Weighted Airfare Index")
def get_airfare_index(
    target_date: Optional[date] = Query(None, description="Observation target date (defaults to latest available)"),
    base_date: Optional[date] = Query(None, description="Base comparison date (defaults to earliest available)"),
    advance_purchase: int = Query(7, ge=0, description="Advance purchase window in days (default: 7)"),
    db: Session = Depends(get_db)
):
    """
    Calculate APIx = 100 × Σ(normalized DGCA weight × route price relative).
    Routes must have clean fares in both the base and target periods. Official
    weights are renormalized over that matched basket, and coverage reports the
    original DGCA weight represented before renormalization.
    """
    return calculate_index(
        db=db,
        base_date=base_date,
        target_date=target_date,
        advance_purchase_days=advance_purchase
    )

@router.get("/history", response_model=IndexHistoryResponse, summary="Get Daily Price Index Time Series")
def get_airfare_index_history(
    start_date: Optional[date] = Query(None, description="Start date of historical window"),
    end_date: Optional[date] = Query(None, description="End date of historical window"),
    advance_purchase: int = Query(7, ge=0, description="Advance purchase window in days"),
    db: Session = Depends(get_db)
):
    """
    Retrieve historical daily Airfare Price Index time series.
    """
    return get_index_history(
        db=db,
        start_date=start_date,
        end_date=end_date,
        advance_purchase_days=advance_purchase
    )
