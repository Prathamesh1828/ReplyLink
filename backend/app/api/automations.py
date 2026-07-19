from fastapi import APIRouter, HTTPException, Header, Depends
from typing import List, Optional
from app.schemas.automation import AutomationCreate, AutomationUpdate, AutomationResponse
from app.repositories.automation_repository import AutomationRepository

from app.core.dependencies import get_current_user

from fastapi import APIRouter, HTTPException, Header, Depends, UploadFile, File
import shutil
import uuid
import os

router = APIRouter(prefix="/api/automations", tags=["Automations"])

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    ext = file.filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    os.makedirs("app/uploads", exist_ok=True)
    path = f"app/uploads/{filename}"
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    backend_url = os.getenv("BACKEND_URL", "http://localhost:8000").rstrip("/")
    return {"url": f"{backend_url}/uploads/{filename}"}

async def get_user_id(x_user_id: Optional[str] = Header(None)):
    # Fallback to the user's REAL authenticated UUID for testing
    return x_user_id or "7dc543e2-2801-49ec-8d10-c6fc07b557d2"

@router.post("/", response_model=AutomationResponse)
async def create_automation(automation: AutomationCreate, x_user_id: Optional[str] = Header(None)):
    user_id = await get_user_id(x_user_id)
    result = AutomationRepository.create_automation(user_id, automation)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create automation")
    return result

@router.get("/", response_model=List[AutomationResponse])
async def get_automations(x_user_id: Optional[str] = Header(None)):
    user_id = await get_user_id(x_user_id)
    return AutomationRepository.get_automations_by_user(user_id)

@router.get("/{automation_id}", response_model=AutomationResponse)
async def get_automation(automation_id: str):
    result = AutomationRepository.get_automation_by_id(automation_id)
    if not result:
        raise HTTPException(status_code=404, detail="Automation not found")
    return result

@router.put("/{automation_id}", response_model=AutomationResponse)
async def update_automation(automation_id: str, automation: AutomationUpdate):
    result = AutomationRepository.update_automation(automation_id, automation)
    if not result:
        raise HTTPException(status_code=404, detail="Automation not found or failed to update")
    return result

@router.delete("/{automation_id}")
async def delete_automation(automation_id: str):
    try:
        success = AutomationRepository.delete_automation(automation_id)
        if not success:
            raise HTTPException(status_code=404, detail="Automation not found")
        return {"status": "success"}
    except Exception as e:
        # Catch invalid UUID errors or Supabase errors
        raise HTTPException(status_code=400, detail=str(e))
