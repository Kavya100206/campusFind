from datetime import datetime
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field

class ItemCategory(str, Enum):
    ELECTRONICS = "ELECTRONICS"
    ID_CARD = "ID_CARD"
    BOOKS = "BOOKS"
    CLOTHING = "CLOTHING"
    KEYS = "KEYS"
    BAGS = "BAGS"
    OTHER = "OTHER"

class ItemStatus(str, Enum):
    LOST = "LOST"
    FOUND = "FOUND"
    CLAIMED = "CLAIMED"

class ItemCreate(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(default="", max_length=1000)
    category: ItemCategory
    location: str = Field(min_length=2, max_length=120)
    status: ItemStatus = Field(default=ItemStatus.LOST)
    reporter_name: str = Field(min_length=2, max_length=80)

class ItemUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=120)
    description: str | None = Field(default=None, max_length=1000)
    category: ItemCategory | None = None
    location: str | None = Field(default=None, min_length=2, max_length=120)
    status: ItemStatus | None = None
    reporter_name: str | None = Field(default=None, min_length=2, max_length=80)

class ItemOut(BaseModel):
    id: int
    title: str
    description: str
    category: ItemCategory
    location: str
    status: ItemStatus
    reporter_name: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class StatsOut(BaseModel):
    total: int
    lost: int
    found: int
    claimed: int
    by_category: dict[str, int]
