from app.services.automation_service import get_automation_by_keyword
from app.services.instagram_service import send_dm
from app.services.lead_service import create_lead
from app.utils.helper import DEMO_USER_ID


def process_comment(username: str, comment_text: str):

    automation = get_automation_by_keyword(comment_text)

    if not automation:

        print("No automation found.")
        return

    dm_message = automation["dm_message"]
    link = automation["link"]

    final_message = f"{dm_message}\n\n{link}"

    send_dm(username, final_message)

    create_lead(
        user_id=DEMO_USER_ID,
        username=username,
        keyword=comment_text
    )