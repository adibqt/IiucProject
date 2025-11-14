"""
CV Assistant Service - AI-powered CV generation and improvement suggestions
Uses Gemini AI to generate professional summaries, bullet points, and recommendations
"""
import os
import json
from typing import Dict, List, Optional
from pathlib import Path
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini AI
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    # Use gemini-1.5-flash for better rate limits and stability
    model = genai.GenerativeModel('gemini-2.5-flash')
else:
    model = None


class CVAssistantService:
    """Service for AI-powered CV assistance"""
    
    @staticmethod
    def generate_professional_summary(profile_data: Dict, cv_data: Dict) -> str:
        """
        Generate a professional summary based on user's profile and CV data
        
        Args:
            profile_data: User profile (name, bio, experience_level, career_interests)
            cv_data: CV data (experiences, education, skills, projects)
            
        Returns:
            Professional summary text
        """
        if not model:
            return "AI service not configured. Please set GEMINI_API_KEY."
        
        try:
            # Build context from user data
            name = profile_data.get('full_name', 'Professional')
            bio = profile_data.get('bio', '')
            experience_level = profile_data.get('experience_level', 'mid')
            career_interests = profile_data.get('career_interests', [])
            
            # Parse experiences
            experiences = cv_data.get('experiences', [])
            education = cv_data.get('education', [])
            skills = cv_data.get('skills', [])
            
            # Build prompt
            prompt = f"""
You are a professional CV writer. Generate a compelling 3-4 sentence professional summary for a resume/CV.

CANDIDATE INFORMATION:
Name: {name}
Experience Level: {experience_level}
Career Interests: {', '.join(career_interests) if career_interests else 'Not specified'}
Current Bio: {bio}

WORK EXPERIENCE:
{json.dumps(experiences, indent=2) if experiences else 'No formal experience listed'}

EDUCATION:
{json.dumps(education, indent=2) if education else 'Not specified'}

SKILLS:
{', '.join([s.get('name', str(s)) if isinstance(s, dict) else str(s) for s in skills]) if skills else 'Not specified'}

INSTRUCTIONS:
1. Write a professional, compelling summary (3-4 sentences)
2. Highlight key strengths and experiences
3. Mention career goals/interests
4. Use active voice and action verbs
5. Be specific and quantifiable where possible
6. Make it ATS-friendly (Applicant Tracking System)
7. Avoid clichés like "hard-working" or "team player"
8. Focus on unique value proposition

Return ONLY the summary text, no additional formatting or labels.
"""
            
            response = model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            error_msg = str(e)
            print(f"Error generating professional summary: {error_msg}")
            
            # Check if it's a rate limit error
            if "429" in error_msg or "quota" in error_msg.lower() or "rate" in error_msg.lower():
                return "⚠️ AI service is currently rate limited. Please try again in a few moments. Meanwhile, you can manually write your professional summary based on your experience and skills."
            
            return "Failed to generate summary. Please try again later or write your summary manually."
    
    @staticmethod
    def improve_bullet_points(
        experience: Dict,
        job_context: Optional[str] = None
    ) -> List[str]:
        """
        Generate improved bullet points for a work experience or project
        
        Args:
            experience: Experience object with title, company, description
            job_context: Optional context about target job role
            
        Returns:
            List of improved bullet points
        """
        if not model:
            return ["AI service not configured. Please set GEMINI_API_KEY."]
        
        try:
            title = experience.get('title', 'Position')
            company = experience.get('company', 'Company')
            description = experience.get('description', '')
            
            prompt = f"""
You are a professional CV writer. Improve these work experience bullet points.

POSITION: {title}
COMPANY: {company}
CURRENT DESCRIPTION: {description}
{"TARGET ROLE: " + job_context if job_context else ""}

INSTRUCTIONS:
1. Create 4-5 strong, impactful bullet points
2. Use the STAR method (Situation, Task, Action, Result)
3. Start each bullet with strong action verbs
4. Include quantifiable achievements where possible
5. Be specific and results-oriented
6. Keep each bullet to 1-2 lines
7. Make it ATS-friendly
8. Focus on accomplishments, not just responsibilities

EXAMPLE FORMAT:
- Led development of X feature, resulting in Y% improvement in Z metric
- Collaborated with cross-functional team of N members to deliver X, achieving Y
- Implemented X solution that reduced Y by Z%, improving overall efficiency

Return ONLY the bullet points (one per line, starting with -), no additional text or formatting.
"""
            
            response = model.generate_content(prompt)
            
            # Parse response into list
            text = response.text.strip()
            bullets = [line.strip('- ').strip() for line in text.split('\n') if line.strip() and line.strip().startswith('-')]
            
            return bullets if bullets else [text]
            
        except Exception as e:
            error_msg = str(e)
            print(f"Error improving bullet points: {error_msg}")
            
            # Check if it's a rate limit error
            if "429" in error_msg or "quota" in error_msg.lower() or "rate" in error_msg.lower():
                return ["⚠️ AI service is currently rate limited. Please try again in a few moments."]
            
            return ["Failed to generate bullet points. Please try again later."]
    
    @staticmethod
    def generate_project_description(project: Dict) -> Dict:
        """
        Generate an improved project description with strong bullet points
        
        Args:
            project: Project object with name, description, technologies
            
        Returns:
            Dict with improved description and bullet points
        """
        if not model:
            return {
                "description": "AI service not configured.",
                "bullet_points": []
            }
        
        try:
            name = project.get('name', 'Project')
            description = project.get('description', '')
            technologies = project.get('technologies', '')
            
            prompt = f"""
You are a professional CV writer. Improve this project description for a resume/CV.

PROJECT NAME: {name}
CURRENT DESCRIPTION: {description}
TECHNOLOGIES USED: {technologies}

INSTRUCTIONS:
1. Write a brief 1-2 sentence overview of the project
2. Create 3-4 bullet points highlighting:
   - Key features/functionality
   - Technical challenges solved
   - Technologies/methodologies used
   - Impact or results (users, performance, etc.)
3. Use action verbs and be specific
4. Make it quantifiable where possible
5. Keep it concise and impactful

Return in this JSON format:
{{
  "description": "Brief overview sentence(s)",
  "bullet_points": [
    "First bullet point",
    "Second bullet point",
    "Third bullet point"
  ]
}}

Return ONLY valid JSON, no additional text.
"""
            
            response = model.generate_content(prompt)
            
            # Clean and parse JSON
            text = response.text.strip().replace('```json', '').replace('```', '')
            data = json.loads(text)
            
            return data
            
        except Exception as e:
            error_msg = str(e)
            print(f"Error generating project description: {error_msg}")
            
            # Check if it's a rate limit error
            if "429" in error_msg or "quota" in error_msg.lower() or "rate" in error_msg.lower():
                return {
                    "description": "⚠️ AI service is currently rate limited. Please try again in a few moments.",
                    "bullet_points": []
                }
            
            return {
                "description": project.get('description', ''),
                "bullet_points": []
            }
    
    @staticmethod
    def suggest_linkedin_improvements(profile_data: Dict, cv_data: Dict) -> Dict:
        """
        Generate suggestions for improving LinkedIn profile
        
        Args:
            profile_data: User profile data
            cv_data: CV data
            
        Returns:
            Dict with suggestions for different LinkedIn sections
        """
        if not model:
            return {
                "headline": "AI service not configured.",
                "about": "Please set GEMINI_API_KEY.",
                "general_tips": []
            }
        
        try:
            name = profile_data.get('full_name', 'Professional')
            bio = profile_data.get('bio', '')
            current_title = cv_data.get('experiences', [{}])[0].get('title', 'Professional') if cv_data.get('experiences') else 'Professional'
            career_interests = profile_data.get('career_interests', [])
            skills = cv_data.get('skills', [])
            
            prompt = f"""
You are a LinkedIn optimization expert. Provide specific recommendations for improving a LinkedIn profile.

CURRENT PROFILE:
Name: {name}
Current/Recent Title: {current_title}
Bio: {bio}
Career Interests: {', '.join(career_interests) if career_interests else 'Not specified'}
Skills: {', '.join([s.get('name', str(s)) if isinstance(s, dict) else str(s) for s in skills[:10]]) if skills else 'Not specified'}

PROVIDE RECOMMENDATIONS FOR:

1. HEADLINE: Suggest a compelling LinkedIn headline (120 chars max)
   - Include role + key value proposition
   - Make it searchable and specific
   - Example: "Full Stack Developer | React & Node.js | Building Scalable Web Applications"

2. ABOUT SECTION: Write 2-3 paragraph "About" section
   - Start with a hook
   - Highlight expertise and achievements
   - Include career goals
   - Add personality
   - End with call-to-action

3. GENERAL TIPS: Provide 5 specific, actionable tips for this profile
   - Skills to add/highlight
   - Content to share
   - Groups to join
   - Profile optimization tips
   - Networking strategies

Return in this JSON format:
{{
  "headline": "Suggested headline",
  "about": "Multi-paragraph about section",
  "general_tips": [
    "Specific tip 1",
    "Specific tip 2",
    "Specific tip 3",
    "Specific tip 4",
    "Specific tip 5"
  ]
}}

Return ONLY valid JSON, no additional text.
"""
            
            response = model.generate_content(prompt)
            
            # Clean and parse JSON
            text = response.text.strip().replace('```json', '').replace('```', '')
            data = json.loads(text)
            
            return data
            
        except Exception as e:
            error_msg = str(e)
            print(f"Error generating LinkedIn suggestions: {error_msg}")
            
            # Check if it's a rate limit error
            if "429" in error_msg or "quota" in error_msg.lower() or "rate" in error_msg.lower():
                return {
                    "headline": "⚠️ AI service is currently rate limited",
                    "about": "Please try again in a few moments. The AI service has temporary usage limits that reset regularly.",
                    "general_tips": [
                        "Add a professional profile photo",
                        "Complete all profile sections",
                        "Get recommendations from colleagues",
                        "Share relevant content regularly",
                        "Join industry-specific groups"
                    ]
                }
            
            return {
                "headline": "Failed to generate suggestions.",
                "about": "Please try again later.",
                "general_tips": []
            }
    
    @staticmethod
    def suggest_portfolio_improvements(profile_data: Dict, cv_data: Dict) -> Dict:
        """
        Generate suggestions for improving online portfolio
        
        Args:
            profile_data: User profile data
            cv_data: CV data with projects
            
        Returns:
            Dict with portfolio improvement suggestions
        """
        if not model:
            return {
                "structure": "AI service not configured.",
                "content_suggestions": [],
                "design_tips": []
            }
        
        try:
            name = profile_data.get('full_name', 'Professional')
            career_interests = profile_data.get('career_interests', [])
            projects = cv_data.get('projects', [])
            skills = cv_data.get('skills', [])
            
            prompt = f"""
You are a portfolio website expert. Provide specific recommendations for creating/improving a professional portfolio website.

CURRENT INFORMATION:
Name: {name}
Career Focus: {', '.join(career_interests) if career_interests else 'General'}
Number of Projects: {len(projects)}
Key Skills: {', '.join([s.get('name', str(s)) if isinstance(s, dict) else str(s) for s in skills[:10]]) if skills else 'Not specified'}

PROVIDE RECOMMENDATIONS FOR:

1. STRUCTURE: Suggest optimal portfolio structure/sections
   - Must-have pages/sections
   - Navigation flow
   - Content hierarchy

2. CONTENT SUGGESTIONS: Provide 6 specific content ideas
   - What projects to highlight
   - Case studies to create
   - Blog topics to write
   - Skills to demonstrate
   - Testimonials to gather

3. DESIGN TIPS: Provide 5 specific design/UX tips
   - Visual design principles
   - Color schemes
   - Typography
   - Layout suggestions
   - Mobile optimization

Return in this JSON format:
{{
  "structure": "Multi-paragraph description of optimal structure",
  "content_suggestions": [
    "Specific content suggestion 1",
    "Specific content suggestion 2",
    "Specific content suggestion 3",
    "Specific content suggestion 4",
    "Specific content suggestion 5",
    "Specific content suggestion 6"
  ],
  "design_tips": [
    "Specific design tip 1",
    "Specific design tip 2",
    "Specific design tip 3",
    "Specific design tip 4",
    "Specific design tip 5"
  ]
}}

Return ONLY valid JSON, no additional text.
"""
            
            response = model.generate_content(prompt)
            
            # Clean and parse JSON
            text = response.text.strip().replace('```json', '').replace('```', '')
            data = json.loads(text)
            
            return data
            
        except Exception as e:
            error_msg = str(e)
            print(f"Error generating portfolio suggestions: {error_msg}")
            
            # Check if it's a rate limit error
            if "429" in error_msg or "quota" in error_msg.lower() or "rate" in error_msg.lower():
                return {
                    "structure": "⚠️ AI service is currently rate limited. Please try again in a few moments. Meanwhile, consider these basic portfolio sections: Home, About, Projects, Skills, Contact.",
                    "content_suggestions": [
                        "Showcase your best 3-5 projects with live demos",
                        "Write detailed case studies for major projects",
                        "Include testimonials or recommendations",
                        "Add a blog section to share your expertise",
                        "Create an interactive resume/timeline",
                        "Display your technical skill proficiencies"
                    ],
                    "design_tips": [
                        "Keep design clean and professional",
                        "Ensure mobile responsiveness",
                        "Use consistent color scheme and typography",
                        "Optimize for fast loading times",
                        "Include clear call-to-action buttons"
                    ]
                }
            
            return {
                "structure": "Failed to generate suggestions.",
                "content_suggestions": [],
                "design_tips": []
            }
    
    @staticmethod
    def analyze_cv_completeness(cv_data: Dict) -> Dict:
        """
        Analyze CV completeness and provide improvement suggestions
        
        Args:
            cv_data: Complete CV data
            
        Returns:
            Dict with completeness score and suggestions
        """
        # Calculate completeness score
        score = 0
        max_score = 100
        suggestions = []
        
        # Check personal summary (20 points)
        if cv_data.get('personal_summary') and len(cv_data.get('personal_summary', '')) > 50:
            score += 20
        else:
            suggestions.append({
                "category": "Personal Summary",
                "priority": "high",
                "suggestion": "Add a compelling professional summary (3-4 sentences) highlighting your key skills and career goals."
            })
        
        # Check experiences (25 points)
        experiences = cv_data.get('experiences', [])
        if len(experiences) >= 2:
            score += 25
        elif len(experiences) == 1:
            score += 15
            suggestions.append({
                "category": "Work Experience",
                "priority": "medium",
                "suggestion": "Add more work experiences or relevant internships to strengthen your profile."
            })
        else:
            suggestions.append({
                "category": "Work Experience",
                "priority": "high",
                "suggestion": "Add at least 1-2 work experiences, internships, or volunteer positions."
            })
        
        # Check education (15 points)
        education = cv_data.get('education', [])
        if len(education) >= 1:
            score += 15
        else:
            suggestions.append({
                "category": "Education",
                "priority": "high",
                "suggestion": "Add your educational background (degree, institution, graduation year)."
            })
        
        # Check skills (20 points)
        skills = cv_data.get('skills', [])
        if len(skills) >= 5:
            score += 20
        elif len(skills) >= 3:
            score += 15
            suggestions.append({
                "category": "Skills",
                "priority": "medium",
                "suggestion": "Add more skills to reach at least 5-7 relevant technical and soft skills."
            })
        else:
            suggestions.append({
                "category": "Skills",
                "priority": "high",
                "suggestion": "Add at least 5-7 relevant skills to make your profile more searchable."
            })
        
        # Check projects (20 points)
        projects = cv_data.get('projects', [])
        if len(projects) >= 2:
            score += 20
        elif len(projects) == 1:
            score += 10
            suggestions.append({
                "category": "Projects",
                "priority": "medium",
                "suggestion": "Add more projects to showcase your practical skills and experience."
            })
        else:
            suggestions.append({
                "category": "Projects",
                "priority": "medium",
                "suggestion": "Add 2-3 projects to demonstrate your skills in action."
            })
        
        # Determine overall assessment
        if score >= 80:
            assessment = "Excellent! Your CV is comprehensive and well-structured."
        elif score >= 60:
            assessment = "Good! Your CV has most essential sections. A few improvements will make it great."
        elif score >= 40:
            assessment = "Fair. Your CV needs several key sections to be competitive."
        else:
            assessment = "Needs work. Focus on adding core sections to build a strong CV."
        
        return {
            "score": score,
            "max_score": max_score,
            "percentage": round((score / max_score) * 100, 1),
            "assessment": assessment,
            "suggestions": suggestions
        }
    
    @staticmethod
    def generate_cv_keywords(cv_data: Dict, target_role: Optional[str] = None) -> List[str]:
        """
        Generate ATS-friendly keywords based on CV content and target role
        
        Args:
            cv_data: CV data
            target_role: Optional target job role
            
        Returns:
            List of relevant keywords
        """
        if not model:
            return ["AI service not configured"]
        
        try:
            skills = cv_data.get('skills', [])
            experiences = cv_data.get('experiences', [])
            projects = cv_data.get('projects', [])
            
            # Fallback keywords based on existing data (no AI needed)
            fallback_keywords = []
            
            # Extract from skills
            for skill in skills:
                if isinstance(skill, dict):
                    fallback_keywords.append(skill.get('name', ''))
                else:
                    fallback_keywords.append(str(skill))
            
            # Extract from tools
            tools = cv_data.get('tools', [])
            fallback_keywords.extend(tools[:5])
            
            # Common ATS keywords
            fallback_keywords.extend([
                'Problem Solving', 'Team Collaboration', 'Communication',
                'Leadership', 'Project Management', 'Analytical Skills'
            ])
            
            # Try AI generation with timeout
            try:
                prompt = f"""
You are an ATS (Applicant Tracking System) expert. Generate relevant keywords for this CV.

CV CONTENT:
Skills: {', '.join([s.get('name', str(s)) if isinstance(s, dict) else str(s) for s in skills[:10]]) if skills else 'None'}
Experiences: {json.dumps([e.get('title', '') for e in experiences[:3]]) if experiences else 'None'}
{"Target Role: " + target_role if target_role else ""}

Generate 15 relevant ATS keywords (technical skills, soft skills, industry terms).
Return ONLY a comma-separated list, no additional text.
"""
                
                response = model.generate_content(
                    prompt,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.7,
                        max_output_tokens=200,
                    )
                )
                keywords = [k.strip() for k in response.text.strip().split(',') if k.strip()]
                
                return keywords[:20] if keywords else fallback_keywords[:15]
                
            except Exception as ai_error:
                # If AI fails (rate limit, etc.), return fallback keywords
                print(f"AI keyword generation failed, using fallback: {ai_error}")
                return list(set(fallback_keywords))[:15]
            
        except Exception as e:
            print(f"Error generating keywords: {e}")
            # Return basic fallback keywords
            return [
                'Problem Solving', 'Team Collaboration', 'Communication',
                'Leadership', 'Project Management', 'Analytical Skills',
                'Technical Skills', 'Adaptability', 'Time Management',
                'Critical Thinking', 'Creativity', 'Attention to Detail'
            ]


# Example usage
if __name__ == "__main__":
    # Test professional summary generation
    test_profile = {
        "full_name": "John Doe",
        "bio": "Software developer passionate about web technologies",
        "experience_level": "mid",
        "career_interests": ["Full Stack Development", "Cloud Architecture"]
    }
    
    test_cv = {
        "experiences": [
            {
                "title": "Software Developer",
                "company": "Tech Corp",
                "description": "Developed web applications"
            }
        ],
        "education": [
            {
                "degree": "BSc Computer Science",
                "institution": "University"
            }
        ],
        "skills": ["Python", "React", "Node.js"]
    }
    
    service = CVAssistantService()
    summary = service.generate_professional_summary(test_profile, test_cv)
    print("Professional Summary:")
    print(summary)
