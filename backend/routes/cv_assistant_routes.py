"""
CV Assistant Routes - API endpoints for AI-powered CV assistance
Provides professional summary generation, bullet point improvement, and profile suggestions
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, Dict, List
from pydantic import BaseModel
from database import get_db
from models import User, Skill
from api_users import get_current_user
from services.cv_service import CVService
from services.cv_assistant_service import CVAssistantService
from profile_service import ProfileService
import json

router = APIRouter(prefix="/api/cv-assistant", tags=["cv-assistant"])


# ==================== Request/Response Models ====================

class GenerateSummaryRequest(BaseModel):
    """Request model for generating professional summary"""
    pass  # Uses current user's profile and CV data


class ImproveBulletPointsRequest(BaseModel):
    """Request model for improving bullet points"""
    experience_index: int
    job_context: Optional[str] = None


class ImproveProjectRequest(BaseModel):
    """Request model for improving project description"""
    project_index: int


class LinkedInSuggestionsResponse(BaseModel):
    """Response model for LinkedIn suggestions"""
    headline: str
    about: str
    general_tips: List[str]


class PortfolioSuggestionsResponse(BaseModel):
    """Response model for portfolio suggestions"""
    structure: str
    content_suggestions: List[str]
    design_tips: List[str]


class CVAnalysisResponse(BaseModel):
    """Response model for CV completeness analysis"""
    score: int
    max_score: int
    percentage: float
    assessment: str
    suggestions: List[Dict]


class KeywordsResponse(BaseModel):
    """Response model for ATS keywords"""
    keywords: List[str]
    target_role: Optional[str] = None


# ==================== Helper Functions ====================

def get_user_profile_data(user: User) -> Dict:
    """Extract profile data from user object"""
    career_interests = []
    if user.career_interests:
        try:
            career_interests = json.loads(user.career_interests)
        except (json.JSONDecodeError, TypeError):
            pass
    
    return {
        "full_name": user.full_name or "",
        "bio": user.bio or "",
        "experience_level": getattr(user, "experience_level", "mid") or "mid",
        "career_interests": career_interests,
        "experience_description": user.experience_description or ""
    }


def get_user_cv_data(db: Session, user_id: int) -> Dict:
    """Get user's CV data with skills populated"""
    resume = CVService.get_user_resume(db, user_id)
    
    if not resume:
        return {
            "personal_summary": "",
            "experiences": [],
            "education": [],
            "skills": [],
            "tools": [],
            "projects": []
        }
    
    # Parse CV data
    cv_data = CVService.format_resume_response(resume)
    
    # Get full skill objects
    skill_ids = cv_data.get('skills', [])
    if skill_ids:
        skills = db.query(Skill).filter(Skill.id.in_(skill_ids)).all()
        cv_data['skills'] = [{"id": s.id, "name": s.name} for s in skills]
    else:
        cv_data['skills'] = []
    
    return cv_data


# ==================== API Endpoints ====================

@router.post("/generate-summary", response_model=Dict)
async def generate_professional_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate AI-powered professional summary based on user's profile and CV data
    
    Returns a 3-4 sentence professional summary optimized for resumes/CVs
    """
    try:
        profile_data = get_user_profile_data(current_user)
        cv_data = get_user_cv_data(db, current_user.id)
        
        summary = CVAssistantService.generate_professional_summary(profile_data, cv_data)
        
        return {
            "success": True,
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate summary: {str(e)}"
        )


@router.post("/improve-bullets", response_model=Dict)
async def improve_bullet_points(
    request: ImproveBulletPointsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate improved bullet points for a specific work experience
    
    Uses AI to create strong, impactful bullet points following best practices
    """
    try:
        cv_data = get_user_cv_data(db, current_user.id)
        experiences = cv_data.get('experiences', [])
        
        if request.experience_index < 0 or request.experience_index >= len(experiences):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid experience index. Must be between 0 and {len(experiences)-1}"
            )
        
        experience = experiences[request.experience_index]
        bullets = CVAssistantService.improve_bullet_points(experience, request.job_context)
        
        return {
            "success": True,
            "bullet_points": bullets,
            "experience_title": experience.get('title', 'Position')
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to improve bullet points: {str(e)}"
        )


@router.post("/improve-project", response_model=Dict)
async def improve_project_description(
    request: ImproveProjectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate improved description and bullet points for a project
    
    Uses AI to create compelling project descriptions
    """
    try:
        cv_data = get_user_cv_data(db, current_user.id)
        projects = cv_data.get('projects', [])
        
        if request.project_index < 0 or request.project_index >= len(projects):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid project index. Must be between 0 and {len(projects)-1}"
            )
        
        project = projects[request.project_index]
        improved = CVAssistantService.generate_project_description(project)
        
        return {
            "success": True,
            "project_name": project.get('name', 'Project'),
            "improved_description": improved.get('description', ''),
            "bullet_points": improved.get('bullet_points', [])
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to improve project: {str(e)}"
        )


@router.get("/linkedin-suggestions", response_model=LinkedInSuggestionsResponse)
async def get_linkedin_suggestions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI-powered LinkedIn profile improvement suggestions
    
    Provides recommendations for headline, about section, and general profile tips
    """
    try:
        profile_data = get_user_profile_data(current_user)
        cv_data = get_user_cv_data(db, current_user.id)
        
        suggestions = CVAssistantService.suggest_linkedin_improvements(profile_data, cv_data)
        
        return suggestions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate LinkedIn suggestions: {str(e)}"
        )


@router.get("/portfolio-suggestions", response_model=PortfolioSuggestionsResponse)
async def get_portfolio_suggestions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI-powered portfolio website improvement suggestions
    
    Provides recommendations for structure, content, and design
    """
    try:
        profile_data = get_user_profile_data(current_user)
        cv_data = get_user_cv_data(db, current_user.id)
        
        suggestions = CVAssistantService.suggest_portfolio_improvements(profile_data, cv_data)
        
        return suggestions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate portfolio suggestions: {str(e)}"
        )


@router.get("/analyze", response_model=CVAnalysisResponse)
async def analyze_cv_completeness(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze CV completeness and get improvement suggestions
    
    Returns a completeness score and specific recommendations
    """
    try:
        cv_data = get_user_cv_data(db, current_user.id)
        
        analysis = CVAssistantService.analyze_cv_completeness(cv_data)
        
        return analysis
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze CV: {str(e)}"
        )


@router.get("/keywords", response_model=KeywordsResponse)
async def get_cv_keywords(
    target_role: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get ATS-friendly keywords for CV optimization
    
    Generates relevant keywords based on CV content and optional target role
    """
    try:
        cv_data = get_user_cv_data(db, current_user.id)
        
        keywords = CVAssistantService.generate_cv_keywords(cv_data, target_role)
        
        return {
            "keywords": keywords,
            "target_role": target_role
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate keywords: {str(e)}"
        )


@router.post("/apply-summary", response_model=Dict)
async def apply_generated_summary(
    summary: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Apply a generated professional summary to user's CV
    
    Updates the CV's personal_summary field
    """
    try:
        resume = CVService.get_user_resume(db, current_user.id)
        
        if not resume:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="CV not found. Create a CV first."
            )
        
        resume.personal_summary = summary
        db.commit()
        
        return {
            "success": True,
            "message": "Professional summary applied successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to apply summary: {str(e)}"
        )
