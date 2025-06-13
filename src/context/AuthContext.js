// src/context/AuthContext.js

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

// Safe token management using both localStorage and sessionStorage
const safeStorage = {
  getToken: () => {
    try {
      return (
        localStorage.getItem('authToken') ||
        sessionStorage.getItem('authToken')
      );
    } catch (error) {
      console.error('Storage access error:', error);
      return null;
    }
  },

  setToken: (token, remember) => {
    try {
      remember
        ? localStorage.setItem('authToken', token)
        : sessionStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },

  clearToken: () => {
    try {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  },
};

// 🔐 Authentication context definition with default methods
const AuthContext = createContext({
  currentUser: null,
  loading: true,
  isAuthenticated: false,
  login: () => Promise.resolve(),
  register: () => Promise.resolve(),
  logout: () => {},
  updateProfile: () => Promise.resolve(),
});

// 🌍 Context provider wrapping the app
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔁 Check authentication state
  const checkAuthState = useCallback(async () => {
    try {
      const token = safeStorage.getToken();
      if (token) {
        const user = await authAPI.getProfile();
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      safeStorage.clearToken();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthState();

    // 🔄 Optional: Re-check every 5 minutes
    const interval = setInterval(checkAuthState, 300000);
    return () => clearInterval(interval);
  }, [checkAuthState]);

  // 🔓 Login function
  const login = async (credentials, remember = true) => {
    try {
      setLoading(true);
      const { token, user } = await authAPI.login(credentials);
      safeStorage.setToken(token, remember);
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 📝 Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const { token, user } = await authAPI.register(userData);
      safeStorage.setToken(token, true);
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 🚪 Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      safeStorage.clearToken();
      setCurrentUser(null);
      navigate('/login', { replace: true });

      // 🧹 Clear any session data
      if (window.sessionStorage) sessionStorage.clear();
    }
  };

  // 🛠 Update user profile
  const updateProfile = async (userData) => {
    try {
      const updatedUser = await authAPI.updateProfile(userData);
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error(error.message || 'Update failed. Please try again.');
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

// 🔌 Custom hook to access auth context easily
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 🧩 Export AuthContext and storage helpers for other components/modules
export { AuthContext };
export const getToken = safeStorage.getToken;
export const clearToken = safeStorage.clearToken;
