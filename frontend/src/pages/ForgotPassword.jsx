import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import { authAPI } from '../api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setLoading(true);

    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      console.log('Sending password reset request for:', email);
      
      // Call the backend API
      const response = await authAPI.forgotPassword(email);
      
      console.log('Forgot password response:', response.data);
      
      if (response.data.success) {
        setSubmitted(true);
        setError('');
      } else {
        setError(response.data.message || 'Something went wrong. Please try again.');
      }
      
    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error.response?.status === 429) {
        // Rate limiting error
        const resetTime = error.response.data.resetTime;
        const resetDate = resetTime ? new Date(resetTime).toLocaleString() : 'tomorrow';
        setError(`Too many password reset attempts. Please try again ${resetDate}.`);
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        setError('Cannot connect to server. Please check your connection and try again.');
      } else {
        setError('Unable to process your request. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setSubmitted(false);
    setError('');
    setEmail('');
  };

  if (submitted) {
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
            <Typography component="h1" variant="h4" align="center" sx={{ mb: 3 }}>
              Check Your Email
            </Typography>

            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body1">
                We've sent a password reset link to <strong>{email}</strong>
              </Typography>
            </Alert>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Please check your email and click the reset link to create a new password.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                If you don't see the email in your inbox, please check your spam folder.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The reset link will expire in 24 hours for security reasons.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleTryAgain}
                fullWidth
              >
                Send to Different Email
              </Button>
              
              <Button
                component={Link}
                to="/login"
                variant="text"
                color="primary"
                fullWidth
              >
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
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" sx={{ mb: 1 }}>
            Reset Your Password
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Enter your email address and we'll send you a link to reset your password
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!error && !email}
              disabled={loading}
              helperText={
                !email && error ? 'Email is required' : 
                'We\'ll send reset instructions to this email'
              }
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                component={Link}
                to="/login"
                variant="text"
                color="primary"
                disabled={loading}
              >
                Back to Login
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;