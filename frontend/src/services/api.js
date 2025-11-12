// API service for SkillSync
// Handles all backend communication

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
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
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/admin/login', { email, password });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/admin/logout');
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/admin/me');
    return response.data;
  },
  
  initializeAdmin: async () => {
    const response = await api.post('/admin/init');
    return response.data;
  }
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  }
};

// Users API
export const usersAPI = {
  list: async (skip = 0, limit = 50) => {
    const response = await api.get(`/admin/users?skip=${skip}&limit=${limit}`);
    return response.data;
  }
};

// Skills API
export const skillsAPI = {
  list: async (skip = 0, limit = 50) => {
    const response = await api.get(`/admin/skills?skip=${skip}&limit=${limit}`);
    return response.data;
  }
};

// Courses API
export const coursesAPI = {
  list: async (skip = 0, limit = 50) => {
    const response = await api.get(`/admin/courses?skip=${skip}&limit=${limit}`);
    return response.data;
  }
};

export default api;
