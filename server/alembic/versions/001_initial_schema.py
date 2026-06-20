"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-06-20

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "categories",
        sa.Column("id", sa.String(255), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image", sa.String(512), nullable=True),
        sa.Column("section", sa.String(50), nullable=True),
    )

    op.create_table(
        "products",
        sa.Column("id", sa.String(255), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("long_description", sa.Text(), nullable=True),
        sa.Column("price", sa.Numeric(10, 2), nullable=False),
        sa.Column("category_id", sa.String(255), sa.ForeignKey("categories.id"), nullable=False, index=True),
        sa.Column("images", JSONB, default=list),
        sa.Column("rating", sa.Numeric(2, 1), default=0),
        sa.Column("features", JSONB, nullable=True),
        sa.Column("is_featured", sa.Boolean(), default=False),
        sa.Column("is_contact_for_price", sa.Boolean(), default=False),
        sa.Column("moq", sa.Integer(), nullable=True),
        sa.Column("uom", sa.String(50), nullable=True),
    )

    op.create_table(
        "reviews",
        sa.Column("id", sa.String(255), primary_key=True),
        sa.Column("product_id", sa.String(255), sa.ForeignKey("products.id"), nullable=False, index=True),
        sa.Column("user_name", sa.String(255), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("date", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("rating >= 1 AND rating <= 5", name="check_rating_range"),
    )

    op.create_table(
        "users",
        sa.Column("id", sa.String(255), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "orders",
        sa.Column("id", sa.String(255), primary_key=True),
        sa.Column("user_id", sa.String(255), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("items", JSONB, nullable=False, default=list),
        sa.Column("total", sa.Numeric(10, 2), nullable=False),
        sa.Column("status", sa.String(50), default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "wishlists",
        sa.Column("id", sa.String(255), primary_key=True),
        sa.Column("user_id", sa.String(255), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("product_id", sa.String(255), sa.ForeignKey("products.id"), nullable=False),
        sa.UniqueConstraint("user_id", "product_id", name="uq_user_product_wishlist"),
    )


def downgrade() -> None:
    op.drop_table("wishlists")
    op.drop_table("orders")
    op.drop_table("users")
    op.drop_table("reviews")
    op.drop_table("products")
    op.drop_table("categories")
