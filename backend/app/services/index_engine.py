from datetime import date, datetime
from typing import Optional, List, Dict, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.models import RouteWeight, FareObservation
from app.schemas.response import IndexResponse, IndexComponentSchema, IndexHistoryResponse, IndexHistoryPoint

def _calculate_single_date_index(
    db: Session,
    target_date: date,
    advance_purchase_days: int = 7
) -> Tuple[float, float, int, List[IndexComponentSchema]]:
    """
    Compute Weighted Arithmetic Mean Airfare Index for a specific observation date.
    
    Methodology:
    Index = Sum(Weight(r) * AvgFare(r)) / Sum(Weight(r) for routes with observations)
    """
    # 1. Fetch all routes and their weights
    all_routes = db.query(RouteWeight).all()
    route_map = {r.route_id: r for r in all_routes}
    
    # 2. Fetch average fare per route on the target observation date
    obs_query = (
        db.query(
            FareObservation.route_id,
            func.avg(FareObservation.fare).label("avg_fare"),
            func.count(FareObservation.id).label("obs_count")
        )
        .filter(
            FareObservation.observation_date == target_date,
            FareObservation.advance_purchase_days == advance_purchase_days
        )
        .group_by(FareObservation.route_id)
        .all()
    )
    
    if not obs_query:
        return 0.0, 0.0, 0, []
        
    components: List[IndexComponentSchema] = []
    weighted_sum = 0.0
    coverage_weight = 0.0
    
    for row in obs_query:
        r_id = row.route_id
        avg_fare = float(row.avg_fare)
        obs_count = int(row.obs_count)
        
        # Route weight from DGCA network (default to 1.0/N if unweighted)
        weight = route_map[r_id].weight if (r_id in route_map and route_map[r_id].weight > 0) else 0.001
        origin = route_map[r_id].origin if r_id in route_map else r_id.split("-")[0]
        destination = route_map[r_id].destination if r_id in route_map else (r_id.split("-")[1] if "-" in r_id else "")
        
        weighted_fare = round(weight * avg_fare, 4)
        weighted_sum += weight * avg_fare
        coverage_weight += weight
        
        components.append(
            IndexComponentSchema(
                route_id=r_id,
                origin=origin,
                destination=destination,
                weight=round(weight, 6),
                avg_fare=round(avg_fare, 2),
                weighted_fare=weighted_fare,
                observation_count=obs_count,
            )
        )
        
    if coverage_weight > 0:
        index_val = round(weighted_sum / coverage_weight, 2)
    else:
        index_val = round(weighted_sum, 2)
        
    return index_val, round(coverage_weight, 6), len(components), components

def calculate_index(
    db: Session,
    base_date: Optional[date] = None,
    target_date: Optional[date] = None,
    advance_purchase_days: int = 7
) -> IndexResponse:
    """
    Compute current real-time airfare index, compare against base date,
    and return detailed components breakdown.
    """
    # Default target date to latest available observation date or today
    if target_date is None:
        latest_date = db.query(func.max(FareObservation.observation_date)).scalar()
        target_date = latest_date or date.today()

    # Calculate target index
    curr_index, coverage_weight, comp_count, components = _calculate_single_date_index(
        db, target_date, advance_purchase_days
    )
    
    # Resolve base date (earliest date in DB if not provided)
    if base_date is None:
        earliest_date = db.query(func.min(FareObservation.observation_date)).scalar()
        base_date = earliest_date

    base_index = None
    pct_change = None
    
    if base_date:
        if base_date == target_date:
            base_index = curr_index
            pct_change = 0.0
        else:
            base_idx_val, _, _, _ = _calculate_single_date_index(db, base_date, advance_purchase_days)
            if base_idx_val > 0:
                base_index = base_idx_val
                pct_change = round(((curr_index - base_index) / base_index) * 100, 2)
                
    return IndexResponse(
        index=curr_index,
        base_index=base_index,
        pct_change=pct_change,
        target_date=target_date,
        base_date=base_date,
        advance_purchase_days=advance_purchase_days,
        coverage_weight=coverage_weight,
        components_count=comp_count,
        components=components,
    )

def get_index_history(
    db: Session,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    advance_purchase_days: int = 7
) -> IndexHistoryResponse:
    """
    Generate daily time-series index history across specified date window.
    """
    query = (
        db.query(FareObservation.observation_date)
        .filter(FareObservation.advance_purchase_days == advance_purchase_days)
        .distinct()
        .order_by(FareObservation.observation_date.asc())
    )
    
    if start_date:
        query = query.filter(FareObservation.observation_date >= start_date)
    if end_date:
        query = query.filter(FareObservation.observation_date <= end_date)
        
    dates = [row[0] for row in query.all()]
    history_points: List[IndexHistoryPoint] = []
    
    for d in dates:
        idx_val, cov_wt, count, _ = _calculate_single_date_index(db, d, advance_purchase_days)
        if idx_val > 0:
            obs_cnt = (
                db.query(func.count(FareObservation.id))
                .filter(
                    FareObservation.observation_date == d,
                    FareObservation.advance_purchase_days == advance_purchase_days
                )
                .scalar()
            )
            history_points.append(
                IndexHistoryPoint(
                    observation_date=d,
                    index=idx_val,
                    coverage_weight=cov_wt,
                    observation_count=int(obs_cnt or 0)
                )
            )
            
    return IndexHistoryResponse(
        advance_purchase_days=advance_purchase_days,
        count=len(history_points),
        history=history_points
    )
