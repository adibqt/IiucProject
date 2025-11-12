"""Add user career fields

Revision ID: 001
Revises: 
Create Date: 2025-11-13 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to users table
    op.add_column('users', sa.Column('education_level', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('experience_level', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('preferred_career_track', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('skills', sa.Text, nullable=True))
    op.add_column('users', sa.Column('experiences', sa.Text, nullable=True))
    op.add_column('users', sa.Column('cv_text', sa.Text, nullable=True))
    op.add_column('users', sa.Column('learning_style', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('skill_level', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('interests', sa.Text, nullable=True))
    op.add_column('users', sa.Column('career_goals', sa.Text, nullable=True))


def downgrade() -> None:
    # Remove columns from users table
    op.drop_column('users', 'career_goals')
    op.drop_column('users', 'interests')
    op.drop_column('users', 'skill_level')
    op.drop_column('users', 'learning_style')
    op.drop_column('users', 'cv_text')
    op.drop_column('users', 'experiences')
    op.drop_column('users', 'skills')
    op.drop_column('users', 'preferred_career_track')
    op.drop_column('users', 'experience_level')
    op.drop_column('users', 'education_level')
