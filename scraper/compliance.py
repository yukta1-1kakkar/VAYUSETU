"""Compliance registry for the four implemented collectors."""

from __future__ import annotations

import os
from dataclasses import dataclass
from datetime import date, datetime, timezone


MAX_POLICY_AGE_DAYS = 30


@dataclass(frozen=True)
class SourcePolicy:
    key: str
    name: str
    access_mode: str
    terms_url: str
    robots_url: str
    reason: str

    @property
    def env_prefix(self) -> str:
        return f"VAYUSETU_{self.key.upper()}"


POLICIES = {
    "airindiaexpress": SourcePolicy(
        "airindiaexpress", "Air India Express", "written_permission",
        "https://www.airindiaexpress.com/terms-and-conditions",
        "https://flights.airindiaexpress.com/robots.txt",
        "Published fare-page automation requires current policy review and authorization.",
    ),
    "akasaair": SourcePolicy(
        "akasaair", "Akasa Air", "written_permission",
        "https://www.akasaair.com/terms-and-conditions",
        "https://www.akasaair.com/robots.txt",
        "Browser and booking-interface automation requires written authorization.",
    ),
    "spicejet": SourcePolicy(
        "spicejet", "SpiceJet", "written_permission",
        "https://www.spicejet.com/termsconditions.aspx",
        "https://www.spicejet.com/robots.txt",
        "Internal booking responses require written authorization.",
    ),
    "yatra": SourcePolicy(
        "yatra", "Yatra", "reviewed_public_page",
        "https://www.yatra.com/online/terms-of-service.html",
        "https://www.yatra.com/robots.txt",
        "Only the reviewed public /flight-schedule/ surface is collected.",
    ),
}


def _truthy(value: str | None) -> bool:
    return (value or "").strip().lower() in {"1", "true", "yes"}


def authorization_status(source_key: str) -> dict:
    policy = POLICIES[source_key]
    prefix = policy.env_prefix
    confirmed = _truthy(os.getenv(f"{prefix}_AUTHORIZATION_CONFIRMED"))
    reference = (os.getenv(f"{prefix}_AUTHORIZATION_REFERENCE") or "").strip()
    reviewed_text = (os.getenv(f"{prefix}_POLICY_REVIEWED_ON") or "").strip()
    reviewed_on = None
    error = None
    try:
        reviewed_on = date.fromisoformat(reviewed_text) if reviewed_text else None
    except ValueError:
        error = "POLICY_REVIEWED_ON must use YYYY-MM-DD"
    age = (date.today() - reviewed_on).days if reviewed_on else None
    recent = age is not None and 0 <= age <= MAX_POLICY_AGE_DAYS
    allowed = confirmed and bool(reference) and recent
    return {
        "source": policy.name,
        "access_mode": policy.access_mode,
        "allowed": allowed,
        "authorization_confirmed": confirmed,
        "authorization_reference_present": bool(reference),
        "policy_reviewed_on": reviewed_text or None,
        "policy_review_recent": recent,
        "error": error,
        "reason": policy.reason,
        "terms_url": policy.terms_url,
        "robots_url": policy.robots_url,
        "checked_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }
