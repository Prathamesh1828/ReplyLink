from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Dict, Optional
from app.services.supabase_service import supabase

from app.core.dependencies import get_current_user

router = APIRouter()

@router.get("/contacts")
async def get_contacts(user_id: str = Depends(get_current_user)):
    # 1. Fetch user's automations
    automations_res = supabase.table("automations").select("id, automation_type").eq("user_id", user_id).execute()
    automations = automations_res.data
    
    # Fetch business username
    account_res = supabase.table("connected_accounts").select("instagram_username").eq("user_id", user_id).execute()
    business_username = account_res.data[0]["instagram_username"] if account_res.data else None
    
    if not automations:
        return []
        
    automation_ids = [a["id"] for a in automations]
    automation_types = {a["id"]: a["automation_type"] for a in automations}
    
    # 2. Fetch runs for these automations
    runs_res = supabase.table("automation_runs").select("*").in_("automation_id", automation_ids).order("created_at", desc=False).execute()
    runs = runs_res.data
    
    # 3. Aggregate runs by username
    contacts_map = {}
    for run in runs:
        username = run.get("username")
        if not username:
            continue
            
        auto_type = automation_types.get(run["automation_id"])
        if auto_type == "auto_dm_comments":
            run_source = "Comment"
        elif auto_type == "auto_reply_story":
            run_source = "Story Reply"
        elif auto_type in ["auto_reply_dm", "dm_reply"]:
            run_source = "DM"
        elif auto_type == "ai_agent":
            run_source = "AI Agent"
        else:
            run_source = "Unknown"
            
        display_name = "You" if username == business_username else username
        display_handle = "" if username == business_username else f"@{username}"
            
        if username not in contacts_map:
            contacts_map[username] = {
                "id": username,
                "name": display_name,
                "handle": display_handle,
                "email": None,
                "source": run_source, # Primary source is their first contact
                "status": "lead",
                "firstContact": run.get("created_at"),
                "lastActive": run.get("created_at"),
                "messages": 1,
                "timeline": []
            }
        else:
            contact = contacts_map[username]
            contact["messages"] += 1
            
            # Update lastActive (runs are ordered by created_at asc)
            contact["lastActive"] = run.get("created_at")
                
        # Timeline events
        status_msg = run.get('status', 'unknown')
        if run.get("comment"):
            if run_source == "DM":
                text = f"Sent DM: \"{run.get('comment')}\""
            elif run_source == "Story Reply":
                text = f"Replied to Story: \"{run.get('comment')}\""
            else:
                text = f"Commented: \"{run.get('comment')}\""
        else:
            text = f"Automation run ({status_msg})"
            
        timeline_entry = {
            "type": "captured" if status_msg == "success" else "dm_received", 
            "text": text, 
            "time": run.get("created_at"),
            "source": run_source
        }
        contacts_map[username]["timeline"].append(timeline_entry)
        
    contacts = list(contacts_map.values())
    
    # Sort timeline inside each contact descending
    for contact in contacts:
        contact["timeline"].sort(key=lambda x: x["time"], reverse=True)
        
    # Sort contacts by lastActive descending
    contacts.sort(key=lambda x: x["lastActive"], reverse=True)
    
    return contacts
