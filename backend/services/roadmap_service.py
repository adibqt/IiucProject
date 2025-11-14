"""
Roadmap Service
Handles AI-generated career roadmap creation using Gemini API
"""
import json
from typing import Dict, Optional, Tuple
from services.gemini_service import generate_text


def build_user_context_for_roadmap(user_profile, user_skills: list, user_cv: Optional[Dict]) -> Dict:
    """
    Build a comprehensive user context object for roadmap generation.
    
    Args:
        user_profile: User model object
        user_skills: List of skill objects
        user_cv: UserResume model object or None
        
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
                "skills": json.loads(user_cv.skills) if user_cv.skills else [],
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
            "bio": getattr(user_profile, "bio", None) or "",
            "experience_description": getattr(user_profile, "experience_description", None) or "",
            "career_interests": json.loads(user_profile.career_interests) if hasattr(user_profile, "career_interests") and user_profile.career_interests else [],
        }
    else:
        # It's already a dict
        profile_data = user_profile
    
    return {
        "name": profile_data.get("name", ""),
        "bio": profile_data.get("bio", ""),
        "experience_description": profile_data.get("experience_description", ""),
        "career_interests": profile_data.get("career_interests", []),
        "skills": skills_list,
        "cv_skills": cv_data.get("skills", []),
        "tools": cv_data.get("tools", []),
        "experiences": cv_data.get("experiences", []),
        "education": cv_data.get("education", []),
        "projects": cv_data.get("projects", []),
        "personal_summary": cv_data.get("personal_summary", ""),
        "raw_cv_text": cv_data.get("raw_cv_text", ""),
    }


def build_roadmap_prompt(
    user_context: Dict,
    target_role: str,
    timeframe: str,
    weekly_hours: Optional[int] = None
) -> str:
    """
    Build the prompt for Gemini to generate a career roadmap.
    
    Args:
        user_context: User context dictionary
        target_role: Target role/job title
        timeframe: Timeframe string (e.g., "3 months")
        weekly_hours: Optional weekly hours commitment
        
    Returns:
        Complete prompt string for Gemini
    """
    
    # Build user context summary
    skills_str = ', '.join(user_context.get('skills', [])) if user_context.get('skills') else 'None listed'
    tools_str = ', '.join(user_context.get('tools', [])) if user_context.get('tools') else 'None listed'
    experiences_count = len(user_context.get('experiences', []))
    projects_count = len(user_context.get('projects', []))
    
    weekly_hours_note = f" (committing {weekly_hours} hours per week)" if weekly_hours else ""
    
    prompt = f"""You are a professional career mentor creating a personalized learning and career roadmap.

USER PROFILE:
- Name: {user_context.get('name', 'Not provided')}
- Bio: {user_context.get('bio', 'Not provided')[:300]}
- Experience Description: {user_context.get('experience_description', 'Not provided')[:500]}
- Career Interests: {', '.join(user_context.get('career_interests', [])) if user_context.get('career_interests') else 'Not provided'}

CURRENT SKILLS: {skills_str}
TOOLS & TECHNOLOGIES: {tools_str}
WORK EXPERIENCE: {experiences_count} position(s)
PROJECTS: {projects_count} project(s)
PERSONAL SUMMARY: {user_context.get('personal_summary', 'Not provided')[:300]}

TARGET ROLE: {target_role}
TIMEFRAME: {timeframe}{weekly_hours_note}

============================================================
YOUR TASK: Generate a COMPLETE career roadmap with TWO sections
============================================================

SECTION 1: VISUAL ROADMAP (ASCII/CONSOLE-STYLE)
------------------------------------------------------------
Create a visually structured roadmap using ASCII/Unicode characters:
- Use arrows (→), boxes (▢, ■), checkpoints (✓), branches
- Organize into clear phases with timeframes
- Show progression path with milestones
- Make it visually appealing and easy to follow
- Use clear separators and formatting

Example structure (adapt to the user's situation):
============================================================
 ROADMAP: [TARGET ROLE] ([TIMEFRAME])
============================================================

[PHASE 1: FOUNDATIONS] (Weeks 1–2)
   ▢ Core Skill 1
   ▢ Core Skill 2
   ✓ Mini Project

[PHASE 2: CORE SKILLS] (Weeks 3–6)
   ▢ Advanced Topic
   ▢ Framework/Tool
   ✓ Project

[PHASE 3: ADVANCED] (Weeks 7–10)
   ▢ Advanced Concepts
   ▢ Portfolio Projects
   ✓ Final Project

[PHASE 4: APPLICATION] (Last Weeks)
   ▢ CV/Resume Prep
   ▢ Job Applications
   ▢ Interviews

============================================================

SECTION 2: CONCISE EXPLANATION
------------------------------------------------------------
Provide a BRIEF, FOCUSED explanation (MAX 300 words total):

1. Overview: 2-3 sentences explaining the roadmap strategy
2. Phase Summary: One sentence per phase describing the key focus
3. Key Milestones: 3-4 important checkpoints
4. Next Steps: 2-3 immediate actionable items

KEEP IT SHORT AND ACTIONABLE. Focus on essentials only.

CRITICAL FORMATTING RULES:
------------------------------------------------------------
✔ Produce visually structured ASCII roadmap in SECTION 1 (MAX 20 lines)
✔ Keep SECTION 2 under 300 words total
✔ NO JSON format anywhere
✔ NO code block markdown (```...```)
✔ NO unformatted text dump
✔ Use headings, arrows, bullets, timelines
✔ Clear separation between phases
✔ Professional, mentor-style writing
✔ MUST end with: "This roadmap is a suggestion, not a guaranteed outcome."
✔ Write in natural, readable English
✔ Use proper spacing and formatting for readability
✔ BE CONCISE - focus on key points only

OUTPUT FORMAT:
------------------------------------------------------------
Start with the visual roadmap (SECTION 1), then add a clear separator (like "============================================================"), then the detailed explanation (SECTION 2).

Generate the complete roadmap now:"""

    return prompt


def parse_roadmap_response(response: str) -> Tuple[str, str]:
    """
    Parse Gemini's response to separate visual roadmap and description.
    
    Args:
        response: Raw response from Gemini
        
    Returns:
        Tuple of (visual_roadmap, description)
    """
    # Look for common separators that might separate visual from description
    separators = [
        "============================================================",
        "------------------------------------------------------------",
        "DETAILED EXPLANATION",
        "SECTION 2",
        "EXPLANATION",
    ]
    
    visual_roadmap = response
    description = ""
    
    # Try to find a separator
    for sep in separators:
        if sep in response:
            parts = response.split(sep, 1)
            if len(parts) == 2:
                visual_roadmap = parts[0].strip()
                description = parts[1].strip()
                break
    
    # If no separator found, try to split at common transition points
    if not description:
        # Look for patterns like "DETAILED", "EXPLANATION", "OVERVIEW", etc.
        lines = response.split('\n')
        split_index = -1
        
        for i, line in enumerate(lines):
            line_upper = line.upper().strip()
            if any(keyword in line_upper for keyword in ["DETAILED", "EXPLANATION", "OVERVIEW", "SECTION 2", "BREAKDOWN"]):
                if i > 10:  # Make sure we have enough content in visual part
                    split_index = i
                    break
        
        if split_index > 0:
            visual_roadmap = '\n'.join(lines[:split_index]).strip()
            description = '\n'.join(lines[split_index:]).strip()
    
    # If still no split, use first 60% as visual, rest as description
    if not description or len(description) < 100:
        # Estimate: visual roadmap is usually shorter, description is longer
        # Try to find where the visual part ends (look for phase markers ending)
        lines = response.split('\n')
        # Visual roadmap typically has phases with checkboxes/arrows
        # Description typically starts with paragraphs
        visual_lines = []
        desc_lines = []
        in_description = False
        
        for line in lines:
            # If we see a line that looks like description start (paragraph, not ASCII art)
            if not in_description and len(line.strip()) > 50 and not any(char in line for char in ['→', '▢', '■', '✓', '=']):
                # Check if previous section was substantial
                if len(visual_lines) > 15:
                    in_description = True
            
            if in_description:
                desc_lines.append(line)
            else:
                visual_lines.append(line)
        
        if desc_lines:
            visual_roadmap = '\n'.join(visual_lines).strip()
            description = '\n'.join(desc_lines).strip()
        else:
            # Fallback: split at 40/60
            split_point = int(len(response) * 0.4)
            visual_roadmap = response[:split_point].strip()
            description = response[split_point:].strip()
    
    # Clean up both parts
    visual_roadmap = clean_roadmap_text(visual_roadmap)
    description = clean_roadmap_text(description)
    
    # Ensure we have content in both
    if not visual_roadmap or len(visual_roadmap) < 50:
        visual_roadmap = response[:len(response)//2].strip()
    if not description or len(description) < 100:
        description = response[len(response)//2:].strip()
    
    return visual_roadmap, description


def clean_roadmap_text(text: str) -> str:
    """
    Clean up roadmap text to remove unwanted formatting.
    
    Args:
        text: Raw text
        
    Returns:
        Cleaned text
    """
    import re
    
    # Remove JSON code blocks
    text = re.sub(r'```json\s*\{.*?\}\s*```', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'```\s*\{.*?\}\s*```', '', text, flags=re.DOTALL | re.IGNORECASE)
    
    # Remove markdown code blocks but preserve content
    text = re.sub(r'```([^`]+)```', r'\1', text, flags=re.DOTALL)
    
    # Clean up excessive newlines (more than 2 consecutive)
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Remove leading/trailing whitespace
    text = text.strip()
    
    return text


def generate_career_roadmap(
    user_profile,
    user_skills: list,
    user_cv: Optional[Dict],
    target_role: str,
    timeframe: str,
    weekly_hours: Optional[int] = None
) -> Tuple[str, str, Dict]:
    """
    Generate a career roadmap using Gemini API.
    
    Args:
        user_profile: User profile data
        user_skills: List of user skills
        user_cv: User CV/resume data
        target_role: Target role/job title
        timeframe: Timeframe string (e.g., "3 months")
        weekly_hours: Optional weekly hours commitment
        
    Returns:
        Tuple of (visual_roadmap, description, input_context_dict)
    """
    try:
        # Build user context
        user_context = build_user_context_for_roadmap(user_profile, user_skills, user_cv)
        
        # Build prompt
        prompt = build_roadmap_prompt(user_context, target_role, timeframe, weekly_hours)
        
        # Call Gemini API
        response = generate_text(prompt)
        
        # Clean and parse response
        response = clean_roadmap_text(response)
        visual_roadmap, description = parse_roadmap_response(response)
        
        # Ensure description ends with disclaimer if not present
        if "This roadmap is a suggestion, not a guaranteed outcome" not in description:
            description += "\n\nThis roadmap is a suggestion, not a guaranteed outcome."
        
        return visual_roadmap, description, user_context
        
    except Exception as e:
        print(f"Error generating career roadmap: {e}")
        raise Exception(f"Failed to generate career roadmap: {str(e)}")

