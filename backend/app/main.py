from datetime import datetime, timezone
from enum import Enum
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session
from prometheus_fastapi_instrumentator import Instrumentator

from .config import settings
from .db import Base, engine, get_db
from .models import Item
from .schemas import ItemCategory, ItemCreate, ItemOut, ItemStatus, ItemUpdate, StatsOut

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Production containers run Alembic before Uvicorn; conftest handles in-memory test DB
    try:
        Base.metadata.create_all(bind=engine)
    except Exception:
        pass
    yield

app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

@app.get("/")
def root():
    return {"service": settings.app_name, "version": "1.0.0", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "UP"}

@app.get("/ready")
def ready(db: Session = Depends(get_db)):
    db.execute(select(func.count(Item.id)))
    return {"status": "READY"}

@app.get("/api/items/stats", response_model=StatsOut)
def get_item_stats(db: Session = Depends(get_db)):
    status_rows = db.execute(select(Item.status, func.count(Item.id)).group_by(Item.status)).all()
    status_counts = {s: c for s, c in status_rows}

    category_rows = db.execute(select(Item.category, func.count(Item.id)).group_by(Item.category)).all()
    category_counts = {c: count for c, count in category_rows}

    # Ensure all defined categories exist in stats dictionary
    for cat in ItemCategory:
        category_counts.setdefault(cat.value, 0)

    total = sum(status_counts.values())
    lost = status_counts.get(ItemStatus.LOST.value, 0)
    found = status_counts.get(ItemStatus.FOUND.value, 0)
    claimed = status_counts.get(ItemStatus.CLAIMED.value, 0)

    return StatsOut(
        total=total,
        lost=lost,
        found=found,
        claimed=claimed,
        by_category=category_counts,
    )

@app.get("/api/items", response_model=list[ItemOut])
def list_items(
    status: ItemStatus | None = Query(default=None),
    category: ItemCategory | None = Query(default=None),
    q: str | None = Query(default=None, description="Search term for title, description, or location"),
    db: Session = Depends(get_db),
):
    query = select(Item)

    if status:
        query = query.where(Item.status == status.value)
    if category:
        query = query.where(Item.category == category.value)
    if q and q.strip():
        search_pattern = f"%{q.strip()}%"
        query = query.where(
            or_(
                Item.title.ilike(search_pattern),
                Item.description.ilike(search_pattern),
                Item.location.ilike(search_pattern),
            )
        )

    return list(db.scalars(query.order_by(Item.id.desc())))

@app.post("/api/items", response_model=ItemOut, status_code=status.HTTP_201_CREATED)
def create_item(payload: ItemCreate, db: Session = Depends(get_db)):
    item_data = payload.model_dump()
    # Normalize enums to string values for database storage
    if isinstance(item_data.get("category"), Enum):
        item_data["category"] = item_data["category"].value
    if isinstance(item_data.get("status"), Enum):
        item_data["status"] = item_data["status"].value

    item = Item(**item_data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@app.get("/api/items/{item_id}", response_model=ItemOut)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item

@app.put("/api/items/{item_id}", response_model=ItemOut)
def update_item(item_id: int, payload: ItemUpdate, db: Session = Depends(get_db)):
    item = db.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    update_dict = payload.model_dump(exclude_unset=True)

    # Validate status transition rule: once CLAIMED, cannot revert to LOST or FOUND
    if "status" in update_dict and update_dict["status"] is not None:
        target_status = update_dict["status"]
        target_status_val = target_status.value if isinstance(target_status, Enum) else target_status
        if item.status == ItemStatus.CLAIMED.value and target_status_val != ItemStatus.CLAIMED.value:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Claimed items cannot be reopened",
            )

    for key, value in update_dict.items():
        if isinstance(value, Enum):
            value = value.value
        setattr(item, key, value)

    item.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(item)
    return item

@app.delete("/api/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    db.delete(item)
    db.commit()
