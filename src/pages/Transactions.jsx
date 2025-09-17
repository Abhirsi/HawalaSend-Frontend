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
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const mockTransactions = [
    {
      id: 1,
      type: 'received',
      amount: 150.00,
      fee: 1.50,
      description: 'Payment for freelance work',
      other_party_email: 'client@company.com',
      other_party_username: 'client_user',
      status: 'completed',
      created_at: '2025-01-10T14:30:00Z',
      reference_id: 'TXN-001-2025'
    },
    {
      id: 2,
      type: 'sent',
      amount: -75.50,
      fee: 0.76,
      description: 'Dinner split with friends',
      other_party_email: 'alice@example.com',
      other_party_username: 'alice_smith',
      status: 'completed',
      created_at: '2025-01-09T19:15:00Z',
      reference_id: 'TXN-002-2025'
    },
    {
      id: 3,
      type: 'sent',
      amount: -200.00,
      fee: 2.00,
      description: 'Monthly rent payment',
      other_party_email: 'landlord@rental.com',
      other_party_username: 'landlord_office',
      status: 'completed',
      created_at: '2025-01-01T09:00:00Z',
      reference_id: 'TXN-003-2025'
    },
    {
      id: 4,
      type: 'received',
      amount: 500.00,
      fee: 5.00,
      description: 'Salary payment',
      other_party_email: 'payroll@company.com',
      other_party_username: 'company_payroll',
      status: 'completed',
      created_at: '2024-12-31T12:00:00Z',
      reference_id: 'TXN-004-2024'
    },
    {
      id: 5,
      type: 'sent',
      amount: -25.00,
      fee: 0.25,
      description: 'Coffee with team',
      other_party_email: 'teammate@work.com',
      other_party_username: 'teammate',
      status: 'pending',
      created_at: '2025-01-11T08:30:00Z',
      reference_id: 'TXN-005-2025'
    }
  ];

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchTransactions();
  }, [currentUser, navigate]);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchTerm, filterType, filterStatus]);

  const fetchTransactions = async () => {
  try {
    setLoading(true);
    console.log('Fetching transactions from /transfers/history');
    
    const response = await transferAPI.getHistory();
    console.log('Transfer history response:', response.data);
    
    if (response.data && Array.isArray(response.data.transfers)) {
      setTransactions(response.data.transfers);
      console.log(`Loaded ${response.data.transfers.length} real transactions`);
    } else {
      console.log('No transactions found or invalid format');
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
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.other_party_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.reference_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === filterStatus);
    }

    setFilteredTransactions(filtered);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getTransactionIcon = (type, status) => {
    if (status === 'pending') return '⏳';
    if (status === 'failed') return '❌';
    return type === 'received' ? '↓' : '↑';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#737373';
    }
  };

  const getTransactionColor = (type) => {
    return type === 'received' ? '#22c55e' : '#ef4444';
  };

  const TransactionModal = ({ transaction, onClose }) => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        animation: 'modalSlideIn 0.3s ease-out'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#171717',
            margin: 0
          }}>
            Transaction Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#737373',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
            onMouseOut={(e) => e.target.style.background = 'none'}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: transaction.type === 'received' ? '#f0fdf4' : '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              {getTransactionIcon(transaction.type, transaction.status)}
            </div>
            <div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: getTransactionColor(transaction.type),
                margin: '0'
              }}>
                {transaction.type === 'received' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </h3>
              <div style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                background: transaction.status === 'completed' ? '#f0fdf4' : 
                           transaction.status === 'pending' ? '#fffbeb' : '#fef2f2',
                color: getStatusColor(transaction.status),
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                marginTop: '0.25rem'
              }}>
                {transaction.status}
              </div>
            </div>
          </div>

          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#737373', textTransform: 'uppercase' }}>
                  {transaction.type === 'received' ? 'From' : 'To'}
                </label>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', color: '#171717' }}>
                  {transaction.other_party_email}
                </p>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#737373', textTransform: 'uppercase' }}>
                  Description
                </label>
                <p style={{ margin: '0.25rem 0 0 0', color: '#171717' }}>
                  {transaction.description}
                </p>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#737373', textTransform: 'uppercase' }}>
                  Date & Time
                </label>
                <p style={{ margin: '0.25rem 0 0 0', color: '#171717' }}>
                  {new Date(transaction.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#737373', textTransform: 'uppercase' }}>
                  Transaction ID
                </label>
                <p style={{ margin: '0.25rem 0 0 0', color: '#171717', fontFamily: 'monospace' }}>
                  {transaction.reference_id}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem'
          }}>
            <button
              onClick={() => alert('Receipt download (Demo only)')}
              style={{
                background: 'white',
                color: '#0ea5e9',
                border: '2px solid #0ea5e9',
                borderRadius: '12px',
                padding: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Download Receipt
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(transaction.reference_id);
                alert('Transaction ID copied!');
              }}
              style={{
                background: '#f8fafc',
                color: '#737373',
                border: '2px solid #e5e5e5',
                borderRadius: '12px',
                padding: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Copy ID
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
              height: '80px',
              background: 'white',
              borderRadius: '12px',
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
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              marginRight: '1rem',
              fontSize: '1.25rem',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#f8fafc'}
            onMouseOut={(e) => e.target.style.background = 'white'}
          >
            ←
          </button>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: '#171717',
            margin: '0'
          }}>
            Transaction History
          </h1>
        </div>

        {/* Filters */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            alignItems: 'end'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Search
              </label>
              <input
                type="text"
                placeholder="Search transactions..."
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
                onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
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
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
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
                <option value="all">All Types</option>
                <option value="sent">Sent</option>
                <option value="received">Received</option>
              </select>
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
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          {filteredTransactions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#737373'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                No transactions found
              </h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  onClick={() => setSelectedTransaction(transaction)}
                  style={{
                    padding: '1.5rem',
                    border: '1px solid #e5e5e5',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    animation: `fadeIn ${0.1 + index * 0.05}s ease-out`
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0px)';
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
                      {getTransactionIcon(transaction.type, transaction.status)}
                    </div>

                    <div style={{ flex: '1' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.25rem'
                      }}>
                        <h3 style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: '#171717',
                          margin: '0'
                        }}>
                          {transaction.description}
                        </h3>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: getTransactionColor(transaction.type),
                            margin: '0'
                          }}>
                            {transaction.type === 'received' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </div>
                          <div style={{
                            display: 'inline-block',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '12px',
                            background: transaction.status === 'completed' ? '#f0fdf4' : 
                                       transaction.status === 'pending' ? '#fffbeb' : '#fef2f2',
                            color: getStatusColor(transaction.status),
                            fontSize: '0.625rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            marginTop: '0.25rem'
                          }}>
                            {transaction.status}
                          </div>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <p style={{
                            color: '#737373',
                            margin: '0',
                            fontSize: '0.875rem'
                          }}>
                            {transaction.type === 'received' ? 'From: ' : 'To: '}
                            {transaction.other_party_email}
                          </p>
                        </div>
                        <p style={{
                          color: '#737373',
                          margin: '0',
                          fontSize: '0.875rem'
                        }}>
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transaction Modal */}
        {selectedTransaction && (
          <TransactionModal
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
          />
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 640px) {
          [style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Transactions;