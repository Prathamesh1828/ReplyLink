from app.services.account_service import (
    get_account_by_instagram_id,
)

account = get_account_by_instagram_id(
    "17841400000000000"
)

print(account)