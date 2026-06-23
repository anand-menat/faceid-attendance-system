import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Using SQLite for easier local setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./face_recognition.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
