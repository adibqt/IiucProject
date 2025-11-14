"""
Migration script to create user_resumes table
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
    """Create user_resumes table"""
    load_dotenv()
    
    database_url = database_url or os.getenv(
        "DATABASE_URL", "postgresql://myuser:mypassword@localhost:5432/nutrimap"
    )
    
    db = _build_session(database_url)
    
    try:
        # Check if table already exists
        result = db.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'user_resumes'
            )
        """))
        table_exists = result.scalar()
        
        if table_exists:
            print("user_resumes table already exists")
            return
        
        print("Creating user_resumes table...")
        
        # Create user_resumes table
        db.execute(text("""
            CREATE TABLE user_resumes (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL UNIQUE,
                personal_summary TEXT,
                experiences TEXT,
                education TEXT,
                skills TEXT,
                tools TEXT,
                projects TEXT,
                raw_cv_text TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_user_resumes_user_id 
                    FOREIGN KEY (user_id) 
                    REFERENCES users(id) 
                    ON DELETE CASCADE
            )
        """))
        
        # Create index on user_id for faster lookups
        db.execute(text("CREATE INDEX idx_user_resumes_user_id ON user_resumes(user_id)"))
        
        db.commit()
        print("✓ Created user_resumes table")
        print("✓ Created index on user_id")
        
    except Exception as e:
        db.rollback()
        print(f"Error creating table: {e}")
        raise
    finally:
        db.close()


def downgrade(database_url: str | None = None):
    """Drop user_resumes table"""
    load_dotenv()
    
    database_url = database_url or os.getenv(
        "DATABASE_URL", "postgresql://myuser:mypassword@localhost:5432/nutrimap"
    )
    
    db = _build_session(database_url)
    
    try:
        # Check if table exists
        result = db.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'user_resumes'
            )
        """))
        table_exists = result.scalar()
        
        if not table_exists:
            print("user_resumes table does not exist")
            return
        
        print("Dropping user_resumes table...")
        db.execute(text("DROP TABLE IF EXISTS user_resumes CASCADE"))
        db.commit()
        print("✓ Dropped user_resumes table")
        
    except Exception as e:
        db.rollback()
        print(f"Error dropping table: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create or drop user_resumes table")
    parser.add_argument(
        "--database-url",
        type=str,
        help="Database URL (defaults to DATABASE_URL from .env)",
    )
    parser.add_argument(
        "--rollback",
        action="store_true",
        help="Rollback: drop the table instead of creating it",
    )
    
    args = parser.parse_args()
    
    if args.rollback:
        downgrade(args.database_url)
    else:
        upgrade(args.database_url)

