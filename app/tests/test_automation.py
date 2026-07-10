from app.services.automation_service import get_automation_by_keyword


automation = get_automation_by_keyword("PRICE")

print(automation)