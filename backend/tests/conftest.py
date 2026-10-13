import os
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import Base, get_db
from app.main import app
from app.models import Item

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="function")
def db_session():
    """Create fresh in-memory database schema per test function."""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)

@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI TestClient with get_db overridden to use test SQLite session."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def item_factory(db_session):
    """Factory fixture to create sample Item database rows."""
    def create_item(**kwargs):
        data = {
            "title": "Default Test Item",
            "description": "Default Description",
            "category": "ELECTRONICS",
            "location": "Default Location",
            "status": "LOST",
            "reporter_name": "Test Reporter",
        }
        data.update(kwargs)
        item = Item(**data)
        db_session.add(item)
        db_session.commit()
        db_session.refresh(item)
        return item
    return create_item
