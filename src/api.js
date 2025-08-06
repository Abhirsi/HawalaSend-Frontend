// frontend/src/api.js
import axios from 'axios';

// Token management functions
const tokenManager = {
  get: () => {
    try {
      return localStorage.getItem('authToken') || 
             sessionStorage.getItem('authToken');
    } catch (error) {
      console.error('Token access error:', error);
      return null;
    }
  },
  set: (token, remember = true) => {
    try {
      remember
        ? localStorage.setItem('authToken', token)
        : sessionStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Token set error:', error);
    }
  },
  clear: () => {
    try {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
    } catch (error) {
      console.error('Token clear error:', error);
    }
  }
};

// Axios instance configuration
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://your-backend.railway.app', // Replace with your Railway backend URL
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-API-Version': '1.0' // Verify this matches your backend's API version
  }
});

// Request interceptor
API.interceptors.request.use(config => {
  const token = tokenManager.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
API.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'https://your-backend.railway.app'}/auth/refresh-token`, // Update URL
          {},
          { withCredentials: true }
        );
        
        if (response.data?.token) {
          tokenManager.set(response.data.token);
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        tokenManager.clear();
        window.location.href = '/login'; // Ensure /login route exists in your frontend
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication API endpoints
const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  logout: () => API.post('/auth/logout').finally(() => tokenManager.clear()),
  refreshToken: () => API.post('/auth/refresh-token'),
  verifySession: () => API.get('/auth/verify-session')
};

// User API endpoints (added to fix the missing userAPI export)
const userAPI = {
  getUser: (id) => API.get(`/users/${id}`), // Adjust endpoint to match your backend
  updateUser: (id, userData) => API.put(`/users/${id}`, userData), // Adjust endpoint
  deleteUser: (id) => API.delete(`/users/${id}`) // Adjust endpoint
};

export default API;
export { authAPI, userAPI }; // Export both authAPI and userAPI
