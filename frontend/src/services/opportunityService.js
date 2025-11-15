// Opportunity Service - API calls for local opportunities
import api from "./api";

const opportunityAPI = {
  /**
   * Get personalized opportunity recommendations
   * @returns {Promise} Response with explanation and opportunities
   */
  getRecommendations: async () => {
    const response = await api.get("/opportunities/recommend");
    return response.data;
  },

  /**
   * Get all opportunities (admin only)
   * @param {number} skip - Pagination offset
   * @param {number} limit - Number of results
   * @returns {Promise} List of opportunities
   */
  getAllOpportunities: async (skip = 0, limit = 100) => {
    const response = await api.get(
      `/opportunities/all?skip=${skip}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Get a specific opportunity by ID
   * @param {number} id - Opportunity ID
   * @returns {Promise} Opportunity details
   */
  getOpportunityById: async (id) => {
    const response = await api.get(`/opportunities/${id}`);
    return response.data;
  },

  /**
   * Create a new opportunity (admin only)
   * @param {Object} opportunityData - Opportunity data
   * @returns {Promise} Created opportunity
   */
  createOpportunity: async (opportunityData) => {
    const response = await api.post("/opportunities/create", opportunityData);
    return response.data;
  },

  /**
   * Update an opportunity (admin only)
   * @param {number} id - Opportunity ID
   * @param {Object} opportunityData - Updated opportunity data
   * @returns {Promise} Updated opportunity
   */
  updateOpportunity: async (id, opportunityData) => {
    const response = await api.put(`/opportunities/${id}`, opportunityData);
    return response.data;
  },

  /**
   * Delete an opportunity (admin only)
   * @param {number} id - Opportunity ID
   * @returns {Promise} Success response
   */
  deleteOpportunity: async (id) => {
    const response = await api.delete(`/opportunities/${id}`);
    return response.data;
  },
};

export default opportunityAPI;
