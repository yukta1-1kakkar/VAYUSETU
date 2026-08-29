import re
from typing import List, Optional, Any
import pandas as pd

def standardize_city_name(city: Any) -> str:
    """
    Standardize Indian city/airport names:
    - Strips whitespace
    - Uppercases
    - Removes parenthetical remarks (e.g. 'DELHI (DEL)' -> 'DELHI', 'MUMBAI (BOM)' -> 'MUMBAI')
    - Cleans duplicate whitespace
    """
    if pd.isna(city) or city is None:
        return ""
    
    s = str(city).strip().upper()
    # Remove text within parentheses
    s = re.sub(r"\(.*?\)", "", s)
    # Remove common punctuation
    s = re.sub(r"[\.,\-_\/]", " ", s)
    # Collapse multiple spaces
    s = re.sub(r"\s+", " ", s).strip()
    return s

def clean_citypair_data(dfs: List[pd.DataFrame]) -> pd.DataFrame:
    """
    Clean, standardize, and aggregate City-Pair Data across all month files.
    Calculates total passengers per route:
    PASSENGERS_TO_CITY_2 + PASSENGERS_FROM_CITY_2 -> total_passengers
    
    Returns DataFrame with columns:
    ['route_id', 'origin', 'destination', 'total_passengers']
    """
    if not dfs:
        return pd.DataFrame(columns=["route_id", "origin", "destination", "total_passengers"])
    
    combined = pd.concat(dfs, ignore_index=True)
    
    # Ensure required columns exist
    for col in ["CITY_1", "CITY_2"]:
        if col not in combined.columns:
            raise ValueError(f"Missing required column '{col}' in City-Pair dataset")
            
    # Clean city names
    combined["origin"] = combined["CITY_1"].apply(standardize_city_name)
    combined["destination"] = combined["CITY_2"].apply(standardize_city_name)
    
    # Filter empty cities
    combined = combined[(combined["origin"] != "") & (combined["destination"] != "")].copy()
    
    # Parse passenger numbers
    to_col = "PASSENGERS_TO_CITY_2" if "PASSENGERS_TO_CITY_2" in combined.columns else combined.columns[3]
    from_col = "PASSENGERS_FROM_CITY_2" if "PASSENGERS_FROM_CITY_2" in combined.columns else combined.columns[4]
    
    combined["passengers_to"] = pd.to_numeric(
        combined[to_col].astype(str).str.replace(",", "").str.strip(), errors="coerce"
    ).fillna(0.0)
    
    combined["passengers_from"] = pd.to_numeric(
        combined[from_col].astype(str).str.replace(",", "").str.strip(), errors="coerce"
    ).fillna(0.0)
    
    combined["route_passengers"] = combined["passengers_to"] + combined["passengers_from"]
    
    # Standardize route_id in canonical directional format: ORIGIN-DESTINATION
    combined["route_id"] = combined["origin"] + "-" + combined["destination"]
    
    # Group by route and aggregate passengers
    aggregated = (
        combined.groupby(["route_id", "origin", "destination"], as_index=False)["route_passengers"]
        .sum()
        .rename(columns={"route_passengers": "total_passengers"})
    )
    
    # Filter out routes with 0 passengers
    aggregated = aggregated[aggregated["total_passengers"] > 0].reset_index(drop=True)
    return aggregated

def clean_airline_data(df: pd.DataFrame, airline_name: str) -> pd.DataFrame:
    """
    Clean airline operational statistical DataFrame.
    Converts string numeric columns to float/int and adds airline column.
    """
    if df.empty:
        return df
        
    df_clean = df.copy()
    df_clean["airline"] = airline_name.strip()
    
    # Numeric cleanup for statistical columns
    numeric_cols = [c for c in df_clean.columns if c not in ["MONTH", "SOURCE_FILE", "airline"]]
    for col in numeric_cols:
        df_clean[col] = pd.to_numeric(
            df_clean[col].astype(str).str.replace(",", "").str.strip(), errors="coerce"
        ).fillna(0.0)
        
    return df_clean
