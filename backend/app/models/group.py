from typing import TYPE_CHECKING, List, Optional
from uuid import UUID, uuid4
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.transformation import Transformation


class Group(SQLModel, table=True):
    __tablename__ = "groups"

    group_id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    project_id: UUID = Field(foreign_key="project.project_id", index=True)
    group_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    project: Optional["Project"] = Relationship(back_populates="groups")
    transformations: List["Transformation"] = Relationship(back_populates="group")
