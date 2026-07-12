import apiClient from './apiClient';

export const authApi = {
  forgotPassword: async (email) => {
    const response = await apiClient.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post('/api/auth/reset-password', { token, newPassword });
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await apiClient.get(`/api/auth/verify-email?token=${token}`);
    return response.data;
  },

  resendVerification: async (email) => {
    const response = await apiClient.post('/api/auth/resend-verification', { email });
    return response.data;
  }
};

export default authApi;
