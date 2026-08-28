"""Print readiness for every existing and requested VAYUSETU source."""

import json

try:
    from .compliance import POLICIES, authorization_status
except ImportError:
    from compliance import POLICIES, authorization_status


if __name__ == "__main__":
    print(json.dumps([authorization_status(key) for key in POLICIES], indent=2))

