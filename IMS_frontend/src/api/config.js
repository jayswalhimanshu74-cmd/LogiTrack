// Dynamic configuration for backend API and base URLs
export const getApiUrl = () => {
  // If an environment variable is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Detect if running locally
  if (typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' || 
       window.location.hostname === '::1')) {
    return 'http://localhost:8080/api';
  }
  // Fallback to deployed production API URL
  return 'https://inventory-managment-system-31tb.onrender.com/api';
};

export const getBaseUrl = () => {
  const apiUrl = getApiUrl();
  // Strip trailing '/api' or '/api/' if present to get the base domain
  return apiUrl.replace(/\/api\/?$/, '');
};
