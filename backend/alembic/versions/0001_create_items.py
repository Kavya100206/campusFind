"""create items table

Revision ID: 0001_create_items
Revises: 
Create Date: 2026-10-14 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "0001_create_items"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "items",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("location", sa.String(length=120), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="LOST"),
        sa.Column("reporter_name", sa.String(length=80), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

def downgrade():
    op.drop_table("items")
