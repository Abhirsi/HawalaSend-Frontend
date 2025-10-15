import React from 'react';

const HeroSection = ({ isMobile }) => {
  return (
    <div style={{ textAlign: 'center', marginBottom: isMobile ? '40px' : '50px' }}>
      <h1 style={{
        fontSize: isMobile ? '2rem' : '3.5rem',
        fontWeight: '800',
        color: 'white',
        margin: '0 0 20px 0',
        lineHeight: 1.2,
        padding: isMobile ? '0 10px' : '0'
      }}>
        Send Money Home<br/>in Seconds
      </h1>
      <p style={{
        fontSize: isMobile ? '1rem' : '1.5rem',
        color: 'rgba(255, 255, 255, 0.95)',
        margin: '0 0 30px 0',
        fontWeight: '500',
        padding: isMobile ? '0 10px' : '0'
      }}>
        Zero fees • Best rates • Instant delivery
      </p>
      
      <div style={{
        display: 'flex',
        gap: isMobile ? '8px' : '16px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        padding: isMobile ? '0 10px' : '0'
      }}>
        {[
          { icon: '✨', text: '$0 Fees' },
          { icon: '⚡', text: 'Instant' },
          { icon: '💰', text: 'Best Rates' }
        ].map((badge, idx) => (
          <div key={idx} style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            padding: isMobile ? '10px 16px' : '12px 20px',
            borderRadius: '10px',
            color: 'white',
            fontWeight: '600',
            fontSize: isMobile ? '0.8125rem' : '0.9375rem',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            {badge.icon} {badge.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;