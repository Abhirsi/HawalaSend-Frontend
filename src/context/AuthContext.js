// frontend/src/context/AuthContext.js - Fixed version
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to safely decode JWT token
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

// Helper function to check if token is expired
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

// Safe localStorage operations
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

  // Clear expired session
  const clearSession = () => {
    console.log('AuthContext: Clearing session');
    setCurrentUser(null);
    safeStorage.removeItem('authToken');
    safeStorage.removeItem('user');
  };

  // Validate and restore session on app load
  useEffect(() => {
    const validateSession = () => {
      console.log('AuthContext: Validating session');
      
      try {
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
        console.log('AuthContext: Restored valid user session', user);
        setCurrentUser(user);
        
      } catch (error) {
        console.error('AuthContext: Session validation error:', error);
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  // Login function
  const login = async (userData, token) => {
    try {
      console.log('AuthContext: Logging in user', userData);
      
      // Validate inputs
      if (!userData || !token) {
        console.error('AuthContext: Missing userData or token');
        return false;
      }

      if (typeof token !== 'string') {
        console.error('AuthContext: Token is not a string:', typeof token);
        return false;
      }

      // Validate token format
      if (isTokenExpired(token)) {
        console.error('AuthContext: Attempting to login with expired token');
        return false;
      }

      // Store in localStorage
      const tokenStored = safeStorage.setItem('authToken', token);
      const userStored = safeStorage.setItem('user', JSON.stringify(userData));
      
      if (!tokenStored || !userStored) {
        console.error('AuthContext: Failed to store session data');
        return false;
      }

      // Update state
      setCurrentUser(userData);
      
      // Log token expiry for debugging
      const decoded = decodeToken(token);
      if (decoded && decoded.exp) {
        const expiryDate = new Date(decoded.exp * 1000);
        console.log('AuthContext: Token expires at', expiryDate);
      }
      
      console.log('AuthContext: Login successful');
      return true;
      
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    console.log('AuthContext: Logging out user');
    clearSession();
  };

  // Get current token
  const getToken = () => {
    const token = safeStorage.getItem('authToken');
    if (!token || isTokenExpired(token)) {
      clearSession();
      return null;
    }
    return token;
  };

  // Check if user has specific role (for future use)
  const hasRole = (role) => {
    return currentUser?.roles?.includes(role) || false;
  };

  // Refresh session (for future use)
  const refreshSession = async () => {
    const token = getToken();
    if (!token) {
      return false;
    }
    
    // Here you would typically call an API endpoint to refresh the token
    // For now, just validate the current session
    return !!currentUser;
  };

  // Get session info for debugging
  const getSessionInfo = () => {
    const token = safeStorage.getItem('authToken');
    const userData = safeStorage.getItem('user');
    
    return {
      hasToken: !!token,
      hasUser: !!userData,
      isExpired: token ? isTokenExpired(token) : true,
      currentUser: currentUser
    };
  };

  const value = {
    currentUser,
    login,
    logout,
    loading,
    getToken,
    hasRole,
    refreshSession,
    getSessionInfo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};