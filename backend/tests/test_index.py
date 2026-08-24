import pytest
from datetime import date, timedelta
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.database.db import Base, get_db
from app.database.models import RouteWeight, FareObservation
from app.services.route_weights import calculate_route_weights
from app.services.index_engine import calculate_index, get_index_history
from app.services.analytics import detect_anomalies, get_analytics_summary
from app.schemas.ingest import FareIngestSchema
from app.main import app

@pytest.fixture
def db_session():
    # Use StaticPool to ensure the same in-memory DB is shared across threads and connections
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

def test_calculate_route_weights():
    df = pd.DataFrame({
        "route_id": ["DEL-BOM", "BLR-DEL", "MAA-DEL"],
        "origin": ["DEL", "BLR", "MAA"],
        "destination": ["BOM", "DEL", "DEL"],
        "total_passengers": [50000.0, 30000.0, 20000.0]
    })
    weights_df = calculate_route_weights(df)
    assert len(weights_df) == 3
    assert abs(weights_df["weight"].sum() - 1.0) < 1e-5
    assert weights_df[weights_df["route_id"] == "DEL-BOM"]["weight"].iloc[0] == 0.5

def test_index_calculation_methodology(db_session):
    # Setup Route Weights: DEL-BOM (0.6), BLR-DEL (0.4)
    r1 = RouteWeight(route_id="DEL-BOM", origin="DEL", destination="BOM", total_passengers=60000, weight=0.6)
    r2 = RouteWeight(route_id="BLR-DEL", origin="BLR", destination="DEL", total_passengers=40000, weight=0.4)
    db_session.add_all([r1, r2])
    db_session.commit()

    base_d = date(2026, 8, 1)
    target_d = date(2026, 8, 8)

    # Base Date Observations: DEL-BOM = 5000, BLR-DEL = 4000
    # Base Index = 0.6 * 5000 + 0.4 * 4000 = 3000 + 1600 = 4600.0
    f1 = FareObservation(route_id="DEL-BOM", airline="IndiGo", travel_date=base_d + timedelta(days=7), observation_date=base_d, advance_purchase_days=7, fare=5000.0, source="mock")
    f2 = FareObservation(route_id="BLR-DEL", airline="Air India", travel_date=base_d + timedelta(days=7), observation_date=base_d, advance_purchase_days=7, fare=4000.0, source="mock")

    # Target Date Observations: DEL-BOM = 5500, BLR-DEL = 4500
    # Target Index = 0.6 * 5500 + 0.4 * 4500 = 3300 + 1800 = 5100.0
    f3 = FareObservation(route_id="DEL-BOM", airline="IndiGo", travel_date=target_d + timedelta(days=7), observation_date=target_d, advance_purchase_days=7, fare=5500.0, source="mock")
    f4 = FareObservation(route_id="BLR-DEL", airline="Air India", travel_date=target_d + timedelta(days=7), observation_date=target_d, advance_purchase_days=7, fare=4500.0, source="mock")

    db_session.add_all([f1, f2, f3, f4])
    db_session.commit()

    res = calculate_index(db_session, base_date=base_d, target_date=target_d, advance_purchase_days=7)
    assert res.index == 5100.0
    assert res.base_index == 4600.0
    # % Change = ((5100 - 4600) / 4600) * 100 = 10.87%
    assert res.pct_change == 10.87
    assert res.coverage_weight == 1.0
    assert res.components_count == 2

def test_anomaly_detection(db_session):
    r = RouteWeight(route_id="DEL-BOM", origin="DEL", destination="BOM", total_passengers=10000, weight=1.0)
    db_session.add(r)

    # 10 observations around 5000 and 1 massive outlier at 15000
    d = date(2026, 8, 1)
    obs_list = []
    for i in range(10):
        obs_list.append(FareObservation(
            route_id="DEL-BOM", airline="IndiGo",
            travel_date=d + timedelta(days=7), observation_date=d,
            advance_purchase_days=7, fare=5000.0 + (i * 10), source="mock"
        ))
    obs_list.append(FareObservation(
        route_id="DEL-BOM", airline="IndiGo",
        travel_date=d + timedelta(days=7), observation_date=d,
        advance_purchase_days=7, fare=15000.0, source="mock"
    ))
    db_session.add_all(obs_list)
    db_session.commit()

    anomalies = detect_anomalies(db_session, route_id="DEL-BOM", threshold=2.0)
    assert len(anomalies) >= 1
    assert any(a.fare == 15000.0 for a in anomalies)

def test_api_endpoints(client):
    # Test /health
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"

    # Ingest Fare
    payload = {
        "route_id": "DEL-BOM",
        "airline": "IndiGo",
        "travel_date": "2026-09-01",
        "observation_date": "2026-08-25",
        "advance_purchase_days": 7,
        "fare": 4850.0,
        "base_fare": 4100.0,
        "taxes": 750.0,
        "currency": "INR",
        "source": "mock"
    }
    ingest_resp = client.post("/ingest/fare", json=payload)
    assert ingest_resp.status_code == 201
    assert ingest_resp.json()["status"] == "success"

    # Test /routes
    routes_resp = client.get("/routes")
    assert routes_resp.status_code == 200
    assert routes_resp.json()["total"] >= 1

    # Test /fare-status
    status_resp = client.get("/fare-status")
    assert status_resp.status_code == 200
    assert status_resp.json()["has_data"] is True
    assert status_resp.json()["total_observations"] >= 1

    # Test /index
    index_resp = client.get("/index?advance_purchase=7")
    assert index_resp.status_code == 200
    assert index_resp.json()["index"] == 4850.0

    # Test /analytics
    analytics_resp = client.get("/analytics")
    assert analytics_resp.status_code == 200
