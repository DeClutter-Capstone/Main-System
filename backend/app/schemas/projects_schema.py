from pydantic import BaseModel
from uuid import UUID 
from datetime import datetime


class ProjectCreate(BaseModel): 
    project_name: str 
    project_description: str

class ProjectResponse(BaseModel):
    project_id: UUID
    user_id: int
    project_name: str
    project_description: str
    project_creation_time: datetime
    project_last_updated: datetime
    
    class Config:
        from_attributes = True
