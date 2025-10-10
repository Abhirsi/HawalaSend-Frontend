import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HeroBanner = ({ onGetStarted }) => {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    if (onGetStarted) onGetStarted();
    else navigate('/transfers');
  };

  return (
    <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', mb: 4 }}>
      <Box sx={{
        backgroundImage: `url('/hero.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: { xs: 260, md: 360 },
        filter: 'brightness(0.88)'
      }} />
      <Box sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        textAlign: 'center'
      }}>
        <Box sx={{ maxWidth: 900, color: 'common.white', zIndex: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Send money to your loved ones
          </Typography>
          <Typography sx={{ mb: 2, opacity: 0.95 }}>
            Reach beyond borders and be there for those you love.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            sx={{ borderRadius: 8, px: 4, background: 'linear-gradient(135deg,#667eea,#764ba2)' }}
          >
            Get started
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default HeroBanner;