from uuid import uuid4
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from app.models import Base, User

# Conectar ao banco de produção
DATABASE_URL = "postgresql://app_user:dev_password@localhost:5432/url_shortener"
engine = create_engine(DATABASE_URL)

Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

existing_user = db.query(User).filter(User.email == "test@example.com").first()
if existing_user:
    print(f"✅ User already exists!")
    print(f"API Key: {existing_user.api_key}")
else:
    test_user = User(
        id=uuid4(),
        email="test@example.com",
        hashed_password="hashed_dummy_password",
        api_key="test-api-key-12345678901234567890123456789012",
        is_active=True
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    print(f"✅ User created successfully!")
    print(f"Email: {test_user.email}")
    print(f"API Key: {test_user.api_key}")

db.close()
