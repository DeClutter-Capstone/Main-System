from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlmodel import Session, SQLModel
from app.config import DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    echo=True,
    future=True
)

SessionLocal = sessionmaker(
    engine,
    class_=Session,
    expire_on_commit=False
)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with SessionLocal() as session:
        yield session


# ---------------------------------------------------------------------------
# Idempotent schema migrations
# ---------------------------------------------------------------------------
# These statements run on every startup and are designed to be safe to re-run.
# They do NOT drop tables or columns. They only add missing columns and relax
# the room_type / style_name columns from PostgreSQL ENUM types to plain TEXT
# so that custom user-supplied values (e.g. "studio apartment") can be stored.

_MIGRATIONS = [
    # project: add user_id if missing
    """
    ALTER TABLE project
    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES "user"(user_id)
    """,
    """
    CREATE INDEX IF NOT EXISTS ix_project_user_id ON project (user_id)
    """,

    # transformation: new columns
    """
    ALTER TABLE transformation
    ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(group_id)
    """,
    """
    ALTER TABLE transformation
    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES "user"(user_id)
    """,
    """
    ALTER TABLE transformation
    ADD COLUMN IF NOT EXISTS input_image_path TEXT
    """,
    """
    ALTER TABLE transformation
    ADD COLUMN IF NOT EXISTS output_image_path TEXT
    """,
    """
    CREATE INDEX IF NOT EXISTS ix_transformation_group_id ON transformation (group_id)
    """,
    """
    CREATE INDEX IF NOT EXISTS ix_transformation_user_id ON transformation (user_id)
    """,
    """
    CREATE INDEX IF NOT EXISTS ix_transformation_project_id ON transformation (project_id)
    """,

    # Relax room_type / style_name from enum to text (preserves existing values).
    # USING <col>::text safely casts existing enum values to their text form.
    """
    ALTER TABLE transformation
    ALTER COLUMN room_type TYPE TEXT USING room_type::text
    """,
    """
    ALTER TABLE transformation
    ALTER COLUMN style_name TYPE TEXT USING style_name::text
    """,

    # transformation: user-chosen display name
    """
    ALTER TABLE transformation
    ADD COLUMN IF NOT EXISTS display_name TEXT
    """,

    # project: user-uploaded thumbnail image path (replaces the older
    # thumbnail_transformation_id FK approach). Idempotent: drops the old
    # column if present, then ensures the new TEXT column exists.
    """
    ALTER TABLE project
    DROP COLUMN IF EXISTS thumbnail_transformation_id
    """,
    """
    ALTER TABLE project
    ADD COLUMN IF NOT EXISTS thumbnail_image_path TEXT
    """,
]


def migrate_schema() -> None:
    """Apply idempotent schema migrations. Safe to run on every startup."""
    with engine.begin() as conn:
        for stmt in _MIGRATIONS:
            try:
                conn.execute(text(stmt))
            except Exception as exc:
                # Log and continue — a single failed migration shouldn't block
                # startup if the underlying state is already correct.
                print(f"[migrate_schema] statement skipped: {exc}")
