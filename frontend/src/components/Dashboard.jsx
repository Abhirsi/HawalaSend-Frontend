import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transferAPI } from '../api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [sendCurrency, setSendCurrency] = useState('CAD');

  // Enhanced exchange rates with better pricing
  const exchangeRates = {
    'USD_to_KES': 150.25,
    'CAD_to_KES': 110.45
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Fixed: Complete the fetch function

    const fetchDashboardData = async () => {
  try {
    setLoading(true);
    setError('');
    
    // Make real API call to get transaction history
    const response = await transferAPI.getHistory();
    
    // Backend returns { transactions: [...], total: X }
    setTransactions(response.data.transactions || []);
    
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    setError('Failed to load transaction history');
    setTransactions([]);
  } finally {
    setLoading(false);
  }
};

    fetchDashboardData();
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

  // Enhanced amount calculation with fees
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

  // Calculate fees based on amount
  const calculateFee = (amount) => {
    if (!amount || amount <= 0) return 2.99;
    // Tiered fee structure
    if (amount <= 100) return 2.99;
    if (amount <= 500) return 4.99;
    if (amount <= 1000) return 7.99;
    return Math.max(7.99, amount * 0.008); // 0.8% for larger amounts
  };

  const fee = calculateFee(parseFloat(sendAmount || 0));
  const total = parseFloat(sendAmount || 0) + fee;

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
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '300px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e5e5e5',
            borderTop: '4px solid #1976d2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem auto'
          }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#171717' }}>Loading Dashboard</h3>
          <p style={{ color: '#737373', margin: '0' }}>Preparing your money transfer hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      padding: '1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Enhanced Navigation */}

      <div style={{
  maxWidth: '1000px',
  margin: '0 auto',
  padding: '2rem 1rem'
}}></div>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {error && (
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '2rem',
            color: '#dc2626',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {/* Enhanced Welcome Section */}
        <div style={{
          background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
          borderRadius: '20px',
          padding: '2.5rem',
          marginBottom: '2rem',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-50px',
            left: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            pointerEvents: 'none'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              margin: '0 0 0.75rem 0',
              lineHeight: '1.2'
            }}>
              Welcome back, {currentUser?.first_name || currentUser?.firstName || 'User'}!
            </h2>
            <p style={{
              fontSize: '1.1rem',
              margin: '0 0 2rem 0',
              opacity: 0.9,
              lineHeight: '1.5'
            }}>
              Send money to Kenya instantly with competitive exchange rates and low fees
            </p>
            <button
              onClick={() => navigate('/transfer')}
              style={{
                padding: '1rem 2rem',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Start Transfer →
            </button>
          </div>
        </div>

        {/* Enhanced Transfer Calculator */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2.5rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 0.5rem 0'
            }}>
              Send Money to Kenya
            </h2>
            <p style={{
              fontSize: '0.95rem',
              color: '#64748b',
              margin: '0'
            }}>
              Calculate your transfer amount and fees instantly
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '1.5rem',
            alignItems: 'end',
            marginBottom: '2rem'
          }}>
            {/* Send Amount */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.75rem'
              }}>
                You Send
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '2px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1rem 1.25rem',
                background: '#f8fafc',
                transition: 'border-color 0.3s ease'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginRight: '1rem'
                }}>
                  <img 
                    src={sendCurrency === 'USD' ? "https://flagcdn.com/w20/us.png" : "https://flagcdn.com/w20/ca.png"} 
                    alt={sendCurrency === 'USD' ? "USA" : "Canada"} 
                    width="28" 
                    height="21" 
                    style={{ borderRadius: '2px' }}
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
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      color: '#374151'
                    }}
                  >
                    <option value="CAD">CAD</option>
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
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    width: '100%',
                    outline: 'none',
                    color: '#1e293b'
                  }}
                />
              </div>
            </div>

            {/* Exchange Icon */}
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.4rem',
              boxShadow: '0 6px 20px rgba(25, 118, 210, 0.25)'
            }}>
              ⇄
            </div>

            {/* Receive Amount */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.75rem'
              }}>
                They Receive
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '2px solid #10b981',
                borderRadius: '16px',
                padding: '1rem 1.25rem',
                background: '#f0fdf4'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginRight: '1rem'
                }}>
                  <img 
                    src="https://flagcdn.com/w20/ke.png" 
                    alt="Kenya" 
                    width="28" 
                    height="21" 
                    style={{ borderRadius: '2px' }}
                  />
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#374151'
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
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    width: '100%',
                    outline: 'none',
                    color: '#10b981'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Enhanced Fee Breakdown */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Exchange Rate:</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                  1 {sendCurrency} = {sendCurrency === 'USD' ? exchangeRates.USD_to_KES : exchangeRates.CAD_to_KES} KES
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Transfer Fee:</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                  {formatCurrency(fee, sendCurrency)}
                </span>
              </div>
            </div>
            <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>Total Amount:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1976d2' }}>
                {formatCurrency(total, sendCurrency)}
              </span>
            </div>
          </div>

          {/* Enhanced Send Button */}
          <button
            onClick={() => navigate('/transfer')}
            disabled={!sendAmount || parseFloat(sendAmount) <= 0}
            style={{
              width: '100%',
              padding: '1.25rem 2rem',
              background: !sendAmount || parseFloat(sendAmount) <= 0 
                ? '#e2e8f0' 
                : 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
              border: 'none',
              borderRadius: '16px',
              color: !sendAmount || parseFloat(sendAmount) <= 0 ? '#94a3b8' : 'white',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: !sendAmount || parseFloat(sendAmount) <= 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: !sendAmount || parseFloat(sendAmount) <= 0 
                ? 'none' 
                : '0 8px 25px rgba(25, 118, 210, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (sendAmount && parseFloat(sendAmount) > 0) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 35px rgba(25, 118, 210, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = sendAmount && parseFloat(sendAmount) > 0 
                ? '0 8px 25px rgba(25, 118, 210, 0.3)' 
                : 'none';
            }}
          >
            {!sendAmount || parseFloat(sendAmount) <= 0 ? 'Enter Amount to Continue' : 'Send Money Now'}
          </button>
        </div>

        {/* Enhanced Recent Transactions */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0'
            }}>
              Recent Transfers
            </h3>
            {transactions.length > 0 && (
              <button 
                onClick={() => navigate('/transactions')} 
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1976d2',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f0f9ff'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
              >
                View All →
              </button>
            )}
          </div>

          {transactions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: '#64748b'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
                fontSize: '2.5rem'
              }}>
                💸
              </div>
              <h4 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: '#1e293b',
                margin: '0 0 0.75rem 0'
              }}>
                No transfers yet
              </h4>
              <p style={{
                fontSize: '0.95rem',
                margin: '0 0 2rem 0',
                lineHeight: '1.6'
              }}>
                Start your first money transfer to Kenya using our secure platform. 
                Your recipients will receive funds within minutes.
              </p>
              <button
                onClick={() => navigate('/transfer')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Send Money Now
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {transactions.slice(0, 5).map((transaction, index) => (
                <div key={transaction.id || index} style={{
                  padding: '1.5rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f8fafc';
                  e.target.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = '#e2e8f0';
                }}
                >
                  <div>
                    <div style={{
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      color: '#1e293b',
                      marginBottom: '0.5rem'
                    }}>
                      To: {transaction.recipient_name || transaction.recipient_email}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#64748b'
                    }}>
                      {formatDate(transaction.created_at)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      color: '#1e293b',
                      marginBottom: '0.25rem'
                    }}>
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: transaction.status === 'completed' ? '#10b981' : '#f59e0b',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '0.25rem'
                    }}>
                      {transaction.status === 'completed' ? '✓ Completed' : '⏳ Processing'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trust Indicators */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          {[
            {
              icon: '🔒',
              title: 'Bank-Level Security',
              description: '256-bit SSL encryption protects all your data and transactions',
              gradient: 'linear-gradient(135deg, #1976d2 0%, #42A5F5 100%)'
            },
            {
              icon: '⚡',
              title: 'Lightning Fast',
              description: 'Money arrives in Kenya within minutes, not days',
              gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
            },
            {
              icon: '🏛️',
              title: 'Licensed & Regulated',
              description: 'Fully compliant with Canadian and Kenyan regulations',
              gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
            }
          ].map((feature, index) => (
            <div key={index} style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: feature.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
                fontSize: '1.8rem'
              }}>
                {feature.icon}
              </div>
              <h4 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1e293b',
                margin: '0 0 0.75rem 0'
              }}>
                {feature.title}
              </h4>
              <p style={{
                fontSize: '0.9rem',
                color: '#64748b',
                margin: '0',
                lineHeight: '1.5'
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes fadeInDown {
    from { 
      opacity: 0; 
      transform: translateY(-10px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
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