import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  AccountBalance as BalanceIcon,
  Send as SendIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(2500.00); // This should come from backend too
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  console.log('Dashboard mounted with user:', currentUser);

  // Fetch real transactions from backend
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        console.log('Fetching transactions from /transactions');
        
        const response = await transactionAPI.getAll();
        console.log('Transactions response:', response.data);
        
        if (response.data && Array.isArray(response.data.transactions)) {
          setTransactions(response.data.transactions);
          console.log(`Loaded ${response.data.transactions.length} real transactions`);
        } else if (response.data && Array.isArray(response.data)) {
          setTransactions(response.data);
          console.log(`Loaded ${response.data.length} real transactions`);
        } else {
          console.log('No transactions found or invalid format');
          setTransactions([]);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError('Failed to load transactions. Using demo data.');
        
        // Fallback to empty array if API fails
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchTransactions();
    }
  }, [currentUser]);

  const handleSendMoney = () => {
    navigate('/transfer');
  };

  const handleViewTransactions = () => {
    navigate('/transactions');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (transaction) => {
    if (currentUser && transaction.sender_id === currentUser.id) {
      return <ArrowUpwardIcon color="error" />;
    } else {
      return <ArrowDownwardIcon color="success" />;
    }
  };

  const getTransactionType = (transaction) => {
    if (currentUser && transaction.sender_id === currentUser.id) {
      return 'Sent';
    } else {
      return 'Received';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (!currentUser) {
    return (
      <Container>
        <Alert severity="error">
          Please log in to access your dashboard.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back, {currentUser.first_name}!
          </Typography>
          <Button variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Balance Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BalanceIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Account Balance
                  </Typography>
                </Box>
                <Typography variant="h4">
                  {formatCurrency(balance)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                  Available for transfer
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    fullWidth
                    size="large"
                    onClick={handleSendMoney}
                    sx={{ py: 2 }}
                  >
                    Transfer Funds
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    startIcon={<ReceiptIcon />}
                    fullWidth
                    size="large"
                    onClick={handleViewTransactions}
                    sx={{ py: 2 }}
                  >
                    View Transactions
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Recent Transactions */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Recent Transactions
                </Typography>
              </Box>

              {error && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : transactions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No transactions found. Start by sending your first transfer!
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={handleSendMoney}
                    sx={{ mt: 2 }}
                  >
                    Send Your First Transfer
                  </Button>
                </Box>
              ) : (
                <List>
                  {transactions.slice(0, 5).map((transaction, index) => (
                    <React.Fragment key={transaction.id}>
                      <ListItem>
                        <ListItemIcon>
                          {getTransactionIcon(transaction)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body1">
                                {getTransactionType(transaction)} - {transaction.description || 'Money Transfer'}
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {formatCurrency(transaction.amount)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                {transaction.otherParty ? `To/From: ${transaction.otherParty}` : ''} • {formatDate(transaction.createdAt)}
                              </Typography>
                              <Chip 
                                label={transaction.status} 
                                size="small" 
                                color={getStatusColor(transaction.status)}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < Math.min(transactions.length - 1, 4) && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}

              {transactions.length > 5 && (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button variant="text" onClick={handleViewTransactions}>
                    View All Transactions
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;