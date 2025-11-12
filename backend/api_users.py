"""
User API routes
Handles user registration, authentication, and profile management
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models import User
from schemas import (
    UserRegister, UserLogin, UserProfile, UserUpdate, UserLoginResponse, SuccessResponse
)
from auth import create_access_token, decode_access_token
from user_service import UserService

router = APIRouter(prefix="/api/users", tags=["users"])


# ==================== Dependencies ====================

async def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    """
    Dependency to get current authenticated user from JWT token
    Used to protect user routes
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


# ==================== Authentication Routes ====================

@router.post("/register", response_model=UserLoginResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user
    
    Returns:
        JWT token and user profile on success
    """
    # Register user
    new_user = UserService.register_user(db, user_data)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": new_user.email, "role": new_user.role.value}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }


@router.post("/login", response_model=UserLoginResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT token
    
    Returns:
        JWT token and user profile on success
    """
    # Authenticate user
    user = UserService.authenticate_user(db, credentials.email, credentials.password)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


# ==================== Profile Routes ====================

@router.get("/me", response_model=UserProfile)
async def get_profile(current_user: User = Depends(get_current_user)):
    """
    Get current user's profile
    Protected route - requires valid JWT token
    """
    return current_user


@router.put("/me", response_model=UserProfile)
async def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile
    Protected route - requires valid JWT token
    """
    updated_user = UserService.update_user_profile(db, current_user.id, update_data)
    return updated_user


@router.get("/{user_id}", response_model=UserProfile)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Get user profile by ID (public endpoint)
    Returns limited information
    """
    user = UserService.get_user_profile(db, user_id)
    return user


# ==================== Skills Routes ====================

@router.post("/me/skills", response_model=SuccessResponse)
async def add_skill(
    skill: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a skill to current user's profile
    Protected route
    
    Query parameter:
        skill: Skill name to add
    """
    UserService.add_skill(db, current_user.id, skill)
    return {
        "success": True,
        "message": f"Skill '{skill}' added successfully"
    }


@router.delete("/me/skills", response_model=SuccessResponse)
async def remove_skill(
    skill: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a skill from current user's profile
    Protected route
    
    Query parameter:
        skill: Skill name to remove
    """
    UserService.remove_skill(db, current_user.id, skill)
    return {
        "success": True,
        "message": f"Skill '{skill}' removed successfully"
    }


@router.get("/me/skills")
async def get_skills(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get current user's skills list
    Protected route
    """
    skills = UserService.get_user_skills(db, current_user.id)
    return {
        "skills": skills,
        "count": len(skills)
    }


# ==================== CV Routes ====================

@router.put("/me/cv", response_model=SuccessResponse)
async def update_cv(
    cv_text: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's CV/resume text
    Protected route
    
    Note: This stores raw CV text for future AI analysis
    
    Body:
        cv_text: CV text content
    """
    UserService.set_cv_text(db, current_user.id, cv_text)
    return {
        "success": True,
        "message": "CV updated successfully"
    }


@router.post("/logout", response_model=SuccessResponse)
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logout user
    Protected route
    
    Note: JWT tokens are stateless, so logout only clears client-side token
    """
    return {
        "success": True,
        "message": "Logged out successfully"
    }
