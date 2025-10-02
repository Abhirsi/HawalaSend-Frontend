import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transferAPI } from '../api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, refreshAuth, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Calculator state
  const [sendAmount, setSendAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [sendCurrency, setSendCurrency] = useState('CAD');
  const [totalCost, setTotalCost] = useState(0);
  const [transferFee, setTransferFee] = useState(0);
  
  // Exchange rates
  const EXCHANGE_RATES = {
    'CAD': 130,  // CAD to KES
    'USD': 150   // USD to KES
  };

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
      await refreshAuth();

      const response = await transferAPI.getHistory();
      console.log('Transaction API response:', response.data);
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      if (error.response?.status === 401) {
        setError('Session expired, please log in again');
        navigate('/login'); 
      } else if (error.message === 'Network Error') {
        setError('Network error. Check your connection.');
      } else {
        setError('Unable to load transactions');
      }

      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateFee = (amount) => {
    const txCount = transactions.length;
    if (txCount < 5) {
      return 0; // Free for first 5 transfers
    }
    // 0.5% fee capped at $1
    const fee = amount * 0.005;
    return Math.min(fee, 1);
  };

  useEffect(() => {
    if (sendAmount && !isNaN(sendAmount)) {
      const amount = parseFloat(sendAmount);
      const fee = calculateFee(amount);
      const rate = EXCHANGE_RATES[sendCurrency];
      
      setTransferFee(fee);
      setTotalCost(amount + fee);
      setReceiveAmount((amount * rate).toFixed(2));
    } else {
      setReceiveAmount('');
      setTransferFee(0);
      setTotalCost(0);
    }
  }, [sendAmount, sendCurrency, transactions.length]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatCurrency = (amount, currency) => {
    const num = parseFloat(amount) || 0;
    if (currency === 'KES') {
      return `KSh ${num.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
    }
    return `$${num.toFixed(2)} ${currency}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      {/* Main Content */}
      <div style={{ paddingTop: '80px', maxWidth: '1200px', margin: '0 auto', padding: '100px 20px 40px' }}>
        
        {/* Welcome Box - Red/Green/Blue Gradient */}
        <div style={{
          background: 'linear-gradient(135deg, #e74c3c 0%, #27ae60 50%, #3498db 100%)',
          borderRadius: '16px',
          padding: '40px',
          color: 'white',
          marginBottom: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          animation: 'fadeIn 0.5s ease-in'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem' }}>
            Welcome back, {currentUser?.username || currentUser?.email?.split('@')[0]}!
          </h1>
          <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.95 }}>
            Send money from Canada to Kenya with the lowest fees. {transactions.length < 5 ? `${5 - transactions.length} free transfers remaining!` : 'Only 0.5% fee ($1 max)'}
          </p>
        </div>

        {/* Transfer Calculator */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '40px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          animation: 'fadeIn 0.6s ease-in'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.5rem' }}>Transfer Calculator</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>You Send</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="0.00"
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '1.1rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                />
                <select
                  value={sendCurrency}
                  onChange={(e) => setSendCurrency(e.target.value)}
                  style={{
                    padding: '12px',
                    fontSize: '1rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="CAD">CAD</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>They Receive</label>
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
                <span style={{ color: '#64748b' }}>Amount:</span>
                <span style={{ fontWeight: '600' }}>{formatCurrency(sendAmount, sendCurrency)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Fee:</span>
                <span style={{ fontWeight: '600', color: transferFee === 0 ? '#10b981' : '#64748b' }}>
                  {transferFee === 0 ? 'FREE' : formatCurrency(transferFee, sendCurrency)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #cbd5e1' }}>
                <span style={{ fontWeight: '600' }}>Total Cost:</span>
                <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#667eea' }}>
                  {formatCurrency(totalCost, sendCurrency)}
                </span>
              </div>
              <div style={{ marginTop: '12px', fontSize: '0.9rem', color: '#64748b' }}>
                Exchange Rate: 1 {sendCurrency} = {EXCHANGE_RATES[sendCurrency]} KES
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/transfer')}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Send Money Now
          </button>
        </div>

        {/* Recent Transactions */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '40px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          animation: 'fadeIn 0.7s ease-in'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Recent Transactions</h2>
            {transactions.length > 5 && (
              <button
                onClick={() => navigate('/transactions')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                View All
              </button>
            )}
          </div>

          {loading && <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading...</p>}
          {error && <p style={{ textAlign: 'center', padding: '20px', color: '#ef4444' }}>{error}</p>}

          {!loading && !error && transactions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>No transactions yet</p>
              <p style={{ fontSize: '0.9rem' }}>Start sending money to see your history</p>
            </div>
          )}

          {!loading && !error && transactions.slice(0, 5).map((tx) => (
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
                  {tx.status?.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '25px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔒</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>Bank-Level Security</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
              256-bit encryption protects your data
            </p>
          </div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '25px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⚡</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>Lightning Fast</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
              Money delivered in minutes
            </p>
          </div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '25px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🏛️</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>Licensed & Insured</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
              Regulated money service business
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;