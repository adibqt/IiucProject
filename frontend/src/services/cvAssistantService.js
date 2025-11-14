/**
 * CV Assistant Service - API calls for AI-powered CV assistance
 */
import api from "./api";

const cvAssistantAPI = {
  /**
   * Generate professional summary using AI
   * @returns {Promise<Object>} Generated summary
   */
  generateSummary: async () => {
    const response = await api.post("/cv-assistant/generate-summary");
    return response.data;
  },

  /**
   * Improve bullet points for a work experience
   * @param {number} experienceIndex - Index of the experience in the CV
   * @param {string} jobContext - Optional context about target job role
   * @returns {Promise<Object>} Improved bullet points
   */
  improveBulletPoints: async (experienceIndex, jobContext = null) => {
    const response = await api.post("/cv-assistant/improve-bullets", {
      experience_index: experienceIndex,
      job_context: jobContext,
    });
    return response.data;
  },

  /**
   * Improve project description and generate bullet points
   * @param {number} projectIndex - Index of the project in the CV
   * @returns {Promise<Object>} Improved project description and bullets
   */
  improveProject: async (projectIndex) => {
    const response = await api.post("/cv-assistant/improve-project", {
      project_index: projectIndex,
    });
    return response.data;
  },

  /**
   * Get LinkedIn profile improvement suggestions
   * @returns {Promise<Object>} LinkedIn suggestions (headline, about, tips)
   */
  getLinkedInSuggestions: async () => {
    const response = await api.get("/cv-assistant/linkedin-suggestions");
    return response.data;
  },

  /**
   * Get portfolio website improvement suggestions
   * @returns {Promise<Object>} Portfolio suggestions (structure, content, design)
   */
  getPortfolioSuggestions: async () => {
    const response = await api.get("/cv-assistant/portfolio-suggestions");
    return response.data;
  },

  /**
   * Analyze CV completeness and get suggestions
   * @returns {Promise<Object>} Analysis with score and suggestions
   */
  analyzeCV: async () => {
    const response = await api.get("/cv-assistant/analyze");
    return response.data;
  },

  /**
   * Get ATS-friendly keywords for CV
   * @param {string} targetRole - Optional target job role
   * @returns {Promise<Object>} Keywords list
   */
  getKeywords: async (targetRole = null) => {
    const params = targetRole ? { target_role: targetRole } : {};
    const response = await api.get("/cv-assistant/keywords", { params });
    return response.data;
  },

  /**
   * Apply generated professional summary to CV
   * @param {string} summary - The summary text to apply
   * @returns {Promise<Object>} Success response
   */
  applySummary: async (summary) => {
    const response = await api.post(`/cv-assistant/apply-summary?summary=${encodeURIComponent(summary)}`);
    return response.data;
  },
};

export default cvAssistantAPI;
