"""
CareerBot Routes - API endpoints for AI-powered career guidance
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict
from pydantic import BaseModel
from database import get_db
from models import User, UserResume, Skill, CareerBotConversation
from api_users import get_current_user
from services.guardrail_service import filter_out_of_context, get_safe_fallback_response
from services.language_service import detect_language
from services.careerbot_service import get_career_bot_response
import json

router = APIRouter(prefix="/api/careerbot", tags=["careerbot"])


# ==================== Request/Response Schemas ====================

class CareerBotAskRequest(BaseModel):
    message: str


class CareerBotResponse(BaseModel):
    reply: str
    language: str


# ==================== CareerBot Endpoints ====================

@router.post("/ask", response_model=CareerBotResponse)
async def ask_career_bot(
    request: CareerBotAskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Ask CareerBot a question and get personalized career guidance.
    
    Protected route - requires valid JWT token.
    
    The bot uses:
    - User profile (name, education, experience, career track)
    - User skills (from admin-defined skills table)
    - User CV data (experiences, education, projects, tools, summary)
    
    Returns personalized advice based on user's complete profile.
    """
    try:
        # 1. Extract and validate message
        user_message = request.message.strip()
        if not user_message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message cannot be empty"
            )
        
        # 2. Run guard rail filter
        guardrail_result = filter_out_of_context(user_message)
        
        if not guardrail_result["allowed"]:
            # Store blocked message attempt
            blocked_msg = CareerBotConversation(
                user_id=current_user.id,
                role="user",
                message=user_message,
                language="en"
            )
            db.add(blocked_msg)
            
            # Store bot's safe response
            safe_response = get_safe_fallback_response()
            bot_response = CareerBotConversation(
                user_id=current_user.id,
                role="bot",
                message=safe_response,
                language="en"
            )
            db.add(bot_response)
            db.commit()
            
            return CareerBotResponse(
                reply=safe_response,
                language="en"
            )
        
        sanitized_message = guardrail_result["sanitized"]
        
        # 3. Detect message language
        detected_language = detect_language(sanitized_message)
        
        # 4. Fetch user profile data
        # User model already has: full_name, experience_level, career_interests, etc.
        user_profile = current_user
        
        # 5. Fetch user skills (from user_skills junction table)
        # Query directly from the junction table to ensure we get all skills reliably
        from models import user_skills as user_skills_table
        skill_ids_result = db.query(user_skills_table.c.skill_id).filter(
            user_skills_table.c.user_id == current_user.id
        ).all()
        
        user_skills = []
        if skill_ids_result:
            skill_ids_list = [row[0] for row in skill_ids_result]
            if skill_ids_list:
                user_skills = db.query(Skill).filter(Skill.id.in_(skill_ids_list)).all()
        
        # 6. Fetch user CV data
        user_cv = db.query(UserResume).filter(
            UserResume.user_id == current_user.id
        ).first()
        
        # 7. Build context and call Gemini API
        bot_reply = get_career_bot_response(
            message=sanitized_message,
            user_profile=user_profile,
            user_skills=user_skills,
            user_cv=user_cv,
            language=detected_language
        )
        
        # 8. Store conversation history
        # Store user message
        user_msg_record = CareerBotConversation(
            user_id=current_user.id,
            role="user",
            message=sanitized_message,
            language=detected_language
        )
        db.add(user_msg_record)
        
        # Store bot response
        bot_msg_record = CareerBotConversation(
            user_id=current_user.id,
            role="bot",
            message=bot_reply,
            language=detected_language
        )
        db.add(bot_msg_record)
        
        db.commit()
        
        # 9. Return response
        return CareerBotResponse(
            reply=bot_reply,
            language=detected_language
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in ask_career_bot: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process CareerBot request: {str(e)}"
        )


@router.get("/history")
async def get_conversation_history(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get conversation history for the current user.
    
    Protected route - returns user's own conversation history only.
    """
    conversations = db.query(CareerBotConversation).filter(
        CareerBotConversation.user_id == current_user.id
    ).order_by(
        CareerBotConversation.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return {
        "conversations": [
            {
                "id": conv.id,
                "role": conv.role,
                "message": conv.message,
                "language": conv.language,
                "created_at": conv.created_at.isoformat() if conv.created_at else None
            }
            for conv in conversations
        ],
        "count": len(conversations)
    }

