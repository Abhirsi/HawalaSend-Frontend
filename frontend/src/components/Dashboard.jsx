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
  
  // Calculator state - CAD to KES only
  const [sendAmount, setSendAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const CAD_TO_KES_RATE = 96.50; // Your current rate
  const TRANSFER_FEE_PERCENT = 0.025; // 2.5%
  const FLAT_FEE = 2.00; // $2 CAD

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchTransactions();
  }, [currentUser, navigate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await transferAPI.getHistory();
      console.log('Transaction API response:', response.data); // Debug log
      
      const txData = response.data.transactions || [];
      setTransactions(txData);
      
      if (txData.length === 0) {
        console.log('No transactions found for this user');
      }
      
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setError('Unable to load transaction history');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate receive amount when send amount changes
  useEffect(() => {
    if (sendAmount && !isNaN(sendAmount)) {
      const amount = parseFloat(sendAmount);
      const fee = (amount * TRANSFER_FEE_PERCENT) + FLAT_FEE;
      const total = amount + fee;
      const kesAmount = amount * CAD_TO_KES_RATE;
      
      setReceiveAmount(kesAmount.toFixed(2));
    } else {
      setReceiveAmount('');
    }
  }, [sendAmount]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatCurrency = (amount, currency) => {
    const num = parseFloat(amount) || 0;
    if (currency === 'KES') {
      return `KSh ${num.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${num.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CAD`;
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

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingTop: '80px' }}>
      {/* Welcome Section */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 20px 40px',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '40px',
          color: 'white',
          marginBottom: '40px',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem' }}>
            Welcome back, {currentUser?.username || currentUser?.email}!
          </h1>
          <p style={{ margin: 0, opacity: 0.9 }}>
            Send money from Canada to Kenya instantly with low fees
          </p>
        </div>

        {/* Transfer Calculator */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '40px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.5rem' }}>Transfer Calculator</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                You Send
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '12px 60px 12px 12px',
                    fontSize: '1.1rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontWeight: '600',
                  color: '#64748b'
                }}>CAD</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Recipient Gets
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={receiveAmount}
                  readOnly
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '12px 60px 12px 12px',
                    fontSize: '1.1rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    outline: 'none'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontWeight: '600',
                  color: '#64748b'
                }}>KES</span>
              </div>
            </div>
          </div>

          {sendAmount && (
            <div style={{
              backgroundColor: '#f1f5f9',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Transfer Amount:</span>
                <span style={{ fontWeight: '600' }}>{formatCurrency(sendAmount, 'CAD')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Fee (2.5% + $2):</span>
                <span style={{ fontWeight: '600' }}>
                  {formatCurrency((parseFloat(sendAmount) * TRANSFER_FEE_PERCENT) + FLAT_FEE, 'CAD')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #cbd5e1' }}>
                <span style={{ fontWeight: '600' }}>Total Cost:</span>
                <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#667eea' }}>
                  {formatCurrency(parseFloat(sendAmount) + (parseFloat(sendAmount) * TRANSFER_FEE_PERCENT) + FLAT_FEE, 'CAD')}
                </span>
              </div>
              <div style={{ marginTop: '12px', fontSize: '0.9rem', color: '#64748b' }}>
                Exchange Rate: 1 CAD = {CAD_TO_KES_RATE} KES
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/transfers')}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#5568d3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#667eea'}
          >
            Send Money Now
          </button>
        </div>

        {/* Recent Transactions */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.5rem' }}>Recent Transactions</h2>

          {loading && (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>Loading transactions...</p>
          )}

          {error && (
            <div style={{
              padding: '20px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          {!loading && !error && transactions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>No transactions yet</p>
              <p style={{ fontSize: '0.9rem' }}>Your transfer history will appear here</p>
            </div>
          )}

          {!loading && !error && transactions.length > 0 && (
            <div>
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    padding: '20px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                      To: {tx.recipient_name || tx.recipient_email}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                      {formatDate(tx.created_at)}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '5px' }}>
                      {formatCurrency(tx.amount, tx.from_currency)}
                    </div>
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      backgroundColor: getStatusColor(tx.status) + '20',
                      color: getStatusColor(tx.status)
                    }}>
                      {getStatusText(tx.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;