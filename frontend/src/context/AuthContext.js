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

  // Check authentication status on mount
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        if (window.location.pathname === '/reset-password') {
          setLoading(false);
          return;
        }

      setLoading(true);
        
        // With httpOnly cookies, just check if the cookie is valid by calling /auth/me
        const response = await authAPI.getCurrentUser();
        
        if (isMounted && response.data?.user) {
          setCurrentUser(response.data.user);
          console.log('User authenticated:', response.data.user.email);
        } else if (isMounted) {
          setCurrentUser(null);
        }
      } catch (error) {
        if (isMounted) {
          // 401 means not authenticated, which is fine on initial load
          if (error.response?.status !== 401) {
            console.error('Auth check error:', error.response?.status || 'Network error');
          }
          setCurrentUser(null);
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
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      
      // Token is in httpOnly cookie, only user data in response
      if (response.data?.user) {
        setCurrentUser(response.data.user);
        console.log('Login successful:', response.data.user.email);
        return { success: true, user: response.data.user };
      }
      
      return { success: false, error: 'Login failed - no user data received' };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      return { success: false, error: errorMessage };
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
      // Clear local state even if backend fails
      setCurrentUser(null);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      
      // Token is in httpOnly cookie, only user data in response
      if (response.data?.user) {
        setCurrentUser(response.data.user);
        console.log('Registration successful:', response.data.user.email);
        return { success: true, user: response.data.user };
      }
      
      return { success: false, error: 'Registration failed - no user data received' };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const refreshAuth = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getCurrentUser();
      
      if (response.data?.user) {
        setCurrentUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        setCurrentUser(null);
        return { success: false };
      }
    } catch (error) {
      console.error('Refresh auth error:', error);
      setCurrentUser(null);
      return { success: false };
    } finally {
      setLoading(false);
    }
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