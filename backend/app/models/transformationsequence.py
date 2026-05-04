from __future__ import annotations

from typing import Optional
from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4


class TransformationSequence(SQLModel, table=True):
    __tablename__ = "transformation_sequences"

    sequence_id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)

    # normalized values (e.g., "modern", "bedroom")
    style_name: str = Field(index=True)
    room_type: str = Field(index=True)

    last_number: int = Field(default=0)

    # Optional: enforce uniqueness at DB level if you later add a migration/constraint
    # (SQLModel doesn't add composite unique constraints easily without Alembic)