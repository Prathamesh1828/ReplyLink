from app.services.supabase_service import supabase


def get_account_by_instagram_id(
    instagram_account_id: str
):
    """
    Returns the connected account
    for an Instagram Business Account.
    """

    response = (
        supabase
        .table("connected_accounts")
        .select("*")
        .eq(
            "instagram_account_id",
            instagram_account_id
        )
        .eq("active", True)
        .limit(1)
        .execute()
    )

    if response.data:
        return response.data[0]

    return None


def get_account_by_page_id(
    facebook_page_id: str
):
    """
    Returns the connected account
    for a Facebook Page.
    """

    response = (
        supabase
        .table("connected_accounts")
        .select("*")
        .eq(
            "facebook_page_id",
            facebook_page_id
        )
        .eq("active", True)
        .limit(1)
        .execute()
    )

    if response.data:
        return response.data[0]

    return None


def get_page_access_token(
    user_id: str
):
    """
    Returns the page access token
    for a ReplyLink user.
    """

    response = (
        supabase
        .table("connected_accounts")
        .select("page_access_token")
        .eq("user_id", user_id)
        .eq("active", True)
        .limit(1)
        .execute()
    )

    if response.data:
        return response.data[0][
            "page_access_token"
        ]

    return None