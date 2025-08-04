// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

// Safe token management
const safeStorage = {
  getToken: () => {
    try {
      return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    } catch (error) {
      console.error('Storage access error:', error);
      return null;
    }
  },

  setToken: (token, remember = true) => {
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
  }
};

const AuthContext = createContext({
  currentUser: null,
  loading: true,
  isAuthenticated: false,
  login: () => Promise.resolve(),
  register: () => Promise.resolve(),
  logout: () => {},
  updateProfile: () => Promise.resolve()
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuthState = useCallback(async () => {
    try {
      setLoading(true);
      const token = safeStorage.getToken();
      if (token) {
        const user = await authAPI.verifySession();
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
      const { token, user } = await authAPI.login(credentials);
      safeStorage.setToken(token, remember);
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
      const { token, user } = await authAPI.register(userData);
      safeStorage.setToken(token, true);
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
    } finally {
      safeStorage.clearToken();
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
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
export const getToken = safeStorage.getToken;
export const clearToken = safeStorage.clearToken;
export const setToken = safeStorage.setToken;
