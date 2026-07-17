from app.services.account_service import account_service

def send_dm(instagram_user: str, message: str, instagram_business_id: str = None):
    """
    Send a plain text DM.
    """
    if instagram_business_id:
        token = account_service.get_page_access_token(instagram_business_id)
        if token:
            print(f"[Graph API] Using dynamic token ending in ...{token[-5:]} for account {instagram_business_id}")
        else:
            print(f"[Graph API Error] No active token found for {instagram_business_id}")

    print("\n========== DM SENT ==========")
    print(f"User: {instagram_user}")
    print(f"Message:\n{message}")
    print("=============================\n")


def send_button_message(
    instagram_user: str,
    message: str,
    buttons: list[str]
):
    """
    Send a DM containing CTA buttons.
    """

    print("\n========== BUTTON MESSAGE ==========")
    print(f"User: {instagram_user}")
    print(f"Message:\n{message}")

    print("\nButtons:")

    for button in buttons:
        print(f"• {button}")

    print("====================================\n")


def send_access_message(instagram_user: str):
    """
    First message after user comments.
    """

    send_button_message(
        instagram_user=instagram_user,
        message=(
            "👋 Hey! Thanks for commenting.\n\n"
            "Tap below and I'll send your access."
        ),
        buttons=[
            "Send me the access"
        ]
    )


def send_follow_message(instagram_user: str):
    """
    Ask the user to follow the page before
    sending the requested resource.
    """

    send_button_message(
        instagram_user=instagram_user,
        message=(
            "😊 Awesome!\n\n"
            "Before I send your access, "
            "please follow our Instagram page."
        ),
        buttons=[
            "I'm Following ✅",
            "Visit Profile"
        ]
    )


def send_success_message(
    instagram_user: str,
    dm_message: str,
    link: str
):
    """
    Send the final success message
    containing the requested resource.
    """

    final_message = f"{dm_message}\n\n{link}"

    send_dm(
        instagram_user,
        final_message
    )


def send_error_message(instagram_user: str):
    """
    Generic fallback message.
    """

    send_dm(
        instagram_user,
        "Something went wrong. Please try again later."
    )