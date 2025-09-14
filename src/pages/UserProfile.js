import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: ''
  });
  
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    pin: '',
    newPin: '',
    confirmPin: ''
  });
  
  const [notifications, setNotifications] = useState({
    emailTransfers: true,
    smsTransfers: false,
    emailLogin: true,
    smsLogin: false,
    emailPromotions: false,
    smsPromotions: false
  });
  
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Initialize form data with current user info
    setProfileData({
      firstName: currentUser.first_name || '',
      lastName: currentUser.last_name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      username: currentUser.username || ''
    });
  }, [currentUser, navigate]);

  const handleInputChange = (section, field, value) => {
    if (section === 'profile') {
      setProfileData(prev => ({ ...prev, [field]: value }));
    } else if (section === 'security') {
      setSecurityData(prev => ({ ...prev, [field]: value }));
    } else if (section === 'notifications') {
      setNotifications(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear validation errors when user types
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateProfile = () => {
    const errors = {};
    
    if (!profileData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!profileData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!profileData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!profileData.username.trim()) {
      errors.username = 'Username is required';
    } else if (profileData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSecurity = () => {
    const errors = {};
    
    if (securityData.newPassword) {
      if (!securityData.currentPassword) {
        errors.currentPassword = 'Current password is required';
      }
      if (securityData.newPassword.length < 6) {
        errors.newPassword = 'New password must be at least 6 characters';
      }
      if (securityData.newPassword !== securityData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (securityData.newPin) {
      if (securityData.newPin.length < 4) {
        errors.newPin = 'PIN must be at least 4 digits';
      }
      if (securityData.newPin !== securityData.confirmPin) {
        errors.confirmPin = 'PINs do not match';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (section) => {
    setLoading(true);
    
    try {
      let isValid = true;
      
      if (section === 'profile') {
        isValid = validateProfile();
      } else if (section === 'security') {
        isValid = validateSecurity();
      }
      
      if (!isValid) {
        setLoading(false);
        return;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      if (section === 'security') {
        setSecurityData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          pin: '',
          newPin: '',
          confirmPin: ''
        });
      }
    } catch (error) {
      setValidationErrors({ general: 'Failed to save changes. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (confirmed) {
      const doubleConfirmed = window.confirm(
        'This will permanently delete all your data. Are you absolutely sure?'
      );
      
      if (doubleConfirmed) {
        // In a real app, this would call an API
        alert('Account deletion would be processed. (Demo only)');
      }
    }
  };

  const renderProfileTab = () => (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '2rem',
          fontWeight: '700',
          marginRight: '1.5rem'
        }}>
          {profileData.firstName?.[0] || 'U'}{profileData.lastName?.[0] || ''}
        </div>
        <div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#171717',
            margin: '0 0 0.25rem 0'
          }}>
            {profileData.firstName} {profileData.lastName}
          </h2>
          <p style={{
            color: '#737373',
            margin: '0',
            fontSize: '1rem'
          }}>
            @{profileData.username}
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
      }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            First Name
          </label>
          <input
            type="text"
            value={profileData.firstName}
            onChange={(e) => handleInputChange('profile', 'firstName', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: `2px solid ${validationErrors.firstName ? '#ef4444' : '#e5e5e5'}`,
              borderRadius: '12px',
              fontSize: '1rem',
              transition: 'all 0.2s ease',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              if (!validationErrors.firstName) {
                e.target.style.borderColor = '#0ea5e9';
              }
            }}
            onBlur={(e) => {
              if (!validationErrors.firstName) {
                e.target.style.borderColor = '#e5e5e5';
              }
            }}
          />
          {validationErrors.firstName && (
            <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
              {validationErrors.firstName}
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
            Last Name
          </label>
          <input
            type="text"
            value={profileData.lastName}
            onChange={(e) => handleInputChange('profile', 'lastName', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: `2px solid ${validationErrors.lastName ? '#ef4444' : '#e5e5e5'}`,
              borderRadius: '12px',
              fontSize: '1rem',
              transition: 'all 0.2s ease',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              if (!validationErrors.lastName) {
                e.target.style.borderColor = '#0ea5e9';
              }
            }}
            onBlur={(e) => {
              if (!validationErrors.lastName) {
                e.target.style.borderColor = '#e5e5e5';
              }
            }}
          />
          {validationErrors.lastName && (
            <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
              {validationErrors.lastName}
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
            Username
          </label>
          <input
            type="text"
            value={profileData.username}
            onChange={(e) => handleInputChange('profile', 'username', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: `2px solid ${validationErrors.username ? '#ef4444' : '#e5e5e5'}`,
              borderRadius: '12px',
              fontSize: '1rem',
              transition: 'all 0.2s ease',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              if (!validationErrors.username) {
                e.target.style.borderColor = '#0ea5e9';
              }
            }}
            onBlur={(e) => {
              if (!validationErrors.username) {
                e.target.style.borderColor = '#e5e5e5';
              }
            }}
          />
          {validationErrors.username && (
            <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
              {validationErrors.username}
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
            Email Address
          </label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: `2px solid ${validationErrors.email ? '#ef4444' : '#e5e5e5'}`,
              borderRadius: '12px',
              fontSize: '1rem',
              transition: 'all 0.2s ease',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              if (!validationErrors.email) {
                e.target.style.borderColor = '#0ea5e9';
              }
            }}
            onBlur={(e) => {
              if (!validationErrors.email) {
                e.target.style.borderColor = '#e5e5e5';
              }
            }}
          />
          {validationErrors.email && (
            <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
              {validationErrors.email}
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
            Phone Number
          </label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '2px solid #e5e5e5',
              borderRadius: '12px',
              fontSize: '1rem',
              transition: 'all 0.2s ease',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
            onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
          />
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '2rem',
        gap: '1rem'
      }}>
        <button
          onClick={() => handleSave('profile')}
          disabled={loading}
          style={{
            background: '#0ea5e9',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '0.75rem 2rem',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.target.style.background = '#0284c7';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.target.style.background = '#0ea5e9';
              e.target.style.transform = 'translateY(0px)';
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
              Saving...
            </>
          ) : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{
        display: 'grid',
        gap: '2rem'
      }}>
        {/* Password Section */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e5e5e5',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#171717',
            margin: '0 0 1rem 0'
          }}>
            Change Password
          </h3>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Current Password
              </label>
              <input
                type="password"
                value={securityData.currentPassword}
                onChange={(e) => handleInputChange('security', 'currentPassword', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: `2px solid ${validationErrors.currentPassword ? '#ef4444' : '#e5e5e5'}`,
                  borderRadius: '12px',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  if (!validationErrors.currentPassword) {
                    e.target.style.borderColor = '#0ea5e9';
                  }
                }}
                onBlur={(e) => {
                  if (!validationErrors.currentPassword) {
                    e.target.style.borderColor = '#e5e5e5';
                  }
                }}
              />
              {validationErrors.currentPassword && (
                <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  {validationErrors.currentPassword}
                </span>
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={securityData.newPassword}
                  onChange={(e) => handleInputChange('security', 'newPassword', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: `2px solid ${validationErrors.newPassword ? '#ef4444' : '#e5e5e5'}`,
                    borderRadius: '12px',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    if (!validationErrors.newPassword) {
                      e.target.style.borderColor = '#0ea5e9';
                    }
                  }}
                  onBlur={(e) => {
                    if (!validationErrors.newPassword) {
                      e.target.style.borderColor = '#e5e5e5';
                    }
                  }}
                />
                {validationErrors.newPassword && (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    {validationErrors.newPassword}
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
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={securityData.confirmPassword}
                  onChange={(e) => handleInputChange('security', 'confirmPassword', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: `2px solid ${validationErrors.confirmPassword ? '#ef4444' : '#e5e5e5'}`,
                    borderRadius: '12px',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    if (!validationErrors.confirmPassword) {
                      e.target.style.borderColor = '#0ea5e9';
                    }
                  }}
                  onBlur={(e) => {
                    if (!validationErrors.confirmPassword) {
                      e.target.style.borderColor = '#e5e5e5';
                    }
                  }}
                />
                {validationErrors.confirmPassword && (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    {validationErrors.confirmPassword}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PIN Section */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e5e5e5',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#171717',
            margin: '0 0 1rem 0'
          }}>
            Change PIN
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                New PIN
              </label>
              <input
                type="text"
                value={securityData.newPin}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                  handleInputChange('security', 'newPin', numericValue);
                }}
                placeholder="4-6 digits"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: `2px solid ${validationErrors.newPin ? '#ef4444' : '#e5e5e5'}`,
                  borderRadius: '12px',
                  fontSize: '1rem',
                  textAlign: 'center',
                  letterSpacing: '0.25rem',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  if (!validationErrors.newPin) {
                    e.target.style.borderColor = '#0ea5e9';
                  }
                }}
                onBlur={(e) => {
                  if (!validationErrors.newPin) {
                    e.target.style.borderColor = '#e5e5e5';
                  }
                }}
              />
              {validationErrors.newPin && (
                <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  {validationErrors.newPin}
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
                Confirm PIN
              </label>
              <input
                type="text"
                value={securityData.confirmPin}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                  handleInputChange('security', 'confirmPin', numericValue);
                }}
                placeholder="Repeat PIN"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: `2px solid ${validationErrors.confirmPin ? '#ef4444' : '#e5e5e5'}`,
                  borderRadius: '12px',
                  fontSize: '1rem',
                  textAlign: 'center',
                  letterSpacing: '0.25rem',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  if (!validationErrors.confirmPin) {
                    e.target.style.borderColor = '#0ea5e9';
                  }
                }}
                onBlur={(e) => {
                  if (!validationErrors.confirmPin) {
                    e.target.style.borderColor = '#e5e5e5';
                  }
                }}
              />
              {validationErrors.confirmPin && (
                <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  {validationErrors.confirmPin}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem'
        }}>
          <button
            onClick={() => handleSave('security')}
            disabled={loading}
            style={{
              background: '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem 2rem',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.background = '#0284c7';
                e.target.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.background = '#0ea5e9';
                e.target.style.transform = 'translateY(0px)';
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
                Updating...
              </>
            ) : 'Update Security'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* Email Notifications */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e5e5e5',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#171717',
            margin: '0 0 1rem 0'
          }}>
            Email Notifications
          </h3>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {[
              { key: 'emailTransfers', label: 'Transfer notifications', desc: 'Get notified when you send or receive money' },
              { key: 'emailLogin', label: 'Login alerts', desc: 'Security notifications for account access' },
              { key: 'emailPromotions', label: 'Promotions and updates', desc: 'Special offers and product updates' }
            ].map(item => (
              <div key={item.key} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e5e5'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#171717',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {item.label}
                  </h4>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#737373',
                    margin: '0'
                  }}>
                    {item.desc}
                  </p>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '48px',
                  height: '24px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={notifications[item.key]}
                    onChange={(e) => handleInputChange('notifications', item.key, e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: notifications[item.key] ? '#0ea5e9' : '#e5e5e5',
                    borderRadius: '24px',
                    transition: 'all 0.2s ease',
                    '::before': {
                      content: '""',
                      position: 'absolute',
                      height: '20px',
                      width: '20px',
                      left: notifications[item.key] ? '26px' : '2px',
                      bottom: '2px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: 'all 0.2s ease'
                    }
                  }}>
                    <div style={{
                      position: 'absolute',
                      height: '20px',
                      width: '20px',
                      left: notifications[item.key] ? '26px' : '2px',
                      bottom: '2px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: 'all 0.2s ease'
                    }} />
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* SMS Notifications */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e5e5e5',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#171717',
            margin: '0 0 1rem 0'
          }}>
            SMS Notifications
          </h3>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {[
              { key: 'smsTransfers', label: 'Transfer alerts', desc: 'Text message notifications for transfers' },
              { key: 'smsLogin', label: 'Login security', desc: 'SMS alerts for account access' },
              { key: 'smsPromotions', label: 'Promotional messages', desc: 'Special offers via text message' }
            ].map(item => (
              <div key={item.key} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e5e5'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#171717',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {item.label}
                  </h4>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#737373',
                    margin: '0'
                  }}>
                    {item.desc}
                  </p>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '48px',
                  height: '24px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={notifications[item.key]}
                    onChange={(e) => handleInputChange('notifications', item.key, e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: notifications[item.key] ? '#0ea5e9' : '#e5e5e5',
                    borderRadius: '24px',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{
                      position: 'absolute',
                      height: '20px',
                      width: '20px',
                      left: notifications[item.key] ? '26px' : '2px',
                      bottom: '2px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: 'all 0.2s ease'
                    }} />
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => handleSave('notifications')}
            disabled={loading}
            style={{
              background: '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem 2rem',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.background = '#0284c7';
                e.target.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.background = '#0ea5e9';
                e.target.style.transform = 'translateY(0px)';
              }
            }}
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderDangerZoneTab = () => (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        padding: '2rem'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: '#dc2626',
          margin: '0 0 1rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          ⚠️ Danger Zone
        </h3>

        <p style={{
          color: '#737373',
          marginBottom: '2rem',
          fontSize: '1rem',
          lineHeight: '1.6'
        }}>
          Once you delete your account, there is no going back. Please be certain.
        </p>

        <div style={{
          background: 'white',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#171717',
            margin: '0 0 0.5rem 0'
          }}>
            What will be deleted:
          </h4>
          <ul style={{
            color: '#737373',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            margin: '0',
            paddingLeft: '1.5rem'
          }}>
            <li>All your personal information</li>
            <li>Transaction history</li>
            <li>Account settings and preferences</li>
            <li>Any pending transfers</li>
          </ul>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-start'
        }}>
          <button
            onClick={handleDeleteAccount}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem 2rem',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#b91c1c';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#dc2626';
              e.target.style.transform = 'translateY(0px)';
            }}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'danger', label: 'Danger Zone', icon: '⚠️' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      padding: '2rem 1rem',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {/* Header */}
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
              fontSize: '1.25rem',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#f8fafc'}
            onMouseOut={(e) => e.target.style.background = 'white'}
          >
            ←
          </button>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: '#171717',
            margin: '0'
          }}>
            Account Settings
          </h1>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '2rem',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>✅</span>
              <span style={{ color: '#15803d', fontWeight: '600' }}>
                Settings saved successfully!
              </span>
            </div>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth > 768 ? '250px 1fr' : '1fr',
          gap: '2rem'
        }}>
          {/* Sidebar Navigation */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            height: 'fit-content'
          }}>
            <nav style={{
              display: 'flex',
              flexDirection: window.innerWidth > 768 ? 'column' : 'row',
              gap: '0.5rem',
              overflowX: window.innerWidth > 768 ? 'visible' : 'auto'
            }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: activeTab === tab.id ? '#f0f9ff' : 'transparent',
                    border: activeTab === tab.id ? '2px solid #0ea5e9' : '2px solid transparent',
                    borderRadius: '12px',
                    color: activeTab === tab.id ? '#0ea5e9' : '#737373',
                    fontWeight: activeTab === tab.id ? '600' : '500',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    minWidth: window.innerWidth > 768 ? 'auto' : '120px'
                  }}
                  onMouseOver={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.background = '#f8fafc';
                      e.target.style.color = '#525252';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#737373';
                    }
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            minHeight: '500px'
          }}>
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'security' && renderSecurityTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'danger' && renderDangerZoneTab()}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          [style*="gridTemplateColumns: 250px 1fr"] {
            grid-template-columns: 1fr !important;
          }
          [style*="flexDirection: column"] {
            flex-direction: row !important;
          }
        }
      `}</style>
    </div>
  );
};

export default UserProfile;