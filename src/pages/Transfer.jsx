import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transferAPI } from '../api';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert,
  InputAdornment,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Check as CheckIcon,
  ArrowBack
} from '@mui/icons-material';

const Transfer = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [balance, setBalance] = useState(2500.00); // Mock balance - will be updated from API
  
  const steps = ['Enter Details', 'Review & Confirm', 'Complete'];
  
  const [transferData, setTransferData] = useState({
    recipientEmail: '',
    recipientName: '',
    amount: '',
    description: '',
    pin: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Fetch balance and check authentication
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Fetch actual balance from backend
    const fetchBalance = async () => {
      try {
        // For now, we'll use the mock balance
        // TODO: Implement getBalance endpoint
        // const response = await transferAPI.getBalance();
        // setBalance(response.data.balance);
        console.log('Using mock balance for now');
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      }
    };
    
    fetchBalance();
  }, [currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Special handling for amount field
    if (name === 'amount') {
      // Only allow numbers and decimal point
      const regex = /^\d*\.?\d{0,2}$/;
      if (regex.test(value) || value === '') {
        setTransferData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setTransferData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateStep1 = () => {
    const errors = {};
    
    // Validate email
    if (!transferData.recipientEmail) {
      errors.recipientEmail = 'Recipient email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(transferData.recipientEmail)) {
      errors.recipientEmail = 'Please enter a valid email';
    } else if (transferData.recipientEmail.toLowerCase() === currentUser?.email?.toLowerCase()) {
      errors.recipientEmail = 'Cannot transfer to yourself';
    }
    
    // Validate amount
    const amount = parseFloat(transferData.amount);
    if (!transferData.amount) {
      errors.amount = 'Amount is required';
    } else if (isNaN(amount) || amount <= 0) {
      errors.amount = 'Please enter a valid amount';
    } else if (amount > balance) {
      errors.amount = 'Insufficient balance';
    } else if (amount < 1) {
      errors.amount = 'Minimum transfer amount is $1.00';
    } else if (amount > 10000) {
      errors.amount = 'Maximum transfer amount is $10,000.00';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const processTransfer = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('About to send transfer with PIN:', transferData.pin);
      
      // Make real API call to backend
      const response = await transferAPI.send({
        recipient_email: transferData.recipientEmail,
        amount: parseFloat(transferData.amount),
        description: transferData.description,
        pin: String(transferData.pin) // Ensure PIN is sent as string
      });
      
      console.log('Transfer API response:', response.data);
      
      if (response.data.success) {
        setSuccess(true);
        // Update local balance with new balance from server
        if (response.data.newBalance !== undefined) {
          setBalance(response.data.newBalance);
        } else {
          // Fallback: subtract amount from current balance
          setBalance(prev => prev - parseFloat(transferData.amount));
        }
        
        console.log('Transfer successful:', response.data);
      } else {
        setError(response.data.message || 'Transfer failed');
      }
      
    } catch (err) {
      console.error('Transfer failed:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.message || 'Transfer failed. Please try again.');
      setActiveStep(1); // Go back to confirmation step
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!validateStep1()) return;
    } else if (activeStep === 1) {
      if (!transferData.pin || transferData.pin.length < 4) {
        setError('Please enter your 4-digit PIN');
        return;
      }
    }
    
    setError('');
    setActiveStep(prev => prev + 1);
    
    if (activeStep === 1) {
      // Process transfer
      processTransfer();
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleNewTransfer = () => {
    setTransferData({
      recipientEmail: '',
      recipientName: '',
      amount: '',
      description: '',
      pin: ''
    });
    setActiveStep(0);
    setSuccess(false);
    setError('');
    setValidationErrors({});
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/dashboard')}
        sx={{ mb: 2 }}
      >
        Back to Dashboard
      </Button>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Send Money
        </Typography>
        
        {/* Balance Display */}
        <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Available Balance
            </Typography>
            <Typography variant="h5">
              ${balance.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Step 1: Enter Details */}
        {activeStep === 0 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="recipientEmail"
                  label="Recipient Email"
                  type="email"
                  value={transferData.recipientEmail}
                  onChange={handleInputChange}
                  error={!!validationErrors.recipientEmail}
                  helperText={validationErrors.recipientEmail}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="amount"
                  label="Amount"
                  value={transferData.amount}
                  onChange={handleInputChange}
                  error={!!validationErrors.amount}
                  helperText={validationErrors.amount || 'Minimum $1.00, Maximum $10,000.00'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MoneyIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="Description (Optional)"
                  multiline
                  rows={3}
                  value={transferData.description}
                  onChange={handleInputChange}
                  helperText="Add a note for the recipient"
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleNext}
                startIcon={<SendIcon />}
                size="large"
              >
                Continue
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 2: Review & Confirm */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Transfer Details
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Sending to
                  </Typography>
                  <Typography variant="body1">
                    {transferData.recipientEmail}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="h5" color="primary">
                    ${parseFloat(transferData.amount).toFixed(2)}
                  </Typography>
                </Grid>
                
                {transferData.description && (
                  <>
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Description
                      </Typography>
                      <Typography variant="body1">
                        {transferData.description}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>

            <TextField
              fullWidth
              name="pin"
              label="Enter your 4-digit PIN to confirm"
              type="password"
              value={transferData.pin}
              onChange={handleInputChange}
              inputProps={{ maxLength: 4 }}
              helperText="Enter your transaction PIN"
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading || !transferData.pin}
                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              >
                {loading ? 'Processing...' : 'Confirm Transfer'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 3: Complete */}
        {activeStep === 2 && success && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Transfer Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              ${parseFloat(transferData.amount).toFixed(2)} has been sent to
            </Typography>
            <Typography variant="h6" gutterBottom>
              {transferData.recipientEmail}
            </Typography>
            
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                onClick={handleNewTransfer}
                sx={{ mr: 2 }}
              >
                New Transfer
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/transactions')}
              >
                View Transactions
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Transfer;