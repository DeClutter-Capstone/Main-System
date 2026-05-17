from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    project_name: str
    project_description: Optional[str] = None


class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    project_description: Optional[str] = None


class ProjectSummary(BaseModel):
    """Light response used for the My Projects listing."""
    project_id: UUID
    project_name: str
    project_description: Optional[str] = None
    project_creation_time: datetime
    project_last_updated: datetime
    generation_count: int
    latest_output_image: Optional[str] = None
    shared_style: Optional[str] = None  # populated when every generation shares one style

    class Config:
        from_attributes = True


class GroupCreate(BaseModel):
    group_name: str


class GroupUpdate(BaseModel):
    group_name: str


class GroupResponse(BaseModel):
    group_id: UUID
    group_name: str
    created_at: datetime

    class Config:
        from_attributes = True


class GenerationResponse(BaseModel):
    """A transformation, rendered for the frontend's "generation" concept."""
    transformation_id: UUID
    project_id: Optional[UUID] = None
    group_id: Optional[UUID] = None
    room_type: str
    style_name: str
    prompt: Optional[str] = None
    output_image_path: Optional[str] = None
    input_image_path: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectDetailResponse(BaseModel):
    project_id: UUID
    project_name: str
    project_description: Optional[str] = None
    project_creation_time: datetime
    project_last_updated: datetime
    generations: List[GenerationResponse]
    groups: List[GroupResponse]

    class Config:
        from_attributes = True


class AssignGenerationRequest(BaseModel):
    project_id: Optional[UUID] = None
    group_id: Optional[UUID] = None
