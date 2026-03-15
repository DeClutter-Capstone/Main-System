from typing import Generator
from sqlmodel import Session
from app.database.db import SessionLocal

def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session for routes.
    Usage: def my_route(session: Session = Depends(get_db)):
    """
    with SessionLocal() as session:
        yield session