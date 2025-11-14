"""fix roadmap columns

Revision ID: 005
Revises: 004
Create Date: 2025-01-14

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade():
    # Check if roadmap_text exists and needs to be split
    # First, check if the columns already exist
    conn = op.get_bind()
    result = conn.execute(sa.text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'career_roadmaps' 
        AND column_name IN ('roadmap_text', 'roadmap_visual', 'roadmap_description')
    """))
    existing_columns = [row[0] for row in result]
    
    # If roadmap_text exists but roadmap_visual doesn't, we need to migrate
    if 'roadmap_text' in existing_columns and 'roadmap_visual' not in existing_columns:
        # Add new columns
        op.add_column('career_roadmaps', sa.Column('roadmap_visual', sa.Text(), nullable=True))
        op.add_column('career_roadmaps', sa.Column('roadmap_description', sa.Text(), nullable=True))
        
        # Copy data from roadmap_text to roadmap_visual (we'll split it later if needed)
        op.execute("""
            UPDATE career_roadmaps 
            SET roadmap_visual = roadmap_text,
                roadmap_description = 'Detailed description will be generated in future roadmaps.'
            WHERE roadmap_visual IS NULL
        """)
        
        # Make columns NOT NULL
        op.alter_column('career_roadmaps', 'roadmap_visual', nullable=False)
        op.alter_column('career_roadmaps', 'roadmap_description', nullable=False)
        
        # Drop old column
        op.drop_column('career_roadmaps', 'roadmap_text')
    
    # Remove is_current column if it exists (not in our model)
    if 'is_current' in existing_columns:
        op.drop_column('career_roadmaps', 'is_current')
    
    # Fix timeframe column length if needed
    op.alter_column('career_roadmaps', 'timeframe', type_=sa.String(length=100), existing_type=sa.String(length=50))


def downgrade():
    # Reverse the changes
    op.add_column('career_roadmaps', sa.Column('roadmap_text', sa.Text(), nullable=True))
    op.add_column('career_roadmaps', sa.Column('is_current', sa.Boolean(), nullable=True, server_default='true'))
    
    # Copy data back
    op.execute("""
        UPDATE career_roadmaps 
        SET roadmap_text = COALESCE(roadmap_visual, '') || E'\n\n' || COALESCE(roadmap_description, '')
    """)
    
    op.alter_column('career_roadmaps', 'roadmap_text', nullable=False)
    op.drop_column('career_roadmaps', 'roadmap_visual')
    op.drop_column('career_roadmaps', 'roadmap_description')
    op.alter_column('career_roadmaps', 'timeframe', type_=sa.String(length=50), existing_type=sa.String(length=100))

