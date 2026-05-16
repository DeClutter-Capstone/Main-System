from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class ActivityResponse(BaseModel):
    activity_id: UUID
    action_type: str
    timestamp: datetime
    device_info: str | None = None
    login_method: str | None = None
    ip_address: str | None = None

    class Config:
        from_attributes = True
