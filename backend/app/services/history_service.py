from __future__ import annotations

from typing import List, Optional
from datetime import datetime
from pathlib import Path
from sqlalchemy import asc, desc
from sqlmodel import Session, select

from app.models import Transformation
from app.schemas.history_schema import HistoryItem

STORAGE_DIR = Path(__file__).parent.parent.parent / "storage"
OUTPUT_DIR = STORAGE_DIR / "output"
INPUT_DIR = STORAGE_DIR / "input"

def get_history(
    db: Session,
    *,
    style: Optional[str] = None,
    room: Optional[str] = None,
    sort: str = "newest",
    limit: int = 50,
    offset: int = 0,
) -> List[HistoryItem]:
    """Return formatted Transformation rows for the history page."""

    stmt = select(Transformation)

    if style and style.lower() not in {"all", "all styles"}:
        stmt = stmt.where(Transformation.style_name == style)

    if room and room.lower() not in {"all", "all rooms"}:
        stmt = stmt.where(Transformation.room_type == room)

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
        )
        for t in transformations
    ]


def delete_transformation(db: Session, file_key: str) -> bool:
    """Delete a transformation record and its associated files from storage."""
    
    # Find transformation by file_key
    stmt = select(Transformation).where(Transformation.file_key == file_key)
    transformation = db.exec(stmt).first()
    
    if not transformation:
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