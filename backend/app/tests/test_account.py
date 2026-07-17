from app.services.account_service import account_service

account = account_service.get_account_by_instagram_id(
    instagram_account_id="17841470222526799"
)

if account:
    print(account)
else:
    print("No account found.")