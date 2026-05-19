from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, func
from sqlmodel import Session, select

from app.api.deps import get_current_user
from app.database.db import get_session
from app.models.group import Group
from app.models.input_image import InputImage
from app.models.project import Project
from app.models.transformation import Transformation
from app.models.user import User
from app.schemas.projects_schema import (
    AssignGenerationRequest,
    GenerationResponse,
    GroupCreate,
    GroupResponse,
    GroupUpdate,
    ProjectCreate,
    ProjectDetailResponse,
    ProjectSummary,
    ProjectUpdate,
)

router = APIRouter(prefix="/projects", tags=["projects"])


def _serialize_generation(t: Transformation) -> GenerationResponse:
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


def _output_path(t: Transformation) -> Optional[str]:
    return (
        t.output_image_path
        or (f"/storage/output/{t.file_key}.png" if t.file_key else None)
    )


def _serialize_summary(
    p: Project,
    generation_count: int,
    latest_output: Optional[str],
    shared_style: Optional[str] = None,
) -> ProjectSummary:
    return ProjectSummary(
        project_id=p.project_id,
        project_name=p.project_name,
        project_description=p.project_description,
        project_creation_time=p.project_creation_time,
        project_last_updated=p.project_last_updated,
        generation_count=generation_count,
        latest_output_image=latest_output,
        shared_style=shared_style,
        thumbnail_transformation_id=p.thumbnail_transformation_id,
    )


def _owned_project(
    project_id: UUID,
    db: Session,
    user: User,
) -> Project:
    project = db.get(Project, project_id)
    if not project or project.user_id != user.user_id:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


# ─── Projects ─────────────────────────────────────────────────────────────

@router.get("/", response_model=List[ProjectSummary])
def list_projects(
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    projects = db.exec(
        select(Project)
        .where(Project.user_id == user.user_id)
        .order_by(desc(Project.project_last_updated))
    ).all()

    summaries: List[ProjectSummary] = []
    for project in projects:
        count = db.exec(
            select(func.count()).select_from(Transformation).where(
                Transformation.project_id == project.project_id
            )
        ).one()
        # SQLModel's .exec(...).one() may return a scalar or a tuple depending
        # on driver; coerce to int defensively.
        if isinstance(count, tuple):
            count = count[0]

        # Prefer the user's chosen thumbnail; fall back to the most-recent
        # generation if no override is set (or the override has been deleted).
        thumb_path: Optional[str] = None
        if project.thumbnail_transformation_id:
            chosen = db.get(Transformation, project.thumbnail_transformation_id)
            if chosen and chosen.project_id == project.project_id:
                thumb_path = _output_path(chosen)

        if thumb_path is None:
            latest = db.exec(
                select(Transformation)
                .where(Transformation.project_id == project.project_id)
                .order_by(desc(Transformation.created_at))
                .limit(1)
            ).first()
            if latest:
                thumb_path = _output_path(latest)
        latest_path = thumb_path

        distinct_styles = db.exec(
            select(Transformation.style_name)
            .where(Transformation.project_id == project.project_id)
            .distinct()
        ).all()
        shared_style = distinct_styles[0] if len(distinct_styles) == 1 else None

        summaries.append(_serialize_summary(project, int(count), latest_path, shared_style))
    return summaries


@router.post("/", response_model=ProjectSummary)
def create_project_route(
    payload: ProjectCreate,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    project = Project(
        user_id=user.user_id,
        project_name=payload.project_name.strip(),
        project_description=(payload.project_description or "").strip() or None,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return _serialize_summary(project, generation_count=0, latest_output=None)


@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project(
    project_id: UUID,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    project = _owned_project(project_id, db, user)
    generations = db.exec(
        select(Transformation)
        .where(Transformation.project_id == project_id)
        .order_by(desc(Transformation.created_at))
    ).all()
    groups = db.exec(
        select(Group)
        .where(Group.project_id == project_id)
        .order_by(Group.created_at)
    ).all()
    return ProjectDetailResponse(
        project_id=project.project_id,
        project_name=project.project_name,
        project_description=project.project_description,
        project_creation_time=project.project_creation_time,
        project_last_updated=project.project_last_updated,
        thumbnail_transformation_id=project.thumbnail_transformation_id,
        generations=[_serialize_generation(t) for t in generations],
        groups=[GroupResponse.model_validate(g) for g in groups],
    )


@router.put("/{project_id}", response_model=ProjectSummary)
def update_project(
    project_id: UUID,
    payload: ProjectUpdate,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    project = _owned_project(project_id, db, user)
    if payload.project_name is not None:
        project.project_name = payload.project_name.strip() or project.project_name
    if payload.project_description is not None:
        project.project_description = payload.project_description.strip() or None

    # Only apply thumbnail changes when the field is explicitly included in
    # the request body. Passing it as `null` clears the override; passing a
    # UUID validates that the generation belongs to this project.
    if "thumbnail_transformation_id" in payload.model_fields_set:
        if payload.thumbnail_transformation_id is None:
            project.thumbnail_transformation_id = None
        else:
            chosen = db.get(Transformation, payload.thumbnail_transformation_id)
            if not chosen or chosen.project_id != project_id:
                raise HTTPException(
                    status_code=400,
                    detail="Thumbnail must reference a generation in this project",
                )
            project.thumbnail_transformation_id = payload.thumbnail_transformation_id

    project.project_last_updated = datetime.utcnow()
    db.add(project)
    db.commit()
    db.refresh(project)

    count = db.exec(
        select(func.count()).select_from(Transformation).where(
            Transformation.project_id == project_id
        )
    ).one()
    if isinstance(count, tuple):
        count = count[0]

    # Resolve thumbnail path the same way list_projects does so the frontend
    # can immediately reflect a change without a full refetch.
    thumb_path: Optional[str] = None
    if project.thumbnail_transformation_id:
        chosen = db.get(Transformation, project.thumbnail_transformation_id)
        if chosen and chosen.project_id == project_id:
            thumb_path = _output_path(chosen)
    if thumb_path is None:
        latest = db.exec(
            select(Transformation)
            .where(Transformation.project_id == project_id)
            .order_by(desc(Transformation.created_at))
            .limit(1)
        ).first()
        if latest:
            thumb_path = _output_path(latest)

    return _serialize_summary(project, int(count), thumb_path)


@router.delete("/{project_id}", status_code=200)
def delete_project(
    project_id: UUID,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    project = _owned_project(project_id, db, user)

    # Detach generations and groups instead of deleting them
    gens = db.exec(
        select(Transformation).where(Transformation.project_id == project_id)
    ).all()
    for t in gens:
        t.project_id = None
        t.group_id = None
        db.add(t)

    groups = db.exec(select(Group).where(Group.project_id == project_id)).all()
    for g in groups:
        db.delete(g)

    # InputImage.project_id is NOT NULL — clean up any legacy rows so the
    # FK constraint doesn't block the project delete.
    legacy_inputs = db.exec(
        select(InputImage).where(InputImage.project_id == project_id)
    ).all()
    for img in legacy_inputs:
        db.delete(img)

    db.delete(project)
    db.commit()
    return {"deleted": True}


# ─── Groups ───────────────────────────────────────────────────────────────

@router.post("/{project_id}/groups", response_model=GroupResponse)
def create_group(
    project_id: UUID,
    payload: GroupCreate,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    _owned_project(project_id, db, user)
    name = payload.group_name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Group name is required")
    group = Group(project_id=project_id, group_name=name)
    db.add(group)
    db.commit()
    db.refresh(group)
    return GroupResponse.model_validate(group)


@router.put("/{project_id}/groups/{group_id}", response_model=GroupResponse)
def rename_group(
    project_id: UUID,
    group_id: UUID,
    payload: GroupUpdate,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    _owned_project(project_id, db, user)
    group = db.get(Group, group_id)
    if not group or group.project_id != project_id:
        raise HTTPException(status_code=404, detail="Group not found")
    name = payload.group_name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Group name is required")
    group.group_name = name
    db.add(group)
    db.commit()
    db.refresh(group)
    return GroupResponse.model_validate(group)


@router.delete("/{project_id}/groups/{group_id}", status_code=200)
def delete_group(
    project_id: UUID,
    group_id: UUID,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    _owned_project(project_id, db, user)
    group = db.get(Group, group_id)
    if not group or group.project_id != project_id:
        raise HTTPException(status_code=404, detail="Group not found")

    # Detach generations from this group without deleting them
    gens = db.exec(
        select(Transformation).where(Transformation.group_id == group_id)
    ).all()
    for t in gens:
        t.group_id = None
        db.add(t)

    db.delete(group)
    db.commit()
    return {"deleted": True}
