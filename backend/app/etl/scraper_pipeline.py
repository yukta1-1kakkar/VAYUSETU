"""Clean, deduplicate, quarantine and persist normalized scraper JSON."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import uuid
from collections import defaultdict
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any, Iterable

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database.db import Base, SessionLocal, engine
from app.database.models import (
    FareObservation,
    RejectedObservation,
    RouteWeight,
    ScrapeRun,
)


ADVANCE_WINDOWS = {1, 7, 15, 30, 45}
SUPPORTED_OUTPUTS = {
    "airindiaexpress_top_24_routes.json",
    "akasaair_top_24_routes.json",
    "spicejet_top_24_routes.json",
    "yatra_top_24_routes.json",
}
NULL_STRINGS = {"", "n/a", "na", "none", "null", "unknown", "-"}


def _text(value: Any, default: str | None = None) -> str | None:
    if value is None:
        return default
    result = str(value).strip()
    return default if result.lower() in NULL_STRINGS else result


def _number(value: Any, *, zero_allowed: bool = True) -> float | None:
    if value is None or isinstance(value, bool):
        return None
    if isinstance(value, str) and value.strip().lower() in NULL_STRINGS:
        return None
    try:
        result = float(str(value).replace(",", "").replace("₹", "").strip())
    except (TypeError, ValueError):
        return None
    if not math.isfinite(result) or result < 0 or (result == 0 and not zero_allowed):
        return None
    return round(result, 2)


def _integer(value: Any) -> int | None:
    number = _number(value)
    return int(number) if number is not None else None


def _boolean(value: Any) -> bool | None:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        if value.strip().lower() in {"true", "yes", "1"}:
            return True
        if value.strip().lower() in {"false", "no", "0"}:
            return False
    return None


def _date(value: Any) -> date | None:
    text = _text(value)
    if not text:
        return None
    try:
        return date.fromisoformat(text[:10])
    except ValueError:
        return None


def _datetime(value: Any) -> datetime | None:
    text = _text(value)
    if not text:
        return None
    try:
        parsed = datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


def _route_id(record: dict[str, Any]) -> str | None:
    route = _text(record.get("route_id"))
    if route:
        return route.upper().replace(" ", "")
    origin = _text(record.get("origin"))
    destination = _text(record.get("destination"))
    if origin and destination:
        return f"{origin.upper()}-{destination.upper()}"
    return None


def _fingerprint(record: dict[str, Any]) -> str:
    identity = {
        "source": record["source"],
        "seller": record.get("seller_name"),
        "route": record["route_id"],
        "airline": record["airline"],
        "airline_code": record.get("airline_code"),
        "flight_number": record.get("flight_number"),
        "travel_date": record["travel_date"].isoformat(),
        "departure_time": record.get("departure_time").isoformat()
        if record.get("departure_time") else None,
        "advance_days": record["advance_purchase_days"],
        "observation_date": record["observation_date"].isoformat(),
        "fare_family": record.get("fare_family"),
    }
    encoded = json.dumps(identity, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(encoded).hexdigest()


def normalize_record(raw: dict[str, Any], source_hint: str) -> tuple[dict[str, Any] | None, str | None]:
    route_id = _route_id(raw)
    travel_date = _date(raw.get("travel_date"))
    advance_days = _integer(raw.get("advance_purchase_days"))
    collected_at = _datetime(raw.get("collection_timestamp")) or datetime.now(timezone.utc)
    source = _text(raw.get("source"), source_hint) or source_hint
    airline = _text(raw.get("airline_name"), source) or source

    missing = []
    if not route_id:
        missing.append("route_id")
    if not travel_date:
        missing.append("travel_date")
    if advance_days not in ADVANCE_WINDOWS:
        missing.append("advance_purchase_days")
    if missing:
        return None, f"missing or invalid required fields: {', '.join(missing)}"

    total_fare = _number(raw.get("total_fare"), zero_allowed=False)
    availability = (_text(raw.get("availability_status"), "available") or "available").lower()
    no_flights = _boolean(raw.get("no_flights"))
    sold_out = _boolean(raw.get("sold_out"))
    if no_flights:
        availability = "no_flights"
    elif sold_out:
        availability = "sold_out"
    elif total_fare is None and availability == "available":
        availability = "not_collected"

    normalized = {
        "observation_id": _text(raw.get("observation_id")),
        "route_id": route_id,
        "airline": airline,
        "airline_code": _text(raw.get("airline_code")),
        "flight_number": _text(raw.get("flight_number")),
        "travel_date": travel_date,
        "observation_date": collected_at.date(),
        "advance_purchase_days": advance_days,
        "collected_at": collected_at,
        "departure_time": _datetime(raw.get("departure_time")),
        "arrival_time": _datetime(raw.get("arrival_time")),
        "trip_type": (_text(raw.get("trip_type"), "one_way") or "one_way").lower(),
        "cabin": (_text(raw.get("cabin"), "economy") or "economy").lower(),
        "fare_family": _text(raw.get("fare_family")),
        "stops": _integer(raw.get("stops")),
        "duration_minutes": _integer(raw.get("duration_minutes")),
        "fare": total_fare,
        "base_fare": _number(raw.get("base_fare"), zero_allowed=False),
        "taxes": _number(raw.get("taxes")),
        "user_development_fee": _number(raw.get("user_development_fee")),
        "convenience_fee": _number(raw.get("convenience_fee")),
        "mandatory_fees": _number(raw.get("mandatory_fees")),
        "currency": (_text(raw.get("currency"), "INR") or "INR").upper(),
        "source": source,
        "source_type": _text(raw.get("source_type")),
        "seller_name": _text(raw.get("seller_name")),
        "source_url": _text(raw.get("source_url")),
        "availability_status": availability,
        "seats_available": _integer(raw.get("seats_available")),
        "no_flights": no_flights,
        "sold_out": sold_out,
        "scrape_outcome": _text(raw.get("scrape_outcome")),
        "data_quality_score": _number(raw.get("data_quality_score")),
        "cleaning_status": "clean" if total_fare is not None else "unavailable",
        "is_outlier": False,
        "rejection_reason": None,
        "raw_payload": raw,
    }

    components = [
        normalized[name] for name in (
            "base_fare", "taxes", "user_development_fee",
            "convenience_fee", "mandatory_fees",
        ) if normalized[name] is not None
    ]
    if total_fare is not None and components and sum(components) > total_fare * 1.05:
        normalized["cleaning_status"] = "quarantined"
        normalized["rejection_reason"] = "fare components exceed total fare"

    normalized["record_fingerprint"] = _fingerprint(normalized)
    return normalized, None


def _percentile(values: list[float], fraction: float) -> float:
    position = (len(values) - 1) * fraction
    lower = math.floor(position)
    upper = math.ceil(position)
    if lower == upper:
        return values[lower]
    return values[lower] + (values[upper] - values[lower]) * (position - lower)


def quarantine_outliers(records: list[dict[str, Any]]) -> None:
    groups: dict[tuple, list[dict[str, Any]]] = defaultdict(list)
    for record in records:
        if record["cleaning_status"] == "clean" and record["fare"] is not None:
            groups[(record["route_id"], record["travel_date"], record["advance_purchase_days"])].append(record)

    for group in groups.values():
        if len(group) < 4:
            continue
        fares = sorted(record["fare"] for record in group)
        q1 = _percentile(fares, 0.25)
        q3 = _percentile(fares, 0.75)
        iqr = q3 - q1
        if iqr <= 0:
            continue
        lower, upper = max(0, q1 - 1.5 * iqr), q3 + 1.5 * iqr
        for record in group:
            if record["fare"] < lower or record["fare"] > upper:
                record["cleaning_status"] = "outlier"
                record["is_outlier"] = True
                record["rejection_reason"] = f"outside IQR bounds {lower:.2f}-{upper:.2f}"


def transform_records(raw_records: Iterable[dict[str, Any]], source_hint: str) -> tuple[list[dict], list[dict]]:
    normalized_by_fingerprint: dict[str, dict] = {}
    rejected = []
    for raw in raw_records:
        if not isinstance(raw, dict):
            rejected.append({"source": source_hint, "route_id": None, "reason": "record is not an object", "raw_payload": {"value": raw}})
            continue
        record, error = normalize_record(raw, source_hint)
        if error:
            rejected.append({"source": source_hint, "route_id": _route_id(raw), "reason": error, "raw_payload": raw})
            continue
        normalized_by_fingerprint[record["record_fingerprint"]] = record

    records = list(normalized_by_fingerprint.values())
    quarantine_outliers(records)
    return records, rejected


def seed_route_weights(db: Session, csv_path: Path | None = None) -> int:
    if db.bind and db.bind.dialect.name == "postgresql":
        db.execute(text("SELECT pg_advisory_xact_lock(hashtext('vayusetu-route-weights'))"))
    if db.query(RouteWeight).count() > 0:
        return 0
    csv_path = csv_path or Path(__file__).resolve().parents[2] / "data" / "processed" / "route_weights.csv"
    inserted = 0
    with csv_path.open(encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            db.add(RouteWeight(
                route_id=row["route_id"], origin=row["origin"], destination=row["destination"],
                total_passengers=float(row["total_passengers"]), weight=float(row["weight"]),
            ))
            inserted += 1
    db.flush()
    return inserted


def _source_name(payload: dict[str, Any], path: Path) -> str:
    return str(payload.get("platform") or payload.get("airline") or payload.get("source") or path.stem)


def load_scraper_file(path: Path, db: Session | None = None, *, dry_run: bool = False) -> dict[str, Any]:
    path = path.resolve()
    raw_bytes = path.read_bytes()
    payload = json.loads(raw_bytes)
    raw_records = payload.get("routes")
    if not isinstance(raw_records, list):
        raise ValueError(f"{path.name} must contain a routes array")
    source = _source_name(payload, path)
    records, rejected = transform_records(raw_records, source)
    summary = {
        "source": source,
        "source_file": str(path),
        "input": len(raw_records),
        "deduplicated": len(records),
        "clean": sum(r["cleaning_status"] == "clean" for r in records),
        "unavailable": sum(r["cleaning_status"] == "unavailable" for r in records),
        "outliers": sum(r["cleaning_status"] == "outlier" for r in records),
        "quarantined": sum(r["cleaning_status"] == "quarantined" for r in records),
        "rejected": len(rejected),
        "inserted": 0,
        "updated": 0,
    }
    if dry_run:
        return summary

    owns_session = db is None
    # PostgreSQL is migration-managed by Prisma. The zero-config SQLite
    # fallback can safely initialize itself for local scraper runs.
    if owns_session and engine.dialect.name == "sqlite":
        Base.metadata.create_all(bind=engine)
    db = db or SessionLocal()
    run = ScrapeRun(
        id=str(uuid.uuid4()), source=source, source_file=str(path),
        file_checksum=hashlib.sha256(raw_bytes).hexdigest(), input_count=len(raw_records),
    )
    try:
        db.add(run)
        if db.bind and db.bind.dialect.name == "postgresql":
            # Prevent two overlapping loads of the same source from racing on
            # the unique daily fingerprint while allowing different sources.
            db.execute(
                text("SELECT pg_advisory_xact_lock(hashtext(:lock_name))"),
                {"lock_name": f"vayusetu-etl-{source}"},
            )
        seed_route_weights(db)
        valid_routes = {row[0] for row in db.query(RouteWeight.route_id).all()}
        fingerprints = [record["record_fingerprint"] for record in records]
        existing_by_fingerprint = {
            row.record_fingerprint: row
            for row in db.query(FareObservation).filter(
                FareObservation.record_fingerprint.in_(fingerprints)
            ).all()
        } if fingerprints else {}
        for record in records:
            if record["route_id"] not in valid_routes:
                rejected.append({
                    "source": source, "route_id": record["route_id"],
                    "reason": "route is absent from DGCA route weights",
                    "raw_payload": record["raw_payload"],
                })
                continue
            existing = existing_by_fingerprint.get(record["record_fingerprint"])
            values = dict(record)
            values["scrape_run_id"] = run.id
            if existing:
                for key, value in values.items():
                    setattr(existing, key, value)
                summary["updated"] += 1
            else:
                db.add(FareObservation(**values))
                summary["inserted"] += 1

        for item in rejected:
            db.add(RejectedObservation(scrape_run_id=run.id, **item))
        run.clean_count = summary["clean"]
        run.unavailable_count = summary["unavailable"]
        run.outlier_count = summary["outliers"] + summary["quarantined"]
        run.rejected_count = len(rejected)
        run.inserted_count = summary["inserted"]
        run.updated_count = summary["updated"]
        run.completed_at = datetime.now(timezone.utc)
        run.status = "completed"
        db.commit()
        summary["rejected"] = len(rejected)
        return summary
    except Exception:
        db.rollback()
        raise
    finally:
        if owns_session:
            db.close()


def discover_outputs(input_dir: Path) -> list[Path]:
    latest_by_name: dict[str, Path] = {}
    for path in input_dir.rglob("*_top_24_routes.json"):
        if path.name not in SUPPORTED_OUTPUTS:
            continue
        current = latest_by_name.get(path.name)
        if current is None or path.stat().st_mtime > current.stat().st_mtime:
            latest_by_name[path.name] = path
    return sorted(latest_by_name.values(), key=lambda path: path.name)


def main() -> None:
    parser = argparse.ArgumentParser(description="Load VAYUSETU scraper output into the configured database")
    target = parser.add_mutually_exclusive_group(required=True)
    target.add_argument("--file", type=Path)
    target.add_argument("--input-dir", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    paths = [args.file] if args.file else discover_outputs(args.input_dir)
    if not paths:
        raise SystemExit("No supported scraper outputs found")
    for path in paths:
        print(json.dumps(load_scraper_file(path, dry_run=args.dry_run), indent=2, default=str))


if __name__ == "__main__":
    main()
