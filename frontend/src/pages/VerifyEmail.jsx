import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    const verifyEmail = async () => {
      try {
        await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage('Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { state: { message: 'Email verified! Please log in.' } });
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Verification failed. Link may have expired.');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.3)'
      }}>
        {status === 'verifying' && (
          <>
            <div className="loading-spinner" style={{ margin: '0 auto 20px' }}></div>
            <h1 style={{ color: '#1f2937', fontSize: '24px', marginBottom: '16px' }}>
              Verifying Your Email...
            </h1>
            <p style={{ color: '#6b7280' }}>Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
            <h1 style={{ color: '#1f2937', fontSize: '24px', marginBottom: '16px' }}>
              Email Verified!
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              {message} Redirecting to login...
            </p>
            <Link
              to="/login"
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: '600'
              }}
            >
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
            <h1 style={{ color: '#1f2937', fontSize: '24px', marginBottom: '16px' }}>
              Verification Failed
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              {message}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/resend-verification"
                style={{
                  display: 'inline-block',
                  padding: '14px 32px',
                  background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontWeight: '600'
                }}
              >
                Resend Link
              </Link>
              <Link
                to="/login"
                style={{
                  display: 'inline-block',
                  padding: '14px 32px',
                  background: 'white',
                  color: '#1976D2',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  border: '2px solid #1976D2'
                }}
              >
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;