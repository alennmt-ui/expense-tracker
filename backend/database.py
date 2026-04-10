"""
Database Configuration
Sets up SQLAlchemy engine, session, and base class
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database URL
# Creates expenses.db file in the backend directory
SQLALCHEMY_DATABASE_URL = "sqlite:///./expenses.db"

# Create SQLAlchemy engine
# check_same_thread=False is needed for SQLite to work with FastAPI
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

# Create SessionLocal class for database sessions
# Each instance will be a database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
# All database models will inherit from this
Base = declarative_base()


# Dependency to get database session
def get_db():
    """
    Dependency function that provides database session
    Automatically closes session after request is complete
    
    Usage in endpoints:
        def endpoint(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
