import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app load
useEffect(() => {
  let isMounted = true;


  // In AuthContext.js, update the initializeAuth function
const initializeAuth = async () => {
  try {
    setLoading(true);
    
    // Check if there's a stored token first
    const storedToken = localStorage.getItem('authToken');
    if (!storedToken) {
      console.log('No stored token found - user not logged in');
      setCurrentUser(null);
      return;
    }
    
    // Only call /auth/me if we have a token
    const response = await authAPI.getCurrentUser();
    
    if (isMounted && response.data && response.data.user) {
      setCurrentUser(response.data.user);
      console.log('User authenticated:', response.data.user.email);
    } else if (isMounted) {
      setCurrentUser(null);
      // Clear invalid token
      localStorage.removeItem('authToken');
    }
  } catch (error) {
    if (isMounted) {
      console.log('User not authenticated:', error.response?.status || 'Network error');
      setCurrentUser(null);
      // Clear invalid token on auth failure
      localStorage.removeItem('authToken');
    }
  } finally {
    if (isMounted) {
      setLoading(false);
    }
  }
};

  initializeAuth();
  
  return () => {
    isMounted = false;
  };
}, []); // Critical: empty dependency array

// Remove the separate checkAuthStatus function or make it not auto-call
const checkAuthStatus = async () => {
  try {
    setLoading(true);
    const response = await authAPI.getCurrentUser();
    
    if (response.data && response.data.user) {
      setCurrentUser(response.data.user);
      console.log('User authenticated:', response.data.user.email);
    } else {
      setCurrentUser(null);
    }
  } catch (error) {
    console.log('User not authenticated');
    setCurrentUser(null);
  } finally {
    setLoading(false);
  }
};

// In your login function (AuthContext.js)
const login = async (email, password) => {
  try {
    setLoading(true);
    const response = await authAPI.login(email, password);
    
    if (response.data.token && response.data.user) {
      // Store the token
      localStorage.setItem('authToken', response.data.token);
      setCurrentUser(response.data.user);
      return { success: true, user: response.data.user };
    }
    
    return { success: false, error: 'Login failed - no token received' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.response?.data?.error || 'Login failed' };
  } finally {
    setLoading(false);
  }
};

  const logout = async () => {
    try {
      setLoading(true);
      await authAPI.logout();
      setCurrentUser(null);
      console.log('Logout successful');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on backend, clear local state
      setCurrentUser(null);
      return { success: true }; // Return success anyway to clear UI
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      
      if (response.data && response.data.user) {
        setCurrentUser(response.data.user);
        console.log('Registration successful:', response.data.user.email);
        return { success: true, user: response.data.user };
      }
      
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const refreshAuth = async () => {
    return await checkAuthStatus();
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    register,
    refreshAuth,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};