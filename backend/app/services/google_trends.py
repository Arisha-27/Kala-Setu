

# from pytrends.request import TrendReq
# import time
# import random

# pytrends = TrendReq(hl="en-IN", tz=330)


# def fetch_trend_score(keywords: list[str]) -> dict[str, float]:
#     """
#     Fetch trend scores per keyword using
#     average + peak + momentum (12 months)
#     """
#     results: dict[str, float] = {}

#     for kw in keywords:
#         try:
#             pytrends.build_payload(
#                 [kw],
#                 timeframe="today 12-m",
#                 geo="IN"
#             )

#             data = pytrends.interest_over_time()

#             if data.empty or kw not in data:
#                 results[kw] = 0.0
#                 continue

#             values = data[kw].values

#             avg = values.mean()
#             peak = values.max()

#             recent = values[-4:].mean()     # last ~1 month
#             older = values[:4].mean()       # first ~1 month

#             momentum = max(recent - older, 0)

#             # 🔥 final weighted score
#             score = (0.6 * avg) + (0.3 * peak) + (0.1 * momentum)

#             results[kw] = round(score, 2)

#             time.sleep(random.uniform(0.6, 1.4))

#         except Exception:
#             results[kw] = 0.0

#     return results



# from google import genai
# import json
# import os
# from datetime import datetime

# # Initialize the Client
# client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# def fetch_ai_market_trends(category: str):
#     current_date = datetime.now().strftime("%B %Y")
    
#     # 1. UPDATED MOCK DATA: Matching your frontend keys exactly
#     if os.getenv("MOCK_AI") == "True":
#         return [
#             {
#                 "id": "1",
#                 "title": "Terracotta Vases",
#                 "description": "Home decor seasonal peak",
#                 "level": "Medium",
#                 "momentum": "Rising",
#                 "timeFrame": "Next 3 months",
#                 "categories": ["Decor", "Pottery"],
#                 "actions": ["Source clay", "Create mold", "List on Etsy"],
#                 "confidenceScore": 85
#             }
#         ]

#     prompt = f"""
#     Identify 12 trending products for {category} in India for {current_date}. 
#     Return ONLY a JSON list where each object has these EXACT keys:
#     - id: (unique string)
#     - title: (product name)
#     - description: (trend reasoning)
#     - level: (Easy, Medium, or Hard)
#     - momentum: (Rising, Surging,Stable, less demand based on item trend. if the trend is highly seasonal or if there is low search volume data available for the specific region. )
#     - timeFrame: Determine a realistic timeframe (e.g., 2 weeks, 1 month, or 6 months) based on how fast the trend is rising
#     - categories: (list of strings)
#     - actions: (list of 3 specific steps)
#     - confidenceScore: Assign a confidenceScore from 0-100. Penalize the score if the trend is highly seasonal or if there is low search volume data available for the specific region.
#     """

#     try:
#         # Using Gemini 3 Flash (Latest as of Jan 2026)
#         response = client.models.generate_content(
#             model="gemini-2.5-flash", 
#             contents=prompt
#         )
        
#         json_text = response.text.replace('```json', '').replace('```', '').strip()
#         return json.loads(json_text)

#     except Exception as e:
#         print(f"AI Service Failure: {e}")
#         # 2. UPDATED FALLBACK: Ensuring keys match so frontend doesn't show blank cards
#         return [{
#             "id": "err",
#             "title": "Market Data Loading...",
#             "description": "We're having trouble reaching the AI. Please refresh.",
#             "level": "N/A",
#             "momentum": "Stable",
#             "timeFrame": "N/A",
#             "categories": [],
#             "actions": ["Check internet connection", "Try again later"],
#             "confidenceScore": 0
#         }]
        
        
        
        





import json
import os
from datetime import datetime, timedelta, timezone
from google import genai
from app.services.db_service import get_cached_trends, save_trends_to_db

# Initialize Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def fetch_ai_market_trends(category: str):
    """
    Cache-Aside Logic: 
    1. Check Supabase
    2. If fresh (<24h), return it.
    3. If stale/missing, call Gemini and update Supabase.
    """
    
    # --- 1. CHECK SUPABASE CACHE ---
    cached_data = get_cached_trends(category)
    if cached_data:
        # Convert ISO string to timezone-aware datetime
        last_updated = datetime.fromisoformat(cached_data['last_updated'].replace('Z', '+00:00'))
        if datetime.now(timezone.utc) - last_updated < timedelta(hours=24):
            print(f"--- [CACHE HIT] Serving {category} from Supabase ---")
            return cached_data['trends_json']

    # --- 2. CALL GEMINI AI (Cache Miss) ---
    print(f"--- [CACHE MISS] Calling Gemini for {category} ---")
    
    current_date = datetime.now().strftime("%B %Y")
    prompt = f"""
    Identify 12 trending products for {category} in India for {current_date}. 
    Return ONLY a JSON list where each object has these EXACT keys:
    - id: (unique string)
    - title: (product name)
    - description: (trend reasoning)
    - level: (Easy, Medium, or Hard)
    - momentum: (Rising, Surging,Stable, less demand based on item trend. if the trend is highly seasonal or if there is low search volume data available for the specific region. )
    - timeFrame: Determine a realistic timeframe (e.g., 2 weeks, 1 month, or 6 months) based on how fast the trend is rising
    - categories: (list of strings)
    - actions: (list of 3 specific steps)
    - confidenceScore: Assign a confidenceScore from 0-100. Penalize the score if the trend is highly seasonal or if there is low search volume data available for the specific region.
    """

    try:
        # Using Gemini 2.5 Flash for speed and cost efficiency
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt
        )
        
        # Clean the response text from markdown code blocks
        json_text = response.text.replace('```json', '').replace('```', '').strip()
        new_trends = json.loads(json_text)

        # --- 3. SAVE TO SUPABASE ---
        if new_trends:
            save_trends_to_db(category, new_trends)
            
        return new_trends

    except Exception as e:
        print(f"AI Service Failure: {e}")
        # 2. UPDATED FALLBACK: Ensuring keys match so frontend doesn't show blank cards
        return [{
            "id": "err",
            "title": "Market Data Loading...",
            "description": "We're having trouble reaching the AI. Please refresh.",
            "level": "N/A",
            "momentum": "Stable",
            "timeFrame": "N/A",
            "categories": [],
            "actions": ["Check internet connection", "Try again later"],
            "confidenceScore": 0
        }]        