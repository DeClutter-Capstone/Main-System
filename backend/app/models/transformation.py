from typing import Optional 
from uuid import UUID , uuid4 
from datetime import datetime 
from sqlmodel import Field, SQLModel, Relationship 
from enum import Enum 

class RoomType(str,Enum):
    kitchen = "kitchen"
    bedroom = "bedroom"
    bathroom = "bathroom"
    living_room = "living_room"
    spa = "spa"

class StyleType(str, Enum):
    modern = "modern"
    minimalist = "minimalist"
    scandinavian = "scandinavian"
    industrial = "industrial"
    bohemian = "bohemian"
    rustic = "rustic"
    spa = "spa"
    

class Transformation(SQLModel, table=True):
    transformation_id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    room_type: RoomType
    style_name: StyleType
    input_image_id: Optional[UUID] = Field(default=None, foreign_key="inputimage.input_image_id")
    project_id: Optional[UUID] = Field(default=None, foreign_key="project.project_id")
    prompt: Optional[str] = None
    
    # Relationships
    input_image: "InputImage" = Relationship(back_populates="transformations")
    project: "Project" = Relationship(back_populates="transformations")
    generated_images: list["GeneratedImage"] = Relationship(back_populates="transformation")

