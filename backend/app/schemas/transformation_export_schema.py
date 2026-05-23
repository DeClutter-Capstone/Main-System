from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class TransformationExportItem(BaseModel):
    transformation_id: UUID
    room_type: Optional[str] = None
    style_name: Optional[str] = None
    project_id: Optional[UUID] = None
    project_name: Optional[str] = None
    prompt: Optional[str] = None
    created_at: datetime
    input_image_url: Optional[str] = None
    output_image_url: Optional[str] = None

    class Config:
        from_attributes = True
