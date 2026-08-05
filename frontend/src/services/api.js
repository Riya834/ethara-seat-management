import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ethara_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Intercept responses to handle auth errors
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('ethara_token');
      localStorage.removeItem('ethara_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response ? error.response.data : error);
  }
);

export const authService = {
  login: (credentials) => API.post('/auth/login', credentials),
  getCurrentUser: () => API.get('/auth/me')
};

export const employeeService = {
  getEmployees: (params) => API.get('/employees', { params }),
  getEmployeeById: (id) => API.get(`/employees/${id}`),
  createEmployee: (data) => API.post('/employees', data),
  updateEmployee: (id, data) => API.put(`/employees/${id}`, data),
  deleteEmployee: (id) => API.delete(`/employees/${id}`),
  bulkUpload: (employeesData) => API.post('/employees/bulk-upload', { employeesData })
};

export const seatService = {
  getSeats: (params) => API.get('/seats', { params }),
  assignSeat: (data) => API.post('/seats/assign', data),
  transferSeat: (data) => API.post('/seats/transfer', data),
  releaseSeat: (data) => API.post('/seats/release', data)
};

export const projectService = {
  getProjects: () => API.get('/projects'),
  createProject: (data) => API.post('/projects', data)
};

export const spatialService = {
  getFloorsAndZones: () => API.get('/floors-zones')
};

export const dashboardService = {
  getStats: () => API.get('/dashboard')
};

export const aiService = {
  sendPrompt: (prompt) => API.post('/ai/chat', { prompt })
};

export default API;
