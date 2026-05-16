from sqlmodel import Session, select
from app.models.activity import Activity
from app.models.user import User


def log_activity(
    db: Session,
    firebase_uid: str,
    action_type: str,
    device_info: str | None = None,
    login_method: str | None = None,
    ip_address: str | None = None,
) -> Activity:
    user = db.exec(select(User).where(User.firebase_uid == firebase_uid)).first()
    if not user:
        raise ValueError("User not found")
    entry = Activity(
        user_id=user.user_id,
        action_type=action_type,
        device_info=device_info,
        login_method=login_method,
        ip_address=ip_address,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_recent_activity(db: Session, firebase_uid: str, limit: int = 20) -> list[Activity]:
    user = db.exec(select(User).where(User.firebase_uid == firebase_uid)).first()
    if not user:
        return []
    return db.exec(
        select(Activity)
        .where(Activity.user_id == user.user_id)
        .order_by(Activity.timestamp.desc())
        .limit(limit)
    ).all()
