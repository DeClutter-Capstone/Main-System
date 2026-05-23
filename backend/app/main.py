from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import router
from app.config import API_TITLE, API_VERSION, API_DESCRIPTION
from app.database.db import create_db_and_tables, migrate_schema
from app.models import User, Project, Group, Style, InputImage, Transformation, GeneratedImage, Activity
from pathlib import Path
app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION
)
STORAGE_DIR = Path(__file__).parent.parent / "storage" 

# Mount the storage directory to serve files statically
app.mount("/storage", StaticFiles(directory=STORAGE_DIR), name="storage")
# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=[
        "Content-Disposition",
        "X-Total-Count",
        "X-Preview-Limit",
        "X-Export-Too-Large",
        "X-Export-Max",
        "X-Export-Filter",
    ],
)

@app.on_event("startup")
def on_startup():
    """Create database tables and apply idempotent schema migrations."""
    create_db_and_tables()
    migrate_schema()

app.include_router(router)
