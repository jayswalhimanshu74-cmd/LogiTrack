import apiClient from './apiClient';

export const profileApi = {
  getProfile: async () => {
    const response = await apiClient.get('/api/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put('/api/profile', profileData);
    return response.data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/api/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await apiClient.put('/api/profile/change-password', passwordData);
    return response.data;
  },

  getSecurity: async () => {
    const response = await apiClient.get('/api/profile/security');
    return response.data;
  }
};

export default profileApi;
