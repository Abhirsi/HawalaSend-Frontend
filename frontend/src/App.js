import ResetPassword from './pages/ResetPassword';
import React from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Import components
import { AuthProvider, useAuth } from './context/AuthContext';
import theme from './styles/theme';
import Navbar from './components/Layout/Navbar';
import Dashboard from './components/Dashboard';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import transfers from './pages/Transfers';
import Transactions from './pages/Transactions';
import UserProfile from './pages/UserProfile';
import Contact from './pages/Contact';
import ForgotPassword from './pages/ForgotPassword';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import Transfers from './pages/Transfers';

// Import logo
const logo = '/HawaSend-logo.png';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return currentUser ? children : <Navigate to="/login" replace />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return currentUser ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <ErrorBoundary fallback={<Box sx={{ p: 4, textAlign: 'center' }}>Something went wrong. Please try again later.</Box>}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: '#f5f5f5'
          }}>
            {/* Header with Logo */}
            <Box 
              sx={{ 
                backgroundColor: 'primary.main',
                color: 'white',
                py: { xs: 0.5, sm: 1 },
                px: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 1,
                position: 'sticky',
                top: 0,
                zIndex: 1000
              }}
              role="banner"
              aria-label="HawalaSend Header"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <img 
                  src={logo} 
                  alt="HawalaSend Logo" 
                  style={{ height: '40px', width: 'auto', filter: 'brightness(0) invert(1)' }}
                  aria-label="HawalaSend Logo"
                />
                <Box sx={{ 
                  fontSize: { xs: '1.2rem', sm: '1.5rem' }, 
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
                  element={<PublicRoute><Login /></PublicRoute>} 
                />
                <Route 
                  path="/register" 
                  element={<PublicRoute><Register /></PublicRoute>} 
                />
                <Route 
                  path="/auth/register" 
                  element={<PublicRoute><Register /></PublicRoute>} 
                />
                <Route 
                  path="/forgot-password" 
                  element={<PublicRoute><ForgotPassword /></PublicRoute>} 
                />
                <Route 
                  path="/reset-password/:token" 
                  element={<PublicRoute><ResetPassword /></PublicRoute>} 
                />
                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
                />
                <Route 
                  path="/transfer" 
                  element={<ProtectedRoute><Transfers /></ProtectedRoute>} 
                />
                <Route 
                  path="/transactions" 
                  element={<ProtectedRoute><Transactions /></ProtectedRoute>} 
                />
                <Route 
                  path="/profile" 
                  element={<ProtectedRoute><UserProfile /></ProtectedRoute>} 
                />
                <Route 
                  path="/contact" 
                  element={<Contact />} 
                />
                {/* Root Redirect */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Box>

            {/* Footer */}
            <Box 
              sx={{ 
                backgroundColor: 'grey.800',
                color: 'white',
                py: { xs: 2, sm: 3 },
                px: 2,
                textAlign: 'center',
                mt: 'auto'
              }}
              role="contentinfo"
              aria-label="HawalaSend Footer"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <img 
                  src={logo} 
                  alt="HawalaSend" 
                  style={{ height: '24px', width: 'auto', marginRight: '8px', filter: 'brightness(0) invert(1)' }}
                  aria-label="HawalaSend Footer Logo"
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
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;