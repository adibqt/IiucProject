"""
Job Recommendation Service with AI-Powered Matching
Uses Gemini AI to analyze user profiles and recommend jobs with skill gap analysis
"""
import google.generativeai as genai
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json
from models import User, Job, Skill, Course
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash-exp')


def get_user_profile_summary(db: Session, user_id: int) -> Dict[str, Any]:
    """
    Get comprehensive user profile data for job matching
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {}
    
    # Get user skills
    user_skills = [skill.name for skill in user.skills]
    
    # Get career interests (parse JSON if exists)
    career_interests = []
    if user.career_interests:
        try:
            career_interests = json.loads(user.career_interests)
        except:
            career_interests = [user.career_interests] if user.career_interests else []
    
    return {
        "user_id": user.id,
        "full_name": user.full_name,
        "skills": user_skills,
        "experience_description": user.experience_description or "",
        "career_interests": career_interests,
        "bio": user.bio or ""
    }


def get_all_active_jobs(db: Session) -> List[Dict[str, Any]]:
    """
    Get all active jobs with their details
    """
    jobs = db.query(Job).filter(Job.is_active == True).all()
    
    job_list = []
    for job in jobs:
        # Parse required skills - could be skill IDs or names
        required_skills = []
        if job.required_skills:
            try:
                # Try to parse as JSON first (could be array of IDs or names)
                parsed_skills = json.loads(job.required_skills)
                
                # Check if they are integers (skill IDs) or strings (skill names)
                if parsed_skills and isinstance(parsed_skills[0], int):
                    # They are skill IDs, convert to names
                    skill_ids = parsed_skills
                    skills = db.query(Skill).filter(Skill.id.in_(skill_ids)).all()
                    required_skills = [skill.name for skill in skills]
                else:
                    # They are already skill names
                    required_skills = [str(s) for s in parsed_skills]
            except (json.JSONDecodeError, TypeError, IndexError):
                # Not JSON, try comma-separated string
                if job.required_skills:
                    required_skills = [s.strip() for s in str(job.required_skills).split(',') if s.strip()]
        
        job_list.append({
            "id": job.id,
            "title": job.title,
            "company_name": job.company_name,
            "location": job.location,
            "job_type": job.job_type,
            "experience_level": job.experience_level,
            "required_skills": required_skills,
            "requirements": job.requirements or "",
            "description": job.description or "",
            "salary_range": job.salary_range
        })
    
    return job_list


def get_relevant_courses_for_skills(db: Session, skill_names: List[str]) -> List[Dict[str, Any]]:
    """
    Find courses that teach the missing skills
    """
    courses = db.query(Course).filter(Course.is_active == True).all()
    
    relevant_courses = []
    for course in courses:
        # Check if course teaches any of the missing skills
        course_relevance = 0
        for skill in skill_names:
            skill_lower = skill.lower()
            if (skill_lower in course.title.lower() or 
                skill_lower in (course.description or "").lower()):
                course_relevance += 1
        
        if course_relevance > 0:
            relevant_courses.append({
                "id": course.id,
                "title": course.title,
                "platform": course.platform,
                "url": course.url,
                "cost_type": course.cost_type,
                "relevance_score": course_relevance
            })
    
    # Sort by relevance
    relevant_courses.sort(key=lambda x: x["relevance_score"], reverse=True)
    return relevant_courses[:5]  # Top 5 most relevant


def analyze_job_match_with_ai(
    user_profile: Dict[str, Any],
    job: Dict[str, Any],
    db: Session
) -> Dict[str, Any]:
    """
    Use Gemini AI to analyze job match and provide detailed recommendations
    """
    
    prompt = f"""
You are an expert career advisor and job matching AI. Analyze the following user profile and job posting to provide a detailed match analysis.

USER PROFILE:
- Skills: {', '.join(user_profile['skills'])}
- Career Interests: {', '.join(user_profile['career_interests'])}
- Experience: {user_profile['experience_description']}
- Bio: {user_profile['bio']}

JOB POSTING:
- Title: {job['title']}
- Company: {job['company_name']}
- Required Skills: {', '.join(job['required_skills'])}
- Experience Level: {job['experience_level']}
- Requirements: {job['requirements']}

TASK:
Analyze the match between the user and this job. Return a JSON object with the following structure:

{{
  "match_score": <integer 0-100>,
  "match_level": "<excellent/good/fair/poor>",
  "matching_skills": [<list of user skills that match job requirements>],
  "missing_skills": [<list of required skills the user doesn't have>],
  "skill_gaps": [
    {{
      "skill": "<missing skill name>",
      "importance": "<critical/important/nice-to-have>",
      "learning_effort": "<easy/moderate/advanced>"
    }}
  ],
  "strengths": [<list of 2-3 key strengths for this role>],
  "concerns": [<list of 1-2 main concerns or gaps>],
  "recommendation": "<detailed recommendation text>",
  "experience_match": "<matches/exceeds/below> expectations",
  "career_alignment": <integer 0-100 how well this aligns with career interests>
}}

SCORING CRITERIA:
- Skill overlap: 50% weight
- Experience level match: 25% weight
- Career interest alignment: 25% weight

Return ONLY the JSON object, no additional text.
"""
    
    try:
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Clean up response
        if result_text.startswith('```json'):
            result_text = result_text[7:]
        if result_text.endswith('```'):
            result_text = result_text[:-3]
        
        analysis = json.loads(result_text.strip())
        
        # Get learning resources for missing skills
        if analysis.get('missing_skills'):
            courses = get_relevant_courses_for_skills(db, analysis['missing_skills'])
            analysis['recommended_courses'] = courses
        else:
            analysis['recommended_courses'] = []
        
        # Add job details to the response
        analysis['job'] = job
        
        return analysis
        
    except Exception as e:
        print(f"Error in AI analysis: {e}")
        # Fallback to basic matching
        return fallback_match_analysis(user_profile, job, db)


def fallback_match_analysis(
    user_profile: Dict[str, Any],
    job: Dict[str, Any],
    db: Session
) -> Dict[str, Any]:
    """
    Simple rule-based matching as fallback
    """
    user_skills_lower = [s.lower() for s in user_profile['skills']]
    job_skills_lower = [s.lower() for s in job['required_skills']]
    
    # Calculate matching skills
    matching_skills = [s for s in user_profile['skills'] 
                      if s.lower() in job_skills_lower]
    
    missing_skills = [s for s in job['required_skills'] 
                     if s.lower() not in user_skills_lower]
    
    # Calculate basic match score
    if len(job_skills_lower) > 0:
        skill_match = (len(matching_skills) / len(job_skills_lower)) * 100
    else:
        skill_match = 50
    
    # Get learning resources
    courses = get_relevant_courses_for_skills(db, missing_skills)
    
    return {
        "match_score": int(skill_match),
        "match_level": "good" if skill_match >= 60 else "fair",
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "skill_gaps": [
            {
                "skill": skill,
                "importance": "important",
                "learning_effort": "moderate"
            }
            for skill in missing_skills[:5]
        ],
        "strengths": matching_skills[:3],
        "concerns": missing_skills[:2] if missing_skills else ["Consider gaining more experience"],
        "recommendation": f"You match {len(matching_skills)} out of {len(job['required_skills'])} required skills. Focus on learning: {', '.join(missing_skills[:3])}",
        "experience_match": "matches expectations",
        "career_alignment": 70,
        "recommended_courses": courses,
        "job": job
    }


def get_job_recommendations(db: Session, user_id: int, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Get AI-powered job recommendations for a user
    """
    try:
        # Get user profile
        user_profile = get_user_profile_summary(db, user_id)
        if not user_profile or not user_profile.get('skills'):
            return []
        
        # Get all active jobs
        jobs = get_all_active_jobs(db)
        
        if not jobs:
            return []
        
        # Analyze each job
        recommendations = []
        for job in jobs:
            try:
                analysis = analyze_job_match_with_ai(user_profile, job, db)
                recommendations.append(analysis)
            except Exception as e:
                print(f"Error analyzing job {job.get('id', 'unknown')}: {e}")
                # Continue with other jobs even if one fails
                continue
        
        # Sort by match score
        recommendations.sort(key=lambda x: x.get('match_score', 0), reverse=True)
        
        return recommendations[:limit]
    except Exception as e:
        print(f"Error in get_job_recommendations: {e}")
        import traceback
        traceback.print_exc()
        return []
