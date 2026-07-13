from app.services.prompt_service import build_prompt
from app.services.ai_service import generate_ai_response

knowledge = """
Pricing:
Plans start at ₹999/month.
"""

prompt = build_prompt(
    user_message="How much does it cost?",
    knowledge=knowledge
)

response = generate_ai_response(prompt)

print("\n========== AI RESPONSE ==========\n")
print(response)