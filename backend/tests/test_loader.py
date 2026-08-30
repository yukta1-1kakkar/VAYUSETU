import pytest
import pandas as pd
from pathlib import Path
import tempfile

from app.services.loader import (
    load_citypair_excel,
    load_airline_excel,
    scan_raw_directory,
    load_raw_data,
    DGCA_AIRLINE_COLUMNS,
    load_cpi_excel,
)


def test_load_mospi_cpi_dashboard_workbook(tmp_path):
    test_file = tmp_path / "CPI Dashboard Data.xlsx"
    with pd.ExcelWriter(test_file) as writer:
        for label, values in {
            "Rural": [104.59, 108.34],
            "Urban": [104.28, 107.45],
            "Combined": [104.45, 107.94],
        }.items():
            pd.DataFrame({
                "Year": [2026, 2026], "Month": ["January", "July"],
                "State": ["ALL India", "ALL India"],
                "Description": ["General Index (All Groups)"] * 2,
                label: values,
            }).to_excel(writer, sheet_name=f"CPI- {label}" if label != "Combined" else "CPI Combined", index=False)

    result = load_cpi_excel(test_file)

    assert result["month"].tolist() == ["2026-01", "2026-07"]
    assert result["combined_index"].tolist() == [104.45, 107.94]
    assert result["rural_index"].tolist() == [104.59, 108.34]
    assert result["urban_index"].tolist() == [104.28, 107.45]

def test_load_citypair_excel(tmp_path):
    # Construct mock City-Pair Excel file matching DGCA structure
    # Row 0: Title 1
    # Row 1: Title 2
    # Row 2: Headers
    # Row 3+: Data rows + Subtotal / Total rows
    data = [
        ["DIRECTORATE GENERAL OF CIVIL AVIATION", "", "", "", "", ""],
        ["DOMESTIC CITY-PAIR TRAFFIC STATISTICS", "", "", "", "", ""],
        ["S.No.", "CITY 1", "CITY 2", "PASSENGERS TO CITY 2", "PASSENGERS FROM CITY 2", "TOTAL"],
        [1, "DELHI (DEL)", "MUMBAI (BOM)", "15000", "14500", "29500"],
        [2, "BENGALURU (BLR)", "DELHI (DEL)", "12000", "11800", "23800"],
        ["SUB TOTALS", "", "", "27000", "26300", "53300"],
        ["TOTALS", "", "", "27000", "26300", "53300"],
    ]
    df_raw = pd.DataFrame(data)
    test_file = tmp_path / "DOM CITYPAIR DATA, JAN 2026.xlsx"
    df_raw.to_excel(test_file, index=False, header=False)

    df_loaded = load_citypair_excel(test_file)
    assert len(df_loaded) == 2
    assert "S_NO" in df_loaded.columns
    assert "CITY_1" in df_loaded.columns
    assert "CITY_2" in df_loaded.columns
    assert list(df_loaded["S_NO"]) == [1, 2]

def test_load_airline_excel(tmp_path):
    # Construct mock Airline Excel file matching DGCA structure
    # Row 0: Airline Name / Year
    # Row 1: Main Header
    # Row 2: Sub Header
    # Row 3+: Months, stopping at "TOTAL"
    row0 = ["INDIGO AIRLINES - 2026"] + [""] * 16
    row1 = ["MONTH", "OPERATIONAL STATS", "", "", "TRAFFIC STATS", "", "", "", "", "", "", "", "", "", "", "", ""]
    row2 = ["MONTH", "DEP", "HRS", "KM", "PAX", "RPK", "ASK", "PLF", "FRT", "MAIL", "FTK", "RTK", "ATK", "WLF", "REV", "NON_REV", "AC_KM"]
    row3 = ["JAN", 1000, 2000, 3000, 50000, 100000, 120000, 83.3, 100, 10, 500, 600, 700, 85.0, 49000, 1000, 2500]
    row4 = ["FEB", 950, 1900, 2900, 48000, 96000, 115000, 83.5, 95, 9, 480, 580, 680, 85.3, 47000, 1000, 2400]
    row5 = ["TOTAL", 1950, 3900, 5900, 98000, 196000, 235000, 83.4, 195, 19, 980, 1180, 1380, 85.1, 96000, 2000, 4900]
    row6 = ["INTERNATIONAL SECTION - SHOULD NOT BE READ"] + [""] * 16

    df_raw = pd.DataFrame([row0, row1, row2, row3, row4, row5, row6])
    test_file = tmp_path / "indigo26.xlsx"
    df_raw.to_excel(test_file, index=False, header=False)

    df_loaded = load_airline_excel(test_file)
    assert len(df_loaded) == 2
    assert list(df_loaded["MONTH"]) == ["JAN", "FEB"]
    assert "PASSENGERS_CARRIED" in df_loaded.columns
