from datetime import date, datetime, timezone

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi import Response

from app.api import dashboard as dashboard_api
from app.database.db import Base
from app.database.models import CPIReference, FareObservation, RouteWeight
from app.services.live_dashboard import build_live_dashboard


def test_live_dashboard_uses_persisted_observations_only():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    db = sessionmaker(bind=engine)()
    db.add(RouteWeight(route_id="DEL-BOM", origin="DEL", destination="BOM", total_passengers=1000, weight=1.0))
    db.add(CPIReference(month="2026-08", combined_index=107.94))
    for index, (day, window, fare) in enumerate([
        (date(2026, 8, 27), 45, 4000),
        (date(2026, 8, 27), 15, 5000),
        (date(2026, 8, 28), 7, 6000),
        (date(2026, 8, 28), 1, 7000),
    ]):
        db.add(FareObservation(
            observation_id=f"obs-{index}", record_fingerprint=f"fingerprint-{index}",
            route_id="DEL-BOM", airline="Example Air", travel_date=date(2026, 9, 15),
            observation_date=day, advance_purchase_days=window, fare=fare,
            source="Example Source", cleaning_status="clean", collected_at=datetime(2026, 8, 28, index, tzinfo=timezone.utc),
        ))
    db.commit()

    payload = build_live_dashboard(db)

    assert payload["hasData"] is True
    assert payload["flightRoutes"][0]["currentFare"] == 6500
    assert payload["flightRoutes"][0]["referenceFare"] == 4500
    # APIx uses one consistent lead-time window (T+7), so only its observed
    # date enters this fixture's index timeline.
    assert len(payload["indexTimeline"]) == 1
    assert [point["window"] for point in payload["leadTimeByRoute"]["ALL"]] == ["T+45", "T+15", "T+7", "T+1"]
    assert payload["cpiDataSeries"] == [{
        "month": "Aug 2026", "period": "2026-08", "airfareIndex": 100.0,
        "airfareIndexRaw": 100.0, "cpiGeneral": 100.0, "cpiGeneralRaw": 107.94,
        "cpiTransport": None, "cpiTransportRaw": None, "divergence": 0.0,
    }]
    assert payload["cpiComparisonMeta"]["transportSeriesAvailable"] is False
    assert payload["liveTelemetryFeed"][0]["observedFare"] == 7000
    assert {
        route_id
        for sector in payload["sectorHeatmapData"]
        for route_id in sector["keyRoutes"]
    } == {route["id"] for route in payload["flightRoutes"]}


def test_live_dashboard_endpoint_reuses_cached_snapshot(monkeypatch):
    calls = 0
    expected = {"hasData": True, "generatedAt": "cached"}

    def fake_builder(_db):
        nonlocal calls
        calls += 1
        return expected

    monkeypatch.setattr(dashboard_api, "build_live_dashboard", fake_builder)
    monkeypatch.setattr(dashboard_api, "_cached_payload", None)
    monkeypatch.setattr(dashboard_api, "_cached_at", 0.0)

    first_response = Response()
    second_response = Response()
    first = dashboard_api.live_dashboard(response=first_response, db=object())
    second = dashboard_api.live_dashboard(response=second_response, db=object())

    assert first is expected
    assert second is expected
    assert calls == 1
    assert first_response.headers["X-VAYUSETU-Cache"] == "MISS"
    assert second_response.headers["X-VAYUSETU-Cache"] == "HIT"
    assert "max-age=60" in second_response.headers["Cache-Control"]
