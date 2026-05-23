from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import desc, func
from sqlmodel import Session, select

from app.api.deps import get_current_user
from app.database.db import get_session
from app.models.project import Project
from app.models.transformation import Transformation
from app.models.user import User
from app.schemas.transformation_export_schema import TransformationExportItem
from app.services.transformations_export_service import (
    EXPORT_MAX_ITEMS,
    generate_transformations_export_pdf,
    transformations_export_filename,
)


router = APIRouter(prefix="/transformations", tags=["transformation"])

_TIMEFRAME_DELTAS = {
    "day": timedelta(days=1),
    "week": timedelta(days=7),
    "month": timedelta(days=30),
    "year": timedelta(days=365),
}

_TIMEFRAME_LABELS = {
    "day": "Last 24 hours",
    "week": "Last 7 days",
    "month": "Last 30 days",
    "year": "Last 12 months",
    "all": "All time",
    "custom": "Custom range",
}


def _scalar_count(value: object) -> int:
    if isinstance(value, tuple):
        value = value[0]
    return int(value or 0)


def _parse_iso_datetime(value: str, label: str) -> datetime:
    try:
        normalized = value.replace("Z", "+00:00")
        parsed = datetime.fromisoformat(normalized)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid {label} datetime")
    if parsed.tzinfo:
        parsed = parsed.astimezone(timezone.utc).replace(tzinfo=None)
    return parsed


def _resolve_image_path(transformation: Transformation, kind: str) -> Optional[str]:
    if kind == "input":
        return transformation.input_image_path or (
            f"/storage/input/{transformation.file_key}.png" if transformation.file_key else None
        )
    return transformation.output_image_path or (
        f"/storage/output/{transformation.file_key}.png" if transformation.file_key else None
    )


def _build_filters(
    user: User,
    mode: str,
    timeframe: Optional[str],
    limit: Optional[int],
    start: Optional[str],
    end: Optional[str],
) -> tuple[list, str, Optional[int]]:
    if mode not in {"timeframe", "lastx"}:
        raise HTTPException(status_code=400, detail="mode must be timeframe or lastx")

    filters = [Transformation.user_id == user.user_id]
    now = datetime.utcnow()
    label = ""

    if mode == "lastx":
        if limit is None:
            raise HTTPException(status_code=400, detail="limit is required for lastx")
        if limit < 1:
            raise HTTPException(status_code=400, detail="limit must be at least 1")
        if limit > EXPORT_MAX_ITEMS:
            raise HTTPException(
                status_code=400,
                detail=f"Export limit exceeded. Max allowed is {EXPORT_MAX_ITEMS}.",
            )
        label = f"Last {limit} transformations"
        return filters, label, limit

    if not timeframe:
        raise HTTPException(status_code=400, detail="timeframe is required for timeframe mode")
    timeframe_key = timeframe.lower()
    if timeframe_key == "custom":
        if not start or not end:
            raise HTTPException(
                status_code=400,
                detail="start and end are required for custom timeframe",
            )
        start_dt = _parse_iso_datetime(start, "start")
        end_dt = _parse_iso_datetime(end, "end")
        if start_dt > end_dt:
            raise HTTPException(status_code=400, detail="start must be before end")
        filters.append(Transformation.created_at >= start_dt)
        filters.append(Transformation.created_at <= end_dt)
        label = f"Custom range ({start_dt.date()} to {end_dt.date()})"
        return filters, label, None

    if timeframe_key != "all":
        delta = _TIMEFRAME_DELTAS.get(timeframe_key)
        if not delta:
            raise HTTPException(status_code=400, detail="Invalid timeframe value")
        start_dt = now - delta
        filters.append(Transformation.created_at >= start_dt)
        label = _TIMEFRAME_LABELS.get(timeframe_key, timeframe_key)
        return filters, label, None

    label = _TIMEFRAME_LABELS.get(timeframe_key, "All time")
    return filters, label, None


def _query_export_items(
    db: Session,
    filters: list,
    limit: Optional[int],
) -> list[TransformationExportItem]:
    query = (
        select(Transformation, Project)
        .join(Project, Project.project_id == Transformation.project_id, isouter=True)
        .where(*filters)
        .order_by(desc(Transformation.created_at))
    )
    if limit:
        query = query.limit(limit)

    rows = db.exec(query).all()

    items: list[TransformationExportItem] = []
    for transformation, project in rows:
        items.append(
            TransformationExportItem(
                transformation_id=transformation.transformation_id,
                room_type=transformation.room_type,
                style_name=transformation.style_name,
                project_id=transformation.project_id,
                project_name=project.project_name if project else None,
                prompt=transformation.prompt,
                created_at=transformation.created_at,
                input_image_url=_resolve_image_path(transformation, "input"),
                output_image_url=_resolve_image_path(transformation, "output"),
            )
        )
    return items


@router.get("/export", response_model=list[TransformationExportItem])
def list_transformations_for_export(
    response: Response,
    mode: str = Query(...),
    timeframe: Optional[str] = Query(None),
    limit: Optional[int] = Query(None, ge=1),
    start: Optional[str] = Query(None),
    end: Optional[str] = Query(None),
    preview_limit: int = Query(50, ge=1, le=EXPORT_MAX_ITEMS),
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    filters, label, requested_limit = _build_filters(
        user=user,
        mode=mode,
        timeframe=timeframe,
        limit=limit,
        start=start,
        end=end,
    )

    total_count = _scalar_count(
        db.exec(select(func.count()).select_from(Transformation).where(*filters)).one()
    )

    applied_limit = preview_limit
    if requested_limit:
        applied_limit = min(preview_limit, requested_limit)

    # Preview is capped to keep the modal responsive; export uses full filters.
    items = _query_export_items(db, filters, applied_limit)

    response.headers["X-Total-Count"] = str(total_count)
    response.headers["X-Preview-Limit"] = str(applied_limit)
    if total_count > EXPORT_MAX_ITEMS:
        response.headers["X-Export-Too-Large"] = "true"
        response.headers["X-Export-Max"] = str(EXPORT_MAX_ITEMS)
    response.headers["X-Export-Filter"] = label
    return items


@router.get("/export.pdf")
def export_transformations_pdf(
    mode: str = Query(...),
    timeframe: Optional[str] = Query(None),
    limit: Optional[int] = Query(None, ge=1),
    start: Optional[str] = Query(None),
    end: Optional[str] = Query(None),
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    filters, label, requested_limit = _build_filters(
        user=user,
        mode=mode,
        timeframe=timeframe,
        limit=limit,
        start=start,
        end=end,
    )

    total_count = _scalar_count(
        db.exec(select(func.count()).select_from(Transformation).where(*filters)).one()
    )
    export_count = min(total_count, requested_limit) if requested_limit else total_count
    if export_count > EXPORT_MAX_ITEMS:
        raise HTTPException(
            status_code=400,
            detail=f"Export limit exceeded. Please narrow to {EXPORT_MAX_ITEMS} transformations or fewer.",
        )

    items = _query_export_items(db, filters, requested_limit)
    pdf_bytes = generate_transformations_export_pdf(items, user, label)
    filename = transformations_export_filename(user)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-store",
        },
    )
