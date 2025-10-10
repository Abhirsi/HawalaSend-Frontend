import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

// InputField component - MUST be outside
const InputField = React.memo(({ label, value, onChange, type = 'text', placeholder, disabled = false }) => {
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
        {label}
      </label>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        style={{
          width: '100%',
          padding: '0.875rem 1rem',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          fontSize: '1rem',
          transition: 'all 0.2s ease',
          outline: 'none',
          boxSizing: 'border-box',
          backgroundColor: disabled ? '#f9fafb' : 'white',
          color: disabled ? '#9ca3af' : '#111827'
        }}
        onFocus={(e) => !disabled && (e.target.style.borderColor = '#667eea')}
        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
      />
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
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    username: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setProfileData({
      firstName: currentUser.firstName || '',
      lastName: currentUser.lastName || '',
      email: currentUser.email || '',
      phoneNumber: currentUser.phoneNumber || '',
      username: currentUser.username || ''
    });
  }, [currentUser, navigate]);

  const handleProfileChange = React.useCallback((field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    setError('');
  }, []);

  const handlePasswordChange = React.useCallback((field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    setError('');
  }, []);

  const handleSaveProfile = React.useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5001/users/profile', {
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
      
      if (!response.ok) throw new Error('Failed to update profile');
      
      await refreshAuth();
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      setError('Failed to update profile. Please try again.');
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

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setSuccess('Password changed successfully! Redirecting to login...');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  }, [passwordData, logout, navigate]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      padding: '2rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
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
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            color: '#111827',
            margin: 0
          }}>
            Account Settings
          </h1>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <span style={{ fontSize: '1.25rem' }}>✓</span>
            <span style={{ color: '#15803d', fontWeight: '600' }}>{success}</span>
          </div>
        )}

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <span style={{ color: '#dc2626', fontWeight: '600' }}>{error}</span>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth > 768 ? '200px 1fr' : '1fr',
          gap: '2rem'
        }}>
          
          {/* Sidebar */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            height: 'fit-content'
          }}>
            <nav style={{
              display: 'flex',
              flexDirection: window.innerWidth > 768 ? 'column' : 'row',
              gap: '0.5rem'
            }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.875rem 1rem',
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
                    flex: window.innerWidth > 768 ? 'none' : '1'
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
                  <span style={{ fontSize: '1.125rem' }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            minHeight: '400px'
          }}>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '2rem',
                  paddingBottom: '2rem',
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
                    marginRight: '1.5rem'
                  }}>
                    {profileData.firstName?.[0] || 'U'}{profileData.lastName?.[0] || ''}
                  </div>
                  <div>
                    <h2 style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#111827',
                      margin: '0 0 0.25rem 0'
                    }}>
                      {profileData.firstName} {profileData.lastName}
                    </h2>
                    <p style={{
                      color: '#6b7280',
                      margin: '0',
                      fontSize: '0.875rem'
                    }}>
                      @{profileData.username}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <InputField
                    label="First Name"
                    value={profileData.firstName}
                    onChange={(val) => handleProfileChange('firstName', val)}
                    placeholder="John"
                  />
                  <InputField
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={(val) => handleProfileChange('lastName', val)}
                    placeholder="Doe"
                  />
                  <InputField
                    label="Username"
                    value={profileData.username}
                    onChange={(val) => handleProfileChange('username', val)}
                    placeholder="johndoe"
                  />
                  <InputField
                    label="Email Address"
                    value={profileData.email}
                    type="email"
                    disabled={true}
                    onChange={() => {}}
                  />
                  <InputField
                    label="Phone Number"
                    value={profileData.phoneNumber}
                    onChange={(val) => handleProfileChange('phoneNumber', val)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '0.875rem 2rem',
                      fontWeight: '600',
                      fontSize: '1rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
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
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: '2rem'
                }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#111827',
                    margin: '0 0 1.5rem 0'
                  }}>
                    Change Password
                  </h3>

                  <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }}>
                    <InputField
                      label="Current Password"
                      value={passwordData.currentPassword}
                      onChange={(val) => handlePasswordChange('currentPassword', val)}
                      type="password"
                      placeholder="Enter current password"
                    />
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1.5rem'
                    }}>
                      <InputField
                        label="New Password"
                        value={passwordData.newPassword}
                        onChange={(val) => handlePasswordChange('newPassword', val)}
                        type="password"
                        placeholder="At least 8 characters"
                      />
                      <InputField
                        label="Confirm New Password"
                        value={passwordData.confirmPassword}
                        onChange={(val) => handlePasswordChange('confirmPassword', val)}
                        type="password"
                        placeholder="Re-enter new password"
                      />
                    </div>
                  </div>

                  <div style={{
                    background: 'white',
                    border: '2px solid #667eea',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.25rem',
                      flexShrink: 0
                    }}>
                      🔒
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.875rem', marginBottom: '0.125rem' }}>
                        Security Notice
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        You'll be logged out after changing your password
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end'
                  }}>
                    <button
                      onClick={handleSavePassword}
                      disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.875rem 2rem',
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: loading || !passwordData.currentPassword || !passwordData.newPassword ? 'not-allowed' : 'pointer',
                        opacity: loading || !passwordData.currentPassword || !passwordData.newPassword ? 0.5 : 1,
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                      }}
                      onMouseOver={(e) => {
                        if (!loading && passwordData.currentPassword && passwordData.newPassword) {
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
                      {loading ? 'Updating...' : 'Change Password'}
                    </button>
                  </div>
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

        @media (max-width: 768px) {
          [style*="gridTemplateColumns: 200px 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default UserProfile;