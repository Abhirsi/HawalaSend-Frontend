// frontend/src/components/Layout/Navbar.js - Navigation component with user menu
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import the useAuth hook (goes up 2 directories: Layout -> components -> src)
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
  // FIXED: Use the useAuth hook instead of useContext directly
  const { currentUser, logout } = useAuth(); // This replaces the useContext(AuthContext) approach
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null); // Controls the dropdown menu state

  // Open the user dropdown menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close the user dropdown menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function from AuthContext
      navigate('/login'); // Redirect to login page
      handleMenuClose(); // Close the dropdown menu
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login'); // Navigate to login even if logout fails
    }
  };

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        {/* App Logo/Title */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
        >
          HawalaSend {/* UPDATED: Changed from "MyApp" to match your brand */}
        </Typography>

        {/* Show user menu if logged in */}
        {currentUser ? (
          <>
            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              <Button
                color="inherit"
                component={Link}
                to="/dashboard"
                startIcon={<Dashboard />}
              >
                Dashboard
              </Button>
              
              {/* User Avatar Button */}
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                onClick={handleMenuOpen}
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {/* FIXED: Use firstName or fallback to first letter of email */}
                  {currentUser?.firstName?.charAt(0)?.toUpperCase() || 
                   currentUser?.first_name?.charAt(0)?.toUpperCase() || 
                   currentUser?.username?.charAt(0)?.toUpperCase() || 
                   currentUser?.email?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Box>

            {/* Mobile Navigation */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                color="inherit"
                onClick={handleMenuOpen}
              >
                <MenuIcon />
              </IconButton>
            </Box>

            {/* User Dropdown Menu */}
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
                  // Arrow pointing to the avatar button
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
              {/* Profile Menu Item */}
              <MenuItem onClick={() => {
                navigate('/user-profile'); // FIXED: Navigate to your actual UserProfile route
                handleMenuClose();
              }}>
                <AccountCircle sx={{ mr: 1 }} /> Profile
              </MenuItem>
              
              {/* ADDED: Additional menu items */}
              <MenuItem onClick={() => {
                navigate('/transfer');
                handleMenuClose();
              }}>
                <Dashboard sx={{ mr: 1 }} /> Transfer Funds
              </MenuItem>
              
              <MenuItem onClick={() => {
                navigate('/transactions');
                handleMenuClose();
              }}>
                <Dashboard sx={{ mr: 1 }} /> Transactions
              </MenuItem>
              
              <Divider />
              
              {/* Logout Menu Item */}
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          /* Show login/register buttons if not logged in */
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

/*
FUTURE REFERENCE NOTES:
======================

1. IMPORT PATH STRUCTURE:
   - From components/Layout/Navbar.js to context/AuthContext.js
   - Path: ../../context/AuthContext (up 2 directories)
   - Layout -> components -> src -> context

2. AUTH CONTEXT USAGE:
   - Always use useAuth() hook, not useContext(AuthContext) directly
   - Available properties: currentUser, logout, login, loading
   - currentUser has: id, email, firstName, lastName, username, balance

3. NAVIGATION ROUTES IN YOUR APP:
   - /dashboard - Main dashboard
   - /transfer - Money transfer page
   - /transactions - Transaction history
   - /user-profile - User profile page (matches your UserProfile.js file)
   - /login - Login page
   - /register - Registration page

4. MENU STATE MANAGEMENT:
   - anchorEl controls dropdown menu open/close state
   - handleMenuOpen/handleMenuClose for menu interactions
   - Always close menu after navigation (handleMenuClose())

5. RESPONSIVE DESIGN:
   - Desktop: Shows dashboard button + avatar
   - Mobile: Shows hamburger menu
   - Uses Material-UI breakpoints (xs, md)

6. LOGOUT HANDLING:
   - Call logout() from AuthContext (async function)
   - Navigate to /login after logout
   - Handle errors gracefully (still navigate if logout fails)
*/