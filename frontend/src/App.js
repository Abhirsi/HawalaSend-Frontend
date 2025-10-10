import React from 'react';
import './App.css';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import Transfers from './pages/Transfers';
import Transactions from './pages/Transactions';
import UserProfile from './pages/UserProfile';
import Contact from './pages/Contact';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

const logo = "/Hawalasend_logo.svg";

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return currentUser ? children : <Navigate to="/login" replace />;
};

// Public Route
const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return currentUser ? <Navigate to="/dashboard" replace /> : children;
};

// Main App Content
function AppContent() {
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // Hide header/navbar for public pages
  const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicPage = publicPaths.includes(location.pathname);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#fafafa'
    }}>
      {/* Header - Only show on protected pages */}
      {!isPublicPage && currentUser && (
        <Box 
          sx={{ 
            background: "linear-gradient(90deg, #004aad, #0077cc)", 
            color: 'white',
            py: { xs: 0.5, sm: 1 },
            px: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 2,
            position: 'sticky',
            top: 0,
            zIndex: 1000
          }}
        >
          {/* Left: Logo + Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <img 
              src={logo} 
              alt="HawaSend Logo" 
              style={{ height: '42px', width: 'auto' }}
            />
          </Box>

          {/* Right: tagline */}
          <Box sx={{ 
            fontSize: '0.95rem',
            opacity: 0.9,
            fontWeight: 500,
            display: { xs: 'none', md: 'block' }
          }}>
            Secure money transfers Canada ↔ Kenya
          </Box>
        </Box>
      )}

      {/* Navbar - Only show on protected pages */}
      {!isPublicPage && currentUser && <Navbar />}
      
      {/* Content */}
      <Box component="main" sx={{ flexGrow: 1, pt: isPublicPage ? 0 : 2, px: isPublicPage ? 0 : { xs: 1, sm: 3 } }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/auth/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/transfer" element={<ProtectedRoute><Transfers /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/contact" element={<Contact />} />

          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Box>

      {/* Footer - Only show on protected pages */}
      {!isPublicPage && currentUser && (
        <Box 
          sx={{ 
            backgroundColor: '#002244',
            color: 'white',
            py: 3,
            px: 2,
            textAlign: 'center',
            mt: 'auto'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
            <img 
              src={logo} 
              alt="HawaSend" 
              style={{ height: '26px', width: 'auto', marginRight: '10px' }}
            />
            <Box sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>HawaSend</Box>
          </Box>
          <Box sx={{ fontSize: '0.85rem', opacity: 0.9 }}>
            © {new Date().getFullYear()} HawaSend. Secure money transfers Canada ↔ Kenya.
          </Box>
          <Box sx={{ fontSize: '0.75rem', opacity: 0.7, mt: 0.5 }}>
            Licensed money service business. Your funds are protected.
          </Box>
        </Box>
      )}
    </Box>
  );
}

function App() {
  return (
    <ErrorBoundary fallback={<Box sx={{ p: 4, textAlign: 'center' }}>Something went wrong. Please try again later.</Box>}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;