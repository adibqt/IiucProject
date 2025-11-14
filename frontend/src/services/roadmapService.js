// Roadmap Service
// Handles all roadmap-related API calls

import api from "./api";

const roadmapAPI = {
  /**
   * Generate a new career roadmap
   * @param {Object} payload - { targetRole, timeframe, weeklyHours? }
   * @returns {Promise<Object>} - { success, roadmap_id, visual, description }
   */
  generateRoadmap: async (payload) => {
    const response = await api.post("/roadmap/generate", payload);
    return response.data;
  },

  /**
   * Get all roadmaps for the current user
   * @returns {Promise<Array>} - Array of roadmap objects
   */
  getAllRoadmaps: async () => {
    const response = await api.get("/roadmap/all");
    return response.data;
  },

  /**
   * Get a specific roadmap by ID
   * @param {number} id - Roadmap ID
   * @returns {Promise<Object>} - Roadmap object
   */
  getRoadmapById: async (id) => {
    const response = await api.get(`/roadmap/${id}`);
    return response.data;
  },

  /**
   * Delete a roadmap by ID
   * @param {number} id - Roadmap ID
   * @returns {Promise<Object>} - Success response
   */
  deleteRoadmap: async (id) => {
    const response = await api.delete(`/roadmap/${id}`);
    return response.data;
  },
};

export default roadmapAPI;
