from sqlmodel import Session 
from app.models.project import Project
from app.schemas.projects_schema import ProjectCreate
from datetime import datetime

def create_project(db:Session , user_id: int , project_data: ProjectCreate): 
    new_project = Project(
        project_name=project_data.project_name,
        project_description=project_data.project_description,
        project_last_updated=datetime.now()
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project