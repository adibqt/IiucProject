/**
 * CareerBot Service - API calls for CareerBot chat
 */
import api from "./api";

const careerbotAPI = {
  /**
   * Send a message to CareerBot
   * @param {string} message - User's message
   * @param {number|null} sessionId - Optional session ID
   * @returns {Promise<{reply: string, language: string, session_id: number}>}
   */
  ask: async (message, sessionId = null) => {
    const response = await api.post("/careerbot/ask", {
      message,
      session_id: sessionId,
    });
    return response.data;
  },

  /**
   * Get conversation history for a specific session
   * Returns messages in chronological order (oldest first)
   * @param {number} sessionId - Session ID
   * @returns {Promise<Array>} - Array of message objects with role, message, language, timestamp
   */
  getHistory: async (sessionId) => {
    const response = await api.get(
      `/careerbot/history?session_id=${sessionId}`
    );
    return response.data;
  },

  /**
   * Get all conversation sessions
   * @returns {Promise<Array>} - Array of session objects
   */
  getSessions: async () => {
    const response = await api.get("/careerbot/sessions");
    return response.data;
  },

  /**
   * Create a new conversation session
   * @param {string} title - Optional title
   * @returns {Promise<Object>} - Session object
   */
  createSession: async (title = "New Chat") => {
    const response = await api.post("/careerbot/sessions", { title });
    return response.data;
  },

  /**
   * Update (rename) a conversation session
   * @param {number} sessionId - Session ID
   * @param {string} title - New title
   * @returns {Promise<Object>} - Updated session object
   */
  updateSession: async (sessionId, title) => {
    const response = await api.patch(`/careerbot/sessions/${sessionId}`, {
      title,
    });
    return response.data;
  },

  /**
   * Delete a conversation session
   * @param {number} sessionId - Session ID
   * @returns {Promise<Object>} - Deletion confirmation
   */
  deleteSession: async (sessionId) => {
    const response = await api.delete(`/careerbot/sessions/${sessionId}`);
    return response.data;
  },
};

export default careerbotAPI;
