from datetime import datetime
from fastapi import APIRouter, Depends, Header, HTTPException, Response
from sqlmodel import Session, select
from app.api.deps import get_current_user
from app.database.db import get_session
from app.models.user import User
from app.models.activity import Activity
from app.services.account_summary_service import (
    account_summary_filename,
    generate_account_summary_pdf,
)
from pydantic import BaseModel

router = APIRouter(prefix="/users", tags=["users"])


class UserSync(BaseModel):
    user_name: str
    email: str
    photo_url: str | None = None
    account_created_at: datetime | None = None
    last_sign_in_at: datetime | None = None


@router.post("/sync", status_code=200)
def sync_user(
    body: UserSync,
    x_firebase_uid: str = Header(...),
    db: Session = Depends(get_session),
):
    user = db.exec(select(User).where(User.firebase_uid == x_firebase_uid)).first()
    if user:
        user.user_name = body.user_name
        user.email = body.email
        user.photo_url = body.photo_url
        user.account_created_at = body.account_created_at or user.account_created_at
        user.last_sign_in_at = body.last_sign_in_at or user.last_sign_in_at
    else:
        user = User(
            firebase_uid=x_firebase_uid,
            user_name=body.user_name,
            email=body.email,
            photo_url=body.photo_url,
            account_created_at=body.account_created_at,
            last_sign_in_at=body.last_sign_in_at,
        )
        db.add(user)
    db.commit()
    db.refresh(user)
    return {"user_id": user.user_id}


@router.get("/me/summary.pdf")
def download_account_summary(
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    pdf_bytes = generate_account_summary_pdf(db, user)
    filename = account_summary_filename(user)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-store",
        },
    )


@router.delete("/me", status_code=200)
def delete_user(
    x_firebase_uid: str = Header(...),
    db: Session = Depends(get_session),
):
    user = db.exec(select(User).where(User.firebase_uid == x_firebase_uid)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    activities = db.exec(select(Activity).where(Activity.user_id == user.user_id)).all()
    for activity in activities:
        db.delete(activity)

    db.delete(user)
    db.commit()
    return {"deleted": True}
