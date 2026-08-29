"""Automatically pass completed scraper output through the cloud ETL pipeline."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

from dotenv import load_dotenv


SCRAPER_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRAPER_DIR.parent / "backend"
load_dotenv(SCRAPER_DIR / ".env")
load_dotenv(BACKEND_DIR / ".env")


def persist_scraper_output(output_path: Path) -> bool:
    """Load one output file when a cloud DATABASE_URL is configured."""
    if os.getenv("VAYUSETU_AUTO_ETL", "true").strip().lower() in {"0", "false", "no"}:
        print("[i] Automatic ETL disabled by VAYUSETU_AUTO_ETL")
        return False
    if not os.getenv("DATABASE_URL"):
        print("[i] DATABASE_URL is not set; JSON saved locally and cloud ETL skipped")
        return False

    command = [
        sys.executable,
        "-m",
        "app.etl.scraper_pipeline",
        "--file",
        str(output_path.resolve()),
    ]
    result = subprocess.run(
        command,
        cwd=BACKEND_DIR,
        check=False,
        text=True,
        capture_output=True,
    )
    if result.stdout.strip():
        print(result.stdout.strip())
    if result.returncode != 0:
        raise RuntimeError(f"Cloud ETL failed: {result.stderr.strip()}")
    return True
