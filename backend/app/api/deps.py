"""Shared FastAPI dependencies — primarily user authentication."""

from fastapi import Depends, Header, HTTPException
from sqlmodel import Session, select

from app.config import ALLOWED_GENERATION_ACCOUNTS
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


def require_generation_access(user: User = Depends(get_current_user)) -> User:
    """Gate the token-spending generate endpoint to an explicit allowlist.

    Matches the user's email OR Firebase UID against ALLOWED_GENERATION_ACCOUNTS
    (configured via the ALLOWED_GENERATION_EMAILS env var). Fail-closed: an empty
    allowlist denies everyone.

    NOTE: get_current_user trusts the X-Firebase-Uid header without verifying a
    Firebase ID token, so this stops casual/UI abuse but not a forged header.
    Upgrade to server-side ID-token verification for stronger protection.
    """
    identifiers = {
        (user.email or "").strip().lower(),
        (user.firebase_uid or "").strip().lower(),
    }
    if not ALLOWED_GENERATION_ACCOUNTS or identifiers.isdisjoint(ALLOWED_GENERATION_ACCOUNTS):
        raise HTTPException(
            status_code=403,
            detail="This account is not enabled for image generation.",
        )
    return user
