"""
Profile routes - user profile and skill management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from database import get_db
from models import User, Skill
from schemas import UserProfile, UserProfileUpdate, SkillResponse, SuccessResponse, SkillSuggest
from api_users import get_current_user
from profile_service import ProfileService
import re

router = APIRouter(prefix="/api/users", tags=["profile"])


# ==================== Profile Endpoints ====================

@router.get("/me/profile", response_model=UserProfile)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get current user's full profile (all fields)
    Protected route - requires valid JWT token
    """
    return current_user


@router.put("/me/profile", response_model=UserProfile)
async def update_current_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile (all fields)
    Protected route - requires valid JWT token
    
    Fields that can be updated:
    - full_name
    - bio
    - phone_number
    - avatar_url
    - experience_description
    - career_interests (JSON array)
    - cv_text
    """
    updated_user = ProfileService.update_user_profile(db, current_user.id, profile_data)
    return updated_user


@router.get("/{user_id}/profile", response_model=UserProfile)
async def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """
    Get user profile by ID (public endpoint)
    Returns basic profile information
    """
    user = ProfileService.get_user_profile(db, user_id)
    return user


# ==================== Skill Management Endpoints ====================

@router.get("/me/skills", response_model=List[SkillResponse])
async def get_current_user_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's skills list (returns Skill objects with id, name, slug, etc.)
    Protected route
    """
    skills = ProfileService.get_user_skills(db, current_user.id)
    return skills


@router.post("/me/skills/suggest", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
async def suggest_new_skill(
    skill_data: SkillSuggest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Suggest a new skill and automatically add it to the database and user's profile
    Protected route - requires valid JWT token
    
    Body:
        {
            "skill_name": "React Native",
            "category": "Programming" (optional, default: "Other"),
            "proficiency_level": "beginner" (optional, default: "beginner")
        }
    
    Returns:
        The newly created or existing skill
    """
    print(f"Received skill suggestion: {skill_data}")
    print(f"Skill name: {skill_data.skill_name}")
    print(f"Category: {skill_data.category}")
    print(f"Proficiency: {skill_data.proficiency_level}")
    
    skill_name = skill_data.skill_name.strip()
    category = skill_data.category or "Other"
    proficiency_level = skill_data.proficiency_level or "beginner"
    
    # Check if skill already exists (case-insensitive)
    existing_skill = db.query(Skill).filter(
        Skill.name.ilike(skill_name)
    ).first()
    
    if existing_skill:
        # Skill exists, just add it to user's profile
        try:
            ProfileService.add_skill(db, current_user.id, existing_skill.id, proficiency_level)
        except:
            pass  # Already added
        return existing_skill
    
    # Create slug from skill name
    slug = re.sub(r'[^a-z0-9]+', '-', skill_name.lower()).strip('-')
    
    # Ensure slug is unique
    base_slug = slug
    counter = 1
    while db.query(Skill).filter(Skill.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    # Create new skill
    new_skill = Skill(
        name=skill_name,
        slug=slug,
        category=category,
        description=f"User-suggested skill: {skill_name}",
        is_active=True
    )
    
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    
    # Automatically add to user's profile
    ProfileService.add_skill(db, current_user.id, new_skill.id, proficiency_level)
    
    return new_skill


@router.post("/me/skills/{skill_id}", response_model=SuccessResponse)
async def add_skill_to_user(
    skill_id: int,
    proficiency_level: str = "beginner",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a skill to current user's profile
    Protected route
    
    Path params:
        skill_id: ID of the skill to add
    Query params:
        proficiency_level: beginner, intermediate, advanced, expert (default: beginner)
    """
    ProfileService.add_skill(db, current_user.id, skill_id, proficiency_level)
    return {
        "success": True,
        "message": "Skill added successfully"
    }


@router.delete("/me/skills/{skill_id}", response_model=SuccessResponse)
async def remove_skill_from_user(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a skill from current user's profile
    Protected route
    
    Path params:
        skill_id: ID of the skill to remove
    """
    ProfileService.remove_skill(db, current_user.id, skill_id)
    return {
        "success": True,
        "message": "Skill removed successfully"
    }


# ==================== Career Interests Endpoints ====================

@router.get("/me/career-interests", response_model=dict)
async def get_user_career_interests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's career interests list
    Protected route
    """
    interests = ProfileService.get_career_interests(db, current_user.id)
    return {
        "career_interests": interests,
        "count": len(interests)
    }


@router.post("/me/career-interests", response_model=SuccessResponse)
async def set_user_career_interests(
    interests_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Set or update current user's career interests
    Protected route
    
    Body:
        {
            "interests": ["Data Science", "Machine Learning", "Frontend Development"]
        }
    """
    interests = interests_data.get("interests", [])
    ProfileService.set_career_interests(db, current_user.id, interests)
    return {
        "success": True,
        "message": f"Career interests updated ({len(interests)} interests set)"
    }


# ==================== Experience Endpoints ====================

@router.put("/me/experience", response_model=SuccessResponse)
async def update_user_experience(
    experience_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's experience description
    Protected route
    
    Body:
        {
            "experience_description": "5 years experience in full-stack development..."
        }
    """
    experience_text = experience_data.get("experience_description", "")
    ProfileService.set_experience_description(db, current_user.id, experience_text)
    return {
        "success": True,
        "message": "Experience description updated"
    }


# ==================== CV Endpoints ====================

@router.put("/me/cv", response_model=SuccessResponse)
async def update_user_cv(
    cv_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's CV/resume text (stored for later AI analysis)
    Protected route
    
    Body:
        {
            "cv_text": "Full CV/resume text content here..."
        }
    """
    cv_text = cv_data.get("cv_text", "")
    ProfileService.set_cv_text(db, current_user.id, cv_text)
    return {
        "success": True,
        "message": "CV updated successfully"
    }
