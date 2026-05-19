from typing import TYPE_CHECKING, List, Optional
from uuid import UUID, uuid4
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.input_image import InputImage
    from app.models.transformation import Transformation
    from app.models.group import Group


class Project(SQLModel, table=True):
    project_id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.user_id", index=True)
    project_name: str
    project_description: Optional[str] = Field(default=None)
    project_creation_time: datetime = Field(default_factory=datetime.utcnow)
    project_last_updated: datetime = Field(default_factory=datetime.utcnow)

    # Path to a user-uploaded thumbnail (relative, e.g. /storage/thumbnails/...).
    # When null, the UI falls back to the latest generation's output image.
    thumbnail_image_path: Optional[str] = Field(default=None)

    input_images: List["InputImage"] = Relationship(back_populates="project")
    transformations: List["Transformation"] = Relationship(back_populates="project")
    groups: List["Group"] = Relationship(back_populates="project")
