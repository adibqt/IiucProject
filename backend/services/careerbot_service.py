"""
CareerBot Service
Handles AI-powered career guidance using Gemini API with user profile context
"""
import json
from typing import Dict, Optional
from services.gemini_service import generate_text


def build_user_context(user_profile: Dict, user_skills: list, user_cv: Optional[Dict]) -> Dict:
    """
    Build a comprehensive user context object from profile, skills, and CV data.
    
    Args:
        user_profile: User model object or dict with profile fields
        user_skills: List of skill objects or skill names
        user_cv: UserResume model object or dict with CV fields
        
    Returns:
        Dictionary containing formatted user context
    """
    # Extract skills as list of names
    skills_list = []
    if user_skills:
        for skill in user_skills:
            if isinstance(skill, dict):
                skills_list.append(skill.get("name", ""))
            elif hasattr(skill, "name"):
                skills_list.append(skill.name)
            else:
                skills_list.append(str(skill))
    
    # Parse CV data
    cv_data = {}
    if user_cv:
        if hasattr(user_cv, "personal_summary"):
            # It's a model object
            cv_data = {
                "personal_summary": user_cv.personal_summary or "",
                "experiences": json.loads(user_cv.experiences) if user_cv.experiences else [],
                "education": json.loads(user_cv.education) if user_cv.education else [],
                "tools": json.loads(user_cv.tools) if user_cv.tools else [],
                "projects": json.loads(user_cv.projects) if user_cv.projects else [],
                "raw_cv_text": user_cv.raw_cv_text or "",
            }
        else:
            # It's already a dict
            cv_data = user_cv
    
    # Extract profile fields
    profile_data = {}
    if hasattr(user_profile, "full_name"):
        # It's a model object
        profile_data = {
            "name": user_profile.full_name or "",
            "education_level": getattr(user_profile, "education_level", None) or "",
            "experience_level": getattr(user_profile, "experience_level", None) or "",
            "preferred_career_track": getattr(user_profile, "preferred_career_track", None) or "",
            "career_interests": json.loads(user_profile.career_interests) if hasattr(user_profile, "career_interests") and user_profile.career_interests else [],
            "experience_description": getattr(user_profile, "experience_description", None) or "",
        }
    else:
        # It's already a dict
        profile_data = user_profile
    
    return {
        "name": profile_data.get("name", ""),
        "education_level": profile_data.get("education_level", ""),
        "experience_level": profile_data.get("experience_level", ""),
        "preferred_career_track": profile_data.get("preferred_career_track", ""),
        "career_interests": profile_data.get("career_interests", []),
        "experience_description": profile_data.get("experience_description", ""),
        "skills": skills_list,
        "tools": cv_data.get("tools", []),
        "experiences": cv_data.get("experiences", []),
        "projects": cv_data.get("projects", []),
        "personal_summary": cv_data.get("personal_summary", ""),
        "raw_cv_text": cv_data.get("raw_cv_text", ""),
    }


def build_system_prompt(language: str) -> str:
    """
    Build the system prompt for CareerBot based on detected language.
    
    Args:
        language: "en", "bn", or "mix"
        
    Returns:
        System prompt string
    """
    base_prompt = """You are CareerBot, an SDG 8-aligned youth career development assistant.

You MUST:
- Use the user's profile data (skills, education, experience level, tools, projects, CV summary) to give personalized advice
- Give suggestions for roles, skills to learn next, internships, and job readiness
- Provide practical steps and relevant explanations
- Format your responses in a natural, conversational way with proper paragraphs, bullet points, and clear structure
- Use markdown formatting when helpful (bold, italic, lists) but keep it readable as plain text
- NEVER return JSON, code blocks, or raw structured data - always write in natural, flowing text
- ALWAYS end with: "This is a suggestion, not a guaranteed outcome."

You MUST NOT:
- Answer political, religious, harmful, illegal, or irrelevant questions
- Provide misinformation or medical/legal advice
- Make promises about job guarantees or specific outcomes
- Return responses in JSON format or structured data format
- Use code blocks or technical formatting that looks like raw data

You can answer:
- Database-aware questions about the user's profile
- General career questions
- Trend questions ("Which roles are in demand now?")
- Skill path questions ("Should I learn Django or Node.js?")
- Job search and interview tips
- Learning resource recommendations

FORMATTING GUIDELINES:
- Write in natural, conversational language
- Use paragraphs to separate ideas (double line breaks between paragraphs)
- Use bullet points (- or •) when listing items
- Use numbered lists (1. 2. 3.) for sequential steps
- Use **bold** for important terms, key points, or emphasis
- Use *italic* for subtle emphasis or terms
- Use ## for section headers when appropriate
- Keep responses clear, organized, and easy to read
- Do NOT use JSON, XML, code blocks, or any structured data format
- Format responses as if writing a well-structured article or explanation"""
    
    if language == "bn":
        return base_prompt + "\n\nIMPORTANT: Respond in Bangla (বাংলা)."
    elif language == "mix":
        return base_prompt + "\n\nIMPORTANT: Respond in Banglish (mix of English and Bangla as appropriate)."
    else:
        return base_prompt + "\n\nIMPORTANT: Respond in English."


def build_user_prompt(user_message: str, user_context: Dict, language: str) -> str:
    """
    Build the complete prompt with user context and message.
    
    Args:
        user_message: User's question/message
        user_context: User context dictionary
        language: Detected language
        
    Returns:
        Complete prompt string for Gemini
    """
    system_prompt = build_system_prompt(language)
    
    # Format user context
    context_str = f"""USER PROFILE:
- Name: {user_context.get('name', 'Not provided')}
- Education Level: {user_context.get('education_level', 'Not provided')}
- Experience Level: {user_context.get('experience_level', 'Not provided')}
- Preferred Career Track: {user_context.get('preferred_career_track', 'Not provided')}
- Career Interests: {', '.join(user_context.get('career_interests', [])) if user_context.get('career_interests') else 'Not provided'}
- Experience Description: {user_context.get('experience_description', 'Not provided')[:500] if user_context.get('experience_description') else 'Not provided'}

SKILLS: {', '.join(user_context.get('skills', [])) if user_context.get('skills') else 'None listed'}

TOOLS & TECHNOLOGIES: {', '.join(user_context.get('tools', [])) if user_context.get('tools') else 'None listed'}

WORK EXPERIENCE: {len(user_context.get('experiences', []))} position(s) listed

PROJECTS: {len(user_context.get('projects', []))} project(s) listed

PERSONAL SUMMARY: {user_context.get('personal_summary', 'Not provided')[:300] if user_context.get('personal_summary') else 'Not provided'}

CV TEXT (if available): {user_context.get('raw_cv_text', '')[:500] if user_context.get('raw_cv_text') else 'Not provided'}
"""
    
    prompt = f"""{system_prompt}

{context_str}

USER QUESTION: {user_message}

Please provide a helpful, personalized response based on the user's profile above."""
    
    return prompt


def clean_response(response: str) -> str:
    """
    Clean up the response to remove JSON, code blocks, and ensure natural formatting.
    
    Args:
        response: Raw response from Gemini
        
    Returns:
        Cleaned, formatted response
    """
    import re
    
    # Remove JSON code blocks
    response = re.sub(r'```json\s*\{.*?\}\s*```', '', response, flags=re.DOTALL | re.IGNORECASE)
    response = re.sub(r'```\s*\{.*?\}\s*```', '', response, flags=re.DOTALL | re.IGNORECASE)
    
    # Remove code blocks
    response = re.sub(r'```[a-z]*\n.*?```', '', response, flags=re.DOTALL | re.IGNORECASE)
    
    # Remove markdown code inline
    response = re.sub(r'`([^`]+)`', r'\1', response)
    
    # Clean up excessive newlines
    response = re.sub(r'\n{3,}', '\n\n', response)
    
    # Remove leading/trailing whitespace
    response = response.strip()
    
    return response


def get_career_bot_response(
    message: str,
    user_profile: Dict,
    user_skills: list,
    user_cv: Optional[Dict],
    language: str
) -> str:
    """
    Get CareerBot's response using Gemini API with user context.
    
    Args:
        message: User's message/question
        user_profile: User profile data
        user_skills: List of user skills
        user_cv: User CV/resume data
        language: Detected language ("en", "bn", or "mix")
        
    Returns:
        Bot's response text
    """
    try:
        # Build user context
        user_context = build_user_context(user_profile, user_skills, user_cv)
        
        # Build prompt
        prompt = build_user_prompt(message, user_context, language)
        
        # Call Gemini API
        response = generate_text(prompt)
        
        # Clean up the response
        response = clean_response(response)
        
        # Ensure the required ending is present
        if "This is a suggestion, not a guaranteed outcome" not in response:
            response += "\n\nThis is a suggestion, not a guaranteed outcome."
        
        return response
        
    except Exception as e:
        print(f"Error getting CareerBot response: {e}")
        return "I apologize, but I'm having trouble processing your request right now. Please try again later."

