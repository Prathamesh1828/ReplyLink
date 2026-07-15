from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class KnowledgeCreate(BaseModel):
    question: str = Field(..., min_length=5, max_length=500)
    aliases: list[str] = Field(default_factory=list)
    answer: str = Field(..., min_length=2)


class KnowledgeUpdate(BaseModel):
    question: Optional[str] = Field(
        default=None,
        min_length=5,
        max_length=500
    )
    aliases: Optional[list[str]] = None
    answer: Optional[str] = Field(
        default=None,
        min_length=2
    )


class KnowledgeResponse(BaseModel):
    id: str
    question: str
    aliases: list[str]
    answer: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class KnowledgeListResponse(BaseModel):
    items: list[KnowledgeResponse]
    total: int
    page: int
    page_size: int