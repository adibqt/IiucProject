# Database Migration Guide

This guide explains how to create and run database migrations for the new user authentication features.

## Overview

The user authentication implementation adds new fields to the existing `User` model:

- `education_level`
- `experience_level` (with ExperienceLevel enum)
- `preferred_career_track`
- `skills` (JSON)
- `experiences` (JSON)
- `cv_text`

## Prerequisites

- Alembic installed (already in requirements.txt)
- PostgreSQL database running
- Backend virtual environment activated

## Step-by-Step Migration

### 1. Generate Migration Script

Run Alembic to auto-generate a migration based on model changes:

```bash
cd backend
alembic revision --autogenerate -m "Add user career fields"
```

This creates a new migration file in `alembic/versions/` directory.

### 2. Review Generated Migration

Open the created migration file (e.g., `alembic/versions/001_add_user_career_fields.py`) and verify:

```python
"""Add user career fields

Revision ID: abc123def456
Revises: <previous_revision>
Create Date: 2025-11-12 10:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

def upgrade() -> None:
    """Add new columns to users table"""
    op.add_column('users', sa.Column('education_level', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('experience_level', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('preferred_career_track', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('skills', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('experiences', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('cv_text', sa.Text(), nullable=True))

def downgrade() -> None:
    """Remove added columns"""
    op.drop_column('users', 'cv_text')
    op.drop_column('users', 'experiences')
    op.drop_column('users', 'skills')
    op.drop_column('users', 'preferred_career_track')
    op.drop_column('users', 'experience_level')
    op.drop_column('users', 'education_level')
```

### 3. Run Migration

Apply the migration to the database:

```bash
alembic upgrade head
```

**Expected output:**

```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl with target metadata
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade <old_revision> -> <new_revision>, Add user career fields
```

### 4. Verify Migration

Check that new columns were added:

```bash
psql -U myuser -d nutrimap -c "\d users"
```

Or using Python:

```python
from sqlalchemy import inspect
from database import engine

inspector = inspect(engine)
columns = inspector.get_columns('users')
for col in columns:
    print(f"{col['name']}: {col['type']}")
```

## Rollback (If Needed)

To rollback to previous version:

```bash
alembic downgrade -1
```

## Migration Files Explanation

### Alembic Structure

```
backend/alembic/
├── env.py                 # Alembic configuration
├── script.py.mako         # Migration template
├── versions/              # Migration scripts
│   ├── 001_initial_setup.py
│   ├── 002_add_admin_fields.py
│   └── 003_add_user_career_fields.py  # (NEW)
└── alembic.ini           # Alembic settings
```

### Database URL in alembic.ini

The migration uses `DATABASE_URL` from environment:

```ini
# In alembic.ini
sqlalchemy.url = driver://user:password@localhost/dbname
# Actually loads from .env via env.py
```

### env.py Configuration

The `alembic/env.py` file:

- Loads DATABASE_URL from .env
- Detects model changes automatically
- Manages upgrade/downgrade operations

## Migration Workflow

```
1. Update models.py with new fields
   ↓
2. Run: alembic revision --autogenerate -m "description"
   ↓
3. Review generated migration file
   ↓
4. Run: alembic upgrade head
   ↓
5. Database schema updated
   ↓
6. Application can use new fields
```

## Common Migration Issues

### Issue: "target database is not up to date"

```bash
# Ensure alembic table exists
alembic stamp head
alembic upgrade head
```

### Issue: "Could not locate requested migration"

```bash
# Regenerate migration script
alembic revision --autogenerate -m "Fix migration"
```

### Issue: Migration doesn't include all changes

```bash
# Run with verbose output
alembic revision --autogenerate -m "Sync" --verbose
```

## Checking Migration Status

```bash
# View current revision
alembic current

# View migration history
alembic history

# View pending migrations
alembic history -r<current_revision>:head
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] Test migration on local database
- [ ] Test on staging database
- [ ] Verify rollback procedure works
- [ ] Backup production database
- [ ] Schedule maintenance window

### Deployment Steps

```bash
# 1. Backup current database
pg_dump nutrimap > backup_$(date +%Y%m%d).sql

# 2. Pull latest code
git pull origin main

# 3. Install new dependencies (if any)
pip install -r requirements.txt

# 4. Run migration
alembic upgrade head

# 5. Verify migration
psql -U myuser -d nutrimap -c "\d users"

# 6. Restart application
systemctl restart nutrimap-backend
```

## Manual Migration (If Alembic Fails)

If auto-generation doesn't work, create manual migration:

```bash
alembic revision -m "Add career fields"
```

Edit the generated file with SQL operations:

```python
def upgrade() -> None:
    op.add_column('users', sa.Column('education_level', sa.String(100)))
    op.add_column('users', sa.Column('experience_level', sa.String(50)))
    op.add_column('users', sa.Column('preferred_career_track', sa.String(255)))
    op.add_column('users', sa.Column('skills', sa.Text()))
    op.add_column('users', sa.Column('experiences', sa.Text()))
    op.add_column('users', sa.Column('cv_text', sa.Text()))

def downgrade() -> None:
    op.drop_column('users', 'education_level')
    op.drop_column('users', 'experience_level')
    op.drop_column('users', 'preferred_career_track')
    op.drop_column('users', 'skills')
    op.drop_column('users', 'experiences')
    op.drop_column('users', 'cv_text')
```

## Docker-Based Migration

If using Docker Compose:

```bash
# Run migration in container
docker-compose exec backend alembic upgrade head

# Or
docker-compose run --rm backend alembic upgrade head
```

## Testing New Fields

After migration, test new fields:

```python
from models import User
from database import SessionLocal

db = SessionLocal()

# Create user with new fields
user = User(
    email="test@example.com",
    username="testuser",
    hashed_password="...",
    full_name="Test User",
    education_level="Bachelor's",
    experience_level="fresher",
    preferred_career_track="Web Development",
    skills='["JavaScript", "React"]'
)

db.add(user)
db.commit()
db.refresh(user)

print(f"User created: {user.full_name}")
print(f"Career track: {user.preferred_career_track}")
print(f"Skills: {user.skills}")
```

## Verifying Schema

### Via psql

```sql
-- View users table structure
\d users

-- Check specific column
\d+ users education_level

-- View table DDL
SELECT * FROM information_schema.columns
WHERE table_name = 'users';
```

### Via Python

```python
from sqlalchemy import inspect
from database import engine

inspector = inspect(engine)
columns = [c['name'] for c in inspector.get_columns('users')]
print("Users table columns:", columns)

expected = ['education_level', 'experience_level', 'preferred_career_track',
            'skills', 'experiences', 'cv_text']
missing = [col for col in expected if col not in columns]
if missing:
    print(f"Missing columns: {missing}")
else:
    print("All career fields present!")
```

## Troubleshooting

### Migration fails with "table users already exists"

If you're starting fresh, ensure alembic metadata is clean:

```bash
# Drop and recreate alembic table
alembic stamp --sql head  # Shows SQL without executing
alembic stamp head        # Actually executes
```

### Can't connect to database

Check DATABASE_URL in .env:

```bash
# Verify connection
psql $DATABASE_URL -c "SELECT version();"
```

### Enum column issues

If experience_level enum not recognized:

```python
# In env.py, ensure this is set
target_metadata = Base.metadata

# In models.py, check enum definition
from enum import Enum
class ExperienceLevel(str, Enum):
    FRESHER = "fresher"
    # ...
```

## Advanced Topics

### Creating Indexed Migrations

For performance, add indexes to frequently queried columns:

```python
def upgrade() -> None:
    op.create_index('ix_users_education_level', 'users', ['education_level'])
    op.create_index('ix_users_experience_level', 'users', ['experience_level'])
```

### Data Migration Script

If you need to populate new columns with default data:

```python
def upgrade() -> None:
    # Add columns
    op.add_column('users', sa.Column('experience_level', sa.String(50)))

    # Set default values
    op.execute("UPDATE users SET experience_level = 'fresher' WHERE experience_level IS NULL")

def downgrade() -> None:
    op.drop_column('users', 'experience_level')
```

### Conditional Migrations

For multi-environment deployments:

```python
import os

def upgrade() -> None:
    # Only run on production
    if os.getenv('ENVIRONMENT') == 'production':
        op.add_column('users', sa.Column('audit_log', sa.Text()))
```

---

## Summary

The user authentication implementation requires these database changes:

| Column                 | Type         | Default | Nullable |
| ---------------------- | ------------ | ------- | -------- |
| education_level        | VARCHAR(100) | -       | Yes      |
| experience_level       | VARCHAR(50)  | fresher | Yes      |
| preferred_career_track | VARCHAR(255) | -       | Yes      |
| skills                 | TEXT         | -       | Yes      |
| experiences            | TEXT         | -       | Yes      |
| cv_text                | TEXT         | -       | Yes      |

Use the migration commands above to apply these changes to your database.

---

**Next:** Run the migration and then test the user authentication endpoints!
