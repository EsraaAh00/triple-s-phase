// Responsive utilities for the application
import { useTheme, useMediaQuery } from '@mui/material';

// Custom breakpoints that match the theme
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
  mobile: 480,
  tablet: 768,
  laptop: 1024,
  desktop: 1440,
};

// Hook to get current screen size
export const useScreenSize = () => {
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isSmallScreen: isMobile || isTablet,
    isLargeScreen: isDesktop || isLargeDesktop,
  };
};

// Hook to get responsive values
export const useResponsiveValue = (values) => {
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useScreenSize();
  
  if (isMobile) return values.mobile || values.xs || values.default;
  if (isTablet) return values.tablet || values.sm || values.default;
  if (isDesktop) return values.desktop || values.md || values.default;
  if (isLargeDesktop) return values.large || values.lg || values.xl || values.default;
  
  return values.default;
};

// Responsive spacing values
export const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
};

// Responsive font sizes
export const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  xxl: '1.5rem',
};

// Responsive grid columns
export const gridColumns = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 5,
};

// Responsive padding/margin values
export const getResponsiveSpacing = (base = 16) => ({
  xs: base * 0.5,
  sm: base * 0.75,
  md: base,
  lg: base * 1.25,
  xl: base * 1.5,
});

// Responsive width values
export const getResponsiveWidth = () => ({
  xs: '100%',
  sm: '100%',
  md: '100%',
  lg: '1200px',
  xl: '1400px',
});

// Responsive container styles
export const getResponsiveContainer = () => ({
  width: '100%',
  maxWidth: getResponsiveWidth(),
  margin: '0 auto',
  paddingLeft: spacing.sm,
  paddingRight: spacing.sm,
  '@media (min-width: 600px)': {
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
  },
  '@media (min-width: 900px)': {
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
  },
  '@media (min-width: 1200px)': {
    paddingLeft: spacing.xl,
    paddingRight: spacing.xl,
  },
});

// Responsive flex styles
export const getResponsiveFlex = (direction = 'row') => ({
  display: 'flex',
  flexDirection: direction,
  '@media (max-width: 768px)': {
    flexDirection: 'column',
  },
});

// Responsive grid styles
export const getResponsiveGrid = (columns = gridColumns) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${columns.xs}, 1fr)`,
  gap: spacing.sm,
  '@media (min-width: 600px)': {
    gridTemplateColumns: `repeat(${columns.sm}, 1fr)`,
    gap: spacing.md,
  },
  '@media (min-width: 900px)': {
    gridTemplateColumns: `repeat(${columns.md}, 1fr)`,
    gap: spacing.lg,
  },
  '@media (min-width: 1200px)': {
    gridTemplateColumns: `repeat(${columns.lg}, 1fr)`,
    gap: spacing.xl,
  },
});

// Responsive text styles
export const getResponsiveText = (size = 'md') => ({
  fontSize: fontSizes[size],
  lineHeight: 1.5,
  '@media (max-width: 768px)': {
    fontSize: fontSizes[size === 'xl' ? 'lg' : size === 'lg' ? 'md' : 'sm'],
  },
});

// Responsive button styles
export const getResponsiveButton = () => ({
  padding: `${spacing.sm}px ${spacing.md}px`,
  fontSize: fontSizes.md,
  minHeight: 44,
  minWidth: 44,
  '@media (max-width: 768px)': {
    padding: `${spacing.xs}px ${spacing.sm}px`,
    fontSize: fontSizes.sm,
    minHeight: 40,
    minWidth: 40,
  },
  '@media (min-width: 900px)': {
    padding: `${spacing.md}px ${spacing.lg}px`,
    fontSize: fontSizes.lg,
  },
});

// Responsive card styles
export const getResponsiveCard = () => ({
  padding: spacing.md,
  borderRadius: 8,
  '@media (max-width: 768px)': {
    padding: spacing.sm,
    borderRadius: 6,
  },
  '@media (min-width: 900px)': {
    padding: spacing.lg,
    borderRadius: 12,
  },
});

// Responsive image styles
export const getResponsiveImage = () => ({
  width: '100%',
  height: 'auto',
  maxWidth: '100%',
  objectFit: 'cover',
  '@media (max-width: 768px)': {
    maxHeight: '300px',
  },
  '@media (min-width: 900px)': {
    maxHeight: '400px',
  },
});

// Utility function to check if screen is mobile
export const isMobileScreen = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoints.sm;
};

// Utility function to check if screen is tablet
export const isTabletScreen = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints.sm && window.innerWidth < breakpoints.md;
};

// Utility function to check if screen is desktop
export const isDesktopScreen = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints.md;
};

// Utility function to get current screen type
export const getScreenType = () => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < breakpoints.sm) return 'mobile';
  if (width < breakpoints.md) return 'tablet';
  if (width < breakpoints.lg) return 'desktop';
  return 'large';
};

// Responsive visibility utilities
export const visibility = {
  mobile: {
    display: 'block',
    '@media (min-width: 768px)': {
      display: 'none',
    },
  },
  tablet: {
    display: 'none',
    '@media (min-width: 768px)': {
      display: 'block',
    },
    '@media (min-width: 1200px)': {
      display: 'none',
    },
  },
  desktop: {
    display: 'none',
    '@media (min-width: 1200px)': {
      display: 'block',
    },
  },
  hidden: {
    display: 'none',
  },
  visible: {
    display: 'block',
  },
};

export default {
  breakpoints,
  useScreenSize,
  useResponsiveValue,
  spacing,
  fontSizes,
  gridColumns,
  getResponsiveSpacing,
  getResponsiveWidth,
  getResponsiveContainer,
  getResponsiveFlex,
  getResponsiveGrid,
  getResponsiveText,
  getResponsiveButton,
  getResponsiveCard,
  getResponsiveImage,
  isMobileScreen,
  isTabletScreen,
  isDesktopScreen,
  getScreenType,
  visibility,
};
