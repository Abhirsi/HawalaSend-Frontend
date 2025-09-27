import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transferAPI } from '../api';
import FloatingChat from '../components/common/FloatingChat';

const Transfer = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [balance, setBalance] = useState(null); // Added for balance fetching
  const [transferData, setTransferData] = useState({
    recipientEmail: '',
    amount: '',
    description: '',
    paymentMethod: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    pin: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [transferResult, setTransferResult] = useState(null);

  // PaySii-inspired exchange rate and fee calculation
  const exchangeRate = 110.45; // CAD to KES
  const feePercentage = 0.01; // 1% fee
  const fixedFee = 4.99; // Fixed fee like PaySii


  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatKES = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const calculateReceiveAmount = () => {
    const amount = parseFloat(transferData.amount) || 0;
    return (amount * exchangeRate).toFixed(2);
  };

  const calculateFee = () => {
    const amount = parseFloat(transferData.amount) || 0;
    return Math.max(amount * feePercentage, fixedFee);
  };

  const calculateTotal = () => {
    const amount = parseFloat(transferData.amount) || 0;
    return (amount + calculateFee()).toFixed(2);
  };

  const sanitizeInput = (value) => {
    // Remove potentially dangerous characters for security
    return value.replace(/[<>;{}]/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'amount') {
      const numericValue = value.replace(/[^0-9.]/g, '');
      if (numericValue.split('.').length <= 2) {
        setTransferData(prev => ({ ...prev, [name]: numericValue }));
      }
    } else if (name === 'pin') {
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
      setTransferData(prev => ({ ...prev, [name]: numericValue }));
    } else if (name === 'cardNumber') {
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 16);
      setTransferData(prev => ({ ...prev, [name]: numericValue }));
    } else if (name === 'cvv') {
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 4);
      setTransferData(prev => ({ ...prev, [name]: numericValue }));
    } else if (name === 'expiryDate') {
      let formattedValue = value.replace(/[^0-9]/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
      setTransferData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setTransferData(prev => ({ ...prev, [name]: sanitizeInput(value) }));
    }
  };

  const validateStep = (step) => {
    const errors = {};

    if (step >= 1) {
      if (!transferData.recipientEmail) {
        errors.recipientEmail = 'Recipient email is required';
      } else if (!/\S+@\S+\.\S+/.test(transferData.recipientEmail)) {
        errors.recipientEmail = 'Please enter a valid email address';
      } else if (transferData.recipientEmail.toLowerCase() === currentUser?.email?.toLowerCase()) {
        errors.recipientEmail = 'Cannot send money to yourself';
      }

      if (!transferData.amount) {
        errors.amount = 'Amount is required';
      } else if (parseFloat(transferData.amount) <= 0) {
        errors.amount = 'Amount must be greater than 0';
      } else if (parseFloat(transferData.amount) > 10000) {
        errors.amount = 'Maximum transfer amount is $10,000';
      }
    }

    if (step >= 2) {
      if (!transferData.paymentMethod) {
        errors.paymentMethod = 'Please select a payment method';
      }

      if (transferData.paymentMethod === 'card') {
        if (!transferData.cardNumber || transferData.cardNumber.length < 13) {
          errors.cardNumber = 'Please enter a valid card number';
        }
        if (!transferData.expiryDate || transferData.expiryDate.length < 5) {
          errors.expiryDate = 'Please enter expiry date (MM/YY)';
        }
        if (!transferData.cvv || transferData.cvv.length < 3) {
          errors.cvv = 'Please enter CVV';
        }
      }
    }

    if (step >= 3) {
      if (!transferData.pin) {
        errors.pin = 'PIN is required';
      } else if (transferData.pin.length < 4) {
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
        recipient_email: transferData.recipientEmail,
        amount: parseFloat(transferData.amount),
        description: transferData.description || 'Money transfer',
        payment_method: transferData.paymentMethod,
        card_number: transferData.paymentMethod === 'card' ? transferData.cardNumber : undefined,
        pin: transferData.pin
      });

      if (response.data.success) {
        setTransferResult({
          success: true,
          transaction: response.data.transaction,
          newBalance: response.data.newBalance
        });
        setCurrentStep(4);
      } else {
        setValidationErrors({ general: response.data.error || 'Transfer failed' });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Transfer failed. Please try again.';
      setValidationErrors({ general: errorMessage });
      console.error('Transfer error:', error); // Improved logging
    } finally {
      setLoading(false);
    }
  };

  const handleNewTransfer = () => {
    setTransferData({
      recipientEmail: '',
      amount: '',
      description: '',
      paymentMethod: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      pin: ''
    });
    setValidationErrors({});
    setTransferResult(null);
    setCurrentStep(1);
  };

  const renderStepIndicator = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '2rem',
      gap: '0.5rem'
    }}>
      {[1, 2, 3, 4].map(step => (
        <div key={step} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: currentStep >= step ? 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)' : '#e5e5e5',
            color: currentStep >= step ? 'white' : '#737373',
            fontWeight: '600',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease'
          }}>
            {step}
          </div>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: '500',
            color: currentStep >= step ? '#1976d2' : '#737373'
          }}>
            {step === 1 ? 'Details' : step === 2 ? 'Payment' : step === 3 ? 'Confirm' : 'Complete'}
          </span>
          {step < 4 && (
            <div style={{
              width: '1.5rem',
              height: '2px',
              background: currentStep > step ? 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)' : '#e5e5e5',
              transition: 'all 0.2s ease'
            }} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        How much would you like to send?
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '2px solid #1976d2',
          borderRadius: '16px',
          padding: '1.5rem',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <img src="https://flagcdn.com/w40/ca.png" alt="Canada" width="24" height="18" />
            <span style={{ fontWeight: '600', color: '#1976d2' }}>You Send (CAD)</span>
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '0',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#1976d2',
              fontSize: '2rem',
              fontWeight: '700'
            }}>
              $
            </span>
            <input
              type="text"
              name="amount"
              value={transferData.amount}
              onChange={handleInputChange}
              placeholder="0.00"
              style={{
                width: '100%',
                padding: '0.5rem 0 0.5rem 2rem',
                border: 'none',
                background: 'transparent',
                fontSize: '2rem',
                fontWeight: '700',
                color: '#1976d2',
                outline: 'none',
                textAlign: 'right'
              }}
            />
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '2px solid #2e7d32',
          borderRadius: '16px',
          padding: '1.5rem',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <img src="https://flagcdn.com/w40/ke.png" alt="Kenya" width="24" height="18" />
            <span style={{ fontWeight: '600', color: '#2e7d32' }}>They Receive (KES)</span>
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#2e7d32',
            textAlign: 'right'
          }}>
            {formatKES(parseFloat(calculateReceiveAmount()))}
          </div>
        </div>
      </div>

      <button
  onClick={() => {
    setTransferData(prev => ({
      ...prev,
      amount: calculateReceiveAmount() / exchangeRate,
    }));
  }}
  style={{
    margin: '1rem auto',
    padding: '0.5rem 1rem',
    background: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }}
  onMouseOver={(e) => (e.target.style.background = '#1565c0')}
  onMouseOut={(e) => (e.target.style.background = '#1976d2')}
>
  ↔ Swap
</button>

      <div style={{
        background: '#f8fafc',
        border: '1px solid #e5e5e5',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ color: '#737373', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
          Exchange Rate: 1 CAD = {exchangeRate} KES
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#737373' }}>
          <span>Fee: {formatCurrency(calculateFee())}</span>
          <span>Total: {formatCurrency(parseFloat(calculateTotal()))}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Recipient Email
          </label>
          <input
            type="email"
            name="recipientEmail"
            value={transferData.recipientEmail}
            onChange={handleInputChange}
            placeholder="Enter recipient's email address"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: `2px solid ${validationErrors.recipientEmail ? '#ef4444' : '#e5e5e5'}`,
              borderRadius: '12px',
              fontSize: '1rem',
              transition: 'all 0.2s ease',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              if (!validationErrors.recipientEmail) {
                e.target.style.borderColor = '#1976d2';
              }
            }}
            onBlur={(e) => {
              if (!validationErrors.recipientEmail) {
                e.target.style.borderColor = '#e5e5e5';
              }
            }}
          />
          {validationErrors.recipientEmail && (
            <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
              {validationErrors.recipientEmail}
            </span>
          )}
        </div>

        {validationErrors.amount && (
          <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '-1rem', display: 'block' }}>
            {validationErrors.amount}
          </span>
        )}

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Description (Optional)
          </label>
          <textarea
            name="description"
            value={transferData.description}
            onChange={handleInputChange}
            placeholder="What's this transfer for?"
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '2px solid #e5e5e5',
              borderRadius: '12px',
              fontSize: '1rem',
              transition: 'all 0.2s ease',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => e.target.style.borderColor = '#1976d2'}
            onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        How would you like to pay?
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <div 
          onClick={() => handleInputChange({ target: { name: 'paymentMethod', value: 'interac' } })}
          style={{
            border: `2px solid ${transferData.paymentMethod === 'interac' ? '#1976d2' : '#e5e5e5'}`,
            borderRadius: '12px',
            padding: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: transferData.paymentMethod === 'interac' ? '#f0f9ff' : 'white'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: '#1976d2',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}>
              e
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 0.25rem 0', fontWeight: '600', color: '#171717' }}>
                Interac e-Transfer
              </h3>
              <p style={{ margin: 0, color: '#737373', fontSize: '0.875rem' }}>
                Pay directly from your Canadian bank account
              </p>
            </div>
            <div style={{
              background: '#22c55e',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              Popular
            </div>
          </div>
        </div>

        <div 
          onClick={() => handleInputChange({ target: { name: 'paymentMethod', value: 'card' } })}
          style={{
            border: `2px solid ${transferData.paymentMethod === 'card' ? '#1976d2' : '#e5e5e5'}`,
            borderRadius: '12px',
            padding: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: transferData.paymentMethod === 'card' ? '#f0f9ff' : 'white'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: '#2e7d32',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.2rem'
            }}>
              💳
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 0.25rem 0', fontWeight: '600', color: '#171717' }}>
                Credit or Debit Card
              </h3>
              <p style={{ margin: 0, color: '#737373', fontSize: '0.875rem' }}>
                Visa, Mastercard, American Express
              </p>
            </div>
            <div style={{
              background: '#0ea5e9',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              Instant
            </div>
          </div>
        </div>
      </div>

      {validationErrors.paymentMethod && (
        <span style={{ color: '#ef4444', fontSize: '0.75rem', display: 'block', marginBottom: '1rem' }}>
          {validationErrors.paymentMethod}
        </span>
      )}

      {transferData.paymentMethod === 'card' && (
        <div style={{ 
          background: '#f8fafc', 
          border: '1px solid #e5e5e5', 
          borderRadius: '12px', 
          padding: '1.5rem',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontWeight: '600', color: '#171717' }}>
            Card Information
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Card Number
              </label>
              <input
                type="text"
                name="cardNumber"
                value={transferData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: `2px solid ${validationErrors.cardNumber ? '#ef4444' : '#e5e5e5'}`,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {validationErrors.cardNumber && (
                <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  {validationErrors.cardNumber}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Expiry Date
                </label>
                <input
                  type="text"
                  name="expiryDate"
                  value={transferData.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: `2px solid ${validationErrors.expiryDate ? '#ef4444' : '#e5e5e5'}`,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {validationErrors.expiryDate && (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    {validationErrors.expiryDate}
                  </span>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  CVV
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={transferData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: `2px solid ${validationErrors.cvv ? '#ef4444' : '#e5e5e5'}`,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {validationErrors.cvv && (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    {validationErrors.cvv}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {transferData.paymentMethod === 'interac' && (
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #1976d2',
          borderRadius: '12px',
          padding: '1rem',
          marginTop: '1rem'
        }}>
          <p style={{ margin: 0, color: '#1976d2', fontSize: '0.875rem', textAlign: 'center' }}>
            You'll be redirected to your bank to complete the e-Transfer
          </p>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        Confirm Transfer
      </h2>

      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)',
        border: '1px solid #e5e5e5',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#737373', fontSize: '0.875rem' }}>To:</span>
            <span style={{ fontWeight: '600', color: '#171717' }}>{transferData.recipientEmail}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#737373', fontSize: '0.875rem' }}>You Send:</span>
            <span style={{ fontWeight: '700', color: '#1976d2', fontSize: '1.125rem' }}>
              {formatCurrency(parseFloat(transferData.amount || 0))}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#737373', fontSize: '0.875rem' }}>They Receive:</span>
            <span style={{ fontWeight: '700', color: '#2e7d32', fontSize: '1.125rem' }}>
              {formatKES(parseFloat(calculateReceiveAmount()))}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#737373', fontSize: '0.875rem' }}>Payment Method:</span>
            <span style={{ fontWeight: '600', color: '#171717' }}>
              {transferData.paymentMethod === 'interac' ? 'Interac e-Transfer' : 
               transferData.paymentMethod === 'card' ? `Card ending in ${transferData.cardNumber.slice(-4)}` : ''}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#737373', fontSize: '0.875rem' }}>Fee:</span>
            <span style={{ fontWeight: '600', color: '#737373' }}>
              {formatCurrency(calculateFee())}
            </span>
          </div>
          <div style={{ height: '1px', background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)', margin: '0.5rem 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#171717', fontWeight: '600' }}>Total:</span>
            <span style={{ fontWeight: '700', color: '#171717', fontSize: '1.125rem' }}>
              {formatCurrency(parseFloat(calculateTotal()))}
            </span>
          </div>
          {transferData.description && (
            <>
              <div style={{ height: '1px', background: '#e5e5e5', margin: '0.5rem 0' }} />
              <div>
                <span style={{ color: '#737373', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Description:</span>
                <span style={{ color: '#171717' }}>{transferData.description}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '0.5rem'
        }}>
          Enter your PIN to confirm
        </label>
        <input
          type="text"
          name="pin"
          value={transferData.pin}
          onChange={handleInputChange}
          placeholder="Enter 4-6 digit PIN"
          maxLength={6}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            border: `2px solid ${validationErrors.pin ? '#ef4444' : '#e5e5e5'}`,
            borderRadius: '12px',
            fontSize: '1rem',
            textAlign: 'center',
            letterSpacing: '0.25rem',
            transition: 'all 0.2s ease',
            outline: 'none',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => {
            if (!validationErrors.pin) {
              e.target.style.borderColor = '#1976d2';
            }
          }}
          onBlur={(e) => {
            if (!validationErrors.pin) {
              e.target.style.borderColor = '#e5e5e5';
            }
          }}
        />
        {validationErrors.pin && (
          <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
            {validationErrors.pin}
          </span>
        )}
        <p style={{
          fontSize: '0.75rem',
          color: '#737373',
          marginTop: '0.5rem',
          textAlign: 'center'
        }}>
          For demo purposes, use PIN: 1234
        </p>
      </div>

      {validationErrors.general && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '1rem',
          marginTop: '1rem'
        }}>
          <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>
            {validationErrors.general}
          </span>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div style={{ 
      animation: 'zoomIn 0.5s ease-out',
      textAlign: 'center'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem auto',
        fontSize: '2.5rem'
      }}>
        ✅
      </div>

      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '0.5rem'
      }}>
        Transfer Successful!
      </h2>

      <p style={{
        color: '#737373',
        marginBottom: '2rem',
        fontSize: '1rem'
      }}>
        Your money has been sent successfully
      </p>

      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)',
        border: '1px solid #e5e5e5',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#737373', fontSize: '0.875rem' }}>Amount Sent:</span>
            <span style={{ fontWeight: '700', color: '#1976d2', fontSize: '1.125rem' }}>
              {formatCurrency(parseFloat(transferData.amount || 0))}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#737373', fontSize: '0.875rem' }}>They Received:</span>
            <span style={{ fontWeight: '700', color: '#2e7d32', fontSize: '1.125rem' }}>
              {formatKES(parseFloat(calculateReceiveAmount()))}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#737373', fontSize: '0.875rem' }}>To:</span>
            <span style={{ fontWeight: '600', color: '#171717' }}>{transferData.recipientEmail}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#737373', fontSize: '0.875rem' }}>Payment Method:</span>
            <span style={{ fontWeight: '600', color: '#171717' }}>
              {transferData.paymentMethod === 'interac' ? 'Interac e-Transfer' : 
               transferData.paymentMethod === 'card' ? `Card ending in ${transferData.cardNumber.slice(-4)}` : ''}
            </span>
          </div>
          {transferResult?.transaction?.id && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#737373', fontSize: '0.875rem' }}>Transaction ID:</span>
              <span style={{ fontWeight: '600', color: '#171717', fontSize: '0.875rem' }}>
                #{transferResult.transaction.id}
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem'
      }}>
        <button
          onClick={handleNewTransfer}
          style={{
            background: 'white',
            color: '#1976d2',
            border: '2px solid #1976d2',
            borderRadius: '12px',
            padding: '0.75rem 1.5rem',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#f0f9ff';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'white';
            e.target.style.transform = 'translateY(0px)';
          }}
        >
          Send Another
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '0.75rem 1.5rem',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #1565c0 0%, #1b5e20 100%)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 10px 25px rgba(25, 118, 210, 0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)';
            e.target.style.transform = 'translateY(0px)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      padding: '2rem 1rem',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto'
      }}>
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
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#f8fafc'}
            onMouseOut={(e) => e.target.style.background = 'white'}
          >
            ←
          </button>
          <img src="/assets/logo.png" alt="HawalaSend Logo" style={{ height: '40px', marginRight: '1rem' }} />
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0'
          }}>
            Send Money
          </h1>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          {renderStepIndicator()}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {currentStep < 4 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '2rem',
              gap: '1rem'
            }}>
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  disabled={loading}
                  style={{
                    flex: '1',
                    background: 'white',
                    color: '#737373',
                    border: '2px solid #e5e5e5',
                    borderRadius: '12px',
                    padding: '0.75rem 1.5rem',
                    fontWeight: '600',
                    fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.target.style.background = '#f8fafc';
                      e.target.style.borderColor = '#d4d4d4';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading) {
                      e.target.style.background = 'white';
                      e.target.style.borderColor = '#e5e5e5';
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
                  flex: '2',
                  background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 1.5rem',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.target.style.background = 'linear-gradient(135deg, #1565c0 0%, #1b5e20 100%)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 10px 25px rgba(25, 118, 210, 0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.target.style.background = 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)';
                    e.target.style.transform = 'translateY(0px)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Processing...
                  </>
                ) : (
                  currentStep === 3 ? 'Send Money' : 'Continue'
                )}
              </button>
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '2rem',
          marginTop: '2rem',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '24px',
              height: '24px',
              background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              🔒
            </div>
            <span style={{ fontSize: '0.875rem', color: '#737373', fontWeight: '500' }}>
              Bank-level security
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '24px',
              height: '24px',
              background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              ⚡
            </div>
            <span style={{ fontSize: '0.875rem', color: '#737373', fontWeight: '500' }}>
              Instant delivery
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '24px',
              height: '24px',
              background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              💰
            </div>
            <span style={{ fontSize: '0.875rem', color: '#737373', fontWeight: '500' }}>
              Best exchange rates
            </span>
          </div>
        </div>
      </div>

      <FloatingChat />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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

export default Transfer;