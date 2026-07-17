from typing import Dict, Any, Optional, List
from app.services.supabase_service import supabase

class AccountRepository:
    def get_by_user_id(self, user_id: str) -> List[Dict[str, Any]]:
        try:
            response = supabase.table("connected_accounts").select("*").eq("user_id", user_id).execute()
            return response.data or []
        except Exception as e:
            print(f"Error fetching accounts for user {user_id}: {e}")
            return []

    def get_by_id(self, account_id: str) -> Optional[Dict[str, Any]]:
        try:
            response = supabase.table("connected_accounts").select("*").eq("id", account_id).limit(1).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error fetching account {account_id}: {e}")
            return None

    def get_by_instagram_id(self, instagram_id: str) -> Optional[Dict[str, Any]]:
        try:
            response = supabase.table("connected_accounts").select("*").eq("instagram_account_id", instagram_id).eq("active", True).limit(1).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error fetching account by IG ID {instagram_id}: {e}")
            return None
            
    def get_by_page_id(self, page_id: str) -> Optional[Dict[str, Any]]:
        try:
            response = supabase.table("connected_accounts").select("*").eq("facebook_page_id", page_id).eq("active", True).limit(1).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error fetching account by Page ID {page_id}: {e}")
            return None

    def upsert_account(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            # We assume uniqueness on user_id + facebook_page_id, or just facebook_page_id
            # Let's check if it exists first
            user_id = data.get("user_id")
            page_id = data.get("facebook_page_id")
            
            existing = supabase.table("connected_accounts").select("id").eq("user_id", user_id).eq("facebook_page_id", page_id).execute()
            
            if existing.data and len(existing.data) > 0:
                response = supabase.table("connected_accounts").update(data).eq("id", existing.data[0]["id"]).execute()
            else:
                response = supabase.table("connected_accounts").insert(data).execute()
                
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error upserting account: {e}")
            return None

    def delete_account(self, account_id: str, user_id: str) -> bool:
        try:
            response = supabase.table("connected_accounts").delete().eq("id", account_id).eq("user_id", user_id).execute()
            return True
        except Exception as e:
            print(f"Error deleting account {account_id}: {e}")
            return False

    def create_oauth_session(self, user_id: str) -> Optional[str]:
        try:
            response = supabase.table("oauth_sessions").insert({"user_id": user_id}).execute()
            return response.data[0]["id"] if response.data else None
        except Exception as e:
            print(f"Error creating oauth session: {e}")
            return None

    def get_user_from_session(self, session_id: str) -> Optional[str]:
        try:
            response = supabase.table("oauth_sessions").select("user_id").eq("id", session_id).limit(1).execute()
            return response.data[0]["user_id"] if response.data else None
        except Exception as e:
            print(f"Error fetching oauth session {session_id}: {e}")
            return None
            
    def delete_oauth_session(self, session_id: str):
        try:
            supabase.table("oauth_sessions").delete().eq("id", session_id).execute()
        except Exception as e:
            print(f"Error deleting oauth session {session_id}: {e}")

account_repository = AccountRepository()
