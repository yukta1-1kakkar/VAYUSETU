"""DGCA-weighted airfare price-relative index calculations."""

from __future__ import annotations

from datetime import date
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.models import FareObservation, RouteWeight
from app.schemas.response import IndexComponentSchema, IndexHistoryPoint, IndexHistoryResponse, IndexResponse


def _available_dates(db: Session, advance_purchase_days: int) -> list[date]:
    return [row[0] for row in (
        db.query(FareObservation.observation_date)
        .filter(
            FareObservation.advance_purchase_days == advance_purchase_days,
            FareObservation.cleaning_status == "clean",
            FareObservation.fare.is_not(None),
        )
        .distinct()
        .order_by(FareObservation.observation_date)
        .all()
    )]


def _route_cohort_averages(
    db: Session,
    observation_date: date,
    advance_purchase_days: int,
) -> dict[str, dict[tuple[str, str], tuple[float, int]]]:
    rows = (
        db.query(
            FareObservation.route_id,
            FareObservation.airline,
            FareObservation.source,
            func.avg(FareObservation.fare).label("avg_fare"),
            func.count(FareObservation.id).label("obs_count"),
        )
        .filter(
            FareObservation.observation_date == observation_date,
            FareObservation.advance_purchase_days == advance_purchase_days,
            FareObservation.cleaning_status == "clean",
            FareObservation.fare.is_not(None),
        )
        .group_by(FareObservation.route_id, FareObservation.airline, FareObservation.source)
        .all()
    )
    result: dict[str, dict[tuple[str, str], tuple[float, int]]] = {}
    for row in rows:
        result.setdefault(row.route_id, {})[(row.airline, row.source)] = (
            float(row.avg_fare), int(row.obs_count)
        )
    return result


def _price_relative_index(
    db: Session,
    base_date: date,
    target_date: date,
    advance_purchase_days: int,
) -> tuple[float, float, list[IndexComponentSchema]]:
    """
    APIx_t = 100 * sum(normalized_DGCA_weight_i * P_it / P_i0).

    Only routes with positive official weights and clean prices in both periods
    enter the matched basket. Their official weights are renormalized to one;
    the pre-normalization sum is returned as coverage_weight.
    """
    basket = (
        db.query(RouteWeight)
        .filter(RouteWeight.weight > 0)
        .order_by(RouteWeight.weight.desc())
        .limit(24)
        .all()
    )
    route_map = {row.route_id: row for row in basket}
    base_prices = _route_cohort_averages(db, base_date, advance_purchase_days)
    target_prices = _route_cohort_averages(db, target_date, advance_purchase_days)
    matched_routes = sorted(
        route_id for route_id in set(route_map) & set(base_prices) & set(target_prices)
        if set(base_prices[route_id]) & set(target_prices[route_id])
    )
    coverage_weight = sum(float(route_map[route_id].weight) for route_id in matched_routes)
    if not matched_routes or coverage_weight <= 0:
        return 0.0, 0.0, []

    components = []
    apix = 0.0
    for route_id in matched_routes:
        route = route_map[route_id]
        matched_cohorts = set(base_prices[route_id]) & set(target_prices[route_id])
        relatives = [
            target_prices[route_id][cohort][0] / base_prices[route_id][cohort][0]
            for cohort in matched_cohorts
            if base_prices[route_id][cohort][0] > 0
        ]
        if not relatives:
            continue
        price_relative = sum(relatives) / len(relatives)
        target_fare = sum(target_prices[route_id][cohort][0] for cohort in matched_cohorts) / len(matched_cohorts)
        observation_count = sum(target_prices[route_id][cohort][1] for cohort in matched_cohorts)
        normalized_weight = float(route.weight) / coverage_weight
        contribution = normalized_weight * price_relative * 100
        apix += contribution
        components.append(IndexComponentSchema(
            route_id=route_id,
            origin=route.origin,
            destination=route.destination,
            weight=round(normalized_weight, 6),
            avg_fare=round(target_fare, 2),
            weighted_fare=round(contribution, 4),
            observation_count=observation_count,
        ))
    return round(apix, 2), round(coverage_weight, 6), components


def calculate_index(
    db: Session,
    base_date: Optional[date] = None,
    target_date: Optional[date] = None,
    advance_purchase_days: int = 7,
) -> IndexResponse:
    dates = _available_dates(db, advance_purchase_days)
    resolved_target = target_date or (dates[-1] if dates else date.today())
    resolved_base = base_date or (dates[0] if dates else None)

    index_value = 0.0
    coverage_weight = 0.0
    components: list[IndexComponentSchema] = []
    base_index = None
    pct_change = None
    if resolved_base:
        index_value, coverage_weight, components = _price_relative_index(
            db, resolved_base, resolved_target, advance_purchase_days
        )
        if components:
            base_index = 100.0
            pct_change = round(index_value - 100.0, 2)

    return IndexResponse(
        index=index_value,
        base_index=base_index,
        pct_change=pct_change,
        target_date=resolved_target,
        base_date=resolved_base,
        advance_purchase_days=advance_purchase_days,
        coverage_weight=coverage_weight,
        components_count=len(components),
        components=components,
    )


def get_index_history(
    db: Session,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    advance_purchase_days: int = 7,
) -> IndexHistoryResponse:
    all_dates = _available_dates(db, advance_purchase_days)
    if not all_dates:
        return IndexHistoryResponse(advance_purchase_days=advance_purchase_days, count=0, history=[])
    base_date = all_dates[0]
    dates = [day for day in all_dates if (start_date is None or day >= start_date) and (end_date is None or day <= end_date)]
    history = []
    for day in dates:
        response = calculate_index(
            db, base_date=base_date, target_date=day,
            advance_purchase_days=advance_purchase_days,
        )
        if response.components_count:
            observation_count = sum(component.observation_count for component in response.components or [])
            history.append(IndexHistoryPoint(
                observation_date=day,
                index=response.index,
                coverage_weight=response.coverage_weight,
                observation_count=observation_count,
            ))
    return IndexHistoryResponse(
        advance_purchase_days=advance_purchase_days,
        count=len(history),
        history=history,
    )
