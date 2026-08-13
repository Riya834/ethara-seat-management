import axios from 'axios';

const getBaseURL = () => {
  const meta = import.meta as any;
  if (meta && meta.env && meta.env.VITE_API_URL) {
    return meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('ethara_backend_url');
    if (saved) return saved;

    // Automatic Render environment backend detection
    const hostname = window.location.hostname;
    if (hostname.includes('.onrender.com')) {
      // If deployed on Render, default to server service
      return 'https://ethara-seat-management-server.onrender.com/api';
    }
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const meta = import.meta as any;
    if (meta && meta.env && meta.env.VITE_API_URL) {
      config.baseURL = meta.env.VITE_API_URL;
    } else if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ethara_backend_url');
      if (saved) {
        config.baseURL = saved;
      } else if (window.location.hostname.includes('.onrender.com')) {
        config.baseURL = 'https://ethara-seat-management-server.onrender.com/api';
      }
    }

    const token = localStorage.getItem('ethara_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if request is NOT login or register endpoint
    const url = error.config?.url || '';
    const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register');

    if (error.response && error.response.status === 401 && !isAuthRequest) {
      localStorage.removeItem('ethara_token');
      localStorage.removeItem('ethara_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
