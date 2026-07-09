import apiClient from './apiClient';

export const productApi = {
  getProducts: async ({ page = 0, size = 10, sort = 'id,asc', search = '', category = '', status = '' }) => {
    const params = {};
    if (page !== undefined) params.page = page;
    if (size !== undefined) params.size = size;
    if (sort) params.sort = sort;
    if (search) params.search = search;
    if (category) params.category = category;
    if (status) params.status = status;

    const response = await apiClient.get('/api/products', { params });
    return response.data;
  },

  getProduct: async (id) => {
    const response = await apiClient.get(`/api/products/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await apiClient.post('/api/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/api/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/api/products/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get('/api/products/categories');
    return response.data;
  },

  getLowStock: async (page = 0, size = 10) => {
    const response = await apiClient.get('/api/products/low-stock', {
      params: { page, size }
    });
    return response.data;
  }
};

export default productApi;
