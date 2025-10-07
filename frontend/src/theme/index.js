import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  direction: 'rtl',
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
      // Custom breakpoints for better mobile experience
      mobile: 480,
      tablet: 768,
      laptop: 1024,
      desktop: 1440,
    },
  },
  palette: {
    primary: {
      main: '#0288d1',
      light: '#7D9AFC',
      dark: '#0288d1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#333679',
      light: '#968FFF',
      dark: '#4D44B5',
      contrastText: '#ffffff',
    },
    success: {
      main: '#00C853',
      light: '#5EFC82',
      dark: '#009624',
    },
    warning: {
      main: '#FFAB00',
      light: '#FFD54F',
      dark: '#FF8F00',
    },
    error: {
      main: '#FF3D00',
      light: '#FF6E40',
      dark: '#DD2C00',
    },
    background: {
      default: '#F8FAFF',
      paper: '#ffffff',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
      disabled: '#B3B3B3',
    },
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  typography: {
    fontFamily: '"Tajawal", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      '@media (max-width: 768px)': {
        fontSize: '2.5rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '2rem',
      },
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
      '@media (max-width: 768px)': {
        fontSize: '2rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '1.75rem',
      },
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
      '@media (max-width: 768px)': {
        fontSize: '1.75rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '1.5rem',
      },
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.3,
      '@media (max-width: 768px)': {
        fontSize: '1.375rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '1.25rem',
      },
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      '@media (max-width: 768px)': {
        fontSize: '1.125rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '1rem',
      },
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
      '@media (max-width: 768px)': {
        fontSize: '1rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '0.9rem',
      },
    },
    subtitle1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.75,
      '@media (max-width: 768px)': {
        fontSize: '0.9rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '0.85rem',
      },
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.75,
      '@media (max-width: 768px)': {
        fontSize: '0.8rem',
      },
      '@media (max-width: 480px)': {
        fontSize: '0.75rem',
      },
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.66,
    },
    overline: {
      fontSize: '0.75rem',
      lineHeight: 2.66,
      letterSpacing: '0.08333em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'html, body': {
          scrollBehavior: 'smooth',
        },
        a: {
          textDecoration: 'none',
          color: 'inherit',
        },
        '.MuiContainer-root': {
          paddingLeft: '16px',
          paddingRight: '16px',
          '@media (min-width: 600px)': {
            paddingLeft: '24px',
            paddingRight: '24px',
          },
          '@media (min-width: 900px)': {
            paddingLeft: '32px',
            paddingRight: '32px',
          },
          '@media (min-width: 1200px)': {
            paddingLeft: '40px',
            paddingRight: '40px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          boxShadow: 'none',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.9375rem',
          transition: 'all 0.3s ease',
          '@media (max-width: 768px)': {
            padding: '8px 20px',
            fontSize: '0.875rem',
          },
          '@media (max-width: 480px)': {
            padding: '6px 16px',
            fontSize: '0.8rem',
          },
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
          '&.MuiButton-contained': {
            '&:hover': {
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            },
          },
          '&.MuiButton-outlined': {
            borderWidth: '2px',
            '&:hover': {
              borderWidth: '2px',
            },
          },
        },
        contained: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          '&.MuiButton-containedPrimary': {
            background: 'linear-gradient(90deg, #0288d1 0%, #333679 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#E0E0E0',
            },
            '&:hover fieldset': {
              borderColor: '#BDBDBD',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0288d1',
              boxShadow: '0 0 0 3px rgba(74, 108, 247, 0.1)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: 'rgba(74, 108, 247, 0.1)',
          color: '#0288d1',
        },
        colorSecondary: {
          backgroundColor: 'rgba(108, 99, 255, 0.1)',
          color: '#333679',
        },
      },
    },
  },
  customShadows: {
    small: '0 2px 8px rgba(0, 0, 0, 0.08)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.1)',
    large: '0 8px 24px rgba(0, 0, 0, 0.12)',
    primary: '0 8px 24px rgba(74, 108, 247, 0.2)',
    secondary: '0 8px 24px rgba(108, 99, 255, 0.2)',
  },
});

// Add global styles
const globalStyles = {
  '.text-ellipsis': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  '.text-gradient': {
    background: 'linear-gradient(90deg, #0288d1 0%, #333679 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  '.glass-effect': {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  '.smooth-transition': {
    transition: 'all 0.3s ease',
  },
  // Responsive utility classes
  '.mobile-only': {
    display: 'block',
    '@media (min-width: 769px)': {
      display: 'none',
    },
  },
  '.desktop-only': {
    display: 'none',
    '@media (min-width: 769px)': {
      display: 'block',
    },
  },
  '.tablet-up': {
    display: 'none',
    '@media (min-width: 768px)': {
      display: 'block',
    },
  },
  '.mobile-down': {
    display: 'block',
    '@media (min-width: 768px)': {
      display: 'none',
    },
  },
  // Responsive spacing utilities
  '.responsive-padding': {
    padding: '16px',
    '@media (min-width: 600px)': {
      padding: '24px',
    },
    '@media (min-width: 900px)': {
      padding: '32px',
    },
    '@media (min-width: 1200px)': {
      padding: '40px',
    },
  },
  '.responsive-margin': {
    margin: '16px',
    '@media (min-width: 600px)': {
      margin: '24px',
    },
    '@media (min-width: 900px)': {
      margin: '32px',
    },
    '@media (min-width: 1200px)': {
      margin: '40px',
    },
  },
  // Responsive text utilities
  '.responsive-text': {
    fontSize: '0.875rem',
    '@media (min-width: 600px)': {
      fontSize: '1rem',
    },
    '@media (min-width: 900px)': {
      fontSize: '1.125rem',
    },
  },
  // Responsive flex utilities
  '.responsive-flex': {
    flexDirection: 'column',
    '@media (min-width: 768px)': {
      flexDirection: 'row',
    },
  },
  '.responsive-grid': {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '16px',
    '@media (min-width: 600px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '20px',
    },
    '@media (min-width: 900px)': {
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px',
    },
    '@media (min-width: 1200px)': {
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '32px',
    },
  },
};

export { globalStyles };
export default theme;
