"""Persist character size, keeping existing cats at their original size."""
from alembic import op
import sqlalchemy as sa

revision = "c814_size_control"
down_revision = "b7df617aefca"
branch_labels = None
depends_on = None

def upgrade():
    op.add_column("characters", sa.Column("scale", sa.Float(), nullable=False, server_default="1"))
    op.create_check_constraint("valid_character_scale", "characters", "scale >= 0.75 AND scale <= 1.5")

def downgrade():
    op.drop_constraint("valid_character_scale", "characters", type_="check")
    op.drop_column("characters", "scale")
