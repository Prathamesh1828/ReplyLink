from app.services.prompt_service import build_prompt

knowledge = """
Pricing:
Plans start at ₹999/month.
"""

prompt = build_prompt(
    user_message="How much does it cost?",
    knowledge=knowledge
)

print(prompt)