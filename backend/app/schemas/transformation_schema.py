from pydantic import BaseModel
from uuid import UUID
from models.transformation import RoomType
import datetime
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