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
from app.services.trend_engine import get_trends 

app = FastAPI(title="Artisan Trend Spotter API")

# --- CORS CONFIGURATION ---
# This allows your React frontend to talk to this Python backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:5173",
        "https://kala-setu.onrender.com",
        "https://main.d1oqd3c08oo5dl.amplifyapp.com" 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/trends")
async def fetch_trends(category: str = "handicrafts"):
    """
    Endpoint that triggers the Trend Engine.
    The Engine handles the Cache (Supabase) and the AI (Gemini).
    """
    # Use the logic from trend_engine.py
    processed_trends = get_trends(category)
    
    return {
        "status": "success",
        "category": category,
        "count": len(processed_trends),
        "data": processed_trends
    }