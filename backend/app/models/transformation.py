from typing import Optional 
from uuid import UUID , uuid4 
from datetime import datetime 
from sqlmodel import Field, SQLModel, Relationship 

class Transformation(SQLModel, table=True):
    transformation_id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    input_image_id: UUID = Field(foreign_key="inputimage.input_image_id")
    style_id: UUID = Field(foreign_key="style.style_id")
    project_id: UUID = Field(foreign_key="project.project_id")
    prompt: str
    
    # Relationships
    input_image: "InputImage" = Relationship(back_populates="transformations")
    style: "Style" = Relationship(back_populates="transformations")
    project: "Project" = Relationship(back_populates="transformations")
    generated_images: list["GeneratedImage"] = Relationship(back_populates="transformation")

