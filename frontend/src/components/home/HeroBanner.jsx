import { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Container, Typography, useMediaQuery, useTheme,
  Grid, IconButton, keyframes, Fade, Grow, Slide, Zoom, useScrollTrigger
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import {
  Code, Laptop, Smartphone, PlayCircle, ArrowBackIos,
  ArrowForwardIos, Circle, Star, School, EmojiEvents,
  ArrowForward, Refresh
} from '@mui/icons-material';
import { bannerAPI } from '../../services/api.service';

// Import background images
// import home1Image from '../../assets/images/home1.png';
// import home2Image from '../../assets/images/home2.png';
// import home3Image from '../../assets/images/home3.png';



// Keyframe animations
const gradientBG = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const fadeInUp = keyframes`
  0% { transform: translateY(30px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

const slideInLeft = keyframes`
  0% { transform: translateX(-100px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

const slideInUp = keyframes`
  0% { transform: translateY(50px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(200%) skewX(-15deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

// 3D Image Container
const Image3DContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  perspective: '1000px',
  zIndex: 0,
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, #333679 0%, #4DBFB3 100%)',
    animation: '${gradientBG} 15s ease infinite',
    backgroundSize: '400% 400%',
    zIndex: 0,
  },
}));

const Image3D = styled(Box)(({ theme, src }) => ({
  position: 'absolute',
  width: '35%',
  height: '90%',
  left: '8%',
  top: '5%',
  transformStyle: 'preserve-3d',
  transition: 'transform 0.5s ease',
  '&:hover': {
    transform: 'rotateY(5deg) rotateX(5deg) scale(1.05)',
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundImage: `url(${src})`,
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    borderRadius: '15px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
    transform: 'translateZ(40px)',
    transition: 'all 0.4s ease',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: '20px',
  },
  '@keyframes float': {
    '0%': { transform: 'translateZ(0) rotate(0deg)' },
    '50%': { transform: 'translateZ(20px) rotate(2deg)' },
    '100%': { transform: 'translateZ(0) rotate(0deg)' },
  },
  animation: 'float 6s ease-in-out infinite',
}));

// Decorative geometric elements
const GeometricStripes = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 0,
  overflow: 'hidden',
}));

const Stripe = styled(Box)(({ top, left, width, height, rotation, color, delay }) => ({
  position: 'absolute',
  top: `${top}%`,
  left: `${left}%`,
  width: `${width}px`,
  height: `${height}px`,
  background: color,
  borderRadius: '20px',
  transform: `rotate(${rotation}deg)`,
  opacity: 0.6,
  animation: `${pulse} 4s ease-in-out ${delay}s infinite`,
}));

const HollowCircle = styled(Box)(({ top, left, size, delay }) => ({
  position: 'absolute',
  top: `${top}%`,
  left: `${left}%`,
  width: `${size}px`,
  height: `${size}px`,
  border: '2px solid #4DBFB3',
  borderRadius: '50%',
  opacity: 0.4,
  animation: `${pulse} 6s ease-in-out ${delay}s infinite`,
}));

// Background slides container for local images with scroll effect
const BackgroundSlides = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 0,
  overflow: 'hidden',
}));

const BackgroundSlide = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'scrollProgress',
})(({ scrollProgress, theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  opacity: 1,
  transition: 'all 0.3s ease-out',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center center',
    transform: `scale(${1 + scrollProgress * 0.1}) translateY(${scrollProgress * -20}px)`,
    transition: 'transform 0.3s ease-out',
    filter: `brightness(${1.3 + scrollProgress * 0.2}) contrast(${1.4 + scrollProgress * 0.3}) saturate(${1.2 + scrollProgress * 0.2})`,
    display: 'block',
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(45, 27, 105, 0.2) 0%, rgba(26, 16, 63, 0.25) 100%)',
    zIndex: 1,
    opacity: 0.2 + scrollProgress * 0.2,
    transition: 'opacity 0.3s ease-out',
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(${90 + scrollProgress * 45}deg, rgba(0,0,0,${0.1 + scrollProgress * 0.2}) 0%, transparent 50%, rgba(0,0,0,${0.05 + scrollProgress * 0.1}) 100%)`,
    zIndex: 2,
    transition: 'all 0.3s ease-out',
  },
}));

// Carousel indicators (right side dots)
const CarouselIndicators = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: '20px',
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  zIndex: 10,
  // Responsive positioning and sizing
  '@media (max-width: 600px)': {
    right: '15px',
    gap: '12px',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    right: '25px',
    gap: '15px',
  },
  '@media (min-width: 900px) and (max-width: 1200px)': {
    right: '35px',
    gap: '18px',
  },
  '@media (min-width: 1200px)': {
    right: '40px',
    gap: '20px',
  },
}));

const IndicatorDot = styled(Box)(({ active, theme }) => ({
  width: active ? '12px' : '8px',
  height: active ? '12px' : '8px',
  borderRadius: '50%',
  backgroundColor: active ? '#fff' : 'rgba(255, 255, 255, 0.6)',
  border: active ? '2px solid #4DBFB3' : '2px solid transparent',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: active ? '0 0 15px rgba(229, 151, 139, 0.8)' : 'none',
  // Responsive sizing
  '@media (max-width: 600px)': {
    width: active ? '10px' : '6px',
    height: active ? '10px' : '6px',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    width: active ? '12px' : '8px',
    height: active ? '12px' : '8px',
  },
  '@media (min-width: 900px) and (max-width: 1200px)': {
    width: active ? '14px' : '10px',
    height: active ? '14px' : '10px',
  },
  '@media (min-width: 1200px)': {
    width: active ? '16px' : '12px',
    height: active ? '16px' : '12px',
  },
  '&:hover': {
    backgroundColor: active ? '#fff' : 'rgba(255, 255, 255, 0.8)',
    transform: 'scale(1.2)',
    boxShadow: active ? '0 0 20px rgba(229, 151, 139, 1)' : '0 0 10px rgba(255, 255, 255, 0.5)',
  },
}));


// Refresh button (top right)
const RefreshButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '15px',
  right: '15px',
  width: '40px',
  height: '40px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: '#fff',
  borderRadius: '50%',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  zIndex: 10,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: 'scale(1.1)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
  },
  [theme.breakpoints.up('sm')]: {
    top: '20px',
    right: '20px',
    width: '50px',
    height: '50px',
  },
}));

const HeroSection = styled('section', {
  shouldForwardProp: (prop) => prop !== 'scrollProgress',
})(({ theme, scrollProgress }) => ({
  position: 'relative',
  color: '#fff',
  padding: '0',
  overflow: 'hidden',
  height: '100vh', // Full viewport height to cover header
  minHeight: '400px', // Reduced for mobile
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  textAlign: 'left',
  background: 'linear-gradient(135deg, #2D1B69 0%, #1A103F 50%, #0F0A2A 100%)',
  // Enhanced responsive height adjustments for mobile
  '@media (max-width: 480px)': {
    minHeight: '500px',
    height: '100vh',
    maxHeight: '800px', // Prevent excessive height on small screens
  },
  '@media (min-width: 480px) and (max-width: 600px)': {
    minHeight: '550px',
    height: '100vh',
    maxHeight: '850px',
  },
  '@media (min-width: 600px) and (max-width: 768px)': {
    minHeight: '600px',
    height: '100vh',
    maxHeight: '900px',
  },
  '@media (min-width: 768px) and (max-width: 900px)': {
    minHeight: '650px',
    height: '100vh',
    maxHeight: '950px',
  },
  '@media (min-width: 900px) and (max-width: 1200px)': {
    minHeight: '700px',
    height: '100vh',
    maxHeight: '1000px',
  },
  '@media (min-width: 1200px)': {
    minHeight: '750px',
    height: '100vh',
    maxHeight: '1100px',
  },
  // Handle landscape orientation on mobile
  '@media (max-height: 600px) and (orientation: landscape)': {
    minHeight: '100vh',
    height: '100vh',
    maxHeight: '100vh',
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(45, 27, 105, 0.8) 0%, rgba(26, 16, 63, 0.9) 100%)',
    zIndex: 1,
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
    transform: `translateX(${scrollProgress * 100}%) skewX(-15deg)`,
    transition: 'transform 0.3s ease-out',
    zIndex: 1,
    pointerEvents: 'none',
  },
}));

const HeroContent = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  textAlign: 'left',
  height: '100%',
  justifyContent: 'center',
  padding: theme.spacing(4, 2, 4, 2),
  maxWidth: '1000px',
  marginLeft: 0,
  paddingTop: '80px', // Add top padding to account for header
  // Enhanced responsive padding and alignment for mobile
  '@media (max-width: 480px)': {
    padding: theme.spacing(2, 1, 2, 1),
    paddingTop: '60px',
    textAlign: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 60px)',
    justifyContent: 'center',
  },
  '@media (min-width: 480px) and (max-width: 600px)': {
    padding: theme.spacing(2.5, 1.5, 2.5, 1.5),
    paddingTop: '65px',
    textAlign: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 65px)',
    justifyContent: 'center',
  },
  '@media (min-width: 600px) and (max-width: 768px)': {
    padding: theme.spacing(3, 2, 3, 2),
    paddingTop: '75px',
    textAlign: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 75px)',
    justifyContent: 'center',
  },
  '@media (min-width: 768px) and (max-width: 900px)': {
    padding: theme.spacing(3.5, 2.5, 3.5, 2.5),
    paddingTop: '85px',
    textAlign: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 85px)',
    justifyContent: 'center',
  },
  '@media (min-width: 900px) and (max-width: 1200px)': {
    padding: theme.spacing(5, 3, 5, 3),
    paddingTop: '110px',
    textAlign: 'left',
    alignItems: 'flex-start',
    minHeight: 'calc(100vh - 110px)',
    justifyContent: 'center',
  },
  '@media (min-width: 1200px)': {
    padding: theme.spacing(6, 4, 6, 4),
    paddingTop: '120px',
    textAlign: 'left',
    alignItems: 'flex-start',
    minHeight: 'calc(100vh - 120px)',
    justifyContent: 'center',
  },
  // Handle landscape orientation on mobile
  '@media (max-height: 600px) and (orientation: landscape)': {
    paddingTop: '50px',
    paddingBottom: '20px',
    minHeight: 'calc(100vh - 50px)',
    justifyContent: 'flex-start',
  },
}));

const HeroTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  marginBottom: theme.spacing(2),
  fontSize: '2rem',
  lineHeight: 1.1,
  maxWidth: '1000px',
  animation: `${slideInLeft} 1s ease-out 0.3s both`,
  color: '#FFFFFF',
  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
  // Responsive font sizes
  '@media (max-width: 600px)': {
    fontSize: '1.5rem',
    marginBottom: theme.spacing(1.5),
    lineHeight: 1.2,
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    fontSize: '2rem',
    marginBottom: theme.spacing(1.5),
  },
  '@media (min-width: 900px) and (max-width: 1200px)': {
    fontSize: '2.8rem',
    marginBottom: theme.spacing(2),
  },
  '@media (min-width: 1200px)': {
    fontSize: '3.5rem',
    marginBottom: theme.spacing(2),
  },
}));

const HeroSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  marginBottom: theme.spacing(3),
  maxWidth: '600px',
  opacity: 0.95,
  animation: `${slideInUp} 1s ease-out 0.6s both`,
  color: '#FFFFFF',
  fontWeight: 400,
  // Responsive font sizes and spacing
  '@media (max-width: 600px)': {
    fontSize: '0.9rem',
    marginBottom: theme.spacing(2),
    lineHeight: 1.4,
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    fontSize: '1.1rem',
    marginBottom: theme.spacing(2.5),
    lineHeight: 1.5,
  },
  '@media (min-width: 900px) and (max-width: 1200px)': {
    fontSize: '1.3rem',
    marginBottom: theme.spacing(3),
    lineHeight: 1.6,
  },
  '@media (min-width: 1200px)': {
    fontSize: '1.5rem',
    marginBottom: theme.spacing(4),
    lineHeight: 1.6,
  },
}));

const HeroButton = styled(Button)(({ theme, variant }) => ({
  padding: theme.spacing(1.5, 3),
  fontSize: '0.9rem',
  fontWeight: 700,
  borderRadius: '12px',
  textTransform: 'none',
  background: variant === 'contained'
    ? 'linear-gradient(135deg, #2D1B69 0%, #1A103F 100%)'
    : 'transparent',
  color: variant === 'contained' ? 'white' : '#2D1B69',
  border: variant === 'outlined' ? '2px solid #2D1B69' : '2px solid rgba(255, 255, 255, 0.2)',
  boxShadow: variant === 'contained' ? '0 4px 15px rgba(45, 27, 105, 0.4)' : 'none',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${slideInUp} 1s ease-out 0.9s both`,
  // Responsive sizing - smaller button width
  '@media (max-width: 600px)': {
    padding: theme.spacing(0.75, 1.5),
    fontSize: '0.8rem',
    minWidth: 'auto',
    maxWidth: 'none',
    width: 'auto',
    marginBottom: theme.spacing(1),
    alignSelf: 'center',
    whiteSpace: 'nowrap',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    padding: theme.spacing(1.2, 2.5),
    fontSize: '0.9rem',
    minWidth: '140px',
    maxWidth: '160px',
    width: 'auto',
    marginBottom: theme.spacing(1),
    alignSelf: 'center',
  },
  '@media (min-width: 900px) and (max-width: 1200px)': {
    padding: theme.spacing(1.5, 3),
    fontSize: '1rem',
    minWidth: '160px',
    maxWidth: '180px',
    width: 'auto',
    marginBottom: theme.spacing(2),
    alignSelf: 'flex-start',
  },
  '@media (min-width: 1200px)': {
    padding: theme.spacing(2, 4),
    fontSize: '1.1rem',
    minWidth: '180px',
    maxWidth: '200px',
    width: 'auto',
    marginBottom: theme.spacing(2),
    alignSelf: 'flex-start',
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: '0.5s',
  },
  '&:hover': {
    background: variant === 'contained'
      ? 'linear-gradient(135deg, #3A2375 0%, #2D1B69 100%)'
      : 'rgba(45, 27, 105, 0.1)',
    boxShadow: variant === 'contained'
      ? '0 6px 20px rgba(45, 27, 105, 0.6)'
      : '0 4px 12px rgba(45, 27, 105, 0.2)',
    transform: 'translateY(-2px)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    '&:before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(1px)',
  },
}));

const FeatureItem = styled('div')({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '1.5rem',
  padding: '1.5rem 2rem',
  background: 'linear-gradient(90deg, rgba(14, 81, 129, 0.1) 0%, rgba(229, 151, 139, 0.05) 100%)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    background: 'linear-gradient(to bottom, #333679, #4DBFB3)',
    transition: 'width 0.3s ease',
  },
  '&:hover': {
    transform: 'translateX(8px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
    '&::before': {
      width: '8px',
    },
    '& .feature-icon': {
      transform: 'scale(1.2) rotate(5deg)',
      textShadow: '0 0 15px rgba(255,255,255,0.5)',
    },
  },
  '& .feature-icon': {
    marginLeft: '1.5rem',
    fontSize: '1.5rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    zIndex: 1,
  },
  '& .feature-text': {
    fontSize: '1rem',
    fontWeight: 500,
    position: 'relative',
    zIndex: 1,
    background: 'linear-gradient(90deg, #fff, #E2E8F0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
});

const ImageContainer = styled('div')({
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& img': {
    maxWidth: '100%',
    height: 'auto',
    maxHeight: '400px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'scale(1.03) rotate(1deg)',
      filter: 'drop-shadow(0 15px 30px rgba(14, 81, 129, 0.3))',
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(229, 151, 139, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(20px)',
    zIndex: 0,
    animation: 'pulse 8s infinite alternate',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(14, 81, 129, 0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(30px)',
    zIndex: 0,
    animation: 'pulse 10s infinite alternate-reverse',
  },
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)' },
    '100%': { transform: 'scale(1.1)' },
  },
});

const FloatingIcon = styled('div')(({ theme, top, left, size = 40, delay }) => ({
  position: 'absolute',
  width: size,
  height: size,
  top: `${top}%`,
  left: `${left}%`,
  background: 'rgba(14, 81, 129, 0.1)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(14, 81, 129, 0.8)',
  animation: `float 6s ease-in-out ${delay}s infinite`,
  backdropFilter: 'blur(2px)',
  border: '1px solid rgba(14, 81, 129, 0.2)',
  zIndex: 1,
  '&:hover': {
    background: 'rgba(229, 151, 139, 0.15)',
    transform: 'scale(1.1)',
  },
}));

// Fallback main banners data - used when no main banners are available
const fallbackSlides = [
  {
    id: 'fallback-main-1',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    title: 'التعلم الطبي، أصبح أسهل',
    subtitle: 'تعلم بوتيرتك الخاصة، بإرشاد الخبراء',
    banner_type: 'main'
  },
  {
    id: 'fallback-main-2',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    title: 'تعلم بوتيرتك الخاصة',
    subtitle: 'التعليم الطبي المهني',
    banner_type: 'main'
  },
  {
    id: 'fallback-main-3',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    title: 'دورات بقيادة الخبراء',
    subtitle: 'التدريب الطبي الشامل',
    banner_type: 'main'
  }
];

const HeroBanner = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeSlide, setActiveSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bottomSlideIndex, setBottomSlideIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Helper function to get localized text
  const getLocalizedText = (enText, arText) => {
    const currentLang = i18n.language || 'en';
    if (currentLang === 'ar' && arText) {
      return arText;
    }
    return enText;
  };

  // Helper function to get image URL
  const getImageUrl = (image) => {
    if (!image) {
      return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80';
    }

    if (typeof image === 'string') {
      // If it's already a full URL, return it
      if (image.startsWith('http')) return image;

      // If it's a relative path, construct full URL
      return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${image}`;
    }

    return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80';
  };

  // Fetch main banners from API
  useEffect(() => {
    const fetchMainBanners = async () => {
      try {
        console.log('🔄 Fetching main banners from API...');
        setLoading(true);

        // Try to get main banners specifically
        let bannersData;
        try {
          console.log('🔍 Trying to fetch main banners...');
          bannersData = await bannerAPI.getMainBanners();
          console.log('✅ Main banners received:', bannersData);
        } catch (mainBannerError) {
          console.log('⚠️ Main banners failed, trying by type...');
          try {
            bannersData = await bannerAPI.getBannersByType('main');
            console.log('✅ Main banners by type received:', bannersData);
          } catch (byTypeError) {
            console.log('⚠️ By type failed, trying active banners...');
            bannersData = await bannerAPI.getActiveBanners();
            console.log('✅ Active banners received:', bannersData);
          }
        }

        // Filter to only main type banners
        let filteredBanners = [];
        if (Array.isArray(bannersData)) {
          filteredBanners = bannersData.filter(banner => banner.banner_type === 'main');
        } else if (bannersData?.results) {
          filteredBanners = bannersData.results.filter(banner => banner.banner_type === 'main');
        } else if (bannersData?.data) {
          filteredBanners = bannersData.data.filter(banner => banner.banner_type === 'main');
        }

        console.log('📊 Filtered main banners:', filteredBanners.length);

        // Transform the data to match the expected format
        const transformedSlides = filteredBanners.map(banner => ({
          id: banner.id,
          title: banner.title,
          title_ar: banner.title_ar,
          subtitle: banner.description || '',
          subtitle_ar: banner.description_ar,
          image: getImageUrl(banner.image || banner.image_url),
          url: banner.url || null,
          banner_type: banner.banner_type || 'main'
        }));

        console.log('📊 Transformed main banner slides:', transformedSlides);

        if (transformedSlides.length > 0) {
          setSlides(transformedSlides);
          console.log('✅ Main banners set successfully');
        } else {
          console.log('⚠️ No main banners found, using fallback data');
          setSlides(fallbackSlides);
        }

      } catch (error) {
        console.error('❌ Error fetching main banners:', error);
        console.error('❌ Error details:', error.response?.data || error.message);
        console.error('❌ Error status:', error.response?.status);

        // Use fallback slides if API fails
        console.log('🔄 Using fallback main banner slides');
        setSlides(fallbackSlides);
      } finally {
        setLoading(false);
        console.log('🏁 Main banners fetch completed');
      }
    };

    fetchMainBanners();
  }, [refreshKey]);

  // Auto slide functionality for dynamic slides
  useEffect(() => {
    const currentSlides = slides.length > 0 ? slides : fallbackSlides;
    if (!autoPlay || currentSlides.length === 0) return;

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === currentSlides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, slides.length]);

  // Scroll effect for background images
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const heroHeight = containerRef.current?.offsetHeight || 600;
      const progress = Math.min(scrollTop / heroHeight, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-play functionality for bottom slideshow
  useEffect(() => {
    const currentSlides = slides.length > 0 ? slides : fallbackSlides;
    if (currentSlides.length === 0) return;

    const interval = setInterval(() => {
      setBottomSlideIndex((prevIndex) =>
        prevIndex === currentSlides.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [slides]);

  // Reset active slide if it's out of bounds
  useEffect(() => {
    const currentSlides = slides.length > 0 ? slides : fallbackSlides;
    if (activeSlide >= currentSlides.length && currentSlides.length > 0) {
      setActiveSlide(0);
    }
  }, [slides.length, activeSlide]);

  const handleNext = () => {
    const currentSlides = slides.length > 0 ? slides : fallbackSlides;
    if (currentSlides.length === 0) return;
    setActiveSlide((prev) => (prev === currentSlides.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    const currentSlides = slides.length > 0 ? slides : fallbackSlides;
    if (currentSlides.length === 0) return;
    setActiveSlide((prev) => (prev === 0 ? currentSlides.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setActiveSlide(index);
  };

  // Handle mouse move for parallax effect
  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
    }
  };

  // Calculate parallax effect
  const parallaxStyle = (factor = 5) => ({
    transform: `translate(${(mousePosition.x - window.innerWidth / 2) / factor}px, ${(mousePosition.y - window.innerHeight / 2) / factor}px)`,
    transition: 'transform 0.1s ease-out'
  });

  // Show loading state
  if (loading) {
    return (
      <HeroSection>
        <HeroContent maxWidth="md">
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <Typography variant="h6" sx={{ color: '#fff' }}>
              جاري تحميل البانرات الرئيسية...
            </Typography>
            <Box sx={{
              width: 40,
              height: 40,
              border: '3px solid rgba(255,255,255,0.3)',
              borderTop: '3px solid #fff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }} />
          </Box>
        </HeroContent>
      </HeroSection>
    );
  }

  // Use fallback slides if no banners are available
  const displaySlides = slides.length > 0 ? slides : fallbackSlides;

  // Debug logging
  console.log('🔍 HeroBanner render state:', {
    loading,
    slidesCount: slides.length,
    displaySlidesCount: displaySlides.length,
    activeSlide,
    currentSlideTitle: displaySlides[activeSlide]?.title || 'No title'
  });

  const currentSlide = displaySlides[activeSlide] || { title: '', subtitle: '' };

  return (
    <>
      <HeroSection
        onMouseMove={handleMouseMove}
        ref={containerRef}
        scrollProgress={scrollProgress}
      >
        {/* Background Slides (Dynamic from API) with Scroll Effect */}
        <BackgroundSlides>
          {displaySlides.map((slide, index) => (
            <BackgroundSlide
              key={slide.id}
              scrollProgress={scrollProgress}
              style={{
                opacity: index === activeSlide ? 1 : 0,
                zIndex: index === activeSlide ? 1 : 0,
              }}
            >
              <img
                src={slide.image}
                alt={slide.title || `Background ${index + 1}`}
                style={{
                  cursor: slide.url ? 'pointer' : 'default',
                  transition: 'transform 0.3s ease'
                }}
                onClick={() => {
                  if (slide.url) {
                    window.open(slide.url, '_blank');
                  }
                }}
                onError={(e) => {
                  // Fallback to local image if dynamic image fails to load
                  if (fallbackSlides[index]) {
                    e.target.src = fallbackSlides[index].image;
                  }
                }}
              />
            </BackgroundSlide>
          ))}
        </BackgroundSlides>

        {/* Decorative Geometric Elements */}
        <GeometricStripes>
          {/* Diagonal stripes */}
          <Stripe top={10} left={5} width={120} height={8} rotation={45} color="#4A2B8A" delay={0} />
          <Stripe top={15} left={15} width={80} height={6} rotation={45} color="#6B3FA3" delay={0.5} />
          <Stripe top={25} left={8} width={100} height={7} rotation={45} color="#5A3596" delay={1} />
          <Stripe top={35} left={20} width={90} height={5} rotation={45} color="#4A2B8A" delay={1.5} />
          <Stripe top={45} left={12} width={110} height={8} rotation={45} color="#6B3FA3" delay={2} />
          <Stripe top={55} left={25} width={70} height={6} rotation={45} color="#5A3596" delay={2.5} />
          <Stripe top={65} left={18} width={95} height={7} rotation={45} color="#4A2B8A" delay={3} />
          <Stripe top={75} left={30} width={85} height={5} rotation={45} color="#6B3FA3" delay={3.5} />

          {/* Right side stripes */}
          <Stripe top={20} left={85} width={100} height={6} rotation={45} color="#4A2B8A" delay={0.2} />
          <Stripe top={30} left={90} width={80} height={7} rotation={45} color="#6B3FA3" delay={0.7} />
          <Stripe top={40} left={82} width={110} height={5} rotation={45} color="#5A3596" delay={1.2} />
          <Stripe top={50} left={88} width={90} height={8} rotation={45} color="#4A2B8A" delay={1.7} />
          <Stripe top={60} left={85} width={75} height={6} rotation={45} color="#6B3FA3" delay={2.2} />
          <Stripe top={70} left={92} width={100} height={7} rotation={45} color="#5A3596" delay={2.7} />

          {/* Hollow circles */}
          <HollowCircle top={15} left={80} size={40} delay={0} />
          <HollowCircle top={25} left={75} size={30} delay={1} />
          <HollowCircle top={35} left={85} size={35} delay={2} />
          <HollowCircle top={45} left={78} size={25} delay={3} />
          <HollowCircle top={55} left={82} size={45} delay={4} />
          <HollowCircle top={65} left={76} size={20} delay={5} />
          <HollowCircle top={75} left={88} size={35} delay={6} />

          {/* Left side circles */}
          <HollowCircle top={20} left={15} size={30} delay={0.5} />
          <HollowCircle top={30} left={10} size={25} delay={1.5} />
          <HollowCircle top={40} left={18} size={40} delay={2.5} />
          <HollowCircle top={50} left={12} size={20} delay={3.5} />
          <HollowCircle top={60} left={20} size={35} delay={4.5} />
          <HollowCircle top={70} left={8} size={30} delay={5.5} />
        </GeometricStripes>

        {/* Hero Content with Scroll Effects */}
        <HeroContent maxWidth={false}>
          <Box sx={{
            maxWidth: '800px',
            position: 'relative',
            zIndex: 2,
            padding: { xs: '0 20px', sm: '0 30px', md: '0 40px' },
            margin: '0 auto',
            marginTop: { xs: '20px', sm: '30px', md: '40px' },
            transform: `translateY(${scrollProgress * -30}px)`,
            transition: 'transform 0.3s ease-out',
            width: '100%',
            // Enhanced mobile height handling
            minHeight: { xs: 'calc(100vh - 120px)', sm: 'calc(100vh - 140px)', md: 'auto' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            gap: { xs: 2, sm: 2.5, md: 3 },
          }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.8rem', lg: '3.5rem' },
                fontWeight: 800,
                lineHeight: 1.2,
                color: '#fff',
                textShadow: `0 ${2 + scrollProgress * 3}px ${10 + scrollProgress * 5}px rgba(0,0,0,${0.3 + scrollProgress * 0.2})`,
                animation: `${slideInUp} 1s ease-out 0.3s both`,
                position: 'relative',
                zIndex: 2,
                transform: `translateX(${scrollProgress * -20}px)`,
                transition: 'transform 0.3s ease-out',
                textAlign: 'center',
                width: '100%',
                '&:after': {
                  content: '""',
                  display: 'block',
                  width: { xs: '50px', sm: '70px', md: '100px' },
                  height: { xs: '3px', md: '4px' },
                  background: 'rgba(255,255,255,0.8)',
                  margin: { xs: '8px auto', sm: '10px auto', md: '12px auto' },
                  borderRadius: '2px'
                }
              }}
            >
              {getLocalizedText(currentSlide.title, currentSlide.title_ar)}
            </Typography>

            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.3rem' },
                fontWeight: 400,
                color: 'rgba(255,255,255,0.95)',
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.7,
                textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                position: 'relative',
                zIndex: 2,
                transform: `translateX(${scrollProgress * -15}px)`,
                transition: 'transform 0.3s ease-out',
                opacity: 0.95 - scrollProgress * 0.3,
                textAlign: 'center',
                width: '100%',
              }}
            >
              {getLocalizedText(currentSlide.subtitle, currentSlide.subtitle_ar)}
            </Typography>

            {/* Add Hero Button */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              transform: `translateX(${scrollProgress * -10}px)`,
              transition: 'transform 0.3s ease-out',
              opacity: 1 - scrollProgress * 0.4,
            }}>
              <HeroButton
                variant="contained"
                component={RouterLink}
                to="/courses"
                
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.9rem', md: '1.1rem' },
                  padding: { xs: '8px 14px', sm: '12px 22px', md: '16px 32px' },
                  borderRadius: '8px',
                  fontWeight: 600,
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 15px rgba(45, 27, 105, 0.4)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(45, 27, 105, 0.6)',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                {t('homeStartJourney')} →
              </HeroButton>
            </Box>
          </Box>
        </HeroContent>

        {/* Carousel Indicators (Right Side) */}
        <CarouselIndicators>
          {displaySlides.map((_, index) => (
            <IndicatorDot
              key={index}
              active={index === activeSlide}
              onClick={() => goToSlide(index)}
            />
          ))}
        </CarouselIndicators>


      </HeroSection>


    </>
  );
};

export default HeroBanner;
