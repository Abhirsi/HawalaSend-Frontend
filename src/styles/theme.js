// src/styles/theme.js - Complete Design System for HawalaSend
import { createTheme } from '@mui/material/styles';

// Color Palette - Financial App Optimized
const colors = {
  // Primary Colors - Trust & Security
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe', 
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main brand color
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // Secondary Colors - Success & Money
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Success/Money color
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Neutral Colors - Professional UI
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // Status Colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Background & Surface Colors
  background: {
    default: '#fafafa',
    paper: '#ffffff',
    elevated: '#f8fafc',
    overlay: 'rgba(0, 0, 0, 0.05)',
  }
};

// Typography Scale
const typography = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif'
  ].join(','),
  
  // Font Weights
  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Type Scale
  h1: {
    fontSize: '2.25rem', // 36px
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.025em',
  },
  h2: {
    fontSize: '1.875rem', // 30px
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.025em',
  },
  h3: {
    fontSize: '1.5rem', // 24px
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.25rem', // 20px
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.125rem', // 18px
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '1rem', // 16px
    fontWeight: 600,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem', // 16px
    fontWeight: 400,
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem', // 14px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  subtitle1: {
    fontSize: '1rem', // 16px
    fontWeight: 500,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: '0.875rem', // 14px
    fontWeight: 500,
    lineHeight: 1.4,
  },
  caption: {
    fontSize: '0.75rem', // 12px
    fontWeight: 400,
    lineHeight: 1.4,
  },
  overline: {
    fontSize: '0.75rem', // 12px
    fontWeight: 600,
    lineHeight: 1.4,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
};

// Spacing Scale (8px base)
const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  xxl: '3rem',     // 48px
  xxxl: '4rem',    // 64px
};

// Border Radius
const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  full: '9999px',
};

// Shadows
const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  xxl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

// Animation & Transitions
const transitions = {
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Material-UI Theme Configuration
const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary[500],
      light: colors.primary[400],
      dark: colors.primary[700],
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary[500],
      light: colors.secondary[400],
      dark: colors.secondary[700],
      contrastText: '#ffffff',
    },
    error: {
      main: colors.error[500],
      light: colors.error[400],
      dark: colors.error[700],
    },
    warning: {
      main: colors.warning[500],
      light: colors.warning[400],
      dark: colors.warning[700],
    },
    success: {
      main: colors.secondary[500],
      light: colors.secondary[400],
      dark: colors.secondary[700],
    },
    grey: colors.neutral,
    background: colors.background,
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[600],
      disabled: colors.neutral[400],
    },
  },
  
  typography: {
    fontFamily: typography.fontFamily,
    h1: typography.h1,
    h2: typography.h2,
    h3: typography.h3,
    h4: typography.h4,
    h5: typography.h5,
    h6: typography.h6,
    body1: typography.body1,
    body2: typography.body2,
    subtitle1: typography.subtitle1,
    subtitle2: typography.subtitle2,
    caption: typography.caption,
    overline: typography.overline,
  },
  
  spacing: 8, // 8px base unit
  
  shape: {
    borderRadius: 8,
  },
  
  shadows: [
    'none',
    shadows.xs,
    shadows.sm,
    shadows.md,
    shadows.lg,
    shadows.xl,
    shadows.xxl,
    // ... Material-UI expects 25 shadow levels
    shadows.xxl, shadows.xxl, shadows.xxl, shadows.xxl, shadows.xxl,
    shadows.xxl, shadows.xxl, shadows.xxl, shadows.xxl, shadows.xxl,
    shadows.xxl, shadows.xxl, shadows.xxl, shadows.xxl, shadows.xxl,
    shadows.xxl, shadows.xxl, shadows.xxl, shadows.xxl,
  ],
  
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: borderRadius.lg,
          padding: '12px 24px',
          fontSize: '1rem',
          transition: `all ${transitions.duration.normal} ${transitions.easing.ease}`,
          boxShadow: shadows.sm,
          '&:hover': {
            boxShadow: shadows.md,
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: shadows.lg,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.xl,
          boxShadow: shadows.sm,
          border: `1px solid ${colors.neutral[200]}`,
          '&:hover': {
            boxShadow: shadows.md,
            transform: 'translateY(-2px)',
            transition: `all ${transitions.duration.normal} ${transitions.easing.ease}`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: borderRadius.lg,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary[400],
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary[500],
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.xl,
          boxShadow: shadows.sm,
        },
        elevation1: {
          boxShadow: shadows.sm,
        },
        elevation2: {
          boxShadow: shadows.md,
        },
        elevation3: {
          boxShadow: shadows.lg,
        },
      },
    },
  },
});

// Custom Design Tokens Export
export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
};

export default muiTheme;