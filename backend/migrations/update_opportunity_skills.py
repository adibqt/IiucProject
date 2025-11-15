"""
Update opportunity skills to use actual skill IDs from database
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from models import LocalOpportunity, Skill
import json

def update_opportunity_skills():
    """Update opportunities with correct skill IDs"""
    db = SessionLocal()
    
    try:
        # Get skill mapping
        skills = db.query(Skill).all()
        skills_map = {s.name.lower(): s.id for s in skills}
        
        # Map opportunity titles to appropriate skills
        opportunity_updates = {
            "Frontend Developer Internship": ["javascript", "html/css", "react"],
            "Data Science Bootcamp for Youth": ["python", "sql", "data analysis"],
            "Cybersecurity Training Program": ["python", "communication"],
            "Full-Stack Developer Position": ["javascript", "react", "python", "sql"],
            "Women in Tech Internship Program": ["javascript", "html/css", "react"],
            "Rural Youth Digital Skills Program": ["javascript", "html/css"],
            "Backend Developer Training": ["python", "sql", "javascript"],
            "Mobile App Development Internship": ["javascript", "react"],
            "Low-Income Youth Tech Scholarship": ["javascript", "html/css", "python"],
            "UI/UX Design Training Program": ["ui/ux design", "graphic design"]
        }
        
        updated_count = 0
        for opp in db.query(LocalOpportunity).all():
            if opp.title in opportunity_updates:
                skill_names = opportunity_updates[opp.title]
                skill_ids = []
                for skill_name in skill_names:
                    skill_id = skills_map.get(skill_name)
                    if skill_id:
                        skill_ids.append(skill_id)
                
                if skill_ids:
                    opp.required_skills = json.dumps(skill_ids)
                    updated_count += 1
                    print(f"Updated {opp.title}: {skill_ids}")
        
        db.commit()
        print(f"\n✅ Updated {updated_count} opportunities with correct skill IDs")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error updating opportunities: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Updating opportunity skills...")
    update_opportunity_skills()
    print("✅ Update complete!")

