"""
Migration script to add social media and website links to users table
"""
import sys
import os
import argparse
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def _build_session(database_url: str) -> Session:
    """Create a SQLAlchemy session for the provided database URL."""
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    return SessionLocal()


def upgrade(database_url: str | None = None):
    """Add linkedin_url, github_url, and website_url columns to users table"""
    load_dotenv()
    
    database_url = database_url or os.getenv(
        "DATABASE_URL", "postgresql://myuser:mypassword@localhost:5432/nutrimap"
    )
    
    db = _build_session(database_url)
    
    try:
        # Check if columns already exist
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name IN ('linkedin_url', 'github_url', 'website_url')
        """))
        existing_columns = [row[0] for row in result]
        
        if 'linkedin_url' not in existing_columns:
            print("Adding linkedin_url column...")
            db.execute(text("ALTER TABLE users ADD COLUMN linkedin_url VARCHAR(500)"))
            db.commit()
            print("✓ Added linkedin_url column")
        else:
            print("linkedin_url column already exists")
        
        if 'github_url' not in existing_columns:
            print("Adding github_url column...")
            db.execute(text("ALTER TABLE users ADD COLUMN github_url VARCHAR(500)"))
            db.commit()
            print("✓ Added github_url column")
        else:
            print("github_url column already exists")
        
        if 'website_url' not in existing_columns:
            print("Adding website_url column...")
            db.execute(text("ALTER TABLE users ADD COLUMN website_url VARCHAR(500)"))
            db.commit()
            print("✓ Added website_url column")
        else:
            print("website_url column already exists")
        
        print("Migration completed successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error adding columns: {e}")
        raise
    finally:
        db.close()


def downgrade(database_url: str | None = None):
    """Remove linkedin_url, github_url, and website_url columns from users table"""
    load_dotenv()
    
    database_url = database_url or os.getenv(
        "DATABASE_URL", "postgresql://myuser:mypassword@localhost:5432/nutrimap"
    )
    
    db = _build_session(database_url)
    
    try:
        print("Removing social link columns...")
        db.execute(text("ALTER TABLE users DROP COLUMN IF EXISTS linkedin_url"))
        db.execute(text("ALTER TABLE users DROP COLUMN IF EXISTS github_url"))
        db.execute(text("ALTER TABLE users DROP COLUMN IF EXISTS website_url"))
        db.commit()
        print("✓ Removed social link columns")
        
    except Exception as e:
        db.rollback()
        print(f"Error removing columns: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Add social media links to users table")
    parser.add_argument("--rollback", action="store_true", help="Rollback the migration")
    parser.add_argument(
        "--database-url",
        type=str,
        default=None,
        help="Database URL (defaults to DATABASE_URL env var or default connection string)",
    )
    args = parser.parse_args()
    
    if args.rollback:
        print("Rolling back migration...")
        downgrade(args.database_url)
    else:
        print("Running migration: add_social_links")
        upgrade(args.database_url)
        print("Migration completed!")

