from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.services.backtesting import run_apix_backtest


router = APIRouter(prefix="/backtest", tags=["APIx Backtesting"])


@router.get("", summary="Run the APIx historical backtest")
def get_backtest(
    advance_purchase: int = Query(7, ge=0),
    db: Session = Depends(get_db),
):
    return run_apix_backtest(db, advance_purchase_days=advance_purchase)
