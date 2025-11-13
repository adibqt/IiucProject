"""
Simple script to seed initial skills and then seed jobs
Run this script to populate the database with skills and jobs
"""
import requests
import json
import time

# Configuration
API_BASE_URL = "http://localhost:8000"
ADMIN_EMAIL = "admin@skillsync.com"
ADMIN_PASSWORD = "admin123"

def get_admin_token():
    """Authenticate as admin and get JWT token"""
    print("🔐 Authenticating as admin...")
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            print("✅ Admin authenticated successfully")
            return token
        else:
            print(f"❌ Admin login failed: {response.status_code}")
            if response.text:
                print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error during admin login: {e}")
        return None

def check_skills():
    """Check if skills exist in the database"""
    print("\n📋 Checking existing skills...")
    try:
        response = requests.get(f"{API_BASE_URL}/api/skills")
        if response.status_code == 200:
            skills = response.json()
            print(f"✅ Found {len(skills)} existing skills")
            return skills
        else:
            print(f"⚠️  Could not fetch skills")
            return []
    except Exception as e:
        print(f"❌ Error fetching skills: {e}")
        return []

def create_skill(token, name, slug, description, category, difficulty="beginner"):
    """Create a single skill"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(
            f"{API_BASE_URL}/api/admin/skills",
            headers=headers,
            json={
                "name": name,
                "slug": slug,
                "description": description,
                "category": category,
                "difficulty_level": difficulty
            }
        )
        if response.status_code == 200:
            skill = response.json()
            print(f"   ✅ Created: {name} (ID: {skill.get('id')})")
            return skill.get('id')
        elif response.status_code == 400:
            # Skill might already exist
            print(f"   ⚠️  {name} - Already exists or invalid data")
            return None
        else:
            print(f"   ❌ Failed to create {name}: {response.status_code}")
            return None
    except Exception as e:
        print(f"   ❌ Error creating {name}: {e}")
        return None

def seed_skills(token):
    """Create essential skills for entry-level positions"""
    print("\n🌱 Creating skills...")
    
    skills_to_create = [
        ("Python", "python", "A versatile programming language", "Programming", "beginner"),
        ("JavaScript", "javascript", "Web development language", "Programming", "beginner"),
        ("React", "react", "JavaScript library for building UIs", "Frontend", "intermediate"),
        ("Node.js", "nodejs", "JavaScript runtime for backend", "Backend", "intermediate"),
        ("HTML", "html", "Markup language for web pages", "Frontend", "beginner"),
        ("CSS", "css", "Styling language for web pages", "Frontend", "beginner"),
        ("SQL", "sql", "Database query language", "Database", "intermediate"),
        ("MongoDB", "mongodb", "NoSQL database", "Database", "intermediate"),
        ("Git", "git", "Version control system", "DevOps", "beginner"),
        ("Docker", "docker", "Containerization platform", "DevOps", "intermediate"),
        ("AWS", "aws", "Amazon Web Services cloud platform", "Cloud", "intermediate"),
        ("Java", "java", "Enterprise programming language", "Programming", "intermediate"),
        ("C++", "cpp", "Systems programming language", "Programming", "advanced"),
        ("Android Development", "android", "Mobile development for Android", "Mobile", "intermediate"),
        ("iOS Development", "ios", "Mobile development for iOS", "Mobile", "advanced"),
        ("UI/UX Design", "uiux", "User interface and experience design", "Design", "intermediate"),
        ("Machine Learning", "ml", "AI and predictive modeling", "AI", "advanced"),
        ("Kubernetes", "kubernetes", "Container orchestration", "DevOps", "advanced"),
        ("GraphQL", "graphql", "Query language for APIs", "Backend", "intermediate"),
        ("Linux", "linux", "Open-source operating system", "DevOps", "intermediate"),
    ]
    
    created_ids = []
    for name, slug, desc, category, difficulty in skills_to_create:
        skill_id = create_skill(token, name, slug, desc, category, difficulty)
        if skill_id:
            created_ids.append(skill_id)
        time.sleep(0.2)  # Small delay between requests
    
    return created_ids

def seed_jobs(token):
    """Call the enhanced seed endpoint to populate jobs"""
    print("\n🌱 Seeding jobs database...")
    if not token:
        print("❌ No valid admin token. Cannot seed jobs.")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(
            f"{API_BASE_URL}/api/jobs/seed",
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Jobs seeded successfully!")
            print(f"   Created {data.get('seeded', 0)} jobs")
            print(f"   Job IDs: {data.get('ids', [])[:10]}{'...' if len(data.get('ids', [])) > 10 else ''}")
            return True
        else:
            print(f"❌ Seeding failed: {response.status_code}")
            if response.text:
                print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        return False

def main():
    print("=" * 70)
    print("🌱 SkillSync Database Seeder - Skills & Jobs")
    print("=" * 70)
    
    # Step 1: Check if admin user exists
    print("\n📋 Checking admin access...")
    token = get_admin_token()
    
    if not token:
        print("\n❌ ERROR: Cannot authenticate as admin!")
        print("\n   Please make sure:")
        print("   1. Backend is running: docker-compose up -d")
        print("   2. Admin user is initialized: POST http://localhost:8000/api/admin/init")
        print("   3. Check backend logs for issues")
        return False
    
    # Step 2: Check existing skills
    existing_skills = check_skills()
    
    if not existing_skills:
        print("\n📚 No skills found. Creating initial skills...")
        created_ids = seed_skills(token)
        
        if not created_ids:
            print("\n⚠️  No skills were created. Check errors above.")
            return False
        
        print(f"\n✅ Created {len(created_ids)} skills")
    else:
        print(f"✅ Using existing {len(existing_skills)} skills")
    
    # Step 3: Seed jobs
    time.sleep(1)  # Wait for database operations
    success = seed_jobs(token)
    
    if success:
        print("\n" + "=" * 70)
        print("✅ Database seeding completed successfully!")
        print("=" * 70)
        print("\n🎯 Next steps:")
        print("   1. Visit http://localhost:3000/login to access the app")
        print("   2. Create a user account")
        print("   3. Go to /jobs to see the seeded job listings")
        print("   4. Try filters and search functionality")
        return True
    else:
        print("\n❌ Job seeding failed. Check the errors above.")
        return False

if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
