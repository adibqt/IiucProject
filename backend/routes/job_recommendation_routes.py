"""
Job Recommendation Routes - AI-Powered Job Matching
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User
from api_users import get_current_user
from services.job_recommendation_service import get_job_recommendations
from pydantic import BaseModel

router = APIRouter(prefix="/api/job-recommendations", tags=["job-recommendations"])


class JobRecommendationResponse(BaseModel):
    match_score: int
    match_level: str
    matching_skills: List[str]
    missing_skills: List[str]
    skill_gaps: List[dict]
    strengths: List[str]
    concerns: List[str]
    recommendation: str
    experience_match: str
    career_alignment: int
    recommended_courses: List[dict]
    job: dict
    
    class Config:
        from_attributes = True


@router.get("", response_model=List[JobRecommendationResponse])
async def get_recommendations(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI-powered job recommendations for the current user
    
    Returns:
    - List of jobs with match scores, skill gaps, and learning recommendations
    - Sorted by match score (best matches first)
    """
    try:
        recommendations = get_job_recommendations(db, current_user.id, limit)
        
        if not recommendations:
            # Return empty list with helpful message
            return []
        
        return recommendations
        
    except Exception as e:
        print(f"Error getting job recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate recommendations: {str(e)}"
        )


@router.get("/stats")
async def get_recommendation_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get summary statistics about job recommendations
    """
    try:
        recommendations = get_job_recommendations(db, current_user.id, limit=50)
        
        if not recommendations:
            return {
                "total_jobs": 0,
                "excellent_matches": 0,
                "good_matches": 0,
                "average_match_score": 0,
                "total_skill_gaps": 0
            }
        
        excellent = len([r for r in recommendations if r['match_score'] >= 80])
        good = len([r for r in recommendations if 60 <= r['match_score'] < 80])
        avg_score = sum(r['match_score'] for r in recommendations) / len(recommendations)
        total_gaps = sum(len(r.get('missing_skills', [])) for r in recommendations)
        
        return {
            "total_jobs": len(recommendations),
            "excellent_matches": excellent,
            "good_matches": good,
            "average_match_score": round(avg_score, 1),
            "total_skill_gaps": total_gaps
        }
        
    except Exception as e:
        print(f"Error getting stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
