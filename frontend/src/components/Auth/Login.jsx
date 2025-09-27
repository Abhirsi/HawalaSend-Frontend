import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon
} from '@mui/icons-material';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, login, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Handle success message from location state (e.g., from password reset)
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      // Clear the message from history
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser && !authLoading) {
      console.log('User already authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [currentUser, authLoading, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email address is required');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Attempting login for:', formData.email);
      
      const result = await login(formData.email.trim(), formData.password);
      
      if (result.success) {
        console.log('Login successful, user:', result.user?.email);
        
        // Small delay to ensure state updates
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
        
      } else {
        console.log('Login failed:', result.error);
        setError(result.error || 'Login failed. Please try again.');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Show loading spinner while checking auth status
  if (authLoading) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <CircularProgress size={40} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Checking authentication...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography component="h1" variant="h4" gutterBottom>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your HawalaSend account
            </Typography>
          </Box>

          {/* Success message (e.g., from password reset) */}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
              error={!!error && !formData.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color={error && !formData.email ? 'error' : 'action'} />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
              error={!!error && !formData.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color={error && !formData.password ? 'error' : 'action'} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                component={Link}
                to="/forgot-password"
                variant="text"
                color="primary"
                disabled={loading}
                sx={{ textTransform: 'none' }}
              >
                Forgot your password?
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Button
                  component={Link}
                  to="/register"
                  variant="text"
                  color="primary"
                  disabled={loading}
                  sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
                >
                  Sign up here
                </Button>
              </Typography>
            </Box>
          </Box>

          {/* Development helper */}
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Development: Use recipientuser@example.com / password123
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;