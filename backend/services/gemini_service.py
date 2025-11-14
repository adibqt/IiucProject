"""
Gemini AI Service
Handles all interactions with the Google Generative AI API
"""
import os
from pathlib import Path
import google.generativeai as genai
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Configure the Gemini API key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables.")

genai.configure(api_key=api_key)

# Create generative model instances with fallback options
# Use gemini-2.5-flash as primary (fast and efficient)
# Fallback to gemini-2.0-flash if primary fails
primary_model = genai.GenerativeModel('gemini-2.5-flash')
fallback_model = genai.GenerativeModel('gemini-2.0-flash')

def generate_text(prompt: str) -> str:
    """
    Generates text using the Gemini model with automatic fallback.

    Args:
        prompt: The text prompt to send to the model.

    Returns:
        The generated text as a string.
    """
    # Try primary model first
    try:
        response = primary_model.generate_content(prompt)
        return response.text
    except Exception as e:
        error_msg = str(e)
        print(f"Error generating text with Gemini (primary model): {error_msg}")
        
        # Check if it's a quota/rate limit error
        if "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
            # Try fallback model
            try:
                print("Attempting fallback model...")
                response = fallback_model.generate_content(prompt)
                return response.text
            except Exception as fallback_error:
                print(f"Error generating text with Gemini (fallback model): {fallback_error}")
                return "I apologize, but I've reached the API rate limit. Please try again in a few minutes."
        
        # For other errors, provide a more helpful message
        if "api key" in error_msg.lower() or "authentication" in error_msg.lower():
            return "I apologize, but there's an authentication issue with the AI service. Please contact support."
        
        # Generic error message
        return "I apologize, but I'm having trouble processing your request right now. Please try again later."

def analyze_cv_pdf(pdf_file_path: str, available_skills: list = None) -> dict:
    """
    Analyzes a CV PDF using Gemini and extracts structured data.

    Args:
        pdf_file_path: The path to the PDF file.
        available_skills: List of available skill names from the database.

    Returns:
        A dictionary containing the extracted CV data.
    """
    try:
        # Read PDF file
        pdf_data = Path(pdf_file_path).read_bytes()

        # Upload the file to Gemini
        uploaded_file = genai.upload_file(pdf_file_path)

        # Build skill list for the prompt
        skills_list = ""
        if available_skills:
            skills_list = f"""
        
AVAILABLE SKILLS IN DATABASE (ONLY use skills from this list):
{', '.join(available_skills)}

IMPORTANT: For the 'skills' field, ONLY extract skills that are present in the above list. Match them as closely as possible (case-insensitive). If you find a skill not in the list, try to map it to the closest match from the available skills.
        """

        # The prompt to guide the model
        prompt = f"""
        Analyze the provided CV PDF and extract the following information in a structured JSON format.
        The JSON object should have these keys: 'personal_summary', 'experiences', 'education', 'skills', 'tools', 'projects'.
        {skills_list}
        - 'personal_summary': A string (professional summary or objective statement).
        - 'experiences': An array of objects, each with these fields:
          * 'title' (string, required): Job title
          * 'company' (string, required): Company name
          * 'location' (string or null): Location
          * 'start_date' (string or null): Start date in any format
          * 'end_date' (string or null): End date or null if current
          * 'current' (boolean): true if currently working, false otherwise
          * 'description' (string or null): Job description
        - 'education': An array of objects, each with these fields:
          * 'degree' (string, required): Degree name
          * 'institution' (string, required): Institution name
          * 'field' (string or null): Field of study
          * 'graduation_year' (string or null): Year of graduation
          * 'gpa' (string or null): GPA if mentioned
        - 'skills': An array of skill name STRINGS. Only include skills from the AVAILABLE SKILLS list above.
        - 'tools': An array of strings for tools/technologies (software, frameworks, platforms, etc.)
        - 'projects': An array of objects, each with these fields:
          * 'name' (string, required): Project name
          * 'description' (string or null): Project description
          * 'technologies' (string or null): Comma-separated list of technologies used (as a single string, NOT an array)
          * 'link' (string or null): Project link if available
        
        IMPORTANT FORMATTING RULES:
        1. For 'skills': Return skill names as strings, only from the available skills list
        2. For 'technologies' in projects: Return as a COMMA-SEPARATED STRING, not an array (e.g., "React, Node.js, MongoDB")
        3. For 'current' field in experiences: Return boolean true/false
        4. For dates: Keep them as strings in whatever format found
        5. If a field is not present, use null for optional string fields, [] for arrays, false for booleans
        
        Return ONLY valid JSON, no additional text or markdown formatting.
        """

        # Generate content using the model with the uploaded file
        # Try primary model first, fallback to secondary if needed
        try:
            response = primary_model.generate_content([prompt, uploaded_file])
        except Exception as e:
            error_msg = str(e)
            print(f"Error with primary model for CV analysis: {error_msg}")
            if "429" in error_msg or "quota" in error_msg.lower():
                # Try fallback model
                response = fallback_model.generate_content([prompt, uploaded_file])
            else:
                raise
        
        # Clean up the response and parse the JSON
        cleaned_response = response.text.strip().replace('```json', '').replace('```', '')
        parsed_data = json.loads(cleaned_response)
        
        # Delete the uploaded file
        genai.delete_file(uploaded_file.name)
        
        return parsed_data

    except Exception as e:
        print(f"Error analyzing CV with Gemini: {e}")
        return {}

# Example usage (for testing)
if __name__ == "__main__":
    # This is a placeholder for a real PDF path
    # test_pdf_path = "path/to/your/cv.pdf" 
    # if os.path.exists(test_pdf_path):
    #     extracted_data = analyze_cv_pdf(test_pdf_path)
    #     print(json.dumps(extracted_data, indent=2))
    # else:
    #     print(f"Test PDF not found at: {test_pdf_path}")

    test_prompt = "Explain what a large language model is in one sentence."
    generated_text = generate_text(test_prompt)
    print(f"Prompt: {test_prompt}")
    print(f"Gemini: {generated_text}")
