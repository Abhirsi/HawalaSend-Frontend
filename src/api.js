// frontend/src/api.js
import axios from 'axios';
import { getToken, setToken, clearToken } from './context/AuthContext';

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
  timeout: 15000, // 15s timeout (slightly longer for mobile)
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-API-Version': '1.0' // For API versioning
  }
});

// 3. Request Interceptor ===================================================
API.interceptors.request.use(config => {
  const token = getToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-CSRF-Protection'] = crypto.randomUUID(); // Stronger CSRF
  }

  // Add request timestamp for debugging
  config.headers['X-Request-Timestamp'] = Date.now();
  
  return config;
}, error => {
  logError('REQUEST_FAILED', error);
  return Promise.reject(normalizeError(error, 'Network request failed'));
});

// 4. Response Interceptor ==================================================
API.interceptors.response.use(
  response => {
    // Log successful requests in development
    if (process.env.NODE_ENV === 'development') {
      console.debug(`API Success [${response.config.method?.toUpperCase()}]`, {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
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
  error => {
    const normalizedError = normalizeError(error, 'API request failed');
    
    // Handle specific status codes
    if (error.response) {
      switch (error.response.status) {
        case 401: // Authentication error
          clearToken();
          window.location.assign('/login?session=expired');
          break;
          
        case 429: // Rate limiting
          retryAfterDelay(error);
          break;
          
        case 503: // Service unavailable
          window.location.assign('/maintenance');
          break;
      }
    }
    
    logError('API_ERROR', normalizedError);
    return Promise.reject(normalizedError);
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
    password: userData.password // Ensure password isn't logged
  })),
  
  logout: async () => {
    try {
      await API.post('/auth/logout');
    } finally {
      clearToken();
      // Clear all temporary storage
      sessionStorage.clear();
      if (window.indexedDB) indexedDB.databases().then(dbs => dbs.forEach(db => indexedDB.deleteDatabase(db.name)));
    }
  },
  
  forgotPassword: createApiHandler('post', '/auth/forgot-password', email => ({
    email: email.trim().toLowerCase()
  })),
  
  verifySession: createApiHandler('get', '/auth/verify-session')
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
    403: 'You don\'t have permission for this action',
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
    // Send to error tracking service (Sentry/LogRocket)
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

// Optional: Add offline detection
let offlineInterceptor = null; // Declare it at the top of the file

// Optional: Add offline detection
window.addEventListener('offline', () => {
  if (offlineInterceptor !== null) {
    API.interceptors.request.eject(offlineInterceptor);
  }

  offlineInterceptor = API.interceptors.request.use(config => {
    throw Object.assign(new Error('Network connection lost'), { code: 'OFFLINE' });
  });

  console.warn('⚠️ Offline mode activated – requests will fail until reconnected.');
});

// Optional: Add online recovery (recommended)
window.addEventListener('online', () => {
  if (offlineInterceptor !== null) {
    API.interceptors.request.eject(offlineInterceptor);
    offlineInterceptor = null;
  }

  console.info('✅ Back online – requests are restored.');
});