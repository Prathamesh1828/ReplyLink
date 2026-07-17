from typing import Optional, Dict, Any
from app.repositories.account_repository import account_repository

class AccountService:
    @staticmethod
    def get_account_by_instagram_id(instagram_id: str) -> Optional[Dict[str, Any]]:
        """Fetch the active account linked to the provided Instagram ID."""
        return account_repository.get_by_instagram_id(instagram_id)

    @staticmethod
    def get_account_by_page_id(page_id: str) -> Optional[Dict[str, Any]]:
        """Fetch the active account linked to the provided Facebook Page ID."""
        return account_repository.get_by_page_id(page_id)

account_service = AccountService()