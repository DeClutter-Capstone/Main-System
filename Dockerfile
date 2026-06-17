# Single-service image: builds the React frontend, then serves it from the
# FastAPI backend. One Railway service runs the whole app (one URL, one deploy).
# Build context is the repo root.

# ---------------------------------------------------------------------------
# Stage 1 — build the frontend (reads frontend/.env.production at build time)
# ---------------------------------------------------------------------------
FROM node:20-alpine AS frontend
WORKDIR /fe
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build   # outputs /fe/dist

# ---------------------------------------------------------------------------
# Stage 2 — backend that also serves the built frontend
# ---------------------------------------------------------------------------
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY backend/ ./backend/

# Bundle the compiled frontend where the backend can serve it.
COPY --from=frontend /fe/dist /app/backend/frontend_dist

WORKDIR /app/backend

# Railway injects $PORT at runtime; default to 8000 for local `docker run`.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
