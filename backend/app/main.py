import json
import os

from dotenv import load_dotenv
from fastapi import FastAPI, Query, Request

from app.api.knowledge import router as knowledge_router

# --------------------------------------------------
# Load Environment Variables
# --------------------------------------------------

load_dotenv()

VERIFY_TOKEN = os.getenv("VERIFY_TOKEN")

# --------------------------------------------------
# FastAPI App
# --------------------------------------------------

app = FastAPI(
    title="ReplyLink API",
    version="1.0.0"
)

# --------------------------------------------------
# Register API Routers
# --------------------------------------------------

app.include_router(knowledge_router)

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

        entries = payload.get("entry", [])

        for entry in entries:

            changes = entry.get("changes", [])

            for change in changes:

                field = change.get("field")

                # --------------------------------------
                # Comment Event
                # --------------------------------------

                if field == "comments":

                    value = change.get("value", {})

                    username = (
                        value.get("from", {})
                        .get("username", "Unknown")
                    )

                    comment_text = value.get("text", "")

                    print("\nNEW COMMENT RECEIVED")
                    print("User:", username)
                    print("Comment:", comment_text)

                    keyword = comment_text.strip().upper()

                    if keyword in KEYWORDS:

                        response_message = KEYWORDS[keyword]

                        print("\nMATCH FOUND")
                        print("Keyword:", keyword)
                        print("Response:", response_message)

                        # TODO:
                        # Replace with Automation Service
                        # automation_service.handle_comment(...)

                    else:

                        print("\nNO AUTOMATION FOUND")

                # --------------------------------------
                # Message Event
                # --------------------------------------

                elif field == "messages":

                    print("\nMESSAGE EVENT RECEIVED")

                    print(
                        json.dumps(
                            change,
                            indent=2
                        )
                    )

                    # TODO:
                    # Replace with FAQ Service
                    # faq_service.handle_message(...)

    except Exception as e:

        print("\nERROR PROCESSING WEBHOOK")
        print(str(e))

    return {
        "status": "received"
    }