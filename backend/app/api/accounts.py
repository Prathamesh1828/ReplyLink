from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from app.repositories.account_repository import account_repository
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/accounts", tags=["Accounts"])

@router.get("/", response_model=List[Dict[str, Any]])
def list_accounts(user_id: str = Depends(get_current_user)):
    """List all connected accounts for the user."""
    accounts = account_repository.get_by_user_id(user_id)
    # Mask the access token for security
    for acc in accounts:
        acc.pop("page_access_token", None)
    return accounts

@router.get("/{account_id}")
def get_account(account_id: str, user_id: str = Depends(get_current_user)):
    """Get a specific account by ID."""
    account = account_repository.get_by_id(account_id)
    if not account or account.get("user_id") != user_id:
        raise HTTPException(status_code=404, detail="Account not found")
    account.pop("page_access_token", None)
    return account

@router.delete("/{account_id}")
def delete_account(account_id: str, user_id: str = Depends(get_current_user)):
    """Disconnect an account."""
    success = account_repository.delete_account(account_id, user_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete account")
    return {"status": "success"}

@router.post("/{account_id}/activate")
def activate_account(account_id: str, user_id: str = Depends(get_current_user)):
    """Activate an account."""
    account = account_repository.get_by_id(account_id)
    if not account or account.get("user_id") != user_id:
        raise HTTPException(status_code=404, detail="Account not found")
        
    account_repository.upsert_account({
        "id": account_id,
        "user_id": user_id,
        "active": True
    })
    return {"status": "success"}

@router.post("/{account_id}/refresh")
def refresh_account(account_id: str, user_id: str = Depends(get_current_user)):
    """Refresh the long-lived token (to be implemented)."""
    # For now, just return success
    return {"status": "success", "message": "Token refreshed"}

@router.get("/{account_id}/profile")
def get_account_profile(account_id: str, user_id: str = Depends(get_current_user)):
    """Fetch the Instagram profile details from Meta API."""
    account = account_repository.get_by_id(account_id)
    if not account or account.get("user_id") != user_id:
        raise HTTPException(status_code=404, detail="Account not found")
        
    token = account.get("page_access_token")
    ig_id = account.get("instagram_account_id")
    
    if not token or not ig_id:
        return {"username": account.get("instagram_username") or "username", "profile_picture_url": None}
        
    import requests
    try:
        url = f"https://graph.facebook.com/v21.0/{ig_id}?fields=username,profile_picture_url&access_token={token}"
        res = requests.get(url).json()
        
        # Optionally update the DB with the fetched username if missing
        fetched_username = res.get("username")
        if fetched_username and account.get("instagram_username") != fetched_username:
             account_repository.upsert_account({
                 "id": account_id,
                 "user_id": user_id,
                 "instagram_username": fetched_username
             })
             
        return {
            "username": fetched_username or account.get("instagram_username") or "username",
            "profile_picture_url": res.get("profile_picture_url")
        }
    except Exception as e:
        return {"username": account.get("instagram_username") or "username", "profile_picture_url": None}
