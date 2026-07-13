from app.services.knowledge_service import (
    search_relevant_knowledge,
)

from app.services.prompt_service import (
    build_prompt,
)

from app.services.ai_service import (
    generate_ai_response,
)


SIMILARITY_THRESHOLD = 0.65


def generate_faq_response(
    user_id: str,
    user_message: str
):
    """
    Complete AI FAQ pipeline.
    """

    knowledge = search_relevant_knowledge(
        user_id=user_id,
        user_message=user_message,
        limit=5
    )

    if not knowledge:

        return (
            "I'm sorry, I couldn't find "
            "any relevant information."
        )

    best_match = knowledge[0]

    if (
        best_match["similarity"]
        < SIMILARITY_THRESHOLD
    ):

        return (
            "I'm sorry, I don't have "
            "that information yet. "
            "Please contact our support team."
        )

    prompt = build_prompt(
        user_message=user_message,
        knowledge=knowledge
    )

    response = generate_ai_response(
        prompt
    )

    return response