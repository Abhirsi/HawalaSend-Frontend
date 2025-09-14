import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
  const [tokenExpiry, setTokenExpiry] = useState(null);

  // Safe storage helper with enhanced error handling
  const safeStorage = {
    getItem: (key) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return localStorage.getItem(key);
        }
        return null;
      } catch (error) {
        console.error(`Error reading ${key} from localStorage:`, error);
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(key, value);
          return true;
        }
        return false;
      } catch (error) {
        console.error(`Error writing ${key} to localStorage:`, error);
        return false;
      }
    },
    removeItem: (key) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem(key);
          return true;
        }
        return false;
      } catch (error) {
        console.error(`Error removing ${key} from localStorage:`, error);
        return false;
      }
    }
  };

  // Decode JWT token to get expiry
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Check if token is expired
  const isTokenExpired = useCallback((token) => {
    if (!token) return true;
    
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = decoded.exp < currentTime;
    
    if (isExpired) {
      console.log('AuthContext: Token expired at', new Date(decoded.exp * 1000));
    }
    
    return isExpired;
  }, []);

  // Clear expired session
  const clearExpiredSession = useCallback(() => {
    console.log('AuthContext: Clearing expired session');
    safeStorage.removeItem('authToken');
    safeStorage.removeItem('user');
    setCurrentUser(null);
    setTokenExpiry(null);
  }, []);

  // Validate and restore session
  const validateSession = useCallback(async () => {
    console.log('AuthContext: Validating session');
    
    const token = safeStorage.getItem('authToken');
    const userData = safeStorage.getItem('user');
    
    console.log('Token exists:', !!token);
    console.log('User data exists:', !!userData);
    
    if (!token || !userData) {
      console.log('AuthContext: No complete session found');
      setLoading(false);
      return;
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      console.log('AuthContext: Token expired, clearing session');
      clearExpiredSession();
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      const decoded = decodeToken(token);
      
      // Set token expiry for monitoring
      if (decoded && decoded.exp) {
        setTokenExpiry(decoded.exp * 1000);
      }
      
      console.log('AuthContext: Restored valid user session', parsedUser);
      setCurrentUser(parsedUser);
    } catch (error) {
      console.error('AuthContext: Error parsing user data', error);
      clearExpiredSession();
    } finally {
      setLoading(false);
    }
  }, [isTokenExpired, clearExpiredSession]);

  // Check for existing session on mount
  useEffect(() => {
    validateSession();
  }, [validateSession]);

  // Token expiry monitor
  useEffect(() => {
    if (!tokenExpiry) return;

    const checkTokenExpiry = () => {
      const now = Date.now();
      const timeUntilExpiry = tokenExpiry - now;
      
      // If token expires in less than 5 minutes, warn user
      if (timeUntilExpiry > 0 && timeUntilExpiry < 5 * 60 * 1000) {
        console.warn('AuthContext: Token expires soon');
        // You could show a renewal dialog here
      }
      
      // If token is expired, clear session
      if (timeUntilExpiry <= 0) {
        console.log('AuthContext: Token expired, logging out');
        logout();
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60 * 1000);
    
    // Check immediately
    checkTokenExpiry();

    return () => clearInterval(interval);
  }, [tokenExpiry]);

  // Login function with enhanced validation
  const login = useCallback((userData, token) => {
    console.log('AuthContext: Logging in user', userData);
    
    if (!userData || !token) {
      console.error('AuthContext: Invalid login data provided');
      return false;
    }

    // Validate token before storing
    if (isTokenExpired(token)) {
      console.error('AuthContext: Attempting to login with expired token');
      return false;
    }

    // Store both token and user data
    const tokenStored = safeStorage.setItem('authToken', token);
    const userStored = safeStorage.setItem('user', JSON.stringify(userData));

    if (!tokenStored || !userStored) {
      console.error('AuthContext: Failed to store auth data');
      return false;
    }

    // Decode token to get expiry
    const decoded = decodeToken(token);
    if (decoded && decoded.exp) {
      setTokenExpiry(decoded.exp * 1000);
      console.log('AuthContext: Token expires at', new Date(decoded.exp * 1000));
    }

    setCurrentUser(userData);
    console.log('AuthContext: Login successful');
    return true;
  }, [isTokenExpired]);

  // Logout function with cleanup
  const logout = useCallback(() => {
    console.log('AuthContext: Logging out user');
    
    // Clear all auth data
    safeStorage.removeItem('authToken');
    safeStorage.removeItem('user');
    
    // Reset state
    setCurrentUser(null);
    setTokenExpiry(null);
    
    // Optional: Redirect to login page
    // Note: Only redirect if we're not already on login page
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
  }, []);

  // Update user data
  const updateUser = useCallback((updatedUserData) => {
    console.log('AuthContext: Updating user data', updatedUserData);
    
    if (!currentUser) {
      console.error('AuthContext: Cannot update user - no current user');
      return false;
    }
    
    try {
      // Merge with existing user data
      const newUserData = { ...currentUser, ...updatedUserData };
      
      // Store updated data
      const stored = safeStorage.setItem('user', JSON.stringify(newUserData));
      
      if (stored) {
        setCurrentUser(newUserData);
        console.log('AuthContext: User data updated successfully');
        return true;
      } else {
        console.error('AuthContext: Failed to store updated user data');
        return false;
      }
    } catch (error) {
      console.error('AuthContext: Error updating user data', error);
      return false;
    }
  }, [currentUser]);

  // Refresh session (useful for API calls that return updated user data)
  const refreshSession = useCallback(() => {
    console.log('AuthContext: Refreshing session');
    return validateSession();
  }, [validateSession]);

  // Check if user has specific role or permission (extensible)
  const hasRole = useCallback((role) => {
    if (!currentUser) return false;
    return currentUser.role === role || currentUser.roles?.includes(role);
  }, [currentUser]);

  // Get token for API calls
  const getToken = useCallback(() => {
    const token = safeStorage.getItem('authToken');
    if (!token || isTokenExpired(token)) {
      console.warn('AuthContext: No valid token available');
      return null;
    }
    return token;
  }, [isTokenExpired]);

  // Enhanced authentication status
  const isAuthenticated = !!(currentUser && getToken());

  // Session info for debugging
  const getSessionInfo = useCallback(() => {
    const token = safeStorage.getItem('authToken');
    const decoded = token ? decodeToken(token) : null;
    
    return {
      isAuthenticated,
      currentUser,
      tokenExpiry: tokenExpiry ? new Date(tokenExpiry) : null,
      tokenValid: token ? !isTokenExpired(token) : false,
      decodedToken: decoded
    };
  }, [isAuthenticated, currentUser, tokenExpiry, isTokenExpired]);

  const value = {
    // State
    currentUser,
    loading,
    isAuthenticated,
    
    // Actions
    login,
    logout,
    updateUser,
    refreshSession,
    
    // Utilities
    hasRole,
    getToken,
    getSessionInfo,
    
    // Legacy support (if other components depend on these)
    setCurrentUser: updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;