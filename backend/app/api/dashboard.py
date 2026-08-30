from fastapi import APIRouter, Depends
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.database.db import SessionLocal, engine, get_db
from app.services.live_dashboard import get_cached_live_dashboard


router = APIRouter(prefix="/dashboard", tags=["Live Dashboard"])


@router.get("/live", summary="Get all live frontend data from persisted fare observations")
def live_dashboard(db: Session = Depends(get_db)):
    try:
        return get_cached_live_dashboard(db)
    except OperationalError as exc:
        # Serverless PostgreSQL may invalidate an already-pooled connection
        # during a database restart/replacement. Psycopg reports this specific
        # case as `ProtocolViolation: database removed`, which SQLAlchemy does
        # not always classify as a disconnect for pool_pre_ping.
        if "database removed" not in str(exc).lower():
            raise
        db.rollback()
        engine.dispose()
        with SessionLocal() as retry_db:
            return get_cached_live_dashboard(retry_db)
