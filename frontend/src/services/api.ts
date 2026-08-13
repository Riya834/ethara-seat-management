import axios from 'axios';

const getBaseURL = () => {
  const meta = import.meta as any;
  if (meta && meta.env && meta.env.VITE_API_URL) {
    return meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('ethara_backend_url');
    if (saved) return saved;
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
      if (saved) config.baseURL = saved;
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
