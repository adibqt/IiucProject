"""
Seed script to add sample local opportunities to the database
Run this script to populate the local_opportunities table with sample data
"""
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from models import LocalOpportunity
import json

def seed_opportunities():
    """Add sample local opportunities"""
    db = SessionLocal()
    
    try:
        # Check if opportunities already exist
        existing_count = db.query(LocalOpportunity).count()
        if existing_count > 0:
            print(f"Database already has {existing_count} opportunities. Skipping seed.")
            return
        
        # Sample opportunities - focused on Bangladesh/local context
        opportunities = [
            {
                "title": "Frontend Developer Internship",
                "organization": "TechStart Bangladesh",
                "description": "6-month paid internship for frontend developers. Work on real projects using React, Vue.js, and modern web technologies. Perfect for students and recent graduates looking to gain industry experience.",
                "location": "Dhaka, Bangladesh",
                "category": "Internship",
                "target_track": "Frontend",
                "required_skills": json.dumps([1, 2, 3]),  # Assuming skill IDs - adjust based on your skills table
                "link": "https://techstart.com/careers/internship",
                "priority_group": "All Youth",
                "is_active": True
            },
            {
                "title": "Data Science Bootcamp for Youth",
                "organization": "Youth Skills Academy",
                "description": "Free 3-month intensive bootcamp in data science and machine learning. Includes Python, SQL, data analysis, and ML fundamentals. Designed for youth from underserved communities. Certificate provided upon completion.",
                "location": "Chittagong, Bangladesh",
                "category": "Training",
                "target_track": "Data Science",
                "required_skills": json.dumps([5, 6, 7]),  # Adjust skill IDs
                "link": "https://youthskills.org/bootcamp",
                "priority_group": "Rural Youth",
                "is_active": True
            },
            {
                "title": "Cybersecurity Training Program",
                "organization": "Digital Security Foundation",
                "description": "Comprehensive cybersecurity training program covering ethical hacking, network security, and digital forensics. Open to all youth interested in cybersecurity careers. Includes hands-on labs and industry mentorship.",
                "location": "Dhaka, Bangladesh",
                "category": "Training",
                "target_track": "Cybersecurity",
                "required_skills": json.dumps([8, 9, 10]),  # Adjust skill IDs
                "link": "https://digisec.org/training",
                "priority_group": "All Youth",
                "is_active": True
            },
            {
                "title": "Full-Stack Developer Position",
                "organization": "InnovateTech Solutions",
                "description": "Entry-level full-stack developer position. Work with Node.js, React, and PostgreSQL. Great opportunity for recent graduates or self-taught developers. Competitive salary and growth opportunities.",
                "location": "Dhaka, Bangladesh",
                "category": "Job",
                "target_track": "Full-Stack",
                "required_skills": json.dumps([1, 2, 11, 12]),  # Adjust skill IDs
                "link": "https://innovatetech.com/careers",
                "priority_group": "All Youth",
                "is_active": True
            },
            {
                "title": "Women in Tech Internship Program",
                "organization": "WomenTech Bangladesh",
                "description": "Specialized 4-month internship program designed for women entering the tech industry. Includes mentorship, skill development, and guaranteed interview opportunities. Focus on web development and software engineering.",
                "location": "Dhaka, Bangladesh",
                "category": "Internship",
                "target_track": "Frontend",
                "required_skills": json.dumps([1, 2, 3]),  # Adjust skill IDs
                "link": "https://womentech.org/internship",
                "priority_group": "Women",
                "is_active": True
            },
            {
                "title": "Rural Youth Digital Skills Program",
                "organization": "Rural Development Initiative",
                "description": "Free digital skills training program for rural youth. Covers basic programming, web development, and digital literacy. Includes job placement assistance and ongoing support. Transportation and meals provided.",
                "location": "Sylhet, Bangladesh",
                "category": "Youth Program",
                "target_track": "Frontend",
                "required_skills": json.dumps([1, 2]),  # Adjust skill IDs
                "link": "https://ruraldev.org/digital-skills",
                "priority_group": "Rural Youth",
                "is_active": True
            },
            {
                "title": "Backend Developer Training",
                "organization": "Code Academy BD",
                "description": "Intensive 3-month backend development training covering Node.js, Python, databases, and API development. Project-based learning with real-world applications. Suitable for beginners and intermediate learners.",
                "location": "Dhaka, Bangladesh",
                "category": "Training",
                "target_track": "Backend",
                "required_skills": json.dumps([11, 12, 13]),  # Adjust skill IDs
                "link": "https://codeacademybd.com/backend",
                "priority_group": "All Youth",
                "is_active": True
            },
            {
                "title": "Mobile App Development Internship",
                "organization": "AppDev Studio",
                "description": "6-month internship in mobile app development using React Native and Flutter. Work on live projects, learn industry best practices, and build your portfolio. Stipend provided.",
                "location": "Dhaka, Bangladesh",
                "category": "Internship",
                "target_track": "Mobile Development",
                "required_skills": json.dumps([14, 15]),  # Adjust skill IDs
                "link": "https://appdev.com/internship",
                "priority_group": "All Youth",
                "is_active": True
            },
            {
                "title": "Low-Income Youth Tech Scholarship",
                "organization": "Tech for All Foundation",
                "description": "Full scholarship program for low-income youth to learn software development. Includes free training, mentorship, and job placement support. Open to youth from economically disadvantaged backgrounds.",
                "location": "Multiple Cities, Bangladesh",
                "category": "Youth Program",
                "target_track": "Full-Stack",
                "required_skills": json.dumps([1, 2, 11]),  # Adjust skill IDs
                "link": "https://techforall.org/scholarship",
                "priority_group": "Low-Income",
                "is_active": True
            },
            {
                "title": "UI/UX Design Training Program",
                "organization": "Design Hub Bangladesh",
                "description": "Comprehensive UI/UX design training covering Figma, Adobe XD, user research, and design principles. Perfect for creative individuals interested in design careers. Portfolio development included.",
                "location": "Dhaka, Bangladesh",
                "category": "Training",
                "target_track": "Design",
                "required_skills": json.dumps([16, 17]),  # Adjust skill IDs
                "link": "https://designhub.com/training",
                "priority_group": "All Youth",
                "is_active": True
            }
        ]
        
        # Add opportunities to database
        for opp_data in opportunities:
            opportunity = LocalOpportunity(**opp_data)
            db.add(opportunity)
        
        db.commit()
        print(f"✅ Successfully added {len(opportunities)} sample local opportunities!")
        print("\nOpportunities added:")
        for opp in opportunities:
            print(f"  - {opp['title']} ({opp['category']}) - {opp['organization']}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding opportunities: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Seeding local opportunities database...")
    seed_opportunities()
    print("\n✅ Seeding complete!")

