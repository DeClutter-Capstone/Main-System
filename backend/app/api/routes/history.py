from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from app.database.db import get_session
from app.schemas.history_schema import HistoryItem, RenameRequest
from app.services.history_service import get_history, delete_transformation, rename_transformation

router = APIRouter(prefix="/history", tags=["history"])


@router.get("/", response_model=List[HistoryItem])
def get_history_route(
    style: Optional[str] = Query(default=None),
    room: Optional[str] = Query(default=None),
    sort: str = Query(default="newest", pattern="^(newest|oldest)$"),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_session),
) -> List[HistoryItem]:
    return get_history(
        db, style=style, room=room, sort=sort, limit=limit, offset=offset
    )


@router.delete("/{file_key}")
def delete_history_item(
    file_key: str,
    db: Session = Depends(get_session),
):
    """Delete a transformation record and its associated files."""
    success = delete_transformation(db, file_key)
    if not success:
        raise HTTPException(status_code=404, detail=f"Transformation '{file_key}' not found")
    return {"message": f"Transformation '{file_key}' deleted successfully"}


@router.put("/rename")
def rename_history_item(
    request: RenameRequest,
    db: Session = Depends(get_session),
):
    """Rename a transformation record and its associated files."""
    success = rename_transformation(db, request.old_file_key, request.new_file_key)
    if not success:
        raise HTTPException(
            status_code=404, 
            detail=f"Transformation '{request.old_file_key}' not found or new name already exists"
        )
    return {
        "message": f"Transformation renamed from '{request.old_file_key}' to '{request.new_file_key}'",
        "new_file_key": request.new_file_key,
    }