"""
Opportunity Routes - API endpoints for local opportunity recommendations
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import User, UserResume, Skill, LocalOpportunity, UserRole
from api_users import get_current_user
from schemas import (
    LocalOpportunityCreate,
    LocalOpportunityUpdate,
    LocalOpportunityResponse,
    OpportunityRecommendationResponse
)
from services.opportunity_service import (
    build_user_context_for_opportunities,
    generate_opportunity_recommendations,
    filter_opportunities_by_user_profile
)
from services.language_service import detect_language
from datetime import datetime
import json

router = APIRouter(prefix="/api/opportunities", tags=["opportunities"])


# ==================== Opportunity Recommendation Endpoint ====================

@router.get("/recommend", response_model=OpportunityRecommendationResponse)
async def get_opportunity_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get personalized local opportunity recommendations for the current user.
    
    Protected route - requires valid JWT token.
    
    Steps:
    1. Fetch user profile, skills, and CV data
    2. Fetch all active local opportunities
    3. Filter opportunities based on user profile and skills
    4. Generate personalized explanation using Gemini
    5. Return ranked opportunities with explanations
    
    Returns:
        - explanation: Gemini-generated personalized text
        - opportunities: Ranked list of matching opportunities
        - total_matched: Count of matched opportunities
    """
    try:
        # 1. Fetch user profile (current_user already has profile data)
        user_profile = current_user
        
        # 2. Fetch user skills
        from models import user_skills as user_skills_table
        skill_ids_result = db.query(user_skills_table.c.skill_id).filter(
            user_skills_table.c.user_id == current_user.id
        ).all()
        
        user_skills = []
        if skill_ids_result:
            skill_ids_list = [row[0] for row in skill_ids_result]
            if skill_ids_list:
                user_skills = db.query(Skill).filter(Skill.id.in_(skill_ids_list)).all()
        
        # 3. Fetch user CV data
        user_cv = db.query(UserResume).filter(
            UserResume.user_id == current_user.id
        ).first()
        
        # 4. Fetch all active local opportunities
        all_opportunities = db.query(LocalOpportunity).filter(
            LocalOpportunity.is_active == True
        ).all()
        
        if not all_opportunities:
            return OpportunityRecommendationResponse(
                success=True,
                explanation="Currently, there are no local opportunities available in our database. Please check back later or contact support for more information.",
                opportunities=[],
                total_matched=0
            )
        
        # 5. Filter opportunities based on user profile
        # Get user's preferred track from career_interests or experience_description
        user_track = None
        if current_user.career_interests:
            try:
                interests = json.loads(current_user.career_interests)
                if interests and len(interests) > 0:
                    user_track = interests[0]  # Use first career interest as track
            except:
                pass
        
        filtered_opportunities = filter_opportunities_by_user_profile(
            all_opportunities,
            user_skills,
            user_track
        )
        
        # 6. Build user context
        user_context = build_user_context_for_opportunities(
            user_profile,
            user_skills,
            user_cv
        )
        
        # 7. Detect language for Gemini response
        # Use a sample of user's text to detect language
        sample_text = ""
        if current_user.experience_description:
            sample_text = current_user.experience_description[:100]
        elif user_cv and user_cv.personal_summary:
            sample_text = user_cv.personal_summary[:100]
        
        detected_language = detect_language(sample_text) if sample_text else "en"
        
        # 8. Generate personalized explanation using Gemini
        explanation = generate_opportunity_recommendations(
            user_context,
            filtered_opportunities,
            detected_language
        )
        
        # 9. Return response
        return OpportunityRecommendationResponse(
            success=True,
            explanation=explanation,
            opportunities=filtered_opportunities,
            total_matched=len(filtered_opportunities)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_opportunity_recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate opportunity recommendations: {str(e)}"
        )


# ==================== Admin/Management Endpoints ====================

async def get_admin_user(current_user: User = Depends(get_current_user)):
    """Dependency to ensure current user is an admin"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.get("/all", response_model=List[LocalOpportunityResponse])
async def get_all_opportunities(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get all local opportunities (admin only).
    
    Protected route - requires admin JWT token.
    """
    try:
        opportunities = db.query(LocalOpportunity).offset(skip).limit(limit).all()
        return opportunities
    except Exception as e:
        print(f"Error fetching all opportunities: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch opportunities"
        )


@router.post("/create", response_model=LocalOpportunityResponse, status_code=status.HTTP_201_CREATED)
async def create_opportunity(
    opportunity_data: LocalOpportunityCreate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Create a new local opportunity (admin only).
    
    Protected route - requires admin JWT token.
    """
    try:
        # Create new opportunity
        new_opportunity = LocalOpportunity(**opportunity_data.dict())
        db.add(new_opportunity)
        db.commit()
        db.refresh(new_opportunity)
        
        return new_opportunity
    except Exception as e:
        print(f"Error creating opportunity: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create opportunity: {str(e)}"
        )


@router.put("/{opportunity_id}", response_model=LocalOpportunityResponse)
async def update_opportunity(
    opportunity_id: int,
    opportunity_data: LocalOpportunityUpdate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update a local opportunity (admin only).
    
    Protected route - requires admin JWT token.
    """
    try:
        opportunity = db.query(LocalOpportunity).filter(
            LocalOpportunity.id == opportunity_id
        ).first()
        
        if not opportunity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Opportunity not found"
            )
        
        # Update fields
        update_data = opportunity_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(opportunity, field, value)
        
        opportunity.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(opportunity)
        
        return opportunity
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating opportunity: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update opportunity: {str(e)}"
        )


@router.delete("/{opportunity_id}")
async def delete_opportunity(
    opportunity_id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete a local opportunity (admin only).
    
    Protected route - requires admin JWT token.
    """
    try:
        opportunity = db.query(LocalOpportunity).filter(
            LocalOpportunity.id == opportunity_id
        ).first()
        
        if not opportunity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Opportunity not found"
            )
        
        title = opportunity.title
        db.delete(opportunity)
        db.commit()
        
        return {
            "success": True,
            "message": f"Opportunity '{title}' deleted successfully",
            "opportunity_id": opportunity_id
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting opportunity: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete opportunity: {str(e)}"
        )


@router.get("/{opportunity_id}", response_model=LocalOpportunityResponse)
async def get_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific opportunity by ID (public endpoint).
    """
    try:
        opportunity = db.query(LocalOpportunity).filter(
            LocalOpportunity.id == opportunity_id,
            LocalOpportunity.is_active == True
        ).first()
        
        if not opportunity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Opportunity not found"
            )
        
        return opportunity
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching opportunity: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch opportunity"
        )

