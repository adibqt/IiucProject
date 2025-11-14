"""
Roadmap Routes - API endpoints for AI-generated career roadmaps
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, UserResume, Skill, CareerRoadmap
from api_users import get_current_user
from services.roadmap_service import generate_career_roadmap
from schemas import RoadmapGenerateRequest, RoadmapGenerateResponse, RoadmapResponse
from datetime import datetime
import json

router = APIRouter(prefix="/api/roadmap", tags=["roadmap"])


@router.post("/generate", response_model=RoadmapGenerateResponse)
async def generate_roadmap(
    request: RoadmapGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a new career roadmap for the current user.
    
    Protected route - requires valid JWT token.
    
    Steps:
    1. Validate input
    2. Fetch user profile, skills, and CV data
    3. Build input context
    4. Generate roadmap using Gemini
    5. Parse and save to database
    6. Return roadmap data
    """
    try:
        # 1. Validate input (already validated by Pydantic)
        target_role = request.targetRole.strip()
        timeframe = request.timeframe.strip()
        weekly_hours = request.weeklyHours
        
        if not target_role or not timeframe:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="target_role and timeframe are required"
            )
        
        # 2. Fetch user profile (current_user already has profile data)
        user_profile = current_user
        
        # 3. Fetch user skills
        from models import user_skills as user_skills_table
        skill_ids_result = db.query(user_skills_table.c.skill_id).filter(
            user_skills_table.c.user_id == current_user.id
        ).all()
        
        user_skills = []
        if skill_ids_result:
            skill_ids_list = [row[0] for row in skill_ids_result]
            if skill_ids_list:
                user_skills = db.query(Skill).filter(Skill.id.in_(skill_ids_list)).all()
        
        # 4. Fetch user CV data
        user_cv = db.query(UserResume).filter(
            UserResume.user_id == current_user.id
        ).first()
        
        # 5. Build input context snapshot (for storage)
        input_context = {
            "target_role": target_role,
            "timeframe": timeframe,
            "weekly_hours": weekly_hours,
            "user_profile": {
                "name": user_profile.full_name or "",
                "bio": user_profile.bio or "",
                "experience_description": user_profile.experience_description or "",
                "career_interests": json.loads(user_profile.career_interests) if user_profile.career_interests else [],
            },
            "skills": [skill.name for skill in user_skills],
            "cv_data": {
                "has_cv": user_cv is not None,
                "experiences_count": len(json.loads(user_cv.experiences)) if user_cv and user_cv.experiences else 0,
                "projects_count": len(json.loads(user_cv.projects)) if user_cv and user_cv.projects else 0,
            } if user_cv else {"has_cv": False}
        }
        
        # 6. Generate roadmap using Gemini
        visual_roadmap, description, user_context = generate_career_roadmap(
            user_profile=user_profile,
            user_skills=user_skills,
            user_cv=user_cv,
            target_role=target_role,
            timeframe=timeframe,
            weekly_hours=weekly_hours
        )
        
        # 7. Save to database
        roadmap = CareerRoadmap(
            user_id=current_user.id,
            target_role=target_role,
            timeframe=timeframe,
            weekly_hours=weekly_hours,
            input_context=json.dumps(input_context),
            roadmap_visual=visual_roadmap,
            roadmap_description=description
        )
        
        db.add(roadmap)
        db.commit()
        db.refresh(roadmap)
        
        # 8. Return response
        return RoadmapGenerateResponse(
            success=True,
            roadmap_id=roadmap.id,
            visual=roadmap.roadmap_visual,
            description=roadmap.roadmap_description
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in generate_roadmap: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate roadmap: {str(e)}"
        )


@router.get("/all", response_model=List[RoadmapResponse])
async def get_all_roadmaps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all roadmaps for the current user.
    
    Protected route - returns only the user's own roadmaps.
    Returns roadmaps sorted by creation date (newest first).
    """
    try:
        roadmaps = db.query(CareerRoadmap).filter(
            CareerRoadmap.user_id == current_user.id
        ).order_by(
            CareerRoadmap.created_at.desc()
        ).all()
        
        return roadmaps
        
    except Exception as e:
        print(f"Error fetching roadmaps: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch roadmaps"
        )


@router.get("/{roadmap_id}", response_model=RoadmapResponse)
async def get_roadmap(
    roadmap_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific roadmap by ID.
    
    Protected route - users can only access their own roadmaps.
    """
    try:
        roadmap = db.query(CareerRoadmap).filter(
            CareerRoadmap.id == roadmap_id,
            CareerRoadmap.user_id == current_user.id
        ).first()
        
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Roadmap not found"
            )
        
        return roadmap
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching roadmap: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch roadmap"
        )


@router.delete("/{roadmap_id}")
async def delete_roadmap(
    roadmap_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a roadmap by ID.
    
    Protected route - users can only delete their own roadmaps.
    """
    try:
        roadmap = db.query(CareerRoadmap).filter(
            CareerRoadmap.id == roadmap_id,
            CareerRoadmap.user_id == current_user.id
        ).first()
        
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Roadmap not found"
            )
        
        target_role = roadmap.target_role
        db.delete(roadmap)
        db.commit()
        
        return {
            "success": True,
            "message": f"Roadmap for '{target_role}' deleted successfully",
            "roadmap_id": roadmap_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting roadmap: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete roadmap"
        )

