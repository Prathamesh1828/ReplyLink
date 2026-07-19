import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

try:
    res = supabase.table("automation_runs").select("*").limit(1).execute()
    print("Existing columns:", list(res.data[0].keys()) if res.data else "No data")
    
    # Try inserting with event_type
    test_data = {
        "automation_id": "test",
        "comment_id": "test_event",
        "username": "test",
        "event_type": "test_event"
    }
    insert_res = supabase.table("automation_runs").insert(test_data).execute()
    print("Insert success:", insert_res.data)
except Exception as e:
    print("Error:", e)
