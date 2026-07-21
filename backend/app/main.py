import json
import os

from dotenv import load_dotenv
from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.knowledge import router as knowledge_router
from app.api.automations import router as automations_router
from app.api.auth import router as auth_router
from app.api.accounts import router as accounts_router
from app.api.tracking import router as tracking_router
from app.api.dashboard import router as dashboard_router
from app.api.ai_agents import router as ai_agents_router

# --------------------------------------------------
# Load Environment Variables
# --------------------------------------------------

load_dotenv()

VERIFY_TOKEN = os.getenv("VERIFY_TOKEN")

# --------------------------------------------------
# FastAPI App
# --------------------------------------------------

app = FastAPI(title="ReplyLink API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://replylink.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# Register API Routers
# --------------------------------------------------

from fastapi.staticfiles import StaticFiles
import os

os.makedirs("app/uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="app/uploads"), name="uploads")

from app.api.contacts import router as contacts_router
app.include_router(auth_router)
app.include_router(automations_router)
app.include_router(accounts_router)
app.include_router(dashboard_router)
app.include_router(ai_agents_router)
app.include_router(knowledge_router)
app.include_router(tracking_router)
app.include_router(contacts_router, prefix="/api", tags=["contacts"])

# --------------------------------------------------
# Sample Automations (Temporary)
# --------------------------------------------------

KEYWORDS = {
    "PRICE": "Here's our pricing guide.",
    "BROCHURE": "Here's our brochure.",
    "DEMO": "Book a demo here.",
    "INFO": "Here's more information about our services."
}

# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "status": "ReplyLink Running"
    }

@app.get("/subscribe-pages")
def subscribe_pages():
    """Manually subscribe all connected Facebook Pages to the app's webhooks."""
    from app.services.supabase_service import supabase
    from app.services.meta_service import meta_service
    
    accounts = supabase.table("connected_accounts").select("*").eq("active", True).execute()
    results = []
    
    for acc in accounts.data:
        page_id = acc.get("facebook_page_id")
        token = acc.get("page_access_token")
        ig_id = acc.get("instagram_account_id")
        
        if page_id and token:
            url = f"https://graph.facebook.com/v19.0/{page_id}/subscribed_apps"
            params = {
                "subscribed_fields": "feed",
                "access_token": token
            }
            import httpx
            with httpx.Client() as client:
                response = client.post(url, params=params)
                if response.status_code == 200 and response.json().get("success"):
                    results.append({
                        "page_id": page_id,
                        "ig_id": ig_id,
                        "subscribed": True
                    })
                else:
                    results.append({
                        "page_id": page_id,
                        "ig_id": ig_id,
                        "subscribed": False,
                        "error": response.text
                    })
        else:
            results.append({
                "page_id": page_id,
                "ig_id": ig_id,
                "subscribed": False,
                "error": "Missing page_id or token"
            })
    
    return {"results": results}

# --------------------------------------------------
# Meta Webhook Verification
# --------------------------------------------------

@app.get("/webhook")
async def verify_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
):

    print("\nWEBHOOK VERIFICATION REQUEST")
    print("MODE:", hub_mode)
    print("TOKEN:", hub_verify_token)
    print("CHALLENGE:", hub_challenge)

    if (
        hub_mode == "subscribe"
        and hub_verify_token == VERIFY_TOKEN
    ):
        print("WEBHOOK VERIFIED SUCCESSFULLY\n")
        return int(hub_challenge)

    print("WEBHOOK VERIFICATION FAILED\n")

    return {"error": "Verification failed"}

# --------------------------------------------------
# Instagram Webhook Receiver
# --------------------------------------------------

@app.post("/webhook")
async def receive_webhook(request: Request):

    payload = await request.json()

    print("\n" + "=" * 60)
    print("INSTAGRAM WEBHOOK EVENT RECEIVED")
    print("=" * 60)

    print(json.dumps(payload, indent=2))
    print("=" * 60)

    try:
        from app.handlers.webhook_handler import webhook_handler
        webhook_handler.handle_instagram_webhook(payload)

    except Exception as e:
        print("\nERROR PROCESSING WEBHOOK")
        print(str(e))

    return {
        "status": "received"
    }