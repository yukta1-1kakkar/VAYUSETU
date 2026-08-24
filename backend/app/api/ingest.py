from typing import List, Union
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.schemas.ingest import FareIngestSchema, BulkFareIngestSchema
from app.services.fare_adapter import ingest_fare, ingest_bulk_fares
from app.services.route_weights import load_and_compute_all_weights

router = APIRouter(prefix="/ingest", tags=["Data Ingestion & Pipeline"])

@router.post("/fare", status_code=status.HTTP_201_CREATED, summary="Ingest Single Scraped Airfare Observation")
def post_single_fare(fare: FareIngestSchema, db: Session = Depends(get_db)):
    """
    Ingest or update a single airfare observation from scraper or aggregator portal.
    """
    obs = ingest_fare(db=db, fare_data=fare)
    return {
        "status": "success",
        "message": "Fare observation recorded successfully",
        "data": {
            "id": obs.id,
            "route_id": obs.route_id,
            "airline": obs.airline,
            "travel_date": str(obs.travel_date),
            "observation_date": str(obs.observation_date),
            "advance_purchase_days": obs.advance_purchase_days,
            "fare": obs.fare,
            "source": obs.source
        }
    }

@router.post("/bulk", status_code=status.HTTP_201_CREATED, summary="Batch Ingest Scraped Airfare Observations")
def post_bulk_fares(payload: Union[BulkFareIngestSchema, List[FareIngestSchema]], db: Session = Depends(get_db)):
    """
    Ingest a batch of scraped airfare observations for high-throughput pipelines.
    Accepts either a JSON object `{"fares": [...]}` or a raw list `[...]`.
    """
    fare_list = payload.fares if isinstance(payload, BulkFareIngestSchema) else payload
    if not fare_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fares list cannot be empty."
        )
    result = ingest_bulk_fares(db=db, fare_list=fare_list)
    return result

@router.post("/compute-weights", summary="Recompute Route Weights From data/raw Excel Files")
def post_compute_weights(db: Session = Depends(get_db)):
    """
    Trigger processing of DGCA city-pair Excel files in `data/raw/` to update RouteWeight table.
    """
    try:
        df = load_and_compute_all_weights(db=db)
        return {
            "status": "success",
            "message": f"Successfully computed and updated weights for {len(df)} routes.",
            "total_routes": len(df),
            "top_routes": df.head(10).to_dict(orient="records")
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process raw Excel files: {str(e)}"
        )
