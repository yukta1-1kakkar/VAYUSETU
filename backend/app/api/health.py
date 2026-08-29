from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.db import get_db
from app.schemas.response import HealthResponse

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse, summary="System Health & DB Connectivity Check")
def health_check(db: Session = Depends(get_db)):
    """
    Check backend API health status and verify SQLite database connection.
    """
    try:
        # Ping SQLite database
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"disconnected: {str(e)}"

    return HealthResponse(status="ok", database=db_status)
