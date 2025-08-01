import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
  useNavigate
} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './styles/theme';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard';
import Transfer from './pages/Transfer';
import Transactions from './pages/Transactions';
import ForgotPassword from './pages/ForgotPassword';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import api from './api'; // Make sure you have this API configuration file

// 1. Protected Route - for pages that need login
const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Show spinner while checking auth status
  if (loading) return <LoadingSpinner />;

  // If user is logged in, show the page. If not, redirect to login
  return currentUser ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

// 2. Public Route - for login/register pages
const PublicRoute = () => {
  const { currentUser, loading } = useAuth();

  // Show spinner while checking auth status
  if (loading) return <LoadingSpinner />;

  // If user is NOT logged in, show the page. If logged in, go to dashboard
  return !currentUser ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

function App() {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  // 3. Check authentication when app starts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('No token found - user not logged in');
          return;
        }

        // Verify token with backend
        const response = await api.get('/auth/verify-session');
        
        if (response.data.valid) {
          setCurrentUser(response.data.user);
        } else {
          // Token is invalid - clear it
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate, setCurrentUser]);

  // 4. Handle API errors globally
  useEffect(() => {
    // Response interceptor
    const interceptor = api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          setCurrentUser(null);
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    // Cleanup
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [navigate, setCurrentUser]);

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Routes>
          {/* Public Routes - accessible without login */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Protected Routes - need login */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transfer" element={<Transfer />} />
            <Route path="/transactions" element={<Transactions />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 Page */}
          <Route path="*" element={
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h1>404 - Page Not Found</h1>
              <p>The page you're looking for doesn't exist.</p>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
