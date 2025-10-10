import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Calculator state
  const [sendAmount, setSendAmount] = useState('100');
  const [fromCountry, setFromCountry] = useState(SENDING_COUNTRIES[0]);
  const [toCountry, setToCountry] = useState(RECEIVING_COUNTRIES[0]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const currentRate = fromCountry.rates[toCountry.code];
  const receiveAmount = (parseFloat(sendAmount) || 0) * currentRate;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (value.split('.').length <= 2) {
      setSendAmount(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError('Google Sign-In coming soon!');
    setTimeout(() => setError(''), 3000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      margin: '-16px -24px'
    }}>
      
      {/* Logo Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          background: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto',
          fontSize: '3.5rem',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25)'
        }}>
          🦜
        </div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          color: 'white',
          margin: '0 0 0.5rem 0',
          letterSpacing: '-1px',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
        }}>
          TapTap Send
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.95)',
          margin: 0,
          fontSize: '1.125rem',
          fontWeight: '500'
        }}>
          Send money home in seconds
        </p>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '500px'
      }}>

        {/* Calculator Card */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <h3 style={{
            fontSize: '0.9375rem',
            fontWeight: '700',
            color: '#6b7280',
            margin: '0 0 1.5rem 0',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            textAlign: 'center'
          }}>
            💱 Calculate Transfer
          </h3>

          {/* From Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              fontSize: '0.8125rem',
              fontWeight: '600',
              color: '#9ca3af',
              marginBottom: '0.625rem'
            }}>
              You send
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '0.75rem'
            }}>
              <input
                type="text"
                inputMode="decimal"
                value={sendAmount}
                onChange={handleAmountChange}
                style={{
                  width: '100%',
                  padding: '1.125rem 1.25rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: '#111827',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
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
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '1.125rem 1rem',
                    background: '#f9fafb',
                    border: '2px solid #e5e7eb',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    minWidth: '130px',
                    height: '100%'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = '#667eea'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                >
                  <img 
                    src={fromCountry.flag} 
                    alt={fromCountry.name}
                    width="24"
                    height="18"
                    style={{ borderRadius: '2px' }}
                  />
                  <span style={{ fontWeight: '700', fontSize: '1rem', color: '#374151' }}>
                    {fromCountry.code}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>▼</span>
                </button>

                {showFromDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                    zIndex: 1000,
                    minWidth: '240px',
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
                          gap: '0.875rem',
                          padding: '1rem 1.25rem',
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
                        <img 
                          src={country.flag} 
                          alt={country.name}
                          width="28"
                          height="21"
                          style={{ borderRadius: '3px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', fontSize: '0.9375rem', color: '#111827' }}>
                            {country.name}
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>
                            {country.code}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* To Section */}
          <div>
            <div style={{
              fontSize: '0.8125rem',
              fontWeight: '600',
              color: '#9ca3af',
              marginBottom: '0.625rem'
            }}>
              They receive
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '0.75rem'
            }}>
              <div style={{
                width: '100%',
                padding: '1.125rem 1.25rem',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: '2px solid #86efac',
                borderRadius: '16px',
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#15803d',
                boxSizing: 'border-box'
              }}>
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
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '1.125rem 1rem',
                    background: '#f0fdf4',
                    border: '2px solid #86efac',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    minWidth: '130px',
                    height: '100%'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = '#15803d'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = '#86efac'}
                >
                  <img 
                    src={toCountry.flag} 
                    alt={toCountry.name}
                    width="24"
                    height="18"
                    style={{ borderRadius: '2px' }}
                  />
                  <span style={{ fontWeight: '700', fontSize: '1rem', color: '#15803d' }}>
                    {toCountry.code}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#15803d' }}>▼</span>
                </button>

                {showToDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                    zIndex: 1000,
                    minWidth: '240px'
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
                          gap: '0.875rem',
                          padding: '1rem 1.25rem',
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
                        <img 
                          src={country.flag} 
                          alt={country.name}
                          width="28"
                          height="21"
                          style={{ borderRadius: '3px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', fontSize: '0.9375rem', color: '#111827' }}>
                            {country.name}
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>
                            {country.code}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '1.5rem',
            padding: '1.125rem',
            background: '#f9fafb',
            borderRadius: '14px',
            fontSize: '0.8125rem',
            color: '#6b7280',
            textAlign: 'center',
            lineHeight: '1.6'
          }}>
            <div style={{ fontWeight: '600' }}>
              Exchange rate: 1 {fromCountry.code} = {currentRate.toFixed(2)} {toCountry.code}
            </div>
            <div style={{ fontWeight: '700', color: '#15803d', marginTop: '0.375rem' }}>
              Fee: {fromCountry.code} $0.00 • Arrives instantly ⚡
            </div>
          </div>
        </div>

        {/* Login/Signup Buttons - Show if form not visible */}
        {!showLoginForm && (
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem'
          }}>
            <button
              onClick={() => setShowLoginForm(true)}
              style={{
                padding: '1rem',
                background: 'white',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: '14px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f0f9ff';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              LOG IN
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
              }}
            >
              SIGN UP
            </button>
          </div>
        )}

        {/* Login Form - Show when button clicked */}
        {showLoginForm && (
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '2px solid #fecaca',
                borderRadius: '14px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <span style={{ fontSize: '1.375rem' }}>⚠️</span>
                <span style={{ color: '#dc2626', fontSize: '0.9375rem', fontWeight: '600' }}>
                  {error}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '14px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '14px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ 
                textAlign: 'right', 
                marginBottom: '1.75rem'
              }}>
                <Link
                  to="/forgot-password"
                  style={{
                    color: '#667eea',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}
                  onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1.125rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '1.0625rem',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                  marginBottom: '1.25rem'
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                  }
                }}
              >
                {loading ? 'Signing in...' : 'LOG IN'}
              </button>
            </form>

            <div style={{
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: '0.875rem',
              margin: '1.25rem 0',
              fontWeight: '600'
            }}>
              Or
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                background: 'white',
                color: '#374151',
                border: '2px solid #e5e7eb',
                borderRadius: '14px',
                fontSize: '0.9375rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.875rem',
                marginBottom: '1.75rem'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
                <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
                <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05"/>
                <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
              </svg>
              CONTINUE WITH GOOGLE
            </button>

            <div style={{
              textAlign: 'center',
              fontSize: '0.9375rem',
              color: '#6b7280',
              marginBottom: '1rem'
            }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{
                  color: '#667eea',
                  fontWeight: '700',
                  textDecoration: 'none'
                }}
                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
              >
                Sign up
              </Link>
            </div>

            <button
              onClick={() => setShowLoginForm(false)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'transparent',
                color: '#9ca3af',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.color = '#6b7280';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              ← Back to calculator
            </button>
          </div>
        )}

        {/* Footer Spacing */}
        <div style={{ paddingBottom: '1rem' }} />
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Login;