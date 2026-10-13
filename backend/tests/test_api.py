import os
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    assert client.get("/health").json() == {"status": "UP"}

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["service"] == "CampusFind API"

def test_create_item_validation():
    response = client.post(
        "/api/items",
        json={
            "title": "Blue Wireless Headphones",
            "category": "ELECTRONICS",
            "location": "Central Library",
            "reporter_name": "Student A",
        },
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Blue Wireless Headphones"
    assert response.json()["category"] == "ELECTRONICS"
