"""add careerbot sessions

Revision ID: 003
Revises: 002
Create Date: 2025-01-14

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    # Create careerbot_sessions table
    op.create_table(
        'careerbot_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=True, server_default='New Chat'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('last_message_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_careerbot_sessions_id'), 'careerbot_sessions', ['id'], unique=False)
    op.create_index(op.f('ix_careerbot_sessions_user_id'), 'careerbot_sessions', ['user_id'], unique=False)
    
    # Add session_id column to careerbot_conversations
    # First, create a default session for each user with existing messages
    op.execute("""
        INSERT INTO careerbot_sessions (user_id, title, created_at, updated_at, last_message_at)
        SELECT DISTINCT user_id, 'Previous Chat', MIN(created_at), MAX(updated_at), MAX(created_at)
        FROM careerbot_conversations
        GROUP BY user_id
    """)
    
    # Add session_id column (nullable first)
    op.add_column('careerbot_conversations', sa.Column('session_id', sa.Integer(), nullable=True))
    
    # Populate session_id for existing messages
    op.execute("""
        UPDATE careerbot_conversations cc
        SET session_id = (
            SELECT id FROM careerbot_sessions cs
            WHERE cs.user_id = cc.user_id
            LIMIT 1
        )
    """)
    
    # Make session_id NOT NULL
    op.alter_column('careerbot_conversations', 'session_id', nullable=False)
    
    # Add foreign key constraint
    op.create_foreign_key(
        'fk_careerbot_conversations_session_id',
        'careerbot_conversations',
        'careerbot_sessions',
        ['session_id'],
        ['id'],
        ondelete='CASCADE'
    )
    
    # Create index on session_id
    op.create_index(op.f('ix_careerbot_conversations_session_id'), 'careerbot_conversations', ['session_id'], unique=False)


def downgrade():
    # Remove foreign key and column from careerbot_conversations
    op.drop_index(op.f('ix_careerbot_conversations_session_id'), table_name='careerbot_conversations')
    op.drop_constraint('fk_careerbot_conversations_session_id', 'careerbot_conversations', type_='foreignkey')
    op.drop_column('careerbot_conversations', 'session_id')
    
    # Drop careerbot_sessions table
    op.drop_index(op.f('ix_careerbot_sessions_user_id'), table_name='careerbot_sessions')
    op.drop_index(op.f('ix_careerbot_sessions_id'), table_name='careerbot_sessions')
    op.drop_table('careerbot_sessions')

