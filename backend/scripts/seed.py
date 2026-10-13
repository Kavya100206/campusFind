"""Seed database with realistic campus lost and found records."""
from datetime import datetime, timezone
from sqlalchemy import select
from app.db import SessionLocal
from app.models import Item

SAMPLE_ITEMS = [
    {
        "title": "Sony WH-1000XM4 Headphones",
        "description": "Black over-ear wireless headphones in carrying case left on a corner study desk.",
        "category": "ELECTRONICS",
        "location": "Central Library, 2nd Floor Quiet Zone",
        "status": "LOST",
        "reporter_name": "Aarav Sharma",
    },
    {
        "title": "Student ID Card - Kavya Patel",
        "description": "Found near the billing counter at lunch hour. Kept with cafeteria manager.",
        "category": "ID_CARD",
        "location": "Cafeteria, Counter 3",
        "status": "FOUND",
        "reporter_name": "Ramesh Kumar",
    },
    {
        "title": "Calculus: Early Transcendentals",
        "description": "Hardcover 9th edition textbook with handwritten notes on chapter 4.",
        "category": "BOOKS",
        "location": "Lecture Hall Complex, Room 102",
        "status": "FOUND",
        "reporter_name": "Priya Singh",
    },
    {
        "title": "Apple 67W USB-C Power Adapter",
        "description": "White power brick with braided charging cable plugged into wall socket.",
        "category": "ELECTRONICS",
        "location": "Computer Lab 4, Desk 18",
        "status": "LOST",
        "reporter_name": "Rohan Verma",
    },
    {
        "title": "Stainless Steel Water Bottle",
        "description": "Navy blue insulated flask with campus robotics club sticker.",
        "category": "OTHER",
        "location": "Sports Arena, Badminton Court 2",
        "status": "FOUND",
        "reporter_name": "Vikram Patel",
    },
    {
        "title": "Bunch of 3 Keys with Red Honda Keychain",
        "description": "Found on the walkway near parking. Deposited with security personnel.",
        "category": "KEYS",
        "location": "Main Gate Security Booth",
        "status": "FOUND",
        "reporter_name": "Security Guard Jagdish",
    },
    {
        "title": "Nike Windbreaker Jacket",
        "description": "Size M black windbreaker jacket left behind on chair back.",
        "category": "CLOTHING",
        "location": "Hostel B Dining Hall",
        "status": "LOST",
        "reporter_name": "Aditya Nair",
    },
    {
        "title": "SwissGear Laptop Backpack",
        "description": "Black backpack containing engineering notebooks. Successfully returned to owner.",
        "category": "BAGS",
        "location": "Student Activity Center Lounge",
        "status": "CLAIMED",
        "reporter_name": "Sneha Reddy",
    },
]

def seed_database():
    db = SessionLocal()
    try:
        existing_count = len(list(db.scalars(select(Item))))
        if existing_count > 0:
            print(f"Database already contains {existing_count} items. Skipping seed.")
            return

        now = datetime.now(timezone.utc)
        for data in SAMPLE_ITEMS:
            item = Item(**data, created_at=now, updated_at=now)
            db.add(item)
        db.commit()
        print(f"Successfully seeded {len(SAMPLE_ITEMS)} campus lost and found items.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
