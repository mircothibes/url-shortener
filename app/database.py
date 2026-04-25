"""Database configuration for URL Shortener API"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

# Get database URL from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://app_user:dev_password@34.59.40.8:5432/url_shortener"
)

# Create engine with connection pooling disabled for Cloud Run
engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,
    connect_args={
        "connect_timeout": 10,
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
