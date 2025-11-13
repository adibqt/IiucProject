"""
Job service - business logic for creating and validating jobs
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models import Job, Skill
import json
from datetime import datetime


def _parse_required_skills(required_skills):
    """Accept either a JSON string or a Python list and return list of ints (skill ids)"""
    if required_skills is None:
        return []
    if isinstance(required_skills, str):
        try:
            parsed = json.loads(required_skills)
        except Exception:
            # fallback: try to parse comma separated
            parsed = [s.strip() for s in required_skills.split(',') if s.strip()]
    else:
        parsed = required_skills

    # Normalize to ints where possible
    cleaned = []
    for item in parsed:
        try:
            cleaned.append(int(item))
        except Exception:
            # if it's a name, leave as string (validation will check)
            cleaned.append(item)
    return cleaned


def validate_skills_exist(db: Session, skill_ids_or_names: list) -> list:
    """Validate each provided skill identifier against Skill table.
    Accepts integer IDs or skill names. Returns list of skill ids.
    Raises HTTPException if any skill is not found.
    """
    if not skill_ids_or_names:
        return []

    found_ids = []
    for s in skill_ids_or_names:
        if isinstance(s, int):
            skill = db.query(Skill).filter(Skill.id == s).first()
        else:
            skill = db.query(Skill).filter(Skill.name.ilike(str(s))).first()

        if not skill:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Skill not found: {s}"
            )
        found_ids.append(skill.id)

    return found_ids


def create_job(db: Session, job_data, posted_by: int) -> Job:
    """Create and persist a Job instance with validated skills.
    job_data is a Pydantic object (JobCreate)
    """
    # parse and validate required skills
    parsed = _parse_required_skills(getattr(job_data, 'required_skills', None))
    validated_skill_ids = validate_skills_exist(db, parsed)

    job_kwargs = job_data.dict()
    # store required_skills as JSON string of ids
    job_kwargs['required_skills'] = json.dumps(validated_skill_ids)
    job_kwargs['posted_by'] = posted_by
    job_kwargs['created_at'] = datetime.utcnow()

    new_job = Job(**job_kwargs)
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return new_job
