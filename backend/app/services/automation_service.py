from app.services.supabase_service import supabase


def get_automation_by_keyword(keyword: str):
    """
    Get an active automation matching the comment keyword.
    """

    response = (
        supabase
        .table("automations")
        .select("*")
        .eq("keyword", keyword.upper())
        .eq("active", True)
        .execute()
    )

    if response.data:
        return response.data[0]

    return None


def get_automation_by_id(automation_id: str):
    """
    Get an automation by its unique ID.
    Used later in the conversation flow after button clicks.
    """

    response = (
        supabase
        .table("automations")
        .select("*")
        .eq("id", automation_id)
        .single()
        .execute()
    )

    return response.data