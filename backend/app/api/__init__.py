from app.api.health import router as health_router
from app.api.routes import router as routes_router
from app.api.index import router as index_router
from app.api.analytics import router as analytics_router
from app.api.ingest import router as ingest_router

__all__ = [
    "health_router",
    "routes_router",
    "index_router",
    "analytics_router",
    "ingest_router",
]
