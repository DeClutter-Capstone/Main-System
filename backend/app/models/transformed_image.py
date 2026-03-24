from typing import Optional 
from uuid import UUID , uuid4 
from datetime import datetime 
from sqlmodel import Field, SQLModel, Relationship 

class GeneratedImage(SQLModel, table=True):
    generated_image_id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    transformation_id: UUID = Field(foreign_key="transformation.transformation_id")
    user_id: int = Field(foreign_key="user.user_id")
    input_image_id: UUID = Field(foreign_key="inputimage.input_image_id")
    file_path: str
    generated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    transformation: "Transformation" = Relationship(back_populates="generated_images")
    user: "User" = Relationship(back_populates="generated_images")
    input_image: "InputImage" = Relationship(back_populates="generated_images")
