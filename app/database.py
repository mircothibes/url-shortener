"""Database configuration for URL Shortener API"""
import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://app_user:dev_password@localhost:5432/url_shortener"
)

engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool
)

# Disable pre_ping completely
@event.listens_for(engine, "connect")
def receive_connect(dbapi_conn, connection_record):
    pass

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
