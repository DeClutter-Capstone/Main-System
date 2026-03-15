from fastapi import FastAPI
from app.api.router import router
from app.config import API_TITLE, API_VERSION, API_DESCRIPTION
from app.database.db import create_db_and_tables
from app.models import User, Project, Style, InputImage, Transformation, GeneratedImage, Activity

app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION
)

@app.on_event("startup")
def on_startup():
    """Create database tables on startup"""
    create_db_and_tables()

app.include_router(router)