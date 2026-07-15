from app.services.knowledge_service import (
    get_all_knowledge,
    update_embedding,
)

from app.services.embedding_service import (
    generate_embedding,
)


def index_knowledge_base(user_id: str):
    """
    Generates embeddings for a user's
    knowledge base.
    """

    knowledge_entries = get_all_knowledge(
        user_id=user_id
    )

    print(
        f"\nFound {len(knowledge_entries)} knowledge entries.\n"
    )

    for item in knowledge_entries:

        aliases = (
            item.get("aliases") or ""
        ).replace("|", "\n")

        text_to_embed = f"""
Question:
{item['question']}

Aliases:
{aliases}

Answer:
{item['answer']}
"""

        embedding = generate_embedding(
            text_to_embed
        )

        update_embedding(
            knowledge_id=item["id"],
            embedding=embedding
        )

        print(
            f"Indexed: {item['question']}"
        )

    print(
        "\nKnowledge Base indexing complete."
    )