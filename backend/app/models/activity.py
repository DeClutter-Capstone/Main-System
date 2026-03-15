from typing import Optional 
from uuid import UUID , uuid4 
from datetime import datetime 
from sqlmodel import Field, SQLModel, Relationship 

class Activity(SQLModel, table=True):
    activity_id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    user_id: int = Field(foreign_key="user.user_id")
    action_type: str
    timestamp: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    user: "User" = Relationship(back_populates="activity_logs")
    
