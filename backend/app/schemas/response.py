from datetime import datetime, date, timezone
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

def utc_now():
    return datetime.now(timezone.utc)

class HealthResponse(BaseModel):
    status: str = Field("ok", description="Status code", examples=["ok"])
    database: str = Field("connected", description="Database status", examples=["connected"])
    timestamp: datetime = Field(default_factory=utc_now)

class RouteSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    route_id: str
    origin: str
    destination: str
    total_passengers: float
    weight: float
    updated_at: Optional[datetime] = None

class RouteListResponse(BaseModel):
    total: int
    routes: List[RouteSchema]

class IndexComponentSchema(BaseModel):
    route_id: str
    origin: str
    destination: str
    weight: float
    avg_fare: float
    weighted_fare: float
    observation_count: int

class IndexResponse(BaseModel):
    index: float = Field(..., description="Weighted Arithmetic Mean Airfare Price Index for target date")
    base_index: Optional[float] = Field(None, description="Airfare Price Index on base date")
    pct_change: Optional[float] = Field(None, description="Percentage change in price index ((index - base) / base * 100)")
    target_date: date
    base_date: Optional[date] = None
    advance_purchase_days: int
    coverage_weight: float = Field(..., description="Sum of DGCA weights for routes with available fare observations")
    components_count: int
    components: Optional[List[IndexComponentSchema]] = None

class IndexHistoryPoint(BaseModel):
    observation_date: date
    index: float
    coverage_weight: float
    observation_count: int

class IndexHistoryResponse(BaseModel):
    advance_purchase_days: int
    count: int
    history: List[IndexHistoryPoint]

class RouteChangeSchema(BaseModel):
    route_id: str
    current_avg_fare: float
    past_avg_fare: float
    pct_change: float

class AnomalySchema(BaseModel):
    observation_id: int
    route_id: str
    airline: str
    observation_date: date
    travel_date: date
    advance_purchase_days: int
    fare: float
    mean_fare: float
    std_fare: float
    z_score: float
    is_anomaly: bool

class AnalyticsResponse(BaseModel):
    route_changes_7d: List[RouteChangeSchema] = Field(default_factory=list)
    overall_change_7d_pct: Optional[float] = None
    rolling_mean_7d: Optional[float] = None
    anomalies: List[AnomalySchema] = Field(default_factory=list)

class FareStatusResponse(BaseModel):
    has_data: bool
    last_updated: Optional[datetime] = None
    total_observations: int
    unique_routes_with_fares: int
    unique_airlines: int
    earliest_observation_date: Optional[date] = None
    latest_observation_date: Optional[date] = None
