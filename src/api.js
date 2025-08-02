// frontend/src/api.js
import axios from 'axios';
import { getToken, clearToken } from './context/AuthContext';

// 1. Environment Configuration ==============================================
const getApiBaseUrl = () => {
  const url = process.env.REACT_APP_API_URL;
  
  if (!url?.startsWith('http')) {
    if (process.env.NODE_ENV === 'production') {
      console.error('Missing production API URL');
      throw new Error('API configuration error');
    }
    console.warn('Using default development API URL');
    return 'https://money-transfer-backend.onrender.com';
  }
  
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

// 2. Axios Instance Configuration ==========================================
const API = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000, // 15s timeout
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-API-Version': '1.0'
  }
});

// 3. Request Interceptor ===================================================
API.interceptors.request.use(config => {
  const token = getToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-CSRF-Protection'] = crypto.randomUUID();
  }

  config.headers['X-Request-Timestamp'] = Date.now();
  
  return config;
}, error => {
  logError('REQUEST_FAILED', error);
  return Promise.reject(normalizeError(error, 'Network request failed'));
});

// 4. Enhanced Response Interceptor =========================================
API.interceptors.response.use(
  response => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`API Success [${response.config.method?.toUpperCase()}]`, {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
    }
    
    // Store new token if returned in response
    if (response.data?.token) {
      authAPI.setToken(response.data.token);
    }
    
    return {
      ...response.data,
      _metadata: {
        status: response.status,
        headers: response.headers,
        timestamp: Date.now()
      }
    };
  },
  async error => {
    const originalRequest = error.config;
    const normalizedError = normalizeError(error, 'API request failed');
    
    // Handle token refresh on 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshResponse = await axios.post(
          `${getApiBaseUrl()}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        
        if (refreshResponse.data?.token) {
          setToken(refreshResponse.data.token);
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        clearToken();
        window.location.assign('/login?session=expired');
        return Promise.reject(normalizeError(refreshError, 'Session refresh failed'));
      }
    }
    
    // Handle other error cases
    if (error.response) {
      switch (error.response.status) {
        case 429: // Rate limiting
          return retryAfterDelay(error);
        case 503: // Service unavailable
          window.location.assign('/maintenance');
          break;
      }
    }
    
    logError('API_ERROR', normalizedError);
    return Promise.reject(enhanceApiError(normalizedError));
  }
);

// 5. Core API Methods ======================================================
const createApiHandler = (method, endpoint, dataTransformer) => async (payload) => {
  try {
    const response = await API[method](endpoint, dataTransformer?.(payload) ?? payload);
    return response;
  } catch (error) {
    throw enhanceApiError(error);
  }
};

export const authAPI = {
  login: createApiHandler('post', '/auth/login', credentials => ({
    email: credentials.email.trim().toLowerCase(),
    password: credentials.password
  })),
  
  register: createApiHandler('post', '/auth/register', userData => ({
    ...userData,
    email: userData.email.trim().toLowerCase(),
    password: userData.password
  })),
  
  logout: async () => {
    try {
      await API.post('/auth/logout');
    } finally {
      clearToken();
      sessionStorage.clear();
    }
  },
  
  forgotPassword: createApiHandler('post', '/auth/forgot-password', email => ({
    email: email.trim().toLowerCase()
  })),
  
  verifySession: createApiHandler('get', '/auth/verify-session'),
  
  // NEW: Add refresh token endpoint
  refreshToken: () => API.post('/auth/refresh-token', {}, { withCredentials: true })
};

export const userAPI = {
  getProfile: createApiHandler('get', '/me'),
  updateProfile: createApiHandler('patch', '/me'),
  deleteAccount: createApiHandler('delete', '/me')
};

// 6. Error Utilities =======================================================
function normalizeError(error, defaultMessage) {
  const errorData = error.response?.data || {};
  
  return {
    code: error.response?.status || 'NETWORK_ERROR',
    message: errorData.message || defaultMessage || error.message,
    details: errorData.errors || null,
    timestamp: new Date().toISOString(),
    requestId: error.response?.headers['x-request-id'],
    _debug: process.env.NODE_ENV === 'development' ? {
      config: error.config,
      stack: error.stack
    } : undefined
  };
}

function enhanceApiError(error) {
  const errorMessages = {
    400: 'Invalid request data',
    401: 'Session expired. Please login again.',
    403: 'You do not have permission for this action',
    404: 'Resource not found',
    429: 'Too many requests. Please wait before trying again.',
    500: 'Server error. Please try again later.'
  };
  
  return {
    ...error,
    userMessage: errorMessages[error.code] || 'An unexpected error occurred',
    isRetryable: ![401, 403, 404].includes(error.code)
  };
}

function logError(type, error) {
  const errorPayload = {
    type,
    message: error.message,
    code: error.code,
    timestamp: error.timestamp
  };
  
  if (process.env.NODE_ENV === 'production') {
    window.trackError?.(errorPayload);
  } else {
    console.groupCollapsed(`%c${type}`, 'color: #ff4444; font-weight: bold;');
    console.error('Error:', errorPayload);
    console.error('Details:', error.details);
    if (error._debug) console.debug('Debug:', error._debug);
    console.groupEnd();
  }
}

// 7. Retry Logic ==========================================================
const retryAfterDelay = (error) => {
  const retryAfter = error.response?.headers['retry-after'] || 5;
  console.warn(`Rate limited. Retrying after ${retryAfter} seconds...`);
  
  return new Promise(resolve => {
    setTimeout(() => resolve(API(error.config)), retryAfter * 1000);
  });
};

// Export the configured axios instance as default
export default API;
