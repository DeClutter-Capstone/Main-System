from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import router
from app.config import API_TITLE, API_VERSION, API_DESCRIPTION, ALLOWED_ORIGINS, STORAGE_DIR
from app.database.db import create_db_and_tables, migrate_schema
from app.models import User, Project, Group, Style, InputImage, Transformation, GeneratedImage, Activity

# The Docker build compiles the React app into backend/frontend_dist so this
# one service can serve both the API and the website from a single origin.
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend_dist"

app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION
)

# Mount the storage directory to serve files statically
app.mount("/storage", StaticFiles(directory=STORAGE_DIR), name="storage")
# Add CORS middleware to allow frontend requests. Browsers reject the "*"
# wildcard when credentials are allowed, so only enable credentials once a
# concrete origin list is configured (ALLOWED_ORIGINS in production).
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=ALLOWED_ORIGINS != ["*"],
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


# ---------------------------------------------------------------------------
# Serve the compiled frontend (single-service deployment).
# Registered AFTER the API router and /storage mount so those win first; this
# catch-all handles the website and client-side routes (/history, /projects…),
# falling back to index.html so deep links work.
# ---------------------------------------------------------------------------
if FRONTEND_DIR.is_dir():

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        candidate = FRONTEND_DIR / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(FRONTEND_DIR / "index.html")
