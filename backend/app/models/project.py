from typing import Optional 
from uuid import UUID , uuid4 
from datetime import datetime 
from sqlmodel import Field, SQLModel, Relationship 

class Project(SQLModel, table=True):
    project_id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    user_id: int = Field(foreign_key="user.user_id")
    project_name: str 
    project_description: str 
    project_creation_time : datetime = Field(default_factory=datetime.now)
    project_last_updated : datetime = Field(default_factory=datetime.now)
    no_of_transformations : int
    # Relationships
    user: "User" = Relationship(back_populates="projects")
    input_images: list["InputImage"] = Relationship(back_populates="project")
    transformations: list["Transformation"] = Relationship(back_populates="project")
