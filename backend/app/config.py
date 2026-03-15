import os
from dotenv import load_dotenv

load_dotenv()

# Database Configuration
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME", "DeClutter")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# API Configuration
API_TITLE = "DeClutter API"
API_VERSION = "1.0"
API_DESCRIPTION = "AI-powered interior redesign system"

