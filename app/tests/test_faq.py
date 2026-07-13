from app.services.faq_service import (
    generate_faq_response,
)

from app.utils.helper import (
    DEMO_USER_ID,
)

questions = [

    "How much does ReplyLink cost?",

    "Can I try ReplyLink before paying?",

    "How do I contact support?",

    "Does ReplyLink work with Instagram?",

    "Do you offer refunds?",

    "Can I fly to the moon?"
]

for question in questions:

    print("\n" + "=" * 70)

    print("USER:")
    print(question)

    print("\nAI:")

    print(
        generate_faq_response(
            DEMO_USER_ID,
            question
        )
    )