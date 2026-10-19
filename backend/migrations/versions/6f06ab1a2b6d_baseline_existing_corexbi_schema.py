
"""Create initial CorexBI schema.

Revision ID: 6f06ab1a2b6d
Revises:
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "6f06ab1a2b6d"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("category", sa.String(80), nullable=False),
        sa.Column(
            "price",
            sa.Numeric(10, 2),
            nullable=False,
        ),
        sa.Column("stock", sa.Integer(), nullable=False),
        sa.CheckConstraint(
            "price >= 0",
            name="ck_products_price_nonnegative",
        ),
        sa.CheckConstraint(
            "stock >= 0",
            name="ck_products_stock_nonnegative",
        ),
    )

    op.create_table(
        "sales",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "sale_date",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column("status", sa.String(20), nullable=False),
    )

    op.create_table(
        "sale_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "sale_id",
            sa.Integer(),
            sa.ForeignKey("sales.id"),
            nullable=False,
        ),
        sa.Column(
            "product_id",
            sa.Integer(),
            sa.ForeignKey("products.id"),
            nullable=False,
        ),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column(
            "unit_price",
            sa.Numeric(10, 2),
            nullable=False,
        ),
        sa.CheckConstraint(
            "quantity > 0",
            name="ck_sale_items_quantity_positive",
        ),
        sa.CheckConstraint(
            "unit_price >= 0",
            name="ck_sale_items_price_nonnegative",
        ),
    )


def downgrade() -> None:
    op.drop_table("sale_items")
    op.drop_table("sales")
    op.drop_table("products")
