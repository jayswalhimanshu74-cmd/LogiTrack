import apiClient from './apiClient';

export const invoiceApi = {
  getInvoices: async ({ page = 0, size = 10, sort = 'id,desc', search = '', status = '', paymentStatus = '', startDate = '', endDate = '' }) => {
    const params = {};
    if (page !== undefined) params.page = page;
    if (size !== undefined) params.size = size;
    if (sort) params.sort = sort;
    if (search) params.search = search;
    if (status) params.status = status;
    if (paymentStatus) params.paymentStatus = paymentStatus;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await apiClient.get('/api/invoices', { params });
    return response.data;
  },

  getInvoice: async (id) => {
    const response = await apiClient.get(`/api/invoices/${id}`);
    return response.data;
  },

  createInvoice: async (invoiceData) => {
    const response = await apiClient.post('/api/invoices', invoiceData);
    return response.data;
  },

  generateInvoice: async (saleId) => {
    const response = await apiClient.post(`/api/invoices/generate/${saleId}`);
    return response.data;
  },

  updateInvoice: async (id, invoiceData) => {
    const response = await apiClient.put(`/api/invoices/${id}`, invoiceData);
    return response.data;
  },

  updateInvoiceStatus: async (id, status) => {
    const response = await apiClient.put(`/api/invoices/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  deleteInvoice: async (id) => {
    const response = await apiClient.delete(`/api/invoices/${id}`);
    return response.data;
  },

  getStatistics: async () => {
    const response = await apiClient.get('/api/invoices/statistics');
    return response.data;
  },

  getRecent: async () => {
    const response = await apiClient.get('/api/invoices/recent');
    return response.data;
  }
};

export default invoiceApi;
