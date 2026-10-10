"""add is_active to products

Revision ID: 1b457473e903
Revises: 6f06ab1a2b6d
Create Date: 2026-10-09 17:12:17.043811

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1b457473e903'
down_revision: Union[str, Sequence[str], None] = '6f06ab1a2b6d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "products",
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
    )


def downgrade() -> None:
    op.drop_column(
        "products",
        "is_active",
    )
