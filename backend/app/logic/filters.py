def filter_by_category(trends, category=None):
    if not category:
        return trends

    return [
        trend for trend in trends
        if category in trend.get("categories", [])
    ]
