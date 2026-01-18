import os
from supabase import create_client, Client
from dotenv import load_dotenv
load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def get_cached_trends(category: str):
    """Select the first row matching the category."""
    try:
        response = supabase.table("market_trends").select("*").eq("category", category).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"DB Fetch Error: {e}")
        return None

def save_trends_to_db(category: str, trends: list):
    """Insert or update the JSON data for this category."""
    try:
        data = {
            "category": category,
            "trends_json": trends,
            "last_updated": "now()" # Let Postgres handle the timestamp
        }
        supabase.table("market_trends").upsert(data, on_conflict="category").execute()
    except Exception as e:
        print(f"DB Save Error: {e}")