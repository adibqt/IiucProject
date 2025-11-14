"""
Guardrail Service
Filters out inappropriate content and ensures CareerBot stays focused on career topics
"""
import re
from typing import Dict, List


# Blocked keywords and patterns
BLOCKED_KEYWORDS = {
    # Politics
    "politics", "political", "election", "vote", "candidate", "party", "government policy",
    "democrat", "republican", "liberal", "conservative", "left wing", "right wing",
    
    # Religion
    "religion", "religious", "god", "prayer", "worship", "church", "mosque", "temple",
    "hindu", "muslim", "christian", "buddhist", "jewish", "atheist",
    
    # Adult content
    "sex", "porn", "xxx", "adult content", "nsfw",
    
    # Harm / Self-harm
    "suicide", "kill myself", "self harm", "hurt myself", "end my life",
    "how to die", "ways to die",
    
    # Violence
    "kill", "murder", "violence", "attack", "bomb", "weapon", "gun", "shoot",
    "terrorism", "terrorist",
    
    # Illegal / Unethical
    "hack", "steal", "fraud", "scam", "illegal", "drugs", "cocaine", "marijuana",
    "how to cheat", "how to lie",
    
    # Non-career topics
    "movie", "celebrity", "gossip", "sports team", "game score", "entertainment news",
    "tv show", "netflix", "youtube video",
}


def filter_out_of_context(message: str) -> Dict:
    """
    Filter messages that are out of context or inappropriate for CareerBot.
    
    Uses word boundary matching to avoid false positives (e.g., "kill" in "skills").
    
    Args:
        message: User's message text
        
    Returns:
        Dictionary with:
        - allowed: bool - Whether message is allowed
        - sanitized: str - Sanitized version of message (if allowed)
        - reason: str - Reason for blocking (if not allowed)
    """
    if not message or not isinstance(message, str):
        return {
            "allowed": False,
            "sanitized": "",
            "reason": "Empty or invalid message"
        }
    
    # Normalize message for checking
    message_lower = message.lower().strip()
    
    # Check for blocked keywords using word boundaries to avoid false positives
    # This prevents "kill" from matching "skills", "kill" from matching "skillful", etc.
    for keyword in BLOCKED_KEYWORDS:
        # Use word boundary regex to match whole words only
        # \b matches word boundaries (start/end of word)
        pattern = r'\b' + re.escape(keyword) + r'\b'
        if re.search(pattern, message_lower, re.IGNORECASE):
            return {
                "allowed": False,
                "sanitized": "",
                "reason": f"Message contains inappropriate content related to: {keyword}"
            }
    
    # Check for patterns that suggest harmful intent
    harmful_patterns = [
        r"how\s+to\s+(kill|hurt|harm|die)",
        r"i\s+want\s+to\s+(die|kill|hurt)",
        r"help\s+me\s+(kill|hurt|die)",
    ]
    
    for pattern in harmful_patterns:
        if re.search(pattern, message_lower, re.IGNORECASE):
            return {
                "allowed": False,
                "sanitized": "",
                "reason": "Message contains harmful content"
            }
    
    # Additional check: Allow career-related keywords to ensure legitimate questions pass
    # This is a whitelist approach for common career terms
    career_keywords = [
        "skill", "skills", "job", "jobs", "career", "opportunity", "opportunities",
        "learn", "learning", "education", "experience", "resume", "cv", "interview",
        "salary", "position", "role", "company", "industry", "field", "path",
        "development", "growth", "advice", "guidance", "recommendation", "suggestion",
        "what", "which", "how", "where", "when", "why", "tell", "show", "list",
        "my", "me", "i", "top", "best", "general", "current", "demand", "trend"
    ]
    
    # If message contains career-related keywords, it's more likely to be legitimate
    # This helps prevent false positives
    has_career_context = any(
        re.search(r'\b' + re.escape(keyword) + r'\b', message_lower, re.IGNORECASE)
        for keyword in career_keywords
    )
    
    # Basic sanitization: remove excessive whitespace
    sanitized = " ".join(message.split())
    
    # Allow the message - word boundary matching should prevent false positives
    # Career context check is just for additional confidence
    return {
        "allowed": True,
        "sanitized": sanitized,
        "reason": None
    }


def get_safe_fallback_response() -> str:
    """
    Returns a safe fallback message when content is blocked.
    
    Returns:
        Safe fallback message string
    """
    return "CareerBot can only discuss careers, skills, jobs, and learning topics. Please ask me about career development, skill recommendations, job search tips, or learning paths."

