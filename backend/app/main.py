from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.db import engine, Base
from app.database import models
from app.api.health import router as health_router
from app.api.routes import router as routes_router
from app.api.index import router as index_router
from app.api.analytics import router as analytics_router
from app.api.ingest import router as ingest_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan hook to create database tables on startup."""
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="VAYUSETU - Real-time Airfare Price Index API",
    description="""
    ## Real-time Airfare Price Index for India
    Augmentation of Consumer Price Index (CPI) transport basket using automated scraping
    and DGCA domestic city-pair passenger traffic weights.
    
    ### Key Modules:
    - **Airfare Price Index**: Weighted Arithmetic Mean of domestic airfares ($\\sum w_r \\cdot \\bar{P}_r$).
    - **Routes & Weights**: Normalized DGCA city-pair traffic weights ($\\sum w_r = 1.0$).
    - **Data Ingestion**: High-throughput scraper ingestion API.
    - **Analytics**: 7-day price changes, rolling averages, and Z-score anomaly detection.
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers (Direct root paths + /api prefix for versatility)
app.include_router(health_router)
app.include_router(routes_router)
app.include_router(index_router)
app.include_router(analytics_router)
app.include_router(ingest_router)

# Also mount under /api prefix
app.include_router(health_router, prefix="/api")
app.include_router(routes_router, prefix="/api")
app.include_router(index_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(ingest_router, prefix="/api")

@app.get("/", tags=["Root"], summary="API Root Overview")
def root():
    return {
        "name": "VAYUSETU - Real-time Airfare Price Index for India",
        "status": "online",
        "documentation": "/docs",
        "endpoints": {
            "health": "/health",
            "routes": "/routes",
            "index": "/index",
            "index_history": "/index/history",
            "analytics": "/analytics",
            "fare_status": "/fare-status",
            "ingest_fare": "/ingest/fare",
            "ingest_bulk": "/ingest/bulk",
            "compute_weights": "/ingest/compute-weights",
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
