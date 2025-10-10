import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transferAPI } from '../api';

// InputField component - MUST be outside main component
const InputField = React.memo(({ label, error, ...props }) => {
  const inputRef = React.useRef(null);
  
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '0.5rem',
        letterSpacing: '0.01em'
      }}>
        {label}
      </label>
      <input
        ref={inputRef}
        {...props}
        autoComplete="off"
        style={{
          width: '100%',
          padding: '0.875rem 1rem',
          border: `2px solid ${error ? '#ef4444' : '#e5e7eb'}`,
          borderRadius: '12px',
          fontSize: '1rem',
          transition: 'all 0.2s ease',
          outline: 'none',
          boxSizing: 'border-box',
          backgroundColor: 'white',
          ...props.style
        }}
        onFocus={(e) => {
          if (!error) e.target.style.borderColor = '#667eea';
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          if (!error) e.target.style.borderColor = '#e5e7eb';
          props.onBlur?.(e);
        }}
      />
      {error && (
        <span style={{ 
          color: '#ef4444', 
          fontSize: '0.75rem', 
          marginTop: '0.375rem', 
          display: 'block',
          fontWeight: '500'
        }}>
          {error}
        </span>
      )}
    </div>
  );
});

const Transfers = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [transferData, setTransferData] = useState({
    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
    amount: '',
    fromCurrency: 'CAD',
    toCurrency: 'KES',
    notes: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    pin: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [transferResult, setTransferResult] = useState(null);

  const EXCHANGE_RATES = useMemo(() => ({
    'CAD-KES': 110.45,
    'USD-KES': 150.25
  }), []);

  const FEE_PERCENTAGE = 0.025;
  const FIXED_FEE = 2.00;

  const getCurrencySymbol = useCallback((currency) => {
    return { CAD: 'C$', USD: '$', KES: 'KSh' }[currency] || '$';
  }, []);

  const getFlag = useCallback((currency) => {
    const flags = {
      CAD: 'https://flagcdn.com/w40/ca.png',
      USD: 'https://flagcdn.com/w40/us.png',
      KES: 'https://flagcdn.com/w40/ke.png'
    };
    return flags[currency];
  }, []);

  const calculateReceiveAmount = useCallback(() => {
    const amount = parseFloat(transferData.amount) || 0;
    const rateKey = `${transferData.fromCurrency}-${transferData.toCurrency}`;
    const rate = EXCHANGE_RATES[rateKey] || 110.45;
    return (amount * rate).toFixed(2);
  }, [transferData.amount, transferData.fromCurrency, transferData.toCurrency, EXCHANGE_RATES]);

  const calculateFee = useCallback(() => {
  return '0.00';
}, []);

const calculateTotal = useCallback(() => {
  const amount = parseFloat(transferData.amount) || 0;
  return amount.toFixed(2);
}, [transferData.amount]);

  const handleSwapCurrency = useCallback(() => {
    setTransferData(prev => ({
      ...prev,
      fromCurrency: prev.fromCurrency === 'CAD' ? 'USD' : 'CAD'
    }));
  }, []);

  const formatPhoneNumber = (phone) => {
    // Remove all non-numeric characters except +
    let cleaned = phone.replace(/[^0-9+]/g, '');
    
    // If starts with 0, replace with +254
    if (cleaned.startsWith('0')) {
      cleaned = '+254' + cleaned.slice(1);
    }
    // If starts with 254 without +, add +
    else if (cleaned.startsWith('254') && !cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    // If doesn't start with + and has digits, assume Kenya
    else if (!cleaned.startsWith('+') && cleaned.length > 0) {
      cleaned = '+254' + cleaned;
    }
    
    return cleaned;
  };

  const verifyPhone = async () => {
    const phone = formatPhoneNumber(transferData.recipientPhone);
    
    if (phone.length < 12) {
      setValidationErrors(prev => ({ ...prev, recipientPhone: 'Invalid phone number format' }));
      return;
    }

    setVerifyingPhone(true);
    setValidationErrors(prev => ({ ...prev, recipientPhone: '' }));

    try {
      // Mock M-Pesa verification - replace with actual API call
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          // Simulate verification response
          const isRegistered = Math.random() > 0.3; // 70% success rate for demo
          resolve({
            data: {
              registered: isRegistered,
              data: isRegistered ? {
                firstName: 'John',
                lastName: 'Doe',
                mpesaId: phone,
                phone: phone
              } : null
            }
          });
        }, 1500);
      });

      if (response.data.registered) {
        setPhoneVerified(true);
        setTransferData(prev => ({
          ...prev,
          recipientPhone: phone,
          recipientName: `${response.data.data.firstName} ${response.data.data.lastName}`,
          recipientEmail: response.data.data.email || ''
        }));
        setValidationErrors(prev => ({ ...prev, recipientPhone: '' }));
      } else {
        setPhoneVerified(false);
        setValidationErrors(prev => ({ 
          ...prev, 
          recipientPhone: 'Phone not registered for M-Pesa. Please verify the number.' 
        }));
      }
    } catch (error) {
      setValidationErrors(prev => ({ 
        ...prev, 
        recipientPhone: 'Verification failed. Please try again.' 
      }));
    } finally {
      setVerifyingPhone(false);
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    const input = e.target;
    const cursorPosition = input.selectionStart;
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Reset phone verification when phone changes
    if (name === 'recipientPhone') {
      setPhoneVerified(false);
    }

    if (name === 'amount') {
      const numericValue = value.replace(/[^0-9.]/g, '');
      if (numericValue.split('.').length <= 2) {
        setTransferData(prev => ({ ...prev, [name]: numericValue }));
        
        setTimeout(() => {
          if (input && document.activeElement === input && input.type === 'text') {
            input.setSelectionRange(cursorPosition, cursorPosition);
          }
        }, 0);
      }
    } else if (name === 'recipientPhone') {
      const numericValue = value.replace(/[^0-9+]/g, '');
      setTransferData(prev => ({ ...prev, [name]: numericValue }));
    } else if (name === 'recipientEmail') {
      setTransferData(prev => ({ ...prev, [name]: value.replace(/[<>;{}]/g, '') }));
    } else if (name === 'recipientName') {
      setTransferData(prev => ({ ...prev, [name]: value.replace(/[<>;{}]/g, '') }));
      
      setTimeout(() => {
        if (input && document.activeElement === input && input.type === 'text') {
          input.setSelectionRange(cursorPosition, cursorPosition);
        }
      }, 0);
    } else if (name === 'pin') {
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
      setTransferData(prev => ({ ...prev, [name]: numericValue }));
      
      setTimeout(() => {
        if (input && document.activeElement === input && (input.type === 'text' || input.type === 'password')) {
          input.setSelectionRange(cursorPosition, cursorPosition);
        }
      }, 0);
    } else if (name === 'cardNumber') {
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 16);
      setTransferData(prev => ({ ...prev, [name]: numericValue }));
      
      setTimeout(() => {
        if (input && document.activeElement === input && input.type === 'text') {
          input.setSelectionRange(cursorPosition, cursorPosition);
        }
      }, 0);
    } else if (name === 'cvv') {
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 4);
      setTransferData(prev => ({ ...prev, [name]: numericValue }));
      
      setTimeout(() => {
        if (input && document.activeElement === input && input.type === 'text') {
          input.setSelectionRange(cursorPosition, cursorPosition);
        }
      }, 0);
    } else if (name === 'expiryDate') {
      let formatted = value.replace(/[^0-9]/g, '');
      if (formatted.length >= 2) {
        formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4);
      }
      setTransferData(prev => ({ ...prev, [name]: formatted }));
      
      setTimeout(() => {
        if (input && document.activeElement === input && input.type === 'text') {
          input.setSelectionRange(cursorPosition, cursorPosition);
        }
      }, 0);
    } else if (name === 'notes') {
      setTransferData(prev => ({ ...prev, [name]: value.replace(/[<>;{}]/g, '') }));
    } else {
      setTransferData(prev => ({ ...prev, [name]: value.replace(/[<>;{}]/g, '') }));
    }
  }, [validationErrors]);

  const validateStep = (step) => {
    const errors = {};

    if (step >= 1) {
      if (!transferData.recipientPhone?.trim()) {
        errors.recipientPhone = 'Recipient phone number is required';
      } else {
        const phone = formatPhoneNumber(transferData.recipientPhone);
        if (phone.length < 12 || !phone.startsWith('+254')) {
          errors.recipientPhone = 'Invalid Kenya phone number (use +254...)';
        } else if (!phoneVerified) {
          errors.recipientPhone = 'Please verify the phone number';
        }
      }

      if (!transferData.amount) {
        errors.amount = 'Amount is required';
      } else if (parseFloat(transferData.amount) <= 0) {
        errors.amount = 'Amount must be greater than 0';
      } else if (parseFloat(transferData.amount) > 10000) {
        errors.amount = 'Maximum transfer is $10,000';
      }
    }

    if (step >= 2) {
      if (!transferData.cardNumber || transferData.cardNumber.length < 13) {
        errors.cardNumber = 'Valid card number required';
      }
      if (!transferData.expiryDate || transferData.expiryDate.length < 5) {
        errors.expiryDate = 'Expiry date required (MM/YY)';
      }
      if (!transferData.cvv || transferData.cvv.length < 3) {
        errors.cvv = 'CVV required';
      }
    }

    if (step >= 3) {
      if (!transferData.pin || transferData.pin.length < 4) {
        errors.pin = 'PIN must be at least 4 digits';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setValidationErrors({});
  };

  const processTransfer = async () => {
    if (!validateStep(3)) return;

    setLoading(true);

    try {
      const response = await transferAPI.send({
        recipientName: transferData.recipientName.trim() || 'M-Pesa User',
        recipientEmail: transferData.recipientEmail.trim() || '',
        recipientPhone: formatPhoneNumber(transferData.recipientPhone),
        amount: parseFloat(transferData.amount),
        fromCurrency: transferData.fromCurrency,
        toCurrency: transferData.toCurrency,
        paymentMethod: 'card',
        notes: transferData.notes?.trim() || ''
      });

      if (response.data.transaction) {
        setTransferResult({ success: true, transaction: response.data.transaction });
        setCurrentStep(4);
      } else {
        setValidationErrors({ general: 'Transfer failed' });
      }
    } catch (error) {
      setValidationErrors({ 
        general: error.response?.data?.error || 'Transfer failed. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewTransfer = () => {
    setTransferData({
      recipientName: '',
      recipientEmail: '',
      recipientPhone: '',
      amount: '',
      fromCurrency: 'CAD',
      toCurrency: 'KES',
      notes: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      pin: ''
    });
    setValidationErrors({});
    setTransferResult(null);
    setPhoneVerified(false);
    setCurrentStep(1);
  };

  const StepIndicator = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '2.5rem',
      gap: '0.5rem'
    }}>
      {[
        { num: 1, label: 'Details' },
        { num: 2, label: 'Payment' },
        { num: 3, label: 'Confirm' },
        { num: 4, label: 'Complete' }
      ].map((step, idx) => (
        <React.Fragment key={step.num}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: currentStep >= step.num 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : '#e5e7eb',
              color: currentStep >= step.num ? 'white' : '#9ca3af',
              fontWeight: '700',
              fontSize: '0.875rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: currentStep >= step.num ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
            }}>
              {currentStep > step.num ? '✓' : step.num}
            </div>
            <span style={{
              fontSize: '0.8125rem',
              fontWeight: '600',
              color: currentStep >= step.num ? '#667eea' : '#9ca3af',
              display: window.innerWidth > 640 ? 'block' : 'none',
              transition: 'color 0.3s ease'
            }}>
              {step.label}
            </span>
          </div>
          {idx < 3 && (
            <div style={{
              width: window.innerWidth > 640 ? '2.5rem' : '1.25rem',
              height: '3px',
              background: currentStep > step.num 
                ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                : '#e5e7eb',
              transition: 'all 0.3s ease',
              alignSelf: 'center',
              borderRadius: '2px'
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      padding: '2rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '2rem',
          gap: '1rem'
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            aria-label="Back to dashboard"
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
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              fontSize: '1.25rem',
              transition: 'all 0.2s ease',
              color: '#374151'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f9fafb';
              e.currentTarget.style.transform = 'translateX(-4px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            ←
          </button>
          <div>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 0.25rem 0',
              lineHeight: 1.2
            }}>
              Send to M-Pesa
            </h1>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              Fast, secure transfers to Kenya
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: window.innerWidth > 640 ? '2.5rem' : '1.5rem',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
          marginBottom: '2rem'
        }}>
          <StepIndicator />

          {/* Step 1: Transfer Details */}
          {currentStep === 1 && (
            <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                Transfer Details
              </h2>

              {/* Amount Calculator */}
              <div style={{
                background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                borderRadius: '20px',
                padding: '1.75rem',
                marginBottom: '2rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: window.innerWidth > 640 ? '1fr auto 1fr' : '1fr',
                  gap: '1.25rem',
                  alignItems: 'stretch',
                  marginBottom: '1.5rem'
                }}>
                  
                  {/* Send Amount */}
                  <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '2px solid #667eea',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.1)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      marginBottom: '1rem'
                    }}>
                      <img 
                        src={getFlag(transferData.fromCurrency)} 
                        alt={transferData.fromCurrency}
                        width="28"
                        height="21"
                        style={{ borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                      />
                      <span style={{
                        fontWeight: '600',
                        color: '#667eea',
                        fontSize: '0.875rem',
                        letterSpacing: '0.01em'
                      }}>
                        You Send
                      </span>
                    </div>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      flex: 1
                    }}>
                      <span style={{
                        color: '#667eea',
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        marginRight: '0.5rem',
                        flexShrink: 0
                      }}>
                        {getCurrencySymbol(transferData.fromCurrency)}
                      </span>
                      <input
                        key="send-amount-input"
                        type="text"
                        inputMode="decimal"
                        name="amount"
                        value={transferData.amount}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        autoComplete="off"
                        style={{
                          flex: 1,
                          minWidth: '60px',
                          width: '100%',
                          padding: '0.5rem 0',
                          border: 'none',
                          background: 'transparent',
                          fontSize: '1.75rem',
                          fontWeight: '700',
                          color: '#667eea',
                          outline: 'none',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      marginTop: '0.5rem',
                      fontWeight: '500'
                    }}>
                      {transferData.fromCurrency}
                    </div>
                  </div>

                  {/* Swap Button */}
                  {window.innerWidth > 640 && (
                    <button
                      onClick={handleSwapCurrency}
                      type="button"
                      aria-label="Swap currencies"
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        alignSelf: 'center'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'rotate(180deg) scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                      }}
                    >
                      ⇄
                    </button>
                  )}

                  {/* Receive Amount - with overflow handling */}
                  <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '2px solid #10b981',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    width: '100%'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      marginBottom: '1rem'
                    }}>
                      <img 
                        src={getFlag('KES')} 
                        alt="Kenya"
                        width="28"
                        height="21"
                        style={{ borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                      />
                      <span style={{
                        fontWeight: '600',
                        color: '#10b981',
                        fontSize: '0.875rem',
                        letterSpacing: '0.01em'
                      }}>
                        They Receive
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      flex: 1,
                       minHeight: '48px'
                     }}>
                      <span style={{
                      fontSize: '1.75rem',
                      fontWeight: '700',
                      color: '#10b981',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      flexShrink: 0
                    }}>
                        {getCurrencySymbol('KES')}
                      </span>
                      <span style={{ 
                        fontSize: '1.75rem',
                        fontWeight: '700',
                        color: '#10b981',
                        whiteSpace: 'nowrap',
                        overflow: 'visible'
                      }}>
                        {parseFloat(calculateReceiveAmount()).toLocaleString('en-KE', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      marginTop: '0.5rem',
                      fontWeight: '500'
                    }}>
                      KES
                    </div>
                  </div>
                </div>

                {/* Exchange Rate Info */}
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  fontSize: '0.8125rem'
                }}>
                    <span style={{ color: '#6b7280', fontWeight: '500' }}>
                      Rate: 1 {transferData.fromCurrency} = {EXCHANGE_RATES[`${transferData.fromCurrency}-KES`]} KES
                      </span>
                      <span style={{ color: '#6b7280', fontWeight: '500' }}>
                        Fee: {getCurrencySymbol(transferData.fromCurrency)}0.00
                        </span>
                        <span style={{ fontWeight: '700', color: '#111827' }}>
                          Total: {getCurrencySymbol(transferData.fromCurrency)}{transferData.amount || '0.00'}
                          </span>
                        </div>
                     </div>

              {validationErrors.amount && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  padding: '0.875rem 1rem',
                  marginBottom: '1.5rem'
                }}>
                  <span style={{ color: '#dc2626', fontSize: '0.875rem', fontWeight: '500' }}>
                    {validationErrors.amount}
                  </span>
                </div>
              )}

              {/* Recipient Details */}
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Phone Number with Verify */

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    letterSpacing: '0.01em'
                  }}>
                    M-Pesa Phone Number *
                  </label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                      type="tel"
                      name="recipientPhone"
                      value={transferData.recipientPhone}
                      onChange={handleInputChange}
                      placeholder="+254712345678"
                      autoComplete="off"
                      style={{
                        flex: 1,
                        padding: '0.875rem 1rem',
                        border: `2px solid ${validationErrors.recipientPhone ? '#ef4444' : phoneVerified ? '#10b981' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                        boxSizing: 'border-box',
                        backgroundColor: 'white'
                      }}
                      onFocus={(e) => {
                        if (!validationErrors.recipientPhone) {
                          e.target.style.borderColor = phoneVerified ? '#10b981' : '#667eea';
                        }
                      }}
                      onBlur={(e) => {
                        if (!validationErrors.recipientPhone) {
                          e.target.style.borderColor = phoneVerified ? '#10b981' : '#e5e7eb';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={verifyPhone}
                      disabled={verifyingPhone || !transferData.recipientPhone}
                      style={{
                        padding: '0.875rem 1.5rem',
                        background: phoneVerified 
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        cursor: verifyingPhone || !transferData.recipientPhone ? 'not-allowed' : 'pointer',
                        opacity: verifyingPhone || !transferData.recipientPhone ? 0.6 : 1,
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                        minWidth: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseOver={(e) => {
                        if (!verifyingPhone && transferData.recipientPhone) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!verifyingPhone && transferData.recipientPhone) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {verifyingPhone ? (
                        <>
                          <div style={{
                            width: '14px',
                            height: '14px',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                          }} />
                          Verifying
                        </>
                      ) : phoneVerified ? (
                        <>✓ Verified</>
                      ) : (
                        'Verify'
                      )}
                    </button>
                  </div>
                  {validationErrors.recipientPhone && (
                    <span style={{ 
                      color: '#ef4444', 
                      fontSize: '0.75rem', 
                      marginTop: '0.375rem', 
                      display: 'block',
                      fontWeight: '500'
                    }}>
                      {validationErrors.recipientPhone}
                    </span>
                  )}
                  {phoneVerified && (
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.75rem 1rem',
                      background: '#f0fdf4',
                      border: '1px solid #86efac',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1.25rem' }}>✓</span>
                      <span style={{ fontSize: '0.875rem', color: '#15803d', fontWeight: '500' }}>
                        M-Pesa account verified
                      </span>
                    </div>
                  )}
                </div>

                /* Auto-filled name when verified */}
                {phoneVerified && transferData.recipientName && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem',
                      letterSpacing: '0.01em'
                    }}>
                      Recipient Name
                    </label>
                    <div style={{
                      padding: '0.875rem 1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      backgroundColor: '#f9fafb',
                      color: '#6b7280'
                    }}>
                      {transferData.recipientName}
                    </div>
                  </div>
                )}

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    letterSpacing: '0.01em'
                  }}>
                    Note (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={transferData.notes}
                    onChange={handleInputChange}
                    placeholder="What's this transfer for?"
                    rows={3}
                    autoComplete="off"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      backgroundColor: 'white'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Payment - same as before */}
          {currentStep === 2 && (
            <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                Payment Information
              </h2>

              <div style={{
                background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                borderRadius: '20px',
                padding: '1.75rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <InputField
                    label="Card Number"
                    type="text"
                    name="cardNumber"
                    value={transferData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    error={validationErrors.cardNumber}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <InputField
                      label="Expiry Date"
                      type="text"
                      name="expiryDate"
                      value={transferData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      error={validationErrors.expiryDate}
                    />

                    <InputField
                      label="CVV"
                      type="text"
                      name="cvv"
                      value={transferData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      error={validationErrors.cvv}
                    />
                  </div>

                  <div style={{
                    background: 'white',
                    border: '2px solid #667eea',
                    borderRadius: '12px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem'
                  }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.375rem',
                      flexShrink: 0
                    }}>
                      🔒
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.9375rem', marginBottom: '0.125rem' }}>
                        Secure Payment
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                        Your information is encrypted with 256-bit SSL
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 & 4: Keep existing code */}
          {currentStep === 3 && (
  <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
    <h2 style={{
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '1.5rem',
      textAlign: 'center'
    }}>
      Confirm Transfer
    </h2>

    <div style={{
      background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
      borderRadius: '20px',
      padding: '1.75rem',
      marginBottom: '2rem',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {[
          { label: 'M-Pesa Number', value: formatPhoneNumber(transferData.recipientPhone) },
          { label: 'Recipient', value: transferData.recipientName || 'M-Pesa User' },
          { label: 'You Send', value: `${getCurrencySymbol(transferData.fromCurrency)}${parseFloat(transferData.amount || 0).toFixed(2)} ${transferData.fromCurrency}`, bold: true, color: '#667eea' },
          { label: 'They Receive', value: `${getCurrencySymbol('KES')}${parseFloat(calculateReceiveAmount()).toLocaleString('en-KE', { minimumFractionDigits: 2 })} KES`, bold: true, color: '#10b981' }
        ].map((item, idx) => (
          <div key={idx} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '1rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <span style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>
              {item.label}
            </span>
            <span style={{
              fontWeight: item.bold ? '700' : '600',
              color: item.color || '#111827',
              fontSize: item.bold ? '1.125rem' : '0.9375rem',
              textAlign: 'right',
              wordBreak: 'break-word'
            }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Footer with small transfer fee info */}
      <div style={{
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '2px dashed #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        color: '#9ca3af'
      }}>
        <span>Transfer Fee</span>
        <span>{getCurrencySymbol(transferData.fromCurrency)}0.00</span>
      </div>
    </div>

    <InputField
      label="Enter PIN to Confirm"
      type="password"
      name="pin"
      value={transferData.pin}
      onChange={handleInputChange}
      placeholder="Enter 4-6 digit PIN"
      maxLength={6}
      error={validationErrors.pin}
      style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.5rem' }}
    />

    <p style={{
      fontSize: '0.8125rem',
      color: '#6b7280',
      marginTop: '0.75rem',
      textAlign: 'center'
    }}>
      Demo PIN: 1234
    </p>

    {validationErrors.general && (
      <div style={{
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        padding: '1rem',
        marginTop: '1rem'
      }}>
        <span style={{ color: '#dc2626', fontSize: '0.875rem', fontWeight: '500' }}>
          {validationErrors.general}
        </span>
      </div>
    )}
  </div>
)}

          {currentStep === 4 && (
  <div style={{
    animation: 'zoomIn 0.5s ease-out',
    textAlign: 'center'
  }}>
    <div style={{
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 2rem auto',
      fontSize: '3.5rem',
      boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
      animation: 'successPulse 2s ease-in-out infinite'
    }}>
      ✓
    </div>

    <h2 style={{
      fontSize: '2rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '0.5rem'
    }}>
      Transfer Successful!
    </h2>

    <p style={{
      color: '#6b7280',
      marginBottom: '2rem',
      fontSize: '1.125rem'
    }}>
      Money sent to {formatPhoneNumber(transferData.recipientPhone)}
    </p>

    <div style={{
      background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
      borderRadius: '20px',
      padding: '1.75rem',
      marginBottom: '1.5rem',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#6b7280', fontWeight: '500' }}>You Sent:</span>
          <span style={{ fontWeight: '700', color: '#667eea', fontSize: '1.125rem' }}>
            {getCurrencySymbol(transferData.fromCurrency)}{parseFloat(transferData.amount || 0).toFixed(2)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#6b7280', fontWeight: '500' }}>They Received:</span>
          <span style={{ fontWeight: '700', color: '#10b981', fontSize: '1.125rem' }}>
            {getCurrencySymbol('KES')}{parseFloat(calculateReceiveAmount()).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#6b7280', fontWeight: '500' }}>Transaction ID:</span>
          <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#111827', fontWeight: '600' }}>
            #{transferResult?.transaction?.id || 'N/A'}
          </span>
        </div>
      </div>

      {/* Footer with fee */}
      <div style={{
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        color: '#9ca3af'
      }}>
        <span>Transfer Fee</span>
        <span>{getCurrencySymbol(transferData.fromCurrency)}0.00</span>
      </div>
    </div>

    <div style={{
      display: 'grid',
      gridTemplateColumns: window.innerWidth > 640 ? '1fr 1fr' : '1fr',
      gap: '1rem'
    }}>
      <button
        onClick={() => {
          // Keep recipient info, reset only amount
          setTransferData(prev => ({
            ...prev,
            amount: '',
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            pin: ''
          }));
          setValidationErrors({});
          setCurrentStep(1);
        }}
        style={{
          background: 'white',
          color: '#667eea',
          border: '2px solid #667eea',
          borderRadius: '12px',
          padding: '1rem',
          fontWeight: '600',
          fontSize: '1rem',
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
        Send Again to Same Person
      </button>
      <button
        onClick={() => navigate('/dashboard')}
        style={{
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
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
        }}
      >
        Back to Dashboard
      </button>
    </div>
  </div>
)}
          

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  disabled={loading}
                  style={{
                    flex: '1',
                    background: 'white',
                    color: '#6b7280',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '1rem',
                    fontWeight: '600',
                    fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }
                  }}
                >
                  Back
                </button>
              )}

              <button
                onClick={currentStep === 3 ? processTransfer : handleNext}
                disabled={loading}
                style={{
                  flex: currentStep === 1 ? '1' : '2',
                  background: loading 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1rem',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    Processing...
                  </>
                ) : (
                  currentStep === 3 ? 'Send Money Now' : 'Continue'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Trust Indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '2rem',
          padding: '1rem'
        }}>
          {[
            { icon: '🔒', text: 'Bank-level security' },
            { icon: '⚡', text: 'Instant M-Pesa' },
            { icon: '💰', text: 'Best rates' }
          ].map((item, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.125rem',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
              }}>
                {item.icon}
              </div>
              <span style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes successPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @media (max-width: 640px) {
          [style*="gridTemplateColumns: 1fr auto 1fr"] {
            grid-template-columns: 1fr !important;
          }
          [style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Transfers;