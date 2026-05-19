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
    # Pass an explicit None (via the request body) to clear the thumbnail
    # override and fall back to "latest generation" behavior.
    thumbnail_transformation_id: Optional[UUID] = None


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
    thumbnail_transformation_id: Optional[UUID] = None

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
    display_name: Optional[str] = None
    # The auto-generated slug used in History (e.g. "industrial_bedroom_001").
    # Frontend falls back to this when no display_name has been set.
    file_key: Optional[str] = None
    prompt: Optional[str] = None
    output_image_path: Optional[str] = None
    input_image_path: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class GenerationUpdate(BaseModel):
    """Mutable fields on a generation. Currently only the display name."""
    display_name: Optional[str] = None


class ProjectDetailResponse(BaseModel):
    project_id: UUID
    project_name: str
    project_description: Optional[str] = None
    project_creation_time: datetime
    project_last_updated: datetime
    thumbnail_transformation_id: Optional[UUID] = None
    generations: List[GenerationResponse]
    groups: List[GroupResponse]

    class Config:
        from_attributes = True


class AssignGenerationRequest(BaseModel):
    project_id: Optional[UUID] = None
    group_id: Optional[UUID] = None
