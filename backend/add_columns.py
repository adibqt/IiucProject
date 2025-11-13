"""Add missing columns to users table"""
from sqlalchemy import text
from database import engine

with engine.connect() as conn:
    try:
        conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_description TEXT'))
        conn.commit()
        print('Added experience_description column')
    except Exception as e:
        print(f'experience_description: {e}')
    
    try:
        conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS career_interests TEXT'))
        conn.commit()
        print('Added career_interests column')
    except Exception as e:
        print(f'career_interests: {e}')
    
    try:
        conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS cv_text TEXT'))
        conn.commit()
        print('Added cv_text column')
    except Exception as e:
        print(f'cv_text: {e}')

print('Column migration completed')
