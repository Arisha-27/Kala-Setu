from datetime import datetime

TREND_CACHE = {
    "data": None,
    "last_updated": None
}

def is_cache_valid(ttl_hours: int) -> bool:
    if not TREND_CACHE["last_updated"]:
        return False

    age = datetime.utcnow() - TREND_CACHE["last_updated"]
    return age.total_seconds() < ttl_hours * 3600
