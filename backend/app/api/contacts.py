from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Dict, Optional
from app.services.supabase_service import supabase

router = APIRouter()

async def get_user_id(x_user_id: Optional[str] = Header(None)):
    return x_user_id or "7dc543e2-2801-49ec-8d10-c6fc07b557d2"

@router.get("/contacts")
async def get_contacts(x_user_id: Optional[str] = Header(None)):
    user_id = await get_user_id(x_user_id)
    
    # 1. Fetch user's automations
    automations_res = supabase.table("automations").select("id, automation_type").eq("user_id", user_id).execute()
    automations = automations_res.data
    
    if not automations:
        return []
        
    automation_ids = [a["id"] for a in automations]
    automation_types = {a["id"]: a["automation_type"] for a in automations}
    
    # 2. Fetch runs for these automations
    # Note: Supabase limits to 1000 rows by default. For a real app, you'd use pagination or an RPC function.
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
        else:
            run_source = "Unknown"
            
        if username not in contacts_map:
            contacts_map[username] = {
                "id": username,
                "name": username,
                "handle": f"@{username}",
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
