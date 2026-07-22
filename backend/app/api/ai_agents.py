from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app.services.supabase_service import supabase
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/ai_agents", tags=["AI Agents"])

class AIAgentConfig(BaseModel):
    is_active: bool
    persona: str
    fallback_message: Optional[str] = "I'm having trouble understanding right now. Please try again later."
    cal_booking_link: Optional[str] = ""
    config: Optional[dict] = {}

@router.get("/{account_id}")
def get_ai_agent(account_id: str, user_id: str = Depends(get_current_user)):
    try:
        # Check if table exists/query works
        response = supabase.table("ai_agents").select("*").eq("instagram_account_id", account_id).eq("user_id", user_id).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        else:
            return {
                "instagram_account_id": account_id,
                "is_active": False,
                "persona": "You are a helpful and polite sales assistant.",
                "fallback_message": "I'm having trouble understanding right now. Please try again later.",
                "cal_booking_link": "",
                "config": {}
            }
    except Exception as e:
        print(f"Error fetching AI agent: {e}")
        # Return default if table doesn't exist yet
        return {
            "instagram_account_id": account_id,
            "is_active": False,
            "persona": "You are a helpful and polite sales assistant.",
            "fallback_message": "I'm having trouble understanding right now. Please try again later.",
            "cal_booking_link": "",
            "config": {}
        }

@router.put("/{account_id}")
def update_ai_agent(account_id: str, config: AIAgentConfig, user_id: str = Depends(get_current_user)):
    try:
        # Check if exists
        existing = supabase.table("ai_agents").select("id").eq("instagram_account_id", account_id).eq("user_id", user_id).execute()
        
        data = {
            "user_id": user_id,
            "instagram_account_id": account_id,
            "is_active": config.is_active,
            "persona": config.persona,
            "fallback_message": config.fallback_message,
            "cal_booking_link": config.cal_booking_link,
            "config": config.config
        }
        
        if existing.data and len(existing.data) > 0:
            res = supabase.table("ai_agents").update(data).eq("id", existing.data[0]["id"]).execute()
        else:
            res = supabase.table("ai_agents").insert(data).execute()
            
        return res.data[0] if res.data else data
    except Exception as e:
        print(f"Error updating AI agent: {e}")
        raise HTTPException(status_code=500, detail="Failed to update AI agent settings. Please ensure the ai_agents table exists in Supabase.")
