from datetime import date, datetime, timezone

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.db import Base
from app.database.models import FareObservation, RouteWeight
from app.services.live_dashboard import build_live_dashboard


def test_live_dashboard_uses_persisted_observations_only():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    db = sessionmaker(bind=engine)()
    db.add(RouteWeight(route_id="DEL-BOM", origin="DEL", destination="BOM", total_passengers=1000, weight=1.0))
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
    assert payload["cpiDataSeries"] == []
    assert payload["liveTelemetryFeed"][0]["observedFare"] == 7000
