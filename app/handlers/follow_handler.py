from app.services.conversation_service import (
    get_conversation,
    complete_conversation,
)

from app.services.automation_service import (
    get_automation_by_id,
)

from app.services.instagram_service import (
    send_dm,
    send_follow_message,
)

from app.services.follow_service import (
    verify_follow,
)

from app.models.conversation_stage import (
    ConversationStage,
)

from app.utils.helper import (
    DEMO_USER_ID,
)


def handle_follow_confirmation(username: str):
    """
    Handles the user clicking:

    "I'm Following ✅"
    """

    conversation = get_conversation(
        user_id=DEMO_USER_ID,
        username=username,
    )

    if conversation is None:
        print("Conversation not found.")
        return

    if (
        conversation["current_stage"]
        != ConversationStage.WAITING_FOLLOW_CONFIRM.value
    ):
        print(
            f"Invalid conversation stage: "
            f"{conversation['current_stage']}"
        )
        return

    # Temporary mock verification.
    # Later this will call the real Instagram Graph API.
    is_following = verify_follow(
        business_account_id="mock_business_id",
        instagram_user_id=username,
    )

    if not is_following:
        print("User is not following yet.")

        send_follow_message(username)

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
        final_message,
    )

    complete_conversation(
        conversation["id"]
    )

    print("Conversation completed.")