import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transferAPI } from '../api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch transactions on mount
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await transferAPI.getHistory();
        
        if (response.data && Array.isArray(response.data.transfers)) {
          setTransactions(response.data.transfers);
        } else {
          setTransactions([]);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError('Failed to load transactions');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentUser, navigate]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('.user-menu')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

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
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      position: 'relative'
    }}>
      {/* User Menu Button - Top Right */}
      <div className="user-menu" style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 6px 20px rgba(25, 118, 210, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.3)';
          }}
        >
          {currentUser?.first_name?.[0]?.toUpperCase() || 'U'}
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div style={{
            position: 'absolute',
            top: '60px',
            right: '0',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e5e5e5',
            minWidth: '200px',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '0.5rem' }}>
              <div style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid #e5e5e5',
                background: '#f8fafc'
              }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#171717' }}>
                  {currentUser?.first_name} {currentUser?.last_name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#737373' }}>
                  {currentUser?.email}
                </div>
              </div>
              
              <button
                onClick={() => {
                  navigate('/dashboard');
                  setMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'none',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
                onMouseOver={(e) => e.target.style.background = '#f8fafc'}
                onMouseOut={(e) => e.target.style.background = 'none'}
              >
                🏠 Dashboard
              </button>
              
              <button
                onClick={() => {
                  navigate('/profile');
                  setMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'none',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
                onMouseOver={(e) => e.target.style.background = '#f8fafc'}
                onMouseOut={(e) => e.target.style.background = 'none'}
              >
                👤 Profile
              </button>
              
              <button
                onClick={() => {
                  navigate('/profile');
                  setMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'none',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
                onMouseOver={(e) => e.target.style.background = '#f8fafc'}
                onMouseOut={(e) => e.target.style.background = 'none'}
              >
                ⚙️ Settings
              </button>
              
              <hr style={{margin: '0.5rem 0', border: 'none', borderTop: '1px solid #e5e5e5'}} />
              
              <button
                onClick={() => {
                  logout();
                  navigate('/auth/login');
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'none',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: '#dc2626'
                }}
                onMouseOver={(e) => e.target.style.background = '#fef2f2'}
                onMouseOut={(e) => e.target.style.background = 'none'}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        )}
      </div>

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

        {/* Logo Header */}
<div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '2rem',
  padding: '1rem',
  background: 'white',
  borderRadius: '16px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
}}>
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  }}>
    {/* Logo Icon */}
    <div style={{
      width: '48px',
      height: '48px',
      background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
    }}>
      {/* Arrow Symbol */}
      <div style={{
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold',
        transform: 'rotate(45deg)'
      }}>
        ➤
      </div>
    </div>
    
    {/* Brand Name */}
    <div>
      <h2 style={{
        fontSize: '2rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        margin: '0',
        letterSpacing: '-0.02em'
      }}>
        HawalaSend
      </h2>
      <p style={{
        fontSize: '0.875rem',
        color: '#737373',
        margin: '0',
        fontWeight: '500'
      }}>
        Canada ↔ Kenya Money Transfers
      </p>
    </div>
  </div>
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

        {/* Transfer Action Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div 
            onClick={() => navigate('/transfer')}
            style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              border: '2px solid #1976d2',
              borderRadius: '16px',
              padding: '2rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(25, 118, 210, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <img 
              src="https://flagcdn.com/w40/ca.png" 
              alt="Canada" 
              width="40" 
              height="30" 
              style={{ marginBottom: '1rem', borderRadius: '4px' }}
            />
            <h3 style={{
              color: '#1976d2',
              margin: '0 0 0.5rem 0',
              fontSize: '1.25rem',
              fontWeight: '700'
            }}>
              Send from Canada
            </h3>
            <p style={{
              color: '#737373',
              margin: '0 0 1rem 0',
              fontSize: '0.875rem'
            }}>
              Fast CAD to KES transfers
            </p>
            <div style={{
              background: 'rgba(25, 118, 210, 0.1)',
              borderRadius: '8px',
              padding: '0.5rem',
              fontSize: '0.75rem',
              color: '#1976d2',
              fontWeight: '600'
            }}>
              1 CAD = 110.45 KES
            </div>
          </div>

          <div 
            onClick={() => navigate('/transfer')}
            style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '2px solid #2e7d32',
              borderRadius: '16px',
              padding: '2rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(46, 125, 50, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <img 
              src="https://flagcdn.com/w40/ke.png" 
              alt="Kenya" 
              width="40" 
              height="30" 
              style={{ marginBottom: '1rem', borderRadius: '4px' }}
            />
            <h3 style={{
              color: '#2e7d32',
              margin: '0 0 0.5rem 0',
              fontSize: '1.25rem',
              fontWeight: '700'
            }}>
              Receive in Kenya
            </h3>
            <p style={{
              color: '#737373',
              margin: '0 0 1rem 0',
              fontSize: '0.875rem'
            }}>
              Direct to M-Pesa accounts
            </p>
            <div style={{
              background: 'rgba(46, 125, 50, 0.1)',
              borderRadius: '8px',
              padding: '0.5rem',
              fontSize: '0.75rem',
              color: '#2e7d32',
              fontWeight: '600'
            }}>
              M-Pesa Ready
            </div>
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
            {transactions.length > 0 && (
              <button 
                onClick={() => navigate('/transactions')} 
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1976d2',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                View All
              </button>
            )}
          </div>

          {transactions.length === 0 ? (
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
                  cursor: 'pointer'
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
                  alignItems: 'center'
                }}>
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
              fontSize: '12px'
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
              fontSize: '12px'
            }}>
              🔐
            </div>
            <span style={{ fontSize: '0.875rem', color: '#737373', fontWeight: '500' }}>
              SSL Encryption
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
              fontSize: '12px'
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