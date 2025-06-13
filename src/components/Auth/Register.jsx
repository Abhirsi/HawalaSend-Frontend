import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { authAPI } from '../../api';
import {
  TextField,
  Button,
  Container,
  Box,
  Typography,
  Alert,
  Link as MuiLink,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

const Register = () => {
  // Form state to track input fields and password visibility
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Toggle password visibility
  const handlePasswordVisibility = () => {
    setFormData({
      ...formData,
      showPassword: !formData.showPassword,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clean input values before submission
    const trimmedData = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
    };

    // Basic validation
    if (trimmedData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Email regex for more accurate validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (trimmedData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Register user through the API (ensure backend expects 'username')
      const { token, user } = await authAPI.register(trimmedData);

      // Save token locally and update user context
      localStorage.setItem('token', token);
      setCurrentUser(user);

      // Redirect user to dashboard after successful registration
      navigate('/dashboard');
    } catch (err) {
      // Show detailed backend error if available
      const backendError =
        err?.response?.data?.message || err.message || 'Registration failed.';
      setError(backendError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%' }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom sx={{ fontWeight: 600 }}>
          Create Account
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" paragraph>
          Join us today and get started
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            autoComplete="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type={formData.showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            helperText="At least 8 characters"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handlePasswordVisibility}
                    edge="end"
                  >
                    {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirm Password"
            type={formData.showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign Up'
            )}
          </Button>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account?{' '}
            <MuiLink component={Link} to="/login" sx={{ fontWeight: 600 }}>
              Sign in
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
