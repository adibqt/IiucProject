"""
User service module
Contains business logic for user registration, authentication, and profile management
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime
from models import User, UserRole, ExperienceLevel
from schemas import UserRegister, UserUpdate, UserProfile
from auth import verify_password, get_password_hash, create_access_token
import json


class UserService:
    """User management service"""
    
    @staticmethod
    def register_user(db: Session, user_data: UserRegister) -> User:
        """
        Register a new user
        
        Args:
            db: Database session
            user_data: User registration data
        
        Returns:
            Created user object
        
        Raises:
            HTTPException: If email already exists or validation fails
        """
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create username from email if not provided (first part of email)
        username = user_data.email.split('@')[0]
        
        # Check if username already exists
        existing_username = db.query(User).filter(User.username == username).first()
        if existing_username:
            # Append a number to make it unique
            counter = 1
            while db.query(User).filter(User.username == f"{username}{counter}").first():
                counter += 1
            username = f"{username}{counter}"
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        
        new_user = User(
            email=user_data.email,
            username=username,
            full_name=user_data.full_name,
            hashed_password=hashed_password,
            role=UserRole.STUDENT,  # New users are always students
            is_active=True,
            is_verified=False,  # Would require email verification in production
            created_at=datetime.utcnow()
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return new_user
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User:
        """
        Authenticate a user by email and password
        
        Args:
            db: Database session
            email: User email
            password: User password (plain text)
        
        Returns:
            User object if authenticated
        
        Raises:
            HTTPException: If credentials are invalid
        """
        # Find user by email
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive"
            )
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        
        return user
    
    @staticmethod
    def get_user_profile(db: Session, user_id: int) -> User:
        """
        Get user profile by ID
        
        Args:
            db: Database session
            user_id: User ID
        
        Returns:
            User object
        
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
    def update_user_profile(db: Session, user_id: int, update_data: UserUpdate) -> User:
        """
        Update user profile
        
        Args:
            db: Database session
            user_id: User ID
            update_data: Update data
        
        Returns:
            Updated user object
        
        Raises:
            HTTPException: If user not found
        """
        user = UserService.get_user_profile(db, user_id)
        
        # Update only provided fields
        update_dict = update_data.dict(exclude_unset=True)
        for field, value in update_dict.items():
            if value is not None:
                setattr(user, field, value)
        
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        
        return user
    
    @staticmethod
    def add_skill(db: Session, user_id: int, skill: str) -> User:
        """
        Add a skill to user's skills list
        
        Args:
            db: Database session
            user_id: User ID
            skill: Skill name to add
        
        Returns:
            Updated user object
        """
        user = UserService.get_user_profile(db, user_id)
        
        # Parse existing skills (stored as JSON)
        skills = []
        if user.skills:
            try:
                skills = json.loads(user.skills)
            except (json.JSONDecodeError, TypeError):
                skills = []
        
        # Add skill if not already present
        if skill.lower() not in [s.lower() for s in skills]:
            skills.append(skill)
            user.skills = json.dumps(skills)
            user.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(user)
        
        return user
    
    @staticmethod
    def remove_skill(db: Session, user_id: int, skill: str) -> User:
        """
        Remove a skill from user's skills list
        
        Args:
            db: Database session
            user_id: User ID
            skill: Skill name to remove
        
        Returns:
            Updated user object
        """
        user = UserService.get_user_profile(db, user_id)
        
        # Parse existing skills
        skills = []
        if user.skills:
            try:
                skills = json.loads(user.skills)
            except (json.JSONDecodeError, TypeError):
                skills = []
        
        # Remove skill (case-insensitive)
        skills = [s for s in skills if s.lower() != skill.lower()]
        user.skills = json.dumps(skills) if skills else None
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        
        return user
    
    @staticmethod
    def get_user_skills(db: Session, user_id: int) -> list:
        """
        Get user's skills list
        
        Args:
            db: Database session
            user_id: User ID
        
        Returns:
            List of skill strings
        """
        user = UserService.get_user_profile(db, user_id)
        
        if not user.skills:
            return []
        
        try:
            return json.loads(user.skills)
        except (json.JSONDecodeError, TypeError):
            return []
    
    @staticmethod
    def set_cv_text(db: Session, user_id: int, cv_text: str) -> User:
        """
        Set user's CV/resume text
        
        Args:
            db: Database session
            user_id: User ID
            cv_text: CV text content
        
        Returns:
            Updated user object
        """
        user = UserService.get_user_profile(db, user_id)
        user.cv_text = cv_text
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return user
