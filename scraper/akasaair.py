

import asyncio
import json
import time
import uuid
from datetime import datetime, timedelta
from pathlib import Path

from playwright.async_api import async_playwright
from playwright_stealth import Stealth


# ---------------------------
# CONFIG
# ---------------------------

ADVANCE_WINDOWS = [60]  

OUTPUT_DIR = Path("data")
OUTPUT_DIR.mkdir(exist_ok=True)

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36"
)

CITY_TO_SLUG = {
    "DELHI": "new-delhi",
    "MUMBAI": "mumbai",
    "BENGALURU": "bengaluru",
    "HYDERABAD": "hyderabad",
    "KOLKATA": "kolkata",
    "PUNE": "pune",
    "GOA": "goa",
    "AHMEDABAD": "ahmedabad",
    "CHENNAI": "chennai",
    "SRINAGAR": "srinagar",
    "GUWAHATI": "guwahati",
    "PATNA": "patna",
    "LUCKNOW": "lucknow",
    "KOCHI": "kochi",
}

CITY_TO_IATA = {
    "DELHI": "DEL", "MUMBAI": "BOM", "BENGALURU": "BLR", "HYDERABAD": "HYD",
    "KOLKATA": "CCU", "PUNE": "PNQ", "GOA": "GOX", "AHMEDABAD": "AMD",
    "CHENNAI": "MAA", "SRINAGAR": "SXR", "GUWAHATI": "GAU", "PATNA": "PAT",
    "LUCKNOW": "LKO", "KOCHI": "COK",
}

# Exactly the 23 routes from the route_id / total_passengers table.
# (origin_city, destination_city, total_passengers) -- passengers kept
# only for traceability/QA in the output, not used in scraping logic.
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


def build_routes_from_slugs():
    routes = []
    for o_city, d_city, pax in PRIORITY_ROUTES:
        o_code = CITY_TO_IATA.get(o_city, o_city[:3])
        d_code = CITY_TO_IATA.get(d_city, d_city[:3])
        o_slug = CITY_TO_SLUG.get(o_city, o_city.lower())
        d_slug = CITY_TO_SLUG.get(d_city, d_city.lower())
        route_id = f"{o_city}-{d_city}"
        routes.append((o_code, d_code, o_slug, d_slug, route_id, pax))
    return routes


ROUTES_WITH_SLUGS = build_routes_from_slugs()


# ---------------------------
# CORE SCRAPE FUNCTION
# ---------------------------
async def scrape_route(origin: str, dest: str, travel_date: str,
                        origin_slug: str = None, dest_slug: str = None,
                        headless: bool = True):
    """
    Loads Akasa's direct city-to-city page when slugs are available.
    Falls back to homepage + manual field-fill if no slug page exists.
    """
    captured = {}

    async def handle_response(response):
        # Narrowed to the lowFare calendar endpoint specifically.
        # Akasa's site also fires a separate /availability/v2/search
        # endpoint (individual flight results, shaped as a list, not
        # {"lowFares": [...]}) which would otherwise get captured here
        # too and break normalize_response() (list has no .get()).
        if "lowFare" in response.url and response.status == 200:
            try:
                body = await response.json()
                captured["url"] = response.url
                captured["status"] = response.status
                # The API wraps its payload in its own "data" key:
                #   {"data": {"lowFares": [...]}}
                # Unwrap it here so captured["data"] == {"lowFares": [...]}
                # directly -- otherwise normalize_response() ends up one
                # level too shallow and never finds lowFares.
                captured["data"] = body.get("data", body) if isinstance(body, dict) else body
            except Exception:
                pass

    stealth = Stealth()

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=headless,
            args=["--disable-blink-features=AutomationControlled"],
        )
        page = await browser.new_page(
            user_agent=USER_AGENT,
            viewport={"width": 1366, "height": 768},
        )
        await stealth.apply_stealth_async(page)
        page.on("response", handle_response)

        try:
            used_fallback = False
            if origin_slug and dest_slug:
                url = f"https://www.akasaair.com/flight-booking/{origin_slug}-to-{dest_slug}"
                await page.goto(url, wait_until="load", timeout=30000)
                await page.wait_for_timeout(4000)

                try:
                    await page.click("text=Accept cookies", timeout=4000)
                except Exception:
                    pass
                await page.wait_for_timeout(1000)

                try:
                    from_value = await page.locator("#From").input_value(timeout=5000)
                except Exception:
                    from_value = ""

                if not from_value:
                    print(f"  [!] {origin_slug}-to-{dest_slug} page has no pre-filled From -- falling back to manual fill")
                    used_fallback = True
            else:
                used_fallback = True

            if used_fallback:
                await page.goto("https://www.akasaair.com/", wait_until="load", timeout=30000)
                await page.wait_for_timeout(3000)
                try:
                    await page.click("text=Accept cookies", timeout=4000)
                except Exception:
                    pass

                from_input = page.locator("#From")
                await from_input.click(timeout=10000)
                await from_input.fill("")
                await page.wait_for_timeout(300)
                await from_input.type(origin, delay=150)
                await page.wait_for_timeout(1500)
                try:
                    await page.locator(f"#destinations li#{origin}").click(timeout=3000)
                except Exception:
                    await page.keyboard.press("ArrowDown")
                    await page.wait_for_timeout(300)
                    await page.keyboard.press("Enter")
                await page.wait_for_timeout(1000)

                to_input = page.locator("#To")
                await to_input.click(timeout=10000)
                await to_input.fill("")
                await page.wait_for_timeout(300)
                await to_input.type(dest, delay=150)
                await page.wait_for_timeout(1500)
                try:
                    await page.locator(f"#destinations li#{dest}").click(timeout=3000)
                except Exception:
                    await page.keyboard.press("ArrowDown")
                    await page.wait_for_timeout(300)
                    await page.keyboard.press("Enter")
                await page.wait_for_timeout(1000)

                try:
                    error_visible = await page.locator("text=Please enter a valid airport").is_visible(timeout=1000)
                except Exception:
                    error_visible = False
                if error_visible:
                    print(f"  [!] Airport selection did not register for {origin}->{dest}, skipping")
                    await page.screenshot(path=str(OUTPUT_DIR / "last_run_debug.png"), full_page=True)
                    await browser.close()
                    return None

            # --- Date handling (FIXED) ---
            # The lowFare API returns a ~9-day fare calendar per request no
            # matter which exact day is clicked. So we just open the date
            # picker to trigger the API call, rather than trying to click a
            # specific day number (which was timing out / mismatching the
            # real calendar DOM). We filter for the exact requested date in
            # normalize_response() afterwards.
            try:
                date_input = page.locator("input[name='DepartureDate']")
                await date_input.click(timeout=5000)
                await page.wait_for_timeout(1200)
            except Exception as e:
                print(f"  [!] Could not open date picker: {e}")

            for sel in [
                "button:has-text('Search Flights')",
                "button:has-text('Search')",
                "button[type='submit']",
            ]:
                try:
                    await page.click(sel, timeout=2500)
                    break
                except Exception:
                    continue

            await page.wait_for_timeout(10000)

        except Exception as e:
            print(f"  [!] Error during navigation for {origin}->{dest} on {travel_date}: {e}")

        try:
            await page.screenshot(path=str(OUTPUT_DIR / "last_run_debug.png"), full_page=True)
        except Exception:
            pass

        await browser.close()

    return captured if captured else None


# ---------------------------
# NORMALIZATION (FIXED for real lowFare API shape)
# ---------------------------
def normalize_response(raw: dict, origin: str, dest: str, travel_date: str,
                        adv: int, route_id: str = None, total_passengers: int = None):
    """
    Real Akasa response shape (confirmed from a live capture):
        { "data": { "lowFares": [ {date, price, taxesAndFees, available,
                                     noFlights, soldOut, referenceFareKeys}, ... ] } }

    The API returns a ~9-day calendar window per request (one entry per
    date). We keep EVERY date in that window as its own record -- each
    date gets its own price, instead of discarding all but one date.
    """
    records = []
    data = raw.get("data")
    if not isinstance(data, dict):
        data = {}
    low_fares = data.get("lowFares") or []
    if not isinstance(low_fares, list):
        low_fares = []
    now_iso = datetime.now().astimezone().isoformat()

    for fare in low_fares:
        fare_date = (fare.get("date") or "")[:10]
        if not fare_date:
            continue

        price = fare.get("price")
        taxes = fare.get("taxesAndFees")
        available = fare.get("available")
        sold_out = fare.get("soldOut", False)
        no_flights = fare.get("noFlights", False)

        if no_flights:
            availability_status = "no_flights"
        elif sold_out or available == 0:
            availability_status = "sold_out"
        else:
            availability_status = "available"

        # advance_purchase_days is now computed per-row, since each row is
        # a different date in the returned calendar -- not just the one
        # date originally requested.
        try:
            days_out = (datetime.strptime(fare_date, "%Y-%m-%d") - datetime.now().replace(
                hour=0, minute=0, second=0, microsecond=0)).days
        except Exception:
            days_out = adv

        records.append({
            "observation_id": f"obs_{uuid.uuid4().hex[:12]}",
            "collection_timestamp": now_iso,
            "route_id": route_id,
            "total_passengers": total_passengers,
            "origin": origin,
            "destination": dest,
            "travel_date": fare_date,
            "advance_purchase_days": days_out,
            "trip_type": "one_way",
            "passenger_count": 1,
            "cabin": "economy",
            "stops": None,
            "airline_code": "QP",
            "airline_name": "Akasa Air",
            "flight_number": None,
            "departure_time": None,
            "arrival_time": None,
            "duration_minutes": None,
            "fare_family": None,
            "base_fare": None,
            "taxes": taxes,
            "mandatory_fees": None,
            "total_fare": price,
            "currency": "INR",
            "availability_status": availability_status,
            "seats_available": available,
            "source": "Akasa Air",
            "source_type": "airline",
            "data_quality_score": 90 if price is not None else 40,
            "no_flights": no_flights,
            "sold_out": sold_out,
        })

    if not records:
        records.append({
            "observation_id": f"obs_{uuid.uuid4().hex[:12]}",
            "collection_timestamp": now_iso,
            "route_id": route_id,
            "total_passengers": total_passengers,
            "origin": origin,
            "destination": dest,
            "travel_date": travel_date,
            "advance_purchase_days": adv,
            "airline_code": "QP",
            "airline_name": "Akasa Air",
            "source": "Akasa Air",
            "source_type": "airline",
            "data_quality_score": 0,
            "note": (
                "lowFares[] was empty or missing in the captured response "
                "-- either the API call never fired, or the response shape "
                "changed. Inspect the raw JSON for this route manually."
            ),
        })

    return records


# ---------------------------
# BATCH RUNNER (single day snapshot, 23 fixed routes only)
# ---------------------------
async def run_batch_scrape(headless: bool = True):
    today = datetime.now()
    normalized_all = []
    raw_all = []

    total = len(ROUTES_WITH_SLUGS) * len(ADVANCE_WINDOWS)
    print(f"Planned requests: {total} ({len(ROUTES_WITH_SLUGS)} routes x {len(ADVANCE_WINDOWS)} date window)")

    count = 0
    for origin, dest, o_slug, d_slug, route_id, pax in ROUTES_WITH_SLUGS:
        for adv in ADVANCE_WINDOWS:
            count += 1
            travel_date = (today + timedelta(days=adv)).strftime("%Y-%m-%d")
            print(f"[{count}/{total}] {route_id} ({o_slug}-to-{d_slug}) | T+{adv} | {travel_date} ...")

            result = await scrape_route(origin, dest, travel_date, o_slug, d_slug, headless=headless)

            if result:
                raw_all.append({
                    "route_id": route_id,
                    "origin": origin,
                    "destination": dest,
                    "advance_window": adv,
                    "travel_date": travel_date,
                    "scraped_at": datetime.now().isoformat(),
                    "source_url": result.get("url"),
                    "raw_response": result.get("data"),
                })
                normalized_all.extend(
                    normalize_response(result, origin, dest, travel_date, adv, route_id, pax)
                )
                print(f"  [OK] Captured fare data.")
            else:
                print(f"  [--] No fare data captured (blocked, no flights on route, or page didn't fire API call).")

            time.sleep(3)  # rate limiting -- ethical scraping

    stamp = today.strftime("%Y%m%d_%H%M%S")

    raw_path = OUTPUT_DIR / f"akasa_raw_{stamp}.json"
    with open(raw_path, "w", encoding="utf-8") as f:
        json.dump(raw_all, f, indent=2, ensure_ascii=False)

    norm_path = OUTPUT_DIR / f"akasa_normalized_{stamp}.json"
    with open(norm_path, "w", encoding="utf-8") as f:
        json.dump(normalized_all, f, indent=2, ensure_ascii=False)

    print(f"\nDone. {len(raw_all)}/{total} requests captured raw data.")
    print(f"Normalized records: {len(normalized_all)}")
    print(f"Raw saved to: {raw_path}")
    print(f"Normalized saved to: {norm_path}")
    return normalized_all


# ---------------------------
# SINGLE-ROUTE TEST
# ---------------------------
async def test_single():
    result = await scrape_route("BOM", "DEL", "2026-08-28", "mumbai", "new-delhi", headless=False)
    if result:
        print("Captured URL:", result["url"])
        recs = normalize_response(result, "BOM", "DEL", "2026-08-28", 3, "MUMBAI-DELHI", 4029444)
        print(f"\n{len(recs)} date(s) normalized:\n")
        for r in recs:
            print(f"  {r.get('travel_date')}  |  total_fare: {r.get('total_fare')}  |  "
                  f"taxes: {r.get('taxes')}  |  seats: {r.get('seats_available')}  |  "
                  f"status: {r.get('availability_status')}")

        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        raw_path = OUTPUT_DIR / f"akasa_raw_test_{stamp}.json"
        with open(raw_path, "w", encoding="utf-8") as f:
            json.dump({
                "route_id": "MUMBAI-DELHI",
                "origin": "BOM",
                "destination": "DEL",
                "travel_date": "2026-08-28",
                "scraped_at": datetime.now().isoformat(),
                "source_url": result.get("url"),
                "raw_response": result.get("data"),
            }, f, indent=2, ensure_ascii=False)

        norm_path = OUTPUT_DIR / f"akasa_normalized_test_{stamp}.json"
        with open(norm_path, "w", encoding="utf-8") as f:
            json.dump(recs, f, indent=2, ensure_ascii=False)

        print(f"\nRaw saved to:        {raw_path}")
        print(f"Normalized saved to: {norm_path}")
    else:
        print("No data captured. Check data/last_run_debug.png to see what the browser saw.")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "test":
        asyncio.run(test_single())
    else:
        asyncio.run(run_batch_scrape(headless=True))
