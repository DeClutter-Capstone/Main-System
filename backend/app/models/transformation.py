from typing import Optional, TYPE_CHECKING, List
from uuid import UUID, uuid4
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.input_image import InputImage
    from app.models.project import Project
    from app.models.transformed_image import GeneratedImage
    from app.models.group import Group


class Transformation(SQLModel, table=True):
    transformation_id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)

    # Free-form strings — supports preset rooms AND user-entered values like
    # "studio apartment" or "hotel lobby" when the user picks "Other".
    room_type: str
    style_name: str

    # User-chosen label for the generation (e.g. "Bedroom — calm option").
    # Null falls back to the style name in the UI.
    display_name: Optional[str] = Field(default=None)

    input_image_id: Optional[UUID] = Field(default=None, foreign_key="inputimage.input_image_id")
    project_id: Optional[UUID] = Field(default=None, foreign_key="project.project_id", index=True)
    group_id: Optional[UUID] = Field(default=None, foreign_key="groups.group_id", index=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.user_id", index=True)

    prompt: Optional[str] = None

    input_image_path: Optional[str] = Field(default=None)
    output_image_path: Optional[str] = Field(default=None)

    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    file_key: Optional[str] = Field(default=None, index=True)

    input_image: Optional["InputImage"] = Relationship(back_populates="transformations")
    project: Optional["Project"] = Relationship(back_populates="transformations")
    group: Optional["Group"] = Relationship(back_populates="transformations")
    generated_images: List["GeneratedImage"] = Relationship(back_populates="transformation")
