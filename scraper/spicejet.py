
import asyncio
import json
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

from playwright.async_api import async_playwright
from playwright_stealth import Stealth

# ---------------------------
# CONFIG
# ---------------------------

ADVANCE_WINDOWS = [1, 7, 15, 30, 45]

DELAY_BETWEEN_REPLAY_CALLS = 12
DELAY_BETWEEN_ROUTES = 15
CONSECUTIVE_403_BACKOFF = 60
MAX_CONSECUTIVE_FAILURES = 5
MAX_RETRIES_PER_DATE = 4
RETRY_BACKOFF_BASE = 20

OUTPUT_DIR = Path("spice_data")
OUTPUT_DIR.mkdir(exist_ok=True)
CONFIG_OUTPUT_PATH = OUTPUT_DIR / "spicejet_top_24_routes.json"

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36"
)

# Exact endpoints confirmed from your DevTools capture
TOKEN_URL = "https://www.spicejet.com/api/v1/token"
AVAILABILITY_URL = "https://www.spicejet.com/api/v3/search/availability"
LOWFARE_URL = "https://www.spicejet.com/api/v2/search/lowfare"
BOOKING_CREATE_URL = "https://www.spicejet.com/api/v1/booking/create"  # not called; scraping only
MANIFEST_URL = "https://www.spicejet.com/manifest.json"
MEALS_META_URL = "https://www.spicejet.com/api/v1/mealsMetaInfo/getAllMealsInfo"
META_INFO_URL = "https://www.spicejet.com/api/v1/metaInfo/getAllMetaInfo"

ROBOTS_CACHE = {}


def robots_allowed(url: str) -> bool:
    parsed = urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    parser = ROBOTS_CACHE.get(robots_url)
    if parser is None:
        parser = RobotFileParser(robots_url)
        try:
            parser.read()
        except Exception as exc:
            print(f"  [!] Could not read {robots_url}: {exc}; skipping URL")
            return False
        ROBOTS_CACHE[robots_url] = parser
    return parser.can_fetch("*", url)


CITY_TO_IATA = {
    "DELHI": "DEL", "MUMBAI": "BOM", "BENGALURU": "BLR", "HYDERABAD": "HYD",
    "KOLKATA": "CCU", "PUNE": "PNQ", "GOA": "GOX", "AHMEDABAD": "AMD",
    "CHENNAI": "MAA", "SRINAGAR": "SXR", "GUWAHATI": "GAU", "PATNA": "PAT",
    "LUCKNOW": "LKO", "KOCHI": "COK",
}

PRIORITY_ROUTES = [
    ("DELHI", "MUMBAI", 4029444),
    ("BENGALURU", "DELHI", 2885936),
    ("BENGALURU", "MUMBAI", 2476421),
    ("DELHI", "HYDERABAD", 1862287),
    ("DELHI", "KOLKATA", 1778985),
    ("DELHI", "PUNE", 1704284),
    ("GOA", "MUMBAI", 1495328),
    ("AHMEDABAD", "DELHI", 1402813),
    ("DELHI", "GOA", 1352032),
    ("CHENNAI", "MUMBAI", 1312448),
    ("HYDERABAD", "MUMBAI", 1285881),
    ("KOLKATA", "MUMBAI", 1281897),
    ("CHENNAI", "DELHI", 1277274),
    ("BENGALURU", "HYDERABAD", 1217734),
    ("AHMEDABAD", "MUMBAI", 1215086),
    ("BENGALURU", "KOLKATA", 1204113),
    ("DELHI", "SRINAGAR", 1141145),
    ("BENGALURU", "PUNE", 1079353),
    ("DELHI", "GUWAHATI", 938099),
    ("DELHI", "PATNA", 908354),
    ("BENGALURU", "GOA", 875214),
    ("BENGALURU", "CHENNAI", 872523),
    ("DELHI", "LUCKNOW", 854555),
    ("KOCHI", "MUMBAI", 805813),
]


def build_routes():
    routes = []
    for o_city, d_city, pax in PRIORITY_ROUTES:
        o_code = CITY_TO_IATA.get(o_city, o_city[:3])
        d_code = CITY_TO_IATA.get(d_city, d_city[:3])
        route_id = f"{o_city}-{d_city}"
        routes.append((o_code, d_code, route_id, pax))
    return routes


ROUTES = build_routes()


# ---------------------------
# NULL SANITIZER
# ---------------------------
NUMERIC_FIELDS = {
    "total_passengers", "advance_purchase_days", "passenger_count",
    "stops", "duration_minutes", "base_fare", "taxes",
    "mandatory_fees", "total_fare", "seats_available",
    "data_quality_score",
}
STRING_FIELDS = {
    "route_id", "origin", "destination", "travel_date", "trip_type",
    "cabin", "airline_code", "airline_name", "flight_number",
    "departure_time", "arrival_time", "fare_family", "currency",
    "availability_status", "source", "source_type", "scrape_outcome",
}
BOOL_FIELDS = {"no_flights", "sold_out"}


def sanitize_record(record: dict) -> dict:
    """Replace every null with a type-appropriate default. data_quality_score
    stays the real signal for 'is this row trustworthy' -- don't average
    total_fare across rows without filtering on it first."""
    clean = dict(record)
    for key, value in clean.items():
        if value is not None:
            continue
        if key in NUMERIC_FIELDS:
            clean[key] = 0
        elif key in BOOL_FIELDS:
            clean[key] = False
        elif key in STRING_FIELDS:
            clean[key] = "N/A"
        else:
            clean[key] = "N/A"
    if "scrape_outcome" not in clean:
        clean["scrape_outcome"] = "ok"
    return clean


# ---------------------------
# CORE SCRAPE FUNCTION (network-intercept style, like Akasa)
# ---------------------------
async def scrape_single_date(origin: str, dest: str, travel_date: str, browser, headless: bool = True):
    """
    Fresh browser context per date (WAF fingerprints by session -- see notes
    in earlier version). Captures the *actual* API responses fired by
    SpiceJet's own front-end JS: token -> availability -> lowfare, matching
    exactly the endpoints seen in your DevTools capture.
    """
    captured = {"token": None, "availability": None, "lowfare": None}

    async def handle_response(response, captured=captured):
        url = response.url
        path = urlparse(url).path.lower()
        if response.status != 200:
            return
        try:
            if path.endswith("/api/v1/token") and captured["token"] is None:
                body = await response.json()
                captured["token"] = body.get("data", body)
            elif path.endswith("/api/v3/search/availability") and captured["availability"] is None:
                body = await response.json()
                captured["availability"] = body.get("data", body)
            elif path.endswith("/api/v2/search/lowfare") and captured["lowfare"] is None:
                body = await response.json()
                captured["lowfare"] = body.get("data", body)
        except Exception:
            pass

    search_url = (
        f"https://www.spicejet.com/search?from={origin}&to={dest}"
        f"&tripType=1&departure={travel_date}&adult=1&child=0&srCitizen=0"
        f"&infant=0&currency=INR&redirectTo=/"
    )
    if not robots_allowed(search_url):
        print(f"  [!] Robots policy disallows {search_url}")
        return captured, "robots_disallowed"

    stealth = Stealth()
    context = await browser.new_context(
        user_agent=USER_AGENT,
        viewport={"width": 1366, "height": 768},
        locale="en-IN",
    )
    page = await context.new_page()
    await stealth.apply_stealth_async(page)
    page.on("response", handle_response)

    outcome = "ok"
    try:
        resp = await page.goto(search_url, wait_until="load", timeout=30000)
        status = resp.status if resp is not None else None
        print(f"  [i] page load status={status} for {origin}->{dest} {travel_date}")

        deadline = asyncio.get_event_loop().time() + 15
        while asyncio.get_event_loop().time() < deadline:
            if captured["availability"] is not None or captured["lowfare"] is not None:
                break
            await page.wait_for_timeout(1000)

        if captured["availability"] is None and captured["lowfare"] is None:
            try:
                no_flights_visible = await page.locator(
                    "text=/no flights? found/i, text=/no flights available/i, "
                    "text=/sorry.*no.*flight/i"
                ).first.is_visible(timeout=1000)
            except Exception:
                no_flights_visible = False

            if no_flights_visible:
                outcome = "genuine_no_flights"
            else:
                try:
                    spinner_visible = await page.locator(
                        "[class*='spinner' i], [class*='loader' i], [class*='loading' i]"
                    ).first.is_visible(timeout=1000)
                except Exception:
                    spinner_visible = False
                outcome = "stuck_spinner" if spinner_visible else "no_api_captured"

                shot_path = OUTPUT_DIR / f"debug_{origin}_{dest}_{travel_date}.png"
                try:
                    await page.screenshot(path=str(shot_path), full_page=True)
                    print(f"  [!] {outcome} -- screenshot saved: {shot_path}")
                except Exception:
                    pass
    except Exception as e:
        print(f"  [!] Navigation error for {origin}->{dest} {travel_date}: {e}")
        outcome = "nav_error"
    finally:
        page.remove_listener("response", handle_response)
        await context.close()

    return captured, outcome


async def scrape_date_with_retries(origin: str, dest: str, travel_date: str, browser, headless: bool = True):
    last_outcome = "not_attempted"
    for attempt in range(1, MAX_RETRIES_PER_DATE + 1):
        captured, outcome = await scrape_single_date(origin, dest, travel_date, browser, headless=headless)
        last_outcome = outcome

        got_data = bool(captured["availability"] or captured["lowfare"])
        if got_data or outcome == "genuine_no_flights":
            if attempt > 1:
                print(f"  [i] Resolved after {attempt} attempt(s): outcome={outcome}")
            return captured, outcome

        if attempt < MAX_RETRIES_PER_DATE:
            backoff = RETRY_BACKOFF_BASE * attempt
            print(f"  [!] Attempt {attempt}/{MAX_RETRIES_PER_DATE} failed ({outcome}) "
                  f"-- retrying in {backoff}s")
            await asyncio.sleep(backoff)

    print(f"  [!] Exhausted {MAX_RETRIES_PER_DATE} attempts for {origin}->{dest} {travel_date} "
          f"-- recording as blocked (last outcome: {last_outcome})")
    return {"token": None, "availability": None, "lowfare": None}, "blocked_after_retries"


async def scrape_route(origin: str, dest: str, travel_dates: list, browser, headless: bool = True):
    results = {}
    outcomes = {}
    consecutive_failures = 0

    for travel_date in travel_dates:
        if consecutive_failures >= MAX_CONSECUTIVE_FAILURES:
            print(f"  [!] {consecutive_failures} consecutive failures -- cooling down {CONSECUTIVE_403_BACKOFF}s")
            await asyncio.sleep(CONSECUTIVE_403_BACKOFF)
            consecutive_failures = 0

        captured, outcome = await scrape_date_with_retries(origin, dest, travel_date, browser, headless=headless)
        results[travel_date] = captured
        outcomes[travel_date] = outcome

        if outcome in ("ok", "genuine_no_flights") or (captured["availability"] or captured["lowfare"]):
            consecutive_failures = 0
        else:
            consecutive_failures += 1

        await asyncio.sleep(DELAY_BETWEEN_REPLAY_CALLS)

    return results, outcomes


# ---------------------------
# NORMALIZATION
# ---------------------------
def elapsed_minutes(departure, arrival):
    try:
        start = datetime.fromisoformat(str(departure))
        end = datetime.fromisoformat(str(arrival))
        return int((end - start).total_seconds() // 60)
    except (TypeError, ValueError):
        return None


def fares_by_key(fares_available: dict):
    return fares_available if isinstance(fares_available, dict) else {}


def fare_components(fare_value: dict):
    passenger_fares = fare_value.get("passengerFares") or []
    adt = next((p for p in passenger_fares if p.get("passengerType") == "ADT"), None)
    if not adt:
        adt = passenger_fares[0] if passenger_fares else {}
    total_fare = adt.get("fareAmount")
    base_fare = adt.get("revenueFare")
    taxes = (total_fare - base_fare) if isinstance(total_fare, (int, float)) and isinstance(base_fare, (int, float)) else None
    return {
        "base_fare": base_fare,
        "taxes": taxes,
        "total_fare": total_fare,
        "fare_family": fare_value.get("productClass"),
    }


def normalize_response(entry: dict, origin: str, dest: str, travel_date: str,
                        adv: int, route_id: str, total_passengers: int, outcome: str = "ok"):
    records = []
    now_iso = datetime.now().astimezone().isoformat()
    availability = entry.get("availability")
    lowfare = entry.get("lowfare")

    fares_lookup = fares_by_key((availability or {}).get("faresAvailable"))

    journeys = []
    for trip in (availability or {}).get("trips") or []:
        for journey in trip.get("journeysAvailable") or []:
            journeys.append(journey)

    for journey in journeys:
        designator = journey.get("designator") or {}
        segments = journey.get("segments") or []
        flight_numbers = []
        for segment in segments:
            identifier = segment.get("identifier") or {}
            number = identifier.get("identifier")
            carrier = identifier.get("carrierCode") or "SG"
            if number:
                flight_numbers.append(f"{carrier}{number}")

        fare_options = []
        for key, fare_meta in (journey.get("fares") or {}).items():
            fare_value = fares_lookup.get(key)
            if not fare_value:
                continue
            comp = fare_components(fare_value)
            comp["seats_available"] = fare_meta.get("availableCount")
            fare_options.append(comp)

        priced = [f for f in fare_options if f.get("total_fare") is not None]
        chosen = min(priced, key=lambda f: f["total_fare"]) if priced else {}

        departure = designator.get("departure")
        arrival = designator.get("arrival")
        records.append({
            "observation_id": f"obs_{uuid.uuid4().hex[:12]}",
            "collection_timestamp": now_iso, "route_id": route_id,
            "total_passengers": total_passengers, "origin": origin, "destination": dest,
            "travel_date": str(departure or travel_date)[:10],
            "advance_purchase_days": adv, "trip_type": "one_way",
            "passenger_count": 1, "cabin": "economy",
            "stops": journey.get("stops"),
            "airline_code": "SG", "airline_name": "SpiceJet",
            "flight_number": "/".join(flight_numbers) if flight_numbers else None,
            "departure_time": departure, "arrival_time": arrival,
            "duration_minutes": elapsed_minutes(departure, arrival),
            "fare_family": chosen.get("fare_family"),
            "base_fare": chosen.get("base_fare"),
            "taxes": chosen.get("taxes"),
            "mandatory_fees": None,
            "total_fare": chosen.get("total_fare"),
            "currency": (availability or {}).get("currencyCode", "INR"),
            "availability_status": "available",
            "seats_available": chosen.get("seats_available"),
            "source": "SpiceJet", "source_type": "airline", "data_quality_score": 100,
            "no_flights": False, "sold_out": False,
            "scrape_outcome": outcome,
        })

    if not records:
        low_fares = (lowfare or {}).get("lowFareDateMarkets") or []
        match = next((f for f in low_fares if str(f.get("departureDate", ""))[:10] == travel_date), None)
        if match:
            fare_amt = match.get("lowestFareAmount") or {}
            base = fare_amt.get("fareAmount")
            taxes = fare_amt.get("taxesAndFeesAmount")
            total = (base or 0) + (taxes or 0) if base is not None or taxes is not None else None
            records.append({
                "observation_id": f"obs_{uuid.uuid4().hex[:12]}",
                "collection_timestamp": now_iso, "route_id": route_id,
                "total_passengers": total_passengers, "origin": origin, "destination": dest,
                "travel_date": travel_date, "advance_purchase_days": adv, "trip_type": "one_way",
                "passenger_count": 1, "cabin": "economy", "stops": None,
                "airline_code": "SG", "airline_name": "SpiceJet",
                "flight_number": None, "departure_time": None, "arrival_time": None,
                "duration_minutes": None, "fare_family": None,
                "base_fare": base, "taxes": taxes, "mandatory_fees": None, "total_fare": total,
                "currency": (lowfare or {}).get("currencyCode", "INR"),
                "availability_status": "available" if total is not None else "no_flights",
                "seats_available": None, "source": "SpiceJet", "source_type": "airline",
                "data_quality_score": 70 if total is not None else 0,
                "no_flights": total is None, "sold_out": False,
                "scrape_outcome": outcome,
            })

    if not records:
        if outcome == "genuine_no_flights":
            availability_status = "no_flights"
            no_flights_flag = True
        elif outcome == "blocked_after_retries":
            availability_status = "blocked"
            no_flights_flag = None
        else:
            availability_status = "no_flights" if availability is not None else "not_collected"
            no_flights_flag = True if availability is not None else None

        records.append({
            "observation_id": f"obs_{uuid.uuid4().hex[:12]}",
            "collection_timestamp": now_iso, "route_id": route_id,
            "total_passengers": total_passengers, "origin": origin, "destination": dest,
            "travel_date": travel_date, "advance_purchase_days": adv, "trip_type": "one_way",
            "passenger_count": 1, "cabin": "economy", "stops": None,
            "airline_code": "SG", "airline_name": "SpiceJet",
            "flight_number": None, "departure_time": None, "arrival_time": None,
            "duration_minutes": None, "fare_family": None,
            "base_fare": None, "taxes": None, "mandatory_fees": None, "total_fare": None,
            "currency": "INR",
            "availability_status": availability_status,
            "seats_available": 0 if availability_status == "no_flights" else None,
            "source": "SpiceJet", "source_type": "airline",
            "data_quality_score": 0,
            "no_flights": no_flights_flag,
            "sold_out": False if no_flights_flag else None,
            "scrape_outcome": outcome,
        })

    # Apply null sanitizer to EVERY record before returning
    return [sanitize_record(r) for r in records]


# ---------------------------
# BATCH RUNNER
# ---------------------------
async def run_batch_scrape(headless: bool = True):
    today = datetime.now()
    normalized_all = []
    total = len(ROUTES) * len(ADVANCE_WINDOWS)
    print(f"Planned requests: {total} ({len(ROUTES)} routes x {len(ADVANCE_WINDOWS)} date windows)")

    homepage = "https://www.spicejet.com/"
    if not robots_allowed(homepage):
        print(f"  [!] Robots policy disallows {homepage} -- aborting")
        return []

    count = 0

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=headless,
            args=["--disable-blink-features=AutomationControlled"],
        )

        for origin, dest, route_id, pax in ROUTES:
            windows = [
                (adv, (today + timedelta(days=adv)).strftime("%Y-%m-%d"))
                for adv in ADVANCE_WINDOWS
            ]
            print(f"[{count + 1}-{count + len(windows)}/{total}] {route_id} | five windows ...")
            date_list = [d for _, d in windows]
            window_results, window_outcomes = await scrape_route(origin, dest, date_list, browser, headless=headless)

            for adv, travel_date in windows:
                count += 1
                entry = window_results.get(travel_date, {})
                outcome = window_outcomes.get(travel_date, "ok")
                normalized_all.extend(
                    normalize_response(entry, origin, dest, travel_date, adv, route_id, pax, outcome)
                )
                status = "OK" if entry.get("availability") or entry.get("lowfare") else outcome
                print(f"  [{status}] T+{adv} | {travel_date}")

            await asyncio.sleep(DELAY_BETWEEN_ROUTES)

        await browser.close()

    config = {
        "airline": "SpiceJet",
        "advance_windows": ADVANCE_WINDOWS,
        "last_checked": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "routes": normalized_all,
    }
    with open(CONFIG_OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)

    print(f"\nDone. Processed {total} route windows.")
    print(f"Normalized records: {len(normalized_all)}")
    print(f"Updated: {CONFIG_OUTPUT_PATH}")
    return normalized_all


# ---------------------------
# SINGLE-ROUTE TEST
# ---------------------------
async def test_single():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        captured, outcome = await scrape_single_date("BOM", "DEL", "2026-09-04", browser, headless=False)
        print(f"outcome={outcome}")
        recs = normalize_response(captured, "BOM", "DEL", "2026-09-04", 7, "MUMBAI-DELHI", 4029444, outcome)

        print(f"\n{len(recs)} record(s) normalized:\n")
        for r in recs:
            print(f"  {r.get('flight_number')}  |  total_fare: {r.get('total_fare')}  |  "
                  f"taxes: {r.get('taxes')}  |  seats: {r.get('seats_available')}  |  "
                  f"status: {r.get('availability_status')}")

        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        raw_path = OUTPUT_DIR / f"spicejet_raw_test_{stamp}.json"
        with open(raw_path, "w", encoding="utf-8") as f:
            json.dump(captured, f, indent=2, ensure_ascii=False)
        norm_path = OUTPUT_DIR / f"spicejet_normalized_test_{stamp}.json"
        with open(norm_path, "w", encoding="utf-8") as f:
            json.dump(recs, f, indent=2, ensure_ascii=False)

        print(f"\nRaw saved to:        {raw_path}")
        print(f"Normalized saved to: {norm_path}")
        await browser.close()


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        asyncio.run(test_single())
    else:
        asyncio.run(run_batch_scrape(headless=True))
