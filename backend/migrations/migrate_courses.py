"""
Migration script to update courses table structure
Run this once to add new columns to courses table
"""
import os
import sys

from sqlalchemy import text

try:
    from backend.database import engine  # type: ignore
except ModuleNotFoundError:
    sys.path.append(os.path.dirname(os.path.dirname(__file__)))
    from database import engine

def migrate_courses_table():
    with engine.connect() as conn:
        try:
            # Add new columns to courses table
            print("Migrating courses table...")
            
            # Add platform column
            conn.execute(text("""
                ALTER TABLE courses 
                ADD COLUMN IF NOT EXISTS platform VARCHAR(100)
            """))
            conn.commit()
            print("✓ Added platform column")
            
            # Add url column
            conn.execute(text("""
                ALTER TABLE courses 
                ADD COLUMN IF NOT EXISTS url VARCHAR(1000)
            """))
            conn.commit()
            print("✓ Added url column")
            
            # Add cost_type column
            conn.execute(text("""
                ALTER TABLE courses 
                ADD COLUMN IF NOT EXISTS cost_type VARCHAR(20)
            """))
            conn.commit()
            print("✓ Added cost_type column")
            
            # Add thumbnail_url column if not exists
            conn.execute(text("""
                ALTER TABLE courses 
                ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500)
            """))
            conn.commit()
            print("✓ Added/verified thumbnail_url column")
            
            # Add related_skills column (replaces prerequisites)
            conn.execute(text("""
                ALTER TABLE courses 
                ADD COLUMN IF NOT EXISTS related_skills TEXT
            """))
            conn.commit()
            print("✓ Added related_skills column")
            
            # Add views_count column
            conn.execute(text("""
                ALTER TABLE courses 
                ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0
            """))
            conn.commit()
            print("✓ Added views_count column")
            
            # Add enrollment_count column if not exists
            conn.execute(text("""
                ALTER TABLE courses 
                ADD COLUMN IF NOT EXISTS enrollment_count INTEGER DEFAULT 0
            """))
            conn.commit()
            print("✓ Added/verified enrollment_count column")
            
            # Add is_active column
            conn.execute(text("""
                ALTER TABLE courses 
                ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE
            """))
            conn.commit()
            print("✓ Added is_active column")
            
            # Drop old columns that are no longer needed
            try:
                conn.execute(text("""
                    ALTER TABLE courses 
                    DROP COLUMN IF EXISTS slug,
                    DROP COLUMN IF EXISTS short_description,
                    DROP COLUMN IF EXISTS difficulty_level,
                    DROP COLUMN IF EXISTS status,
                    DROP COLUMN IF EXISTS duration_hours,
                    DROP COLUMN IF EXISTS video_intro_url,
                    DROP COLUMN IF EXISTS course_content,
                    DROP COLUMN IF EXISTS prerequisites,
                    DROP COLUMN IF EXISTS learning_outcomes,
                    DROP COLUMN IF EXISTS target_audience,
                    DROP COLUMN IF EXISTS completion_rate,
                    DROP COLUMN IF EXISTS average_rating,
                    DROP COLUMN IF EXISTS is_published,
                    DROP COLUMN IF EXISTS published_at
                """))
                conn.commit()
                print("✓ Removed old unused columns")
            except Exception as e:
                print(f"Note: Some old columns may not exist (this is OK): {e}")
            
            print("\n✅ Courses table migration completed successfully!")
            
        except Exception as e:
            print(f"❌ Error during migration: {e}")
            conn.rollback()
            raise

if __name__ == "__main__":
    migrate_courses_table()
