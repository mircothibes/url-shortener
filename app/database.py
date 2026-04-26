"""Database configuration for URL Shortener API"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


# Get database URL from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://app_user:dev_password@localhost:5432/url_shortener"
)

# Create engine with connection pooling disabled for Cloud Run
engine = create_engine(
    DATABASE_URL,
    echo=False,
    future=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
