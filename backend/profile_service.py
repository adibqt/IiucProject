"""
Profile service - business logic for user profile and skill management
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime
from models import User, Skill
from schemas import UserProfileUpdate, UserProfile
import json


class ProfileService:
    """User profile management service"""
    
    @staticmethod
    def get_user_profile(db: Session, user_id: int) -> User:
        """
        Get user profile by ID
        
        Args:
            db: Database session
            user_id: User ID
        
        Returns:
            User object with all profile fields
        
        Raises:
            HTTPException: If user not found
        """
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return user
    
    @staticmethod
    def update_user_profile(db: Session, user_id: int, profile_data: UserProfileUpdate) -> User:
        """
        Update user profile with all available fields
        
        Args:
            db: Database session
            user_id: User ID
            profile_data: Profile update data
        
        Returns:
            Updated user object
        
        Raises:
            HTTPException: If user not found
        """
        user = ProfileService.get_user_profile(db, user_id)
        
        # Update only provided fields
        update_dict = profile_data.dict(exclude_unset=True)
        for field, value in update_dict.items():
            if value is not None:
                setattr(user, field, value)
        
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        
        return user
    
    @staticmethod
    def add_skill(db: Session, user_id: int, skill_id: int, proficiency_level: str = "beginner") -> User:
        """
        Add a skill to user's skills (uses the many-to-many relationship)
        
        Args:
            db: Database session
            user_id: User ID
            skill_id: Skill ID (must exist in skills table)
            proficiency_level: Proficiency level (beginner, intermediate, advanced, expert)
        
        Returns:
            Updated user object
        
        Raises:
            HTTPException: If user or skill not found
        """
        user = ProfileService.get_user_profile(db, user_id)
        
        # Verify skill exists
        skill = db.query(Skill).filter(Skill.id == skill_id).first()
        if not skill:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill not found"
            )
        
        # Check if skill already added
        if skill not in user.skills:
            user.skills.append(skill)
            user.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(user)
        
        return user
    
    @staticmethod
    def remove_skill(db: Session, user_id: int, skill_id: int) -> User:
        """
        Remove a skill from user's skills
        
        Args:
            db: Database session
            user_id: User ID
            skill_id: Skill ID
        
        Returns:
            Updated user object
        
        Raises:
            HTTPException: If user not found
        """
        user = ProfileService.get_user_profile(db, user_id)
        
        # Find and remove skill
        skill = db.query(Skill).filter(Skill.id == skill_id).first()
        if skill and skill in user.skills:
            user.skills.remove(skill)
            user.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(user)
        
        return user
    
    @staticmethod
    def get_user_skills(db: Session, user_id: int) -> list:
        """
        Get user's skills list (returns full skill objects via relationship)
        
        Args:
            db: Database session
            user_id: User ID
        
        Returns:
            List of Skill objects
        
        Raises:
            HTTPException: If user not found
        """
        user = ProfileService.get_user_profile(db, user_id)
        return user.skills or []
    
    @staticmethod
    def set_career_interests(db: Session, user_id: int, interests: list) -> User:
        """
        Set or update user's career interests (stored as JSON array)
        
        Args:
            db: Database session
            user_id: User ID
            interests: List of career interest strings (e.g., ["Data Science", "Frontend"])
        
        Returns:
            Updated user object
        
        Raises:
            HTTPException: If user not found
        """
        user = ProfileService.get_user_profile(db, user_id)
        user.career_interests = json.dumps(interests) if interests else None
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def get_career_interests(db: Session, user_id: int) -> list:
        """
        Get user's career interests (parsed from JSON)
        
        Args:
            db: Database session
            user_id: User ID
        
        Returns:
            List of career interest strings
        """
        user = ProfileService.get_user_profile(db, user_id)
        
        if not user.career_interests:
            return []
        
        try:
            return json.loads(user.career_interests)
        except (json.JSONDecodeError, TypeError):
            return []
    
    @staticmethod
    def set_experience_description(db: Session, user_id: int, experience: str) -> User:
        """
        Set or update user's experience description
        
        Args:
            db: Database session
            user_id: User ID
            experience: Experience/project description text
        
        Returns:
            Updated user object
        """
        user = ProfileService.get_user_profile(db, user_id)
        user.experience_description = experience
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def set_cv_text(db: Session, user_id: int, cv_text: str) -> User:
        """
        Set or update user's CV/resume text (stored for later AI analysis)
        
        Args:
            db: Database session
            user_id: User ID
            cv_text: CV/resume text content
        
        Returns:
            Updated user object
        """
        user = ProfileService.get_user_profile(db, user_id)
        user.cv_text = cv_text
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return user
