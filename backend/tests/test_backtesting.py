from datetime import date, timedelta

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.db import Base
from app.database.models import FareObservation, RouteWeight
from app.services.backtesting import run_apix_backtest


def test_backtest_reports_provenance_stability_and_holdout():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    db = sessionmaker(bind=engine)()
    db.add(RouteWeight(route_id="DEL-BOM", origin="DEL", destination="BOM", total_passengers=1, weight=1))
    first_day = date(2026, 8, 1)
    for offset in range(30):
        observation_day = first_day + timedelta(days=offset)
        db.add(FareObservation(
            record_fingerprint=f"backtest-{offset}", route_id="DEL-BOM", airline="Example Air",
            source="Example", travel_date=observation_day + timedelta(days=7),
            observation_date=observation_day, advance_purchase_days=7,
            fare=5000 + offset * 10, cleaning_status="clean", is_synthetic=offset < 27,
        ))
    db.commit()

    result = run_apix_backtest(db)

    assert result["period"]["days"] == 30
    assert result["provenance"]["realDates"] == 3
    assert result["provenance"]["syntheticDates"] == 27
    assert len(result["realDateHoldout"]) == 3
    assert result["checks"]["has30CalendarDays"] is True
    assert result["internalChecksPassed"] is True
    assert result["checks"]["officialFareBenchmarkAvailable"] is False
