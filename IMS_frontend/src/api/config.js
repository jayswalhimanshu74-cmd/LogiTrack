// Dynamic configuration for backend API and base URLs
export const getApiUrl = () => {
  let url = '';
  // If an environment variable is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    url = import.meta.env.VITE_API_URL;
  } else if (typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' || 
       window.location.hostname === '::1')) {
    url = 'http://localhost:8080';
  } else {
    // Fallback to deployed production API URL
    url = 'https://inventory-managment-system-31tb.onrender.com';
  }

  // Strip trailing slashes
  url = url.replace(/\/+$/, '');

  // Force /api suffix if not already present
  if (!url.endsWith('/api')) {
    url += '/api';
  }

  return url;
};

export const getBaseUrl = () => {
  const apiUrl = getApiUrl();
  // Strip trailing '/api' to get the base domain
  return apiUrl.replace(/\/api\/?$/, '');
};
