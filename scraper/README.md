# VAYUSETU airfare collectors

The implemented collectors cover the same 24 DGCA-weighted routes and T+1,
T+7, T+15, T+30 and T+45 advance-purchase windows.

| Source | Collector | Access |
|---|---|---|
| Air India Express | `airindiaexpress.py` | Public browser flow; permission/policy review required |
| Akasa Air | `akasaair.py` | Browser flow; written permission required |
| SpiceJet | `spicejet.py` | Browser flow; written permission required |
| Yatra | `yatra.py` | Reviewed public `/flight-schedule/` pages only |

The non-functional API placeholders for IndiGo, Air India, Skyscanner,
Cleartrip, Ixigo, MakeMyTrip, Goibibo and EaseMyTrip were removed. They can be
restored later only when the team has an approved API/feed or written access.

## Install

```powershell
cd scraper
python -m pip install -r requirements.txt
playwright install chromium firefox
```

## Cloud ETL

Every completed full scrape writes its JSON output and then invokes the backend
ETL automatically when `DATABASE_URL` is set. The ETL validates required
fields, preserves unavailable/sold-out rows, separates available fare
components, deduplicates daily flight offers, quarantines inconsistent records
and IQR outliers, and stores raw payloads for audit.

```powershell
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/vayusetu?sslmode=require"
python run_daily.py
```

`run_daily.py` starts all selected collectors simultaneously with a
`ThreadPoolExecutor`. At completion it prints the measured thread-pool wall
time, the equivalent sequential time (sum of the same collector durations),
time saved, and speedup. The latest report is written to
`last_tpe_benchmark.json`.

Limit concurrency when the machine has less memory:

```powershell
python run_daily.py --workers 2
```

Run a selected authorized source:

```powershell
python run_daily.py --source yatra --headed
python run_daily.py --source akasaair
```

Disable automatic loading when debugging locally:

```powershell
$env:VAYUSETU_AUTO_ETL="false"
```

The database retains `observation_date` in the daily fingerprint. Re-running
the same offer on the same day updates that snapshot; the following day's run
inserts a new snapshot, producing the required 30-day backtest history.
