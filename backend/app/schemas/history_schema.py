from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class HistoryItem(BaseModel):
    id: str
    image: str
    title: str
    date: str
    style: str
    room: str
    created_at: Optional[datetime] = None
    project_id: Optional[str] = None

    class Config:
        from_attributes = True

class RenameRequest(BaseModel):
    old_file_key: str
    new_file_key: str
