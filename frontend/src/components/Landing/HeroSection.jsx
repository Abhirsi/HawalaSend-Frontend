import React from 'react';

const HeroSection = () => {
  return (
    <div style={{ textAlign: 'center', marginBottom: '50px' }}>
      <h1 style={{
        fontSize: window.innerWidth > 768 ? '3.5rem' : '2.5rem',
        fontWeight: '800',
        color: 'white',
        margin: '0 0 20px 0',
        lineHeight: 1.1
      }}>
        Send Money Home<br/>in Seconds
      </h1>
      <p style={{
        fontSize: window.innerWidth > 768 ? '1.5rem' : '1.125rem',
        color: 'rgba(255, 255, 255, 0.95)',
        margin: '0 0 30px 0',
        fontWeight: '500'
      }}>
        Zero fees • Best exchange rates • Instant delivery
      </p>
      
      <div style={{
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {[
          { icon: '✨', text: '$0 Fees' },
          { icon: '⚡', text: 'Instant Transfer' },
          { icon: '💰', text: 'Best Rates' }
        ].map((badge, idx) => (
          <div key={idx} style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            padding: '12px 20px',
            borderRadius: '10px',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.9375rem',
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