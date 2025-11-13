"""
Script to seed jobs database with realistic entry-level opportunities
Run this after ensuring at least some skills are created in the admin panel
"""
import requests
import json

# Configuration
API_BASE_URL = "http://localhost:8000"

# Admin credentials (from initialization)
ADMIN_EMAIL = "admin@skillsync.com"
ADMIN_PASSWORD = "admin123"

def get_admin_token():
    """Authenticate as admin and get JWT token"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("access_token")
        else:
            print(f"❌ Admin login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error during admin login: {e}")
        return None


def get_skills():
    """Get all available skills"""
    try:
        response = requests.get(f"{API_BASE_URL}/api/skills")
        if response.status_code == 200:
            return response.json()
        else:
            print(f"⚠️  Could not fetch skills: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error fetching skills: {e}")
        return []


def seed_jobs(token):
    """Call the seed endpoint to populate jobs"""
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
            print(f"\n✅ Jobs seeded successfully!")
            print(f"   Seeded {data.get('seeded', 0)} jobs")
            print(f"   Job IDs: {data.get('ids', [])}")
            return True
        else:
            print(f"❌ Seeding failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        return False


def main():
    print("=" * 60)
    print("🌱 SkillSync Jobs Database Seeder")
    print("=" * 60)
    
    # Step 1: Check skills
    print("\n📋 Checking available skills...")
    skills = get_skills()
    
    if not skills:
        print("❌ ERROR: No skills found in database!")
        print("\n   Please create at least one skill in the admin panel first.")
        print("   1. Go to http://localhost:3000/admin")
        print("   2. Login with admin@skillsync.com / admin123")
        print("   3. Create some skills (e.g., Python, JavaScript, React, etc.)")
        print("   4. Then run this script again.")
        return False
    
    print(f"✅ Found {len(skills)} skills:")
    for skill in skills[:10]:  # Show first 10
        print(f"   - {skill.get('name')} (ID: {skill.get('id')})")
    if len(skills) > 10:
        print(f"   ... and {len(skills) - 10} more")
    
    # Step 2: Get admin token
    print("\n🔐 Authenticating as admin...")
    token = get_admin_token()
    
    if not token:
        print("❌ Failed to get admin token.")
        return False
    
    print("✅ Admin authenticated successfully")
    
    # Step 3: Seed jobs
    print("\n🌱 Seeding jobs database...")
    success = seed_jobs(token)
    
    if success:
        print("\n" + "=" * 60)
        print("✅ Job seeding completed successfully!")
        print("=" * 60)
        print("\nYou can now:")
        print("  1. Visit http://localhost:3000/jobs to see the job listings")
        print("  2. Use filters to find jobs by type, location, or skills")
        print("  3. Click on a job to view full details")
        return True
    else:
        print("\n❌ Job seeding failed. Check the errors above.")
        return False


if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
