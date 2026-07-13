import apiClient from './apiClient';

const auditApi = {
  getLogs: async (params = {}) => {
    const response = await apiClient.get('/api/audit', { params });
    return response.data;
  },

  getLogById: async (id) => {
    const response = await apiClient.get(`/api/audit/${id}`);
    return response.data;
  },

  exportLogs: async (params = {}, format = 'csv') => {
    const queryParams = { ...params, format };
    const response = await apiClient.get('/api/audit/export', {
      params: queryParams,
      responseType: 'blob',
    });
    return response.data;
  }
};

export default auditApi;
