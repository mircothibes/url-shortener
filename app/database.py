"""Database configuration"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# The database URL must be provided by the environment. There is no
# hard-coded fallback on purpose: a missing DATABASE_URL should fail loudly
# instead of silently connecting with default credentials.
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL environment variable is not set. "
        "Set it before starting the app (docker-compose provides it locally)."
    )

# Create engine WITHOUT pool_pre_ping
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=False,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
