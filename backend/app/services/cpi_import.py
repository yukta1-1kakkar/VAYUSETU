"""Import an official MoSPI CPI dashboard workbook into CPIReference."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from app.database.db import SessionLocal
from app.services.loader import load_cpi_excel
from app.services.route_weights import sync_cpi_data


def import_cpi_workbook(path: Path) -> dict:
    frame = load_cpi_excel(path)
    if frame.empty:
        raise ValueError(f"No Combined CPI observations found in {path.name}")
    db = SessionLocal()
    try:
        sync_cpi_data(frame, db=db)
    finally:
        db.close()
    return {
        "source": str(path.resolve()),
        "records": len(frame),
        "startMonth": str(frame.iloc[0]["month"]),
        "endMonth": str(frame.iloc[-1]["month"]),
        "series": "MoSPI All-India General CPI (Combined)",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Import MoSPI CPI dashboard data")
    parser.add_argument("--file", type=Path, required=True)
    args = parser.parse_args()
    print(json.dumps(import_cpi_workbook(args.file), indent=2))


if __name__ == "__main__":
    main()
