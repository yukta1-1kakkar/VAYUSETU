from scraper.run_daily import build_timing_report


def test_timing_report_compares_sequential_sum_with_thread_pool_wall_time():
    results = [
        {"source": "one", "seconds": 10.0, "returncode": 0, "stdout": "", "stderr": ""},
        {"source": "two", "seconds": 20.0, "returncode": 0, "stdout": "", "stderr": ""},
        {"source": "three", "seconds": 30.0, "returncode": 0, "stdout": "", "stderr": ""},
    ]
    report = build_timing_report(results, 32.0)

    assert report["normal_sequential_seconds"] == 60.0
    assert report["thread_pool_wall_seconds"] == 32.0
    assert report["time_saved_seconds"] == 28.0
    assert report["speedup"] == 1.88
