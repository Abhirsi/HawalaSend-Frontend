import React from 'react';

const LandingFooter = () => {
  return (
    <div style={{
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.8)',
      marginTop: '60px',
      paddingTop: '40px',
      borderTop: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <p style={{ fontSize: '0.875rem', margin: '0 0 8px 0' }}>
        © 2025 TapTap Send. All rights reserved.
      </p>
      <p style={{ fontSize: '0.8125rem', margin: 0 }}>
        Licensed money service business. Your funds are protected.
      </p>
    </div>
  );
};

export default LandingFooter;