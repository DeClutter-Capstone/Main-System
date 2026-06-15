import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


def _bool_env(name: str, default: bool = False) -> bool:
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


# ---------------------------------------------------------------------------
# Database Configuration
# ---------------------------------------------------------------------------
# Railway (and most managed Postgres providers) inject a single DATABASE_URL.
# Prefer it when present; otherwise build the URL from individual parts so
# local development keeps working.
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME", "DeClutter")

_DATABASE_URL = os.getenv("DATABASE_URL")
if _DATABASE_URL:
    # SQLAlchemy needs the "postgresql://" scheme; Railway/Heroku emit "postgres://".
    if _DATABASE_URL.startswith("postgres://"):
        _DATABASE_URL = _DATABASE_URL.replace("postgres://", "postgresql://", 1)
    DATABASE_URL = _DATABASE_URL
else:
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Log every SQL statement only when explicitly enabled (noisy in production).
SQL_ECHO = _bool_env("SQL_ECHO", False)

# ---------------------------------------------------------------------------
# Storage Configuration
# ---------------------------------------------------------------------------
# Generated/uploaded images live on disk. Railway's container filesystem is
# ephemeral, so in production STORAGE_DIR must point at a mounted volume
# (e.g. /data/storage). Defaults to backend/storage for local development.
_DEFAULT_STORAGE_DIR = Path(__file__).resolve().parent.parent / "storage"
STORAGE_DIR = Path(os.getenv("STORAGE_DIR", str(_DEFAULT_STORAGE_DIR)))
INPUT_DIR = STORAGE_DIR / "input"
OUTPUT_DIR = STORAGE_DIR / "output"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
INPUT_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# CORS Configuration
# ---------------------------------------------------------------------------
# Comma-separated list of allowed frontend origins. Defaults to "*" for local
# development; set ALLOWED_ORIGINS to your deployed frontend URL in production.
_origins_raw = os.getenv("ALLOWED_ORIGINS", "*").strip()
ALLOWED_ORIGINS = (
    ["*"] if _origins_raw == "*" else [o.strip() for o in _origins_raw.split(",") if o.strip()]
)

# ---------------------------------------------------------------------------
# Generation Allowlist (OpenAI token protection)
# ---------------------------------------------------------------------------
# Only these accounts may call the (token-spending) generate endpoint. Match is
# against the user's email OR Firebase UID, case-insensitive. Fail-closed: if
# the list is empty, NO account can generate.
ALLOWED_GENERATION_ACCOUNTS = {
    entry.strip().lower()
    for entry in os.getenv("ALLOWED_GENERATION_EMAILS", "").split(",")
    if entry.strip()
}

# ---------------------------------------------------------------------------
# API Configuration
# ---------------------------------------------------------------------------
API_TITLE = "DeClutter API"
API_VERSION = "1.0"
API_DESCRIPTION = "AI-powered interior redesign system"


# Settings object for session.py
class Settings:
    db_host = DB_HOST
    db_port = DB_PORT
    db_user = DB_USER
    db_password = DB_PASSWORD
    db_name = DB_NAME


settings = Settings()
