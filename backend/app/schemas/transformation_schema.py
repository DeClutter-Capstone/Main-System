from pydantic import BaseModel
from uuid import UUID
from app.models.transformation import RoomType
from datetime import datetime
class TransformationCreate(BaseModel):
    project_id: UUID
    input_image_id: UUID
    room_type: RoomType 


class TransformationResponse(BaseModel):
    transformation_id: UUID
    room_type: RoomType
    created_at: datetime

    class Config:
        from_attributes = True