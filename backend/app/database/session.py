from sqlmodel import Session, create_engine
from app.config import DATABASE_URL

# Create engine (PostgreSQL connection)
engine = create_engine(
    DATABASE_URL,
    echo=True  # set to False in production
)

# Dependency to get DB session
def get_session():
    with Session(engine) as session:
        yield session