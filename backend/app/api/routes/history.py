from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from app.api.deps import get_current_user
from app.database.db import get_session
from app.models.user import User
from app.schemas.history_schema import HistoryItem, RenameRequest
from app.services.history_service import (
    RenameResult,
    get_history,
    delete_transformation,
    rename_transformation,
)

router = APIRouter(prefix="/history", tags=["history"])


@router.get("/", response_model=List[HistoryItem])
def get_history_route(
    style: Optional[str] = Query(default=None),
    room: Optional[str] = Query(default=None),
    sort: str = Query(default="newest", pattern="^(newest|oldest)$"),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
) -> List[HistoryItem]:
    return get_history(
        db,
        user_id=user.user_id,
        style=style,
        room=room,
        sort=sort,
        limit=limit,
        offset=offset,
    )


@router.delete("/{file_key}")
def delete_history_item(
    file_key: str,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Delete a transformation record and its associated files."""
    success = delete_transformation(db, file_key, user_id=user.user_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Transformation '{file_key}' not found")
    return {"message": f"Transformation '{file_key}' deleted successfully"}


@router.put("/rename")
def rename_history_item(
    request: RenameRequest,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Rename a transformation record and its associated files."""
    result = rename_transformation(
        db, request.old_file_key, request.new_file_key, user_id=user.user_id
    )
    if result == RenameResult.INVALID_NAME:
        raise HTTPException(
            status_code=422,
            detail="Names may only contain letters, numbers, hyphens, and underscores",
        )
    if result == RenameResult.NOT_FOUND:
        raise HTTPException(
            status_code=404,
            detail=f"Transformation '{request.old_file_key}' not found",
        )
    if result == RenameResult.NAME_TAKEN:
        raise HTTPException(
            status_code=409,
            detail=f"A transformation named '{request.new_file_key}' already exists",
        )
    if result != RenameResult.OK:
        raise HTTPException(status_code=500, detail="Rename failed")
    return {
        "message": f"Transformation renamed from '{request.old_file_key}' to '{request.new_file_key}'",
        "new_file_key": request.new_file_key,
    }
