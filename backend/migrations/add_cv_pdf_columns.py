"""
Migration script to add CV PDF storage columns to user_resumes table
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
    """Add cv_pdf_filename and cv_pdf_path columns to user_resumes table"""
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
            WHERE table_name='user_resumes' AND column_name IN ('cv_pdf_filename', 'cv_pdf_path')
        """))
        existing_columns = [row[0] for row in result]
        
        if 'cv_pdf_filename' not in existing_columns:
            print("Adding cv_pdf_filename column...")
            db.execute(text("ALTER TABLE user_resumes ADD COLUMN cv_pdf_filename VARCHAR(500)"))
            db.commit()
            print("✓ Added cv_pdf_filename column")
        else:
            print("cv_pdf_filename column already exists")
        
        if 'cv_pdf_path' not in existing_columns:
            print("Adding cv_pdf_path column...")
            db.execute(text("ALTER TABLE user_resumes ADD COLUMN cv_pdf_path VARCHAR(1000)"))
            db.commit()
            print("✓ Added cv_pdf_path column")
        else:
            print("cv_pdf_path column already exists")
        
    except Exception as e:
        db.rollback()
        print(f"Error adding columns: {e}")
        raise
    finally:
        db.close()


def downgrade(database_url: str | None = None):
    """Remove cv_pdf_filename and cv_pdf_path columns from user_resumes table"""
    load_dotenv()
    
    database_url = database_url or os.getenv(
        "DATABASE_URL", "postgresql://myuser:mypassword@localhost:5432/nutrimap"
    )
    
    db = _build_session(database_url)
    
    try:
        # Check if columns exist
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='user_resumes' AND column_name IN ('cv_pdf_filename', 'cv_pdf_path')
        """))
        existing_columns = [row[0] for row in result]
        
        if 'cv_pdf_path' in existing_columns:
            print("Dropping cv_pdf_path column...")
            db.execute(text("ALTER TABLE user_resumes DROP COLUMN cv_pdf_path"))
            db.commit()
            print("✓ Dropped cv_pdf_path column")
        else:
            print("cv_pdf_path column does not exist")
        
        if 'cv_pdf_filename' in existing_columns:
            print("Dropping cv_pdf_filename column...")
            db.execute(text("ALTER TABLE user_resumes DROP COLUMN cv_pdf_filename"))
            db.commit()
            print("✓ Dropped cv_pdf_filename column")
        else:
            print("cv_pdf_filename column does not exist")
        
    except Exception as e:
        db.rollback()
        print(f"Error dropping columns: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Add or remove CV PDF columns")
    parser.add_argument(
        "--database-url",
        type=str,
        help="Database URL (defaults to DATABASE_URL from .env)",
    )
    parser.add_argument(
        "--rollback",
        action="store_true",
        help="Rollback: remove the columns instead of adding them",
    )
    
    args = parser.parse_args()
    
    if args.rollback:
        downgrade(args.database_url)
    else:
        upgrade(args.database_url)

