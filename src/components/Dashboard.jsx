import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [balance, setBalance] = useState(2500.00);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [currentUser] = useState({
    first_name: 'John',
    last_name: 'Doe',
    email: 'testuser@example.com'
  });
  
  const [recentTransactions] = useState([
    {
      id: 1,
      type: 'received',
      amount: 150.00,
      description: 'Payment from Sarah Wilson',
      date: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'sent', 
      amount: -75.50,
      description: 'Transfer to Alice Smith',
      date: '1 day ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'sent',
      amount: -200.00,
      description: 'Monthly rent payment',
      date: '3 days ago',
      status: 'completed'
    }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  const handleSendMoney = () => {
    // In your actual app, this would use navigate('/transfer')
    alert('Navigate to Send Money page');
  };

  const handleViewTransactions = () => {
    // In your actual app, this would use navigate('/transactions')  
    alert('Navigate to Transactions page');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gap: '2rem'
        }}>
          <div style={{
            height: '40px',
            background: '#e5e5e5',
            borderRadius: '8px',
            animation: 'pulse 2s infinite'
          }}></div>
          <div style={{
            height: '200px',
            background: '#e5e5e5',
            borderRadius: '16px',
            animation: 'pulse 2s infinite'
          }}></div>
        </div>
        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
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
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '2rem',
          animation: 'fadeIn 0.6s ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#0ea5e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: '600'
              }}>
                {currentUser?.first_name?.[0] || 'U'}
              </div>
              <div>
                <h1 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#171717',
                  margin: '0 0 0.25rem 0'
                }}>
                  Welcome back, {currentUser?.first_name || 'User'}!
                </h1>
                <p style={{
                  color: '#737373',
                  margin: '0',
                  fontSize: '1rem'
                }}>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                border: 'none',
                background: 'white',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.background = '#f8fafc'}
              onMouseOut={(e) => e.target.style.background = 'white'}>
                🔔
              </button>
              <button style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                border: 'none',
                background: 'white',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.background = '#f8fafc'}
              onMouseOut={(e) => e.target.style.background = 'white'}>
                ⚙️
              </button>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Balance Card */}
          <div style={{
            gridColumn: window.innerWidth > 768 ? 'span 2' : 'span 1',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            borderRadius: '16px',
            padding: '2rem',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '240px',
            animation: 'zoomIn 0.8s ease-out',
            boxShadow: '0 10px 40px rgba(14, 165, 233, 0.3)'
          }}>
            <div style={{
              position: 'relative',
              zIndex: '2'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '2rem'
              }}>
                <div>
                  <p style={{
                    opacity: '0.8',
                    margin: '0 0 0.5rem 0',
                    fontSize: '0.875rem'
                  }}>
                    Current Balance
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h2 style={{
                      fontSize: '2.5rem',
                      fontWeight: '700',
                      margin: '0'
                    }}>
                      {showBalance ? formatCurrency(balance) : '••••••'}
                    </h2>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '0.25rem'
                      }}
                    >
                      {showBalance ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: '3rem', opacity: '0.2' }}>💰</div>
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <p style={{
                  opacity: '0.8',
                  margin: '0 0 0.5rem 0',
                  fontSize: '0.875rem'
                }}>
                  Monthly Activity
                </p>
                <div style={{
                  height: '8px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: '65%',
                    background: '#22c55e',
                    borderRadius: '4px',
                    transition: 'width 1s ease-out'
                  }}></div>
                </div>
                <p style={{
                  opacity: '0.8',
                  margin: '0.5rem 0 0 0',
                  fontSize: '0.75rem'
                }}>
                  $3,250 of $5,000 monthly limit
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}>
                <button
                  onClick={handleSendMoney}
                  style={{
                    background: 'white',
                    color: '#0ea5e9',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '1rem 1.5rem',
                    fontWeight: '600',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#f8fafc';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.transform = 'translateY(0px)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  💸 Send Money
                </button>
                <button
                  onClick={handleViewTransactions}
                  style={{
                    background: 'transparent',
                    color: 'white',
                    border: '2px solid white',
                    borderRadius: '12px',
                    padding: '1rem 1.5rem',
                    fontWeight: '600',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.transform = 'translateY(0px)';
                  }}
                >
                  📋 Transactions
                </button>
              </div>
            </div>
            
            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              zIndex: '1'
            }}></div>
          </div>

          {/* Quick Stats */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            animation: 'zoomIn 1s ease-out'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0px)';
              e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#171717',
                margin: '0 0 0.25rem 0'
              }}>
                +12.5%
              </h3>
              <p style={{
                color: '#737373',
                margin: '0',
                fontSize: '0.875rem'
              }}>
                Monthly Growth
              </p>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0px)';
              e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💸</div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#171717',
                margin: '0 0 0.25rem 0'
              }}>
                24
              </h3>
              <p style={{
                color: '#737373',
                margin: '0',
                fontSize: '0.875rem'
              }}>
                Transfers This Month
              </p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          animation: 'fadeIn 1.2s ease-out'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#171717',
              margin: '0'
            }}>
              Recent Activity
            </h2>
            <button
              onClick={handleViewTransactions}
              style={{
                background: 'none',
                border: 'none',
                color: '#0ea5e9',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.background = '#f0f9ff'}
              onMouseOut={(e) => e.target.style.background = 'none'}
            >
              View All →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentTransactions.map((transaction, index) => (
              <div
                key={transaction.id}
                style={{
                  padding: '1.5rem',
                  border: '1px solid #e5e5e5',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  animation: `fadeIn ${1.4 + index * 0.2}s ease-out`,
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0px)';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: transaction.type === 'received' ? '#f0fdf4' : '#fef2f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}>
                    {transaction.type === 'received' ? '↓' : '↑'}
                  </div>
                  
                  <div style={{ flex: '1' }}>
                    <h4 style={{
                      fontWeight: '600',
                      color: '#171717',
                      margin: '0 0 0.25rem 0',
                      fontSize: '1rem'
                    }}>
                      {transaction.description}
                    </h4>
                    <p style={{
                      color: '#737373',
                      margin: '0',
                      fontSize: '0.875rem'
                    }}>
                      {transaction.date} • {transaction.status}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <h4 style={{
                      fontWeight: '700',
                      color: transaction.type === 'received' ? '#22c55e' : '#ef4444',
                      margin: '0',
                      fontSize: '1.25rem'
                    }}>
                      {transaction.type === 'received' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @media (max-width: 768px) {
          [style*="gridColumn: span 2"] {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;