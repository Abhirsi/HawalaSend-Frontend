// frontend/src/context/AuthContext.js - Fixed routing error and enhanced with HttpOnly cookie support
import React, { createContext, useContext, useState, useEffect } from 'react';

/*
CRITICAL FIX: Removed authAPI import to prevent circular dependency and router conflicts
The original error was caused by authAPI containing navigation logic while being imported into AuthContext
AuthContext should be pure and not depend on components that use routing hooks
*/

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/*
JWT TOKEN MANAGEMENT
===================
Helper functions for JWT token operations - kept for backward compatibility
These handle token decoding and expiration checking without external dependencies
*/

// Helper function to safely decode JWT token (keeping existing functionality)
const decodeToken = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      console.log('AuthContext: Invalid token type:', typeof token);
      return null;
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('AuthContext: Invalid token format - not 3 parts');
      return null;
    }
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('AuthContext: Error decoding token:', error);
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
    console.error('AuthContext: Error checking token expiry:', error);
    return true;
  }
};

/*
SAFE STORAGE OPERATIONS
=======================
Wrapper functions for localStorage operations with error handling
Prevents crashes when localStorage is unavailable (e.g., private browsing)
*/

const safeStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('AuthContext: Error reading from localStorage:', error);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('AuthContext: Error writing to localStorage:', error);
      return false;
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('AuthContext: Error removing from localStorage:', error);
      return false;
    }
  }
};

/*
AUTH PROVIDER COMPONENT
=======================
Main authentication context provider with state management
Handles user session, login/logout, and token validation
*/

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
  SESSION MANAGEMENT
  ==================
  Core functions for managing user sessions and authentication state
  */

  // Clear expired session (keeping existing functionality)
  const clearSession = () => {
    console.log('AuthContext: Clearing session');
    setCurrentUser(null);
    safeStorage.removeItem('authToken');
    safeStorage.removeItem('user');
  };

  // FIXED: Simplified session validation without external API dependencies
  const validateSession = () => {
    console.log('AuthContext: Validating session');
    
    try {
      // Check localStorage for existing session
      const token = safeStorage.getItem('authToken');
      const userData = safeStorage.getItem('user');
      
      console.log('AuthContext: Token exists:', !!token);
      console.log('AuthContext: User data exists:', !!userData);
      
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

  /*
  AUTHENTICATION METHODS
  ======================
  Login, logout, and session management functions
  These are called by components and handle state updates
  */

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

  // SIMPLIFIED: Logout function without external API calls (prevents router conflicts)
  const logout = () => {
    try {
      console.log('AuthContext: Logging out user');
      
      // Clear local session immediately
      clearSession();
      
      /*
      NOTE: HttpOnly cookie clearing should be handled by the component calling logout()
      This prevents circular dependencies between AuthContext and API modules
      Example in component:
      
      const handleLogout = async () => {
        logout(); // Clear local state
        try {
          await authAPI.logout(); // Clear server-side cookie
        } catch (error) {
          console.log('Server logout failed, but local logout succeeded');
        }
        navigate('/login');
      };
      */
      
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      // Always clear local session even if other operations fail
      clearSession();
    }
  };

  /*
  UTILITY FUNCTIONS
  =================
  Helper functions for token management and user information
  */

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

  // SIMPLIFIED: Basic session refresh without external dependencies
  const refreshSession = () => {
    try {
      console.log('AuthContext: Refreshing session...');
      
      // Basic validation of current session
      const token = getToken();
      if (!token || !currentUser) {
        console.log('AuthContext: No valid session to refresh');
        clearSession();
        return false;
      }
      
      console.log('AuthContext: Session refresh successful (local validation)');
      return true;
      
    } catch (error) {
      console.error('AuthContext: Session refresh error:', error);
      clearSession();
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
      cookieAuth: 'HttpOnly cookie support enabled (external API calls)',
      lastValidation: new Date().toISOString(),
      version: 'Fixed routing conflicts v1.1'
    };
  };

  /*
  CONTEXT VALUE
  =============
  Object containing all authentication state and methods
  Available to components via useAuth() hook
  */

  const value = {
    // State
    currentUser,        // Current authenticated user object (null if not logged in)
    loading,           // Boolean indicating if auth check is in progress
    
    // Core Methods
    login,             // Function to log in user: login(userData, token?)
    logout,            // Function to log out user: logout()
    
    // Utility Methods
    getToken,          // Function to get current valid token
    hasRole,           // Function to check user roles: hasRole('admin')
    refreshSession,    // Function to validate current session
    getSessionInfo,    // Function to get debug information about session
    validateSession    // Function to manually trigger session validation
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/*
USAGE EXAMPLES FOR COMPONENTS
=============================

1. LOGIN COMPONENT:
const handleLogin = async (email, password) => {
  try {
    const response = await authAPI.login(email, password);
    const success = await login(response.data.user, response.data.token);
    if (success) {
      navigate('/dashboard');
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};

2. LOGOUT COMPONENT:
const handleLogout = async () => {
  logout(); // Clear local state immediately
  try {
    await authAPI.logout(); // Clear server cookie
  } catch (error) {
    console.log('Server logout failed, but continuing...');
  }
  navigate('/login');
};

3. PROTECTED ROUTE:
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return currentUser ? children : <Navigate to="/login" />;
};

4. CHECKING AUTH STATUS:
const { currentUser, loading, getSessionInfo } = useAuth();

// Debug session
console.log('Session info:', getSessionInfo());

// Check if user is logged in
if (currentUser) {
  console.log('User is logged in:', currentUser.email);
}

MIGRATION NOTES
===============
- Removed authAPI dependency to fix router conflicts
- Components must handle server-side operations (login API calls, logout API calls)
- AuthContext now focuses purely on local state management
- HttpOnly cookie support requires components to make API calls separately
- This separation prevents circular dependencies and router hook conflicts
*/