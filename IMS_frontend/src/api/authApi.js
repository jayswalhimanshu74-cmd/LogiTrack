import apiClient from './apiClient';

export const authApi = {
  forgotPassword: async (email) => {
    const response = await apiClient.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post('/api/auth/reset-password', { token, newPassword });
    return response.data;
  }
};

export default authApi;
