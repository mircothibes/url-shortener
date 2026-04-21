release: python -c "from app.models import Base; from app.database import engine; Base.metadata.create_all(bind=engine); print('Tables created')"
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
