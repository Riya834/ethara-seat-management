import axios from 'axios';

const RENDER_BACKEND_API = 'https://ethara-seat-management-nwsy.onrender.com/api';

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('ethara_backend_url');
    if (saved) return saved;

    // If running on a live deployed domain (e.g. onrender.com)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      const meta = import.meta as any;
      if (meta && meta.env && meta.env.VITE_API_URL && meta.env.VITE_API_URL.startsWith('http')) {
        return meta.env.VITE_API_URL;
      }
      return RENDER_BACKEND_API;
    }
  }

  const meta = import.meta as any;
  if (meta && meta.env && meta.env.VITE_API_URL) {
    return meta.env.VITE_API_URL;
  }

  return RENDER_BACKEND_API;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    config.baseURL = getBaseURL();

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
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
