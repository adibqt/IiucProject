"""add local opportunities

Revision ID: 006
Revises: 005
Create Date: 2025-01-15

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None


def upgrade():
    # Create local_opportunities table
    op.create_table(
        'local_opportunities',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('organization', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('location', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('target_track', sa.String(length=255), nullable=True),
        sa.Column('required_skills', sa.Text(), nullable=True),
        sa.Column('link', sa.String(length=1000), nullable=True),
        sa.Column('priority_group', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_local_opportunities_id'), 'local_opportunities', ['id'], unique=False)
    op.create_index(op.f('ix_local_opportunities_title'), 'local_opportunities', ['title'], unique=False)
    op.create_index(op.f('ix_local_opportunities_category'), 'local_opportunities', ['category'], unique=False)
    op.create_index(op.f('ix_local_opportunities_target_track'), 'local_opportunities', ['target_track'], unique=False)
    op.create_index(op.f('ix_local_opportunities_is_active'), 'local_opportunities', ['is_active'], unique=False)


def downgrade():
    # Drop local_opportunities table
    op.drop_index(op.f('ix_local_opportunities_is_active'), table_name='local_opportunities')
    op.drop_index(op.f('ix_local_opportunities_target_track'), table_name='local_opportunities')
    op.drop_index(op.f('ix_local_opportunities_category'), table_name='local_opportunities')
    op.drop_index(op.f('ix_local_opportunities_title'), table_name='local_opportunities')
    op.drop_index(op.f('ix_local_opportunities_id'), table_name='local_opportunities')
    op.drop_table('local_opportunities')

