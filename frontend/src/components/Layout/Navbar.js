import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Dashboard, AccountCircle, ExitToApp } from '@mui/icons-material';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

 return (
  <AppBar position="static" elevation={0} sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', boxShadow: '0 4px 20px rgba(25, 118, 210, 0.2)' }}>
    <Toolbar sx={{ px: { xs: 1, sm: 2 }, py: 1 }}>
      <Typography
        variant="h6"
        component={Link}
        to="/"
        sx={{ 
          flexGrow: 1, 
          textDecoration: 'none', 
          color: 'white', 
          fontWeight: 700,
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}
      >
        HawalaSend
      </Typography>

      {currentUser ? (
        <>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
            <Button
              color="inherit"
              component={Link}
              to="/dashboard"
              startIcon={<Dashboard />}
              sx={{ 
                textTransform: 'none', 
                borderRadius: 2, 
                px: 2, 
                py: 0.5,
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
              }}
            >
              Dashboard
            </Button>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
              }}
            >
              <Avatar sx={{ width: 36, height: 36, fontSize: '1rem' }}>
                {currentUser.username?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 1 }}>
            <IconButton
              size="large"
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                width: 220,
                overflow: 'visible',
                mt: 1.5,
                borderRadius: 2,
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => navigate('/profile')} sx={{ px: 2, py: 1.5, '&:hover': { backgroundColor: 'grey.100' } }}>
              <AccountCircle sx={{ mr: 2 }} /> Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ px: 2, py: 1.5, color: 'error.main', '&:hover': { backgroundColor: 'error.50' } }}>
              <ExitToApp sx={{ mr: 2 }} /> Logout
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
          <Button color="inherit" component={Link} to="/login" sx={{ textTransform: 'none', borderRadius: 2 }}>
            Login
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/register"
            sx={{ 
              textTransform: 'none', 
              borderRadius: 2, 
              px: 2, 
              py: 0.5,
              display: { xs: 'none', sm: 'inline-flex' },
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            Register
          </Button>
        </Box>
      )}
    </Toolbar>
  </AppBar>
);
 
};

export default Navbar;