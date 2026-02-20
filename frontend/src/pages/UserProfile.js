import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

// InputField component with better validation feedback
const InputField = React.memo(({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  placeholder, 
  disabled = false,
  error = '',
  helperText = '',
  required = false,
  maxLength
}) => {
  const inputRef = React.useRef(null);

  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '0.5rem'
      }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        maxLength={maxLength}
        style={{
          width: '100%',
          padding: '0.875rem 1rem',
          border: `2px solid ${error ? '#ef4444' : '#e5e7eb'}`,
          borderRadius: '12px',
          fontSize: '1rem',
          transition: 'all 0.2s ease',
          outline: 'none',
          boxSizing: 'border-box',
          backgroundColor: disabled ? '#f9fafb' : 'white',
          color: disabled ? '#9ca3af' : '#111827'
        }}
        onFocus={(e) => !disabled && (e.target.style.borderColor = error ? '#ef4444' : '#667eea')}
        onBlur={(e) => e.target.style.borderColor = error ? '#ef4444' : '#e5e7eb'}
      />
      {(error || helperText) && (
        <div style={{
          marginTop: '0.5rem',
          fontSize: '0.75rem',
          color: error ? '#ef4444' : '#6b7280'
        }}>
          {error || helperText}
        </div>
      )}
    </div>
  );
});

const UserProfile = () => {
  const navigate = useNavigate();
  const { currentUser, logout, refreshAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    username: ''
  });
  
  const [originalProfileData, setOriginalProfileData] = useState({});
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    const userData = {
      firstName: currentUser.firstName || '',
      lastName: currentUser.lastName || '',
      email: currentUser.email || '',
      phoneNumber: currentUser.phoneNumber || '',
      username: currentUser.username || ''
    };
    
    setProfileData(userData);
    setOriginalProfileData(userData);
  }, [currentUser, navigate]);

  // Check for unsaved changes
  useEffect(() => {
    const changed = JSON.stringify(profileData) !== JSON.stringify(originalProfileData);
    setHasChanges(changed);
  }, [profileData, originalProfileData]);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    if (!password) return { score: 0, text: '', color: '#9ca3af' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    score = Object.values(checks).filter(Boolean).length;
    
    const strength = {
      0: { text: 'Too weak', color: '#9ca3af' },
      1: { text: 'Very weak', color: '#ef4444' },
      2: { text: 'Weak', color: '#f97316' },
      3: { text: 'Fair', color: '#eab308' },
      4: { text: 'Good', color: '#84cc16' },
      5: { text: 'Strong', color: '#22c55e' }
    };
    
    return { score, ...strength[score], checks };
  };

  const passwordStrength = checkPasswordStrength(passwordData.newPassword);

  // Validation
  const validateProfile = () => {
    const errors = {};
    
    if (!profileData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (profileData.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!profileData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (profileData.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (profileData.username && profileData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (profileData.phoneNumber) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(profileData.phoneNumber)) {
        errors.phoneNumber = 'Invalid phone number format';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileChange = React.useCallback((field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    setError('');
    
    // Clear specific field error
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const handlePasswordChange = React.useCallback((field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    setError('');
  }, []);

  const handleSaveProfile = React.useCallback(async () => {
    if (!validateProfile()) {
      setError('Please fix the errors before saving');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/users/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phoneNumber: profileData.phoneNumber,
          username: profileData.username
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }
      
      await refreshAuth();
      setOriginalProfileData(profileData);
      setHasChanges(false);
      setSuccess('✓ Profile updated successfully!');
      
      // Auto-hide success message
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [profileData, refreshAuth]);

  const handleSavePassword = React.useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordStrength.score < 3) {
      setError('Password is too weak. Please use a stronger password.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setSuccess('✓ Password changed successfully! Logging out in 3 seconds...');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  }, [passwordData, passwordStrength.score, logout, navigate]);

  const handleCancelChanges = () => {
    setProfileData(originalProfileData);
    setValidationErrors({});
    setHasChanges(false);
    setError('');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤', description: 'Manage your personal information' },
    { id: 'security', label: 'Security', icon: '🔒', description: 'Update your password' },
    { id: 'activity', label: 'Activity', icon: '📊', description: 'View account activity' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      padding: isMobile ? '1rem' : '2rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
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
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                marginRight: '1rem',
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
                fontSize: isMobile ? '1.5rem' : '1.875rem',
                fontWeight: '700',
                color: '#111827',
                margin: 0
              }}>
                Account Settings
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: '0.25rem 0 0 0'
              }}>
                Manage your HawalaSend account
              </p>
            </div>
          </div>

          {/* Email Verification Badge */}
          {currentUser && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: currentUser.email_verified ? '#f0fdf4' : '#fef3c7',
              border: `2px solid ${currentUser.email_verified ? '#86efac' : '#fcd34d'}`,
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: currentUser.email_verified ? '#15803d' : '#92400e'
            }}>
              <span>{currentUser.email_verified ? '✓' : '⚠️'}</span>
              {currentUser.email_verified ? 'Verified' : 'Unverified'}
            </div>
          )}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div style={{
            background: '#f0fdf4',
            border: '2px solid #86efac',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'slideDown 0.3s ease-out',
            boxShadow: '0 4px 12px rgba(134, 239, 172, 0.3)'
          }}>
            <span style={{ fontSize: '1.5rem' }}>✓</span>
            <span style={{ color: '#15803d', fontWeight: '600', flex: 1 }}>{success}</span>
            <button
              onClick={() => setSuccess('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#15803d',
                cursor: 'pointer',
                fontSize: '1.25rem',
                padding: '0.25rem'
              }}
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '2px solid #fecaca',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'slideDown 0.3s ease-out',
            boxShadow: '0 4px 12px rgba(254, 202, 202, 0.3)'
          }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <span style={{ color: '#dc2626', fontWeight: '600', flex: 1 }}>{error}</span>
            <button
              onClick={() => setError('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                fontSize: '1.25rem',
                padding: '0.25rem'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Unsaved Changes Warning */}
        {hasChanges && activeTab === 'profile' && (
          <div style={{
            background: '#fffbeb',
            border: '2px solid #fcd34d',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>💡</span>
              <span style={{ color: '#92400e', fontWeight: '600' }}>You have unsaved changes</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleCancelChanges}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'white',
                  border: '2px solid #fcd34d',
                  borderRadius: '8px',
                  color: '#92400e',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Discard
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Saving...' : 'Save Now'}
              </button>
            </div>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '280px 1fr',
          gap: '2rem'
        }}>
          
          {/* Sidebar */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: isMobile ? '1rem' : '1.5rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            height: 'fit-content'
          }}>
            {/* User Card */}
            <div style={{
              textAlign: 'center',
              paddingBottom: '1.5rem',
              marginBottom: '1.5rem',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2rem',
                fontWeight: '700',
                margin: '0 auto 1rem auto',
                boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
              }}>
                {profileData.firstName?.[0] || 'U'}{profileData.lastName?.[0] || ''}
              </div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 0.25rem 0'
              }}>
                {profileData.firstName} {profileData.lastName}
              </h3>
              <p style={{
                color: '#6b7280',
                margin: '0',
                fontSize: '0.875rem'
              }}>
                {profileData.email}
              </p>
            </div>

            <nav style={{
              display: 'flex',
              flexDirection: isMobile ? 'row' : 'column',
              gap: '0.5rem',
              overflowX: isMobile ? 'auto' : 'visible'
            }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'center' : 'flex-start',
                    gap: isMobile ? '0.25rem' : '0.75rem',
                    padding: isMobile ? '0.75rem 1rem' : '1rem',
                    background: activeTab === tab.id 
                      ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' 
                      : 'transparent',
                    border: activeTab === tab.id ? '2px solid #667eea' : '2px solid transparent',
                    borderRadius: '12px',
                    color: activeTab === tab.id ? '#667eea' : '#6b7280',
                    fontWeight: activeTab === tab.id ? '600' : '500',
                    fontSize: '0.9375rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    minWidth: isMobile ? '100px' : 'auto',
                    textAlign: isMobile ? 'center' : 'left'
                  }}
                  onMouseOver={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.background = '#f9fafb';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: isMobile ? '1.5rem' : '1.125rem' }}>{tab.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div>{tab.label}</div>
                    {!isMobile && activeTab === tab.id && (
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginTop: '0.125rem'
                      }}>
                        {tab.description}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </nav>

            {/* Quick Stats */}
            {!isMobile && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.75rem'
                }}>
                  Account Stats
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: '#6b7280' }}>Member since</span>
                    <span style={{ fontWeight: '600', color: '#111827' }}>2025</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: '#6b7280' }}>Transfers</span>
                    <span style={{ fontWeight: '600', color: '#111827' }}>0</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: isMobile ? '1.5rem' : '2rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            minHeight: '400px'
          }}>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <div style={{
                  marginBottom: '2rem',
                  paddingBottom: '1.5rem',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#111827',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Personal Information
                  </h2>
                  <p style={{
                    color: '#6b7280',
                    margin: 0,
                    fontSize: '0.9375rem'
                  }}>
                    Update your personal details and contact information
                  </p>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <InputField
                    label="First Name"
                    value={profileData.firstName}
                    onChange={(val) => handleProfileChange('firstName', val)}
                    placeholder="John"
                    required
                    error={validationErrors.firstName}
                    maxLength={50}
                  />
                  <InputField
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={(val) => handleProfileChange('lastName', val)}
                    placeholder="Doe"
                    required
                    error={validationErrors.lastName}
                    maxLength={50}
                  />
                  <InputField
                    label="Username"
                    value={profileData.username}
                    onChange={(val) => handleProfileChange('username', val)}
                    placeholder="johndoe"
                    error={validationErrors.username}
                    helperText="This will be your unique identifier"
                    maxLength={30}
                  />
                  <InputField
                    label="Email Address"
                    value={profileData.email}
                    type="email"
                    disabled={true}
                    onChange={() => {}}
                    helperText="Email cannot be changed for security"
                  />
                  <InputField
                    label="Phone Number"
                    value={profileData.phoneNumber}
                    onChange={(val) => handleProfileChange('phoneNumber', val)}
                    placeholder="+1 (555) 123-4567"
                    error={validationErrors.phoneNumber}
                    helperText="Include country code"
                    maxLength={20}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '1rem',
                  paddingTop: '1.5rem',
                  borderTop: '2px solid #e5e7eb'
                }}>
                  {hasChanges && (
                    <button
                      onClick={handleCancelChanges}
                      disabled={loading}
                      style={{
                        padding: '0.875rem 2rem',
                        background: 'white',
                        color: '#6b7280',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        if (!loading) {
                          e.currentTarget.style.borderColor = '#9ca3af';
                          e.currentTarget.style.color = '#374151';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!loading) {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.color = '#6b7280';
                        }
                      }}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading || !hasChanges}
                    style={{
                      background: loading || !hasChanges 
                        ? '#9ca3af' 
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '0.875rem 2rem',
                      fontWeight: '600',
                      fontSize: '1rem',
                      cursor: loading || !hasChanges ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: loading || !hasChanges ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)'
                    }}
                    onMouseOver={(e) => {
                      if (!loading && hasChanges) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!loading && hasChanges) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                      }
                    }}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <div style={{
                  marginBottom: '2rem',
                  paddingBottom: '1.5rem',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#111827',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Security Settings
                  </h2>
                  <p style={{
                    color: '#6b7280',
                    margin: 0,
                    fontSize: '0.9375rem'
                  }}>
                    Manage your password and security preferences
                  </p>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: isMobile ? '1.5rem' : '2rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    paddingBottom: '1.5rem',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.5rem',
                      flexShrink: 0
                    }}>
                      🔒
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        color: '#111827',
                        margin: '0 0 0.25rem 0'
                      }}>
                        Change Password
                      </h3>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: 0
                      }}>
                        Keep your account secure with a strong password
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }}>
                    <InputField
                      label="Current Password"
                      value={passwordData.currentPassword}
                      onChange={(val) => handlePasswordChange('currentPassword', val)}
                      type="password"
                      placeholder="Enter your current password"
                      required
                    />
                    
                    <div>
                      <InputField
                        label="New Password"
                        value={passwordData.newPassword}
                        onChange={(val) => handlePasswordChange('newPassword', val)}
                        type="password"
                        placeholder="At least 8 characters"
                        required
                      />
                      
                      {/* Password Strength Indicator */}
                      {passwordData.newPassword && (
                        <div style={{ marginTop: '1rem' }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.5rem'
                          }}>
                            <span style={{
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              color: '#374151'
                            }}>
                              Password Strength
                            </span>
                            <span style={{
                              fontSize: '0.875rem',
                              fontWeight: '700',
                              color: passwordStrength.color
                            }}>
                              {passwordStrength.text}
                            </span>
                          </div>
                          
                          {/* Strength Bar */}
                          <div style={{
                            width: '100%',
                            height: '8px',
                            background: '#e5e7eb',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            marginBottom: '1rem'
                          }}>
                            <div style={{
                              width: `${(passwordStrength.score / 5) * 100}%`,
                              height: '100%',
                              background: passwordStrength.color,
                              transition: 'all 0.3s ease',
                              borderRadius: '4px'
                            }} />
                          </div>

                          {/* Requirements Checklist */}
                          <div style={{
                            background: 'white',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <div style={{
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: '#6b7280',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              marginBottom: '0.75rem'
                            }}>
                              Requirements
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.5rem' }}>
                              {[
                                { label: '8+ characters', met: passwordStrength.checks?.length },
                                { label: 'Uppercase letter', met: passwordStrength.checks?.uppercase },
                                { label: 'Lowercase letter', met: passwordStrength.checks?.lowercase },
                                { label: 'Number', met: passwordStrength.checks?.number },
                                { label: 'Special character', met: passwordStrength.checks?.special }
                              ].map((req, idx) => (
                                <div key={idx} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  fontSize: '0.875rem'
                                }}>
                                  <span style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: req.met ? '#22c55e' : '#e5e7eb',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    flexShrink: 0
                                  }}>
                                    {req.met ? '✓' : ''}
                                  </span>
                                  <span style={{
                                    color: req.met ? '#15803d' : '#6b7280',
                                    fontWeight: req.met ? '600' : '400'
                                  }}>
                                    {req.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <InputField
                      label="Confirm New Password"
                      value={passwordData.confirmPassword}
                      onChange={(val) => handlePasswordChange('confirmPassword', val)}
                      type="password"
                      placeholder="Re-enter your new password"
                      required
                      error={
                        passwordData.confirmPassword && 
                        passwordData.newPassword !== passwordData.confirmPassword 
                          ? 'Passwords do not match' 
                          : ''
                      }
                    />
                  </div>

                  {/* Security Notice */}
                  <div style={{
                    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    border: '2px solid #fcd34d',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#fbbf24',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1rem',
                      flexShrink: 0
                    }}>
                      ⚠️
                    </div>
                    <div>
                      <div style={{ 
                        fontWeight: '700', 
                        color: '#92400e', 
                        fontSize: '0.9375rem', 
                        marginBottom: '0.25rem' 
                      }}>
                        Important Security Notice
                      </div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        color: '#92400e',
                        lineHeight: '1.6'
                      }}>
                        You will be automatically logged out after changing your password. You'll need to log in again with your new password.
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1rem',
                    paddingTop: '1rem',
                    borderTop: '2px solid #e5e7eb'
                  }}>
                    <button
                      onClick={() => {
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        setError('');
                      }}
                      disabled={loading}
                      style={{
                        padding: '0.875rem 2rem',
                        background: 'white',
                        color: '#6b7280',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleSavePassword}
                      disabled={
                        loading || 
                        !passwordData.currentPassword || 
                        !passwordData.newPassword || 
                        !passwordData.confirmPassword ||
                        passwordData.newPassword !== passwordData.confirmPassword ||
                        passwordStrength.score < 3
                      }
                      style={{
                        background: (
                          loading || 
                          !passwordData.currentPassword || 
                          !passwordData.newPassword || 
                          passwordStrength.score < 3
                        ) 
                          ? '#9ca3af' 
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.875rem 2rem',
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: (
                          loading || 
                          !passwordData.currentPassword || 
                          !passwordData.newPassword || 
                          passwordStrength.score < 3
                        ) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: (
                          loading || 
                          !passwordData.currentPassword || 
                          passwordStrength.score < 3
                        ) ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)'
                      }}
                      onMouseOver={(e) => {
                        if (
                          !loading && 
                          passwordData.currentPassword && 
                          passwordData.newPassword &&
                          passwordStrength.score >= 3
                        ) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!loading && passwordStrength.score >= 3) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                        }
                      }}
                    >
                      {loading ? 'Updating...' : 'Change Password'}
                    </button>
                  </div>
                </div>

                {/* Additional Security Options */}
                <div style={{ marginTop: '2rem' }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '1rem'
                  }}>
                    Additional Security
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gap: '1rem'
                  }}>
                    {/* Two-Factor Authentication */}
                    <div style={{
                      background: 'white',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '1rem',
                          fontWeight: '700',
                          color: '#111827',
                          marginBottom: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span>Two-Factor Authentication</span>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            background: '#fef3c7',
                            color: '#92400e',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            borderRadius: '6px'
                          }}>
                            Coming Soon
                          </span>
                        </div>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          lineHeight: '1.5'
                        }}>
                          Add an extra layer of security to your account
                        </div>
                      </div>
                      <button
                        disabled
                        style={{
                          padding: '0.5rem 1.25rem',
                          background: '#f3f4f6',
                          color: '#9ca3af',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          cursor: 'not-allowed'
                        }}
                      >
                        Enable
                      </button>
                    </div>

                    {/* Login History */}
                    <div style={{
                      background: 'white',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '1rem',
                          fontWeight: '700',
                          color: '#111827',
                          marginBottom: '0.25rem'
                        }}>
                          Login History
                        </div>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          lineHeight: '1.5'
                        }}>
                          View your recent login activity
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('activity')}
                        style={{
                          padding: '0.5rem 1.25rem',
                          background: 'white',
                          color: '#667eea',
                          border: '2px solid #667eea',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#667eea';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.color = '#667eea';
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <div style={{
                  marginBottom: '2rem',
                  paddingBottom: '1.5rem',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#111827',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Account Activity
                  </h2>
                  <p style={{
                    color: '#6b7280',
                    margin: 0,
                    fontSize: '0.9375rem'
                  }}>
                    Monitor your recent account activity and sessions
                  </p>
                </div>

                {/* Coming Soon Message */}
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 1rem'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto',
                    fontSize: '2.5rem'
                  }}>
                    📊
                  </div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '0.5rem'
                  }}>
                    Activity Tracking Coming Soon
                  </h3>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '0.9375rem',
                    maxWidth: '400px',
                    margin: '0 auto',
                    lineHeight: '1.6'
                  }}>
                    We're working on bringing you detailed activity logs, login history, and security insights.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          [style*="gridTemplateColumns: 280px 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default UserProfile;