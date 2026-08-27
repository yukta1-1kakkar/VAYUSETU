import pytest
import pandas as pd
from app.services.cleaner import standardize_city_name, clean_citypair_data, clean_airline_data

def test_standardize_city_name():
    assert standardize_city_name("DELHI (DEL)") == "DELHI"
    assert standardize_city_name("  mumbai (bom)  ") == "MUMBAI"
    assert standardize_city_name("BENGALURU / BANGALORE (BLR)") == "BENGALURU BANGALORE"
    assert standardize_city_name(None) == ""
    assert standardize_city_name(123) == "123"

def test_clean_citypair_data():
    df1 = pd.DataFrame({
        "S_NO": [1, 2],
        "CITY_1": ["DELHI (DEL)", "MUMBAI (BOM)"],
        "CITY_2": ["MUMBAI (BOM)", "BENGALURU (BLR)"],
        "PASSENGERS_TO_CITY_2": ["10,000", "5,000"],
        "PASSENGERS_FROM_CITY_2": ["12,000", "4,500"],
    })
    
    df2 = pd.DataFrame({
        "S_NO": [1],
        "CITY_1": ["DELHI (DEL)"],
        "CITY_2": ["MUMBAI (BOM)"],
        "PASSENGERS_TO_CITY_2": ["8,000"],
        "PASSENGERS_FROM_CITY_2": ["9,000"],
    })
    
    cleaned = clean_citypair_data([df1, df2])
    assert len(cleaned) == 2
    assert "route_id" in cleaned.columns
    assert "total_passengers" in cleaned.columns
    
    # DEL-BOM total: (10000+12000) + (8000+9000) = 39000
    del_bom = cleaned[cleaned["route_id"] == "DELHI-MUMBAI"].iloc[0]
    assert del_bom["total_passengers"] == 39000.0

def test_clean_airline_data():
    df = pd.DataFrame({
        "MONTH": ["JAN", "FEB"],
        "PASSENGERS_CARRIED": ["50,000", "48,000"],
        "SOURCE_FILE": ["indigo26.xlsx", "indigo26.xlsx"],
    })
    cleaned = clean_airline_data(df, "IndiGo")
    assert cleaned["airline"].iloc[0] == "IndiGo"
    assert cleaned["PASSENGERS_CARRIED"].iloc[0] == 50000.0
