import os
from datetime import datetime, timedelta

import httpx
import pytest
from sqlalchemy.pool import StaticPool
from sqlmodel import SQLModel, Session, create_engine

os.environ.setdefault("OPENAI_API_KEY", "test-key")

from app.database.db import get_session
from app.main import app
from app.models.transformation import Transformation
from app.models.user import User

pytestmark = pytest.mark.anyio


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
def db_engine():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture
async def client(db_engine):
    def get_session_override():
        with Session(db_engine) as session:
            yield session

    app.dependency_overrides[get_session] = get_session_override
    startup_handlers = list(app.router.on_startup)
    app.router.on_startup.clear()
    transport = httpx.ASGITransport(app=app)
    try:
        async with httpx.AsyncClient(
            transport=transport, base_url="http://testserver"
        ) as client:
            yield client
    finally:
        app.dependency_overrides.clear()
        app.router.on_startup[:] = startup_handlers


def _seed_user(db_engine, uid: str = "firebase-uid") -> User:
    with Session(db_engine) as session:
        user = User(user_name="Test User", email="test@example.com", firebase_uid=uid)
        session.add(user)
        session.commit()
        session.refresh(user)
        return user


def _seed_transformations(db_engine, user_id: int) -> list[Transformation]:
    now = datetime.utcnow()
    items = [
        Transformation(
            user_id=user_id,
            room_type="bedroom",
            style_name="modern",
            created_at=now - timedelta(hours=2),
            file_key="latest",
        ),
        Transformation(
            user_id=user_id,
            room_type="kitchen",
            style_name="rustic",
            created_at=now - timedelta(days=5),
            file_key="older",
        ),
    ]
    with Session(db_engine) as session:
        session.add_all(items)
        session.commit()
        for item in items:
            session.refresh(item)
    return items


async def test_export_requires_auth(client):
    response = await client.get("/api/transformations/export?mode=lastx&limit=1")
    assert response.status_code in {401, 422}


async def test_timeframe_filtering(client, db_engine):
    user = _seed_user(db_engine)
    _seed_transformations(db_engine, user.user_id)

    response = await client.get(
        "/api/transformations/export?mode=timeframe&timeframe=day",
        headers={"x-firebase-uid": user.firebase_uid},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["style_name"] == "modern"


async def test_limit_filtering(client, db_engine):
    user = _seed_user(db_engine, uid="firebase-limit")
    transformations = _seed_transformations(db_engine, user.user_id)

    response = await client.get(
        "/api/transformations/export?mode=lastx&limit=1",
        headers={"x-firebase-uid": user.firebase_uid},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["transformation_id"] == str(transformations[0].transformation_id)


async def test_pdf_export(client, db_engine):
    user = _seed_user(db_engine, uid="firebase-pdf")
    _seed_transformations(db_engine, user.user_id)

    response = await client.get(
        "/api/transformations/export.pdf?mode=lastx&limit=1",
        headers={"x-firebase-uid": user.firebase_uid},
    )
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/pdf")
    assert response.content[:4] == b"%PDF"
