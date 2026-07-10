from app.services.supabase_service import supabase


def get_automation_by_keyword(keyword: str):

    response = (
        supabase.table("automations")
        .select("*")
        .eq("keyword", keyword.upper())
        .eq("active", True)
        .execute()
    )

    if response.data:
        return response.data[0]

    return None