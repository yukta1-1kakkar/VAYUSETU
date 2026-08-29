from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.services.live_dashboard import build_live_dashboard


router = APIRouter(prefix="/dashboard", tags=["Live Dashboard"])


@router.get("/live", summary="Get all live frontend data from persisted fare observations")
def live_dashboard(db: Session = Depends(get_db)):
    return build_live_dashboard(db)
