"""
Pydantic schemas for SkillSync API
Defines request/response models for data validation
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum


# Enums matching database models
class UserRole(str, Enum):
    ADMIN = "admin"
    INSTRUCTOR = "instructor"
    STUDENT = "student"


class ExperienceLevel(str, Enum):
    FRESHER = "fresher"
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"


class SkillLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


# Authentication Schemas
class AdminLogin(BaseModel):
    """Admin login request"""
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserRegister(BaseModel):
    """User registration request"""
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8)
    
    @validator('password')
    def password_strong(cls, v):
        """Validate password strength"""
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        return v


class UserLogin(BaseModel):
    """User login request"""
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    """User profile update request"""
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    bio: Optional[str] = None
    phone_number: Optional[str] = None


class UserProfileUpdate(BaseModel):
    """Extended user profile update request (includes skills, experience, career interests, CV)"""
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    bio: Optional[str] = None
    phone_number: Optional[str] = None
    avatar_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    website_url: Optional[str] = None
    experience_description: Optional[str] = None
    career_interests: Optional[str] = None  # JSON array of strings
    cv_text: Optional[str] = None


class UserProfile(BaseModel):
    """User profile response (detailed)"""
    id: int
    full_name: Optional[str]
    email: str
    username: str
    role: UserRole
    bio: Optional[str]
    avatar_url: Optional[str] = None
    phone_number: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    website_url: Optional[str] = None
    experience_description: Optional[str] = None
    career_interests: Optional[str] = None
    cv_text: Optional[str] = None
    skills: List["SkillResponse"] = []  # Include user's skills
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UserLoginResponse(BaseModel):
    """User login response"""
    access_token: str
    token_type: str = "bearer"
    user: UserProfile


class Token(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class TokenData(BaseModel):
    """Data stored in JWT token"""
    email: Optional[str] = None
    role: Optional[str] = None


# User Schemas
class UserBase(BaseModel):
    """Base user information"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    full_name: Optional[str] = None
    role: UserRole = UserRole.STUDENT


class UserResponse(UserBase):
    """User response (basic)"""
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Skill Schemas
class SkillBase(BaseModel):
    """Base skill information"""
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty_level: SkillLevel = SkillLevel.BEGINNER


class SkillCreate(SkillBase):
    """Skill creation request"""
    slug: str
    estimated_learning_hours: Optional[int] = None
    prerequisites: Optional[str] = None


class SkillResponse(SkillBase):
    """Skill response"""
    id: int
    slug: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class SkillSuggest(BaseModel):
    """User skill suggestion request"""
    skill_name: str = Field(..., min_length=2, max_length=100)
    category: Optional[str] = Field(default="Other", max_length=100)
    proficiency_level: Optional[str] = Field(default="beginner")


# Course Schemas
class CourseBase(BaseModel):
    """Base course information"""
    title: str = Field(..., min_length=3, max_length=255)
    platform: str = Field(..., min_length=2, max_length=100, description="e.g., YouTube, Coursera, Udemy")
    url: str = Field(..., min_length=10, max_length=1000)
    cost_type: str = Field(..., description="free or paid")
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None


class CourseCreate(CourseBase):
    """Course creation request"""
    related_skills: Optional[List[int]] = []  # List of skill IDs
    is_active: bool = True


class CourseUpdate(BaseModel):
    """Course update request"""
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    platform: Optional[str] = Field(None, min_length=2, max_length=100)
    url: Optional[str] = Field(None, min_length=10, max_length=1000)
    cost_type: Optional[str] = None
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    related_skills: Optional[List[int]] = None
    is_active: Optional[bool] = None


class CourseResponse(CourseBase):
    """Course response"""
    id: int
    related_skills: Optional[str] = None  # JSON string of skill IDs
    enrollment_count: int
    views_count: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Job Schemas
class JobBase(BaseModel):
    """Base job information"""
    title: str = Field(..., min_length=5, max_length=255)
    company_name: str = Field(..., min_length=2, max_length=255)
    description: str = Field(..., min_length=20)
    location: str = Field(..., min_length=2, max_length=255)
    job_type: str = Field(..., description="full-time, part-time, contract, internship, freelance")
    experience_level: str = Field(..., description="entry, mid, senior")


class JobCreate(JobBase):
    """Job creation request"""
    company_logo: Optional[str] = None
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    salary_range: Optional[str] = None
    required_skills: Optional[str] = None  # JSON array of skill IDs
    application_url: Optional[str] = None
    application_email: Optional[EmailStr] = None
    application_deadline: Optional[datetime] = None
    is_active: Optional[bool] = True


class JobUpdate(BaseModel):
    """Job update request"""
    title: Optional[str] = None
    company_name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    experience_level: Optional[str] = None
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    salary_range: Optional[str] = None
    required_skills: Optional[str] = None
    application_url: Optional[str] = None
    application_email: Optional[EmailStr] = None
    application_deadline: Optional[datetime] = None
    is_active: Optional[bool] = None


class JobResponse(JobBase):
    """Job response"""
    id: int
    company_logo: Optional[str] = None
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    salary_range: Optional[str] = None
    required_skills: Optional[str] = None
    application_url: Optional[str] = None
    application_email: Optional[str] = None
    application_deadline: Optional[datetime] = None
    is_active: bool
    views_count: int
    applications_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Dashboard Statistics Schema
class DashboardStats(BaseModel):
    """Admin dashboard statistics"""
    total_users: int
    total_courses: int
    total_skills: int
    total_jobs: int
    active_enrollments: int
    new_users_this_month: int
    courses_published_this_month: int


# Generic Response Schemas
class SuccessResponse(BaseModel):
    """Generic success response"""
    success: bool = True
    message: str
    data: Optional[dict] = None


class ErrorResponse(BaseModel):
    """Generic error response"""
    success: bool = False
    error: str
    details: Optional[str] = None


# CV/Resume Schemas
class CVExperience(BaseModel):
    """Work experience entry"""
    title: str
    company: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    current: bool = False
    description: Optional[str] = None


class CVEducation(BaseModel):
    """Education entry"""
    degree: str
    institution: str
    field: Optional[str] = None
    graduation_year: Optional[str] = None
    gpa: Optional[str] = None


class CVProject(BaseModel):
    """Project entry"""
    name: str
    description: Optional[str] = None
    technologies: Optional[str] = None
    link: Optional[str] = None


class CVCreate(BaseModel):
    """CV creation/update request"""
    personal_summary: Optional[str] = None
    experiences: Optional[List[CVExperience]] = []
    education: Optional[List[CVEducation]] = []
    skills: Optional[List[int]] = []  # List of skill IDs from admin-defined skills
    tools: Optional[List[str]] = []  # List of tool/technology names
    projects: Optional[List[CVProject]] = []
    raw_cv_text: Optional[str] = None


class CVResponse(BaseModel):
    """CV response"""
    id: int
    user_id: int
    personal_summary: Optional[str] = None
    experiences: Optional[List[dict]] = []  # Parsed JSON
    education: Optional[List[dict]] = []  # Parsed JSON
    skills: Optional[List[int]] = []  # Parsed JSON array of skill IDs
    tools: Optional[List[str]] = []  # Parsed JSON array
    projects: Optional[List[dict]] = []  # Parsed JSON
    raw_cv_text: Optional[str] = None
    cv_pdf_filename: Optional[str] = None
    cv_pdf_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Roadmap Schemas
class RoadmapGenerateRequest(BaseModel):
    """Roadmap generation request - accepts camelCase from frontend"""
    targetRole: str = Field(..., min_length=2, max_length=255, description="Target role/job title")
    timeframe: str = Field(..., min_length=2, max_length=100, description="Timeframe e.g., '3 months', '6 months'")
    weeklyHours: Optional[int] = Field(None, ge=1, le=168, description="Optional weekly hours commitment")
    
    class Config:
        populate_by_name = True  # Allow both camelCase and snake_case


class RoadmapResponse(BaseModel):
    """Roadmap response"""
    id: int
    user_id: int
    target_role: str
    timeframe: str
    weekly_hours: Optional[int] = None
    roadmap_visual: str
    roadmap_description: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class RoadmapGenerateResponse(BaseModel):
    """Roadmap generation response"""
    success: bool = True
    roadmap_id: int
    visual: str
    description: str


# Local Opportunity Schemas
class LocalOpportunityBase(BaseModel):
    """Base local opportunity information"""
    title: str = Field(..., min_length=3, max_length=255)
    organization: str = Field(..., min_length=2, max_length=255)
    description: str = Field(..., min_length=20)
    location: str = Field(..., min_length=2, max_length=255)
    category: str = Field(..., description="Internship, Training, Job, Youth Program")
    target_track: Optional[str] = Field(None, max_length=255)
    required_skills: Optional[str] = Field(None, description="JSON array of skill IDs or skill names")
    link: Optional[str] = Field(None, max_length=1000)
    priority_group: Optional[str] = Field(None, max_length=255)


class LocalOpportunityCreate(LocalOpportunityBase):
    """Local opportunity creation request"""
    is_active: bool = True


class LocalOpportunityUpdate(BaseModel):
    """Local opportunity update request"""
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    organization: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = Field(None, min_length=20)
    location: Optional[str] = Field(None, min_length=2, max_length=255)
    category: Optional[str] = None
    target_track: Optional[str] = Field(None, max_length=255)
    required_skills: Optional[str] = None
    link: Optional[str] = Field(None, max_length=1000)
    priority_group: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None


class LocalOpportunityResponse(LocalOpportunityBase):
    """Local opportunity response"""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class OpportunityRecommendationResponse(BaseModel):
    """Opportunity recommendation response"""
    success: bool = True
    explanation: str  # Gemini-generated personalized explanation
    opportunities: List[LocalOpportunityResponse] = []  # Ranked opportunities
    total_matched: int