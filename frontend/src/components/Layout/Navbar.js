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
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
        >
          HawalaSend
        </Typography>

        {currentUser ? (
          <>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              <Button
                color="inherit"
                component={Link}
                to="/dashboard"
                startIcon={<Dashboard />}
              >
                Dashboard
              </Button>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                onClick={handleMenuOpen}
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {currentUser.username?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Box>

            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                color="inherit"
                onClick={handleMenuOpen}
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
                  width: 200,
                  overflow: 'visible',
                  mt: 1.5,
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
              <MenuItem onClick={() => navigate('/profile')}>
                <AccountCircle sx={{ mr: 1 }} /> Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/register"
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
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