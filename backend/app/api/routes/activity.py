from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlmodel import Session
from pydantic import BaseModel
from app.database.db import get_session
from app.services.activity_service import log_activity, get_recent_activity
from app.schemas.activity_schema import ActivityResponse

router = APIRouter(prefix="/activity", tags=["activity"])


class LoginActivityBody(BaseModel):
    device_info: str | None = None
    login_method: str | None = None


@router.post("/login", response_model=ActivityResponse, status_code=201)
def record_login(
    request: Request,
    body: LoginActivityBody = LoginActivityBody(),
    x_firebase_uid: str = Header(...),
    db: Session = Depends(get_session)
):
    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else None)
    try:
        return log_activity(
            db,
            x_firebase_uid,
            "login",
            device_info=body.device_info,
            login_method=body.login_method,
            ip_address=ip,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/", response_model=list[ActivityResponse])
def fetch_activity(
    x_firebase_uid: str = Header(...),
    limit: int = 20,
    db: Session = Depends(get_session)
):
    return get_recent_activity(db, x_firebase_uid, limit)
