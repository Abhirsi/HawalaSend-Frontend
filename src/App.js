// frontend/src/App.js - Updated with Logo
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Import your existing components
import { AuthProvider, useAuth } from './context/AuthContext';
import theme from './styles/theme';
import Navbar from './components/Layout/Navbar';
import Dashboard from './components/Dashboard';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Transfer from './pages/Transfer';
import Transactions from './pages/Transactions';
import ProfilePage from './pages/ProfilePage';
import ForgotPassword from './pages/ForgotPassword';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// Import logo
import logo from './assets/logo.svg';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Box sx={{ 
              minHeight: '100vh', 
              display: 'flex', 
              flexDirection: 'column',
              backgroundColor: '#f5f5f5'
            }}>
              {/* Header with Logo */}
              <Box sx={{ 
                backgroundColor: 'primary.main',
                color: 'white',
                py: 1,
                px: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 1
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <img 
                    src={logo} 
                    alt="HawalaSend Logo" 
                    style={{ 
                      height: '40px', 
                      width: 'auto',
                      filter: 'brightness(0) invert(1)' // Makes logo white
                    }} 
                  />
                  <Box sx={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold',
                    display: { xs: 'none', sm: 'block' }
                  }}>
                    HawalaSend
                  </Box>
                </Box>
                <Box sx={{ 
                  fontSize: '0.9rem',
                  opacity: 0.9,
                  display: { xs: 'none', md: 'block' }
                }}>
                  Secure money transfers Canada ↔ Kenya
                </Box>
              </Box>

              {/* Navigation */}
              <Navbar />
              
              {/* Main Content */}
              <Box component="main" sx={{ flexGrow: 1, pt: 2 }}>
                <Routes>
                  {/* Public Routes */}
                  <Route 
                    path="/login" 
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    } 
                  />
                  <Route 
                    path="/register" 
                    element={
                      <PublicRoute>
                        <Register />
                      </PublicRoute>
                    } 
                  />
                  <Route 
                    path="/auth/register" 
                    element={
                      <PublicRoute>
                        <Register />
                      </PublicRoute>
                    } 
                  />
                  <Route 
                    path="/forgot-password" 
                    element={
                      <PublicRoute>
                        <ForgotPassword />
                      </PublicRoute>
                    } 
                  />

                  {/* Protected Routes */}
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/transfer" 
                    element={
                      <ProtectedRoute>
                        <Transfer />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/transactions" 
                    element={
                      <ProtectedRoute>
                        <Transactions />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Default redirect */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Box>

              {/* Footer */}
              <Box sx={{ 
                backgroundColor: 'grey.800',
                color: 'white',
                py: 3,
                px: 2,
                textAlign: 'center',
                mt: 'auto'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <img 
                    src={logo} 
                    alt="HawalaSend" 
                    style={{ 
                      height: '24px', 
                      width: 'auto',
                      marginRight: '8px',
                      filter: 'brightness(0) invert(1)'
                    }} 
                  />
                  <Box sx={{ fontWeight: 'bold' }}>HawalaSend</Box>
                </Box>
                <Box sx={{ fontSize: '0.875rem', opacity: 0.8 }}>
                  © 2025 HawalaSend. Secure money transfers Canada ↔ Kenya.
                </Box>
                <Box sx={{ fontSize: '0.75rem', opacity: 0.6, mt: 0.5 }}>
                  Licensed money service business. Your funds are protected.
                </Box>
              </Box>
            </Box>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;