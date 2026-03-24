from typing import Optional, List
from uuid import UUID , uuid4 
from datetime import datetime 
from sqlmodel import Field, SQLModel, Relationship 

class InputImage(SQLModel, table=True):
    input_image_id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    project_id: UUID = Field(foreign_key="project.project_id")
    user_id: int = Field(foreign_key="user.user_id")
    file_path: str
    uploaded_at: datetime = Field(default_factory=datetime.now)
    resolution_width: int
    resolution_height: int
    
    # Relationships
    project: "Project" = Relationship(back_populates="input_images")
    user: "User" = Relationship(back_populates="input_images")
    transformations: list["Transformation"] = Relationship(back_populates="input_image")
    generated_images: List["GeneratedImage"] = Relationship(back_populates="input_image")
