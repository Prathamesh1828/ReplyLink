from app.repositories.knowledge_repository import KnowledgeRepository
from app.services.embedding_service import generate_embedding


def get_all_knowledge(user_id: str):
    """
    Returns all knowledge entries for a specific business.
    """
    return KnowledgeRepository.get_all_by_user(user_id)


def get_knowledge_by_id(knowledge_id: str):
    """
    Returns a single knowledge entry.
    """
    return KnowledgeRepository.get_by_id(knowledge_id)


def find_exact_answer(
    user_id: str,
    question: str
):
    """
    Finds an exact FAQ for a specific business.
    """
    return KnowledgeRepository.find_exact_answer(
        user_id,
        question
    )


def create_knowledge(
    user_id: str,
    question: str,
    aliases: list[str],
    answer: str
):
    """
    Creates a new knowledge entry.

    Automatically generates the embedding.
    """

    text_to_embed = " ".join(
        [question] + aliases + [answer]
    )

    embedding = generate_embedding(text_to_embed)

    data = {
        "user_id": user_id,
        "question": question,
        "aliases": aliases,
        "answer": answer,
        "embedding": embedding
    }

    return KnowledgeRepository.create(data)


def update_knowledge(
    knowledge_id: str,
    question: str,
    aliases: list[str],
    answer: str
):
    """
    Updates a knowledge entry.

    Automatically regenerates the embedding.
    """

    text_to_embed = " ".join(
        [question] + aliases + [answer]
    )

    embedding = generate_embedding(text_to_embed)

    data = {
        "question": question,
        "aliases": aliases,
        "answer": answer,
        "embedding": embedding
    }

    return KnowledgeRepository.update(
        knowledge_id,
        data
    )


def delete_knowledge(
    knowledge_id: str
):
    """
    Deletes a knowledge entry.
    """

    return KnowledgeRepository.delete(
        knowledge_id
    )


def update_embedding(
    knowledge_id: str,
    embedding: list[float]
):
    """
    Updates only the embedding.

    Useful for background re-indexing jobs.
    """

    return KnowledgeRepository.update(
        knowledge_id,
        {
            "embedding": embedding
        }
    )


def search_relevant_knowledge(
    user_id: str,
    user_message: str,
    limit: int = 5
):
    """
    Performs semantic vector search
    scoped to a single business.
    """

    query_embedding = generate_embedding(
        user_message,
        is_query=True
    )

    return KnowledgeRepository.semantic_search(
        user_id=user_id,
        query_embedding=query_embedding,
        limit=limit
    )