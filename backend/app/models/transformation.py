from typing import Optional, TYPE_CHECKING, List
from uuid import UUID, uuid4
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import Column, Enum as SAEnum
from enum import Enum

if TYPE_CHECKING:
    from app.models.input_image import InputImage
    from app.models.project import Project
    from app.models.transformed_image import GeneratedImage

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
    room_type: RoomType = Field(sa_column=Column(SAEnum(RoomType, name="room_type_enum")))
    style_name: StyleType = Field(sa_column=Column(SAEnum(StyleType, name="style_type_enum")))
    input_image_id: Optional[UUID] = Field(default=None, foreign_key="inputimage.input_image_id")
    project_id: Optional[UUID] = Field(default=None, foreign_key="project.project_id")
    prompt: Optional[str] = None

    # New fields for history + storage mapping
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    file_key: Optional[str] = Field(default=None, index=True)

    # Relationships
    input_image: Optional["InputImage"] = Relationship(back_populates="transformations")
    project: Optional["Project"] = Relationship(back_populates="transformations")
    generated_images: List["GeneratedImage"] = Relationship(back_populates="transformation")

