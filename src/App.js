import React, { useEffect } from 'react';
import ForgotPassword from './pages/ForgotPassword';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet
} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './styles/theme';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard';
import Transfer from './pages/Transfer';
import Transactions from './pages/Transactions';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';

// Enhanced Protected Route (v6 syntax)
const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  return currentUser ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

// Public Route (v6 syntax)
const PublicRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return !currentUser ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

function App() {
  useEffect(() => {
    // Token verification logic
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No auth token found');
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transfer" element={<Transfer />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 Handler */}
          <Route path="*" element={
            <div className="not-found">
              <h1>404 - Page Not Found</h1>
              <p>The requested URL was not found.</p>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;