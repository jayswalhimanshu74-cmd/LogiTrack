import apiClient from './apiClient';

const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportApi = {
  exportProducts: async (params = {}) => {
    const response = await apiClient.get('/api/export/products', { params, responseType: 'blob' });
    downloadFile(response.data, `products_${new Date().toISOString().split('T')[0]}.csv`);
  },
  exportSales: async (params = {}) => {
    const response = await apiClient.get('/api/export/sales', { params, responseType: 'blob' });
    downloadFile(response.data, `sales_${new Date().toISOString().split('T')[0]}.csv`);
  },
  exportPurchases: async (params = {}) => {
    const response = await apiClient.get('/api/export/purchases', { params, responseType: 'blob' });
    downloadFile(response.data, `purchases_${new Date().toISOString().split('T')[0]}.csv`);
  },
  exportInvoices: async (params = {}) => {
    const response = await apiClient.get('/api/export/invoices', { params, responseType: 'blob' });
    downloadFile(response.data, `invoices_${new Date().toISOString().split('T')[0]}.csv`);
  },
  exportReports: async () => {
    const response = await apiClient.get('/api/export/reports', { responseType: 'blob' });
    downloadFile(response.data, `report_${new Date().toISOString().split('T')[0]}.csv`);
  },
  exportLowStock: async (params = {}) => {
    const response = await apiClient.get('/api/export/low-stock', { params, responseType: 'blob' });
    downloadFile(response.data, `low_stock_report_${new Date().toISOString().split('T')[0]}.csv`);
  },
  exportForecast: async (params = {}) => {
    const response = await apiClient.get('/api/export/forecast', { params, responseType: 'blob' });
    downloadFile(response.data, `inventory_forecast_${new Date().toISOString().split('T')[0]}.csv`);
  },
  exportAbc: async (params = {}) => {
    const response = await apiClient.get('/api/export/abc', { params, responseType: 'blob' });
    downloadFile(response.data, `abc_analysis_${new Date().toISOString().split('T')[0]}.csv`);
  }
};

export default exportApi;
