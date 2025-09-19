import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transferAPI, userAPI } from '../api'; // ADDED: userAPI for balance

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0); // ADDED: User balance state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [sendCurrency, setSendCurrency] = useState('CAD'); // CHANGED: Default to CAD for Canada
  const [receiveCurrency, setReceiveCurrency] = useState('KES');

  // Exchange rates - UPDATED with your exact rates
  const exchangeRates = {
    'USD_to_KES': 150.25,
    'CAD_to_KES': 110.45
  };

  // ENHANCED: Fetch both transactions and balance
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch both transactions and balance in parallel
        const [transactionsResponse, balanceResponse] = await Promise.all([
          transferAPI.getHistory(),
          userAPI.getBalance().catch(() => ({ data: { balance: currentUser?.balance || 0 } }))
        ]);
        
        // Handle transactions
        if (transactionsResponse.data && Array.isArray(transactionsResponse.data.transfers)) {
          setTransactions(transactionsResponse.data.transfers);
        } else {
          setTransactions([]);
        }
        
        // Handle balance
        setBalance(balanceResponse.data.balance || currentUser?.balance || 0);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
        setTransactions([]);
        setBalance(currentUser?.balance || 0);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser, navigate]);

  // Close menu when clicking outside (keeping existing functionality)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('.user-menu')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  // Handle amount changes with live calculation (keeping existing functionality)
  const handleSendAmountChange = (value) => {
    setSendAmount(value);
    if (value && !isNaN(value)) {
      const rate = sendCurrency === 'USD' ? exchangeRates.USD_to_KES : exchangeRates.CAD_to_KES;
      const calculated = (parseFloat(value) * rate).toFixed(2);
      setReceiveAmount(calculated);
    } else {
      setReceiveAmount('');
    }
  };

  const handleReceiveAmountChange = (value) => {
    setReceiveAmount(value);
    if (value && !isNaN(value)) {
      const rate = sendCurrency === 'USD' ? exchangeRates.USD_to_KES : exchangeRates.CAD_to_KES;
      const calculated = (parseFloat(value) / rate).toFixed(2);
      setSendAmount(calculated);
    } else {
      setSendAmount('');
    }
  };

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
            borderTop: '4px solid #1976d2', // UPDATED: Using theme primary color
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
      padding: '1rem',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      position: 'relative'
    }}>
      {/* Top Navigation Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1rem 0'
      }}>
        {/* Logo - Left Side - ENHANCED with better styling */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          {/* SVG Logo */}
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)', // UPDATED: Using theme colors
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M12 2L22 12L12 22L2 12L12 2Z" 
                fill="white" 
                fillOpacity="0.9"
              />
              <path 
                d="M8 12L12 8L16 12L12 16L8 12Z" 
                fill="white"
              />
              <path 
                d="M12 4L20 12L12 20" 
                stroke="white" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          
          {/* Brand Name */}
          <div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)', // UPDATED: Using theme colors
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0',
              letterSpacing: '-0.02em'
            }}>
              HawalaSend
            </h1>
            <p style={{
              fontSize: '0.75rem',
              color: '#737373',
              margin: '0',
              fontWeight: '500'
            }}>
              Secure Money Transfers {/* UPDATED: Enhanced tagline */}
            </p>
          </div>
        </div>

        {/* User Menu - Right Side */}
        <div className="user-menu" style={{
          position: 'relative',
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
              background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)', // UPDATED: Using theme colors
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
          >
            {currentUser?.first_name?.[0]?.toUpperCase() || currentUser?.firstName?.[0]?.toUpperCase() || 'U'}
          </button>

          {/* Dropdown Menu - ENHANCED with balance display */}
          {menuOpen && (
            <div style={{
              position: 'absolute',
              top: '60px',
              right: '0',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              border: '1px solid #e5e5e5',
              minWidth: '240px', // INCREASED: Width for balance display
              overflow: 'hidden'
            }}>
              <div style={{ padding: '0.5rem' }}>
                <div style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid #e5e5e5',
                  background: '#f8fafc'
                }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#171717' }}>
                    {currentUser?.first_name || currentUser?.firstName} {currentUser?.last_name || currentUser?.lastName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#737373', marginBottom: '0.5rem' }}>
                    {currentUser?.email}
                  </div>
                  {/* ADDED: Balance display in menu */}
                  <div style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: '#2e7d32',
                    padding: '0.25rem 0.5rem',
                    background: '#f0fdf4',
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    Balance: {formatCurrency(balance)}
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
                >
                  🏠 Dashboard
                </button>
                
                <button
                  onClick={() => {
                    navigate('/transactions'); // UPDATED: Link to transactions page
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
                >
                  📊 Transaction History {/* UPDATED: Better menu item */}
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
                >
                  ⚙️ Settings
                </button>
                
                <hr style={{margin: '0.5rem 0', border: 'none', borderTop: '1px solid #e5e5e5'}} />
                
                <button
                  onClick={async () => { // ENHANCED: Async logout
                    try {
                      await logout();
                      navigate('/auth/login');
                    } catch (error) {
                      console.error('Logout error:', error);
                      navigate('/auth/login'); // Navigate anyway
                    }
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
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
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

        {/* ADDED: Welcome message and balance card */}
        <div style={{
          background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            pointerEvents: 'none'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              margin: '0 0 0.5rem 0'
            }}>
              Welcome back, {currentUser?.first_name || currentUser?.firstName || 'User'}! 👋
            </h2>
            <p style={{
              fontSize: '1rem',
              margin: '0 0 1.5rem 0',
              opacity: 0.9
            }}>
              Your account balance
            </p>
            <div style={{
              fontSize: '3rem',
              fontWeight: '700',
              margin: '0 0 1rem 0'
            }}>
              {formatCurrency(balance)}
            </div>
            <button
              onClick={() => navigate('/transfer')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              Transfer Funds →
            </button>
          </div>
        </div>

        {/* Transfer Calculator Box - UPDATED with headline change */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#171717',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            Transfer Funds Globally {/* UPDATED: Changed from "Send Money Globally" */}
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '1rem',
            alignItems: 'end',
            marginBottom: '1.5rem'
          }}>
            {/* Send Amount */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#737373',
                marginBottom: '0.5rem'
              }}>
                You Send
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '2px solid #e5e5e5',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                background: '#f8fafc'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginRight: '1rem'
                }}>
                  <img 
                    src={sendCurrency === 'USD' ? "https://flagcdn.com/w20/us.png" : "https://flagcdn.com/w20/ca.png"} 
                    alt={sendCurrency === 'USD' ? "USA" : "Canada"} 
                    width="24" 
                    height="18" 
                  />
                  <select
                    value={sendCurrency}
                    onChange={(e) => {
                      setSendCurrency(e.target.value);
                      if (sendAmount) {
                        handleSendAmountChange(sendAmount);
                      }
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="CAD">CAD</option> {/* REORDERED: CAD first for Canada */}
                    <option value="USD">USD</option>
                  </select>
                </div>
                <input
                  type="number"
                  value={sendAmount}
                  onChange={(e) => handleSendAmountChange(e.target.value)}
                  placeholder="0.00"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    width: '100%',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Exchange Icon - UPDATED with theme colors */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)', // UPDATED: Using theme colors
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.2rem'
            }}>
              ⇄
            </div>

            {/* Receive Amount - UPDATED with theme colors */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#737373',
                marginBottom: '0.5rem'
              }}>
                They Receive
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '2px solid #2e7d32', // UPDATED: Using theme secondary color
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                background: '#f0fdf4'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginRight: '1rem'
                }}>
                  <img 
                    src="https://flagcdn.com/w20/ke.png" 
                    alt="Kenya" 
                    width="24" 
                    height="18" 
                  />
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    KES
                  </span>
                </div>
                <input
                  type="number"
                  value={receiveAmount}
                  onChange={(e) => handleReceiveAmountChange(e.target.value)}
                  placeholder="0.00"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    width: '100%',
                    outline: 'none',
                    color: '#2e7d32' // UPDATED: Using theme secondary color
                  }}
                />
              </div>
            </div>
          </div>

          {/* Exchange Rate & Fees */}
          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '0.875rem', color: '#737373' }}>
                Exchange Rate:
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                1 {sendCurrency} = {sendCurrency === 'USD' ? exchangeRates.USD_to_KES : exchangeRates.CAD_to_KES} KES
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '0.875rem', color: '#737373' }}>
                Fee:
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                {formatCurrency((parseFloat(sendAmount || 0) * 0.01), sendCurrency)} {/* UPDATED: Removed fixed fee for clarity */}
              </span>
            </div>
            <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid #e5e5e5' }} />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                Total:
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: '700' }}>
                {formatCurrency(parseFloat(sendAmount || 0) + (parseFloat(sendAmount || 0) * 0.01), sendCurrency)}
              </span>
            </div>
          </div>

          {/* Send Money Button - UPDATED with theme colors */}
          <button
            onClick={() => navigate('/transfer')}
            disabled={!sendAmount || parseFloat(sendAmount) <= 0}
            style={{
              width: '100%',
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)', // UPDATED: Using theme colors
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: !sendAmount || parseFloat(sendAmount) <= 0 ? 'not-allowed' : 'pointer',
              opacity: !sendAmount || parseFloat(sendAmount) <= 0 ? 0.5 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            Transfer Funds {/* UPDATED: Changed from "Send Money" */}
          </button>
        </div>

        {/* Recent Transactions - UPDATED headline */}
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
              Recent Activity {/* UPDATED: Changed from "Recent Transactions" */}
            </h3>
            {transactions.length > 0 && (
              <button 
                onClick={() => navigate('/transactions')} 
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1976d2', // UPDATED: Using theme primary color
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
                margin: '0 0 1rem 0'
              }}>
                Use the calculator above to send your first transfer to Kenya
              </p>
              <button
                onClick={() => navigate('/transfer')}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)', // UPDATED: Using theme colors
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Transfer Funds Now {/* UPDATED: Changed from "Send Money Now" */}
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
                      {transaction.type === 'sent' ? 'To:' : 'From:'} {transaction.other_party_name || transaction.other_party_email}
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
                      color: transaction.type === 'sent' ? '#dc2626' : '#2e7d32' // UPDATED: Color coding for sent/received
                    }}>
                      {transaction.type === 'sent' ? '-' : '+'}{formatCurrency(transaction.amount)}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: transaction.status === 'completed' ? '#2e7d32' : '#737373', // UPDATED: Using theme colors
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

        {/* ADDED: Trust indicators and features section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1976d2 0%, #42A5F5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              fontSize: '1.5rem'
            }}>
              🔒
            </div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#171717',
              margin: '0 0 0.5rem 0'
            }}>
              Bank-Level Security
            </h4>
            <p style={{
              fontSize: '0.875rem',
              color: '#737373',
              margin: '0'
            }}>
              256-bit SSL encryption protects your data and transactions
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2e7d32 0%, #4CAF50 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              fontSize: '1.5rem'
            }}>
              ⚡
            </div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#171717',
              margin: '0 0 0.5rem 0'
            }}>
              Lightning Fast
            </h4>
            <p style={{
              fontSize: '0.875rem',
              color: '#737373',
              margin: '0'
            }}>
              Money arrives in minutes, not days
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              fontSize: '1.5rem'
            }}>
              🏛️
            </div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#171717',
              margin: '0 0 0.5rem 0'
            }}>
              Licensed & Regulated
            </h4>
            <p style={{
              fontSize: '0.875rem',
              color: '#737373',
              margin: '0'
            }}>
              Fully compliant with Canadian regulations
            </p>
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