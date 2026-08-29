from datetime import date

from scraper.yatra import (
    ROBOTS_SNAPSHOT_PATH,
    attach_flight_numbers,
    parse_fare_calendar,
    parse_date_picker_calendar,
    parse_flight_cards,
    parse_structured_flights,
    robots_policy_allows,
    route_url,
)


SAMPLE = """
Departure
Fri, 4 Sep'26
Fri, 28 Aug
₹6,408
Sat, 29 Aug
₹6,529
Indigo
6E
07:30
New Delhi
(DEL)
Indira Gandhi
Sep 4
4h 50m
•
1 STOP
142Kg CO2
12:20
Mumbai
(BOM)
Chhatrapati Shivaji
Sep 4
TOTAL FARE
₹
6,179
per adult
"""


def test_route_url_uses_public_flight_schedule_surface():
    assert route_url("DELHI", "MUMBAI") == (
        "https://www.yatra.com/flight-schedule/delhi-to-mumbai-flights.html"
    )


def test_reviewed_robots_snapshot_allows_only_the_selected_surface():
    lines = ROBOTS_SNAPSHOT_PATH.read_text(encoding="utf-8").splitlines()
    assert robots_policy_allows(lines, route_url("DELHI", "MUMBAI"))
    assert not robots_policy_allows(lines, "https://www.yatra.com/pwa/flights")


def test_parse_public_fare_calendar():
    assert parse_fare_calendar(SAMPLE, date(2026, 9, 4)) == {
        "2026-08-28": 6408.0,
        "2026-08-29": 6529.0,
    }


def test_parse_date_picker_month_grids():
    picker = """
    Departure
    Fri, 4 Sep'26
    August 2026
    September 2026
    Mo
    Tu
    28
    ₹6,408
    29
    ₹6,529
    Mo
    Tu
    12
    ₹6,408
    27
    ₹5,920
    Return
    Select Return
    """
    assert parse_date_picker_calendar(picker) == {
        "2026-08-28": 6408.0,
        "2026-08-29": 6529.0,
        "2026-09-12": 6408.0,
        "2026-09-27": 5920.0,
    }


def test_parse_public_flight_card():
    cards = parse_flight_cards(SAMPLE, "DEL", "BOM", date(2026, 9, 4))
    assert cards == [{
        "airline_code": "6E",
        "airline_name": "IndiGo",
        "flight_number": None,
        "departure_time": "2026-09-04T07:30:00",
        "arrival_time": "2026-09-04T12:20:00",
        "travel_date": "2026-09-04",
        "duration_minutes": 290,
        "stops": 1,
        "total_fare": 6179.0,
    }]


def test_overnight_arrival_moves_to_next_day():
    overnight = SAMPLE.replace("07:30", "21:50").replace("12:20", "02:55")
    cards = parse_flight_cards(overnight, "DEL", "BOM", date(2026, 9, 4))

    assert cards[0]["departure_time"] == "2026-09-04T21:50:00"
    assert cards[0]["arrival_time"] == "2026-09-05T02:55:00"


def test_attach_exact_flight_number_from_public_schema_data():
    scripts = ['''{
      "@context": "https://schema.org",
      "@type": "Flight",
      "flightNumber": "6E,6E6470",
      "provider": {"iataCode": ["6E"]},
      "departureAirport": {"iataCode": "DEL"},
      "arrivalAirport": {"iataCode": "BOM"},
      "departureTime": "2026-09-04T02:00:00.000Z",
      "arrivalTime": "2026-09-04T06:50:00.000Z"
    }''']
    cards = parse_flight_cards(SAMPLE, "DEL", "BOM", date(2026, 9, 4))
    flights = parse_structured_flights(scripts, "DEL", "BOM")

    attach_flight_numbers(cards, flights)

    assert cards[0]["flight_number"] == "6E6470"


def test_does_not_attach_number_to_different_itinerary():
    cards = parse_flight_cards(SAMPLE, "DEL", "BOM", date(2026, 9, 4))
    attach_flight_numbers(cards, [{
        "airline_code": "6E",
        "flight_number": "6E9999",
        "departure_time": "2026-09-04T07:30:00",
        "arrival_time": "2026-09-04T13:00:00",
    }])

    assert cards[0]["flight_number"] is None
