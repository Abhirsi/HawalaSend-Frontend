import React, { useState } from 'react';
import LandingNavbar from '../components/Landing/LandingNavbar';
import HeroSection from '../components/Landing/HeroSection';
import CalculatorSection from '../components/Landing/CalculatorSection';
import TestimonialsSection from '../components/Landing/TestimonialsSection';
import DownloadAppSection from '../components/Landing/DownloadAppSection';
import LandingFooter from '../components/Landing/LandingFooter';
import LoginModal from '../components/Auth/Login';

const LandingPage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      margin: '-16px -24px',
      padding: 0,
      overflowX: 'hidden'
    }}>
      <LandingNavbar onLoginClick={() => setShowLoginModal(true)} />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 20px'
      }}>
        <HeroSection />
        <CalculatorSection onGetStarted={() => setShowLoginModal(true)} />
        <TestimonialsSection />
        <DownloadAppSection />
        <LandingFooter />
      </div>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  );
};

export default LandingPage;