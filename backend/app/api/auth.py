from fastapi import APIRouter, Request, HTTPException, Depends, Header
from fastapi.responses import RedirectResponse
from typing import Optional
import urllib.parse
from app.core.config import settings
from app.services.meta_service import meta_service
from app.repositories.account_repository import account_repository
from app.core.dependencies import get_current_user
import json
import base64

router = APIRouter(prefix="/api/auth", tags=["Auth"])

META_SCOPES = [
    "instagram_basic",
    "instagram_manage_messages",
    "instagram_manage_comments",
    "pages_read_engagement",
    "pages_show_list",
    "pages_manage_metadata"
]

@router.post("/meta/intent")
def create_meta_intent(user_id: str = Depends(get_current_user)):
    """Generates a secure state for the OAuth flow."""
    session_id = account_repository.create_oauth_session(user_id)
    if not session_id:
        raise HTTPException(status_code=500, detail="Could not create OAuth session")
    return {"state": session_id}

@router.get("/meta/login")
def meta_login(state: str):
    """Initiates the OAuth flow. State MUST be provided."""
    if not settings.META_APP_ID or not settings.META_REDIRECT_URI:
        raise HTTPException(status_code=500, detail="Meta OAuth is not configured properly.")
        
    params = {
        "client_id": settings.META_APP_ID,
        "redirect_uri": settings.META_REDIRECT_URI,
        "scope": ",".join(META_SCOPES),
        "response_type": "code",
        "state": state
    }
    
    auth_url = f"https://www.facebook.com/v19.0/dialog/oauth?{urllib.parse.urlencode(params)}"
    return RedirectResponse(url=auth_url)

@router.get("/meta/callback")
def meta_callback(request: Request):
    """Handles the OAuth callback from Meta."""
    query_params = request.query_params
    code = query_params.get("code")
    state = query_params.get("state")
    error = query_params.get("error")
    error_description = query_params.get("error_description")

    if error:
        print(f"Meta OAuth Error: {error} - {error_description}")
        return RedirectResponse(url="http://localhost:3000/instagram?error=access_denied")
        
    if not code or not state:
        return RedirectResponse(url="http://localhost:3000/instagram?error=invalid_request")
        
    user_id = account_repository.get_user_from_session(state)
    if not user_id:
        return RedirectResponse(url="http://localhost:3000/instagram?error=invalid_state")
        
    account_repository.delete_oauth_session(state)
    
    short_lived_token = meta_service.exchange_code_for_token(code)
    if not short_lived_token:
        return RedirectResponse(url="http://localhost:3000/instagram?error=token_exchange_failed")
        
    long_lived_token = meta_service.get_long_lived_token(short_lived_token)
    if not long_lived_token:
        long_lived_token = short_lived_token 
        
    pages = meta_service.get_user_pages(long_lived_token)
    
    # Filter for pages that actually have an IG business account linked
    ig_pages = [p for p in pages if "instagram_business_account" in p]
    
    if len(ig_pages) == 0:
        return RedirectResponse(url="http://localhost:3000/instagram?error=no_instagram_account")
        
    if len(ig_pages) == 1:
        # Just one page, auto connect it
        page = ig_pages[0]
        account_repository.upsert_account({
            "user_id": user_id,
            "instagram_account_id": page["instagram_business_account"].get("id"),
            "facebook_page_id": page.get("id"),
            "facebook_page_name": page.get("name"),
            "page_access_token": page.get("access_token"),
            "active": True
        })
        # Crucial: Subscribe the page to our App's Webhooks!
        meta_service.subscribe_page_to_webhooks(page.get("id"), page.get("access_token"))
        
        return RedirectResponse(url="http://localhost:3000/instagram?success=true")
        
    # If multiple pages, we need the user to select.
    # We will safely encode the data into a base64 string to pass via URL parameter
    # In production, storing this in a temporary DB table (e.g. `pending_accounts`) is better,
    # but for simplicity we will pass the safe data (without access tokens) via base64,
    # or temporarily save them all as inactive and let the user activate one.
    
    # BEST APPROACH: Save all of them as inactive!
    for page in ig_pages:
        account_repository.upsert_account({
            "user_id": user_id,
            "instagram_account_id": page["instagram_business_account"].get("id"),
            "facebook_page_id": page.get("id"),
            "facebook_page_name": page.get("name"),
            "page_access_token": page.get("access_token"),
            "active": False # Requires user activation
        })
        # Subscribe them anyway so when activated, they receive webhooks
        meta_service.subscribe_page_to_webhooks(page.get("id"), page.get("access_token"))
        
    return RedirectResponse(url="http://localhost:3000/instagram/select-page")

@router.get("/meta/media")
def get_user_meta_media(x_user_id: Optional[str] = Header(None)):
    """Fetches the connected Instagram account's media posts."""
    # Use fallback real ID for testing
    user_id = x_user_id or "7dc543e2-2801-49ec-8d10-c6fc07b557d2"
    # Note: Using the real user_id to look up the connected account
    # but for testing if the frontend isn't sending a token, we might need a fallback.
    # Let's check connected accounts for this user:
    accounts = account_repository.get_by_user_id(user_id)
    if not accounts:
        # Fallback to the hardcoded ID for testing just in case
        accounts = account_repository.get_by_user_id("7dc543e2-2801-49ec-8d10-c6fc07b557d2")
        
    if not accounts:
        raise HTTPException(status_code=404, detail="No Instagram account connected")
        
    # Get the active account
    active_account = next((acc for acc in accounts if acc.get("active")), None)
    if not active_account:
        active_account = accounts[0] # Fallback to first if none active
        
    ig_id = active_account.get("instagram_account_id")
    token = active_account.get("page_access_token")
    
    if not ig_id or not token:
        raise HTTPException(status_code=500, detail="Invalid account configuration")
        
    media = meta_service.get_instagram_media(ig_id, token)
    return {"media": media}

@router.get("/meta/stories")
def get_user_meta_stories(x_user_id: Optional[str] = Header(None)):
    """Fetches the connected Instagram account's active stories."""
    user_id = x_user_id or "7dc543e2-2801-49ec-8d10-c6fc07b557d2"
    accounts = account_repository.get_by_user_id(user_id)
    if not accounts:
        accounts = account_repository.get_by_user_id("7dc543e2-2801-49ec-8d10-c6fc07b557d2")
        
    if not accounts:
        raise HTTPException(status_code=404, detail="No Instagram account connected")
        
    active_account = next((acc for acc in accounts if acc.get("active")), None)
    if not active_account:
        active_account = accounts[0]
        
    ig_id = active_account.get("instagram_account_id")
    token = active_account.get("page_access_token")
    
    if not ig_id or not token:
        raise HTTPException(status_code=500, detail="Invalid account configuration")
        
    stories = meta_service.get_instagram_stories(ig_id, token)
    return {"media": stories}
