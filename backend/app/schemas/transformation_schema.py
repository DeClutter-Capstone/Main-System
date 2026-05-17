from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class TransformationCreate(BaseModel):
    project_id: Optional[UUID] = None
    input_image_id: Optional[UUID] = None
    room_type: str
    style_name: str


class TransformationResponse(BaseModel):
    transformation_id: UUID
    room_type: str
    style_name: str
    project_id: Optional[UUID] = None
    input_image_id: Optional[UUID] = None
    prompt: Optional[str] = None
    output_image_url: Optional[str] = None

    class Config:
        from_attributes = True
