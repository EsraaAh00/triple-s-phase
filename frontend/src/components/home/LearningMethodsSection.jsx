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
import { courseAPI, bannerAPI, cardImageAPI } from '../../services/api.service';

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

const ContentWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isRTL',
})(({ theme, isRTL }) => ({
  display: 'grid',
  gridTemplateColumns: isRTL ? '1fr 1fr' : '1fr 1fr',
  gap: theme.spacing(2),
  alignItems: 'center',
  position: 'relative',
  zIndex: 2,
  minHeight: '200px',
  direction: isRTL ? 'rtl' : 'ltr',
  // Enhanced responsive layout with minimal spacing
  '@media (max-width: 600px)': {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(0.8),
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
    gridTemplateColumns: isRTL ? '1fr 1fr' : '1fr 1fr',
    gap: theme.spacing(2.5),
    minHeight: '200px',
    alignItems: 'center',
  },
  // Diagonal connecting line
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '15%',
    left: isRTL ? 'auto' : '48%',
    right: isRTL ? '48%' : 'auto',
    width: '2px',
    height: '300px',
    background: 'linear-gradient(135deg, #5C2D91 0%, #663399 50%, #5C2D91 100%)',
    transform: isRTL 
      ? 'translateY(-50%) rotate(-25deg)' 
      : 'translateY(-50%) rotate(25deg)',
    zIndex: 1,
    display: 'none',
    '@media (min-width: 1200px)': {
      display: 'block',
    },
  },
}));

const LeftSection = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isRTL',
})(({ theme, isRTL }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  // Enhanced responsive layout with minimal spacing
  '@media (max-width: 600px)': {
    textAlign: 'center',
    order: 1,
    gap: theme.spacing(0.3),
    padding: theme.spacing(0, 0.5),
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    textAlign: 'center',
    order: 1,
    gap: theme.spacing(0.4),
    padding: theme.spacing(0, 1),
  },
  '@media (min-width: 900px) and (max-width: 1200px)': {
    textAlign: 'center',
    order: 1,
    gap: theme.spacing(0.5),
    padding: theme.spacing(0, 1.5),
  },
  '@media (min-width: 1200px)': {
    textAlign: isRTL ? 'right' : 'left',
    order: isRTL ? 1 : 1,
    gap: theme.spacing(0.5),
    padding: 0,
  },
}));

// Title label styled like AboutAcademySection.SectionLabel
const CategoryIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isRTL',
})(({ theme, isRTL }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: theme.spacing(1),
  padding: theme.spacing(1.5, 3),
  backgroundColor: 'rgba(111, 66, 193, 0.1)',
  borderRadius: '8px',
  marginBottom: theme.spacing(2),
  marginLeft: 0,
  marginRight: 0,
  width: '100%',
  position: 'relative',
  direction: isRTL ? 'rtl' : 'ltr',
  '&:before': {
    content: '""',
    position: 'absolute',
    left: isRTL ? 'auto' : 0,
    right: isRTL ? 0 : 'auto',
    top: 0,
    bottom: 0,
    width: '4px',
    backgroundColor: '#6f42c1',
    borderRadius: isRTL ? '0 8px 8px 0' : '8px 0 0 8px',
  },
  '& .MuiSvgIcon-root': {
    color: '#6f42c1',
    fontSize: '1.3rem',
  },
  '& span': {
    color: '#6f42c1',
    fontSize: '1rem',
    fontWeight: 700,
  },
}));

const MainTitle = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'isRTL',
})(({ theme, isRTL }) => ({
  fontWeight: 800,
  color: '#5C2D91',
  lineHeight: 1.1,
  marginBottom: theme.spacing(0.75),
  padding: '10px 0',
  overflow: 'hidden',
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
    textAlign: isRTL ? 'right' : 'left',
  },
  textOverflow: 'ellipsis',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.4rem',
    whiteSpace: 'normal',
    textOverflow: 'unset',
  },
}));

const Subtitle = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'isRTL',
})(({ theme, isRTL }) => ({
  fontSize: '1.1rem',
  color: '#6c757d',
  lineHeight: 1.4,
  marginBottom: theme.spacing(0.5),
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
    textAlign: isRTL ? 'right' : 'left',
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
  color: '#34498B',
  fontWeight: 600,
  backgroundColor: 'rgba(52, 73, 139, 0.1)',
  padding: theme.spacing(0.5, 1.5),
  borderRadius: '12px',
  display: 'inline-block',
  // Responsive font size
  fontSize: '0.85rem',
  '@media (max-width: 600px)': {
    fontSize: '0.75rem',
    padding: theme.spacing(0.4, 1.2),
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    fontSize: '0.8rem',
    padding: theme.spacing(0.45, 1.3),
  },
  '@media (min-width: 900px) and (max-width: 1200px)': {
    fontSize: '0.82rem',
    padding: theme.spacing(0.47, 1.4),
  },
  '@media (min-width: 1200px)': {
    fontSize: '0.85rem',
    padding: theme.spacing(0.5, 1.5),
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
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [categories, setCategories] = useState([]);
  const [bannerData, setBannerData] = useState(null);
  const [cardImages, setCardImages] = useState(null);
  const [cardImagesLoading, setCardImagesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollContainer, setScrollContainer] = useState(null);
  const navigate = useNavigate();

  // Helper function to get localized text
  const getLocalizedText = (enText, arText) => {
    const currentLang = i18n.language || 'en';
    if (currentLang === 'ar' && arText) {
      return arText;
    }
    return enText;
  };

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
      const response = await courseAPI.getCategories();

      // Ensure we have an array and filter active categories
      const categoriesData = Array.isArray(response) ? response : [];
      const activeCategories = categoriesData.filter(category => category.is_active !== false);

      setCategories(activeCategories);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      setError(t('coursesLoadingError'));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Load banner for this section
  const loadBanner = async () => {
    try {
      const bannersData = await bannerAPI.getBannersByType('main');

      let filteredBanners = [];
      if (Array.isArray(bannersData)) {
        filteredBanners = bannersData;
      } else if (bannersData?.results) {
        filteredBanners = bannersData.results;
      } else if (bannersData?.data) {
        filteredBanners = bannersData.data;
      }

      if (filteredBanners.length > 0) {
        const firstBanner = filteredBanners[0];
        setBannerData({
          id: firstBanner.id,
          title: firstBanner.title,
          title_ar: firstBanner.title_ar,
          description: firstBanner.description,
          description_ar: firstBanner.description_ar,
        });
      }
    } catch (error) {
      console.error('❌ Error loading banner:', error);
      setBannerData(null);
    }
  };

  // Load card images for learning methods
  const loadCardImages = async () => {
    try {
      setCardImagesLoading(true);
      const cardImagesData = await cardImageAPI.getActiveCardImages();

      if (Array.isArray(cardImagesData) && cardImagesData.length > 0) {
        // Get the first active card image set
        const firstCardImage = cardImagesData[0];

        setCardImages({
          image_1_url: firstCardImage.image_1_url,
          image_2_url: firstCardImage.image_2_url,
          image_3_url: firstCardImage.image_3_url,
        });
      } else {
        setCardImages(null);
      }
    } catch (error) {
      console.error('❌ Error loading card images:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      setCardImages(null);
    } finally {
      setCardImagesLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadBanner();
    loadCardImages();
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
        <ContentWrapper isRTL={i18n.language === 'ar'}>
          <LeftSection isRTL={i18n.language === 'ar'}>
            <MainTitle variant="h2" component="h2" isRTL={i18n.language === 'ar'}>
              {getLocalizedText(bannerData?.title, bannerData?.title_ar) || t('homeEverythingInOnePlace')}
            </MainTitle>

            {/* Decorative line below title */}
            <Box sx={{
              width: '90%',
              height: '2px',
              background: i18n.language === 'ar' 
                ? 'linear-gradient(270deg, transparent 0%, #5C2D91 20%, #663399 50%, #5C2D91 80%, transparent 100%)'
                : 'linear-gradient(90deg, transparent 0%, #5C2D91 20%, #663399 50%, #5C2D91 80%, transparent 100%)',
              margin: '20px auto 0',
              borderRadius: '1px',
              position: 'relative',
              '&:before': {
                content: '""',
                position: 'absolute',
                top: '-1px',
                left: '-1px',
                right: '-1px',
                bottom: '-1px',
                background: i18n.language === 'ar'
                  ? 'linear-gradient(270deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)'
                  : 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                borderRadius: '1px',
                zIndex: -1,
              },
              // Shape at the beginning/end of the line based on language direction
              '&:after': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: i18n.language === 'ar' ? 'auto' : '-8px',
                right: i18n.language === 'ar' ? '-8px' : 'auto',
                width: '16px',
                height: '16px',
                background: 'linear-gradient(135deg, #5C2D91 0%, #663399 50%, #5C2D91 100%)',
                transform: 'translateY(-50%) rotate(45deg)',
                borderRadius: '2px',
                zIndex: 1,
                boxShadow: '0 2px 8px rgba(92, 45, 145, 0.3)',
              }
            }} />
          </LeftSection>

          <RightSection>
            {/* Decorative line above images */}
            <Box sx={{
              width: '95%',
              height: '2px',
              background: i18n.language === 'ar' 
                ? 'linear-gradient(270deg, transparent 0%, #5C2D91 20%, #663399 50%, #5C2D91 80%, transparent 100%)'
                : 'linear-gradient(90deg, transparent 0%, #5C2D91 20%, #663399 50%, #5C2D91 80%, transparent 100%)',
              margin: '0 auto 30px',
              borderRadius: '1px',
              position: 'relative',
              '&:before': {
                content: '""',
                position: 'absolute',
                top: '-1px',
                left: '-1px',
                right: '-1px',
                bottom: '-1px',
                background: i18n.language === 'ar'
                  ? 'linear-gradient(270deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)'
                  : 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                borderRadius: '1px',
                zIndex: -1,
              },
              // Shape at the end/beginning of the line based on language direction
              '&:after': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: i18n.language === 'ar' ? '-8px' : 'auto',
                right: i18n.language === 'ar' ? 'auto' : '-8px',
                width: '16px',
                height: '16px',
                background: 'linear-gradient(135deg, #5C2D91 0%, #663399 50%, #5C2D91 100%)',
                transform: 'translateY(-50%) rotate(45deg)',
                borderRadius: '2px',
                zIndex: 1,
                boxShadow: '0 2px 8px rgba(92, 45, 145, 0.3)',
              }
            }} />

            {/* Three Learning Methods with Circular Icons and Text Below */}
            <Box sx={{
              display: 'flex',
              gap: { xs: 0, sm: 0.3, md: 0.5 },
              justifyContent: 'center',
              alignItems: 'flex-start',
              flexWrap: 'nowrap',
              width: '100%',
              overflowX: 'auto',
              padding: { xs: '0', sm: '10px 0', md: '20px 0' },
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}>
              {/* Lectures Method */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: { xs: '160px', sm: '180px', md: '200px' },
                '&:hover': {
                  transform: 'translateY(-5px)',
                },
              }}>
                <Box sx={{
                  width: { xs: '110px', sm: '130px', md: '150px' },
                  height: { xs: '110px', sm: '130px', md: '150px' },
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: theme.spacing(1.5),
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {cardImagesLoading ? (
                    <CircularProgress sx={{ color: '#5C2D91', zIndex: 1 }} size={50} />
                  ) : cardImages?.image_1_url ? (
                    <img
                      src={cardImages.image_1_url}
                      alt="Lectures"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%',
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <MenuBook sx={{
                      fontSize: { xs: '2.2rem', sm: '2.6rem', md: '3rem' },
                      color: '#5C2D91',
                      position: 'relative',
                      zIndex: 1,
                    }} />
                  )}
                </Box>
                <Typography sx={{
                  color: '#5C2D91',
                  fontWeight: 700,
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                }}>
                  {t('commonLectures')}
                </Typography>
              </Box>

              {/* Question Bank Method */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: { xs: '160px', sm: '180px', md: '200px' },
                '&:hover': {
                  transform: 'translateY(-5px)',
                },
              }}>
                <Box sx={{
                  width: { xs: '110px', sm: '130px', md: '150px' },
                  height: { xs: '110px', sm: '130px', md: '150px' },
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: theme.spacing(1.5),
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {cardImagesLoading ? (
                    <CircularProgress sx={{ color: '#5C2D91', zIndex: 1 }} size={50} />
                  ) : cardImages?.image_2_url ? (
                    <img
                      src={cardImages.image_2_url}
                      alt="Question Bank"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%',
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <School sx={{
                      fontSize: { xs: '2.2rem', sm: '2.6rem', md: '3rem' },
                      color: '#5C2D91',
                      position: 'relative',
                      zIndex: 1,
                    }} />
                  )}
                </Box>
                <Typography sx={{
                  color: '#5C2D91',
                  fontWeight: 700,
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                }}>
                  {t('navQuestionBank')}
                </Typography>
              </Box>

              {/* Flashcards Method */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: { xs: '160px', sm: '180px', md: '200px' },
                '&:hover': {
                  transform: 'translateY(-5px)',
                },
              }}>
                <Box sx={{
                  width: { xs: '110px', sm: '130px', md: '150px' },
                  height: { xs: '110px', sm: '130px', md: '150px' },
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: theme.spacing(1.5),
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {cardImagesLoading ? (
                    <CircularProgress sx={{ color: '#5C2D91', zIndex: 1 }} size={50} />
                  ) : cardImages?.image_3_url ? (
                    <img
                      src={cardImages.image_3_url}
                      alt="Flashcards"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%',
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Description sx={{
                      fontSize: { xs: '2.2rem', sm: '2.6rem', md: '3rem' },
                      color: '#5C2D91',
                      position: 'relative',
                      zIndex: 1,
                    }} />
                  )}
                </Box>
                <Typography sx={{
                  color: '#5C2D91',
                  fontWeight: 700,
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                }}>
                  {t('navFlashcards')}
                </Typography>
              </Box>
            </Box>
          </RightSection>
        </ContentWrapper>

      </Container>
    </SectionContainer>
  );
};

export default LearningMethodsSection;
