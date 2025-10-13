import React from 'react';

const DownloadAppSection = () => {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: window.innerWidth > 768 ? '50px' : '32px',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      <h2
        style={{
          fontSize: window.innerWidth > 768 ? '2.5rem' : '1.75rem',
          fontWeight: '700',
          color: 'white',
          margin: '0 0 16px 0',
        }}
      >
        Download Our Mobile App
      </h2>
      <p
        style={{
          fontSize: '1.125rem',
          color: 'rgba(255, 255, 255, 0.95)',
          marginBottom: '32px',
          maxWidth: '600px',
          margin: '0 auto 32px auto',
        }}
      >
        Send money on the go. Available on iOS and Android.
      </p>

      <div
        style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* --- App Store Button --- */}
        <a
          href="https://apps.apple.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 28px',
            background: 'white',
            color: '#111827',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.25)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.6875rem', color: '#6b7280' }}>Download on the</div>
            <div style={{ fontSize: '1.125rem', fontWeight: '700' }}>App Store</div>
          </div>
        </a>

        {/* --- Google Play Button --- */}
        <a
          href="https://play.google.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 28px',
            background: 'white',
            color: '#111827',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.25)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
          </svg>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.6875rem', color: '#6b7280' }}>GET IT ON</div>
            <div style={{ fontSize: '1.125rem', fontWeight: '700' }}>Google Play</div>
          </div>
        </a>
      </div>
    </div>
  );
};

export default DownloadAppSection;
