"""
Job routes - public and admin job endpoints
This file creates a router that can be included into main.py
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models import Job, Skill, User, AdminLog
from schemas import JobCreate, JobUpdate, JobResponse
from api_users import get_current_user
from job_service import create_job, validate_skills_exist
from services.matching_service import match_jobs_to_user
import json
from datetime import datetime

router = APIRouter()


@router.get("/api/jobs", response_model=list[JobResponse])
def list_jobs_public(skip: int = 0, limit: int = 50, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """List active jobs. Protected: requires authenticated user."""
    jobs = db.query(Job).filter(Job.is_active == True).offset(skip).limit(limit).all()
    return jobs


@router.get("/api/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = db.query(Job).filter(Job.id == job_id, Job.is_active == True).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    job.views_count += 1
    db.commit()
    return job


@router.get("/api/skills")
def list_skills_public(db: Session = Depends(get_db)):
    """Public list of active skills for filters and selection"""
    skills = db.query(Skill).filter(Skill.is_active == True).all()
    return skills


def _log_admin_action(db: Session, admin_id: int, action: str, target_type: str = None, target_id: int = None, details: str = None):
    log = AdminLog(
        admin_id=admin_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        details=details,
        created_at=datetime.utcnow()
    )
    db.add(log)
    db.commit()


@router.post("/api/jobs/seed", response_model=dict)
def seed_jobs(db: Session = Depends(get_db), admin: User = Depends(get_current_user)):
    """Seed sample job postings (admin only) with 20+ realistic entry-level opportunities"""
    # ensure admin
    if admin.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    # Get all available skills to link with jobs
    skills = db.query(Skill).all()
    skill_ids = [s.id for s in skills]
    
    if not skill_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot seed jobs without skills. Please create skills first in admin panel."
        )
    
    import random
    
    # Realistic entry-level job data
    jobs_data = [
        {
            "title": "Junior Frontend Developer",
            "company_name": "TechStart Solutions",
            "description": "Join our team to build responsive web applications. You'll work with React, learn best practices, and contribute to real projects from day one.",
            "location": "Remote",
            "job_type": "Full-time",
            "experience_level": "fresher",
            "requirements": "HTML, CSS, JavaScript, familiarity with React preferred but not required",
            "responsibilities": "Develop UI components, collaborate with design team, write clean code, participate in code reviews",
            "salary_range": "$25,000 - $35,000 per year"
        },
        {
            "title": "Backend Developer Intern",
            "company_name": "DataFlow Systems",
            "description": "3-month internship working on backend services and APIs. Perfect opportunity to learn industry practices and build your portfolio.",
            "location": "Dhaka, BD",
            "job_type": "Internship",
            "experience_level": "fresher",
            "requirements": "Basic Python or Java, SQL knowledge, enthusiasm to learn",
            "responsibilities": "Develop API endpoints, write unit tests, optimize database queries, documentation",
            "salary_range": "Unpaid/Stipend $200-400/month"
        },
        {
            "title": "QA Tester (Entry-Level)",
            "company_name": "QualityAssure Inc",
            "description": "Help ensure our products are bug-free. No prior QA experience needed - we'll train you on testing frameworks and methodologies.",
            "location": "Remote",
            "job_type": "Part-time",
            "experience_level": "fresher",
            "requirements": "Attention to detail, basic understanding of software, willingness to learn",
            "responsibilities": "Manual testing, test case creation, bug reporting, regression testing",
            "salary_range": "$15 - $25 per hour"
        },
        {
            "title": "Full Stack Developer (Junior)",
            "company_name": "WebXcel Solutions",
            "description": "Build complete web applications from frontend to backend. Work with modern tech stack and mentor with experienced developers.",
            "location": "Lagos, NG",
            "job_type": "Full-time",
            "experience_level": "junior",
            "requirements": "JavaScript, HTML/CSS, Node.js or Python, relational databases",
            "responsibilities": "Develop features, debug issues, write tests, collaborate with team",
            "salary_range": "$30,000 - $45,000 per year"
        },
        {
            "title": "UI/UX Design Assistant",
            "company_name": "DesignHub Creative",
            "description": "Support our design team in creating beautiful user experiences. Work with Figma, conduct user research, and prototype new features.",
            "location": "Remote",
            "job_type": "Part-time",
            "experience_level": "fresher",
            "requirements": "Basic design sense, familiarity with Figma or Adobe XD, communication skills",
            "responsibilities": "Design mockups, user research, prototype creation, design documentation",
            "salary_range": "$12 - $20 per hour"
        },
        {
            "title": "Data Analyst Intern",
            "company_name": "InsightData Analytics",
            "description": "Work with real data and learn analytics. You'll clean data, create dashboards, and provide insights using Python and SQL.",
            "location": "Remote",
            "job_type": "Internship",
            "experience_level": "fresher",
            "requirements": "Python basics, SQL, Excel, interest in data",
            "responsibilities": "Data cleaning, visualization, SQL queries, report generation",
            "salary_range": "Unpaid/Stipend $150-300/month"
        },
        {
            "title": "Mobile App Developer (React Native)",
            "company_name": "AppVenture Mobile",
            "description": "Create mobile applications using React Native. Work on both iOS and Android platforms with our supportive team.",
            "location": "Remote",
            "job_type": "Full-time",
            "experience_level": "junior",
            "requirements": "JavaScript, React knowledge, understanding of mobile development",
            "responsibilities": "Develop app features, fix bugs, optimize performance, user testing",
            "salary_range": "$28,000 - $42,000 per year"
        },
        {
            "title": "Technical Writer (Freelance)",
            "company_name": "DocuTech Solutions",
            "description": "Write technical documentation, API guides, and tutorials. Flexible freelance work, work at your own pace.",
            "location": "Remote",
            "job_type": "Freelance",
            "experience_level": "fresher",
            "requirements": "Strong writing skills, ability to understand technical concepts, basic markdown",
            "responsibilities": "Write documentation, create guides, technical editing, user feedback incorporation",
            "salary_range": "$20 - $40 per article"
        },
        {
            "title": "DevOps Engineer (Entry-Level)",
            "company_name": "CloudInfra Services",
            "description": "Start your DevOps journey managing cloud infrastructure. Learn Docker, Kubernetes, and CI/CD pipelines.",
            "location": "Nairobi, KE",
            "job_type": "Full-time",
            "experience_level": "fresher",
            "requirements": "Linux basics, understanding of cloud platforms (AWS/GCP), scripting knowledge",
            "responsibilities": "Deploy applications, manage infrastructure, monitor systems, troubleshoot issues",
            "salary_range": "$32,000 - $48,000 per year"
        },
        {
            "title": "Software Test Automation Intern",
            "company_name": "AutoTest Labs",
            "description": "Learn test automation using Selenium and other tools. Work on real projects and improve software quality.",
            "location": "Remote",
            "job_type": "Internship",
            "experience_level": "fresher",
            "requirements": "Basic programming, knowledge of test automation tools, problem-solving skills",
            "responsibilities": "Write automation tests, test framework development, bug identification",
            "salary_range": "Unpaid/Stipend $250-350/month"
        },
        {
            "title": "Business Analyst (Entry-Level)",
            "company_name": "BizTech Consulting",
            "description": "Analyze business requirements and translate them into technical solutions. Collaborate with stakeholders and development teams.",
            "location": "Remote",
            "job_type": "Full-time",
            "experience_level": "fresher",
            "requirements": "Analytical thinking, communication skills, basic SQL knowledge helpful",
            "responsibilities": "Requirements gathering, documentation, stakeholder communication, testing coordination",
            "salary_range": "$24,000 - $35,000 per year"
        },
        {
            "title": "PHP Web Developer",
            "company_name": "WebBuilder Pro",
            "description": "Develop web applications using PHP and Laravel. Work on interesting projects with a collaborative team.",
            "location": "Remote",
            "job_type": "Full-time",
            "experience_level": "junior",
            "requirements": "PHP, Laravel framework, MySQL, HTML/CSS",
            "responsibilities": "Build web applications, code reviews, database design, API development",
            "salary_range": "$26,000 - $40,000 per year"
        },
        {
            "title": "Graphic Designer (Contract)",
            "company_name": "Creative Studios",
            "description": "Create visual designs for web and mobile applications. 6-month contract position with potential for extension.",
            "location": "Remote",
            "job_type": "Freelance",
            "experience_level": "fresher",
            "requirements": "Adobe Creative Suite, design principles, portfolio samples",
            "responsibilities": "UI design, branding, graphic creation, design collaboration",
            "salary_range": "$1500 - $2500 per month"
        },
        {
            "title": "Python Developer Intern",
            "company_name": "CodeCraft Academy",
            "description": "Build backend services and learn software engineering best practices. Mentorship-focused internship.",
            "location": "Dhaka, BD",
            "job_type": "Internship",
            "experience_level": "fresher",
            "requirements": "Python programming, basic web frameworks, eager to learn",
            "responsibilities": "Backend development, code writing, testing, documentation",
            "salary_range": "Unpaid/Stipend $200-400/month"
        },
        {
            "title": "Customer Support Engineer",
            "company_name": "SupportPro Tech",
            "description": "Help customers while building technical skills. Document issues, troubleshoot problems, and grow your expertise.",
            "location": "Remote",
            "job_type": "Full-time",
            "experience_level": "fresher",
            "requirements": "Communication skills, problem-solving, basic technical knowledge",
            "responsibilities": "Customer support, troubleshooting, ticket management, knowledge base creation",
            "salary_range": "$20,000 - $28,000 per year"
        },
        {
            "title": "JavaScript Developer",
            "company_name": "JQuery Masters",
            "description": "Work on interactive web applications. Learn modern JavaScript and web technologies.",
            "location": "Remote",
            "job_type": "Full-time",
            "experience_level": "junior",
            "requirements": "JavaScript ES6+, DOM manipulation, basic React/Vue knowledge",
            "responsibilities": "Frontend development, feature implementation, debugging, performance optimization",
            "salary_range": "$27,000 - $41,000 per year"
        },
        {
            "title": "Machine Learning Intern",
            "company_name": "AI Innovations Lab",
            "description": "Work on exciting ML projects. Build models, process data, and contribute to AI solutions.",
            "location": "Remote",
            "job_type": "Internship",
            "experience_level": "fresher",
            "requirements": "Python, basic ML knowledge, mathematics, TensorFlow/PyTorch helpful",
            "responsibilities": "Model development, data preprocessing, experiment tracking, documentation",
            "salary_range": "Unpaid/Stipend $300-500/month"
        },
        {
            "title": "Database Administrator (Junior)",
            "company_name": "DataVault Systems",
            "description": "Manage and optimize databases. Learn database administration and performance tuning.",
            "location": "Remote",
            "job_type": "Full-time",
            "experience_level": "junior",
            "requirements": "SQL, relational databases, basic Linux, problem-solving",
            "responsibilities": "Database maintenance, performance tuning, backup management, user support",
            "salary_range": "$29,000 - $43,000 per year"
        },
        {
            "title": "Social Media Manager (Part-time)",
            "company_name": "BrandBoost Marketing",
            "description": "Manage social media presence for tech startups. Create content, engage with audience, analyze metrics.",
            "location": "Remote",
            "job_type": "Part-time",
            "experience_level": "fresher",
            "requirements": "Social media knowledge, content creation, basic analytics",
            "responsibilities": "Content creation, community management, analytics reporting, engagement",
            "salary_range": "$10 - $18 per hour"
        },
        {
            "title": "Systems Administrator (Entry-Level)",
            "company_name": "TechOps Enterprise",
            "description": "Manage IT infrastructure and support. Hands-on experience with servers, networks, and security.",
            "location": "Lagos, NG",
            "job_type": "Full-time",
            "experience_level": "fresher",
            "requirements": "Linux/Windows administration, networking basics, troubleshooting",
            "responsibilities": "System administration, user support, infrastructure maintenance, security monitoring",
            "salary_range": "$22,000 - $32,000 per year"
        }
    ]
    
    created = []
    for job_data in jobs_data:
        # Randomly assign 1-3 skills to each job
        num_skills = random.randint(1, min(3, len(skill_ids)))
        assigned_skills = random.sample(skill_ids, num_skills)
        
        job = Job(
            title=job_data["title"],
            company_name=job_data["company_name"],
            description=job_data["description"],
            location=job_data["location"],
            job_type=job_data["job_type"],
            experience_level=job_data["experience_level"],
            requirements=job_data["requirements"],
            responsibilities=job_data["responsibilities"],
            salary_range=job_data["salary_range"],
            required_skills=json.dumps(assigned_skills),
            is_active=True,
            posted_by=admin.id
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        created.append(job.id)
    
    _log_admin_action(db, admin.id, "seed_jobs", "job", None, f"Seeded {len(created)} realistic job entries")
    return {"seeded": len(created), "ids": created}


@router.post("/api/admin/jobs", response_model=JobResponse)
def create_job_admin(job: JobCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_user)):
    """Create a job (admin only). Validates skills against Skill table."""
    if admin.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    new_job = create_job(db, job, admin.id)
    _log_admin_action(db, admin.id, "create_job", "job", new_job.id, f"Created job: {new_job.title}")
    return new_job


@router.put("/api/admin/jobs/{job_id}", response_model=JobResponse)
def update_job_admin(job_id: int, job_update: JobUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_user)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    if admin.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    update_data = job_update.dict(exclude_unset=True)
    # If required_skills provided, validate
    if "required_skills" in update_data:
        parsed = update_data.get("required_skills")
        # convert to list
        try:
            import json as _json
            parsed_list = _json.loads(parsed) if isinstance(parsed, str) else parsed
        except Exception:
            parsed_list = parsed
        validated = validate_skills_exist(db, parsed_list)
        update_data["required_skills"] = json.dumps(validated)

    for field, value in update_data.items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)
    _log_admin_action(db, admin.id, "update_job", "job", job.id, f"Updated job: {job.title}")
    return job


@router.delete("/api/admin/jobs/{job_id}")
def delete_job_admin(job_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_user)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    if admin.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    title = job.title
    db.delete(job)
    db.commit()
    _log_admin_action(db, admin.id, "delete_job", "job", job_id, f"Deleted job: {title}")
    return {"success": True, "message": f"Job '{title}' deleted successfully"}


@router.get("/api/jobs/search")
def search_jobs(q: Optional[str] = None, location: Optional[str] = None, job_type: Optional[str] = None, skill: Optional[int] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Search jobs with basic filters. Protected route."""
    query = db.query(Job).filter(Job.is_active == True)
    if q:
        query = query.filter(Job.title.ilike(f"%{q}%") | Job.description.ilike(f"%{q}%"))
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if job_type:
        query = query.filter(Job.job_type.ilike(f"%{job_type}%"))
    results = query.limit(200).all()

    # If skill filter provided, filter by required_skills JSON
    if skill:
        filtered = []
        for r in results:
            try:
                req = json.loads(r.required_skills or "[]")
            except Exception:
                req = []
            if int(skill) in [int(x) for x in req]:
                filtered.append(r)
        results = filtered

    return results
