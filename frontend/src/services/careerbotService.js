/**
 * CareerBot Service - API calls for CareerBot chat
 */
import api from "./api";

const careerbotAPI = {
  /**
   * Send a message to CareerBot
   * @param {string} message - User's message
   * @returns {Promise<{reply: string, language: string}>}
   */
  ask: async (message) => {
    const response = await api.post("/careerbot/ask", {
      message,
    });
    return response.data;
  },

  /**
   * Get conversation history (for future use)
   * @param {number} skip - Pagination offset
   * @param {number} limit - Number of messages to fetch
   * @returns {Promise<{conversations: Array, count: number}>}
   */
  getHistory: async (skip = 0, limit = 50) => {
    const response = await api.get(
      `/careerbot/history?skip=${skip}&limit=${limit}`
    );
    return response.data;
  },
};

export default careerbotAPI;
