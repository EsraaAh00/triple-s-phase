import React from 'react';
import { Box, Container, Typography, Breadcrumbs, Link } from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { NavigateNext, Home } from '@mui/icons-material';
import BackGroundImage from '../../assets/images/BackGround.png';
import BGTriangleImage from '../../assets/images/BGtriangle.png';

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const triangleFloat = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-15px) rotate(2deg); }
  50% { transform: translateY(-8px) rotate(-1deg); }
  75% { transform: translateY(-20px) rotate(1deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const AnimatedTriangle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '20px',
  left: '20px',
  width: '250px',
  height: '250px',
  backgroundImage: `url(${BGTriangleImage})`,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  opacity: 0.7,
  zIndex: 2,
  animation: `${triangleFloat} 4s ease-in-out infinite`,
  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
  '&:hover': {
    opacity: 1,
    transform: 'scale(1.1)',
  },
  [theme.breakpoints.down('md')]: {
    width: '200px',
    height: '200px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '160px',
    height: '160px',
    bottom: '15px',
    left: '15px',
  },
}));

const HeroSection = styled('div', {
  shouldForwardProp: (prop) => prop !== 'backgroundImage',
})(({ theme, backgroundImage }) => ({
  background: `url(${backgroundImage || BackGroundImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'fixed',
  color: 'white',
  padding: theme.spacing(15, 0, 8),
  margin: '0 0 20px 0',
  position: 'relative',
  overflow: 'hidden',
  minHeight: '50vh',
  display: 'flex',
  alignItems: 'center',
  boxShadow: '0 15px 50px rgba(0, 0, 0, 0.3)',
  [theme.breakpoints.down('md')]: {
    minHeight: '45vh',
    padding: theme.spacing(12, 0, 6),
  },
  [theme.breakpoints.down('sm')]: {
    minHeight: '40vh',
    padding: theme.spacing(10, 0, 5),
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.25) 50%, rgba(0, 0, 0, 0.3) 100%),
      url(${backgroundImage || BackGroundImage})
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    filter: 'brightness(1.2) contrast(1.1) saturate(1.1)',
    zIndex: 1,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '200%',
    height: '200%',
    background: `radial-gradient(circle, ${alpha('#ffffff', 0.08)} 0%, transparent 70%)`,
    transform: 'translate(-50%, -50%)',
    animation: `${float} 6s ease-in-out infinite`,
    zIndex: 2,
  }
}));

const ContentContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 3,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '3rem',
  marginBottom: theme.spacing(2),
  textShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
  color: '#ffffff',
  [theme.breakpoints.down('md')]: {
    fontSize: '2.5rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
  },
}));

const PageSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  marginBottom: theme.spacing(3),
  opacity: 0.95,
  color: '#ffffff',
  maxWidth: '600px',
  textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
  [theme.breakpoints.down('md')]: {
    fontSize: '1.1rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
    marginBottom: theme.spacing(2),
  },
}));

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  '& .MuiBreadcrumbs-separator': {
    color: '#ffffff',
  },
  '& a, & p': {
    color: '#ffffff',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    fontSize: '0.95rem',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

const PageBanner = ({ 
  title, 
  subtitle, 
  breadcrumbs = [], 
  backgroundImage 
}) => {
  return (
    <HeroSection backgroundImage={backgroundImage}>
      <AnimatedTriangle />
      <ContentContainer maxWidth="lg">
        <PageTitle variant="h1" component="h1">
          {title}
        </PageTitle>
        
        {subtitle && (
          <PageSubtitle variant="body1">
            {subtitle}
          </PageSubtitle>
        )}
        
        {breadcrumbs.length > 0 && (
          <StyledBreadcrumbs
            separator={<NavigateNext fontSize="small" />}
            aria-label="breadcrumb"
          >
            <Link component={RouterLink} to="/">
              <Home fontSize="small" />
              Home
            </Link>
            {breadcrumbs.map((crumb, index) => (
              crumb.link ? (
                <Link key={index} component={RouterLink} to={crumb.link}>
                  {crumb.label}
                </Link>
              ) : (
                <Typography key={index} color="inherit">
                  {crumb.label}
                </Typography>
              )
            ))}
          </StyledBreadcrumbs>
        )}
      </ContentContainer>
    </HeroSection>
  );
};

export default PageBanner;

