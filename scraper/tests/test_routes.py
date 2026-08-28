from scraper.routes import ADVANCE_WINDOWS, PRIORITY_ROUTES


def test_shared_basket_has_24_routes_and_required_windows():
    assert len(PRIORITY_ROUTES) == 24
    assert ADVANCE_WINDOWS == [1, 7, 15, 30, 45]
    assert PRIORITY_ROUTES[0][2:4] == ("DEL", "BOM")
