from app.services.supabase_service import supabase
from app.models.conversation_stage import ConversationStage


def create_conversation(
    user_id: str,
    username: str,
    automation_id: str,
    keyword: str
):
    """
    Create a new conversation when a user comments.
    """

    data = {
        "user_id": user_id,
        "instagram_username": username,
        "automation_id": automation_id,
        "current_keyword": keyword.upper(),
        "current_stage": ConversationStage.WAITING_ACCESS_CLICK.value
    }

    response = (
        supabase
        .table("conversations")
        .insert(data)
        .execute()
    )

    return response.data[0]


def get_conversation(user_id: str, username: str):
    """
    Get the latest conversation for an Instagram user.
    """

    response = (
        supabase
        .table("conversations")
        .select("*")
        .eq("user_id", user_id)
        .eq("instagram_username", username)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def update_stage(conversation_id: str, stage: ConversationStage):
    """
    Update the current conversation stage.
    """

    response = (
        supabase
        .table("conversations")
        .update(
            {
                "current_stage": stage.value
            }
        )
        .eq("id", conversation_id)
        .execute()
    )

    return response.data[0]


def update_last_message(conversation_id: str, message: str):
    """
    Save the last message/button clicked by the user.
    """

    response = (
        supabase
        .table("conversations")
        .update(
            {
                "last_user_message": message
            }
        )
        .eq("id", conversation_id)
        .execute()
    )

    return response.data[0]


def complete_conversation(conversation_id: str):
    """
    Mark the conversation as completed.
    """

    return update_stage(
        conversation_id,
        ConversationStage.COMPLETED
    )


def delete_conversation(conversation_id: str):
    """
    Delete a conversation.
    Mainly useful during testing.
    """

    response = (
        supabase
        .table("conversations")
        .delete()
        .eq("id", conversation_id)
        .execute()
    )

    return response.data


def conversation_exists(user_id: str, username: str):
    """
    Check whether an active conversation already exists.
    """

    conversation = get_conversation(user_id, username)

    return conversation is not None


def restart_conversation(
    conversation_id: str,
    keyword: str
):
    """
    Restart an existing conversation from the first stage.
    """

    response = (
        supabase
        .table("conversations")
        .update(
            {
                "current_keyword": keyword.upper(),
                "current_stage": ConversationStage.WAITING_ACCESS_CLICK.value,
                "last_user_message": None
            }
        )
        .eq("id", conversation_id)
        .execute()
    )

    return response.data[0]