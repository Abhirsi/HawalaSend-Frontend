import React, { useEffect, useContext, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { userAPI } from '../api';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Tooltip,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  AccountBalance,
  Payment,
  History,
  Person,
  Logout,
  Security,
  Brightness4,
  Brightness7,
  LockReset,
  AccessTime,
  Refresh
} from '@mui/icons-material';
import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';
import Head from '../components/Head';

// Configuration for action cards
const actionCards = (isDarkMode, toggleTheme) => [
  {
    title: 'Make a Transfer',
    icon: <Payment />,
    path: '/transfer',
    variant: 'contained',
    color: 'primary'
  },
  {
    title: 'Transaction History',
    icon: <History />,
    path: '/transactions',
    variant: 'outlined',
    color: 'secondary'
  },
  {
    title: 'Change Password',
    icon: <LockReset />,
    path: 'change-password',
    variant: 'outlined',
    color: 'warning'
  },
  {
    title: isDarkMode ? 'Light Mode' : 'Dark Mode',
    icon: isDarkMode ? <Brightness7 /> : <Brightness4 />,
    action: toggleTheme,
    variant: 'outlined',
    color: 'inherit'
  },
  {
    title: 'Security Settings',
    icon: <Security />,
    path: 'security',
    variant: 'outlined',
    color: 'info'
  },
  {
    title: 'Logout',
    icon: <Logout />,
    path: 'logout',
    variant: 'outlined',
    color: 'error'
  }
];

const Dashboard = ({ toggleTheme }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [balance, setBalance] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState({
    balance: true,
    transactions: true
  });
  const [error, setError] = useState(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [sessionWarning, setSessionWarning] = useState(false);
  const [lastActivity, setLastActivity] = useState(new Date());

  // Track user activity
  useEffect(() => {
    const handleUserActivity = () => setLastActivity(new Date());
    
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keypress', handleUserActivity);
    
    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keypress', handleUserActivity);
    };
  }, []);

  // Fetch data with error handling
  const fetchData = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, balance: true, transactions: true }));
      
      const [balanceRes, transactionsRes] = await Promise.all([
        userAPI.getBalance(),
        userAPI.getRecentTransactions(3)
      ]);
      
      setBalance(balanceRes);
      setRecentTransactions(transactionsRes);
      setError(null);
      setLastActivity(new Date());
    } catch (err) {
      setError(err.message || 'Failed to load data');
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(prev => ({ ...prev, balance: false, transactions: false }));
    }
  }, [logout, navigate]);

  // Session timeout handler
  useEffect(() => {
    const activityTracker = setInterval(() => {
      const now = new Date();
      const minutesInactive = (now - lastActivity) / (1000 * 60);
      
      if (minutesInactive > 14) {
        setSessionWarning(true);
      }
      if (minutesInactive > 15) {
        logout();
      }
    }, 60000);

    return () => clearInterval(activityTracker);
  }, [lastActivity, logout]);

  // Initial data load
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [currentUser, navigate, fetchData]);

  const handleActionClick = (action) => {
    setLastActivity(new Date());
    if (action.path === 'logout') {
      logout();
    } else if (action.path === 'change-password') {
      setChangePasswordOpen(true);
    } else if (action.action) {
      action.action();
    } else {
      navigate(action.path);
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (passwordData.new !== passwordData.confirm) {
        throw new Error("New passwords don't match");
      }
      
      await userAPI.changePassword({
        currentPassword: passwordData.current,
        newPassword: passwordData.new
      });
      
      setChangePasswordOpen(false);
      setPasswordData({ current: '', new: '', confirm: '' });
      setError(null);
      alert('Password changed successfully!');
    } catch (err) {
      setError(err.message || 'Failed to change password');
    }
  };

  if (!currentUser) return null;

  return (
    <>
      <Head title="Dashboard" description="Your account overview" />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Session Timeout Warning */}
        <Dialog open={sessionWarning} onClose={() => setSessionWarning(false)}>
          <DialogTitle>Session About to Expire</DialogTitle>
          <DialogContent>
            <Typography>Your session will expire in 1 minute due to inactivity.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setLastActivity(new Date());
              setSessionWarning(false);
            }}>
              Stay Logged In
            </Button>
          </DialogActions>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)}>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Current Password"
              type="password"
              fullWidth
              value={passwordData.current}
              onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
            />
            <TextField
              margin="dense"
              label="New Password"
              type="password"
              fullWidth
              value={passwordData.new}
              onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
            />
            <TextField
              margin="dense"
              label="Confirm New Password"
              type="password"
              fullWidth
              value={passwordData.confirm}
              onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
            <Button onClick={handlePasswordChange} color="primary">
              Change Password
            </Button>
          </DialogActions>
        </Dialog>

        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Welcome, {currentUser.username}
          </Typography>
          <Tooltip title={`Last login: ${new Date(currentUser.lastLogin).toLocaleString()}`}>
            <Badge 
              color="success" 
              overlap="circular"
              badgeContent=" "
              variant="dot"
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                <AccessTime sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                {new Date(currentUser.lastLogin).toLocaleTimeString()}
              </Typography>
            </Badge>
          </Tooltip>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }} 
            onClose={() => setError(null)}
            action={
              <Button 
                color="inherit" 
                size="small"
                onClick={fetchData}
                startIcon={<Refresh />}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Balance Card */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AccountBalance color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h2">
                    Account Balance
                  </Typography>
                </Box>
                
                <AnimatePresence mode="wait">
                  {loading.balance ? (
                    <Skeleton variant="text" width="60%" height={60} />
                  ) : (
                    <motion.div
                      key={`balance-${balance}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Typography variant="h3" component="div">
                        ${balance?.toFixed(2) || '0.00'}
                      </Typography>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Box display="flex" gap={1} mt={2}>
                  <Button 
                    size="small" 
                    onClick={fetchData}
                    disabled={loading.balance}
                    startIcon={<Refresh />}
                  >
                    Refresh
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Updated: {new Date().toLocaleTimeString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Account Info Card */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Person color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h2">
                    Account Information
                  </Typography>
                </Box>
                
                <Typography paragraph>
                  <strong>Email:</strong> {currentUser.email}
                </Typography>
                <Typography paragraph>
                  <strong>Member since:</strong> {new Date(currentUser.createdAt).toLocaleDateString()}
                </Typography>
                <Typography paragraph>
                  <strong>2FA Status:</strong> {currentUser.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Transactions Card */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <History color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h2">
                    Recent Transactions
                  </Typography>
                </Box>
                
                {loading.transactions ? (
                  <Box>
                    <Skeleton variant="rectangular" height={100} sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" height={100} sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" height={100} />
                  </Box>
                ) : recentTransactions.length > 0 ? (
                  <List dense>
                    {recentTransactions.map((tx, index) => (
                      <React.Fragment key={tx.id}>
                        <ListItem>
                          <ListItemText
                            primary={`${tx.amount < 0 ? 'Sent' : 'Received'} $${Math.abs(tx.amount).toFixed(2)}`}
                            secondary={
                              <>
                                {tx.description && `${tx.description} • `}
                                {new Date(tx.createdAt).toLocaleString()}
                                {tx.recipient && ` • With ${tx.recipient}`}
                              </>
                            }
                          />
                        </ListItem>
                        {index < recentTransactions.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">
                    No recent transactions
                  </Typography>
                )}
                
                <Box mt={2}>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/transactions')}
                    disabled={loading.transactions}
                  >
                    View All Transactions
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Action Buttons */}
          {actionCards(theme.palette.mode === 'dark', toggleTheme).map((action, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Button
                fullWidth
                variant={action.variant}
                size="large"
                startIcon={action.icon}
                onClick={() => handleActionClick(action)}
                sx={{ 
                  height: '100%', 
                  py: isMobile ? 2 : 3,
                  minHeight: 100
                }}
                color={action.color}
              >
                {action.title}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

Dashboard.propTypes = {
  toggleTheme: PropTypes.func.isRequired
};

export default React.memo(Dashboard);