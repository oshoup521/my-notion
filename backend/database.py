from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Get database URL from environment or use SQLite as fallback
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    # Use SQLite database file in the backend directory
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    SQLITE_DB_PATH = os.path.join(BASE_DIR, 'app.db')
    DATABASE_URL = f"sqlite:///{SQLITE_DB_PATH}"

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 