// frontend/src/components/Dashboard.jsx - Updated with new headlines and improved styling
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Avatar,
  Divider
} from '@mui/material';
import { 
  TrendingUp, 
  Send, 
  Inbox, 
  AccountBalance,
  ArrowUpward,
  ArrowDownward,
  History,
  Security,
  Speed,
  VerifiedUser
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transferAPI, transactionAPI, userAPI } from '../api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalSent: 0,
    totalReceived: 0,
    transactionCount: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch balance and recent transactions in parallel
      const [balanceResponse, transactionsResponse] = await Promise.all([
        userAPI.getBalance(),
        transactionAPI.getRecent(5)
      ]);

      setBalance(balanceResponse.data.balance || 0);
      setRecentTransactions(transactionsResponse.data || []);
      
      // Calculate basic stats from recent transactions
      const transactions = transactionsResponse.data || [];
      const sent = transactions
        .filter(t => t.type === 'sent')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      const received = transactions
        .filter(t => t.type === 'received')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      
      setStats({
        totalSent: sent,
        totalReceived: received,
        transactionCount: transactions.length
      });

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'CAD') => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getTransactionIcon = (type) => {
    return type === 'sent' ? 
      <ArrowUpward sx={{ color: 'error.main' }} /> : 
      <ArrowDownward sx={{ color: 'success.main' }} />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
          Welcome back, {user?.firstName || user?.username || 'User'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your money transfers between Canada and Kenya securely and efficiently.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Balance Card */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1976D2 0%, #2E7D32 100%)',
            color: 'white',
            height: '200px'
          }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountBalance sx={{ mr: 1, fontSize: '2rem' }} />
                  <Typography variant="h6">Account Balance</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {formatCurrency(balance)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Available for transfer
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
                    fontWeight: 600
                  }}
                  onClick={() => navigate('/transfer')}
                  startIcon={<Send />}
                >
                  Transfer Funds
                </Button>
                <Button 
                  variant="outlined" 
                  sx={{ 
                    borderColor: 'rgba(255,255,255,0.5)', 
                    color: 'white',
                    '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                  onClick={() => navigate('/transactions')}
                  startIcon={<History />}
                >
                  View History
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <TrendingUp sx={{ fontSize: '2rem', color: 'success.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {formatCurrency(stats.totalSent)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Sent
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Inbox sx={{ fontSize: '2rem', color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {formatCurrency(stats.totalReceived)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Received
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Quick Actions
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)' }, transition: 'transform 0.2s' }}
                onClick={() => navigate('/transfer')}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ backgroundColor: 'primary.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <Send sx={{ fontSize: '1.5rem' }} />
              </Avatar>
              <Typography variant="h6" gutterBottom>Transfer Funds</Typography>
              <Typography variant="body2" color="text.secondary">
                Send money to Kenya instantly
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)' }, transition: 'transform 0.2s' }}
                onClick={() => navigate('/transactions')}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ backgroundColor: 'secondary.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <History sx={{ fontSize: '1.5rem' }} />
              </Avatar>
              <Typography variant="h6" gutterBottom>Transaction History</Typography>
              <Typography variant="body2" color="text.secondary">
                View all your transfers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ backgroundColor: 'info.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <Speed sx={{ fontSize: '1.5rem' }} />
              </Avatar>
              <Typography variant="h6" gutterBottom>Instant Transfers</Typography>
              <Typography variant="body2" color="text.secondary">
                Money arrives in minutes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ backgroundColor: 'success.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <VerifiedUser sx={{ fontSize: '1.5rem' }} />
              </Avatar>
              <Typography variant="h6" gutterBottom>Bank-Level Security</Typography>
              <Typography variant="body2" color="text.secondary">
                Your money is protected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Recent Activity
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/transactions')}
                >
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {recentTransactions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <History sx={{ fontSize: '3rem', color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No transactions yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Start by sending your first transfer to Kenya
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/transfer')}
                    startIcon={<Send />}
                  >
                    Send Money Now
                  </Button>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>To/From</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentTransactions.map((transaction) => (
                        <TableRow key={transaction.id} sx={{ '&:hover': { backgroundColor: 'grey.50' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getTransactionIcon(transaction.type)}
                              <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                                {transaction.type}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatCurrency(transaction.amount)}
                            </Typography>
                            {transaction.fee && (
                              <Typography variant="caption" color="text.secondary">
                                Fee: {formatCurrency(transaction.fee)}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {transaction.other_party_name || transaction.other_party_username || transaction.other_party_email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={transaction.status || 'completed'} 
                              color={getStatusColor(transaction.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(transaction.created_at)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Exchange Rate Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Current Exchange Rate
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    1.00
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    CAD
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ mx: 2 }}>
                  =
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                    110.45
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    KES
                  </Typography>
                </Box>
              </Box>
              <Alert severity="info" sx={{ mt: 2 }}>
                Great rate! Send money now to get the best value.
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Trust Indicators */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Why Choose HawalaSend?
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Security sx={{ color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Bank-Level Security
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      256-bit SSL encryption protects your data
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Speed sx={{ color: 'secondary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Lightning Fast
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Money arrives in minutes, not days
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <VerifiedUser sx={{ color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Licensed & Regulated
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Fully compliant with Canadian regulations
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;