import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transactionAPI } from '../api';

const Transactions = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchTransactions();
  }, [currentUser]);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchTerm, filterStatus]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getHistory();
      
      if (response.data && Array.isArray(response.data.transactions)) {
        setTransactions(response.data.transactions);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction =>
        (transaction.recipient_name || transaction.recipient_email || 'Unknown').toLowerCase().includes(search) ||
        transaction.notes?.toLowerCase().includes(search) ||
        transaction.id?.toString().includes(search)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === filterStatus);
    }

    setFilteredTransactions(filtered);
  };

  const formatCurrency = (amount, currency = 'CAD') => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      completed: {
        color: '#22c55e',
        background: '#f0fdf4',
        icon: '✓',
        label: 'Completed'
      },
      pending: {
        color: '#f59e0b',
        background: '#fffbeb',
        icon: '⏳',
        label: 'Pending'
      },
      failed: {
        color: '#ef4444',
        background: '#fef2f2',
        icon: '✕',
        label: 'Failed'
      }
    };
    return configs[status] || configs.pending;
  };

  const TransactionModal = ({ transaction, onClose }) => {
    const statusConfig = getStatusConfig(transaction.status);
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'modalSlideIn 0.3s ease-out',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
        onClick={(e) => e.stopPropagation()}>
          
          {/* Header */}
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
              margin: 0
            }}>
              Transfer Details
            </h2>
            <button
              onClick={onClose}
              style={{
                background: '#f3f4f6',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#737373',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#e5e7eb'}
              onMouseOut={(e) => e.target.style.background = '#f3f4f6'}
            >
              ×
            </button>
          </div>

          {/* Amount Section */}
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            marginBottom: '2rem',
            color: 'white'
          }}>
            <div style={{
              fontSize: '0.875rem',
              opacity: 0.9,
              marginBottom: '0.5rem'
            }}>
              You sent
            </div>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '0.5rem'
            }}>
              {formatCurrency(transaction.amount, transaction.from_currency)}
            </div>
            <div style={{
              fontSize: '0.875rem',
              opacity: 0.9
            }}>
              Recipient gets {formatCurrency(transaction.recipient_amount, transaction.to_currency)}
            </div>
          </div>

          {/* Details Grid */}
          <div style={{
            display: 'grid',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: '1rem',
              borderBottom: '1px solid #f3f4f6'
            }}>
              <span style={{ color: '#737373', fontSize: '0.875rem' }}>Status</span>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                background: statusConfig.background,
                color: statusConfig.color,
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                <span>{statusConfig.icon}</span>
                <span>{statusConfig.label}</span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: '1rem',
              borderBottom: '1px solid #f3f4f6'
            }}>
              <span style={{ color: '#737373', fontSize: '0.875rem' }}>Recipient</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', color: '#171717' }}>
                  {transaction.recipient_name || transaction.recipient_email || 'Unknown'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#737373' }}>
                  {transaction.recipient_email || transaction.recipient_name || 'No email'}
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: '1rem',
              borderBottom: '1px solid #f3f4f6'
            }}>
              <span style={{ color: '#737373', fontSize: '0.875rem' }}>Transfer Fee</span>
              <span style={{ fontWeight: '600', color: '#171717' }}>
                {formatCurrency(transaction.fee, transaction.from_currency)}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: '1rem',
              borderBottom: '1px solid #f3f4f6'
            }}>
              <span style={{ color: '#737373', fontSize: '0.875rem' }}>Exchange Rate</span>
              <span style={{ fontWeight: '600', color: '#171717' }}>
                {transaction.exchange_rate} {transaction.from_currency}/{transaction.to_currency}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: '1rem',
              borderBottom: '1px solid #f3f4f6'
            }}>
              <span style={{ color: '#737373', fontSize: '0.875rem' }}>Date</span>
              <span style={{ fontWeight: '600', color: '#171717' }}>
                {new Date(transaction.created_at).toLocaleString('en-CA')}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#737373', fontSize: '0.875rem' }}>Transaction ID</span>
              <span style={{ 
                fontFamily: 'monospace', 
                fontSize: '0.75rem',
                color: '#171717',
                fontWeight: '600'
              }}>
                #{transaction.id}
              </span>
            </div>

            {transaction.notes && (
              <div style={{
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: '12px'
              }}>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#737373',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  fontWeight: '600'
                }}>
                  Note
                </div>
                <div style={{ color: '#171717' }}>
                  {transaction.notes}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{
            display: 'grid',
            gap: '0.75rem'
          }}>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`#${transaction.id}`);
                alert('Transaction ID copied!');
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '1rem',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Copy Transaction ID
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        padding: '2rem 1rem',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{
              height: '90px',
              background: 'white',
              borderRadius: '16px',
              marginBottom: '1rem',
              animation: 'pulse 2s infinite'
            }} />
          ))}
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
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'white',
              border: 'none',
              borderRadius: '12px',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              marginRight: '1rem',
              fontSize: '1.25rem',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#f8fafc';
              e.target.style.transform = 'translateX(-4px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'white';
              e.target.style.transform = 'translateX(0)';
            }}
          >
            ←
          </button>
          <div>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: '700',
              color: '#171717',
              margin: '0 0 0.25rem 0'
            }}>
              Your Transfers
            </h1>
            <p style={{
              color: '#737373',
              margin: 0,
              fontSize: '0.875rem'
            }}>
              View all your sent money transfers
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ color: '#737373', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Total Sent
            </div>
            <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#171717' }}>
              {transactions.length}
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            color: 'white',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
          }}>
            <div style={{ opacity: 0.9, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Total Amount
            </div>
            <div style={{ fontSize: '1.875rem', fontWeight: '700' }}>
              {formatCurrency(
                transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Search transfers
              </label>
              <input
                type="text"
                placeholder="Search by recipient, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e5e5e5',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e5e5e5',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  background: 'white',
                  cursor: 'pointer',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          {filteredTransactions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: '#737373'
            }}>
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: '1rem',
                opacity: 0.5
              }}>
                💸
              </div>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '0.5rem',
                color: '#171717'
              }}>
                {searchTerm || filterStatus !== 'all' ? 'No transfers found' : 'No transfers yet'}
              </h3>
              <p style={{ marginBottom: '2rem' }}>
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter'
                  : 'Start sending money to see your transfer history'}
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <button
                  onClick={() => navigate('/transfers')}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.875rem 2rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  Send Money Now
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredTransactions.map((transaction, index) => {
                const statusConfig = getStatusConfig(transaction.status);
                const recipientDisplay = transaction.recipient_name || transaction.recipient_email || 'Unknown';
                
                return (
                  <div
                    key={transaction.id}
                    onClick={() => setSelectedTransaction(transaction)}
                    style={{
                      padding: '1.25rem',
                      border: '2px solid #f3f4f6',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      animation: `fadeIn ${0.1 + index * 0.05}s ease-out`
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#667eea';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#f3f4f6';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        flexShrink: 0,
                        color: 'white',
                        fontWeight: '600'
                      }}>
                        {recipientDisplay.charAt(0).toUpperCase()}
                      </div>

                      <div style={{ flex: '1', minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '0.5rem',
                          gap: '1rem'
                        }}>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <h3 style={{
                              fontSize: '1.125rem',
                              fontWeight: '600',
                              color: '#171717',
                              margin: '0 0 0.25rem 0',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {recipientDisplay}
                            </h3>
                            <p style={{
                              color: '#737373',
                              margin: '0',
                              fontSize: '0.875rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {transaction.recipient_email || transaction.recipient_name || 'No email'}
                            </p>
                          </div>

                          <div style={{ 
                            textAlign: 'right',
                            flexShrink: 0
                          }}>
                            <div style={{
                              fontSize: '1.25rem',
                              fontWeight: '700',
                              color: '#171717',
                              marginBottom: '0.25rem'
                            }}>
                              {formatCurrency(transaction.amount, transaction.from_currency)}
                            </div>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.125rem 0.625rem',
                              borderRadius: '12px',
                              background: statusConfig.background,
                              color: statusConfig.color,
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              <span>{statusConfig.icon}</span>
                              <span>{statusConfig.label}</span>
                            </div>
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.875rem',
                          color: '#737373'
                        }}>
                          <span>
                            {formatCurrency(transaction.recipient_amount, transaction.to_currency)} received
                          </span>
                          <span>
                            {formatDate(transaction.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedTransaction && (
          <TransactionModal
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
          />
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @media (max-width: 640px) {
          [style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Transactions;