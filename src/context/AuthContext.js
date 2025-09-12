
import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Safe storage helper
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
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    },
    removeItem: (key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing from localStorage:', error);
      }
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    console.log('AuthContext: Checking existing session');
    const token = safeStorage.getItem('authToken');
    const userData = safeStorage.getItem('user');
    
    console.log('Token exists:', !!token);
    console.log('User data exists:', !!userData);
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('AuthContext: Restored user session', parsedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('AuthContext: Error parsing user data', error);
        // Clear invalid data
        safeStorage.removeItem('authToken');
        safeStorage.removeItem('user');
      }
    } else if (token && !userData) {
      // Token exists but no user data - this shouldn't happen
      console.log('AuthContext: Token exists but no user data - clearing session');
      safeStorage.removeItem('authToken');
    }
    
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    console.log('AuthContext: Logging in user', userData);
    
    // Store both token and user data
    safeStorage.setItem('authToken', token);
    safeStorage.setItem('user', JSON.stringify(userData));
    
    setCurrentUser(userData);
  };

  const logout = () => {
    console.log('AuthContext: Logging out user');
    
    // Clear all auth data
    safeStorage.removeItem('authToken');
    safeStorage.removeItem('user');
    
    setCurrentUser(null);
  };

  const updateUser = (updatedUserData) => {
    console.log('AuthContext: Updating user data', updatedUserData);
    
    // Update user data in both state and storage
    const newUserData = { ...currentUser, ...updatedUserData };
    safeStorage.setItem('user', JSON.stringify(newUserData));
    setCurrentUser(newUserData);
  };

  const value = {
    currentUser,
    login,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!currentUser

  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;