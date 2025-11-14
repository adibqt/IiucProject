"""add career roadmaps

Revision ID: 004
Revises: 003
Create Date: 2025-01-14

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade():
    # Create career_roadmaps table
    op.create_table(
        'career_roadmaps',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('target_role', sa.String(length=255), nullable=False),
        sa.Column('timeframe', sa.String(length=100), nullable=False),
        sa.Column('weekly_hours', sa.Integer(), nullable=True),
        sa.Column('input_context', sa.Text(), nullable=True),
        sa.Column('roadmap_visual', sa.Text(), nullable=False),
        sa.Column('roadmap_description', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_career_roadmaps_id'), 'career_roadmaps', ['id'], unique=False)
    op.create_index(op.f('ix_career_roadmaps_user_id'), 'career_roadmaps', ['user_id'], unique=False)


def downgrade():
    # Drop career_roadmaps table
    op.drop_index(op.f('ix_career_roadmaps_user_id'), table_name='career_roadmaps')
    op.drop_index(op.f('ix_career_roadmaps_id'), table_name='career_roadmaps')
    op.drop_table('career_roadmaps')

