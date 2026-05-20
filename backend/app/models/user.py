from typing import Optional, TYPE_CHECKING, List
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.input_image import InputImage
    from app.models.activity import Activity
    from app.models.transformed_image import GeneratedImage

class User(SQLModel, table=True):
    user_id: Optional[int] = Field(default=None, primary_key=True)
    user_name: str
    email: str
    firebase_uid: str = Field(index=True)
    photo_url: Optional[str] = Field(default=None)
    account_created_at: Optional[datetime] = Field(default=None)
    last_sign_in_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    input_images: List["InputImage"] = Relationship(back_populates="user")
    activity_logs: List["Activity"] = Relationship(back_populates="user")
    generated_images: List["GeneratedImage"] = Relationship(back_populates="user")
