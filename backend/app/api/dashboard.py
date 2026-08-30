import os
from threading import Lock
from time import monotonic

from fastapi import APIRouter, Depends, Response
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.database.db import SessionLocal, engine, get_db
from app.services.live_dashboard import build_live_dashboard


router = APIRouter(prefix="/dashboard", tags=["Live Dashboard"])


def _cache_ttl_seconds() -> int:
    try:
        configured = int(os.getenv("DASHBOARD_CACHE_TTL_SECONDS", "60"))
    except ValueError:
        configured = 60
    return max(60, configured)


CACHE_TTL_SECONDS = _cache_ttl_seconds()
_cache_lock = Lock()
_cached_payload: dict | None = None
_cached_at = 0.0


def _build_with_reconnect(db: Session) -> dict:
    """Retry once when serverless PostgreSQL removes a pooled database connection."""
    try:
        return build_live_dashboard(db)
    except OperationalError as exc:
        if "database removed" not in str(exc).lower():
            raise
        try:
            db.rollback()
        except OperationalError:
            pass
        engine.dispose()
        with SessionLocal() as retry_db:
            return build_live_dashboard(retry_db)


@router.get("/live", summary="Get all live frontend data from persisted fare observations")
def live_dashboard(response: Response, db: Session = Depends(get_db)):
    """Return one shared dashboard snapshot for the configured refresh window.

    The lock coalesces simultaneous cache misses, preventing several browser
    sessions from running the memory-intensive dashboard aggregation at once.
    """
    global _cached_at, _cached_payload

    response.headers["Cache-Control"] = f"public, max-age={CACHE_TTL_SECONDS}, stale-while-revalidate=60"
    now = monotonic()
    if _cached_payload is not None and now - _cached_at < CACHE_TTL_SECONDS:
        response.headers["X-VAYUSETU-Cache"] = "HIT"
        return _cached_payload

    with _cache_lock:
        now = monotonic()
        if _cached_payload is not None and now - _cached_at < CACHE_TTL_SECONDS:
            response.headers["X-VAYUSETU-Cache"] = "HIT"
            return _cached_payload

        payload = _build_with_reconnect(db)
        _cached_payload = payload
        _cached_at = monotonic()
        response.headers["X-VAYUSETU-Cache"] = "MISS"
        return payload
