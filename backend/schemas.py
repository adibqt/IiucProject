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


class UserProfile(BaseModel):
    """User profile response (detailed)"""
    id: int
    full_name: Optional[str]
    email: str
    username: str
    role: UserRole
    bio: Optional[str]
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


# Course Schemas
class CourseBase(BaseModel):
    """Base course information"""
    title: str = Field(..., min_length=5, max_length=255)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    difficulty_level: SkillLevel = SkillLevel.BEGINNER


class CourseCreate(CourseBase):
    """Course creation request"""
    slug: str
    duration_hours: Optional[int] = None
    prerequisites: Optional[str] = None
    learning_outcomes: Optional[str] = None


class CourseResponse(CourseBase):
    """Course response"""
    id: int
    slug: str
    instructor_id: Optional[int] = None
    enrollment_count: int
    average_rating: float
    is_published: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Dashboard Statistics Schema
class DashboardStats(BaseModel):
    """Admin dashboard statistics"""
    total_users: int
    total_courses: int
    total_skills: int
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
