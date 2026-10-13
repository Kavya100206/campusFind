from app.schemas import ItemCategory, ItemStatus

def test_health_endpoint(client):
    """GET /health returns liveness status UP."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "UP"}

def test_ready_endpoint(client):
    """GET /ready verifies database connectivity and returns READY."""
    response = client.get("/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "READY"}

def test_root_endpoint(client):
    """GET / returns service name, version, and docs link."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "CampusFind API"
    assert data["docs"] == "/docs"

def test_create_item_success(client):
    """POST /api/items creates a new lost/found record and returns 201."""
    payload = {
        "title": "Bose Noise Cancelling Headphones",
        "description": "Black headphones left near quiet study area",
        "category": ItemCategory.ELECTRONICS.value,
        "location": "Central Library 2nd Floor",
        "status": ItemStatus.LOST.value,
        "reporter_name": "Aarav Sharma",
    }
    response = client.post("/api/items", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["title"] == payload["title"]
    assert data["category"] == ItemCategory.ELECTRONICS.value
    assert data["location"] == payload["location"]
    assert data["status"] == ItemStatus.LOST.value
    assert data["reporter_name"] == payload["reporter_name"]
    assert "created_at" in data
    assert "updated_at" in data

def test_create_item_validation_error(client):
    """POST /api/items validates title length, category enum, and required fields with 422."""
    # Title too short (< 3 characters)
    short_title_resp = client.post(
        "/api/items",
        json={
            "title": "ab",
            "category": "ELECTRONICS",
            "location": "Library",
            "reporter_name": "Student",
        },
    )
    assert short_title_resp.status_code == 422

    # Invalid category enum
    bad_category_resp = client.post(
        "/api/items",
        json={
            "title": "Valid Item Title",
            "category": "NOT_A_REAL_CATEGORY",
            "location": "Library",
            "reporter_name": "Student",
        },
    )
    assert bad_category_resp.status_code == 422

    # Missing reporter_name
    missing_reporter_resp = client.post(
        "/api/items",
        json={
            "title": "Valid Item Title",
            "category": "ELECTRONICS",
            "location": "Library",
        },
    )
    assert missing_reporter_resp.status_code == 422

def test_list_items_and_filters(client, item_factory):
    """GET /api/items filters by status, category, and keyword search."""
    item1 = item_factory(
        title="Sony Wireless Headphones",
        category="ELECTRONICS",
        status="LOST",
        location="Library 2nd Floor",
    )
    item2 = item_factory(
        title="Calculus Textbook",
        category="BOOKS",
        status="FOUND",
        location="Lecture Hall 101",
    )
    item3 = item_factory(
        title="Dorm Room Keys on Blue Lanyard",
        category="KEYS",
        status="LOST",
        location="Library Entrance",
    )

    # List all
    all_resp = client.get("/api/items")
    assert all_resp.status_code == 200
    assert len(all_resp.json()) == 3

    # Filter by status
    found_resp = client.get("/api/items?status=FOUND")
    assert found_resp.status_code == 200
    found_items = found_resp.json()
    assert len(found_items) == 1
    assert found_items[0]["id"] == item2.id

    # Filter by category
    elec_resp = client.get("/api/items?category=ELECTRONICS")
    assert elec_resp.status_code == 200
    elec_items = elec_resp.json()
    assert len(elec_items) == 1
    assert elec_items[0]["id"] == item1.id

    # Search keyword matching location in multiple items
    search_resp = client.get("/api/items?q=library")
    assert search_resp.status_code == 200
    search_items = search_resp.json()
    assert len(search_items) == 2
    search_ids = {it["id"] for it in search_items}
    assert item1.id in search_ids
    assert item3.id in search_ids

def test_get_item_by_id(client, item_factory):
    """GET /api/items/{id} returns item details or 404 when missing."""
    item = item_factory(title="Water Bottle", category="OTHER", location="Gym")

    # Existing item
    res = client.get(f"/api/items/{item.id}")
    assert res.status_code == 200
    assert res.json()["title"] == "Water Bottle"

    # Non-existent item
    missing_res = client.get("/api/items/99999")
    assert missing_res.status_code == 404
    assert missing_res.json()["detail"] == "Item not found"

def test_update_item(client, item_factory):
    """PUT /api/items/{id} updates fields and modifies updated_at timestamp."""
    item = item_factory(
        title="Casio Scientific Calculator",
        description="Left on bench",
        category="ELECTRONICS",
        status="FOUND",
        location="Hall 3",
    )

    update_payload = {
        "description": "Casio FX-991CW with owner initials KP",
        "status": "CLAIMED",
    }
    res = client.put(f"/api/items/{item.id}", json=update_payload)
    assert res.status_code == 200
    updated_data = res.json()
    assert updated_data["description"] == update_payload["description"]
    assert updated_data["status"] == "CLAIMED"

def test_status_transition_claimed_to_lost_rejected(client, item_factory):
    """PUT /api/items/{id} rejects transitioning a CLAIMED item back to LOST or FOUND with 409."""
    claimed_item = item_factory(
        title="Student ID Card",
        category="ID_CARD",
        status="CLAIMED",
        location="Cafeteria",
    )

    # Attempt to reopen to LOST
    reopen_lost = client.put(f"/api/items/{claimed_item.id}", json={"status": "LOST"})
    assert reopen_lost.status_code == 409
    assert reopen_lost.json()["detail"] == "Claimed items cannot be reopened"

    # Attempt to reopen to FOUND
    reopen_found = client.put(f"/api/items/{claimed_item.id}", json={"status": "FOUND"})
    assert reopen_found.status_code == 409
    assert reopen_found.json()["detail"] == "Claimed items cannot be reopened"

def test_delete_item(client, item_factory):
    """DELETE /api/items/{id} returns 204 then subsequent GET returns 404."""
    item = item_factory(title="Blue Umbrella", category="OTHER", location="Main Gate")

    del_res = client.delete(f"/api/items/{item.id}")
    assert del_res.status_code == 204

    get_res = client.get(f"/api/items/{item.id}")
    assert get_res.status_code == 404

def test_stats_endpoint(client, item_factory):
    """GET /api/items/stats returns accurate status totals and category breakdown."""
    item_factory(category="ELECTRONICS", status="LOST")
    item_factory(category="ELECTRONICS", status="LOST")
    item_factory(category="BOOKS", status="FOUND")
    item_factory(category="ID_CARD", status="CLAIMED")

    res = client.get("/api/items/stats")
    assert res.status_code == 200
    stats = res.json()
    assert stats["total"] == 4
    assert stats["lost"] == 2
    assert stats["found"] == 1
    assert stats["claimed"] == 1
    assert stats["by_category"]["ELECTRONICS"] == 2
    assert stats["by_category"]["BOOKS"] == 1
    assert stats["by_category"]["ID_CARD"] == 1
    assert stats["by_category"]["CLOTHING"] == 0
