"""
Database models for SkillSync platform
Designed with AI integration in mind for future enhancements
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Float, Table, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


# Enums for structured data
class UserRole(str, enum.Enum):
    ADMIN = "admin"
    INSTRUCTOR = "instructor"
    STUDENT = "student"


class SkillLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class ExperienceLevel(str, enum.Enum):
    FRESHER = "fresher"
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"


class CourseStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


# Association tables for many-to-many relationships
user_skills = Table(
    'user_skills',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete='CASCADE')),
    Column('skill_id', Integer, ForeignKey('skills.id', ondelete='CASCADE')),
    Column('proficiency_level', String(50)),
    Column('acquired_date', DateTime, server_default=func.now())
)

course_skills = Table(
    'course_skills',
    Base.metadata,
    Column('course_id', Integer, ForeignKey('courses.id', ondelete='CASCADE')),
    Column('skill_id', Integer, ForeignKey('skills.id', ondelete='CASCADE'))
)

course_enrollments = Table(
    'course_enrollments',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete='CASCADE')),
    Column('course_id', Integer, ForeignKey('courses.id', ondelete='CASCADE')),
    Column('enrolled_at', DateTime, server_default=func.now()),
    Column('completed_at', DateTime, nullable=True),
    Column('progress_percentage', Float, default=0.0)
)


class User(Base):
    """
    User model - supports admin, instructor, and student roles
    AI-ready: includes fields for learning preferences, skill gaps, and recommendations
    Extended with career roadmap fields for job matching and learning path recommendations
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(Enum(UserRole), default=UserRole.STUDENT)
    
    # Profile information
    bio = Column(Text)
    avatar_url = Column(String(500))
    phone_number = Column(String(20))
    linkedin_url = Column(String(500))  # LinkedIn profile URL
    github_url = Column(String(500))  # GitHub profile URL
    website_url = Column(String(500))  # Personal website/portfolio URL
    experience_description = Column(Text)  # user's work/project experience
    career_interests = Column(Text)  # target roles or career paths (JSON array of strings)
    cv_text = Column(Text)  # stored CV/resume text for later AI analysis
    
    # Metadata
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    last_login = Column(DateTime)
    
    # Relationships
    skills = relationship("Skill", secondary=user_skills, back_populates="users")
    courses_created = relationship("Course", back_populates="instructor", foreign_keys="Course.instructor_id")
    enrolled_courses = relationship("Course", secondary=course_enrollments, back_populates="enrolled_students")
    progress_records = relationship("LearningProgress", back_populates="user")
    ai_recommendations = relationship("AIRecommendation", back_populates="user")


class Skill(Base):
    """
    Skill model - represents skills that can be learned/taught
    AI-ready: includes taxonomy for skill relationships and prerequisites
    """
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False)
    description = Column(Text)
    category = Column(String(100), index=True)  # e.g., "Programming", "Design", "Business"
    
    # AI-ready fields
    difficulty_level = Column(Enum(SkillLevel), default=SkillLevel.BEGINNER)
    estimated_learning_hours = Column(Integer)
    prerequisites = Column(Text)  # JSON array of prerequisite skill IDs
    related_skills = Column(Text)  # JSON array for AI to suggest related skills
    market_demand_score = Column(Float)  # For AI-powered career recommendations
    
    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    users = relationship("User", secondary=user_skills, back_populates="skills")
    courses = relationship("Course", secondary=course_skills, back_populates="skills")


class Course(Base):
    """
    Course model - represents learning courses from various platforms
    """
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    platform = Column(String(100), nullable=False)  # YouTube, Coursera, Udemy, etc.
    url = Column(String(1000), nullable=False)
    cost_type = Column(String(20), nullable=False)  # free or paid
    description = Column(Text)
    thumbnail_url = Column(String(500))
    
    # Related skills stored as JSON array of skill IDs
    related_skills = Column(Text)  # JSON array of skill IDs
    
    # Analytics
    enrollment_count = Column(Integer, default=0)
    views_count = Column(Integer, default=0)
    
    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Keep relationships for backward compatibility
    instructor_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    instructor = relationship("User", back_populates="courses_created", foreign_keys=[instructor_id])
    skills = relationship("Skill", secondary=course_skills, back_populates="courses")
    enrolled_students = relationship("User", secondary=course_enrollments, back_populates="enrolled_courses")
    progress_records = relationship("LearningProgress", back_populates="course")


class LearningProgress(Base):
    """
    Tracks user progress through courses
    AI-ready: captures learning patterns for personalized recommendations
    """
    __tablename__ = "learning_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    course_id = Column(Integer, ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    
    # Progress tracking
    current_module = Column(Integer, default=0)
    current_lesson = Column(Integer, default=0)
    completion_percentage = Column(Float, default=0.0)
    
    # AI-ready fields
    time_spent_minutes = Column(Integer, default=0)
    learning_pace = Column(String(50))  # fast, normal, slow - for AI adaptation
    struggle_points = Column(Text)  # JSON array of topics user struggled with
    strengths = Column(Text)  # JSON array of topics user excelled at
    
    # Assessment
    quiz_scores = Column(Text)  # JSON array of quiz results
    last_activity = Column(DateTime, server_default=func.now())
    
    # Metadata
    started_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="progress_records")
    course = relationship("Course", back_populates="progress_records")


class AIRecommendation(Base):
    """
    Stores AI-generated recommendations for users
    Ready for ML integration in Phase 2
    """
    __tablename__ = "ai_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    # Recommendation details
    recommendation_type = Column(String(50))  # course, skill, learning_path, career
    target_id = Column(Integer)  # ID of recommended course/skill
    confidence_score = Column(Float)  # ML model confidence
    reasoning = Column(Text)  # Explanation of recommendation
    
    # Feedback loop for ML improvement
    user_feedback = Column(String(50))  # accepted, rejected, completed
    was_helpful = Column(Boolean)
    
    # Metadata
    created_at = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="ai_recommendations")


class Job(Base):
    """
    Job posting model - represents job opportunities
    Links to required skills for matching
    """
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    company_name = Column(String(255), nullable=False)
    company_logo = Column(String(500))
    
    # Job details
    description = Column(Text, nullable=False)
    requirements = Column(Text)  # Detailed requirements
    responsibilities = Column(Text)  # Job responsibilities
    
    # Employment details
    job_type = Column(String(50))  # full-time, part-time, contract, internship
    location = Column(String(255))
    salary_range = Column(String(100))
    experience_level = Column(String(50))  # entry, mid, senior
    
    # Skills required (JSON array of skill IDs)
    required_skills = Column(Text)  # JSON array
    
    # Application details
    application_url = Column(String(500))
    application_email = Column(String(255))
    application_deadline = Column(DateTime)
    
    # Metadata
    is_active = Column(Boolean, default=True)
    posted_by = Column(Integer, ForeignKey('users.id'))
    views_count = Column(Integer, default=0)
    applications_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class AdminLog(Base):
    """
    Audit log for admin actions
    Important for security and compliance
    """
    __tablename__ = "admin_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey('users.id'))
    action = Column(String(255), nullable=False)
    target_type = Column(String(100))  # user, course, skill, etc.
    target_id = Column(Integer)
    details = Column(Text)  # JSON with additional information
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    created_at = Column(DateTime, server_default=func.now())


class UserResume(Base):
    """
    User Resume/CV model - structured CV data storage
    AI-ready: designed for future NLP/AI-based skill extraction and analysis
    One-to-one relationship with User (one user can have one resume)
    """
    __tablename__ = "user_resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False, index=True)
    
    # Personal Summary
    personal_summary = Column(Text)  # Short bio/professional summary
    
    # Work Experience (JSON array of experience objects)
    experiences = Column(Text)  # JSON array: [{"title": "...", "company": "...", "description": "...", ...}]
    
    # Education (JSON array of education objects)
    education = Column(Text)  # JSON array: [{"degree": "...", "institution": "...", "field": "...", ...}]
    
    # Skills (JSON array of skill IDs from admin-defined skills table)
    skills = Column(Text)  # JSON array of skill IDs: [1, 2, 3]
    
    # Tools/Technologies (JSON array of strings)
    tools = Column(Text)  # JSON array: ["React", "Node.js", "MongoDB"]
    
    # Projects/Achievements (JSON array of project objects)
    projects = Column(Text)  # JSON array: [{"name": "...", "description": "...", "technologies": "...", ...}]
    
    # Optional raw CV text (for future AI processing)
    raw_cv_text = Column(Text)  # Optional pasted CV text
    
    # PDF CV file storage
    cv_pdf_filename = Column(String(500))  # Filename of uploaded PDF
    cv_pdf_path = Column(String(1000))  # Server path to PDF file
    
    # Metadata
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="resume")


class CareerBotConversation(Base):
    """
    CareerBot conversation history model
    Stores all user-bot interactions for context and history
    """
    __tablename__ = "careerbot_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    
    # Message details
    role = Column(String(10), nullable=False)  # "user" or "bot"
    message = Column(Text, nullable=False)
    language = Column(String(10), default="en")  # "en", "bn", or "mix"
    
    # Metadata
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="careerbot_conversations")