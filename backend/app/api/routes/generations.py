from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.api.deps import get_current_user
from app.database.db import get_session
from app.models.group import Group
from app.models.project import Project
from app.models.transformation import Transformation
from app.models.user import User
from app.schemas.projects_schema import (
    AssignGenerationRequest,
    GenerationResponse,
    GenerationUpdate,
)


router = APIRouter(prefix="/generations", tags=["generations"])

STORAGE_DIR = Path(__file__).parent.parent.parent.parent / "storage"
INPUT_DIR = STORAGE_DIR / "input"
OUTPUT_DIR = STORAGE_DIR / "output"


def _serialize(t: Transformation) -> GenerationResponse:
    return GenerationResponse(
        transformation_id=t.transformation_id,
        project_id=t.project_id,
        group_id=t.group_id,
        room_type=t.room_type,
        style_name=t.style_name,
        display_name=t.display_name,
        file_key=t.file_key,
        prompt=t.prompt,
        output_image_path=t.output_image_path
            or (f"/storage/output/{t.file_key}.png" if t.file_key else None),
        input_image_path=t.input_image_path
            or (f"/storage/input/{t.file_key}.png" if t.file_key else None),
        created_at=t.created_at,
    )


@router.put("/{generation_id}", response_model=GenerationResponse)
def update_generation(
    generation_id: UUID,
    payload: GenerationUpdate,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Update mutable fields on a generation (currently the display name)."""
    gen = db.get(Transformation, generation_id)
    if not gen or (gen.user_id and gen.user_id != user.user_id):
        raise HTTPException(status_code=404, detail="Generation not found")

    if "display_name" in payload.model_fields_set:
        if payload.display_name is None:
            gen.display_name = None
        else:
            trimmed = payload.display_name.strip()
            gen.display_name = trimmed or None

    db.add(gen)
    db.commit()
    db.refresh(gen)
    return _serialize(gen)


@router.put("/{generation_id}/assign", response_model=GenerationResponse)
def assign_generation(
    generation_id: UUID,
    payload: AssignGenerationRequest,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Assign a generation to a project (and optionally a group)."""
    gen = db.get(Transformation, generation_id)
    if not gen or (gen.user_id and gen.user_id != user.user_id):
        raise HTTPException(status_code=404, detail="Generation not found")

    if payload.project_id is not None:
        project = db.get(Project, payload.project_id)
        if not project or project.user_id != user.user_id:
            raise HTTPException(status_code=404, detail="Project not found")
        gen.project_id = payload.project_id
    else:
        # Explicit None → detach from any project (and clear group, since groups
        # belong to projects).
        gen.project_id = None
        gen.group_id = None

    if payload.group_id is not None:
        group = db.get(Group, payload.group_id)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        # Group must belong to the same project we're assigning to.
        if gen.project_id and group.project_id != gen.project_id:
            raise HTTPException(
                status_code=400,
                detail="Group does not belong to the target project",
            )
        gen.group_id = payload.group_id
    elif payload.project_id is not None and "group_id" in payload.model_fields_set:
        # Caller explicitly passed group_id=None — clear it.
        gen.group_id = None

    db.add(gen)
    db.commit()
    db.refresh(gen)
    return _serialize(gen)


@router.delete("/{generation_id}", status_code=200)
def delete_generation(
    generation_id: UUID,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Delete a generation and its on-disk files."""
    gen = db.get(Transformation, generation_id)
    if not gen or (gen.user_id and gen.user_id != user.user_id):
        raise HTTPException(status_code=404, detail="Generation not found")

    # Remove files if we know the file_key
    if gen.file_key:
        for path in (INPUT_DIR / f"{gen.file_key}.png", OUTPUT_DIR / f"{gen.file_key}.png"):
            try:
                if path.exists():
                    path.unlink()
            except Exception as exc:
                print(f"[delete_generation] failed to unlink {path}: {exc}")

    db.delete(gen)
    db.commit()
    return {"deleted": True}
