from app.services.conversation_service import (
    get_conversation,
    update_stage,
    update_last_message,
)

from app.models.conversation_stage import ConversationStage

from app.services.instagram_service import (
    send_follow_message,
)

from app.utils.helper import DEMO_USER_ID


def handle_access_button(username: str):
    """
    Handles:
    Send me the access
    """

    conversation = get_conversation(
        user_id=DEMO_USER_ID,
        username=username
    )

    if conversation is None:
        print("Conversation not found.")
        return

    if (
        conversation["current_stage"]
        != ConversationStage.WAITING_ACCESS_CLICK.value
    ):
        print(
            f"Invalid conversation stage: "
            f"{conversation['current_stage']}"
        )
        return

    update_last_message(
        conversation["id"],
        "Send me the access"
    )

    update_stage(
        conversation["id"],
        ConversationStage.WAITING_FOLLOW_CONFIRM
    )

    send_follow_message(username)

    print(
        "Conversation moved to "
        "WAITING_FOLLOW_CONFIRM"
    )


def handle_button(username: str, button: str):
    """
    Central router for every Instagram button click.
    """

    if button == "Send me the access":
        handle_access_button(username)

    elif button == "I'm Following ✅":
        from app.handlers.follow_handler import (
            handle_follow_confirmation
        )

        handle_follow_confirmation(username)

    else:
        print(f"Unknown button: {button}")