from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from app.models.transformation import RoomType, StyleType
from datetime import datetime

class TransformationCreate(BaseModel):
    project_id: Optional[UUID] = None
    input_image_id: Optional[UUID] = None
    room_type: RoomType
    style_name: StyleType


class TransformationResponse(BaseModel):
    transformation_id: UUID
    room_type: RoomType
    style_name: StyleType
    project_id: Optional[UUID] = None
    input_image_id: Optional[UUID] = None
    prompt: Optional[str] = None
    output_image_url: Optional[str] = None  # URL of the transformed image

    class Config:
        from_attributes = True