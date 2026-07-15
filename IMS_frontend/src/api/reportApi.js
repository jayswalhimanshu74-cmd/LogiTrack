import apiClient from './apiClient';

export const reportApi = {
  getSalesReport: async ({ page = 0, size = 10, sort = 'id,desc', search = '', status = '', paymentStatus = '', startDate = '', endDate = '' }) => {
    const params = { page, size, sort };
    if (search) params.search = search;
    if (status) params.status = status;
    if (paymentStatus) params.paymentStatus = paymentStatus;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await apiClient.get('/api/reports/sales', { params });
    return response.data;
  },

  getPurchaseReport: async ({ page = 0, size = 10, sort = 'id,desc', search = '', status = '', paymentStatus = '', startDate = '', endDate = '' }) => {
    const params = { page, size, sort };
    if (search) params.search = search;
    if (status) params.status = status;
    if (paymentStatus) params.paymentStatus = paymentStatus;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await apiClient.get('/api/reports/purchases', { params });
    return response.data;
  },

  getInventoryReport: async ({ page = 0, size = 10, sort = 'id,desc', search = '', category = '', status = '' }) => {
    const params = { page, size, sort };
    if (search) params.search = search;
    if (category) params.category = category;
    if (status) params.status = status;

    const response = await apiClient.get('/api/reports/inventory', { params });
    return response.data;
  },

  getInvoiceReport: async ({ page = 0, size = 10, sort = 'id,desc', search = '', status = '', paymentStatus = '', startDate = '', endDate = '' }) => {
    const params = { page, size, sort };
    if (search) params.search = search;
    if (status) params.status = status;
    if (paymentStatus) params.paymentStatus = paymentStatus;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await apiClient.get('/api/reports/invoices', { params });
    return response.data;
  },

  getFinancialSummary: async () => {
    const response = await apiClient.get('/api/reports/financial-summary');
    return response.data;
  },

  getChartData: async () => {
    const response = await apiClient.get('/api/reports/charts');
    return response.data;
  },

  getLowStockReport: async ({ page = 0, size = 10, sort = 'id,desc', search = '', priority = '' }) => {
    const params = { page, size, sort };
    if (search) params.search = search;
    if (priority) params.priority = priority;

    const response = await apiClient.get('/api/reports/low-stock', { params });
    return response.data;
  },

  getForecastReport: async ({ page = 0, size = 10, sort = 'id,desc', search = '', status = '' }) => {
    const params = { page, size, sort };
    if (search) params.search = search;
    if (status) params.status = status;

    const response = await apiClient.get('/api/reports/forecast', { params });
    return response.data;
  },

  getAbcReport: async ({ page = 0, size = 10, sort = 'id,desc', search = '', category = '' }) => {
    const params = { page, size, sort };
    if (search) params.search = search;
    if (category) params.category = category;

    const response = await apiClient.get('/api/reports/abc', { params });
    return response.data;
  }
};

export default reportApi;
