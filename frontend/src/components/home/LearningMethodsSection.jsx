import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  useTheme,
  useMediaQuery,
  styled,
  keyframes,
  Fade,
  CircularProgress,
  IconButton
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  School,
  ArrowForward,
  LocalPharmacy,
  MedicalServices,
  LocalHospital,
  Description,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  MenuBook
} from '@mui/icons-material';
import { courseAPI } from '../../services/api.service';

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const SectionContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff',
  position: 'relative',
  overflow: 'hidden',
  // Minimal padding
  padding: theme.spacing(1, 0),
  '@media (max-width: 600px)': {
    padding: theme.spacing(0.5, 0),
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    padding: theme.spacing(0.8, 0),
  },
  '@media (min-width: 900px) and (max-width: 1200px)': {
    padding: theme.spacing(1, 0),
  },
  '@media (min-width: 1200px)': {
    padding: theme.spacing(1, 0),
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 25% 25%, rgba(92, 45, 145, 0.06) 0%, transparent 25%),
      radial-gradient(circle at 75% 75%, rgba(52, 73, 139, 0.06) 0%, transparent 25%),
      radial-gradient(circle at 50% 10%, rgba(135, 206, 235, 0.04) 0%, transparent 20%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.98) 100%)
    `,
    zIndex: 0,
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      repeating-linear-gradient(
        90deg,
        transparent 0px,
        transparent 48px,
        rgba(92, 45, 145, 0.015) 50px,
        rgba(92, 45, 145, 0.015) 52px
      ),
      repeating-linear-gradient(
        0deg,
        transparent 0px,
        transparent 48px,
        rgba(52, 73, 139, 0.015) 50px,
        rgba(52, 73, 139, 0.015) 52px
      )
    `,
    zIndex: 0,
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(2), // increase space between title and categories
  alignItems: 'center',
  position: 'relative',
  zIndex: 2,
  minHeight: '200px', // Much smaller height
  // Enhanced responsive layout with minimal spacing
  '@media (max-width: 600px)': {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(0.8), // slightly larger to breathe on mobile
    minHeight: 'auto',
    alignItems: 'flex-start',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(1),
    minHeight: 'auto',
    alignItems: 'flex-start',
  },
  '@media (min-width: 900px) and (max-width: 1200px)': {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(1.5),
    minHeight: 'auto',
    alignItems: 'flex-start',
  },
  '@media (min-width: 1200px)': {
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing(2.5),
    minHeight: '200px', // Much smaller height
    alignItems: 'center',
  },
}));

const LeftSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5), // Minimal gap
  // Enhanced responsive layout with minimal spacing
  '@media (max-width: 600px)': {
    textAlign: 'center',
    order: 1, // Changed from 2 to 1 to show title first
    gap: theme.spacing(0.3), // Minimal gap
    padding: theme.spacing(0, 0.5),
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    textAlign: 'center',
    order: 1, // Changed from 2 to 1 to show title first
    gap: theme.spacing(0.4), // Minimal gap
    padding: theme.spacing(0, 1),
  },
  '@media (min-width: 900px) and (max-width: 1200px)': {
    textAlign: 'center',
    order: 1, // Changed from 2 to 1 to show title first
    gap: theme.spacing(0.5), // Minimal gap
    padding: theme.spacing(0, 1.5),
  },
  '@media (min-width: 1200px)': {
    textAlign: 'left',
    order: 1,
    gap: theme.spacing(0.5), // Minimal gap
    padding: 0,
  },
}));

// Title label styled like AboutAcademySection.SectionLabel
const CategoryIcon = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  backgroundColor: 'rgba(111, 66, 193, 0.1)',
  borderRadius: '30px',
  marginBottom: theme.spacing(1.2),
  justifyContent: { xs: 'center', md: 'flex-start' },
  '& .MuiSvgIcon-root': {
    color: '#6f42c1',
    fontSize: '1.2rem',
  },
  '& span': {
    color: '#6f42c1',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
}));

const MainTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  color: '#5C2D91',
  lineHeight: 1.1, // Tighter line height
  marginBottom: theme.spacing(0.75), // a bit more space below title
  padding: '10px 0',
  overflow: 'hidden',
  // Responsive font size
  fontSize: '2rem',
  '@media (max-width: 600px)': {
    fontSize: '1.4rem',
    whiteSpace: 'normal',
    textAlign: 'center',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    fontSize: '1.6rem',
    whiteSpace: 'normal',
    textAlign: 'center',
  },
  '@media (min-width: 900px) and (max-width: 1200px)': {
    fontSize: '1.8rem',
    whiteSpace: 'normal',
    textAlign: 'center',
  },
  '@media (min-width: 1200px)': {
    fontSize: '2rem',
    whiteSpace: 'nowrap',
    textAlign: 'center',
  },
  textOverflow: 'ellipsis',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.4rem',
    whiteSpace: 'normal', // Allow wrapping on very small screens
    textOverflow: 'unset',
  },
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  color: '#6c757d',
  lineHeight: 1.4, // Tighter line height
  marginBottom: theme.spacing(0.5), // Minimal margin
  maxWidth: '500px',
  // Responsive font size and width
  '@media (max-width: 600px)': {
    fontSize: '0.95rem',
    maxWidth: '100%',
    textAlign: 'center',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    fontSize: '1rem',
    maxWidth: '100%',
    textAlign: 'center',
  },
  '@media (min-width: 900px) and (max-width: 1200px)': {
    fontSize: '1.05rem',
    maxWidth: '100%',
    textAlign: 'center',
  },
  '@media (min-width: 1200px)': {
    fontSize: '1.1rem',
    maxWidth: '500px',
    textAlign: 'left',
  },
}));

const ViewAllButton = styled(Button)(({ theme }) => ({
  background: '#34498B',
  color: '#fff',
  borderRadius: '30px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 4px 15px rgba(52, 73, 139, 0.3)',
  transition: 'all 0.3s ease',
  // Responsive sizing
  padding: theme.spacing(1.5, 3),
  fontSize: '1rem',
  minHeight: '44px',
  '@media (max-width: 600px)': {
    padding: theme.spacing(1.2, 2.5),
    fontSize: '0.9rem',
    minHeight: '40px',
    alignSelf: 'center',
  },
  '@media (min-width: 600px) and (max-width: 1200px)': {
    padding: theme.spacing(1.3, 2.8),
    fontSize: '0.95rem',
    alignSelf: 'center',
  },
  '@media (min-width: 1200px)': {
    padding: theme.spacing(1.5, 3),
    fontSize: '1rem',
    alignSelf: 'flex-start',
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(52, 73, 139, 0.4)',
    backgroundColor: '#2a3a6b',
  },
}));

const RightSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(0.3), // Minimal gap
  // Enhanced responsive layout with minimal spacing
  '@media (max-width: 600px)': {
    order: 2, // Changed from 1 to 2 to show after title
    gap: theme.spacing(0.2), // Minimal gap
    padding: theme.spacing(0, 0.5),
    width: '100%',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    order: 2, // Changed from 1 to 2 to show after title
    gap: theme.spacing(0.3), // Minimal gap
    padding: theme.spacing(0, 1),
    width: '100%',
  },
  '@media (min-width: 900px) and (max-width: 1200px)': {
    order: 2, // Changed from 1 to 2 to show after title
    gap: theme.spacing(0.3), // Minimal gap
    padding: theme.spacing(0, 1.5),
    width: '100%',
  },
  '@media (min-width: 1200px)': {
    order: 2,
    gap: theme.spacing(0.3), // Minimal gap
    padding: 0,
    width: 'auto',
  },
}));


const CategoryCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  overflow: 'hidden',
  backgroundColor: '#ffffff',
  flexShrink: 0, // Prevent cards from shrinking
  display: 'flex',
  flexDirection: 'column',
  // Responsive sizing
  minWidth: '200px',
  maxWidth: '220px',
  width: '200px',
  minHeight: '300px',
  '@media (max-width: 600px)': {
    minWidth: '160px',
    maxWidth: '160px',
    width: '160px',
    minHeight: '260px',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    minWidth: '170px',
    maxWidth: '170px',
    width: '170px',
    minHeight: '270px',
  },
  '@media (min-width: 900px) and (max-width: 1200px)': {
    minWidth: '180px',
    maxWidth: '180px',
    width: '180px',
    minHeight: '280px',
  },
  '@media (min-width: 1200px)': {
    minWidth: '200px',
    maxWidth: '220px',
    width: '200px',
    minHeight: '300px',
  },
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.12)',
  },
}));

const CardHeader = styled(Box)(({ theme }) => ({
  background: 'transparent',
  padding: theme.spacing(2, 2, 1, 2),
  textAlign: 'center',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  // Responsive padding
  '@media (max-width: 600px)': {
    padding: theme.spacing(1.5, 1.5, 0.5, 1.5),
  },
  '@media (min-width: 600px) and (max-width: 1200px)': {
    padding: theme.spacing(1.8, 1.8, 0.8, 1.8),
  },
  '@media (min-width: 1200px)': {
    padding: theme.spacing(2, 2, 1, 2),
  },
  '& .MuiSvgIcon-root': {
    marginBottom: theme.spacing(1),
    color: '#87CEEB',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
    // Responsive icon size
    fontSize: '3rem',
    '@media (max-width: 600px)': {
      fontSize: '2.5rem',
    },
    '@media (min-width: 600px) and (max-width: 900px)': {
      fontSize: '2.7rem',
    },
    '@media (min-width: 900px) and (max-width: 1200px)': {
      fontSize: '2.8rem',
    },
    '@media (min-width: 1200px)': {
      fontSize: '3rem',
    },
  },
}));

const CardTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(0.5),
  color: '#5C2D91',
  // Responsive font size
  fontSize: '1.1rem',
  '@media (max-width: 600px)': {
    fontSize: '0.95rem',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    fontSize: '1rem',
  },
  '@media (min-width: 900px) and (max-width: 1200px)': {
    fontSize: '1.05rem',
  },
  '@media (min-width: 1200px)': {
    fontSize: '1.1rem',
  },
}));

const CourseCount = styled(Typography)(({ theme }) => ({
  color: '#666666',
  fontWeight: 500,
  // Responsive font size
  fontSize: '0.9rem',
  '@media (max-width: 600px)': {
    fontSize: '0.8rem',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    fontSize: '0.85rem',
  },
  '@media (min-width: 900px) and (max-width: 1200px)': {
    fontSize: '0.87rem',
  },
  '@media (min-width: 1200px)': {
    fontSize: '0.9rem',
  },
}));

const CategoryCardContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2, 2, 2),
  textAlign: 'center',
  marginTop: 'auto',
}));

const ReadMoreButton = styled(Button)(({ theme, color }) => ({
  background: '#34498B',
  color: '#fff',
  padding: theme.spacing(1, 2),
  borderRadius: '20px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  width: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 15px rgba(52, 73, 139, 0.4)',
    backgroundColor: '#2a3a6b',
  },
}));

const ConnectingLine = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '60%',
  left: '20%',
  right: '20%',
  height: '2px',
  background: 'linear-gradient(90deg, transparent, #E0E0E0, transparent)',
  zIndex: 1,
  borderRadius: '1px',
  '&:after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(45deg)',
    width: '8px',
    height: '8px',
    background: '#E0E0E0',
    borderRadius: '1px',
  },
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));



const LearningMethodsSection = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollContainer, setScrollContainer] = useState(null);
  const navigate = useNavigate();

  // Enhanced responsive scroll navigation functions
  const scrollLeft = () => {
    if (scrollContainer) {
      // Responsive scroll distance based on screen size
      let cardWidth;
      if (window.innerWidth <= 600) {
        cardWidth = 160 + 12; // Mobile card width + gap
      } else if (window.innerWidth <= 900) {
        cardWidth = 170 + 16; // Small tablet card width + gap
      } else if (window.innerWidth <= 1200) {
        cardWidth = 180 + 16; // Large tablet card width + gap
      } else {
        cardWidth = 200 + 16; // Desktop card width + gap
      }
      
      scrollContainer.scrollBy({
        left: -cardWidth,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainer) {
      // Responsive scroll distance based on screen size
      let cardWidth;
      if (window.innerWidth <= 600) {
        cardWidth = 160 + 12; // Mobile card width + gap
      } else if (window.innerWidth <= 900) {
        cardWidth = 170 + 16; // Small tablet card width + gap
      } else if (window.innerWidth <= 1200) {
        cardWidth = 180 + 16; // Large tablet card width + gap
      } else {
        cardWidth = 200 + 16; // Desktop card width + gap
      }
      
      scrollContainer.scrollBy({
        left: cardWidth,
        behavior: 'smooth'
      });
    }
  };

  // Helper function to get image URL
  const getImageUrl = (image) => {
    if (!image) {
      return null;
    }

    if (typeof image === 'string') {
      // If it's already a full URL, return it
      if (image.startsWith('http')) return image;

      // If it's a relative path, construct full URL
      return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${image}`;
    }

    return null;
  };

  // Load categories from API
  const loadCategories = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching categories from API...');
      const response = await courseAPI.getCategories();
      console.log('✅ Categories received:', response);

      // Ensure we have an array and filter active categories
      const categoriesData = Array.isArray(response) ? response : [];
      const activeCategories = categoriesData.filter(category => category.is_active !== false);

      console.log('📊 Active categories:', activeCategories.length);
      setCategories(activeCategories);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      setError(t('coursesLoadingError'));
      setCategories([]);
    } finally {
      setLoading(false);
      console.log('🏁 Categories loading completed');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';

    // Medical categories
    if (name.includes('صيدلة') || name.includes('pharmacy')) return <LocalPharmacy />;
    if (name.includes('طب') || name.includes('medicine') || name.includes('medical')) return <LocalHospital />;
    if (name.includes('اسنان') || name.includes('dentistry') || name.includes('dental')) return <MedicalServices />;

    // General categories
    if (name.includes('دورة') || name.includes('course')) return <School />;
    if (name.includes('تدريب') || name.includes('training')) return <Code />;
    if (name.includes('دبلوم') || name.includes('diploma')) return <MenuBook />;

    // Default icon
    return <School />;
  };


  return (
    <SectionContainer>
      <Container maxWidth="lg">
        <ContentWrapper>
          <LeftSection>
            <CategoryIcon>
              <Description />
              <span>{t('coursesCourseCategories')}</span>
            </CategoryIcon>

            <MainTitle variant="h2" component="h2">
              {t('homeEverythingInOnePlace')}
            </MainTitle>

            <ViewAllButton
              endIcon={<ArrowForward />}
              onClick={() => navigate('/courses')}
            >
              {t('coursesViewAllCategories')}
            </ViewAllButton>
          </LeftSection>

          <RightSection>
            {loading && categories.length === 0 ? (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 6,
                gap: 2
              }}>
                <CircularProgress sx={{ color: '#5C2D91' }} />
                <Typography variant="body1" color="text.secondary">
                  {t('coursesLoadingCategories')}
                </Typography>
              </Box>
            ) : (
              <>
                {/* Dynamic Category Cards from API - Horizontal Scroll */}
                <Box sx={{
                  position: 'relative',
                  mb: 0.5, // Minimal margin
                  maxWidth: '672px', // Exactly 3 cards: (200px + 16px gap) * 3 = 648px + 24px padding
                  width: '100%',
                  mx: 'auto',
                  // Enhanced responsive max width
                  '@media (max-width: 600px)': {
                    maxWidth: '100%',
                    px: 2,
                  },
                  '@media (min-width: 600px) and (max-width: 900px)': {
                    maxWidth: '588px', // (180px + 16px gap) * 3 = 552px + 36px padding
                  },
                  '@media (min-width: 900px) and (max-width: 1200px)': {
                    maxWidth: '588px', // (180px + 16px gap) * 3 = 552px + 36px padding
                  },
                  '@media (min-width: 1200px)': {
                    maxWidth: '672px', // (200px + 16px gap) * 3 = 648px + 24px padding
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: { xs: '30px', sm: '40px', md: '60px' },
                    height: '100%',
                    background: 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                    zIndex: 2,
                    pointerEvents: 'none'
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: { xs: '30px', sm: '40px', md: '60px' },
                    height: '100%',
                    background: 'linear-gradient(270deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                    zIndex: 2,
                    pointerEvents: 'none'
                  }
                }}>
                  <Box
                    ref={setScrollContainer}
                    sx={{
                      display: 'flex',
                      gap: { xs: theme.spacing(0.5), sm: theme.spacing(0.8), md: theme.spacing(1) },
                      overflowX: 'auto',
                      overflowY: 'hidden',
                      padding: { xs: theme.spacing(0.5, 0), sm: theme.spacing(0.8, 0), md: theme.spacing(1, 0) },
                      scrollBehavior: 'smooth',
                      '&::-webkit-scrollbar': {
                        height: { xs: '4px', sm: '5px', md: '6px' },
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'rgba(0,0,0,0.1)',
                        borderRadius: { xs: '2px', sm: '2.5px', md: '3px' },
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'linear-gradient(90deg, #5C2D91 0%, #8A7BAA 100%)',
                        borderRadius: { xs: '2px', sm: '2.5px', md: '3px' },
                        '&:hover': {
                          background: 'linear-gradient(90deg, #4a2475 0%, #7a6b9a 100%)',
                        }
                      },
                      // Hide scrollbar on mobile
                      '@media (max-width: 900px)': {
                        '&::-webkit-scrollbar': {
                          display: 'none',
                        },
                        '-ms-overflow-style': 'none',
                        'scrollbar-width': 'none',
                      }
                    }}
                  >
                    {categories.map((category, index) => (
                      <CategoryCard key={category.id}>
                        {/* Image Section at Top Center */}
                        <Box sx={{
                          width: '100%',
                          height: { xs: '120px', sm: '130px', md: '140px' },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          <Box sx={{
                            width: { xs: '80px', sm: '90px', md: '100px' },
                            height: { xs: '80px', sm: '90px', md: '100px' },
                            borderRadius: { xs: '14px', sm: '16px', md: '18px' },
                            background: 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                            border: { xs: '3px solid #ffffff', sm: '3.5px solid #ffffff', md: '4px solid #ffffff' }
                          }}>
                            {getImageUrl(category.image) ? (
                              <img
                                src={getImageUrl(category.image)}
                                alt={category.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: '12px'
                                }}
                                onError={(e) => {
                                  // Fallback to icon if image fails to load
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <Box sx={{
                              display: getImageUrl(category.image) ? 'none' : 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100%',
                              height: '100%',
                              color: '#ffffff'
                            }}>
                              {getCategoryIcon(category.name)}
                            </Box>
                          </Box>
                        </Box>

                        {/* Content Section */}
                        <CardHeader>
                          <CardTitle>{category.name}</CardTitle>
                          <CourseCount>{category.active_courses_count || 0} {t('coursesCourse')}</CourseCount>
                        </CardHeader>

                        <CategoryCardContent>
                          <ReadMoreButton
                            onClick={() => navigate(`/courses?category=${category.id}`)}
                            endIcon={<ArrowForward />}
                          >
                            {t('commonReadMore')}
                          </ReadMoreButton>
                        </CategoryCardContent>
                      </CategoryCard>
                    ))}

                    {/* Show message if no categories */}
                    {categories.length === 0 && !loading && (
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        py: 4,
                        px: 3,
                        textAlign: 'center'
                      }}>
                        <Box sx={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          bgcolor: 'rgba(92, 45, 145, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2
                        }}>
                          <School sx={{ fontSize: '2rem', color: '#5C2D91' }} />
                        </Box>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                          {t('coursesNoCategoriesAvailable')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('coursesNewCategoriesComingSoon')}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Navigation Buttons */}
                  {categories.length > 3 && (
                    <>
                      <IconButton
                        onClick={scrollLeft}
                        sx={{
                          position: 'absolute',
                          left: { xs: '-15px', sm: '-18px', md: '-20px' },
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: '#ffffff',
                          color: '#5C2D91',
                          width: { xs: '35px', sm: '38px', md: '40px' },
                          height: { xs: '35px', sm: '38px', md: '40px' },
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          zIndex: 3,
                          '&:hover': {
                            backgroundColor: '#f8f9fa',
                            transform: 'translateY(-50%) scale(1.1)',
                          },
                          '@media (max-width: 900px)': {
                            display: 'none', // Hide on mobile and tablet
                          }
                        }}
                      >
                        <KeyboardArrowLeft sx={{ fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.5rem' } }} />
                      </IconButton>

                      <IconButton
                        onClick={scrollRight}
                        sx={{
                          position: 'absolute',
                          right: { xs: '-15px', sm: '-18px', md: '-20px' },
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: '#ffffff',
                          color: '#5C2D91',
                          width: { xs: '35px', sm: '38px', md: '40px' },
                          height: { xs: '35px', sm: '38px', md: '40px' },
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          zIndex: 3,
                          '&:hover': {
                            backgroundColor: '#f8f9fa',
                            transform: 'translateY(-50%) scale(1.1)',
                          },
                          '@media (max-width: 900px)': {
                            display: 'none', // Hide on mobile and tablet
                          }
                        }}
                      >
                        <KeyboardArrowRight sx={{ fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.5rem' } }} />
                      </IconButton>
                    </>
                  )}
                </Box>

              </>
            )}
          </RightSection>
        </ContentWrapper>

        <ConnectingLine />

        {/* Keep the existing tabs and course display for functionality */}
        <Box sx={{ position: 'relative', zIndex: 1, mt: 1 }}> {/* Minimal margin */}
          <Fade in={true} timeout={500}>
            <Box>
              {loading && categories.length === 0 ? (
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 6,
                  gap: 2
                }}>
                  <CircularProgress sx={{ color: '#5C2D91' }} />
                  <Typography variant="body1" color="text.secondary">
                    {t('coursesLoadingCategories')}
                  </Typography>
                </Box>
              ) : (
                <>
                </>
              )}
            </Box>
          </Fade>
        </Box>
      </Container>
    </SectionContainer>
  );
};

export default LearningMethodsSection;
