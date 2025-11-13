import api from "./api";

const jobAPI = {
  list: async (filters = {}) => {
    // filters: { q, location, job_type, skill, skip, limit }
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.append(k, v);
    });
    const url = `/jobs${
      params.toString() ? `/search?${params.toString()}` : ""
    }`;
    const response = await api.get(url);
    return response.data;
  },

  get: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  seed: async () => {
    const response = await api.post(`/jobs/seed`);
    return response.data;
  },

  create: async (jobData) => {
    const response = await api.post(`/admin/jobs`, jobData);
    return response.data;
  },

  update: async (jobId, jobData) => {
    const response = await api.put(`/admin/jobs/${jobId}`, jobData);
    return response.data;
  },

  delete: async (jobId) => {
    const response = await api.delete(`/admin/jobs/${jobId}`);
    return response.data;
  },

  listSkillsPublic: async () => {
    // public skills endpoint (available without admin token)
    const response = await api.get(`/skills`);
    return response.data;
  },

  apply: async (jobId, applicationData) => {
    // applicationData: { message?: string, resume_url?: string }
    const response = await api.post(`/jobs/${jobId}/apply`, applicationData);
    return response.data;
  },
};

export default jobAPI;
