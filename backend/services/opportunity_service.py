"""
Opportunity Service
Handles AI-powered local opportunity recommendations using Gemini
"""
import json
from typing import Dict, List, Optional
from services.gemini_service import generate_text
from services.language_service import detect_language


def build_user_context_for_opportunities(
    user_profile,
    user_skills: List,
    user_cv: Optional[Dict]
) -> Dict:
    """
    Build comprehensive user context for opportunity matching.
    
    Args:
        user_profile: User model object
        user_skills: List of skill objects
        user_cv: UserResume model object or dict
        
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
            "experience_level": getattr(user_profile, "experience_level", None) or "",
            "career_interests": json.loads(user_profile.career_interests) if hasattr(user_profile, "career_interests") and user_profile.career_interests else [],
            "experience_description": getattr(user_profile, "experience_description", None) or "",
        }
    else:
        # It's already a dict
        profile_data = user_profile
    
    return {
        "name": profile_data.get("name", ""),
        "experience_level": profile_data.get("experience_level", ""),
        "career_interests": profile_data.get("career_interests", []),
        "experience_description": profile_data.get("experience_description", ""),
        "skills": skills_list,
        "tools": cv_data.get("tools", []),
        "experiences": cv_data.get("experiences", []),
        "projects": cv_data.get("projects", []),
        "personal_summary": cv_data.get("personal_summary", ""),
    }


def format_opportunities_for_prompt(opportunities: List) -> str:
    """
    Format opportunities list into a readable string for Gemini prompt.
    
    Args:
        opportunities: List of LocalOpportunity model objects
        
    Returns:
        Formatted string
    """
    if not opportunities:
        return "No opportunities available."
    
    formatted = []
    for idx, opp in enumerate(opportunities, 1):
        # Parse required_skills if it's JSON
        skills_str = "Not specified"
        if opp.required_skills:
            try:
                skills_list = json.loads(opp.required_skills)
                if isinstance(skills_list, list):
                    skills_str = ", ".join(str(s) for s in skills_list)
            except:
                skills_str = opp.required_skills
        
        opp_text = f"""
{idx}. {opp.title}
   Organization: {opp.organization}
   Location: {opp.location}
   Category: {opp.category}
   Target Track: {opp.target_track or "Not specified"}
   Required Skills: {skills_str}
   Priority Group: {opp.priority_group or "All Youth"}
   Description: {opp.description[:300]}{"..." if len(opp.description) > 300 else ""}
   Link: {opp.link or "Not provided"}
"""
        formatted.append(opp_text)
    
    return "\n".join(formatted)


def build_opportunity_prompt(
    user_context: Dict,
    opportunities_text: str,
    language: str = "en"
) -> str:
    """
    Build the complete prompt for Gemini to generate opportunity recommendations.
    
    Args:
        user_context: User context dictionary
        opportunities_text: Formatted opportunities string
        language: Detected language ("en", "bn", or "mix")
        
    Returns:
        Complete prompt string for Gemini
    """
    system_prompt = """You are a career advisor specializing in youth employment and development, particularly focused on supporting disadvantaged youth groups (women, rural youth, low-income groups) in Bangladesh and similar regions.

Your mission is aligned with SDG 8 (Decent Work and Economic Growth) - helping young people find meaningful employment and training opportunities.

Your tasks:
1. Analyze the user's profile, skills, CV data, and career interests
2. Review the provided list of local opportunities
3. Rank the opportunities by best fit for the user
4. Explain WHY each opportunity matches the user's profile
5. Highlight opportunities that are particularly beneficial for disadvantaged youth groups when relevant
6. Suggest concrete next steps: what to prepare, how to apply, what skills to improve
7. Write in a professional, encouraging, and supportive tone

IMPORTANT FORMATTING RULES:
- Write in natural, conversational language
- Use clear structure with sections and bullet points
- DO NOT output JSON, code blocks, XML, or any structured data format
- Use markdown formatting (## for headers, **bold** for emphasis, - for bullets)
- Keep explanations concise but informative
- Be encouraging and focus on actionable advice
- Highlight social impact and SDG 8 relevance when applicable

OUTPUT STRUCTURE:
Start with a header: "🎯 Top Local Opportunities Tailored for You"

For each opportunity (ranked by best fit):
### [Rank]. [Opportunity Title]
**Why it matches you →**
- Skills matched: [list relevant skills]
- Track relevance: [explain how it aligns with their career track]
- Experience fit: [how their experience level matches]

**Action Steps →**
- Improve [specific skill] before applying
- Prepare [specific portfolio/document]
- Contact [organization] via [method]

**Impact →**
[Explain how this opportunity supports disadvantaged youth / SDG 8 goals if applicable]

---

End with:
### 📌 Final Advice
[Personalized summary and next steps]

Remember: Write in a professional, human-readable format. NO JSON, NO code blocks, NO raw data dumps."""

    if language == "bn":
        system_prompt += "\n\nIMPORTANT: Respond in Bangla (বাংলা)."
    elif language == "mix":
        system_prompt += "\n\nIMPORTANT: Respond in Banglish (mix of English and Bangla as appropriate)."
    else:
        system_prompt += "\n\nIMPORTANT: Respond in English."

    # Format user context
    context_str = f"""USER PROFILE:
- Name: {user_context.get('name', 'Not provided')}
- Experience Level: {user_context.get('experience_level', 'Not provided')}
- Career Interests: {', '.join(user_context.get('career_interests', [])) if user_context.get('career_interests') else 'Not provided'}
- Experience Description: {user_context.get('experience_description', 'Not provided')[:500] if user_context.get('experience_description') else 'Not provided'}

SKILLS: {', '.join(user_context.get('skills', [])) if user_context.get('skills') else 'None listed'}

TOOLS & TECHNOLOGIES: {', '.join(user_context.get('tools', [])) if user_context.get('tools') else 'None listed'}

WORK EXPERIENCE: {len(user_context.get('experiences', []))} position(s) listed

PROJECTS: {len(user_context.get('projects', []))} project(s) listed

PERSONAL SUMMARY: {user_context.get('personal_summary', 'Not provided')[:300] if user_context.get('personal_summary') else 'Not provided'}
"""

    prompt = f"""{system_prompt}

{context_str}

AVAILABLE LOCAL OPPORTUNITIES:
{opportunities_text}

Please analyze these opportunities and provide personalized recommendations following the structure outlined above."""

    return prompt


def clean_opportunity_response(response: str) -> str:
    """
    Clean up the Gemini response to ensure it's human-readable.
    
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


def generate_opportunity_recommendations(
    user_context: Dict,
    opportunities: List,
    language: str = "en"
) -> str:
    """
    Generate personalized opportunity recommendations using Gemini.
    
    Args:
        user_context: User context dictionary
        opportunities: List of LocalOpportunity model objects
        language: Detected language ("en", "bn", or "mix")
        
    Returns:
        Gemini-generated explanation text
    """
    try:
        # Format opportunities for prompt
        opportunities_text = format_opportunities_for_prompt(opportunities)
        
        # Build prompt
        prompt = build_opportunity_prompt(user_context, opportunities_text, language)
        
        # Call Gemini API
        response = generate_text(prompt)
        
        # Clean up the response
        response = clean_opportunity_response(response)
        
        return response
        
    except Exception as e:
        print(f"Error generating opportunity recommendations: {e}")
        return "I apologize, but I'm having trouble processing your request right now. Please try again later."


def filter_opportunities_by_user_profile(
    opportunities: List,
    user_skills: List,
    user_track: Optional[str] = None
) -> List:
    """
    Filter opportunities based on user profile and skills.
    
    Args:
        opportunities: List of all LocalOpportunity objects
        user_skills: List of user's skill objects
        user_track: User's preferred career track (optional)
        
    Returns:
        Filtered list of opportunities
    """
    if not opportunities:
        return []
    
    # Extract user skill names
    user_skill_names = []
    if user_skills:
        for skill in user_skills:
            if hasattr(skill, "name"):
                user_skill_names.append(skill.name.lower())
            elif isinstance(skill, dict):
                user_skill_names.append(skill.get("name", "").lower())
            else:
                user_skill_names.append(str(skill).lower())
    
    filtered = []
    
    for opp in opportunities:
        if not opp.is_active:
            continue
        
        # Match by track
        track_match = False
        if user_track and opp.target_track:
            track_match = user_track.lower() in opp.target_track.lower() or opp.target_track.lower() in user_track.lower()
        
        # Match by skills
        skill_match = False
        if opp.required_skills:
            try:
                required_skills_list = json.loads(opp.required_skills)
                if isinstance(required_skills_list, list):
                    # Check if at least 1-2 skills overlap
                    overlap_count = 0
                    for req_skill in required_skills_list:
                        req_skill_str = str(req_skill).lower()
                        # Check if any user skill matches
                        for user_skill in user_skill_names:
                            if user_skill in req_skill_str or req_skill_str in user_skill:
                                overlap_count += 1
                                break
                    skill_match = overlap_count >= 1
            except:
                # If not JSON, try string matching
                req_skills_str = opp.required_skills.lower()
                for user_skill in user_skill_names:
                    if user_skill in req_skills_str:
                        skill_match = True
                        break
        
        # Include if track matches OR skills match
        if track_match or skill_match:
            filtered.append(opp)
    
    # If no matches, return all active opportunities (fallback)
    if not filtered:
        filtered = [opp for opp in opportunities if opp.is_active]
    
    return filtered

