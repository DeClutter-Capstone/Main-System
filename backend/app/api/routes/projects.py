from fastapi import APIRouter, Depends
from sqlmodel import Session
from uuid import uuid4
from datetime import datetime
from app.database.session import get_session
from app.schemas.projects_schema import ProjectCreate, ProjectResponse

router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("/", response_model=ProjectResponse)
def create_project_route(
    project: ProjectCreate, db: Session = Depends(get_session)
):
    # TODO: Get user_id from Firebase token
    user_id = 1
    # TODO: Implement create_project service
    return {
        "project_id": uuid4(),
        "user_id": user_id,
        "project_name": project.project_name,
        "project_description": project.project_description,
        "project_creation_time": datetime.now(),
        "project_last_updated": datetime.now()
    }
