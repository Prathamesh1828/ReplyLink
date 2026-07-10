from app.services.conversation_service import (
    get_conversation,
    update_stage,
    complete_conversation
)

from app.services.automation_service import get_automation_by_id

from app.services.instagram_service import send_dm

from app.models.conversation_stage import ConversationStage
from app.utils.helper import DEMO_USER_ID


def handle_follow_confirmation(username: str):
    """
    User clicked 'I'm Following'
    """

    conversation = get_conversation(
        DEMO_USER_ID,
        username
    )

    if not conversation:
        print("Conversation not found.")
        return

    if conversation["current_stage"] != ConversationStage.WAITING_FOLLOW_CONFIRM.value:
        print("User is not expected to confirm follow.")
        return

    # Temporary mock verification
    is_following = True

    if not is_following:
        print("User is not following.")
        return

    automation = get_automation_by_id(
        conversation["automation_id"]
    )

    final_message = (
        f'{automation["dm_message"]}\n\n'
        f'{automation["link"]}'
    )

    send_dm(
        username,
        final_message
    )

    update_stage(
        conversation["id"],
        ConversationStage.COMPLETED
    )

    complete_conversation(
        conversation["id"]
    )

    print("Conversation completed.")