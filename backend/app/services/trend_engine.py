


# from datetime import datetime
# from app.core.cache import TREND_CACHE, is_cache_valid
# from app.core.config import CACHE_TTL_HOURS, KEYWORDS_BY_CATEGORY
# from app.services.google_trends import fetch_trend_score
# from app.logic.scoring import classify_trend
# from app.logic.filters import filter_by_category

# # -----------------------------
# # Timeframe estimation logic
# # -----------------------------
# def estimate_timeframe(score: float, momentum: str) -> str:
#     if score >= 85:
#         return "Immediate (1–2 weeks)"

#     if score >= 80:
#         return "Next 3–4 weeks"

#     if score >= 75:
#         return "Next 1–2 months"

#     if score >= 60:
#         return "2–3 months"
#     if score >= 50:
#         return "3-4 months"

#     return "Uncertain / Monitor"


# # -----------------------------
# # Action generation logic
# # -----------------------------
# def generate_actions(score: float, keyword: str, momentum: str, category: str) -> list[str]:
#     actions = []

#     # 🚀 Very high confidence
#     if score >= 85:
#         actions.extend([
#             f"Scale production of '{keyword}' immediately",
#             "Prioritize online marketplace visibility",
#             "Secure raw materials in advance"
#         ])

#     # 📈 High but still rising
#     elif score >= 70:
#         actions.extend([
#             f"Increase production capacity for '{keyword}'",
#             "Run targeted promotions",
#             "Prepare inventory for seasonal demand"
#         ])

#     # 🧪 Medium confidence (testing phase)
#     elif score >= 50:
#         actions.extend([
#             f"Launch limited batches of '{keyword}'",
#             "Test demand across regions",
#             "Highlight craftsmanship and origin story"
#         ])

#     # 👀 Low but emerging
#     elif score >= 30:
#         actions.extend([
#             f"Monitor customer interest for '{keyword}'",
#             "Create samples instead of full inventory",
#             "Observe competitor activity"
#         ])

#     # ❄️ Very low confidence
#     else:
#         actions.extend([
#             f"Avoid heavy investment in '{keyword}'",
#             "Re-evaluate trend after 1–2 months",
#             "Focus on proven bestsellers instead"
#         ])

#     # -----------------------------
#     # Momentum-based refinement
#     # -----------------------------
#     if momentum == "Rising":
#         actions.append("Capitalize on rising search interest early")

#     elif momentum == "Emerging":
#         actions.append("Early-stage trend — opportunity for first movers")

#     elif momentum == "Declining":
#         actions.append("Demand may fade — limit inventory risk")

#     # -----------------------------
#     # Category-based artisan logic
#     # -----------------------------
#     if category == "decor":
#         actions.append("Focus on festival and home decor use-cases")

#     elif category == "textiles":
#         actions.append("Emphasize fabric quality and handloom value")

#     elif category == "craft":
#         actions.append("Highlight durability, material authenticity, and utility")

#     return actions


# # -----------------------------
# # Suggestion builder
# # -----------------------------
# def create_suggestion_from_keyword(keyword: str, score: float, category: str):
#     demand_level, momentum = classify_trend(score)

#     description_text = (
#         f"There is {demand_level.lower()} and {momentum.lower()} interest "
#         f"in {keyword} based on recent search trends."
#     )

#     return {
#         "id": f"{category}_{keyword.replace(' ', '_')}",
#         "title": f"{keyword.title()} Trend",
#         "description": description_text,
#         "level": demand_level,
#         "momentum": momentum,
#         "timeFrame": estimate_timeframe(score, momentum),
#         "categories": [category],
#         "actions": generate_actions(score, keyword, momentum, category),
#         "confidenceScore": round(score, 2)
#     }


# def _recompute_trends():
#     suggestions = []

#     for category, keywords in KEYWORDS_BY_CATEGORY.items():

#         # ✅ fetch ONCE per category
#         scores = fetch_trend_score(keywords)

#         if not scores:
#             continue

#         max_score = max(scores.values()) or 1.0

#         for kw, raw_score in scores.items():
#             # ✅ normalize inside category (0–100)
#             normalized = (raw_score / max_score) 

#             suggestion = create_suggestion_from_keyword(
#                 keyword=kw,
#                 score=normalized,
#                 category=category
#             )
#             suggestions.append(suggestion)

#     suggestions.sort(key=lambda x: x["confidenceScore"], reverse=True)

#     TREND_CACHE["data"] = suggestions
#     TREND_CACHE["last_updated"] = datetime.utcnow()

#     return suggestions


# def get_trends(category: str | None = None, limit: int = 10):
#     if not is_cache_valid(CACHE_TTL_HOURS):
#         data = _recompute_trends()
#     else:
#         data = TREND_CACHE["data"]

#     filtered = filter_by_category(data, category)
#     return filtered[:limit]




# from app.services.google_trends import fetch_ai_market_trends

# def estimate_timeframe(score: float) -> str:
#     if score >= 90: return "Immediate (1 week)"
#     if score >= 80: return "Short-term (1 month)"
#     if score >= 70: return "Mid-term (3 months)"
#     return "Seasonal (6+ months)"

# def _generate_ai_actions(item: dict) -> list:
#     """Business logic for artisans - safely handles missing keys."""
#     keyword = item.get('keyword', 'this product')
#     actions = [f"Market research suggests interest in {keyword}."]
    
#     momentum = item.get('momentum', 'Stable')
#     difficulty = item.get('level', item.get('difficulty', 'Medium'))

#     if momentum == "Surging":
#         actions.append("Fast-track production: Interest is spiking.")
    
#     if difficulty == "Easy":
#         actions.append("Quick win: This is easy to produce and launch.")
#     elif difficulty == "Hard":
#         actions.append("Premium positioning: Focus on high-quality craftsmanship.")
        
#     return actions


# def get_trends(category: str = "decor"):
#     """
#     Vercel-Safe: No scraping, no long delays.
#     Fetches AI-synthesized trends directly.
#     """
    
#     raw_data = fetch_ai_market_trends(category)
#     if not raw_data:
#         return []

#     suggestions = []
#     for item in raw_data:
#         # Use .get() to prevent crashes if the AI changes its key names
#         score = item.get('confidence_score', item.get('confidenceScore', 50))
#         keyword = item.get('keyword', item.get('title', 'Unknown Product'))    
#         # 2. Logic to determine Level based on AI Score
#         if score >= 80:
#             level = "Peak Demand"
#         elif score >= 50:
#             level = "High Demand"
#         else:
#             level = "Niche Interest"
            

       

#         suggestions.append({
#             "id": f"{category}_{keyword.lower().replace(' ', '_')}",
#             "title": keyword.title(),
#             "description": item.get('reason', item.get('description', 'No details available')),
#             "level": level,
#             "momentum": item.get('momentum', 'Stable'),
#             "confidenceScore": score,
#             "timeFrame": estimate_timeframe(score), # Now correctly calling the helper
#             "categories": [category],
#             "actions": _generate_ai_actions(item)
#         })
        
#     return suggestions

# def _generate_ai_actions(item):
#     """Business logic for artisans - safely handles missing keys."""
#     actions = [f"Market research suggests interest in {item.get('keyword', 'this product')}."]
    
#     # Use .get() to prevent KeyErrors
#     momentum = item.get('momentum', 'Stable')
#     difficulty = item.get('difficulty', 'Medium')

#     if momentum == "Surging":
#         actions.append("Fast-track production: Interest is spiking.")
    
#     if difficulty == "Easy":
#         actions.append("Quick win: This is easy to produce and launch.")
        
#     return actions









from datetime import datetime
from app.services.google_trends import fetch_ai_market_trends

def estimate_timeframe(score: float) -> str:
    """Calculates urgency based on the AI's confidence score."""
    if score >= 90: return "Immediate (1 week)"
    if score >= 80: return "Short-term (1 month)"
    if score >= 70: return "Mid-term (3 months)"
    return "Seasonal (6+ months)"

def _generate_ai_actions(item: dict) -> list:
    """Generates artisan-specific advice based on trend data."""
    keyword = item.get('title', 'this product')
    actions = [f"Market research suggests interest in {keyword}."]
    
    momentum = item.get('momentum', 'Stable')
    difficulty = item.get('level', 'Medium')

    if momentum == "Surging":
        actions.append("Fast-track production: Interest is spiking.")
    
    if difficulty == "Easy":
        actions.append("Quick win: Low barrier to entry.")
    elif difficulty == "Hard":
        actions.append("Premium focus: Requires high craftsmanship.")
        
    return actions

def get_trends(category: str = "decor"):
    """
    Main Orchestrator:
    Normalizes data so the Frontend never sees a 'KeyError'.
    """
    raw_data = fetch_ai_market_trends(category)
    if not raw_data:
        return []

    processed_suggestions = []
    for item in raw_data:
        # Standardize the Confidence Score
        score = item.get('confidence_score', item.get('confidenceScore', 50))
        title = item.get('title', 'Trending Item')
        
        # Build the Frontend-ready object
        processed_suggestions.append({
            "id": f"{category}_{title.lower().replace(' ', '_')}",
            "title": title.title(),
            "description": item.get('reason', item.get('description', 'Trend detected.')),
            "level": item.get('level', 'Medium'),
            "momentum": item.get('momentum', 'Stable'),
            "confidenceScore": score,
            "timeFrame": estimate_timeframe(score),
            "categories": item.get('categories', [category]),
            "actions": _generate_ai_actions(item)
        })
        
    return processed_suggestions