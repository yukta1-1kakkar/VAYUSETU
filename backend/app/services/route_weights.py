import os
from pathlib import Path
from typing import Optional, List, Dict, Any
import pandas as pd
from sqlalchemy.orm import Session

from app.database.models import RouteWeight, CPIReference
from app.services.loader import load_raw_data, get_default_raw_dir, normalize_cpi_month
from app.services.cleaner import clean_citypair_data, clean_airline_data

def get_default_processed_dir() -> Path:
    """Return the path to data/processed directory."""
    base_dir = Path(__file__).resolve().parent.parent.parent
    p = base_dir / "data" / "processed"
    p.mkdir(parents=True, exist_ok=True)
    return p

def calculate_route_weights(cleaned_citypair_df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate normalized passenger weights for each city-pair route.
    Formula: Weight(route) = total_passengers(route) / sum(total_passengers over all routes)
    Ensures sum(weights) == 1.0 (with 6 decimal precision adjustment).
    """
    if cleaned_citypair_df.empty:
        return pd.DataFrame(columns=["route_id", "origin", "destination", "total_passengers", "weight"])
        
    df = cleaned_citypair_df.copy()
    total_network_traffic = df["total_passengers"].sum()
    
    if total_network_traffic <= 0:
        df["weight"] = 0.0
        return df
        
    # Raw weight computation
    df["weight"] = (df["total_passengers"] / total_network_traffic).round(6)
    
    # Normalization check: Ensure sum is exactly 1.0 by adjusting highest weight route
    weight_sum = df["weight"].sum()
    diff = round(1.0 - weight_sum, 6)
    if diff != 0 and len(df) > 0:
        max_idx = df["weight"].idxmax()
        df.loc[max_idx, "weight"] = round(df.loc[max_idx, "weight"] + diff, 6)
        
    # Sort descending by weight
    df = df.sort_values(by="weight", ascending=False).reset_index(drop=True)
    return df

def save_route_weights(
    weights_df: pd.DataFrame,
    db: Optional[Session] = None,
    output_csv_path: Optional[Path] = None
) -> None:
    """
    Save computed route weights to CSV and SQLite database RouteWeight table.
    """
    csv_path = output_csv_path or (get_default_processed_dir() / "route_weights.csv")
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    weights_df.to_csv(csv_path, index=False)
    
    if db is not None and not weights_df.empty:
        for _, row in weights_df.iterrows():
            existing = db.query(RouteWeight).filter(RouteWeight.route_id == row["route_id"]).first()
            if existing:
                existing.origin = str(row["origin"])
                existing.destination = str(row["destination"])
                existing.total_passengers = float(row["total_passengers"])
                existing.weight = float(row["weight"])
            else:
                new_weight = RouteWeight(
                    route_id=str(row["route_id"]),
                    origin=str(row["origin"]),
                    destination=str(row["destination"]),
                    total_passengers=float(row["total_passengers"]),
                    weight=float(row["weight"]),
                )
                db.add(new_weight)
        db.commit()

def sync_cpi_data(cpi_df: pd.DataFrame, db: Optional[Session] = None) -> None:
    """Sync official CPI reference index into database and processed CSV."""
    if cpi_df is None or cpi_df.empty:
        return
        
    csv_path = get_default_processed_dir() / "cpi_reference.csv"
    cpi_df.to_csv(csv_path, index=False)
    
    if db is not None:
        for _, row in cpi_df.iterrows():
            month_key = normalize_cpi_month(row["month"])
            existing = db.query(CPIReference).filter(CPIReference.month == month_key).first()
            if existing:
                existing.combined_index = float(row["combined_index"])
                existing.inflation_pct = float(row["inflation_pct"]) if pd.notna(row.get("inflation_pct")) else None
            else:
                db.add(CPIReference(
                    month=month_key,
                    combined_index=float(row["combined_index"]),
                    inflation_pct=float(row["inflation_pct"]) if pd.notna(row.get("inflation_pct")) else None
                ))
        db.commit()

def load_and_compute_all_weights(
    raw_dir: Optional[Path] = None,
    db: Optional[Session] = None
) -> pd.DataFrame:
    """
    Full pipeline to load all 20 raw Excel files (City-Pair, Airline stats, CPI),
    clean, compute weights, and persist results.
    """
    raw_data = load_raw_data(raw_dir)
    citypair_dfs = raw_data.get("citypair", [])
    
    # 1. Clean and compute city-pair weights
    cleaned_df = clean_citypair_data(citypair_dfs)
    weights_df = calculate_route_weights(cleaned_df)
    save_route_weights(weights_df, db=db)
    
    # 2. Sync CPI reference data
    cpi_df = raw_data.get("cpi")
    if cpi_df is not None:
        sync_cpi_data(cpi_df, db=db)
        
    # 3. Clean and save airline operational datasets to processed/
    proc_dir = get_default_processed_dir()
    for airline_name, df_air in raw_data.get("airline", {}).items():
        if df_air is not None and not df_air.empty:
            df_clean_air = clean_airline_data(df_air, airline_name)
            df_clean_air.to_csv(proc_dir / f"airline_{airline_name.lower().replace(' ', '_')}.csv", index=False)
            
    return weights_df
