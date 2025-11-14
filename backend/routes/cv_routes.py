"""
CV Routes - API endpoints for CV/Resume management
"""
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from database import get_db
from models import User, UserResume
from schemas import CVCreate, CVResponse, SuccessResponse
from api_users import get_current_user
from services.cv_service import CVService

router = APIRouter(prefix="/api/cv", tags=["cv"])

# Directory to store uploaded CV PDFs
CV_UPLOAD_DIR = Path("uploads/cv_pdfs")
CV_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ==================== CV Endpoints ====================

@router.post("", response_model=CVResponse, status_code=status.HTTP_201_CREATED)
async def create_or_update_cv(
    cv_data: CVCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create or update current user's CV/resume
    Protected route - requires valid JWT token
    
    This endpoint:
    - Creates a new CV if one doesn't exist
    - Updates existing CV if one exists
    - Validates skill IDs against admin-defined skills
    - Stores structured CV data for future AI processing
    """
    try:
        resume = CVService.create_or_update_resume(db, current_user.id, cv_data)
        formatted_resume = CVService.format_resume_response(resume)
        return formatted_resume
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save CV: {str(e)}"
        )


@router.get("/me", response_model=CVResponse)
async def get_my_cv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's CV/resume
    Protected route - requires valid JWT token
    
    Returns structured CV data with parsed JSON fields
    """
    resume = CVService.get_user_resume(db, current_user.id)
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found. Create a CV first using POST /api/cv"
        )
    
    formatted_resume = CVService.format_resume_response(resume)
    return formatted_resume


@router.delete("/reset", response_model=SuccessResponse)
async def reset_cv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete/reset current user's CV
    Protected route - requires valid JWT token
    
    This allows users to start over with a fresh CV
    """
    deleted = CVService.delete_resume(db, current_user.id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )
    
    return {
        "success": True,
        "message": "CV reset successfully. You can create a new CV using POST /api/cv"
    }


# ==================== PDF CV Endpoints ====================

@router.post("/pdf", response_model=SuccessResponse)
async def upload_cv_pdf(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload CV as PDF file
    Protected route - requires valid JWT token
    
    - Only PDF files are allowed
    - User can only have one PDF at a time
    - Previous PDF will be deleted if a new one is uploaded
    """
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )
    
    # Check file size (max 10MB)
    file_content = await file.read()
    if len(file_content) > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 10MB limit"
        )
    
    # Get or create user resume
    resume = CVService.get_user_resume(db, current_user.id)
    
    # Delete existing PDF if it exists
    if resume and resume.cv_pdf_path:
        old_pdf_path = Path(resume.cv_pdf_path)
        if old_pdf_path.exists():
            old_pdf_path.unlink()
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix
    unique_filename = f"cv_{current_user.id}_{int(datetime.utcnow().timestamp())}{file_extension}"
    file_path = CV_UPLOAD_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)
    
    # Update or create resume record
    if resume:
        resume.cv_pdf_filename = file.filename
        resume.cv_pdf_path = str(file_path)
    else:
        # Create new resume record for PDF only
        resume = UserResume(
            user_id=current_user.id,
            cv_pdf_filename=file.filename,
            cv_pdf_path=str(file_path)
        )
        db.add(resume)
    
    db.commit()
    db.refresh(resume)
    
    return {
        "success": True,
        "message": f"CV PDF uploaded successfully: {file.filename}",
        "data": {
            "filename": file.filename,
            "size": len(file_content)
        }
    }


@router.get("/pdf", response_class=FileResponse)
async def download_cv_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download current user's CV PDF
    Protected route - requires valid JWT token
    """
    resume = CVService.get_user_resume(db, current_user.id)
    
    if not resume or not resume.cv_pdf_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No CV PDF found. Upload a PDF first."
        )
    
    pdf_path = Path(resume.cv_pdf_path)
    if not pdf_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV PDF file not found on server"
        )
    
    return FileResponse(
        path=str(pdf_path),
        filename=resume.cv_pdf_filename or "cv.pdf",
        media_type="application/pdf"
    )


@router.delete("/pdf", response_model=SuccessResponse)
async def delete_cv_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete current user's CV PDF
    Protected route - requires valid JWT token
    """
    resume = CVService.get_user_resume(db, current_user.id)
    
    if not resume or not resume.cv_pdf_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No CV PDF found"
        )
    
    # Delete file from filesystem
    pdf_path = Path(resume.cv_pdf_path)
    if pdf_path.exists():
        pdf_path.unlink()
    
    # Clear PDF fields in database
    resume.cv_pdf_filename = None
    resume.cv_pdf_path = None
    db.commit()
    
    return {
        "success": True,
        "message": "CV PDF deleted successfully"
    }

