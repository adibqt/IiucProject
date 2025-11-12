"""
Migration script to add default skills and create jobs table
Run this after creating all tables
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database import engine, SessionLocal
from models import Skill, Job
import json

def upgrade():
    """Add default skills to the database"""
    db = SessionLocal()
    
    try:
        # Default skills to add
        default_skills = [
            {
                "name": "JavaScript",
                "slug": "javascript",
                "description": "Programming language for web development",
                "category": "Programming",
                "difficulty_level": "intermediate",
                "estimated_learning_hours": 100
            },
            {
                "name": "HTML/CSS",
                "slug": "html-css",
                "description": "Markup and styling languages for web pages",
                "category": "Programming",
                "difficulty_level": "beginner",
                "estimated_learning_hours": 50
            },
            {
                "name": "Python",
                "slug": "python",
                "description": "Versatile programming language for various applications",
                "category": "Programming",
                "difficulty_level": "beginner",
                "estimated_learning_hours": 80
            },
            {
                "name": "React",
                "slug": "react",
                "description": "JavaScript library for building user interfaces",
                "category": "Programming",
                "difficulty_level": "intermediate",
                "estimated_learning_hours": 60,
                "prerequisites": json.dumps(["JavaScript"])
            },
            {
                "name": "SQL",
                "slug": "sql",
                "description": "Language for managing and querying databases",
                "category": "Programming",
                "difficulty_level": "beginner",
                "estimated_learning_hours": 40
            },
            {
                "name": "Communication",
                "slug": "communication",
                "description": "Effective verbal and written communication skills",
                "category": "Soft Skills",
                "difficulty_level": "beginner",
                "estimated_learning_hours": 30
            },
            {
                "name": "Graphic Design",
                "slug": "graphic-design",
                "description": "Visual communication through design",
                "category": "Design",
                "difficulty_level": "intermediate",
                "estimated_learning_hours": 100
            },
            {
                "name": "UI/UX Design",
                "slug": "ui-ux-design",
                "description": "User interface and experience design",
                "category": "Design",
                "difficulty_level": "intermediate",
                "estimated_learning_hours": 120
            },
            {
                "name": "Data Analysis",
                "slug": "data-analysis",
                "description": "Analyzing and interpreting complex data",
                "category": "Analytics",
                "difficulty_level": "intermediate",
                "estimated_learning_hours": 90
            },
            {
                "name": "Microsoft Excel",
                "slug": "microsoft-excel",
                "description": "Spreadsheet software for data management",
                "category": "Business",
                "difficulty_level": "beginner",
                "estimated_learning_hours": 40
            },
            {
                "name": "Project Management",
                "slug": "project-management",
                "description": "Planning and executing projects effectively",
                "category": "Business",
                "difficulty_level": "intermediate",
                "estimated_learning_hours": 80
            },
            {
                "name": "Digital Marketing",
                "slug": "digital-marketing",
                "description": "Marketing products and services online",
                "category": "Marketing",
                "difficulty_level": "beginner",
                "estimated_learning_hours": 60
            }
        ]
        
        # Check if skills already exist
        existing_skills = db.query(Skill).count()
        
        if existing_skills == 0:
            print("Adding default skills...")
            for skill_data in default_skills:
                skill = Skill(**skill_data)
                db.add(skill)
            
            db.commit()
            print(f"✓ Successfully added {len(default_skills)} default skills")
        else:
            print(f"Skills already exist ({existing_skills} skills found). Skipping...")
        
    except Exception as e:
        db.rollback()
        print(f"Error adding default skills: {e}")
        raise
    finally:
        db.close()


def downgrade():
    """Remove default skills"""
    db = SessionLocal()
    
    try:
        # Delete default skills
        default_skill_slugs = [
            "javascript", "html-css", "python", "react", "sql",
            "communication", "graphic-design", "ui-ux-design",
            "data-analysis", "microsoft-excel", "project-management",
            "digital-marketing"
        ]
        
        deleted = db.query(Skill).filter(Skill.slug.in_(default_skill_slugs)).delete(synchronize_session=False)
        db.commit()
        print(f"✓ Removed {deleted} default skills")
        
    except Exception as e:
        db.rollback()
        print(f"Error removing default skills: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Running migration: add_default_skills_and_jobs")
    upgrade()
    print("Migration completed successfully!")
