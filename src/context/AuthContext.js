// frontend/src/context/AuthContext.js - Enhanced with HttpOnly cookie support
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api'; // ADDED: Import for HttpOnly cookie methods

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to safely decode JWT token (keeping existing functionality)
const decodeToken = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      console.log('Invalid token type:', typeof token);
      return null;
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('Invalid token format - not 3 parts');
      return null;
    }
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Helper function to check if token is expired (keeping existing functionality)
const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Date.now() / 1000;
    const isExpired = decoded.exp < currentTime;
    
    if (isExpired) {
      const expiredDate = new Date(decoded.exp * 1000);
      console.log('AuthContext: Token expired at', expiredDate);
    }
    
    return isExpired;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
};

// Safe localStorage operations (keeping existing functionality)
const safeStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Clear expired session (keeping existing functionality)
  const clearSession = () => {
    console.log('AuthContext: Clearing session');
    setCurrentUser(null);
    safeStorage.removeItem('authToken');
    safeStorage.removeItem('user');
  };

  // ENHANCED: Validate session using both localStorage and HttpOnly cookies
  const validateSession = async () => {
    console.log('AuthContext: Validating session');
    
    try {
      // First, try to get user from server using HttpOnly cookies
      try {
        const response = await authAPI.checkAuth();
        const userData = response.data.user;
        
        console.log('AuthContext: Server authentication successful', userData);
        setCurrentUser(userData);
        
        // Update localStorage for backward compatibility
        safeStorage.setItem('user', JSON.stringify(userData));
        setLoading(false);
        return;
        
      } catch (serverError) {
        console.log('AuthContext: Server auth failed, checking localStorage fallback');
      }
      
      // Fallback: Check localStorage for legacy tokens during transition period
      const token = safeStorage.getItem('authToken');
      const userData = safeStorage.getItem('user');
      
      console.log('Token exists:', !!token);
      console.log('User data exists:', !!userData);
      
      if (!token || !userData) {
        console.log('AuthContext: No complete session found');
        clearSession();
        setLoading(false);
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('AuthContext: Token expired, clearing session');
        clearSession();
        setLoading(false);
        return;
      }

      // Parse user data
      let user;
      try {
        user = JSON.parse(userData);
      } catch (parseError) {
        console.error('AuthContext: Error parsing user data:', parseError);
        clearSession();
        setLoading(false);
        return;
      }

      // Validate user data structure
      if (!user || !user.id || !user.email) {
        console.log('AuthContext: Invalid user data structure');
        clearSession();
        setLoading(false);
        return;
      }

      // Session is valid
      console.log('AuthContext: Restored valid user session from localStorage', user);
      setCurrentUser(user);
      
    } catch (error) {
      console.error('AuthContext: Session validation error:', error);
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  // Validate and restore session on app load
  useEffect(() => {
    validateSession();
  }, []);

  // ENHANCED: Login function now works with both localStorage and HttpOnly cookies
  const login = async (userData, token) => {
    try {
      console.log('AuthContext: Logging in user', userData);
      
      // Validate inputs
      if (!userData) {
        console.error('AuthContext: Missing userData');
        return false;
      }

      // For HttpOnly cookies, token might not be provided in response
      if (token) {
        if (typeof token !== 'string') {
          console.error('AuthContext: Token is not a string:', typeof token);
          return false;
        }

        // Validate token format
        if (isTokenExpired(token)) {
          console.error('AuthContext: Attempting to login with expired token');
          return false;
        }

        // Store token in localStorage for backward compatibility
        const tokenStored = safeStorage.setItem('authToken', token);
        if (!tokenStored) {
          console.error('AuthContext: Failed to store token');
          return false;
        }

        // Log token expiry for debugging
        const decoded = decodeToken(token);
        if (decoded && decoded.exp) {
          const expiryDate = new Date(decoded.exp * 1000);
          console.log('AuthContext: Token expires at', expiryDate);
        }
      }

      // Store user data
      const userStored = safeStorage.setItem('user', JSON.stringify(userData));
      if (!userStored) {
        console.error('AuthContext: Failed to store user data');
        return false;
      }

      // Update state
      setCurrentUser(userData);
      
      console.log('AuthContext: Login successful');
      return true;
      
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return false;
    }
  };

  // ENHANCED: Logout function now clears both localStorage and HttpOnly cookies
  const logout = async () => {
    try {
      console.log('AuthContext: Logging out user');
      
      // Try to call server logout to clear HttpOnly cookie
      try {
        await authAPI.logout();
        console.log('AuthContext: Server logout successful');
      } catch (error) {
        console.log('AuthContext: Server logout failed, continuing with local logout:', error);
      }
      
      // Always clear local session
      clearSession();
      
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      // Always clear local session even if server logout fails
      clearSession();
    }
  };

  // Get current token (keeping existing functionality)
  const getToken = () => {
    const token = safeStorage.getItem('authToken');
    if (!token || isTokenExpired(token)) {
      clearSession();
      return null;
    }
    return token;
  };

  // Check if user has specific role (keeping existing functionality)
  const hasRole = (role) => {
    return currentUser?.roles?.includes(role) || false;
  };

  // ENHANCED: Refresh session now uses HttpOnly cookies when available
  const refreshSession = async () => {
    try {
      console.log('AuthContext: Refreshing session...');
      
      // Try to refresh using HttpOnly cookies
      try {
        await authAPI.refreshToken();
        
        // Get updated user data
        const response = await authAPI.checkAuth();
        const userData = response.data.user;
        
        setCurrentUser(userData);
        safeStorage.setItem('user', JSON.stringify(userData));
        
        console.log('AuthContext: Session refresh successful');
        return true;
        
      } catch (error) {
        console.log('AuthContext: HttpOnly cookie refresh failed, checking localStorage token');
        
        // Fallback to localStorage token validation
        const token = getToken();
        if (!token) {
          return false;
        }
        
        // Here you would typically call an API endpoint to refresh the token
        // For now, just validate the current session
        return !!currentUser;
      }
      
    } catch (error) {
      console.error('AuthContext: Session refresh error:', error);
      return false;
    }
  };

  // Get session info for debugging (keeping existing functionality + enhancements)
  const getSessionInfo = () => {
    const token = safeStorage.getItem('authToken');
    const userData = safeStorage.getItem('user');
    
    return {
      hasToken: !!token,
      hasUser: !!userData,
      isExpired: token ? isTokenExpired(token) : true,
      currentUser: currentUser,
      // ADDED: Additional debug info
      cookieAuth: 'HttpOnly cookie support enabled',
      lastValidation: new Date().toISOString()
    };
  };

  // ADDED: Manual auth check method for components that need it
  const checkAuthStatus = async () => {
    try {
      const response = await authAPI.checkAuth();
      const userData = response.data.user;
      
      if (userData) {
        setCurrentUser(userData);
        safeStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      return false;
      
    } catch (error) {
      console.log('AuthContext: Auth check failed:', error);
      return false;
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    loading,
    getToken,
    hasRole,
    refreshSession,
    getSessionInfo,
    checkAuthStatus, // ADDED: New method
    validateSession  // ADDED: Expose for manual validation
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};