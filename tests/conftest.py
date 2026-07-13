"""Pytest configuration and fixtures"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from uuid import uuid4
from app.models import Base, User
from app.main import app, get_db

DATABASE_URL = "postgresql://app_user:dev_password@localhost:5432/url_shortener_test"


@pytest.fixture(scope="function")
def db_session():
    """Create test database session"""
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db_session):
    """Create test client with database override"""
    def override_get_db():
        yield db_session
    
    # IMPORTANT: make override BEFORE creating TestClient
    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    
    yield client
    
    # Clean after
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session):
    """Create or get test user"""
    user = db_session.query(User).filter(User.email == "test@example.com").first()
    
    if not user:
        user = User(
            id=uuid4(),
            email="test@example.com",
            hashed_password="hashed",
            api_key="test-api-key-12345678901234567890123456789012",
            is_active=True,
        )
        db_session.add(user)
        db_session.commit()
    
    return user


@pytest.fixture
def test_url(db_session, test_user):
    """Create a basic test URL"""
    from app.models import URL
    from datetime import datetime, timezone, timedelta
    
    url = URL(
        short_code="test001",
        original_url="https://github.com",
        user_id=test_user.id,
        expiration_policy="date",
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
        total_clicks=0,
        is_active=True
    )
    db_session.add(url)
    db_session.commit()
    db_session.refresh(url)
    return url


@pytest.fixture
def test_url_expired(db_session, test_user):
    """Create an expired URL"""
    from app.models import URL
    from datetime import datetime, timezone, timedelta
    
    url = URL(
        short_code="expir01",
        original_url="https://example.com",
        user_id=test_user.id,
        expiration_policy="date",
        expires_at=datetime.now(timezone.utc) - timedelta(days=1),
        total_clicks=5,
        is_active=True
    )
    db_session.add(url)
    db_session.commit()
    db_session.refresh(url)
    return url


@pytest.fixture
def test_url_expiring_soon(db_session, test_user):
    """Create a URL that expires in less than 24 hours"""
    from app.models import URL
    from datetime import datetime, timezone, timedelta
    
    url = URL(
        short_code="expir02",
        original_url="https://example.com",
        user_id=test_user.id,
        expiration_policy="date",
        expires_at=datetime.now(timezone.utc) + timedelta(hours=12),
        total_clicks=0,
        is_active=True
    )
    db_session.add(url)
    db_session.commit()
    db_session.refresh(url)
    return url


@pytest.fixture
def test_url_days_policy(db_session, test_user):
    """Create a URL with days-based expiration"""
    from app.models import URL
    from datetime import datetime, timezone
    
    url = URL(
        short_code="days01",
        original_url="https://example.com",
        user_id=test_user.id,
        expiration_policy="days",
        expires_after_days=30,
        created_at=datetime.now(timezone.utc),
        total_clicks=0,
        is_active=True
    )
    db_session.add(url)
    db_session.commit()
    db_session.refresh(url)
    return url


@pytest.fixture
def test_url_clicks_policy(db_session, test_user):
    """Create a URL with clicks-based expiration"""
    from app.models import URL
    
    url = URL(
        short_code="click01",
        original_url="https://example.com",
        user_id=test_user.id,
        expiration_policy="clicks",
        expires_after_clicks=100,
        total_clicks=0,
        is_active=True
    )
    db_session.add(url)
    db_session.commit()
    db_session.refresh(url)
    return url


@pytest.fixture(autouse=True)
def mock_celery_tasks(monkeypatch):
    """Auto-mock Celery tasks for all tests"""
    from unittest.mock import Mock
    mock_task = Mock()
    mock_task.delay = Mock(return_value=None)
    monkeypatch.setattr("app.tasks.dispatch_event_to_all_webhooks", mock_task)


@pytest.fixture(autouse=True)
def set_jwt_secret(monkeypatch):
    """Ensure a signing secret is present so JWT auth works in tests."""
    monkeypatch.setenv("JWT_SECRET_KEY", "test-secret-key-for-pytest-only")


@pytest.fixture(autouse=True)
def disable_rate_limiting():
    """Disable slowapi rate limiting during tests so it doesn't interfere."""
    from app.main import limiter
    limiter.enabled = False
    yield
    limiter.enabled = True
