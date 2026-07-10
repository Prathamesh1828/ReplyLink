from app.services.automation_service import get_automation_by_keyword
from app.services.instagram_service import (
    send_dm,
    send_button_message,
)
from app.services.lead_service import create_lead
from app.services.conversation_service import create_conversation
from app.utils.helper import DEMO_USER_ID


def process_comment(username: str, comment_text: str):

    # Find matching automation
    automation = get_automation_by_keyword(comment_text)

    if not automation:
        print("No automation found.")
        return

    # Create conversation
    create_conversation(
        user_id=DEMO_USER_ID,
        username=username,
        automation_id=automation["id"],
        keyword=comment_text
    )

    # Send first CTA message
    send_button_message(
        instagram_user=username,
        message=(
            "👋 Hey! Thanks for commenting.\n\n"
            "Tap below and I'll send your access shortly."
        ),
        buttons=[
            "Send me the access"
        ]
    )

    # Store lead
    create_lead(
        user_id=DEMO_USER_ID,
        username=username,
        keyword=comment_text
    )