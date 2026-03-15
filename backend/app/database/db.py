from sqlalchemy import create_engine
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
