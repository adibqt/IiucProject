"""
Language Detection Service
Detects if text is English, Bangla, or mixed (Banglish)
"""
import re
from typing import Literal


# Unicode ranges for Bangla characters
BANGLA_UNICODE_START = 0x0980
BANGLA_UNICODE_END = 0x09FF


def is_bangla_char(char: str) -> bool:
    """
    Check if a character is a Bangla Unicode character.
    
    Args:
        char: Single character string
        
    Returns:
        True if character is in Bangla Unicode range
    """
    if not char:
        return False
    code_point = ord(char)
    return BANGLA_UNICODE_START <= code_point <= BANGLA_UNICODE_END


def detect_language(text: str) -> Literal["en", "bn", "mix"]:
    """
    Detect the language of the input text.
    
    Args:
        text: Input text to analyze
        
    Returns:
        "en" for English, "bn" for Bangla, "mix" for mixed (Banglish)
    """
    if not text or not isinstance(text, str):
        return "en"
    
    # Remove whitespace and punctuation for analysis
    clean_text = re.sub(r'[^\w\s\u0980-\u09FF]', '', text)
    
    if not clean_text:
        return "en"
    
    # Count Bangla and English characters
    bangla_count = 0
    english_count = 0
    total_chars = 0
    
    for char in clean_text:
        if char.isspace():
            continue
        
        total_chars += 1
        
        if is_bangla_char(char):
            bangla_count += 1
        elif char.isalpha():
            english_count += 1
    
    if total_chars == 0:
        return "en"
    
    # Calculate percentages
    bangla_ratio = bangla_count / total_chars
    english_ratio = english_count / total_chars
    
    # Determine language based on ratios
    if bangla_ratio > 0.7:
        return "bn"  # Mostly Bangla
    elif english_ratio > 0.7:
        return "en"  # Mostly English
    else:
        return "mix"  # Mixed (Banglish)

