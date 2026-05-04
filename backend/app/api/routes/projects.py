from fastapi import APIRouter, Depends
from sqlmodel import Session
from uuid import uuid4
from datetime import datetime
from app.database.db import get_session
from app.schemas.projects_schema import ProjectCreate, ProjectResponse
from app.services.project_service import create_project
router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("/", response_model=ProjectResponse)
def create_project_route(
    project: ProjectCreate, db: Session = Depends(get_session)
):
    # TODO: Get user_id from Firebase token
    user_id = 1
    new_project = create_project(db=db, user_id=user_id, project_data=project)
    return new_project
