from typing import Optional, TYPE_CHECKING, List
from uuid import UUID , uuid4 
from datetime import datetime 
from sqlmodel import Field, SQLModel, Relationship 

if TYPE_CHECKING:
    from app.models.input_image import InputImage
    from app.models.transformation import Transformation

class Project(SQLModel, table=True):
    project_id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    project_name: str 
    project_description: str 
    project_creation_time : datetime = Field(default_factory=datetime.now)
    project_last_updated : datetime = Field(default_factory=datetime.now)
    
    # Relationships
    input_images: List["InputImage"] = Relationship(back_populates="project")
    transformations: List["Transformation"] = Relationship(back_populates="project")
