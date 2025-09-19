// frontend/src/api.js - Updated to support HttpOnly cookies while keeping existing functionality
import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://hawalasend-backend-production.up.railway.app'
  : 'https://hawalasend-backend-production.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds timeout for better UX
  withCredentials: true, // ADDED: Include cookies in requests for HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests (keeping existing functionality)
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
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and errors (keeping existing functionality)
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    const { response, config } = error;
    const url = config?.url || '';
    
    console.error(`❌ API Error: ${config?.method?.toUpperCase()} ${url} - ${response?.status}`, response?.data);
    
    if (response?.status === 401) {
      console.log('Unauthorized request - token may be expired');
      
      // Only clear auth and redirect for critical endpoints
      if (url.includes('/auth/') || url.includes('/transfers/') || url.includes('/transactions/')) {
        console.log('Clearing auth due to 401 on critical endpoint');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        // Prevent redirect loops
        if (window.location.pathname !== '/login') {
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
      }
    } else if (response?.status === 429) {
      console.log('Rate limit exceeded - please wait before trying again');
    } else if (response?.status >= 500) {
      console.log('Server error - please try again later');
    }
    
    return Promise.reject(error);
  }
);

// Auth API - Enhanced to support HttpOnly cookies while keeping existing functionality
export const authAPI = {
  login: (email, password) => {
    console.log('🔐 Attempting login for:', email);
    return api.post('/auth/login', { email, password });
  },
  
  register: (userData) => {
    console.log('📝 Attempting registration for:', userData.email);
    return api.post('/auth/register', userData);
  },
  
  logout: () => {
    console.log('🚪 Logging out user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // ADDED: Call backend logout to clear HttpOnly cookie (graceful fallback if it fails)
    return api.post('/auth/logout').catch(error => {
      console.log('Backend logout failed, but continuing with local logout:', error);
      return Promise.resolve();
    });
  },
  
  // ADDED: New methods for HttpOnly cookie support
  checkAuth: () => {
    console.log('🔍 Checking authentication status');
    return api.get('/auth/me');
  },
  
  refreshToken: () => {
    console.log('🔄 Refreshing authentication token');
    return api.post('/auth/refresh');
  }
};

// Transfer API - Keeping all existing functionality
export const transferAPI = {
  send: (transferData) => {
    console.log('💸 Sending transfer:', transferData.amount, 'to', transferData.recipient_email);
    return api.post('/transfers/send', transferData);
  },
  getHistory: () => api.get('/transfers/history'),
  getBalance: () => api.get('/transfers/balance'),
};

// Transaction API - Enhanced to match your backend (keeping all existing functionality)
export const transactionAPI = {
  // Get all transactions with pagination
  getAll: (params = {}) => {
    const { limit = 50, offset = 0 } = params;
    console.log(`📊 Fetching all transactions (limit: ${limit}, offset: ${offset})`);
    return api.get('/transactions', { params: { limit, offset } });
  },
  
  // Get recent transactions for dashboard
  getRecent: (limit = 5) => {
    console.log(`🕐 Fetching ${limit} recent transactions`);
    return api.get('/transactions/recent', { params: { limit } });
  },
  
  // Get transaction statistics
  getStats: () => {
    console.log('📈 Fetching transaction statistics');
    return api.get('/transactions/stats');
  },
  
  // Get single transaction by ID
  getById: (id) => {
    console.log(`🔍 Fetching transaction ${id}`);
    return api.get(`/transactions/${id}`);
  },
  
  // Search transactions
  search: (searchParams = {}) => {
    const { query, status, type, startDate, endDate, limit = 20, offset = 0 } = searchParams;
    console.log('🔎 Searching transactions with params:', searchParams);
    return api.get('/transactions/search', { 
      params: { query, status, type, startDate, endDate, limit, offset } 
    });
  }
};

// User API - Future user profile functionality (keeping all existing functionality)
export const userAPI = {
  getProfile: () => {
    console.log('👤 Fetching user profile');
    return api.get('/user/profile');
  },
  
  updateProfile: (userData) => {
    console.log('✏️ Updating user profile');
    return api.put('/user/profile', userData);
  },
  
  getBalance: () => {
    console.log('💰 Fetching user balance');
    return api.get('/user/balance');
  },
  
  changePassword: (passwordData) => {
    console.log('🔒 Changing user password');
    return api.post('/user/change-password', passwordData);
  }
};

// Health and system checks (keeping all existing functionality)
export const systemAPI = {
  healthCheck: () => {
    console.log('🏥 Performing health check');
    return api.get('/health');
  },
  
  getSystemStats: () => {
    console.log('📊 Fetching system statistics');
    return api.get('/system/stats');
  }
};

// Utility functions - Enhanced with HttpOnly cookie support while keeping existing functionality
export const apiUtils = {
  // Format error messages for user display (keeping existing functionality)
  formatError: (error) => {
    if (error.response?.data?.error) {
      return error.response.data.error;
    } else if (error.response?.data?.message) {
      return error.response.data.message;
    } else if (error.message) {
      return error.message;
    } else {
      return 'An unexpected error occurred';
    }
  },
  
  // Check if user is authenticated (keeping existing functionality)
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },
  
  // ADDED: Async authentication check using HttpOnly cookies
  isAuthenticatedAsync: async () => {
    try {
      await authAPI.checkAuth();
      return true;
    } catch (error) {
      // Fallback to localStorage check
      return apiUtils.isAuthenticated();
    }
  },
  
  // Get current user from localStorage (keeping existing functionality)
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  },
  
  // ADDED: Get current user from server (preferred method with HttpOnly cookies)
  getCurrentUserAsync: async () => {
    try {
      const response = await authAPI.checkAuth();
      return response.data.user;
    } catch (error) {
      // Fallback to localStorage
      return apiUtils.getCurrentUser();
    }
  },
  
  // Format currency for display (keeping existing functionality)
  formatCurrency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },
  
  // Format date for display (keeping existing functionality)
  formatDate: (dateString, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Date(dateString).toLocaleDateString('en-US', { ...defaultOptions, ...options });
  }
};

export default api;