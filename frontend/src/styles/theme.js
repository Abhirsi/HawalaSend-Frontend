// frontend/src/styles/theme.js - Updated with new brand colors
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976D2', // Primary blue
      light: '#42A5F5',
      dark: '#1565C0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2E7D32', // Secondary green
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2E7D32', // Green for success states
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    info: {
      main: '#1976D2', // Blue for info states
      light: '#42A5F5',
      dark: '#1565C0',
    },
    warning: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    error: {
      main: '#F44336',
      light: '#EF5350',
      dark: '#D32F2F',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#333333',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#333333',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#333333',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#333333',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#333333',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#333333',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none', // Disable uppercase transformation
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    // Customize Material-UI components
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.95rem',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #1976D2 30%, #42A5F5 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1565C0 30%, #1976D2 90%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1B5E20 30%, #2E7D32 90%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 12,
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
        elevation3: {
          boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1976D2',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1976D2',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
        colorPrimary: {
          backgroundColor: '#1976D2',
          color: '#ffffff',
        },
        colorSecondary: {
          backgroundColor: '#2E7D32',
          color: '#ffffff',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardSuccess: {
          backgroundColor: '#e8f5e8',
          color: '#2E7D32',
          '& .MuiAlert-icon': {
            color: '#2E7D32',
          },
        },
        standardInfo: {
          backgroundColor: '#e3f2fd',
          color: '#1976D2',
          '& .MuiAlert-icon': {
            color: '#1976D2',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          background: 'linear-gradient(45deg, #1976D2 30%, #42A5F5 90%)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(25, 118, 210, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.16)',
            },
          },
        },
      },
    },
  },
  // Custom theme extensions for HawalaSend
  custom: {
    // Transfer status colors
    transferStatus: {
      pending: '#FF9800',
      completed: '#2E7D32',
      failed: '#F44336',
      cancelled: '#757575',
    },
    // Currency colors
    currency: {
      cad: '#1976D2',
      kes: '#2E7D32',
    },
    // Feature colors
    features: {
      send: '#1976D2',
      receive: '#2E7D32',
      track: '#FF9800',
      secure: '#9C27B0',
    },
    // Gradient backgrounds
    gradients: {
      primary: 'linear-gradient(45deg, #1976D2 30%, #42A5F5 90%)',
      secondary: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)',
      hero: 'linear-gradient(135deg, #1976D2 0%, #2E7D32 100%)',
      card: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
    },
    // Box shadows
    shadows: {
      soft: '0 2px 8px rgba(0,0,0,0.1)',
      medium: '0 4px 16px rgba(0,0,0,0.15)',
      strong: '0 8px 32px rgba(0,0,0,0.2)',
      colored: '0 4px 16px rgba(25, 118, 210, 0.3)',
    },
  },
});

export default theme;