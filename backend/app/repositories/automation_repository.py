from typing import List, Optional
from app.services.supabase_service import supabase
from app.schemas.automation import AutomationCreate, AutomationUpdate

class AutomationRepository:
    
    @staticmethod
    def create_automation(user_id: str, automation: AutomationCreate) -> Optional[dict]:
        data = {
            "user_id": user_id,
            "name": automation.name,
            "automation_type": automation.automation_type,
            "status": automation.status,
            "config": automation.config.model_dump(),
            "active": automation.active,
            "keyword": automation.config.keywords[0] if automation.config.keywords else "default",
            "dm_message": automation.config.openingMessage,
            "link": automation.config.finalLink
        }
        
        response = supabase.table("automations").insert(data).execute()
        return response.data[0] if response.data else None

    @staticmethod
    def get_automations_by_user(user_id: str) -> List[dict]:
        response = supabase.table("automations").select("*").eq("user_id", user_id).neq("automation_type", "ai_agent").order("created_at", desc=True).execute()
        return response.data

    @staticmethod
    def get_active_automations_by_user(user_id: str) -> List[dict]:
        response = supabase.table("automations").select("*").eq("user_id", user_id).eq("status", "Active").execute()
        return response.data

    @staticmethod
    def get_automation_by_id(automation_id: str) -> Optional[dict]:
        response = supabase.table("automations").select("*").eq("id", automation_id).execute()
        return response.data[0] if response.data else None

    @staticmethod
    def update_automation(automation_id: str, automation: AutomationUpdate) -> Optional[dict]:
        data = {}
        if automation.name is not None:
            data["name"] = automation.name
        if automation.status is not None:
            data["status"] = automation.status
        if automation.active is not None:
            data["active"] = automation.active
        if automation.config is not None:
            data["config"] = automation.config.model_dump()
            data["keyword"] = automation.config.keywords[0] if automation.config.keywords else "default"
            data["dm_message"] = automation.config.openingMessage
            data["link"] = automation.config.finalLink

        if not data:
            return None
            
        from datetime import datetime, timezone
        data["updated_at"] = datetime.now(timezone.utc).isoformat()

        response = supabase.table("automations").update(data).eq("id", automation_id).execute()
        return response.data[0] if response.data else None
        
    @staticmethod
    def delete_automation(automation_id: str) -> bool:
        supabase.table("automations").delete().eq("id", automation_id).execute()
        return True
