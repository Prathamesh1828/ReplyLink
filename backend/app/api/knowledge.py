from fastapi import APIRouter, HTTPException

from app.schemas.knowledge import (
    KnowledgeCreate,
    KnowledgeUpdate,
    KnowledgeResponse,
    KnowledgeListResponse,
)
from app.services import knowledge_service

router = APIRouter(
    prefix="/knowledge",
    tags=["Knowledge Base"],
)


# ------------------------------------------------------------------
# GET ALL
# ------------------------------------------------------------------

@router.get(
    "",
    response_model=KnowledgeListResponse
)
def get_all_knowledge(user_id: str):

    knowledge = knowledge_service.get_all_knowledge(user_id)

    if knowledge is None:
        knowledge = []

    return {
        "items": knowledge,
        "total": len(knowledge),
        "page": 1,
        "page_size": len(knowledge),
    }


# ------------------------------------------------------------------
# GET BY ID
# ------------------------------------------------------------------

@router.get(
    "/{knowledge_id}",
    response_model=KnowledgeResponse
)
def get_knowledge_by_id(knowledge_id: str):

    knowledge = knowledge_service.get_knowledge_by_id(
        knowledge_id
    )

    if knowledge is None:
        raise HTTPException(
            status_code=404,
            detail="Knowledge not found"
        )

    return knowledge


# ------------------------------------------------------------------
# CREATE
# ------------------------------------------------------------------

@router.post(
    "",
    response_model=KnowledgeResponse,
    status_code=201
)
def create_knowledge(
    user_id: str,
    knowledge: KnowledgeCreate,
):

    result = knowledge_service.create_knowledge(
        user_id=user_id,
        question=knowledge.question,
        aliases=knowledge.aliases,
        answer=knowledge.answer,
    )

    if result is None:
        raise HTTPException(
            status_code=400,
            detail="Unable to create knowledge."
        )

    return result


# ------------------------------------------------------------------
# UPDATE
# ------------------------------------------------------------------

@router.put(
    "/{knowledge_id}",
    response_model=KnowledgeResponse
)
def update_knowledge(
    knowledge_id: str,
    knowledge: KnowledgeUpdate,
):

    existing = knowledge_service.get_knowledge_by_id(
        knowledge_id
    )

    if existing is None:
        raise HTTPException(
            status_code=404,
            detail="Knowledge not found"
        )

    result = knowledge_service.update_knowledge(
        knowledge_id=knowledge_id,
        question=knowledge.question or existing["question"],
        aliases=knowledge.aliases or existing["aliases"],
        answer=knowledge.answer or existing["answer"],
    )

    if result is None:
        raise HTTPException(
            status_code=400,
            detail="Unable to update knowledge."
        )

    return result


# ------------------------------------------------------------------
# DELETE
# ------------------------------------------------------------------

@router.delete(
    "/{knowledge_id}",
    status_code=200
)
def delete_knowledge(knowledge_id: str):

    deleted = knowledge_service.delete_knowledge(
        knowledge_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Knowledge not found"
        )

    return {
        "message": "Knowledge deleted successfully"
    }