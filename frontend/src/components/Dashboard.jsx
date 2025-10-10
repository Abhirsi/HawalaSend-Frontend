import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transactionAPI } from '../api';

const SENDING_COUNTRIES = [
  { code: 'CAD', name: 'Canada', flag: 'https://flagcdn.com/w40/ca.png', rates: { KES: 110.45, SOS: 862.50, UGX: 5234.00, ETB: 178.30 } },
  { code: 'USD', name: 'USA', flag: 'https://flagcdn.com/w40/us.png', rates: { KES: 150.25, SOS: 1173.00, UGX: 7115.00, ETB: 242.50 } },
  { code: 'GBP', name: 'UK', flag: 'https://flagcdn.com/w40/gb.png', rates: { KES: 185.50, SOS: 1448.00, UGX: 8780.00, ETB: 299.40 } },
  { code: 'EUR', name: 'Euro', flag: 'https://flagcdn.com/w40/eu.png', rates: { KES: 162.30, SOS: 1267.00, UGX: 7678.00, ETB: 261.90 } },
  { code: 'CHF', name: 'Switzerland', flag: 'https://flagcdn.com/w40/ch.png', rates: { KES: 168.75, SOS: 1317.00, UGX: 7985.00, ETB: 272.30 } },
  { code: 'SEK', name: 'Sweden', flag: 'https://flagcdn.com/w40/se.png', rates: { KES: 14.20, SOS: 110.90, UGX: 672.00, ETB: 22.90 } },
  { code: 'NOK', name: 'Norway', flag: 'https://flagcdn.com/w40/no.png', rates: { KES: 13.85, SOS: 108.10, UGX: 655.00, ETB: 22.35 } },
  { code: 'DKK', name: 'Denmark', flag: 'https://flagcdn.com/w40/dk.png', rates: { KES: 21.75, SOS: 169.80, UGX: 1029.00, ETB: 35.10 } }
];

const RECEIVING_COUNTRIES = [
  { code: 'KES', name: 'Kenya', flag: 'https://flagcdn.com/w40/ke.png' },
  { code: 'SOS', name: 'Somalia', flag: 'https://flagcdn.com/w40/so.png' },
  { code: 'UGX', name: 'Uganda', flag: 'https://flagcdn.com/w40/ug.png' },
  { code: 'ETB', name: 'Ethiopia', flag: 'https://flagcdn.com/w40/et.png' }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculator state
  const [sendAmount, setSendAmount] = useState('100');
  const [fromCountry, setFromCountry] = useState(SENDING_COUNTRIES[0]);
  const [toCountry, setToCountry] = useState(RECEIVING_COUNTRIES[0]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const currentRate = fromCountry.rates[toCountry.code];
  const receiveAmount = (parseFloat(sendAmount) || 0) * currentRate;
  const transferFee = transactions.length >= 5 ? Math.min((parseFloat(sendAmount) || 0) * 0.005, 1) : 0;
  const totalCost = (parseFloat(sendAmount) || 0) + transferFee;

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
      const response = await transactionAPI.getHistory();
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      if (error.response?.status === 401) {
        setError('Session expired, please log in again');
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

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (value.split('.').length <= 2) {
      setSendAmount(value);
    }
  };

  const formatCurrency = (amount, currency) => {
    const num = parseFloat(amount) || 0;
    if (currency === 'KES' || currency === 'SOS' || currency === 'UGX' || currency === 'ETB') {
      return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
    }
    return `${num.toFixed(2)} ${currency}`;
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div
        style={{
          paddingTop: '80px',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '100px 20px 40px',
        }}
      >
        {/* Hero Section */}
        <div
          style={{
            background: 'url("/HawaSend-logo.svg") no-repeat right bottom / 180px, linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '20px',
            padding: '50px 40px',
            color: 'white',
            marginBottom: '50px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            textAlign: 'left',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>
            Welcome back, {currentUser?.username || currentUser?.email?.split('@')[0]} 👋
          </h1>
          <p style={{ margin: '15px 0 0 0', fontSize: '1.2rem', opacity: 0.95 }}>
            Send money internationally safely & instantly.
            <br />
            {transactions.length < 5
              ? `${5 - transactions.length} free transfers remaining 🎉`
              : 'Low fee: Only 0.5% capped at $1'}
          </p>
        </div>

        {/* Transfer Calculator */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '30px',
            marginBottom: '40px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
          }}
        >
          <h2 style={{ margin: '0 0 25px 0', fontSize: '1.5rem', color: '#1f2937', textAlign: 'center' }}>
            💱 Transfer Calculator
          </h2>

          {/* Calculator Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
              gap: '20px',
              marginBottom: '20px',
            }}
          >
            {/* Send Input */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#6b7280', fontSize: '0.875rem' }}>
                You Send
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  inputMode="decimal"
                  value={sendAmount}
                  onChange={handleAmountChange}
                  placeholder="100"
                  style={{
                    flex: 1,
                    padding: '14px',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'border 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFromDropdown(!showFromDropdown);
                      setShowToDropdown(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '14px 16px',
                      fontSize: '1rem',
                      fontWeight: '700',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      minWidth: '120px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#667eea'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    <img src={fromCountry.flag} alt={fromCountry.name} width="24" height="18" style={{ borderRadius: '2px' }} />
                    <span>{fromCountry.code}</span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>▼</span>
                  </button>

                  {showFromDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '8px',
                      background: 'white',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                      zIndex: 1000,
                      minWidth: '220px',
                      maxHeight: '320px',
                      overflowY: 'auto'
                    }}>
                      {SENDING_COUNTRIES.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setFromCountry(country);
                            setShowFromDropdown(false);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            border: 'none',
                            background: fromCountry.code === country.code ? '#f0f9ff' : 'white',
                            cursor: 'pointer',
                            transition: 'background 0.2s ease',
                            textAlign: 'left',
                            borderBottom: '1px solid #f3f4f6'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                          onMouseOut={(e) => e.currentTarget.style.background = fromCountry.code === country.code ? '#f0f9ff' : 'white'}
                        >
                          <img src={country.flag} alt={country.name} width="28" height="21" style={{ borderRadius: '3px' }} />
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '0.9375rem', color: '#111827' }}>{country.name}</div>
                            <div style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>{country.code}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Receive */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#6b7280', fontSize: '0.875rem' }}>
                They Receive
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div
                  style={{
                    flex: 1,
                    padding: '14px',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    border: '2px solid #86efac',
                    borderRadius: '12px',
                    backgroundColor: '#f0fdf4',
                    color: '#15803d'
                  }}
                >
                  {receiveAmount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowToDropdown(!showToDropdown);
                      setShowFromDropdown(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '14px 16px',
                      fontSize: '1rem',
                      fontWeight: '700',
                      border: '2px solid #86efac',
                      borderRadius: '12px',
                      background: '#f0fdf4',
                      color: '#15803d',
                      cursor: 'pointer',
                      minWidth: '120px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#15803d'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#86efac'}
                  >
                    <img src={toCountry.flag} alt={toCountry.name} width="24" height="18" style={{ borderRadius: '2px' }} />
                    <span>{toCountry.code}</span>
                    <span style={{ fontSize: '0.75rem' }}>▼</span>
                  </button>

                  {showToDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '8px',
                      background: 'white',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                      zIndex: 1000,
                      minWidth: '220px'
                    }}>
                      {RECEIVING_COUNTRIES.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setToCountry(country);
                            setShowToDropdown(false);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            border: 'none',
                            background: toCountry.code === country.code ? '#f0fdf4' : 'white',
                            cursor: 'pointer',
                            transition: 'background 0.2s ease',
                            textAlign: 'left',
                            borderBottom: '1px solid #f3f4f6'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                          onMouseOut={(e) => e.currentTarget.style.background = toCountry.code === country.code ? '#f0fdf4' : 'white'}
                        >
                          <img src={country.flag} alt={country.name} width="28" height="21" style={{ borderRadius: '3px' }} />
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '0.9375rem', color: '#111827' }}>{country.name}</div>
                            <div style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>{country.code}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          {sendAmount && (
            <div
              style={{
                backgroundColor: '#f1f5f9',
                padding: '18px',
                borderRadius: '12px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#6b7280' }}>Amount:</span>
                <span style={{ fontWeight: '600' }}>{formatCurrency(sendAmount, fromCountry.code)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#6b7280' }}>Fee:</span>
                <span style={{ color: transferFee === 0 ? '#10b981' : '#111827', fontWeight: '600' }}>
                  {transferFee === 0 ? 'FREE' : formatCurrency(transferFee, fromCountry.code)}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '2px solid #cbd5e1',
                  fontWeight: '700',
                  fontSize: '1.1rem'
                }}
              >
                <span>Total Cost:</span>
                <span style={{ color: '#667eea' }}>{formatCurrency(totalCost, fromCountry.code)}</span>
              </div>
              <div style={{ marginTop: '12px', fontSize: '0.875rem', color: '#6b7280', textAlign: 'center' }}>
                Exchange Rate: 1 {fromCountry.code} = {currentRate.toFixed(2)} {toCountry.code}
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/transfer')}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.0625rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }}
          >
            Send Money Now
          </button>
        </div>

        {/* Recent Transactions */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '30px',
            marginBottom: '40px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Recent Transactions</h2>
            {transactions.length > 5 && (
              <button
                onClick={() => navigate('/transactions')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              >
                View All
              </button>
            )}
          </div>
          {loading && <p style={{ textAlign: 'center', color: '#6b7280' }}>Loading...</p>}
          {error && <p style={{ textAlign: 'center', color: '#ef4444' }}>{error}</p>}
          {!loading && !error && transactions.length === 0 && (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0' }}>
              No transactions yet. Start your first transfer!
            </p>
          )}
          {!loading &&
            !error &&
            transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                style={{
                  padding: '20px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    To: {tx.recipient_name || tx.recipient_email}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{formatDate(tx.created_at)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px' }}>
                    {formatCurrency(tx.amount, tx.from_currency)}
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      backgroundColor: getStatusColor(tx.status) + '20',
                      color: getStatusColor(tx.status),
                    }}
                  >
                    {tx.status?.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Trust Indicators */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: window.innerWidth > 768 ? 'repeat(3, 1fr)' : '1fr', 
          gap: '20px' 
        }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '25px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔒</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.125rem' }}>Bank-Level Security</h3>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>256-bit encryption protects your data</p>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '25px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚡</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.125rem' }}>Lightning Fast</h3>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>Money delivered in minutes</p>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '25px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏛️</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.125rem' }}>Licensed & Insured</h3>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>Regulated money service business</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;