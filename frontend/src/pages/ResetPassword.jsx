import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, Error } from '@mui/icons-material';
import { authAPI } from '../api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [formData, setFormData] = useState({
  newPassword: '',
  confirmPassword: ''
});
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [error, setError] = useState('');
const [success, setSuccess] = useState(false);
const [loading, setLoading] = useState(false);
const [tokenValid, setTokenValid] = useState(true);

// Password strength checker
const checkPasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  const score = Object.values(checks).filter(Boolean).length;
  return {
    checks,
    score,
    strength: score < 2 ? 'Weak' : score < 4 ? 'Medium' : 'Strong',
    color: score < 2 ? 'error' : score < 4 ? 'warning' : 'success'
  };
};

const passwordStrength = checkPasswordStrength(formData.newPassword);

const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

// Check for missing token
useEffect(() => {
  if (!token) {
    setTokenValid(false);
    setError('Invalid or missing reset token. Please request a new password reset.');
  }
}, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Both password fields are required');
      setLoading(false);
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (passwordStrength.score < 3) {
      setError('Password must meet strength requirements (uppercase, lowercase, number, special character)');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.resetPassword(token, formData.newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login', { state: { message: 'Password reset successful!' } }), 3000);
    } catch (error) {
      
      const errorMsg = error.response?.data?.error || 'Network error. Try again.';
        setError(errorMsg);
        if (error.response?.status === 400 && errorMsg.includes('token')) {
          setTokenValid(false);
        }
      } finally {
        setLoading(false);
      }
    };

  if (success) {
    return (
      <Container component="main" maxWidth="sm">
        <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
                Password Reset Successful!
              </Typography>
            </Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              Your password has been updated. Redirecting to login...
            </Alert>
            <Button component={Link} to="/login" variant="contained" fullWidth size="large">
              Go to Login
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (!tokenValid) {
    return (
      <Container component="main" maxWidth="sm">
        <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Error sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
              <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
                Invalid Reset Link
              </Typography>
            </Box>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || 'This password reset link is invalid or has expired.'}
            </Alert>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button component={Link} to="/forgot-password" variant="contained" fullWidth>
                Request New Reset Link
              </Button>
              <Button component={Link} to="/login" variant="text" fullWidth>
                Back to Login
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" sx={{ mb: 1 }}>
            Set New Password
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Please enter your new password below
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              id="newPassword"
              autoComplete="new-password"
              value={formData.newPassword}
              onChange={handleInputChange}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              aria-label="New Password"
            />
            {formData.newPassword && (
              <Box sx={{ mt: 1, mb: 2 }}>
                <Typography variant="body2" color={passwordStrength.color + '.main'}>
                  Strength: {passwordStrength.strength}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {Object.entries({
                    '8+ characters': passwordStrength.checks.length,
                    'Uppercase': passwordStrength.checks.uppercase,
                    'Lowercase': passwordStrength.checks.lowercase,
                    'Number': passwordStrength.checks.number,
                    'Special': passwordStrength.checks.special
                  }).map(([req, met]) => (
                    <Typography key={req} variant="body2" color={met ? 'success.main' : 'text.secondary'} sx={{ fontSize: '0.75rem' }}>
                      {met ? '✓' : '○'} {req}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={loading}
              error={!!formData.confirmPassword && formData.newPassword !== formData.confirmPassword}
              helperText={formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? 'Passwords do not match' : ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              aria-label="Confirm New Password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || passwordStrength.score < 3 || formData.newPassword !== formData.confirmPassword}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              aria-label="Reset Password"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Button component={Link} to="/login" variant="text" color="primary" disabled={loading} aria-label="Back to Login">
                Back to Login
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPassword;