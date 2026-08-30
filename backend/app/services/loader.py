import os
import re
from pathlib import Path
from typing import Dict, List, Any, Optional
import pandas as pd

VALID_MONTHS = {
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "JULY", "AUG", "SEP", "OCT", "NOV", "DEC",
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "JUNE",
    "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
}

DGCA_AIRLINE_COLUMNS = [
    "MONTH",
    "DEPARTURES",
    "HOURS",
    "KILOMETRE",
    "PASSENGERS_CARRIED",
    "PASSENGER_KILOMETRES_PERFORMED",
    "SEAT_KILOMETRES_AVAILABLE",
    "PASSENGER_LOAD_FACTOR",
    "FREIGHT_CARRIED_TONNES",
    "MAIL_CARRIED_TONNES",
    "FREIGHT_MAIL_TONNES_PERFORMED",
    "TOTAL_TONNES_PERFORMED",
    "CAPACITY_TONNES_AVAILABLE",
    "WEIGHT_LOAD_FACTOR",
    "REV_PASSENGERS",
    "NON_REV_PASSENGERS",
    "AIRCRAFT_KMS",
]

def get_default_raw_dir() -> Path:
    """
    Return the primary raw data directory.
    Checks data/raw first, falls back to app/data/raw.
    """
    base_dir = Path(__file__).resolve().parent.parent.parent
    p1 = base_dir / "data" / "raw"
    if p1.exists() and any(p1.glob("*.xlsx")):
        return p1
    p2 = base_dir / "app" / "data" / "raw"
    if p2.exists() and any(p2.glob("*.xlsx")):
        return p2
    p1.mkdir(parents=True, exist_ok=True)
    return p1

def scan_raw_directory(raw_dir: Optional[Path] = None) -> List[Path]:
    """Scan and return all Excel (.xlsx, .xls) files in raw directory."""
    target_dir = Path(raw_dir) if raw_dir else get_default_raw_dir()
    if not target_dir.exists():
        target_dir.mkdir(parents=True, exist_ok=True)
        return []
    
    files = [p for p in target_dir.iterdir() if p.is_file() and p.suffix.lower() in [".xlsx", ".xls"]]
    
    # Also check other candidate raw directories if primary has few files
    base_dir = Path(__file__).resolve().parent.parent.parent
    other_dir = base_dir / "app" / "data" / "raw" if "app" not in target_dir.parts else base_dir / "data" / "raw"
    if other_dir.exists():
        for p in other_dir.iterdir():
            if p.is_file() and p.suffix.lower() in [".xlsx", ".xls"] and p.name not in [f.name for f in files]:
                files.append(p)
                
    return files

def load_citypair_excel(file_path: Path) -> pd.DataFrame:
    """
    Load DGCA City-Pair Traffic Excel file (e.g. DOM CITYPAIR DATA, JANUARY 2026.xlsx).
    Header: Row 0 & 1 are titles. Row 2 is column headers.
    Data starts at Row 3 (skiprows=2).
    """
    df = pd.read_excel(file_path, skiprows=2)
    sno_col = df.columns[0]
    
    # Filter rows where S.No is numeric (handles both string '1' and int 1, drops subtotals/totals)
    valid_mask = pd.to_numeric(df[sno_col], errors="coerce").notnull()
    df_clean = df[valid_mask].copy()
    
    if len(df_clean.columns) >= 5:
        rename_map = {
            df_clean.columns[0]: "S_NO",
            df_clean.columns[1]: "CITY_1",
            df_clean.columns[2]: "CITY_2",
            df_clean.columns[3]: "PASSENGERS_TO_CITY_2",
            df_clean.columns[4]: "PASSENGERS_FROM_CITY_2",
        }
        df_clean = df_clean.rename(columns=rename_map)
    
    df_clean["SOURCE_FILE"] = file_path.name
    return df_clean

def load_airline_excel(file_path: Path) -> pd.DataFrame:
    """
    Load Airline Specific Traffic Excel file (e.g. indigo26.xlsx, Air India26.xlsx).
    Extracts ONLY the Scheduled Domestic Services section.
    Skiprows=3, assign 17 column names, stop at MONTH == 'TOTAL'.
    """
    df = pd.read_excel(file_path, skiprows=3, header=None)
    num_cols = min(len(df.columns), len(DGCA_AIRLINE_COLUMNS))
    df = df.iloc[:, :num_cols].copy()
    df.columns = DGCA_AIRLINE_COLUMNS[:num_cols]
    
    cleaned_rows = []
    for _, row in df.iterrows():
        month_val = str(row["MONTH"]).strip().upper()
        if month_val == "TOTAL" or "TOTAL" in month_val:
            break
        # Keep only recognized month abbreviations
        if any(month_val.startswith(m) for m in VALID_MONTHS):
            # Check if has numeric data
            pax_val = pd.to_numeric(str(row.get("PASSENGERS_CARRIED", "")).replace(",", "").strip(), errors="coerce")
            if pd.notna(pax_val) or str(row["MONTH"]).strip() != "":
                cleaned_rows.append(row)
            
    if cleaned_rows:
        df_clean = pd.DataFrame(cleaned_rows)
    else:
        df_clean = pd.DataFrame(columns=DGCA_AIRLINE_COLUMNS[:num_cols])
        
    df_clean["SOURCE_FILE"] = file_path.name
    return df_clean

def normalize_cpi_month(value: Any, year: Any = None) -> str:
    """Return a stable YYYY-MM key for CPI joins and database storage."""
    raw = f"{year} {value}" if year is not None else str(value)
    parsed = pd.to_datetime(raw.replace("*", "").strip(), errors="coerce")
    if pd.isna(parsed):
        return str(value).replace("*", "").strip()
    return parsed.strftime("%Y-%m")


def _load_cpi_dashboard_excel(file_path: Path, sheet_names: list[str]) -> pd.DataFrame:
    """Load MoSPI dashboard sheets containing Rural, Urban and Combined CPI."""
    series = {}
    for label in ("Rural", "Urban", "Combined"):
        sheet_name = next((
            name for name in sheet_names
            if " ".join(name.replace("-", " ").lower().split()) == f"cpi {label.lower()}"
        ), None)
        if not sheet_name:
            continue
        frame = pd.read_excel(file_path, sheet_name=sheet_name)
        frame.columns = [str(column).strip() for column in frame.columns]
        if "Year" not in frame.columns:
            frame = pd.read_excel(file_path, sheet_name=sheet_name, header=1)
            frame.columns = [str(column).strip() for column in frame.columns]
        value_column = next((column for column in frame.columns if column.lower() == label.lower()), None)
        if not value_column or not {"Year", "Month"}.issubset(frame.columns):
            continue
        if "Description" in frame.columns:
            frame = frame[frame["Description"].astype(str).str.contains("General Index", case=False, na=False)]
        rows = {}
        for _, row in frame.iterrows():
            value = pd.to_numeric(row.get(value_column), errors="coerce")
            if pd.notna(value):
                rows[normalize_cpi_month(row.get("Month"), row.get("Year"))] = float(value)
        series[label.lower()] = rows

    combined = series.get("combined", {})
    return pd.DataFrame([{
        "month": month,
        "combined_index": combined_index,
        "inflation_pct": None,
        "rural_index": series.get("rural", {}).get(month),
        "urban_index": series.get("urban", {}).get(month),
    } for month, combined_index in sorted(combined.items())])


def load_cpi_excel(file_path: Path) -> pd.DataFrame:
    """
    Load CPI Reference Annexure Excel file.
    Extracts Monthly Combined Index and Inflation (%).
    """
    sheet_names = pd.ExcelFile(file_path).sheet_names
    if any(" ".join(name.replace("-", " ").lower().split()) == "cpi combined" for name in sheet_names):
        return _load_cpi_dashboard_excel(file_path, sheet_names)

    df = pd.read_excel(file_path, header=None)
    
    # Rows 4 to 22 contains monthly CPI data
    records = []
    for idx in range(4, len(df)):
        row = df.iloc[idx]
        month_raw = str(row[0]).strip()
        
        # Stop at footnotes
        if not month_raw or month_raw.startswith("*") or "provisional" in month_raw.lower():
            continue
            
        # Clean month format (e.g. 'Jan-25', 'Jul-26*')
        clean_month = normalize_cpi_month(month_raw)
            
        combined_idx = pd.to_numeric(row[3], errors="coerce")
        combined_inf = pd.to_numeric(row[6], errors="coerce") if len(row) > 6 else None
        
        if pd.notna(combined_idx):
            records.append({
                "month": clean_month,
                "combined_index": float(combined_idx),
                "inflation_pct": float(combined_inf) if pd.notna(combined_inf) else None,
                "rural_index": pd.to_numeric(row[1], errors="coerce"),
                "urban_index": pd.to_numeric(row[2], errors="coerce"),
            })
            
    return pd.DataFrame(records)

def load_raw_data(raw_dir: Optional[Path] = None) -> Dict[str, Any]:
    """
    Scan raw directory and load all 20 DGCA Excel datasets into categorized dictionary.
    """
    files = scan_raw_directory(raw_dir)
    result = {
        "citypair": [],
        "airline": {},
        "totaldom": None,
        "cpi": None,
    }
    
    for f in files:
        name_lower = f.name.lower()
        if "dom citypair" in name_lower or "citypair" in name_lower:
            try:
                result["citypair"].append(load_citypair_excel(f))
            except Exception as e:
                print(f"[Loader] Error reading citypair {f.name}: {e}")
        elif "totaldom" in name_lower:
            try:
                result["totaldom"] = load_airline_excel(f)
            except Exception as e:
                print(f"[Loader] Error reading totaldom {f.name}: {e}")
        elif "annexure" in name_lower or "cpi" in name_lower or "annex" in name_lower:
            try:
                result["cpi"] = load_cpi_excel(f)
            except Exception as e:
                print(f"[Loader] Error reading CPI {f.name}: {e}")
        else:
            try:
                airline_key = f.stem.replace("26", "").replace("2026", "").strip()
                result["airline"][airline_key] = load_airline_excel(f)
            except Exception as e:
                print(f"[Loader] Error reading airline {f.name}: {e}")
                
    return result
