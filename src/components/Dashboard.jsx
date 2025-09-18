import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { transactionAPI, transferAPI } from '../api'; 
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
  const [balance, setBalance] = useState(0.00); // This should come from backend too
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  console.log('Dashboard mounted with user:', currentUser);

  // Fetch real transactions from backend
  useEffect(() => {
    const fetchTransactions = async () => {
  try {
    setLoading(true);
    const response = await transferAPI.getHistory();
    
    // Debug the raw response first
    console.log('Raw response:', response.data);
    
    if (response.data && Array.isArray(response.data.transfers)) {
      console.log('Transfers array:', response.data.transfers);
      console.log('First transfer:', response.data.transfers[0]);
      console.log('Transfer keys:', Object.keys(response.data.transfers[0] || {}));
      
      setTransactions(response.data.transfers);
      console.log(`Loaded ${response.data.transfers.length} real transactions`);
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
    setTransactions([]);
  } finally {
    setLoading(false);
  }
};

    if (currentUser) {
      fetchTransactions();
    }
  }, [currentUser]);

  const formatCurrency = (amount, currency = 'CAD') => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e5e5',
            borderTop: '4px solid #1976d2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }} />
          <p style={{ color: '#737373' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      padding: '2rem 1rem',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 0.5rem 0'
          }}>
            Welcome to HawalaSend
          </h1>
          <p style={{
            fontSize: '1rem',
            color: '#737373',
            margin: '0'
          }}>
            Send money to Kenya quickly and securely
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '2rem',
            color: '#dc2626'
          }}>
            {error}
          </div>
        )}

        {/* Header with Logout */}
<div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
  padding: '1rem',
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
}}>
  <div>
    <h2 style={{margin: '0 0 0.25rem 0', color: '#171717'}}>
      Welcome back, {currentUser?.first_name || 'User'}!
    </h2>
    <p style={{margin: '0', color: '#737373', fontSize: '0.875rem'}}>
      Manage your money transfers
    </p>
  </div>
  
  <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
    <button
      onClick={() => navigate('/profile')}
      style={{
        background: 'none',
        border: '1px solid #e5e5e5',
        borderRadius: '8px',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        fontSize: '0.875rem'
      }}
    >
      Settings
    </button>
    
    <button
      onClick={() => {
        logout();
        navigate('/auth/login');
      }}
      style={{
        background: '#dc2626',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500'
      }}
    >
      Logout
    </button>
  </div>
</div>

        {/* Balance Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          color: 'white',
          boxShadow: '0 10px 25px rgba(25, 118, 210, 0.3)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            alignItems: 'center'
          }}>
            <div>
              <p style={{
                fontSize: '0.875rem',
                opacity: 0.9,
                margin: '0 0 0.5rem 0'
              }}>
                Available Balance
              </p>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                margin: '0 0 0.5rem 0'
              }}>
                {formatCurrency(balance)}
              </h2>
              <p style={{
                fontSize: '0.875rem',
                opacity: 0.8,
                margin: '0'
              }}>
                Ready to transfer worldwide
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
                                <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    fullWidth
                    size="large"
                    onClick={() => navigate('/transfer')}
                    sx={{ py: 2 }}
                  >
                    Transfer Funds
                  </Button>
            </div>
          </div>
        </div>


        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={() => navigate('/transfer')}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-4px)';
            e.target.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0px)';
            e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              fontSize: '1.5rem'
            }}>
              🚀
            </div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#171717',
              margin: '0 0 0.5rem 0'
            }}>
              Send Money Fast
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: '#737373',
              margin: '0'
            }}>
              Transfer money to Kenya in minutes with competitive rates
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-4px)';
            e.target.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0px)';
            e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2e7d32 0%, #1976d2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              fontSize: '1.5rem'
            }}>
              📊
            </div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#171717',
              margin: '0 0 0.5rem 0'
            }}>
              Live Exchange Rates
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: '#737373',
              margin: '0 0 0.5rem 0'
            }}>
              Current rate: 1 CAD = 110.45 KES
            </p>
            <p style={{
              fontSize: '0.75rem',
              color: '#2e7d32',
              margin: '0',
              fontWeight: '500'
            }}>
              Updated every minute
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-4px)';
            e.target.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0px)';
            e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              fontSize: '1.5rem'
            }}>
              🔒
            </div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#171717',
              margin: '0 0 0.5rem 0'
            }}>
              Secure & Regulated
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: '#737373',
              margin: '0'
            }}>
              FINTRAC compliant with bank-level security
            </p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#171717',
              margin: '0'
            }}>
              Recent Money Transfers
            </h3>
            {(transactions || []).length > 0 && (
              <button onClick={() => navigate('/transactions')} style={{
                background: 'none',
                border: 'none',
                color: '#1976d2',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                View All
              </button>
            )}
          </div>

          {(transactions || []).length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: '#737373'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                fontSize: '2rem'
              }}>
                💸
              </div>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '500',
                color: '#171717',
                margin: '0 0 0.5rem 0'
              }}>
                No transfers yet
              </h4>
              <p style={{
                fontSize: '0.875rem',
                margin: '0 0 1.5rem 0'
              }}>
                Your recent money transfers will appear here
              </p>
              <button
                onClick={() => navigate('/transfer')}
                style={{
                  background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #1565c0 0%, #1b5e20 100%)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)';
                  e.target.style.transform = 'translateY(0px)';
                }}
              >
                Send Your First Transfer
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {transactions.slice(0, 5).map((transaction, index) => (
                <div key={transaction.id || index} style={{
                  padding: '1rem',
                  border: '1px solid #e5e5e5',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#f8fafc';
                  e.target.style.borderColor = '#1976d2';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = '#e5e5e5';
                }}
                >
                  <div>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#171717',
                      marginBottom: '0.25rem'
                    }}>
                      To: {transaction.other_party_name || transaction.other_party_email}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#737373'
                    }}>
                      {formatDate(transaction.created_at)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#171717'
                    }}>
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: transaction.status === 'completed' ? '#2e7d32' : '#737373',
                      fontWeight: '500'
                    }}>
                      {transaction.status === 'completed' ? '✅ Completed' : 'Processing'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trust Indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '2rem',
          marginTop: '2rem',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '24px',
              height: '24px',
              background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              🏛️
            </div>
            <span style={{ fontSize: '0.875rem', color: '#737373', fontWeight: '500' }}>
              FINTRAC Registered
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '24px',
              height: '24px',
              background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              🔐
            </div>
            <span style={{ fontSize: '0.875rem', color: '#737373', fontWeight: '500' }}>
              256-bit SSL Encryption
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '24px',
              height: '24px',
              background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              ⚡
            </div>
            <span style={{ fontSize: '0.875rem', color: '#737373', fontWeight: '500' }}>
              5-Minute Transfers
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          [style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;