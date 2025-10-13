import React, { useState } from 'react';

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

const CalculatorSection = ({ onGetStarted }) => {
  const [sendAmount, setSendAmount] = useState('100');
  const [fromCountry, setFromCountry] = useState(SENDING_COUNTRIES[0]);
  const [toCountry, setToCountry] = useState(RECEIVING_COUNTRIES[0]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const currentRate = fromCountry.rates[toCountry.code];
  const receiveAmount = (parseFloat(sendAmount) || 0) * currentRate;

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (value.split('.').length <= 2) {
      setSendAmount(value);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto 60px auto',
      background: 'white',
      borderRadius: '24px',
      padding: window.innerWidth > 768 ? '40px' : '28px',
      boxShadow: '0 25px 70px rgba(0, 0, 0, 0.3)'
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1f2937',
        margin: '0 0 24px 0',
        textAlign: 'center'
      }}>
        💱 Live Exchange Rate Calculator
      </h2>

      {/* From Section */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#6b7280',
          marginBottom: '8px'
        }}>
          You send
        </label>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 140px',
          gap: '12px'
        }}>
          <input
            type="text"
            inputMode="decimal"
            value={sendAmount}
            onChange={handleAmountChange}
            style={{
              width: '100%',
              padding: '16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '1.5rem',
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
                gap: '8px',
                padding: '16px 14px',
                background: '#f9fafb',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%',
                fontSize: '1rem',
                fontWeight: '700'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#667eea'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
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
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
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
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.9375rem', color: '#111827' }}>{country.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{country.code}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* To Section */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#6b7280',
          marginBottom: '8px'
        }}>
          They receive
        </label>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 140px',
          gap: '12px'
        }}>
          <div style={{
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '2px solid #86efac',
            borderRadius: '12px',
            fontSize: '1.5rem',
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
                gap: '8px',
                padding: '16px 14px',
                background: '#f0fdf4',
                border: '2px solid #86efac',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%',
                fontSize: '1rem',
                fontWeight: '700',
                color: '#15803d'
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
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
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
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.9375rem', color: '#111827' }}>{country.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{country.code}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{
        padding: '16px',
        background: '#f9fafb',
        borderRadius: '12px',
        fontSize: '0.875rem',
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: '1.6',
        marginBottom: '24px'
      }}>
        <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '6px', color: '#111827' }}>
          1 {fromCountry.code} = {currentRate.toFixed(2)} {toCountry.code}
        </div>
        <div style={{ fontWeight: '700', color: '#10b981', fontSize: '0.9375rem' }}>
          ✨ Zero Fees • ⚡ Arrives Instantly
        </div>
      </div>

      <button
        onClick={onGetStarted}
        style={{
          width: '100%',
          padding: '16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '1.125rem',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.5)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
        }}
      >
        Get Started - Send Money Now
      </button>
    </div>
  );
};

export default CalculatorSection;