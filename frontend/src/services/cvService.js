/**
 * CV Service - API calls for CV/Resume management
 * Uses the new /api/cv endpoints
 */
import api from "./api";

const cvAPI = {
  /**
   * Get current user's CV/resume
   * @returns {Promise<Object>} CV data with parsed JSON fields
   */
  getCV: async () => {
    const response = await api.get("/cv/me");
    return response.data;
  },

  /**
   * Create or update current user's CV/resume
   * @param {Object} cvData - CV data object
   * @param {string} cvData.personal_summary - Professional summary
   * @param {Array} cvData.experiences - Array of experience objects
   * @param {Array} cvData.education - Array of education objects
   * @param {Array<number>} cvData.skills - Array of skill IDs from admin-defined skills
   * @param {Array<string>} cvData.tools - Array of tool/technology names
   * @param {Array} cvData.projects - Array of project objects
   * @param {string} cvData.raw_cv_text - Optional raw CV text
   * @returns {Promise<Object>} Created/updated CV data
   */
  saveCV: async (cvData) => {
    const response = await api.post("/cv", cvData);
    return response.data;
  },

  /**
   * Delete/reset current user's CV
   * @returns {Promise<Object>} Success response
   */
  resetCV: async () => {
    const response = await api.delete("/cv/reset");
    return response.data;
  },

  /**
   * Upload CV as PDF file
   * @param {File} file - PDF file to upload
   * @returns {Promise<Object>} Success response
   */
  uploadPDF: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/cv/pdf", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Download current user's CV PDF
   * @returns {Promise<Blob>} PDF file blob
   */
  downloadPDF: async () => {
    const response = await api.get("/cv/pdf", {
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Delete current user's CV PDF
   * @returns {Promise<Object>} Success response
   */
  deletePDF: async () => {
    const response = await api.delete("/cv/pdf");
    return response.data;
  },
};

export default cvAPI;
