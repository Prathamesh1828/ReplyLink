from typing import Dict, Any
from app.services.automation_service import automation_service
import json

class WebhookHandler:
    @staticmethod
    def handle_instagram_webhook(payload: Dict[str, Any]):
        try:
            entries = payload.get("entry", [])
            for entry in entries:
                instagram_business_id = entry.get("id")
                changes = entry.get("changes", [])

                for change in changes:
                    field = change.get("field")

                    # --------------------------------------
                    # Comment Event
                    # --------------------------------------
                    if field == "comments":
                        value = change.get("value", {})
                        from_user = value.get("from", {})
                        username = from_user.get("username", "Unknown")
                        commenter_id = from_user.get("id", "Unknown")
                        comment_text = value.get("text", "")
                        comment_id = value.get("id", f"{username}_{instagram_business_id}") # Fallback if id missing
                        media = value.get("media", {})
                        media_id = media.get("id", "Unknown")

                        print(f"\nNEW COMMENT RECEIVED (ID: {comment_id}) on Media ID: {media_id}")
                        print(f"User: {username} (ID: {commenter_id})")
                        print(f"Comment: {comment_text}")

                        # Trigger the dynamic automation service
                        automation_service.handle_comment(
                            comment_text=comment_text, 
                            username=username,
                            commenter_id=commenter_id,
                            comment_id=comment_id,
                            instagram_business_id=instagram_business_id,
                            media_id=media_id
                        )

                    # --------------------------------------
                    # Removed incorrect field == "messages" from changes loop
                    # --------------------------------------
                    
                # --------------------------------------
                # Messaging Events (DMs and Postbacks)
                # --------------------------------------
                messaging_events = entry.get("messaging", [])
                for event in messaging_events:
                    sender_id = event.get("sender", {}).get("id")
                    
                    if "postback" in event:
                        payload_str = event["postback"].get("payload")
                        if payload_str and payload_str.startswith("AUTO_RUN_"):
                            automation_service.handle_postback(payload_str, sender_id, instagram_business_id)
                    elif "message" in event:
                        print("\nMESSAGE EVENT RECEIVED")
                        # DM flow to be handled later by FAQ/Knowledge service
                        pass
        except Exception as e:
            print("\nERROR PROCESSING WEBHOOK in Handler")
            print(str(e))

webhook_handler = WebhookHandler()
