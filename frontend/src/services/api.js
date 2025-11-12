// API service for SkillSync
// Handles all backend communication

import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Try user token first, then admin token for backward compatibility
    const userToken = localStorage.getItem("userToken");
    const adminToken = localStorage.getItem("adminToken");
    const token = userToken || adminToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear tokens and redirect to login
      const isAdmin = localStorage.getItem("adminToken");

      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");

      if (isAdmin) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post("/admin/login", { email, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/admin/logout");
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/admin/me");
    return response.data;
  },

  initializeAdmin: async () => {
    const response = await api.post("/admin/init");
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get("/admin/dashboard/stats");
    return response.data;
  },
};

// Users API
export const usersAPI = {
  list: async (skip = 0, limit = 50) => {
    const response = await api.get(`/admin/users?skip=${skip}&limit=${limit}`);
    return response.data;
  },
};

// Skills API
export const skillsAPI = {
  list: async (skip = 0, limit = 50) => {
    const response = await api.get(`/admin/skills?skip=${skip}&limit=${limit}`);
    return response.data;
  },
};

// Courses API
export const coursesAPI = {
  list: async (skip = 0, limit = 50) => {
    const response = await api.get(
      `/admin/courses?skip=${skip}&limit=${limit}`
    );
    return response.data;
  },
};

// User API (non-admin)
export const userAPI = {
  register: async (fullName, email, password) => {
    const response = await api.post("/users/register", {
      full_name: fullName,
      email,
      password,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post("/users/login", {
      email,
      password,
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/users/logout");
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put("/users/me", profileData);
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  addSkill: async (skill) => {
    const response = await api.post("/users/me/skills", null, {
      params: { skill },
    });
    return response.data;
  },

  removeSkill: async (skill) => {
    const response = await api.delete("/users/me/skills", {
      params: { skill },
    });
    return response.data;
  },

  getSkills: async () => {
    const response = await api.get("/users/me/skills");
    return response.data;
  },

  updateCV: async (cvText) => {
    const response = await api.put("/users/me/cv", null, {
      params: { cv_text: cvText },
    });
    return response.data;
  },
};

export default api;
