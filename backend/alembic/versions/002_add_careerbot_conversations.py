"""Add careerbot conversations table

Revision ID: 002
Revises: 001
Create Date: 2025-11-14 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create careerbot_conversations table
    op.create_table(
        'careerbot_conversations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(length=10), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('language', sa.String(length=10), server_default='en', nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_careerbot_conversations_id'), 'careerbot_conversations', ['id'], unique=False)
    op.create_index(op.f('ix_careerbot_conversations_user_id'), 'careerbot_conversations', ['user_id'], unique=False)


def downgrade() -> None:
    # Drop careerbot_conversations table
    op.drop_index(op.f('ix_careerbot_conversations_user_id'), table_name='careerbot_conversations')
    op.drop_index(op.f('ix_careerbot_conversations_id'), table_name='careerbot_conversations')
    op.drop_table('careerbot_conversations')

