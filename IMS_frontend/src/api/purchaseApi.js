import apiClient from './apiClient';

export const purchaseApi = {
  getPurchases: async ({ page = 0, size = 10, sort = 'id,desc', search = '', status = '', paymentStatus = '', startDate = '', endDate = '' }) => {
    const params = {};
    if (page !== undefined) params.page = page;
    if (size !== undefined) params.size = size;
    if (sort) params.sort = sort;
    if (search) params.search = search;
    if (status) params.status = status;
    if (paymentStatus) params.paymentStatus = paymentStatus;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await apiClient.get('/api/purchases', { params });
    return response.data;
  },

  getPurchase: async (id) => {
    const response = await apiClient.get(`/api/purchases/${id}`);
    return response.data;
  },

  createPurchase: async (purchaseData) => {
    const response = await apiClient.post('/api/purchases', purchaseData);
    return response.data;
  },

  updatePurchase: async (id, purchaseData) => {
    const response = await apiClient.put(`/api/purchases/${id}`, purchaseData);
    return response.data;
  },

  deletePurchase: async (id) => {
    const response = await apiClient.delete(`/api/purchases/${id}`);
    return response.data;
  },

  getStatistics: async () => {
    const response = await apiClient.get('/api/purchases/statistics');
    return response.data;
  },

  getRecent: async () => {
    const response = await apiClient.get('/api/purchases/recent');
    return response.data;
  }
};

export default purchaseApi;
