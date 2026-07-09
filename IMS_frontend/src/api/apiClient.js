import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Capture HTTP codes and raise toast events
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    let message = 'An unexpected error occurred. Please try again.';

    if (status === 401) {
      message = 'Session expired. Redirecting to login...';
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userFullName');
      localStorage.removeItem('userRole');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } else if (status === 403) {
      message = 'Access Denied: You do not have permission to perform this action.';
    } else if (status === 404) {
      message = error.response?.data?.message || 'Requested resource not found.';
    } else if (status === 409) {
      message = error.response?.data?.message || 'Conflict error: Resource already exists.';
    } else if (status === 500) {
      message = 'Internal Server Error. Please contact support.';
    } else if (!error.response) {
      message = 'Cannot connect to backend server. Operating in offline demo mode.';
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    }

    // Emit custom event for toast notifications
    window.dispatchEvent(
      new CustomEvent('app-toast', {
        detail: { message, type: 'error' },
      })
    );

    return Promise.reject(error);
  }
);

export default apiClient;
