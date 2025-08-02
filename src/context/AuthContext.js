import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import api from '../api'; // Make sure this is your axios instance

// Enhanced token management with expiration
const safeStorage = {
  getToken: () => {
    try {
      // Check token expiration
      const tokenExpiry = localStorage.getItem('tokenExpiry') || 
                         sessionStorage.getItem('tokenExpiry');
      if (tokenExpiry && new Date(tokenExpiry) < new Date()) {
        this.clearToken();
        return null;
      }
      
      return localStorage.getItem('authToken') || 
             sessionStorage.getItem('authToken');
    } catch (error) {
      console.error('Storage access error:', error);
      return null;
    }
  },

  setToken: (token, remember, expiresIn = 3600) => {
    try {
      const expiry = new Date(new Date().getTime() + expiresIn * 1000);
      if (remember) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('tokenExpiry', expiry.toISOString());
      } else {
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('tokenExpiry', expiry.toISOString());
      }
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },

  clearToken: () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenExpiry');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('tokenExpiry');
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  },
};

const AuthContext = createContext({
  currentUser: null,
  loading: true,
  isAuthenticated: false,
  login: () => Promise.resolve(),
  register: () => Promise.resolve(),
  logout: () => {},
  updateProfile: () => Promise.resolve(),
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Add axios response interceptor for token refresh
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        
        // If 401 error and we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Attempt to refresh token
            const { token } = await authAPI.refreshToken();
            safeStorage.setToken(token, true);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          } catch (refreshError) {
            // If refresh fails, logout user
            safeStorage.clearToken();
            setCurrentUser(null);
            navigate('/login');
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  const checkAuthState = useCallback(async () => {
    try {
      setLoading(true);
      const token = safeStorage.getToken();
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const user = await authAPI.getProfile();
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      safeStorage.clearToken();
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  const login = async (credentials, remember = true) => {
    try {
      setLoading(true);
      const { token, user, expiresIn } = await authAPI.login(credentials);
      safeStorage.setToken(token, remember, expiresIn);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const { token, user, expiresIn } = await authAPI.register(userData);
      safeStorage.setToken(token, true, expiresIn);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      safeStorage.clearToken();
      delete api.defaults.headers.common['Authorization'];
      setCurrentUser(null);
      navigate('/login');
    }
  };

  const updateProfile = async (userData) => {
    try {
      const updatedUser = await authAPI.updateProfile(userData);
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// src/context/AuthContext.js

// ... existing code ...

// Update your exports at the bottom to include all needed methods
export { 
  AuthContext, 
  AuthProvider, 
  useAuth,
  getToken: safeStorage.getToken,
  clearToken: safeStorage.clearToken,
  setToken: safeStorage.setToken // Add this if missing
};
