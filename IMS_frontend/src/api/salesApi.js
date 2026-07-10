import apiClient from './apiClient';

export const salesApi = {
  getSales: async ({ page = 0, size = 10, sort = 'id,desc', search = '', status = '', paymentStatus = '', startDate = '', endDate = '' }) => {
    const params = {};
    if (page !== undefined) params.page = page;
    if (size !== undefined) params.size = size;
    if (sort) params.sort = sort;
    if (search) params.search = search;
    if (status) params.status = status;
    if (paymentStatus) params.paymentStatus = paymentStatus;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await apiClient.get('/api/sales', { params });
    return response.data;
  },

  getSale: async (id) => {
    const response = await apiClient.get(`/api/sales/${id}`);
    return response.data;
  },

  createSale: async (saleData) => {
    const response = await apiClient.post('/api/sales', saleData);
    return response.data;
  },

  updateSale: async (id, saleData) => {
    const response = await apiClient.put(`/api/sales/${id}`, saleData);
    return response.data;
  },

  deleteSale: async (id) => {
    const response = await apiClient.delete(`/api/sales/${id}`);
    return response.data;
  },

  getStatistics: async () => {
    const response = await apiClient.get('/api/sales/statistics');
    return response.data;
  },

  getRecent: async () => {
    const response = await apiClient.get('/api/sales/recent');
    return response.data;
  }
};

export default salesApi;
