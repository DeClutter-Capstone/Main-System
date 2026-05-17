"""Shared FastAPI dependencies — primarily user authentication."""

from fastapi import Depends, Header, HTTPException
from sqlmodel import Session, select

from app.database.db import get_session
from app.models.user import User


def get_current_user(
    x_firebase_uid: str = Header(..., alias="X-Firebase-Uid"),
    db: Session = Depends(get_session),
) -> User:
    """Identify the logged-in user by the Firebase UID header.

    Matches the pattern already used by /users/sync — the frontend is expected
    to send the Firebase UID it already has after Firebase Auth signs the user
    in. If the user has never been synced or the header is missing, return 401.
    """
    if not x_firebase_uid:
        raise HTTPException(status_code=401, detail="Missing authentication")

    user = db.exec(select(User).where(User.firebase_uid == x_firebase_uid)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found — sign in again")
    return user
