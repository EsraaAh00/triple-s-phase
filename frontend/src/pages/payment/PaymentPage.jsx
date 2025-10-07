import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Divider,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
  IconButton,
  Paper
} from '@mui/material';
import {
  Payment as PaymentIcon,
  ArrowBack,
  Receipt as ReceiptIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { courseAPI } from '../../services/courseService';
import { paymentAPI } from '../../services/api.service';
import BackGroundImage from '../../assets/images/BackGround.png';
import BGTriangleImage from '../../assets/images/BGtriangle.png';

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
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
  [theme.breakpoints.down('xs')]: {
    width: '120px',
    height: '120px',
  }
}));

const HeroSection = styled(Box)(({ theme }) => ({
  background: `url(${BackGroundImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'fixed',
  color: 'white',
  padding: theme.spacing(8, 0, 4),
  position: 'relative',
  overflow: 'hidden',
  minHeight: '40vh',
  display: 'flex',
  alignItems: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.25) 50%, rgba(0, 0, 0, 0.3) 100%),
      url(${BackGroundImage})
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
  borderRadius: theme.shape.borderRadius * 3,
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha('#663399', 0.1)}`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.12)}`,
  },
}));

const PaymentButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2.5, 4),
  fontSize: '1.2rem',
  fontWeight: 700,
  borderRadius: theme.shape.borderRadius * 4,
  textTransform: 'none',
  background: `linear-gradient(135deg, #663399 0%, #1565c0 100%)`,
  boxShadow: `0 8px 32px ${alpha('#663399', 0.3)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.2)}, transparent)`,
    transition: 'left 0.5s',
  },
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 16px 48px ${alpha('#663399', 0.4)}`,
    '&::before': {
      left: '100%',
    },
  },
}));

const CourseCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(135deg, ${alpha('#42a5f5', 0.05)} 0%, ${alpha('#663399', 0.02)} 100%)`,
  border: `1px solid ${alpha('#663399', 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: `linear-gradient(90deg, #663399, #f50057)`,
  },
}));

const FeatureBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius * 2,
  background: alpha('#2e7d32', 0.1),
  border: `1px solid ${alpha('#2e7d32', 0.2)}`,
  color: '#2e7d32',
  fontSize: '0.875rem',
  fontWeight: 500,
}));

const PaymentPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: `/payment/${courseId}` } });
        return;
      }
      loadCourseData();
    }
  }, [courseId, isAuthenticated, authLoading, navigate]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const courseData = await courseAPI.getCourseById(courseId);
      setCourse(courseData);
    } catch (error) {
      console.error('Error loading course:', error);
      alert(t('paymentCourseLoadError'));
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/payment/${courseId}` } });
      return;
    }

    try {
      setProcessingPayment(true);

      // Create direct payment for the course
      const { url } = await paymentAPI.createCoursePayment(courseId);
      window.location.href = url;
    } catch (error) {
      console.error('Payment error:', error);
      if (error.response?.data?.detail) {
        alert(error.response.data.detail);
      } else {
        alert(t('paymentProcessError'));
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  const calculateTotal = () => {
    if (!course) return 0;
    const price = course.discount_price || course.price;
    const subtotal = parseFloat(price);
    const tax = subtotal * 0.15; // 15% tax
    return subtotal + tax;
  };

  if (authLoading || loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {t('paymentCourseNotFound')}
          </Typography>
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/courses')}
          startIcon={<ArrowBack />}
          sx={{ borderRadius: 3, px: 4, py: 1.5 }}
        >
          {t('paymentBackToCourses')}
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header />

      {/* Hero Section */}
      <HeroSection>
        <AnimatedTriangle />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3 }}>
          <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                color: 'white',
                background: alpha('#fff', 0.2),
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  background: alpha('#fff', 0.3),
                  transform: 'scale(1.1)',
                }
              }}
            >
              <ArrowBack />
            </IconButton>
            <Typography
              variant="h3"
              component="h1"
              fontWeight={800}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                color: 'white',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}
            >
              <PaymentIcon sx={{ fontSize: 40 }} />
              {t('paymentCompletePurchase')}
            </Typography>
          </Box>
        </Container>
      </HeroSection>

      <Container maxWidth="lg" sx={{ py: 6, flex: 1 }}>

        <Grid container spacing={4}>
          <Grid xs={12} lg={8}>
            <StyledCard>
              <CardContent>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    mb: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    fontWeight: 700,
                    color: '#663399'
                  }}
                >
                  <ReceiptIcon sx={{ fontSize: 28 }} />
                  {t('paymentCourseInfo')}
                </Typography>

                <CourseCard elevation={0}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Avatar
                      src={course.image}
                      alt={course.title}
                      sx={{
                        width: 120,
                        height: 120,
                        border: '4px solid',
                        borderColor: '#663399',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                        {course.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontSize: '1.1rem' }}>
                        {course.instructor}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                        <Chip
                          label={course.level}
                          color="primary"
                          variant="filled"
                          sx={{ fontWeight: 600 }}
                        />
                        <FeatureBox>
                          <TimeIcon fontSize="small" />
                          {course.duration}
                        </FeatureBox>
                        <FeatureBox>
                          <GroupIcon fontSize="small" />
                          {course.total_enrollments || 0} {t('paymentEnrolled')}
                        </FeatureBox>
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                      <Typography variant="h4" color="primary" fontWeight={800} sx={{ mb: 1 }}>
                        {parseFloat(course.discount_price || course.price).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {t('paymentSAR')}
                      </Typography>
                      {course.discount_price && (
                        <Typography
                          variant="body2"
                          color="error.main"
                          sx={{
                            textDecoration: 'line-through',
                            fontWeight: 600
                          }}
                        >
                          {parseFloat(course.price).toFixed(2)} {t('paymentSARShort')}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CourseCard>

                <Alert
                  severity="info"
                  sx={{
                    mt: 4,
                    borderRadius: 3,
                    background: alpha('#e3f2fd', 0.8),
                    border: '1px solid',
                    borderColor: '#42a5f5'
                  }}
                >
                  <SecurityIcon sx={{ mr: 1, color: '#663399' }} />
                  <Typography variant="body1" fontWeight={600}>
                    {t('paymentSecurePayment')}
                  </Typography>
                </Alert>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid xs={12} lg={4}>
            <Box sx={{ position: 'sticky', top: 24 }}>
              <StyledCard>
                <CardContent>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      mb: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      fontWeight: 700,
                      color: '#663399'
                    }}
                  >
                    <ReceiptIcon sx={{ fontSize: 28 }} />
                    {t('paymentOrderSummary')}
                  </Typography>

                  <Box sx={{ mb: 4 }}>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      background: alpha('#663399', 0.05)
                    }}>
                      <Typography variant="body1" fontWeight={600}>{t('paymentCoursePrice')}:</Typography>
                      <Typography variant="body1" fontWeight={700} color="primary">
                        {parseFloat(course.discount_price || course.price).toFixed(2)} {t('paymentSARShort')}
                      </Typography>
                    </Box>

                    {course.discount_price && (
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 2,
                        p: 1.5,
                        borderRadius: 2,
                        background: alpha('#2e7d32', 0.1)
                      }}>
                        <Typography variant="body2" color="success.main" fontWeight={600}>
                          {t('paymentSavings')}:
                        </Typography>
                        <Typography variant="body2" color="success.main" fontWeight={700}>
                          {(parseFloat(course.price) - parseFloat(course.discount_price)).toFixed(2)} {t('paymentSARShort')}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      background: alpha('#ed6c02', 0.05)
                    }}>
                      <Typography variant="body1" fontWeight={600}>{t('paymentTax')} (15%):</Typography>
                      <Typography variant="body1" fontWeight={700} color="warning.main">
                        {(parseFloat(course.discount_price || course.price) * 0.15).toFixed(2)} {t('paymentSARShort')}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 3, borderWidth: 2 }} />

                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      p: 3,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #333679 100%)',
                      color: 'white'
                    }}>
                      <Typography variant="h6" fontWeight={700}>{t('paymentTotal')}:</Typography>
                      <Typography variant="h5" fontWeight={800}>
                        {calculateTotal().toFixed(2)} {t('paymentSARShort')}
                      </Typography>
                    </Box>
                  </Box>

                  <PaymentButton
                    variant="contained"
                    onClick={handlePaymentSubmit}
                    disabled={processingPayment}
                    startIcon={processingPayment ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
                  >
                    {processingPayment ? t('paymentRedirecting') : t('paymentCompleteSecure')}
                  </PaymentButton>

                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      mt: 3,
                      borderRadius: 3,
                      py: 1.5,
                      borderWidth: 2,
                      fontWeight: 600,
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-2px)',
                      }
                    }}
                    onClick={() => navigate('/courses')}
                  >
                    {t('paymentBackToCourses')}
                  </Button>

                  <Box sx={{
                    mt: 4,
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #4DBFB3 0%, #45a049 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'url("data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="10" cy="10" r="1"/%3E%3C/g%3E%3C/svg%3E")',
                      opacity: 0.3,
                    }
                  }}>
                    <Typography variant="h6" sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 2,
                      fontWeight: 700
                    }}>
                      <CheckCircleIcon />
                      {t('paymentIncludedFeatures')}
                    </Typography>
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon fontSize="small" />
                        {t('paymentLifetimeAccess')}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon fontSize="small" />
                        {t('paymentCertifiedCompletion')}
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon fontSize="small" />
                        {t('paymentMoneyBackGuarantee')}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </StyledCard>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
};

export default PaymentPage;
