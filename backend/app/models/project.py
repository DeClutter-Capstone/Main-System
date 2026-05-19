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

    # When set, points at one of this project's transformations and overrides
    # the default "latest generation" thumbnail behavior. Cleared by the DB
    # (ON DELETE SET NULL) if the referenced transformation is removed.
    thumbnail_transformation_id: Optional[UUID] = Field(
        default=None,
        foreign_key="transformation.transformation_id",
    )

    input_images: List["InputImage"] = Relationship(back_populates="project")
    # Disambiguate: Project ↔ Transformation has TWO FK paths now
    # (Transformation.project_id and Project.thumbnail_transformation_id).
    # Pin this relationship to the "owning" FK on Transformation.
    transformations: List["Transformation"] = Relationship(
        back_populates="project",
        sa_relationship_kwargs={"foreign_keys": "[Transformation.project_id]"},
    )
    groups: List["Group"] = Relationship(back_populates="project")
