import apiClient from './apiClient';

export const userManagementApi = {
  getUsers: async (params = {}) => {
    const response = await apiClient.get('/api/users', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/users/${id}`);
    return response.data;
  },

  changeRole: async (id, role) => {
    const response = await apiClient.patch(`/api/users/${id}/role`, { role });
    return response.data;
  },

  toggleStatus: async (id, active) => {
    const response = await apiClient.patch(`/api/users/${id}/status`, null, {
      params: { active }
    });
    return response.data;
  },

  resetPassword: async (id) => {
    const response = await apiClient.patch(`/api/users/${id}/reset-password`);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await apiClient.delete(`/api/users/${id}`);
    return response.data;
  }
};

export default userManagementApi;
