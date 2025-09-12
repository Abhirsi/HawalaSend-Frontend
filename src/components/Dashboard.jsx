import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import {
  AccountBalanceWallet,
  Send as SendIcon,
  History,
  Person,
  Logout,
  Security,
  LockReset
} from '@mui/icons-material';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [balance] = useState(2500.00);
  const [recentTransactions] = useState([
    { id: 1, amount: -50, description: 'Transfer to Sadiya Hashi', createdAt: new Date().toISOString(), recipient: 'John Doe' },
    { id: 2, amount: 100, description: 'Received from Abdikhafar Ali', createdAt: new Date().toISOString(), recipient: 'Sarah Smith' },
    { id: 3, amount: -25, description: 'Bill payment', createdAt: new Date().toISOString(), recipient: 'Utilities Co.' }
  ]);

  useEffect(() => {
    console.log('Dashboard mounted with user:', currentUser);
    if (!currentUser) {
      console.log('No user found, redirecting to login');
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Welcome back, {currentUser.email || currentUser.username || 'User'}!
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Logout />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Balance Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountBalanceWallet color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Account Balance
                </Typography>
              </Box>
              <Typography variant="h3" component="div" color="primary">
                ${balance.toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Last updated: {new Date().toLocaleTimeString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<SendIcon />}
                    onClick={() => navigate('/transfer')}
                    sx={{ py: 2 }}
                  >
                    Send Money
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    size="large"
                    startIcon={<History />}
                    onClick={() => navigate('/transactions')}
                    sx={{ py: 2 }}
                  >
                    View Transactions
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              {recentTransactions.map((tx, index) => (
                <Box key={tx.id}>
                  <Box display="flex" justifyContent="space-between" py={2}>
                    <Box>
                      <Typography variant="body1">
                        {tx.amount < 0 ? 'Sent to' : 'Received from'} {tx.recipient}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tx.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(tx.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="h6" 
                      color={tx.amount < 0 ? 'error' : 'success.main'}
                    >
                      {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                    </Typography>
                  </Box>
                  {index < recentTransactions.length - 1 && <Divider />}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Account Info */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Person color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Account Information
                </Typography>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Email
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
                  {currentUser.email || 'user@example.com'}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Username
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
                  {currentUser.username || 'User'}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Member Since
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {new Date().toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;