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
from models import User, UserRole, Skill, Course, AdminLog, Job
from schemas import (
    AdminLogin, Token, UserResponse, SuccessResponse, 
    DashboardStats, SkillResponse, CourseResponse,
    SkillCreate, JobCreate, JobUpdate, JobResponse
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
# Include job routes (moved to modular router)
from routes.job_routes import router as job_router
app.include_router(job_router)
# Include profile routes (user profile and skill management)
from routes.profile_routes import router as profile_router
app.include_router(profile_router)


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
    total_jobs = db.query(func.count(Job.id)).filter(Job.is_active == True).scalar()
    
    new_users_this_month = db.query(func.count(User.id)).filter(
        User.created_at >= this_month_start
    ).scalar()
    
    courses_published_this_month = db.query(func.count(Course.id)).filter(
        Course.published_at >= this_month_start
    ).scalar()
    
    return {
        "total_users": total_users or 0,
        "total_courses": total_courses or 0,
        "total_skills": total_skills or 0,
        "total_jobs": total_jobs or 0,
        "active_enrollments": 0,  # Will be calculated with enrollments
        "new_users_this_month": new_users_this_month or 0,
        "courses_published_this_month": courses_published_this_month or 0
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


