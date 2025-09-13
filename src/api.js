import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://hawalasend-backend-production.up.railway.app'
  : 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding auth token to request:', config.url);
    } else {
      console.log('No auth token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Unauthorized request - token may be expired');
      // Only clear auth and redirect if it's an auth endpoint or critical error
      const url = error.config?.url || '';
      if (url.includes('/auth/') || url.includes('/transfers/') || url.includes('/transactions/')) {
        console.log('Clearing auth due to 401 on critical endpoint');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        // Use a small delay to prevent immediate redirect during transfers
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
};

// Transfer API  
export const transferAPI = {
  send: (transferData) => api.post('/transfers/send', transferData),
  getHistory: () => api.get('/transfers/history'),
};

// Transaction API
export const transactionAPI = {
  getAll: () => api.get('/transactions'),
  getRecent: () => api.get('/transactions/recent'),
};

export default api;
