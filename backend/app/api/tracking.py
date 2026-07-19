from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from app.services.supabase_service import supabase

router = APIRouter(
    prefix="/api/l",
    tags=["Tracking"]
)

@router.get("/{run_id}")
def track_click_and_redirect(run_id: str):
    """Tracks a click and redirects to the target URL."""
    try:
        # 1. Fetch the run
        run_res = supabase.table("automation_runs").select("*").eq("id", run_id).execute()
        if not run_res.data:
            raise HTTPException(status_code=404, detail="Run not found")
            
        run = run_res.data[0]
        
        # 2. Fetch the automation to get the link and current clicks
        auto_res = supabase.table("automations").select("*").eq("id", run["automation_id"]).execute()
        if not auto_res.data:
            raise HTTPException(status_code=404, detail="Automation not found")
            
        automation = auto_res.data[0]
        final_link = automation.get("config", {}).get("finalLink", "https://google.com")
        
        # 3. Only increment if this run hasn't been clicked yet
        if not run.get("link_clicked"):
            # Update the run
            supabase.table("automation_runs").update({"link_clicked": True}).eq("id", run_id).execute()
            
            # Increment automation click count
            new_clicks = automation.get("clicks_count", 0) + 1
            supabase.table("automations").update({"clicks_count": new_clicks}).eq("id", automation["id"]).execute()
            
        # 4. Redirect
        return RedirectResponse(url=final_link)
        
    except Exception as e:
        print(f"Tracking error: {e}")
        # Redirect to a safe fallback
        return RedirectResponse(url="https://google.com")
