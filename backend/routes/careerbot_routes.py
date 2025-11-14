"""
CareerBot Routes - API endpoints for AI-powered career guidance
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, List, Optional
from pydantic import BaseModel
from database import get_db
from models import User, UserResume, Skill, CareerBotConversation, CareerBotSession
from api_users import get_current_user
from services.guardrail_service import filter_out_of_context, get_safe_fallback_response
from services.language_service import detect_language
from services.careerbot_service import get_career_bot_response
from datetime import datetime
import json

router = APIRouter(prefix="/api/careerbot", tags=["careerbot"])


# ==================== Request/Response Schemas ====================

class CareerBotAskRequest(BaseModel):
    message: str
    session_id: Optional[int] = None


class CareerBotResponse(BaseModel):
    reply: str
    language: str
    session_id: int


class SessionCreateRequest(BaseModel):
    title: Optional[str] = "New Chat"


class SessionUpdateRequest(BaseModel):
    title: str


class SessionResponse(BaseModel):
    id: int
    title: str
    created_at: str
    updated_at: str
    last_message_at: str
    message_count: int


class MessageResponse(BaseModel):
    role: str
    message: str
    language: str
    timestamp: str


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
        # 0. Get or create session
        session_id = request.session_id
        if session_id:
            # Verify session belongs to user
            session = db.query(CareerBotSession).filter(
                CareerBotSession.id == session_id,
                CareerBotSession.user_id == current_user.id
            ).first()
            if not session:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Session not found"
                )
        else:
            # Create new session
            session = CareerBotSession(
                user_id=current_user.id,
                title="New Chat"
            )
            db.add(session)
            db.flush()  # Get the ID without committing
            session_id = session.id
        
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
                session_id=session_id,
                role="user",
                message=user_message,
                language="en"
            )
            db.add(blocked_msg)
            
            # Store bot's safe response
            safe_response = get_safe_fallback_response()
            bot_response = CareerBotConversation(
                user_id=current_user.id,
                session_id=session_id,
                role="bot",
                message=safe_response,
                language="en"
            )
            db.add(bot_response)
            
            # Update session's last_message_at
            session.last_message_at = datetime.utcnow()
            
            db.commit()
            
            return CareerBotResponse(
                reply=safe_response,
                language="en",
                session_id=session_id
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
            session_id=session_id,
            role="user",
            message=sanitized_message,
            language=detected_language
        )
        db.add(user_msg_record)
        
        # Store bot response
        bot_msg_record = CareerBotConversation(
            user_id=current_user.id,
            session_id=session_id,
            role="bot",
            message=bot_reply,
            language=detected_language
        )
        db.add(bot_msg_record)
        
        # Update session's last_message_at
        session.last_message_at = datetime.utcnow()
        
        # Auto-generate title from first user message if still "New Chat"
        if session.title == "New Chat":
            # Use first 50 chars of user message as title
            session.title = sanitized_message[:50] + ("..." if len(sanitized_message) > 50 else "")
        
        db.commit()
        
        # 9. Return response
        return CareerBotResponse(
            reply=bot_reply,
            language=detected_language,
            session_id=session_id
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
    session_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get conversation history for a specific session or all conversations.
    
    If session_id is provided, returns messages for that session only.
    Otherwise, returns all conversations for the user.
    
    Protected route - returns user's own conversation history only.
    Returns messages in chronological order (oldest first) for proper chat display.
    """
    try:
        query = db.query(CareerBotConversation).filter(
            CareerBotConversation.user_id == current_user.id
        )
        
        if session_id:
            # Verify session belongs to user
            session = db.query(CareerBotSession).filter(
                CareerBotSession.id == session_id,
                CareerBotSession.user_id == current_user.id
            ).first()
            if not session:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Session not found"
                )
            query = query.filter(CareerBotConversation.session_id == session_id)
        
        conversations = query.order_by(
            CareerBotConversation.created_at.asc()  # Oldest first for chat display
        ).all()
        
        return [
            {
                "role": conv.role,
                "message": conv.message,
                "language": conv.language,
                "timestamp": conv.created_at.isoformat() if conv.created_at else None
            }
            for conv in conversations
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching conversation history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch conversation history"
        )


# ==================== Session Management Endpoints ====================

@router.get("/sessions", response_model=List[SessionResponse])
async def get_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all conversation sessions for the current user.
    Returns sessions sorted by last_message_at (most recent first).
    """
    try:
        sessions = db.query(CareerBotSession).filter(
            CareerBotSession.user_id == current_user.id
        ).order_by(
            CareerBotSession.last_message_at.desc()
        ).all()
        
        result = []
        for session in sessions:
            message_count = db.query(CareerBotConversation).filter(
                CareerBotConversation.session_id == session.id
            ).count()
            
            result.append(SessionResponse(
                id=session.id,
                title=session.title,
                created_at=session.created_at.isoformat() if session.created_at else None,
                updated_at=session.updated_at.isoformat() if session.updated_at else None,
                last_message_at=session.last_message_at.isoformat() if session.last_message_at else None,
                message_count=message_count
            ))
        
        return result
        
    except Exception as e:
        print(f"Error fetching sessions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch sessions"
        )


@router.post("/sessions", response_model=SessionResponse)
async def create_session(
    request: SessionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new conversation session.
    """
    try:
        session = CareerBotSession(
            user_id=current_user.id,
            title=request.title or "New Chat"
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        
        return SessionResponse(
            id=session.id,
            title=session.title,
            created_at=session.created_at.isoformat() if session.created_at else None,
            updated_at=session.updated_at.isoformat() if session.updated_at else None,
            last_message_at=session.last_message_at.isoformat() if session.last_message_at else None,
            message_count=0
        )
        
    except Exception as e:
        print(f"Error creating session: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create session"
        )


@router.patch("/sessions/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: int,
    request: SessionUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a conversation session (rename title).
    """
    try:
        session = db.query(CareerBotSession).filter(
            CareerBotSession.id == session_id,
            CareerBotSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        session.title = request.title
        session.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(session)
        
        message_count = db.query(CareerBotConversation).filter(
            CareerBotConversation.session_id == session.id
        ).count()
        
        return SessionResponse(
            id=session.id,
            title=session.title,
            created_at=session.created_at.isoformat() if session.created_at else None,
            updated_at=session.updated_at.isoformat() if session.updated_at else None,
            last_message_at=session.last_message_at.isoformat() if session.last_message_at else None,
            message_count=message_count
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating session: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update session"
        )


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a conversation session and all its messages.
    """
    try:
        session = db.query(CareerBotSession).filter(
            CareerBotSession.id == session_id,
            CareerBotSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        db.delete(session)
        db.commit()
        
        return {"message": "Session deleted successfully", "session_id": session_id}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting session: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete session"
        )

