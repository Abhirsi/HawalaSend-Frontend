import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [sendAmount, setSendAmount] = useState('');
  const [currency, setCurrency] = useState('CAD');
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const exchangeRates = {
    CAD: 130,
    USD: 150
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/transactions');
        if (!response.ok) throw new Error('Failed to fetch transactions');
        const data = await response.json();
        setTransactions(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingTransactions(false);
      }
    };
    fetchTransactions();
  }, []);

  const calculateFee = (amount) => {
    if (!amount || amount <= 0) return 0;
    if (transactions.length < 5) return 0; // promo: free first 5 transfers
    return Math.min(amount * 0.005, 1.0); // 0.5% fee, max $1
  };

  const calculateReceiveAmount = () => {
    if (!sendAmount || isNaN(sendAmount)) return 0;
    const fee = calculateFee(Number(sendAmount));
    const netAmount = Number(sendAmount) - fee;
    return netAmount * exchangeRates[currency];
  };

  const handleSend = () => {
    navigate('/transfers');
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>HawalaSend</h1>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <img src="/avatar.png" alt="User" style={{ width: 40, borderRadius: '50%' }} />
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '0.5rem',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              padding: '0.75rem',
              zIndex: 20
            }}>
              <button onClick={() => navigate('/profile')} style={{ display: 'block', padding: '0.5rem 1rem', width: '100%' }}>Profile</button>
              <button onClick={logout} style={{ display: 'block', padding: '0.5rem 1rem', width: '100%', color: '#d32f2f' }}>Logout</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Welcome Back */}
        <div style={{
          background: 'linear-gradient(135deg, #d32f2f 0%, #2e7d32 50%, #1976d2 100%)',
          borderRadius: '20px',
          padding: '2.5rem',
          marginBottom: '2rem',
          color: 'white',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          transition: 'transform 0.3s ease',
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Welcome back, {currentUser?.email || 'User'} 👋</h2>
          <p style={{ marginTop: '0.5rem', fontSize: '1.1rem', opacity: 0.9 }}>
            Send money securely from Canada to Kenya in minutes.
          </p>
          <button
            onClick={handleSend}
            style={{
              marginTop: '1.5rem',
              backgroundColor: 'white',
              color: '#d32f2f',
              padding: '0.8rem 2rem',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Send Money Now
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Transfer Calculator */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e293b' }}>
              Transfer Calculator
            </h3>
            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '500' }}>You Send</label>
            <input
              type="number"
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              placeholder="Enter amount"
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                marginBottom: '1rem'
              }}
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                marginBottom: '1rem'
              }}
            >
              <option value="CAD">CAD</option>
              <option value="USD">USD</option>
            </select>

            <div style={{ marginTop: '1rem', fontSize: '1rem', color: '#1e293b' }}>
              <p>Exchange Rate: 1 {currency} = {exchangeRates[currency]} KES</p>
              <p>Fee: {calculateFee(Number(sendAmount)).toFixed(2)} {currency}</p>
              <p style={{ fontWeight: '600' }}>They Receive: {calculateReceiveAmount().toFixed(2)} KES</p>
            </div>

            <button
              onClick={handleSend}
              style={{
                marginTop: '1.5rem',
                backgroundColor: '#d32f2f',
                color: 'white',
                padding: '0.8rem 2rem',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                width: '100%',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              Send Money Now
            </button>
          </div>

          {/* Recent Transactions */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e293b' }}>
              Recent Transactions
            </h3>
            {loadingTransactions && <p>Loading transactions...</p>}
            {error && <p style={{ color: '#d32f2f' }}>{error}</p>}
            {!loadingTransactions && !error && transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} style={{
                padding: '1rem',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#1e293b' }}>
                  To: {transaction.recipient_first_name
                        ? `${transaction.recipient_first_name} ${transaction.recipient_last_name || ''}`
                        : transaction.recipient_email}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {new Date(transaction.created_at).toLocaleDateString()} - {transaction.amount} {transaction.currency}
                </div>
                <div style={{
                  marginTop: '0.25rem',
                  color: transaction.status === 'completed' ? '#2e7d32' : transaction.status === 'pending' ? '#f9a825' : '#d32f2f',
                  fontSize: '0.85rem'
                }}>
                  {transaction.status}
                </div>
              </div>
            ))}
            <button
              onClick={() => navigate('/transactions')}
              style={{
                marginTop: '1.5rem',
                backgroundColor: '#1976d2',
                color: 'white',
                padding: '0.8rem 2rem',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                width: '100%',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              View All
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          {[
            { icon: '🔒', title: 'Bank-Level Security', desc: 'Your transfers are encrypted and safe' },
            { icon: '⚡', title: 'Fast Transfers', desc: 'Money delivered within minutes' },
            { icon: '🏛️', title: 'Licensed Service', desc: 'Trusted and compliant' },
          ].map((item, idx) => (
            <div key={idx} style={{
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              transition: 'transform 0.3s ease',
            }}>
              <div style={{ fontSize: '2rem' }}>{item.icon}</div>
              <h4 style={{ marginTop: '0.5rem', fontWeight: '700', color: '#1e293b' }}>{item.title}</h4>
              <p style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: '#64748b' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
