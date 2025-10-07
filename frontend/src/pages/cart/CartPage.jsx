import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Divider,
  Chip,
  Avatar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Delete as DeleteIcon,
  ArrowBack,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import { motion } from 'framer-motion';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { cartAPI } from '../../services/courseService';
import { paymentAPI, bannerAPI } from '../../services/api.service';
import BackGroundImage from '../../assets/images/BackGround.png';
import BGTriangleImage from '../../assets/images/BGtriangle.png';

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const triangleFloat = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-15px) rotate(2deg); }
  50% { transform: translateY(-8px) rotate(-1deg); }
  75% { transform: translateY(-20px) rotate(1deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const AnimatedBackground = styled('div')(() => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: -1,
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    zIndex: 1,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23e94560\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
    opacity: 0.4,
    zIndex: 2,
    animation: `${pulse} 15s ease-in-out infinite`,
  },
}));

const FloatingShape = styled('div')({
  position: 'absolute',
  borderRadius: '50%',
  background: 'linear-gradient(45deg, #333679, #1a5f8a)',
  filter: 'blur(60px)',
  opacity: 0.15,
  zIndex: 1,
  animation: `${float} 15s ease-in-out infinite`,
  '&:nth-of-type(1)': {
    width: '300px',
    height: '300px',
    top: '10%',
    right: '10%',
    animationDelay: '0s',
  },
  '&:nth-of-type(2)': {
    width: '200px',
    height: '200px',
    bottom: '20%',
    right: '15%',
    animationDelay: '5s',
  },
  '&:nth-of-type(3)': {
    width: '250px',
    height: '250px',
    top: '30%',
    left: '15%',
    animationDelay: '7s',
    background: 'linear-gradient(45deg, #0a3d62, #333679)',
  },
});

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
  [theme.breakpoints.down('xs')]: {
    width: '120px',
    height: '120px',
  }
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
  padding: theme.spacing(12, 0, 6),
  margin: '0 0 20px 0',
  position: 'relative',
  overflow: 'hidden',
  minHeight: '65vh',
  display: 'flex',
  alignItems: 'center',
  boxShadow: '0 15px 50px rgba(0, 0, 0, 0.3)',
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

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.15)}`,
  },
}));

const PaymentButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2, 4),
  fontSize: '1.1rem',
  fontWeight: 700,
  borderRadius: theme.shape.borderRadius * 3,
  textTransform: 'none',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
}));

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [headerBanner, setHeaderBanner] = useState(null);

  // Helper function to get image URL
  const getImageUrl = (image) => {
    if (!image) {
      return BackGroundImage;
    }

    if (typeof image === 'string') {
      // If it's already a full URL, return it
      if (image.startsWith('http')) return image;

      // If it's a relative path, construct full URL
      return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${image}`;
    }

    return BackGroundImage;
  };

  // Fetch header banner from API
  useEffect(() => {
    const fetchHeaderBanner = async () => {
      try {
        console.log('🔄 Fetching header banner from API...');

        // Try to get header banners specifically
        let bannerData;
        try {
          console.log('🔍 Trying to fetch header banners...');
          bannerData = await bannerAPI.getHeaderBanners();
          console.log('✅ Header banners received:', bannerData);
        } catch (headerBannerError) {
          console.log('⚠️ Header banners failed, trying by type...');
          try {
            bannerData = await bannerAPI.getBannersByType('header');
            console.log('✅ Header banners by type received:', bannerData);
          } catch (byTypeError) {
            console.log('⚠️ By type failed, trying active banners...');
            bannerData = await bannerAPI.getActiveBanners();
            console.log('✅ Active banners received:', bannerData);
          }
        }

        // Filter to only header type banners
        let filteredBanners = [];
        if (Array.isArray(bannerData)) {
          filteredBanners = bannerData.filter(banner => banner.banner_type === 'header');
        } else if (bannerData?.results) {
          filteredBanners = bannerData.results.filter(banner => banner.banner_type === 'header');
        } else if (bannerData?.data) {
          filteredBanners = bannerData.data.filter(banner => banner.banner_type === 'header');
        }

        console.log('📊 Filtered header banners:', filteredBanners.length);

        // Set the first header banner
        if (filteredBanners.length > 0) {
          const banner = filteredBanners[0];
          setHeaderBanner({
            id: banner.id,
            title: banner.title,
            description: banner.description || '',
            image_url: getImageUrl(banner.image || banner.image_url),
            url: banner.url || null,
            banner_type: banner.banner_type || 'header'
          });
          console.log('✅ Header banner set successfully');
        } else {
          console.log('⚠️ No header banners found');
          setHeaderBanner(null);
        }

      } catch (error) {
        console.error('❌ Error fetching header banner:', error);
        console.error('❌ Error details:', error.response?.data || error.message);
        setHeaderBanner(null);
      }
    };

    fetchHeaderBanner();
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: '/cart' } });
        return;
      }
      loadCartItems();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const loadCartItems = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      setCartItems(response.items || []);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await cartAPI.removeFromCart(itemId);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing from cart:', error);
      alert(t('cartRemoveError'));
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.course.discount_price || item.course.price;
      return total + parseFloat(price);
    }, 0);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    if (cartItems.length === 0) {
      alert(t('cartEmptyMessage'));
      return;
    }

    try {
      setProcessingPayment(true);
      const { url } = await paymentAPI.createMoyasarPayment();
      window.location.href = url;
    } catch (error) {
      console.error('Payment error:', error);
      alert(t('cartPaymentError'));
    } finally {
      setProcessingPayment(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      position: 'relative',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden'
    }}>
      <AnimatedBackground>
        <FloatingShape />
        <FloatingShape style={{ width: '200px', height: '200px', bottom: '20%', right: '15%', animationDelay: '5s' }} />
        <FloatingShape style={{ width: '250px', height: '250px', top: '30%', left: '15%', animationDelay: '7s' }} />
      </AnimatedBackground>
      <Header />

      {/* Hero Section */}
      <HeroSection backgroundImage={headerBanner?.image_url}>
        <AnimatedTriangle />
        {/* Animated Background Elements - Responsive sizing */}
        <FloatingShape style={{ 
          width: '300px', 
          height: '300px', 
          top: '-100px', 
          right: '-100px', 
          animationDelay: '0s',
          '@media (max-width: 768px)': { width: '150px', height: '150px', top: '-50px', right: '-50px' }
        }} />
        <FloatingShape style={{ 
          width: '200px', 
          height: '200px', 
          bottom: '-50px', 
          right: '20%', 
          animationDelay: '2s', 
          animationDuration: '15s',
          '@media (max-width: 768px)': { width: '100px', height: '100px', bottom: '-25px' }
        }} />
        <FloatingShape style={{ 
          width: '400px', 
          height: '400px', 
          bottom: '-200px', 
          left: '-150px', 
          animationDelay: '4s', 
          animationDuration: '20s',
          '@media (max-width: 768px)': { width: '200px', height: '200px', bottom: '-100px', left: '-75px' }
        }} />

        <Container maxWidth="lg" sx={{ 
          position: 'relative', 
          zIndex: 3,
          px: { xs: 2, sm: 3, md: 4 }
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Box sx={{
              textAlign: 'center',
              py: { xs: 2, sm: 3 },
              position: 'relative',
              '&::before, &::after': {
                content: '""',
                position: 'absolute',
                width: { xs: '60px', sm: '80px', md: '100px' },
                height: { xs: '60px', sm: '80px', md: '100px' },
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                filter: 'blur(40px)',
                zIndex: -1,
              },
              '&::before': {
                top: '20%',
                left: { xs: '5%', sm: '8%', md: '10%' },
                animation: `${pulse} 8s ease-in-out infinite`,
              },
              '&::after': {
                bottom: '10%',
                right: { xs: '8%', sm: '12%', md: '15%' },
                animation: `${pulse} 10s ease-in-out infinite reverse`,
              }
            }}>
              <Box sx={{ 
                mb: { xs: 3, sm: 4 }, 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1, sm: 2 }, 
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <IconButton 
                  onClick={() => navigate(-1)} 
                  sx={{ 
                    color: 'white',
                    p: { xs: 1, sm: 1.5 }
                  }}
                >
                  <ArrowBack sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                </IconButton>
                <Typography
                  variant="h3"
                  component="h1"
                  fontWeight={700}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 0.5, sm: 1 },
                    color: 'white',
                    fontSize: { xs: '1.3rem', sm: '1.8rem', md: '2.2rem' },
                    lineHeight: { xs: 1.3, sm: 1.2 },
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    wordBreak: 'break-word'
                  }}
                >
                  <CartIcon 
                    color="inherit" 
                    sx={{ fontSize: { xs: '1.3rem', sm: '1.8rem', md: '2.2rem' } }}
                  />
                  {t('cartTitle')}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </HeroSection>

      <Container maxWidth="lg" sx={{ 
        py: { xs: 3, sm: 4 }, 
        px: { xs: 2, sm: 3, md: 4 },
        flex: 1 
      }}>

        {cartItems.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: { xs: 6, sm: 8 },
            px: { xs: 2, sm: 0 }
          }}>
            <CartIcon sx={{ 
              fontSize: { xs: 60, sm: 80 }, 
              color: 'text.secondary', 
              mb: { xs: 1.5, sm: 2 } 
            }} />
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{
                fontSize: { xs: '1.3rem', sm: '1.5rem' },
                mb: { xs: 1.5, sm: 2 }
              }}
            >
              {t('cartEmpty')}
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: { xs: 2.5, sm: 3 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                px: { xs: 2, sm: 0 }
              }}
            >
              {t('cartEmptyDescription')}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/courses')}
              sx={{ 
                borderRadius: 3, 
                px: { xs: 3, sm: 4 }, 
                py: { xs: 1.2, sm: 1.5 },
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              {t('cartBrowseCourses')}
            </Button>
          </Box>
        ) : (
          <Grid container spacing={{ xs: 3, sm: 4 }}>
            <Grid xs={12} lg={8}>
              <StyledCard>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      mb: { xs: 2, sm: 3 }, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}
                  >
                    <CartIcon color="primary" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
                    {t('cartAddedCourses')} ({cartItems.length})
                  </Typography>

                  {cartItems.map((item) => (
                    <Box key={item.course.id} sx={{
                      display: 'flex',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      p: { xs: 1.5, sm: 2 },
                      mb: { xs: 1.5, sm: 2 },
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 2, sm: 0 }
                    }}>
                      <Avatar
                        src={item.course.image}
                        alt={item.course.title}
                        sx={{ 
                          width: { xs: 60, sm: 80 }, 
                          height: { xs: 60, sm: 80 }, 
                          mr: { xs: 0, sm: 2 },
                          alignSelf: { xs: 'center', sm: 'flex-start' }
                        }}
                      />
                      <Box sx={{ 
                        flex: 1, 
                        mr: { xs: 0, sm: 2 },
                        textAlign: { xs: 'center', sm: 'left' },
                        width: { xs: '100%', sm: 'auto' }
                      }}>
                        <Typography 
                          variant="h6" 
                          fontWeight={600} 
                          gutterBottom
                          sx={{
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                            mb: { xs: 1, sm: 1.5 }
                          }}
                        >
                          {item.course.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mb: { xs: 1, sm: 1 },
                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                          }}
                        >
                          {item.course.instructor}
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2,
                          justifyContent: { xs: 'center', sm: 'flex-start' },
                          flexWrap: 'wrap'
                        }}>
                          <Chip
                            label={item.course.level}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{
                              fontSize: { xs: '0.7rem', sm: '0.8rem' },
                              height: { xs: '24px', sm: '28px' }
                            }}
                          />
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                          >
                            {item.course.duration}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ 
                        textAlign: { xs: 'center', sm: 'left' }, 
                        mr: { xs: 0, sm: 2 },
                        mb: { xs: 1, sm: 0 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: { xs: 'center', sm: 'flex-start' }
                      }}>
                        <Typography 
                          variant="h6" 
                          color="primary" 
                          fontWeight={700}
                          sx={{
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                          }}
                        >
                          {parseFloat(item.course.discount_price || item.course.price).toFixed(2)} {t('paymentSARShort')}
                        </Typography>
                        {item.course.discount_price && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              textDecoration: 'line-through',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                          >
                            {parseFloat(item.course.price).toFixed(2)} {t('paymentSARShort')}
                          </Typography>
                        )}
                      </Box>
                      <IconButton
                        color="error"
                        onClick={() => removeFromCart(item.id)}
                        sx={{ 
                          ml: { xs: 0, sm: 1 },
                          alignSelf: { xs: 'center', sm: 'flex-start' },
                          p: { xs: 1, sm: 1.5 }
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                      </IconButton>
                    </Box>
                  ))}
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid xs={12} lg={4}>
              <StyledCard sx={{ 
                position: { xs: 'static', lg: 'sticky' },
                top: { lg: '20px' }
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      mb: { xs: 2, sm: 3 }, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}
                  >
                    <ReceiptIcon color="primary" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
                    {t('cartOrderSummary')}
                  </Typography>

                  <Box sx={{ mb: { xs: 2.5, sm: 3 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography 
                        variant="body1"
                        sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                      >
                        {t('cartCoursesCount')}:
                      </Typography>
                      <Typography 
                        variant="body1" 
                        fontWeight={600}
                        sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                      >
                        {cartItems.length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography 
                        variant="body1"
                        sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                      >
                        {t('cartSubtotal')}:
                      </Typography>
                      <Typography 
                        variant="body1" 
                        fontWeight={600}
                        sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                      >
                        {calculateTotal().toFixed(2)} {t('paymentSARShort')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography 
                        variant="body1"
                        sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                      >
                        {t('cartTax')} (15%):
                      </Typography>
                      <Typography 
                        variant="body1" 
                        fontWeight={600}
                        sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                      >
                        {(calculateTotal() * 0.15).toFixed(2)} {t('paymentSARShort')}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography 
                        variant="h6" 
                        fontWeight={700}
                        sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                      >
                        {t('cartTotal')}:
                      </Typography>
                      <Typography 
                        variant="h6" 
                        color="primary" 
                        fontWeight={700}
                        sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                      >
                        {(calculateTotal() * 1.15).toFixed(2)} {t('paymentSARShort')}
                      </Typography>
                    </Box>
                  </Box>

                  <PaymentButton
                    variant="contained"
                    onClick={handleCheckout}
                    startIcon={processingPayment ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
                    disabled={cartItems.length === 0 || processingPayment}
                    sx={{
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      py: { xs: 1.5, sm: 2 }
                    }}
                  >
                    {processingPayment ? t('cartProcessingPayment') : t('cartCompletePurchase')}
                  </PaymentButton>

                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ 
                      mt: 2, 
                      borderRadius: 3, 
                      py: { xs: 1.2, sm: 1.5 },
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }}
                    onClick={() => navigate('/courses')}
                  >
                    {t('cartAddMoreCourses')}
                  </Button>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        )}
      </Container>

      <Footer />
    </Box>
  );
};

export default CartPage;
