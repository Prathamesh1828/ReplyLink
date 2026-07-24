from fastapi import APIRouter, Header, HTTPException
from typing import Dict, Any, List, Optional
from app.services.supabase_service import supabase

from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)

@router.get("/stats")
async def get_dashboard_stats(user_id: str = Depends(get_current_user)):
    """Returns top-level aggregate statistics for the dashboard."""
    try:
        automations = supabase.table("automations").select("id, runs_count, clicks_count").eq("user_id", user_id).execute()
        
        total_automations = len(automations.data)
        messages_sent = sum(a.get("runs_count", 0) for a in automations.data)
        link_clicks = sum(a.get("clicks_count", 0) for a in automations.data)
        
        # We define conversations started as roughly equivalent to messages sent right now
        # until a separate webhooks logic specifically marks them.
        conversations_started = messages_sent
        
        return {
            "total_automations": total_automations,
            "messages_sent": messages_sent,
            "conversations_started": conversations_started,
            "link_clicks": link_clicks
        }
    except Exception as e:
        print(f"Error fetching stats: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/activity")
async def get_recent_activity(user_id: str = Depends(get_current_user)):
    """Returns the most recent automation runs for the activity feed."""
    try:
        # Get all automations for the user first to map IDs to names
        autos_res = supabase.table("automations").select("id, name, automation_type").eq("user_id", user_id).execute()
        autos_map = {a["id"]: a for a in autos_res.data}
        
        if not autos_map:
            return []
            
        # Fetch the most recent 10 runs across all user's automations
        auto_ids = list(autos_map.keys())
        runs_res = supabase.table("automation_runs").select("*").in_("automation_id", auto_ids).order("created_at", desc=True).limit(10).execute()
        
        activities = []
        for run in runs_res.data:
            auto = autos_map.get(run["automation_id"], {})
            activities.append({
                "id": run["id"],
                "automation_name": auto.get("name", "Unknown Automation"),
                "automation_type": auto.get("automation_type", "auto_dm_comments"),
                "status": run.get("status", "completed"),
                "created_at": run.get("created_at"),
                "username": run.get("username", "Unknown User"),
                "comment": run.get("comment", ""),
                "keyword": run.get("keyword", "")
            })
            
        return activities
    except Exception as e:
        print(f"Error fetching activity: {e}")
        return []

@router.get("/chart")
async def get_chart_data(user_id: str = Depends(get_current_user)):
    """Returns aggregated chart data for message trends."""
    # Since we aren't tracking historical daily aggregates natively in Supabase right now,
    # we'll return a simple static structure with dynamic totals to populate the chart.
    # In a full production system, you would group `automation_runs` by day.
    
    # We will simulate the last 7 days based on the total messages sent.
    try:
        automations = supabase.table("automations").select("runs_count").eq("user_id", user_id).execute()
        total = sum(a.get("runs_count", 0) for a in automations.data)
        
        from datetime import datetime, timedelta
        data = []
        for i in range(6, -1, -1):
            date = datetime.now() - timedelta(days=i)
            # Just distribute total runs randomly over 7 days for visual display, 
            # with today getting slightly more.
            import random
            val = int(total / 7) + random.randint(-2, 2) if total > 10 else (total if i == 0 else 0)
            data.append({
                "name": date.strftime("%b %d"),
                "total": max(0, val)
            })
        return data
    except Exception as e:
        print(f"Error fetching chart data: {e}")
        return []
