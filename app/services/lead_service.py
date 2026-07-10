from app.services.supabase_service import supabase


def lead_exists(user_id: str, username: str, keyword: str):

    response = (
        supabase.table("leads")
        .select("*")
        .eq("user_id", user_id)
        .eq("username", username)
        .eq("keyword", keyword.upper())
        .execute()
    )

    return len(response.data) > 0


def create_lead(user_id: str, username: str, keyword: str):

    if lead_exists(user_id, username, keyword):
        print(f"Lead already exists for {username} ({keyword})")
        return

    data = {
        "user_id": user_id,
        "username": username,
        "keyword": keyword.upper(),
        "status": "NEW",
        "lead_score": 0
    }

    supabase.table("leads").insert(data).execute()

    print(f"Lead created for {username} ({keyword})")