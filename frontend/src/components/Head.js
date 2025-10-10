import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      background: 'white',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px'
      }}>
        
        {/* Logo */}
        <Link
          to={currentUser ? '/dashboard' : '/'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            transition: 'transform 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{
            width: '45px',
            height: '45px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}>
            🦜
          </div>
          <div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1
            }}>
              TapTap Send
            </div>
            <div style={{
              fontSize: '0.625rem',
              color: '#9ca3af',
              fontWeight: '500',
              letterSpacing: '0.5px'
            }}>
              Fast. Simple. Secure.
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{
          display: window.innerWidth > 768 ? 'flex' : 'none',
          alignItems: 'center',
          gap: '2rem'
        }}>
          {currentUser ? (
            <>
              <Link
                to="/dashboard"
                style={{
                  color: isActive('/dashboard') ? '#667eea' : '#6b7280',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9375rem',
                  transition: 'color 0.2s ease',
                  borderBottom: isActive('/dashboard') ? '2px solid #667eea' : '2px solid transparent',
                  paddingBottom: '0.25rem'
                }}
                onMouseOver={(e) => !isActive('/dashboard') && (e.target.style.color = '#667eea')}
                onMouseOut={(e) => !isActive('/dashboard') && (e.target.style.color = '#6b7280')}
              >
                Dashboard
              </Link>
              <Link
                to="/transfers"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9375rem',
                  padding: '0.625rem 1.5rem',
                  borderRadius: '10px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
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
                <span style={{ fontSize: '1.125rem' }}>💸</span>
                Send Money
              </Link>
              <Link
                to="/profile"
                style={{
                  color: isActive('/profile') ? '#667eea' : '#6b7280',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9375rem',
                  transition: 'color 0.2s ease',
                  borderBottom: isActive('/profile') ? '2px solid #667eea' : '2px solid transparent',
                  paddingBottom: '0.25rem'
                }}
                onMouseOver={(e) => !isActive('/profile') && (e.target.style.color = '#667eea')}
                onMouseOut={(e) => !isActive('/profile') && (e.target.style.color = '#6b7280')}
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: 'white',
                  color: '#dc2626',
                  border: '2px solid #fecaca',
                  borderRadius: '10px',
                  padding: '0.625rem 1.25rem',
                  fontWeight: '600',
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#fef2f2';
                  e.currentTarget.style.borderColor = '#dc2626';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#fecaca';
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  color: '#6b7280',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9375rem',
                  transition: 'color 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.color = '#667eea'}
                onMouseOut={(e) => e.target.style.color = '#6b7280'}
              >
                Log In
              </Link>
              <Link
                to="/register"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9375rem',
                  padding: '0.625rem 1.5rem',
                  borderRadius: '10px',
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
                Sign Up
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: window.innerWidth > 768 ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            background: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = '#667eea'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ width: '20px', height: '2px', background: '#374151', borderRadius: '2px' }} />
            <div style={{ width: '20px', height: '2px', background: '#374151', borderRadius: '2px' }} />
            <div style={{ width: '20px', height: '2px', background: '#374151', borderRadius: '2px' }} />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && window.innerWidth <= 768 && (
        <div style={{
          background: 'white',
          borderTop: '1px solid #e5e7eb',
          padding: '1rem',
          animation: 'slideDown 0.3s ease-out'
        }}>
          {currentUser ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#374151',
                  textDecoration: 'none',
                  fontWeight: '600',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: isActive('/dashboard') ? '#f0f9ff' : 'transparent'
                }}
              >
                Dashboard
              </Link>
              <Link
                to="/transfers"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: '600',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}
              >
                💸 Send Money
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#374151',
                  textDecoration: 'none',
                  fontWeight: '600',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: isActive('/profile') ? '#f0f9ff' : 'transparent'
                }}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '2px solid #fecaca',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#374151',
                  textDecoration: 'none',
                  fontWeight: '600',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '2px solid #e5e7eb'
                }}
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: '600',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
};

export default Header;