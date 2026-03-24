from typing import Optional 
from uuid import UUID , uuid4 
from datetime import datetime 
from sqlmodel import Field, SQLModel, Relationship 

class User(SQLModel, table=True):
    user_id : Optional[int] = Field(default=None , primary_key=True)
    user_name: str 
    email : str
    firebase_uid : str

    
    # Relationships

    input_images: list["InputImage"] = Relationship(back_populates="user")
    activity_logs: list["Activity"] = Relationship(back_populates="user")
    generated_images: list["GeneratedImage"] = Relationship(back_populates="user")
    