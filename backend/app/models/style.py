from typing import Optional 
from uuid import UUID , uuid4 
from datetime import datetime 
from sqlmodel import Field, SQLModel, Relationship 
from enum import Enum

class StyleTypes(str, Enum):
    modern = "modern"
    minimalist = "minimalist"
    scandinavian = "scandinavian"
    industrial = "industrial"
    bohemian = "bohemian"
    rustic = "rustic"
    spa = "spa"

class Style(SQLModel, table=True):
    style_id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    style_name: StyleTypes
    style_description: Optional[str] = None