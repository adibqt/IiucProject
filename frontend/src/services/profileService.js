/**
 * Profile Service - API calls for user profile, skills, experience, career interests, CV
 */
import api from "./api";

const profileAPI = {
  // Profile endpoints
  getProfile: async () => {
    const response = await api.get("/users/me/profile");
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put("/users/me/profile", profileData);
    return response.data;
  },

  getPublicProfile: async (userId) => {
    const response = await api.get(`/users/${userId}/profile`);
    return response.data;
  },

  // Skills endpoints
  getSkills: async () => {
    const response = await api.get("/users/me/skills");
    return response.data;
  },

  addSkill: async (skillId, proficiencyLevel = "beginner") => {
    const response = await api.post(
      `/users/me/skills/${skillId}?proficiency_level=${proficiencyLevel}`
    );
    return response.data;
  },

  removeSkill: async (skillId) => {
    const response = await api.delete(`/users/me/skills/${skillId}`);
    return response.data;
  },

  suggestSkill: async (skillData) => {
    const response = await api.post("/users/me/skills/suggest", skillData);
    return response.data;
  },

  getAvailableSkills: async () => {
    const response = await api.get("/skills");
    return response.data;
  },

  // Career interests endpoints
  getCareerInterests: async () => {
    const response = await api.get("/users/me/career-interests");
    return response.data;
  },

  setCareerInterests: async (interests) => {
    const response = await api.post("/users/me/career-interests", {
      interests,
    });
    return response.data;
  },

  // Experience endpoint
  setExperience: async (experienceDescription) => {
    const response = await api.put("/users/me/experience", {
      experience_description: experienceDescription,
    });
    return response.data;
  },

  // CV endpoint
  setCV: async (cvText) => {
    const response = await api.put("/users/me/cv", {
      cv_text: cvText,
    });
    return response.data;
  },
};

export default profileAPI;
