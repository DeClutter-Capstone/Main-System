from typing import Optional 
from uuid import UUID , uuid4 
from datetime import datetime 
from sqlmodel import Field, SQLModel, Relationship 

class Style(SQLModel, table=True):
    style_id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    style_name : str
    style_description: str
    
    # Relationships
    transformations: list["Transformation"] = Relationship(back_populates="style")
    generated_images: list["GeneratedImage"] = Relationship(back_populates="style")