"""
CV Service - Business logic for CV/Resume management
Includes placeholder functions for future AI-based skill extraction
"""
import json
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from models import UserResume, Skill, User
from schemas import CVCreate, CVResponse


class CVService:
    """Service for managing user CVs/resumes"""
    
    @staticmethod
    def get_user_resume(db: Session, user_id: int) -> Optional[UserResume]:
        """Get user's resume if it exists"""
        return db.query(UserResume).filter(UserResume.user_id == user_id).first()
    
    @staticmethod
    def create_or_update_resume(db: Session, user_id: int, cv_data: CVCreate) -> UserResume:
        """
        Create or update user's resume
        Validates skill IDs against admin-defined skills
        """
        # Validate skill IDs
        if cv_data.skills:
            valid_skill_ids = CVService._validate_skill_ids(db, cv_data.skills)
            if len(valid_skill_ids) != len(cv_data.skills):
                invalid_ids = set(cv_data.skills) - set(valid_skill_ids)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid skill IDs: {invalid_ids}. Skills must be selected from admin-defined skills."
                )
        
        # Check if resume exists
        existing_resume = CVService.get_user_resume(db, user_id)
        
        # Prepare data for storage (convert to JSON strings)
        resume_data = {
            "personal_summary": cv_data.personal_summary,
            "experiences": json.dumps([exp.dict() for exp in (cv_data.experiences or [])]),
            "education": json.dumps([edu.dict() for edu in (cv_data.education or [])]),
            "skills": json.dumps(cv_data.skills or []),
            "tools": json.dumps(cv_data.tools or []),
            "projects": json.dumps([proj.dict() for proj in (cv_data.projects or [])]),
            "raw_cv_text": cv_data.raw_cv_text,
        }
        
        if existing_resume:
            # Update existing resume
            for key, value in resume_data.items():
                setattr(existing_resume, key, value)
            db.commit()
            db.refresh(existing_resume)
            return existing_resume
        else:
            # Create new resume
            new_resume = UserResume(
                user_id=user_id,
                **resume_data
            )
            db.add(new_resume)
            try:
                db.commit()
                db.refresh(new_resume)
                return new_resume
            except IntegrityError:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Resume already exists for this user"
                )
    
    @staticmethod
    def delete_resume(db: Session, user_id: int) -> bool:
        """Delete user's resume"""
        resume = CVService.get_user_resume(db, user_id)
        if not resume:
            return False
        
        db.delete(resume)
        db.commit()
        return True
    
    @staticmethod
    def _validate_skill_ids(db: Session, skill_ids: List[int]) -> List[int]:
        """Validate that all skill IDs exist in the database"""
        valid_skills = db.query(Skill.id).filter(Skill.id.in_(skill_ids)).all()
        return [skill.id for skill in valid_skills]
    
    @staticmethod
    def format_resume_response(resume: UserResume) -> Dict:
        """Format resume for API response (parse JSON strings)"""
        return {
            "id": resume.id,
            "user_id": resume.user_id,
            "personal_summary": resume.personal_summary,
            "experiences": json.loads(resume.experiences) if resume.experiences else [],
            "education": json.loads(resume.education) if resume.education else [],
            "skills": json.loads(resume.skills) if resume.skills else [],
            "tools": json.loads(resume.tools) if resume.tools else [],
            "projects": json.loads(resume.projects) if resume.projects else [],
            "raw_cv_text": resume.raw_cv_text,
            "cv_pdf_filename": resume.cv_pdf_filename,
            "cv_pdf_path": resume.cv_pdf_path,
            "created_at": resume.created_at,
            "updated_at": resume.updated_at,
        }


# ==================== AI/NLP Placeholder Functions ====================
# These functions are placeholders for future AI-based skill extraction
# They will be implemented in Phase 2 with NLP/LLM integration

def extract_skills_from_text(raw_text: str) -> List[str]:
    """
    Placeholder for future AI-based skill extraction from raw CV text
    
    Future implementation will:
    - Use NLP/LLM to analyze raw CV text
    - Extract skill mentions
    - Match against admin-defined skills
    - Return list of matched skill IDs
    
    Args:
        raw_text: Raw CV/resume text
        
    Returns:
        List of extracted skill names (to be matched against admin skills)
    """
    # TODO: Implement AI-based skill extraction
    return []


def extract_experience_from_text(raw_text: str) -> List[Dict]:
    """
    Placeholder for future AI-based experience extraction
    
    Future implementation will:
    - Parse raw CV text
    - Extract work experience entries
    - Structure into experience objects
    
    Args:
        raw_text: Raw CV/resume text
        
    Returns:
        List of structured experience dictionaries
    """
    # TODO: Implement AI-based experience extraction
    return []


def extract_education_from_text(raw_text: str) -> List[Dict]:
    """
    Placeholder for future AI-based education extraction
    
    Future implementation will:
    - Parse raw CV text
    - Extract education entries
    - Structure into education objects
    
    Args:
        raw_text: Raw CV/resume text
        
    Returns:
        List of structured education dictionaries
    """
    # TODO: Implement AI-based education extraction
    return []


def extract_projects_from_text(raw_text: str) -> List[Dict]:
    """
    Placeholder for future AI-based project extraction
    
    Future implementation will:
    - Parse raw CV text
    - Extract project mentions
    - Structure into project objects
    
    Args:
        raw_text: Raw CV/resume text
        
    Returns:
        List of structured project dictionaries
    """
    # TODO: Implement AI-based project extraction
    return []


def clean_and_normalize_cv_text(raw_text: str) -> str:
    """
    Placeholder for future text cleaning and normalization
    
    Future implementation will:
    - Remove formatting artifacts
    - Normalize whitespace
    - Standardize date formats
    - Clean special characters
    
    Args:
        raw_text: Raw CV/resume text
        
    Returns:
        Cleaned and normalized text
    """
    # TODO: Implement text cleaning
    return raw_text.strip()


def match_skills_to_database(skill_names: List[str], db: Session) -> List[int]:
    """
    Placeholder for matching extracted skill names to database skill IDs
    
    Future implementation will:
    - Match skill names (case-insensitive, fuzzy matching)
    - Return list of matched skill IDs
    - Handle partial matches and synonyms
    
    Args:
        skill_names: List of extracted skill names
        db: Database session
        
    Returns:
        List of matched skill IDs from admin-defined skills
    """
    # TODO: Implement skill matching logic
    return []

