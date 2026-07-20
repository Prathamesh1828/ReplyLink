from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class BuilderStateSchema(BaseModel):
    automationName: str
    postSelection: str
    keywordType: str
    keywords: List[str]
    publicReplyEnabled: bool
    publicReplies: List[str]
    openingMessageEnabled: bool
    openingMessage: str
    buttonLabel: str
    askToFollowEnabled: bool
    askToFollowMessage: str
    profileButtonLabel: str
    imFollowingButtonLabel: str
    finalMessage: str
    finalLink: str
    finalLinkLabel: str
    uploadedImage: Optional[str] = None
    reactToStoryReply: Optional[bool] = False
    activeStep: Optional[int] = 1
    replyRatio: Optional[int] = 100
    selectedPostIds: Optional[List[str]] = None

class AutomationCreate(BaseModel):
    name: str
    automation_type: str = "auto_dm_comments"
    status: str = "Draft"
    config: BuilderStateSchema
    active: bool = True

class AutomationUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    config: Optional[BuilderStateSchema] = None
    active: Optional[bool] = None

class AutomationResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    name: Optional[str] = None
    automation_type: str
    status: Optional[str] = None
    config: Optional[dict] = None
    active: Optional[bool] = None
    runs_count: Optional[int] = 0
    clicks_count: Optional[int] = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_run_at: Optional[datetime] = None

    class Config:
        from_attributes = True
