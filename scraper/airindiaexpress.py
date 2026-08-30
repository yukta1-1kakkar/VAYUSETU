import asyncio
import json
import re
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlparse
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from urllib.robotparser import RobotFileParser

from playwright.async_api import async_playwright

try:
    from .persistence import persist_scraper_output
except ImportError:
    from persistence import persist_scraper_output


ADVANCE_WINDOWS = [1, 7, 15, 30, 45]
USER_AGENT = "VAYUSETU-Bot"
BASE_URL = "https://flights.airindiaexpress.com"
ROBOTS_URL = f"{BASE_URL}/robots.txt"
SITEMAP_URL = f"{BASE_URL}/sitemap_index.xml"
OUTPUT_PATH = Path(__file__).with_name("airindiaexpress_top_24_routes.json")
_ROBOTS_PARSER = None

CITY_TO_IATA = {
    "DELHI": "DEL", "MUMBAI": "BOM", "BENGALURU": "BLR", "HYDERABAD": "HYD",
    "KOLKATA": "CCU", "PUNE": "PNQ", "GOA": "GOX", "AHMEDABAD": "AMD",
    "CHENNAI": "MAA", "SRINAGAR": "SXR", "GUWAHATI": "GAU", "PATNA": "PAT",
    "LUCKNOW": "LKO", "KOCHI": "COK",
}

CITY_TO_SLUG = {
    "DELHI": "delhi", "MUMBAI": "mumbai", "BENGALURU": "bengaluru",
    "HYDERABAD": "hyderabad", "KOLKATA": "kolkata", "PUNE": "pune", "GOA": "goa",
    "AHMEDABAD": "ahmedabad", "CHENNAI": "chennai", "SRINAGAR": "srinagar",
    "GUWAHATI": "guwahati", "PATNA": "patna", "LUCKNOW": "lucknow", "KOCHI": "kochi",
}

PRIORITY_ROUTES = [
    ("DELHI", "MUMBAI", 4029444), ("BENGALURU", "DELHI", 2885936),
    ("BENGALURU", "MUMBAI", 2476421), ("DELHI", "HYDERABAD", 1862287),
    ("DELHI", "KOLKATA", 1778985), ("DELHI", "PUNE", 1704284),
    ("GOA", "MUMBAI", 1495328), ("AHMEDABAD", "DELHI", 1402813),
    ("DELHI", "GOA", 1352032), ("CHENNAI", "MUMBAI", 1312448),
    ("HYDERABAD", "MUMBAI", 1285881), ("KOLKATA", "MUMBAI", 1281897),
    ("CHENNAI", "DELHI", 1277274), ("BENGALURU", "HYDERABAD", 1217734),
    ("AHMEDABAD", "MUMBAI", 1215086), ("BENGALURU", "KOLKATA", 1204113),
    ("DELHI", "SRINAGAR", 1141145), ("BENGALURU", "PUNE", 1079353),
    ("DELHI", "GUWAHATI", 938099), ("DELHI", "PATNA", 908354),
    ("BENGALURU", "GOA", 875214), ("BENGALURU", "CHENNAI", 872523),
    ("DELHI", "LUCKNOW", 854555), ("KOCHI", "MUMBAI", 805813),
]


def robots_allowed(url):
    global _ROBOTS_PARSER
    if _ROBOTS_PARSER is not None:
        return _ROBOTS_PARSER.can_fetch(USER_AGENT, url)
    parser = RobotFileParser()
    parser.set_url(ROBOTS_URL)
    try:
        request = Request(ROBOTS_URL, headers={"User-Agent": USER_AGENT})
        with urlopen(request, timeout=30) as response:
            parser.parse(response.read().decode("utf-8", errors="replace").splitlines())
    except HTTPError as exc:
        # RFC 9309 section 2.3.1.4: 400-499 means robots.txt is
        # unavailable and the crawler may access resources.
        if 400 <= exc.code <= 499 and exc.code != 429:
            return True
        print(f"[!] Could not read {ROBOTS_URL}: HTTP {exc.code}")
        return False
    except Exception as exc:
        print(f"[!] Could not read {ROBOTS_URL}: {exc}")
        return False
    _ROBOTS_PARSER = parser
    return parser.can_fetch(USER_AGENT, url)


def route_url(origin_city, destination_city):
    origin = CITY_TO_SLUG[origin_city]
    destination = CITY_TO_SLUG[destination_city]
    return f"{BASE_URL}/en-in/{origin}-to-{destination}-flights"


def parse_fares(text, origin, destination):
    pattern = re.compile(
        rf"{origin}[–-]{destination},\s+([A-Za-z]{{3}},\s+[A-Za-z]{{3}}\s+\d{{1,2}}\s+\d{{4}}):\s+From\s+₹([\d,]+)",
        re.IGNORECASE,
    )
    fares = {}
    for date_text, amount in pattern.findall(text):
        try:
            date = datetime.strptime(date_text, "%a, %b %d %Y").strftime("%Y-%m-%d")
            fares[date] = float(amount.replace(",", ""))
        except ValueError:
            continue
    return fares


def parse_duration(value):
    match = re.search(r"(?:(\d+)h)?\s*(?:(\d+)m)?", value or "")
    if not match or not any(match.groups()):
        return None
    return int(match.group(1) or 0) * 60 + int(match.group(2) or 0)


def parse_schedules(text, origin, destination):
    heading = re.search(r"Flight Schedule", text, re.IGNORECASE)
    if not heading:
        return []
    section = text[heading.end():]
    disclaimer = re.search(r"Disclaimer:\s*Flight timings", section, re.IGNORECASE)
    if disclaimer:
        section = section[:disclaimer.start()]
    lines = [line.strip() for line in section.splitlines() if line.strip()]
    starts = [index for index, line in enumerate(lines) if re.fullmatch(r"(?:IX|I5)\s*\d+", line)]
    schedules = []
    for position, start in enumerate(starts):
        block = lines[start:(starts[position + 1] if position + 1 < len(starts) else len(lines))]
        try:
            origin_at = block.index(origin)
            destination_at = block.index(destination, origin_at + 1)
        except ValueError:
            continue
        times = [line for line in block[destination_at + 1:] if re.fullmatch(r"\d{1,2}:\d{2}(?:\s*\(\+1\))?", line)]
        duration = next((parse_duration(line) for line in block if re.fullmatch(r"(?:\d+h\s*)?(?:\d+m)", line)), None)
        if len(times) < 2:
            continue
        stop_label = block[origin_at + 1] if origin_at + 1 < destination_at else ""
        schedules.append({
            "flight_number": block[0].replace(" ", ""),
            "stops": 0 if "non-stop" in stop_label.lower() else None,
            "departure_clock": times[0].split()[0],
            "arrival_clock": times[1].split()[0],
            "arrival_next_day": "+1" in times[1],
            "duration_minutes": duration,
        })
    return schedules


async def collect_route(page, origin_city, destination_city, target_dates):
    origin = CITY_TO_IATA[origin_city]
    destination = CITY_TO_IATA[destination_city]
    url = route_url(origin_city, destination_city)
    if not robots_allowed(url):
        print(f"[!] Robots policy disallows {url}")
        return {}, [], url, "robots_disallowed"
    # AirTRFX keeps background requests open, so "networkidle" can time out even
    # after the published fare page is usable.  DOM readiness is sufficient for
    # reading the server-rendered fare calendar and schedule text.
    response = await page.goto(url, wait_until="domcontentloaded", timeout=60000)
    if not response or response.status != 200:
        return {}, [], url, f"http_{response.status if response else 'none'}"

    fares = {}
    body = await page.locator("body").inner_text()
    fares.update(parse_fares(body, origin, destination))
    schedules = parse_schedules(body, origin, destination)

    missing_months = sorted({
        datetime.strptime(date, "%Y-%m-%d").strftime("%Y-%m")
        for date in target_dates if date not in fares
    })
    accept_cookies = page.get_by_role("button", name="Accept", exact=True)
    if await accept_cookies.count():
        try:
            await accept_cookies.first.click(timeout=3_000)
        except Exception:
            pass
    for month_key in missing_months:
        month_label = datetime.strptime(month_key, "%Y-%m").strftime("%B %Y")
        try:
            carousel = page.locator("section[aria-label='Month selection carousel']")
            month = carousel.locator(
                f"button[data-att='monthly-fare-card'][aria-label*='{month_label}']"
            )
            if await month.count() == 0:
                continue
            await month.first.click(timeout=5_000, force=True)
            await page.wait_for_timeout(1000)
            body = await page.locator("body").inner_text()
            fares.update(parse_fares(body, origin, destination))
        except Exception:
            break
    return fares, schedules, url, None


def normalized_record(route_id, passengers, origin, destination, travel_date, advance_days,
                      source_url, fare=None, schedule=None, error=None):
    schedule = schedule or {}
    departure_time = None
    arrival_time = None
    if schedule.get("departure_clock"):
        departure_time = f"{travel_date}T{schedule['departure_clock']}:00"
    if schedule.get("arrival_clock"):
        arrival_date = datetime.strptime(travel_date, "%Y-%m-%d")
        if schedule.get("arrival_next_day") or schedule["arrival_clock"] <= schedule.get("departure_clock", ""):
            arrival_date += timedelta(days=1)
        arrival_time = f"{arrival_date:%Y-%m-%d}T{schedule['arrival_clock']}:00"
    available = fare is not None
    return {
        "observation_id": f"obs_{uuid.uuid4().hex[:12]}",
        "collection_timestamp": datetime.now().astimezone().isoformat(),
        "route_id": route_id,
        "total_passengers": passengers,
        "origin": origin,
        "destination": destination,
        "travel_date": travel_date,
        "advance_purchase_days": advance_days,
        "trip_type": "one_way",
        "passenger_count": 1,
        "cabin": "economy",
        "stops": schedule.get("stops"),
        "airline_code": "IX",
        "airline_name": "Air India Express",
        "flight_number": schedule.get("flight_number"),
        "departure_time": departure_time,
        "arrival_time": arrival_time,
        "duration_minutes": schedule.get("duration_minutes"),
        "fare_family": "Economy" if available else None,
        "base_fare": None,
        "taxes": None,
        "mandatory_fees": None,
        "total_fare": fare,
        "currency": "INR",
        "availability_status": "available" if available else ("collection_error" if error else "not_published"),
        "seats_available": None,
        "source": "Air India Express",
        "source_type": "airline_published_fare_page",
        "data_quality_score": 75 if available and schedule else (60 if available else 0),
        "no_flights": False if available else None,
        "sold_out": None,
        "source_url": source_url,
        "note": error,
    }


async def run_batch_scrape(headless=True):
    today = datetime.now()
    windows = [(days, (today + timedelta(days=days)).strftime("%Y-%m-%d")) for days in ADVANCE_WINDOWS]
    records = []
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=headless)
        page = await browser.new_page(user_agent=USER_AGENT, viewport={"width": 1366, "height": 768})
        for index, (origin_city, destination_city, passengers) in enumerate(PRIORITY_ROUTES, 1):
            origin = CITY_TO_IATA[origin_city]
            destination = CITY_TO_IATA[destination_city]
            route_id = f"{origin_city}-{destination_city}"
            print(f"[{index}/{len(PRIORITY_ROUTES)}] {route_id}")
            target_dates = [date for _, date in windows]
            try:
                fares, schedules, source_url, error = await collect_route(
                    page, origin_city, destination_city, target_dates
                )
            except Exception as exc:
                fares, schedules, source_url, error = {}, [], route_url(origin_city, destination_city), str(exc)
            for advance_days, travel_date in windows:
                fare = fares.get(travel_date)
                if schedules and fare is not None:
                    for schedule in schedules:
                        records.append(normalized_record(
                            route_id, passengers, origin, destination, travel_date, advance_days,
                            source_url, fare, schedule, error,
                        ))
                else:
                    records.append(normalized_record(
                        route_id, passengers, origin, destination, travel_date, advance_days,
                        source_url, fare, None, error,
                    ))
            await asyncio.sleep(3)
        await browser.close()

    output = {
        "airline": "Air India Express",
        "base_url": BASE_URL,
        "robots_url": ROBOTS_URL,
        "robots_available": True,
        "crawl_allowed": True,
        "user_agent": USER_AGENT,
        "crawl_delay": None,
        "disallowed_paths": [],
        "sitemaps": [SITEMAP_URL],
        "last_checked": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "advance_windows": ADVANCE_WINDOWS,
        "routes": records,
    }
    priced_count = sum(record.get("total_fare") is not None for record in records)
    if records and not priced_count and all(record.get("note") for record in records):
        raise RuntimeError(
            "Air India Express collection failed for every route; preserved the previous output and skipped ETL"
        )
    with open(OUTPUT_PATH, "w", encoding="utf-8") as file:
        json.dump(output, file, indent=2, ensure_ascii=False)
    print(f"Wrote {len(records)} records ({priced_count} priced) to {OUTPUT_PATH}")
    persist_scraper_output(OUTPUT_PATH)
    return records


if __name__ == "__main__":
    asyncio.run(run_batch_scrape())
