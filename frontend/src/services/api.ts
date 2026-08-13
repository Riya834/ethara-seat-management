import axios from 'axios';

const getBaseURL = () => {
  const meta = import.meta as any;
  if (meta && meta.env && meta.env.VITE_API_URL) {
    return meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('ethara_backend_url');
    if (saved) return saved;

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }

    // Default for live production web apps deployed on Render or cloud static hosts
    return 'https://ethara-seat-management.onrender.com/api';
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
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
      } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        config.baseURL = 'http://localhost:5000/api';
      } else {
        config.baseURL = 'https://ethara-seat-management.onrender.com/api';
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
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('ethara_token');
      localStorage.removeItem('ethara_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
