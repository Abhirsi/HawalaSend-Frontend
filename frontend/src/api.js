// frontend/src/api.js - Production-ready API with proper cookie-based auth
import axios from 'axios';

const API_BASE_URL = 
process.env.REACT_APP_API_URL ||
(process.env.NODE_ENV === 'development'
    ? 'http://localhost:5001'
    : 'https://hawalasend-backend.up.railway.app');
  const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // Essential for HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register', 
  '/auth/forgot-password',
  '/auth/reset-password',
  '/health',
  '/setup-database',
  '/test-db'
];

// Check if route is public
const isPublicRoute = (url) => {
  return PUBLIC_ROUTES.some(route => url.includes(route));
};

// Request interceptor - NO TOKEN HANDLING (cookies only)
api.interceptors.request.use(
  (config) => {
    const method = config.method?.toUpperCase() || 'GET';
    const isPublic = isPublicRoute(config.url);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📡 ${method} ${config.url} ${isPublic ? '(public)' : '(protected)'}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toUpperCase() || 'GET';
    const status = response.status;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${method} ${response.config.url} - ${status}`);
    }
    
    return response;
  },
  (error) => {
    const { response, config } = error;
    const method = config?.method?.toUpperCase() || 'GET';
    const url = config?.url || 'unknown';
    const status = response?.status || 'network';
    
    console.error(`❌ ${method} ${url} - ${status}`, response?.data);
    
    // Handle different error types
    if (response?.status === 401) {
      // Only redirect on protected routes, not public ones
      if (!isPublicRoute(url) && window.location.pathname !== '/login') {
        console.log('Authentication required - redirecting to login');
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    } else if (response?.status === 429) {
      console.log('Rate limit exceeded');
    } else if (response?.status >= 500) {
      console.log('Server error - please try again later');
    } else if (!response) {
      console.log('Network error - check connection');
    }
    
    return Promise.reject(error);
  }
);

// Auth API - Cookie-based authentication only
export const authAPI = {
  login: async (email, password) => {
    console.log('🔐 Attempting login for:', email);
    
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // ✅ DEBUG: Show what backend returned
      console.log('📦 Login response received:', {
        status: response.status,
        statusText: response.statusText,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        user: response.data?.user,
        token: response.data?.token ? '✅ Token present' : '❌ No token',
        cookies: document.cookie || 'No cookies found'
      });
      
      // Check if token exists in response
      if (response.data?.token) {
        console.log('🔑 Token received (first 30 chars):', response.data.token.substring(0, 30) + '...');
        console.log('⚠️ Note: You are using cookie-based auth, token in response may be for reference only');
      }
      
      // Check cookies after login
      console.log('🍪 Cookies after login:', document.cookie);
      
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      throw error;
    }
  },
     
  register: async (userData) => {
    console.log('📝 Attempting registration for:', userData.email);
    
    try {
      const response = await api.post('/auth/register', userData);
      
      console.log('📦 Registration response:', {
        status: response.status,
        user: response.data?.user,
        message: response.data?.message
      });
      
      return response;
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data || error.message);
      throw error;
    }
  },
     
  logout: async () => {
    console.log('🚪 Logging out user');
    console.log('🍪 Cookies before logout:', document.cookie);
    
    try {
      const response = await api.post('/auth/logout');
      
      console.log('✅ Logout successful');
      console.log('🍪 Cookies after logout:', document.cookie);
      
      return response;
    } catch (error) {
      console.error('❌ Logout failed:', error.response?.data || error.message);
      throw error;
    }
  },
        
  getCurrentUser: async () => {
    console.log('👤 Getting current user');
    console.log('🍪 Cookies before request:', document.cookie);
    
    try {
      const response = await api.get('/auth/me');
      
      console.log('📦 Current user response:', {
        status: response.status,
        user: response.data?.user || response.data
      });
      
      return response;
    } catch (error) {
      console.error('❌ Get current user failed:', error.response?.status, error.response?.data);
      throw error;
    }
  },
     
  refreshToken: async () => {
    console.log('🔄 Refreshing token');
    
    try {
      const response = await api.post('/auth/refresh');
      
      console.log('✅ Token refreshed');
      console.log('🍪 Cookies after refresh:', document.cookie);
      
      return response;
    } catch (error) {
      console.error('❌ Token refresh failed:', error.response?.data || error.message);
      throw error;
    }
  },
     
  forgotPassword: async (email) => {
    console.log('📧 Requesting password reset for:', email);
    
    try {
      const response = await api.post('/auth/forgot-password', { email });
      timeout: 30000 // 30 seconds timeout
      
      console.log('✅ Password reset email sent');
      
      return response;
    } catch (error) {
      console.error('❌ Forgot password failed:', error.response?.data || error.message);
      throw error;
    }
  },

  
   
  resetPassword: async (token, newPassword) => {
    console.log('🔒 Resetting password with token');
    
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      
      console.log('✅ Password reset successful');
      
      return response;
    } catch (error) {
      console.error('❌ Password reset failed:', error.response?.data || error.message);
      throw error;
    }
  }
}; 

// Add these functions
export const verifyEmail = async (token) => {
  try {
    console.log('📧 Verifying email');
    const response = await api.post('/auth/verify-email', { token });
    console.log('✅ Email verified');
    return response;
  } catch (error) {
    console.error('❌ Email verification failed:', error.message);
    throw error;
  }
};

export const resendVerification = async () => {
  try {
    console.log('📧 Resending verification email');
    const response = await api.post('/auth/resend-verification');
    console.log('✅ Verification email resent');
    return response;
  } catch (error) {
    console.error('❌ Resend verification failed:', error.message);
    throw error;
  }
};


// Transaction/Transfer API
export const transactionAPI = {
  getHistory: async () => {
    console.log('📜 Getting transfer history');
    
    try {
      const response = await api.get('/transfers/history');
      
      console.log('📦 Transaction history response:', {
        status: response.status,
        count: response.data?.length || 0,
        transactions: response.data
      });
      
      return response;
    } catch (error) {
      console.error('❌ Get history failed:', error.response?.data || error.message);
      throw error;
    }
  },
  
  send: async (transferData) => {
    console.log('💸 Sending transfer:', {
      to: transferData.recipientEmail,
      amount: transferData.amount
    });
    
    try {
      const response = await api.post('/transfers/send', transferData);
      
      console.log('✅ Transfer sent successfully:', response.data);
      
      return response;
    } catch (error) {
      console.error('❌ Transfer failed:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getById: async (id) => {
    console.log('🔍 Getting transaction:', id);
    
    try {
      const response = await api.get(`/transfers/${id}`);
      
      console.log('📦 Transaction details:', response.data);
      
      return response;
    } catch (error) {
      console.error('❌ Get transaction failed:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Alias for backwards compatibility
export const transferAPI = transactionAPI;

// User API
export const userAPI = {
  getProfile: () => {
    console.log('👤 Fetching user profile');
    return api.get('/user/profile');
  },
  
  updateProfile: (userData) => {
    console.log('✏️ Updating user profile');
    return api.put('/user/profile', userData);
  },
  
  changePassword: (currentPassword, newPassword) => {
    console.log('🔒 Changing password');
    return api.post('/user/change-password', { currentPassword, newPassword });
  },
  
  getSettings: () => {
    console.log('⚙️ Fetching user settings');
    return api.get('/user/settings');
  },
  
  updateSettings: (settings) => {
    console.log('⚙️ Updating user settings');
    return api.put('/user/settings', settings);
  }
};

// System API
export const systemAPI = {
  healthCheck: () => {
    return api.get('/health');
  },
  
  getDatabaseInfo: () => {
    return api.get('/test-db');
  },
  
  setupDatabase: () => {
    return api.get('/setup-database');
  }
};

// Utility functions
export const apiUtils = {
  // Format error messages for user display
  formatError: (error) => {
    if (error.response?.data?.error) {
      return error.response.data.error;
    } else if (error.response?.data?.message) {
      return error.response.data.message;
    } else if (error.response?.status === 429) {
      return 'Too many requests. Please wait a moment and try again.';
    } else if (error.response?.status === 401) {
      return 'Authentication required. Please log in again.';
    } else if (error.response?.status === 403) {
      return 'You don\'t have permission to perform this action.';
    } else if (error.response?.status === 404) {
      return 'The requested resource was not found.';
    } else if (error.response?.status >= 500) {
      return 'Server error. Please try again later.';
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      return 'Network error. Please check your connection.';
    } else if (error.message) {
      return error.message;
    } else {
      return 'An unexpected error occurred. Please try again.';
    }
  },
  
  // Format currency for display
  formatCurrency: (amount, currency = 'CAD') => {
    if (typeof amount !== 'number') {
      amount = parseFloat(amount) || 0;
    }
    
    const currencyMap = {
      CAD: 'en-CA',
      KES: 'sw-KE',
      USD: 'en-US'
    };
    
    const locale = currencyMap[currency] || 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  },
  
  // Format date for display
  formatDate: (dateString, options = {}) => {
    if (!dateString) return 'N/A';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', { ...defaultOptions, ...options });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  },
  
  // Format date for relative display (e.g., "2 hours ago")
  formatRelativeDate: (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
      
      return apiUtils.formatDate(dateString, { hour: undefined, minute: undefined });
    } catch (error) {
      console.error('Relative date formatting error:', error);
      return 'Invalid date';
    }
  },
  
  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // Validate phone number (basic)
  isValidPhone: (phone) => {
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  },
  
  // Generate transaction reference
  generateTransactionRef: () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `HWS-${timestamp}-${random}`.toUpperCase();
  },
  
  // Debounce function for search inputs
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

export default api;