/**
 * Chat Storage Utility
 * Manages localStorage for CareerBot conversation persistence
 */

const CURRENT_SESSION_KEY = "careerbot_current_session";

/**
 * Save current session ID to localStorage
 * @param {number} sessionId - Session ID
 */
export const saveCurrentSession = (sessionId) => {
  try {
    localStorage.setItem(CURRENT_SESSION_KEY, sessionId.toString());
  } catch (error) {
    console.error("Failed to save current session:", error);
  }
};

/**
 * Load current session ID from localStorage
 * @returns {number|null} - Session ID or null
 */
export const loadCurrentSession = () => {
  try {
    const stored = localStorage.getItem(CURRENT_SESSION_KEY);
    return stored ? parseInt(stored, 10) : null;
  } catch (error) {
    console.error("Failed to load current session:", error);
    return null;
  }
};

/**
 * Clear current session from localStorage
 */
export const clearCurrentSession = () => {
  try {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  } catch (error) {
    console.error("Failed to clear current session:", error);
  }
};

// Legacy function - kept for backward compatibility but no longer used
export const saveChatToLocal = (messages) => {
  console.warn("saveChatToLocal is deprecated - using session-based storage");
};

// Legacy function - kept for backward compatibility but no longer used
export const loadChatFromLocal = () => {
  console.warn("loadChatFromLocal is deprecated - using session-based storage");
  return null;
};

// Legacy function - kept for backward compatibility but no longer used
export const clearChatLocal = () => {
  console.warn("clearChatLocal is deprecated - using session-based storage");
};
