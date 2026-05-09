from fastapi import APIRouter, Depends, Header, HTTPException
from sqlmodel import Session, select
from app.database.db import get_session
from app.models.user import User
from app.models.activity import Activity
from pydantic import BaseModel

router = APIRouter(prefix="/users", tags=["users"])


class UserSync(BaseModel):
    user_name: str
    email: str


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
    else:
        user = User(
            firebase_uid=x_firebase_uid,
            user_name=body.user_name,
            email=body.email,
        )
        db.add(user)
    db.commit()
    db.refresh(user)
    return {"user_id": user.user_id}


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
