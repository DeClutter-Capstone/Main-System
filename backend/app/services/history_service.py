from __future__ import annotations

import re
from enum import Enum
from typing import List, Optional
from datetime import datetime
from pathlib import Path
from sqlalchemy import asc, desc, func
from sqlmodel import Session, select

from app.models import Transformation
from app.schemas.history_schema import HistoryItem

STORAGE_DIR = Path(__file__).parent.parent.parent / "storage"
OUTPUT_DIR = STORAGE_DIR / "output"
INPUT_DIR = STORAGE_DIR / "input"

# file_keys become filenames on disk, so only allow safe characters (this also
# blocks path traversal like "../x"). Matches the frontend's sanitizeFilename.
FILE_KEY_RE = re.compile(r"^[A-Za-z0-9_-]{1,100}$")


class RenameResult(str, Enum):
    OK = "ok"
    NOT_FOUND = "not_found"
    NAME_TAKEN = "name_taken"
    INVALID_NAME = "invalid_name"
    ERROR = "error"


def _owned_by(t: Transformation, user_id: Optional[int]) -> bool:
    # Legacy rows with no user_id stay accessible; otherwise enforce ownership
    # (same rule as the /generations routes).
    return t.user_id is None or t.user_id == user_id


def get_history(
    db: Session,
    *,
    user_id: Optional[int] = None,
    style: Optional[str] = None,
    room: Optional[str] = None,
    sort: str = "newest",
    limit: int = 50,
    offset: int = 0,
) -> List[HistoryItem]:
    """Return formatted Transformation rows for the history page."""

    stmt = select(Transformation)

    # Only the caller's generations (legacy rows without an owner stay visible).
    stmt = stmt.where(
        (Transformation.user_id == user_id) | (Transformation.user_id == None)  # noqa: E711
    )

    # Stored values are verbatim user input ("Living Room", "Modern") while the
    # frontend sends normalized slugs ("living_room", "modern"), so compare
    # case-insensitively with "_" and " " treated as equivalent.
    def _norm(value: str) -> str:
        return value.replace("_", " ").lower()

    if style and style.lower() not in {"all", "all styles"}:
        stmt = stmt.where(
            func.lower(func.replace(Transformation.style_name, "_", " ")) == _norm(style)
        )

    if room and room.lower() not in {"all", "all rooms"}:
        stmt = stmt.where(
            func.lower(func.replace(Transformation.room_type, "_", " ")) == _norm(room)
        )

    if sort == "oldest":
        stmt = stmt.order_by(asc(Transformation.created_at))
    else:
        stmt = stmt.order_by(desc(Transformation.created_at))

    stmt = stmt.offset(offset).limit(limit)
    transformations = list(db.exec(stmt).all())

    # Convert to HistoryItem schema
    return [
        HistoryItem(
            id=str(t.transformation_id),
            image=f"/storage/output/{t.file_key}.png",
            title=t.file_key,  # "industrial_bedroom_00001"
            date=t.created_at.strftime("%d %b %Y %I:%M %p") if t.created_at else "",
            style=t.style_name.replace("_", " ").title(),  # "industrial" -> "Industrial"
            room=t.room_type.replace("_", " ").title(),  # "living_room" -> "Living Room"
            created_at=t.created_at,
            project_id=str(t.project_id) if t.project_id else None,
        )
        for t in transformations
    ]


def delete_transformation(
    db: Session, file_key: str, *, user_id: Optional[int] = None
) -> bool:
    """Delete a transformation record and its associated files from storage."""

    # Find transformation by file_key
    stmt = select(Transformation).where(Transformation.file_key == file_key)
    transformation = db.exec(stmt).first()

    if not transformation or not _owned_by(transformation, user_id):
        return False
    
    # Delete files from storage
    output_file = OUTPUT_DIR / f"{file_key}.png"
    input_file = INPUT_DIR / f"{file_key}.png"
    
    if output_file.exists():
        output_file.unlink()  # Delete output image
    
    if input_file.exists():
        input_file.unlink()  # Delete input image
    
    # Delete database record
    db.delete(transformation)
    db.commit()
    
    return True


def rename_transformation(
    db: Session,
    old_file_key: str,
    new_file_key: str,
    *,
    user_id: Optional[int] = None,
) -> RenameResult:
    """Rename a transformation record and its associated files."""

    # The new key becomes a filename — reject anything unsafe.
    if not FILE_KEY_RE.fullmatch(new_file_key):
        return RenameResult.INVALID_NAME

    # Check if old transformation exists and belongs to the caller
    stmt = select(Transformation).where(Transformation.file_key == old_file_key)
    transformation = db.exec(stmt).first()

    if not transformation or not _owned_by(transformation, user_id):
        return RenameResult.NOT_FOUND

    # Check if new name already exists
    stmt_check = select(Transformation).where(Transformation.file_key == new_file_key)
    if db.exec(stmt_check).first():
        return RenameResult.NAME_TAKEN

    # Rename files in storage
    old_output_file = OUTPUT_DIR / f"{old_file_key}.png"
    new_output_file = OUTPUT_DIR / f"{new_file_key}.png"
    
    old_input_file = INPUT_DIR / f"{old_file_key}.png"
    new_input_file = INPUT_DIR / f"{new_file_key}.png"
    
    try:
        # Rename output file if it exists
        if old_output_file.exists():
            old_output_file.rename(new_output_file)
        
        # Rename input file if it exists
        if old_input_file.exists():
            old_input_file.rename(new_input_file)
        
        # Update database record
        transformation.file_key = new_file_key
        db.add(transformation)
        db.commit()

        return RenameResult.OK
    except Exception as e:
        print(f"Error renaming transformation: {e}")
        db.rollback()
        return RenameResult.ERROR