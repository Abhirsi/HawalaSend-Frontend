import React, { useState, useEffect } from 'react';
import LandingNavbar from '../components/Landing/LandingNavbar';
import HeroSection from '../components/Landing/HeroSection';
import CalculatorSection from '../components/Landing/CalculatorSection';
import TestimonialsSection from '../components/Landing/TestimonialsSection';
import DownloadAppSection from '../components/Landing/DownloadAppSection';
import LandingFooter from '../components/Landing/LandingFooter';
import LoginModal from '../components/Auth/Login';

const LandingPage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      margin: '-16px -24px',
      padding: 0,
      overflowX: 'hidden'
    }}>
      <LandingNavbar onLoginClick={() => setShowLoginModal(true)} isMobile={isMobile} />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '40px 16px' : '60px 20px'
      }}>
        <HeroSection isMobile={isMobile} />
        <CalculatorSection onGetStarted={() => setShowLoginModal(true)} isMobile={isMobile} />
        <TestimonialsSection isMobile={isMobile} />
        <DownloadAppSection isMobile={isMobile} />
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