# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from dotenv import load_dotenv
# import os

# load_dotenv()  # 🔑 loads .env

# app = FastAPI(title="Kalasetu AI Trends")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# from app.api.trends import router as trends_router
# app.include_router(trends_router, prefix="/api")







# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from app.services.google_trends import fetch_ai_market_trends

# app = FastAPI()

# # --- ADD THIS SECTION ---
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"], # In production, replace with your specific domain
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# @app.get("/api/trends")
# async def get_trends(category: str = "handicrafts"):
#     trends_list = fetch_ai_market_trends(category)
#     return {"data": trends_list}





from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Import the engine (Logic layer) instead of the raw service
# (Make sure app.services.trend_engine exists in your project structure)
from app.services.trend_engine import get_trends 

# 1. Initialize API (Only once!)
app = FastAPI(title="Artisan Trend Spotter API")

# 2. Configure CORS (Critical for AWS + Render connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:5173",
        "http://127.0.0.1:8000",
        "https://kala-setu.onrender.com",
        "https://main.d1oqd3c08oo5dl.amplifyapp.com"  # Your AWS Domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Root Route (Health Check for Render)
@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend is running"}

# 4. Trends Route (Your Logic)
@app.get("/api/trends")
async def fetch_trends(category: str = "handicrafts"):
    """
    Endpoint that triggers the Trend Engine.
    The Engine handles the Cache (Supabase) and the AI (Gemini).
    """
    try:
        # Use the logic from trend_engine.py
        processed_trends = get_trends(category)
        
        return {
            "status": "success",
            "category": category,
            "count": len(processed_trends),
            "data": processed_trends
        }
    except Exception as e:
        print(f"Error fetching trends: {e}")
        return {
            "status": "error", 
            "message": str(e), 
            "data": []
        }