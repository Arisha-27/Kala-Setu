def classify_trend(score: float):
    """
    Returns a human-friendly label based on the numeric score
    """
    if score >= 80:
        return "Very High Demand", "Strong Upward"
    elif score >= 50:
        return "High Demand", "Rising"
    elif score >= 20:
        return "Moderate Demand", "Stable"
    elif score > 0:
        return "Low Demand", "Emerging"
    else:
        return "No Clear Demand", "Uncertain"





