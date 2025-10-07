import { createTheme } from '@mui/material/styles';

// Create a theme instance
const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#8E44AD', // Purple from the logo
      light: '#9B59B6',
      dark: '#7D3C98',
      contrastText: '#fff',
    },
    secondary: {
      main: '#2C3E50', // Dark blue from the logo
      light: '#34495E',
      dark: '#1F2D3D',
      contrastText: '#fff',
    },
    accent: {
      main: '#E74C3C', // Reddish accent from the logo
      light: '#EC7063',
      dark: '#C0392B',
      contrastText: '#fff',
    },
    error: {
      main: '#E74C3C',
      light: '#EC7063',
      dark: '#C0392B',
    },
    warning: {
      main: '#F39C12',
      light: '#F4B350',
      dark: '#D68910',
    },
    info: {
      main: '#3498DB',
      light: '#5DADE2',
      dark: '#2E86C1',
    },
    success: {
      main: '#27AE60',
      light: '#58D68D',
      dark: '#1E8449',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#566573',
      disabled: '#95A5A6',
    },
  },
  typography: {
    fontFamily: [
      'Tajawal',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
  },
});

export default theme;
