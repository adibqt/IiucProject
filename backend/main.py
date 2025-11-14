"""
SkillSync - AI-Powered Learning Platform
Main FastAPI application with admin and user authentication
"""
from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

# Import local modules
from database import engine, Base, get_db
from models import User, UserRole, Skill, Course, AdminLog, Job, UserResume
from schemas import (
    AdminLogin, Token, UserResponse, SuccessResponse, 
    DashboardStats, SkillResponse, CourseResponse,
    SkillCreate, JobCreate, JobUpdate, JobResponse,
    CourseCreate, CourseUpdate
)
from auth import (
    verify_password, get_password_hash, 
    create_access_token, decode_access_token
)

# Import user routes
from api_users import router as user_router

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="SkillSync API",
    description="AI-Powered Learning Platform Backend",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user_router)
# Include profile routes (user profile and skill management)
from routes.profile_routes import router as profile_router
app.include_router(profile_router)
# Include CV routes (CV/Resume management)
from routes.cv_routes import router as cv_router
app.include_router(cv_router)
# Include CareerBot routes (AI-powered career guidance)
from routes.careerbot_routes import router as careerbot_router
app.include_router(careerbot_router)
# Include job recommendation routes (AI-powered job matching)
from routes.job_recommendation_routes import router as job_recommendation_router
app.include_router(job_recommendation_router)
# Include CV assistant routes (AI-powered CV generation and suggestions)
from routes.cv_assistant_routes import router as cv_assistant_router
app.include_router(cv_assistant_router)


# ==================== Authentication Helpers ====================

async def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """
    Dependency to get current authenticated user from JWT token
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    return user


async def get_admin_user(current_user: User = Depends(get_current_user)):
    """
    Dependency to ensure current user is an admin
    """
    print(f"DEBUG: User role: {current_user.role}, Expected: {UserRole.ADMIN}, Match: {current_user.role == UserRole.ADMIN}")
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def log_admin_action(db: Session, admin_id: int, action: str, target_type: str = None, target_id: int = None, details: str = None):
    """
    Log admin actions for audit trail
    """
    log = AdminLog(
        admin_id=admin_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        details=details
    )
    db.add(log)
    db.commit()


# ==================== Public Routes ====================

@app.get("/")
def root():
    """Root endpoint"""
    return {
        "app": "SkillSync",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow()}


# ==================== Admin Authentication ====================

@app.post("/api/admin/login", response_model=Token)
def admin_login(credentials: AdminLogin, db: Session = Depends(get_db)):
    """
    Admin login endpoint
    Returns JWT token if credentials are valid
    """
    # Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()
    
    # Verify user exists and is admin
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Verify password
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value}
    )
    
    # Log admin action
    log_admin_action(db, user.id, "admin_login")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@app.get("/api/admin/me", response_model=UserResponse)
async def get_current_admin(current_user: User = Depends(get_admin_user)):
    """
    Get current admin user information
    """
    return current_user


@app.post("/api/admin/logout", response_model=SuccessResponse)
async def admin_logout(current_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """
    Admin logout endpoint
    """
    log_admin_action(db, current_user.id, "admin_logout")
    return {"success": True, "message": "Logged out successfully"}


# ==================== Admin Dashboard ====================

@app.get("/api/admin/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """
    Get dashboard statistics for admin panel
    """
    from datetime import timedelta
    from sqlalchemy import func
    
    # Calculate date for "this month"
    this_month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Get statistics
    total_users = db.query(func.count(User.id)).scalar()
    total_courses = db.query(func.count(Course.id)).scalar()
    total_skills = db.query(func.count(Skill.id)).scalar()
    # Jobs feature removed; keep total_jobs as 0 for compatibility
    total_jobs = 0
    
    new_users_this_month = db.query(func.count(User.id)).filter(
        User.created_at >= this_month_start
    ).scalar()
    
    courses_added_this_month = db.query(func.count(Course.id)).filter(
        Course.created_at >= this_month_start
    ).scalar()
    
    return {
        "total_users": total_users or 0,
        "total_courses": total_courses or 0,
        "total_skills": total_skills or 0,
        "total_jobs": total_jobs or 0,
        "active_enrollments": 0,  # Will be calculated with enrollments
        "new_users_this_month": new_users_this_month or 0,
        "courses_published_this_month": courses_added_this_month or 0
    }


# ==================== Admin User Management ====================

@app.get("/api/admin/users", response_model=list[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    List all users (paginated)
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users


# ==================== Admin Skill Management ====================

@app.get("/api/admin/skills", response_model=list[SkillResponse])
async def list_skills(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    List all skills (paginated)
    """
    skills = db.query(Skill).offset(skip).limit(limit).all()
    return skills


@app.get("/api/skills", response_model=list[SkillResponse])
async def list_skills_public(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    List all skills (public endpoint)
    """
    skills = db.query(Skill).offset(skip).limit(limit).all()
    return skills


# ==================== Admin Course Management ====================

@app.get("/api/admin/courses", response_model=list[CourseResponse])
async def list_courses(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    List all courses (paginated)
    """
    courses = db.query(Course).offset(skip).limit(limit).all()
    return courses


# ==================== Initialization Script ====================

@app.post("/api/admin/init", response_model=SuccessResponse)
def initialize_admin(db: Session = Depends(get_db)):
    """
    Create initial admin user (use once, then disable this endpoint in production)
    """
    # Check if admin already exists
    existing_admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin user already exists"
        )
    
    # Create admin user
    admin = User(
        email="admin@skillsync.com",
        username="admin",
        full_name="System Administrator",
        hashed_password=get_password_hash("admin123"),  # Change in production!
        role=UserRole.ADMIN,
        is_active=True,
        is_verified=True
    )
    
    db.add(admin)
    db.commit()
    db.refresh(admin)
    
    return {
        "success": True,
        "message": "Admin user created successfully",
        "data": {
            "email": "admin@skillsync.com",
            "password": "admin123",
            "note": "Please change the password immediately!"
        }
    }


# ==================== Admin Skill CRUD ====================

@app.post("/api/admin/skills", response_model=SkillResponse)
async def create_skill(
    skill: SkillCreate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Create a new skill
    """
    # Check if skill already exists
    existing_skill = db.query(Skill).filter(Skill.slug == skill.slug).first()
    if existing_skill:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skill with this slug already exists"
        )
    
    # Create new skill
    new_skill = Skill(**skill.dict())
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    
    # Log action
    log_admin_action(
        db, current_user.id, "create_skill", 
        "skill", new_skill.id, f"Created skill: {new_skill.name}"
    )
    
    return new_skill


@app.delete("/api/admin/skills/{skill_id}")
async def delete_skill(
    skill_id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete a skill
    """
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    skill_name = skill.name
    db.delete(skill)
    db.commit()
    
    # Log action
    log_admin_action(
        db, current_user.id, "delete_skill",
        "skill", skill_id, f"Deleted skill: {skill_name}"
    )
    
    return {"success": True, "message": f"Skill '{skill_name}' deleted successfully"}


# ==================== Job Management (Admin) ====================

@app.get("/api/admin/jobs", response_model=list[JobResponse])
async def list_admin_jobs(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get all jobs (admin only)
    """
    jobs = db.query(Job).offset(skip).limit(limit).all()
    return jobs


@app.post("/api/admin/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    job: JobCreate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Create a new job posting (admin only)
    """
    # Create new job
    new_job = Job(**job.dict(), posted_by=current_user.id)
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    
    # Log action
    log_admin_action(
        db, current_user.id, "create_job", 
        "job", new_job.id, f"Created job: {new_job.title} at {new_job.company_name}"
    )
    
    return new_job


@app.put("/api/admin/jobs/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: int,
    job_update: JobUpdate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update a job posting (admin only)
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Update job fields
    update_data = job_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)
    
    db.commit()
    db.refresh(job)
    
    # Log action
    log_admin_action(
        db, current_user.id, "update_job",
        "job", job.id, f"Updated job: {job.title}"
    )
    
    return job


@app.delete("/api/admin/jobs/{job_id}")
async def delete_job(
    job_id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete a job posting (admin only)
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    job_title = job.title
    company = job.company_name
    db.delete(job)
    db.commit()
    
    # Log action
    log_admin_action(
        db, current_user.id, "delete_job",
        "job", job_id, f"Deleted job: {job_title} at {company}"
    )
    
    return {"success": True, "message": f"Job '{job_title}' deleted successfully"}


# ==================== Job Management (Public) ====================

@app.get("/api/jobs", response_model=list[JobResponse])
async def list_jobs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all active jobs (public access)
    """
    jobs = db.query(Job).filter(Job.is_active == True).offset(skip).limit(limit).all()
    return jobs


@app.get("/api/jobs/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific job by ID (public access)
    Increments view count
    """
    job = db.query(Job).filter(Job.id == job_id, Job.is_active == True).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Increment view count
    job.views_count += 1
    db.commit()
    db.refresh(job)
    
    return job


# ==================== Course Management (Admin) ====================

@app.get("/api/admin/courses", response_model=list[CourseResponse])
async def list_admin_courses(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get all courses for admin management
    """
    courses = db.query(Course).offset(skip).limit(limit).all()
    return courses


@app.post("/api/admin/courses", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course_data: CourseCreate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Create a new course (admin only)
    """
    import json
    
    # Create course
    new_course = Course(
        title=course_data.title,
        platform=course_data.platform,
        url=course_data.url,
        cost_type=course_data.cost_type,
        description=course_data.description,
        thumbnail_url=course_data.thumbnail_url,
        related_skills=json.dumps(course_data.related_skills) if course_data.related_skills else None,
        is_active=course_data.is_active,
        enrollment_count=0,
        views_count=0
    )
    
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    
    # Log action
    log_admin_action(
        db, current_user.id, "create_course",
        "course", new_course.id, f"Created course: {new_course.title}"
    )
    
    return new_course


@app.put("/api/admin/courses/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: int,
    course_data: CourseUpdate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update a course (admin only)
    """
    import json
    
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Update fields
    update_data = course_data.dict(exclude_unset=True)
    
    # Handle related_skills separately
    if 'related_skills' in update_data and update_data['related_skills'] is not None:
        update_data['related_skills'] = json.dumps(update_data['related_skills'])
    
    for field, value in update_data.items():
        setattr(course, field, value)
    
    course.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(course)
    
    # Log action
    log_admin_action(
        db, current_user.id, "update_course",
        "course", course.id, f"Updated course: {course.title}"
    )
    
    return course


@app.delete("/api/admin/courses/{course_id}")
async def delete_course(
    course_id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete a course (admin only)
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    course_title = course.title
    db.delete(course)
    db.commit()
    
    # Log action
    log_admin_action(
        db, current_user.id, "delete_course",
        "course", course_id, f"Deleted course: {course_title}"
    )
    
    return {"success": True, "message": f"Course '{course_title}' deleted successfully"}


# ==================== Course Management (Public) ====================

@app.get("/api/courses", response_model=list[CourseResponse])
async def list_courses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all active courses (public access)
    """
    courses = db.query(Course).filter(Course.is_active == True).offset(skip).limit(limit).all()
    return courses


@app.get("/api/courses/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific course by ID (public access)
    Increments view count
    """
    course = db.query(Course).filter(Course.id == course_id, Course.is_active == True).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Increment view count
    course.views_count += 1
    db.commit()
    db.refresh(course)
    
    return course


