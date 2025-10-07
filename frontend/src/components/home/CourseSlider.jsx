import { useState, useEffect, useRef } from 'react';
import { Box, Button, Card, CardContent, CardMedia, Container, IconButton, Rating, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import { KeyboardArrowLeft, KeyboardArrowRight, PlayCircleOutline } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { courseAPI } from '../../services/courseService';
import coursesliderBG from '../../assets/images/coursesliderBG.png';

const SliderContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(4, 0),
  overflow: 'hidden',
  direction: 'rtl',
  backgroundImage: `url(${coursesliderBG})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  minHeight: '70vh',
  // Responsive padding and height
  '@media (max-width: 600px)': {
    padding: theme.spacing(2, 0),
    minHeight: '60vh',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    padding: theme.spacing(3, 0),
    minHeight: '65vh',
  },
  '@media (min-width: 900px)': {
    padding: theme.spacing(4, 0),
    minHeight: '70vh',
  },
}));

const SliderHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(0, 2),
  // Responsive layout
  '@media (max-width: 600px)': {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(0, 1),
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(0, 1.5),
  },
  '@media (min-width: 900px)': {
    marginBottom: theme.spacing(4),
    padding: theme.spacing(0, 2),
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  position: 'relative',
  fontSize: '1.5rem',
  // Responsive font size
  '@media (max-width: 600px)': {
    fontSize: '1.25rem',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    fontSize: '1.375rem',
  },
  '@media (min-width: 900px)': {
    fontSize: '1.5rem',
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    right: 0,
    bottom: -8,
    width: '50px',
    height: '4px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '2px',
    // Responsive width
    '@media (max-width: 600px)': {
      width: '40px',
      height: '3px',
      bottom: -6,
    },
  },
}));

const SliderButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[2],
  // Responsive sizing
  '@media (max-width: 600px)': {
    width: '36px',
    height: '36px',
    '& .MuiSvgIcon-root': {
      fontSize: '1.2rem',
    },
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    width: '40px',
    height: '40px',
    '& .MuiSvgIcon-root': {
      fontSize: '1.3rem',
    },
  },
  '@media (min-width: 900px)': {
    width: '44px',
    height: '44px',
    '& .MuiSvgIcon-root': {
      fontSize: '1.5rem',
    },
  },
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  '&.Mui-disabled': {
    opacity: 0.5,
  },
}));

const SliderTrack = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2.5),
  // Responsive gap
  '@media (max-width: 600px)': {
    gap: theme.spacing(1.5),
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    gap: theme.spacing(2),
  },
  '@media (min-width: 900px)': {
    gap: theme.spacing(2.5),
  },
}));

const CourseCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  overflow: 'hidden',
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  // Responsive hover effects
  '@media (max-width: 600px)': {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
    },
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    '&:hover': {
      transform: 'translateY(-6px)',
      boxShadow: '0 7px 22px rgba(0, 0, 0, 0.13)',
    },
  },
  '@media (min-width: 900px)': {
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    },
  },
}));

const DiscountBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  left: 12,
  backgroundColor: '#FF0000',
  color: '#ffffff',
  padding: '4px 8px',
  borderRadius: '12px',
  fontSize: '0.7rem',
  fontWeight: 600,
  zIndex: 2,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  // Responsive sizing
  '@media (max-width: 600px)': {
    top: 8,
    left: 8,
    padding: '3px 6px',
    fontSize: '0.65rem',
    borderRadius: '8px',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    top: 10,
    left: 10,
    padding: '3px 7px',
    fontSize: '0.68rem',
  },
  '@media (min-width: 900px)': {
    top: 12,
    left: 12,
    padding: '4px 8px',
    fontSize: '0.7rem',
  },
}));

const CourseMedia = styled(CardMedia)({
  position: 'relative',
  paddingTop: '56.25%', // 16:9 aspect ratio
  backgroundColor: '#F0F0F0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  '&:hover .play-button': {
    opacity: 1,
    transform: 'scale(1.1)',
  },
  '& .no-image-content': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#A0A0A0',
    fontSize: '0.9rem',
    fontWeight: 500,
    '& .landscape-icon': {
      fontSize: '2.5rem',
      marginBottom: '8px',
    },
    '& .no-image-text': {
      fontSize: '0.8rem',
      color: '#A0A0A0',
    },
  },
});

const PlayButton = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  opacity: 0,
  transition: 'all 0.3s ease',
  // Responsive sizing
  '@media (max-width: 600px)': {
    width: 45,
    height: 45,
    '& .MuiSvgIcon-root': {
      fontSize: '1.5rem',
    },
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    width: 52,
    height: 52,
    '& .MuiSvgIcon-root': {
      fontSize: '1.7rem',
    },
  },
  '@media (min-width: 900px)': {
    width: 60,
    height: 60,
    '& .MuiSvgIcon-root': {
      fontSize: '2rem',
    },
  },
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary.contrastText,
    },
  },
}));

const CourseCardContent = styled(CardContent)(({ theme }) => ({
  padding: '16px',
  // Responsive padding
  '@media (max-width: 600px)': {
    padding: '12px',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    padding: '14px',
  },
  '@media (min-width: 900px)': {
    padding: '16px',
  },
  '& .MuiRating-root': {
    direction: 'ltr',
    // Responsive rating size
    '@media (max-width: 600px)': {
      fontSize: '1rem',
    },
    '@media (min-width: 600px) and (max-width: 900px)': {
      fontSize: '1.1rem',
    },
    '@media (min-width: 900px)': {
      fontSize: '1.2rem',
    },
  },
}));

const CourseCategory = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '0.75rem',
  fontWeight: 600,
  marginBottom: theme.spacing(0.5),
  // Responsive font size
  '@media (max-width: 600px)': {
    fontSize: '0.7rem',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    fontSize: '0.72rem',
  },
  '@media (min-width: 900px)': {
    fontSize: '0.75rem',
  },
}));

const CourseTitle = styled(Typography)({
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minHeight: '3.6em',
  lineHeight: '1.2',
  fontWeight: 700,
  color: '#333333',
  fontSize: '1rem',
  marginBottom: '8px',
  // Responsive font size and height
  '@media (max-width: 600px)': {
    fontSize: '0.9rem',
    minHeight: '3.2em',
    marginBottom: '6px',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    fontSize: '0.95rem',
    minHeight: '3.4em',
    marginBottom: '7px',
  },
  '@media (min-width: 900px)': {
    fontSize: '1rem',
    minHeight: '3.6em',
    marginBottom: '8px',
  },
});

const InstructorText = styled(Typography)(({ theme }) => ({
  color: '#666666',
  fontSize: '0.8rem',
  marginBottom: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  // Responsive font size and margin
  '@media (max-width: 600px)': {
    fontSize: '0.75rem',
    marginBottom: '10px',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    fontSize: '0.78rem',
    marginBottom: '11px',
  },
  '@media (min-width: 900px)': {
    fontSize: '0.8rem',
    marginBottom: '12px',
  },
}));

const PriceContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '8px',
});

const CurrentPrice = styled(Typography)(({ theme }) => ({
  color: '#FF0000',
  fontWeight: 700,
  fontSize: '1.1rem',
  // Responsive font size
  '@media (max-width: 600px)': {
    fontSize: '1rem',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    fontSize: '1.05rem',
  },
  '@media (min-width: 900px)': {
    fontSize: '1.1rem',
  },
}));

const OriginalPrice = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.disabled,
  textDecoration: 'line-through',
  fontSize: '0.875rem',
  // Responsive font size
  '@media (max-width: 600px)': {
    fontSize: '0.8rem',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    fontSize: '0.825rem',
  },
  '@media (min-width: 900px)': {
    fontSize: '0.875rem',
  },
}));

const StudentsCount = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
}));

const SliderDots = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const Dot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active',
})(({ active, theme }) => ({
  width: 10,
  height: 10,
  borderRadius: '50%',
  backgroundColor: theme.palette.action.disabled,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
  },
  ...(active && {
    backgroundColor: theme.palette.primary.main,
  }),
}));

const CourseCollections = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(4);
  const sliderRef = useRef(null);

  // Calculate slides to show based on screen size
  useEffect(() => {
    const updateSlidesToShow = () => {
      if (isMobile) {
        setSlidesToShow(1); // Mobile: 1 card
      } else if (isTablet) {
        setSlidesToShow(2); // Tablet: 2 cards
      } else {
        setSlidesToShow(3); // Desktop: 3 cards
      }
    };

    updateSlidesToShow();
    window.addEventListener('resize', updateSlidesToShow);
    return () => window.removeEventListener('resize', updateSlidesToShow);
  }, [isMobile, isTablet]);

  // Reset current slide when collections change
  useEffect(() => {
    setCurrentSlide(0);
  }, [collections]);

  // Reset current slide when slidesToShow changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [slidesToShow]);

  // Fetch collections from API
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const data = await courseAPI.getCourseCollections();
        setCollections(data);
      } catch (err) {
        console.error('Error fetching collections:', err);
        setError('حدث خطأ في تحميل المجموعات');
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  // Slider navigation functions
  const nextSlide = (collectionIndex = 0) => {
    if (collections.length > collectionIndex && collections[collectionIndex]?.courses?.length > 0) {
      const courses = collections[collectionIndex].courses;
      const maxSlide = Math.max(0, courses.length - slidesToShow);
      setCurrentSlide(prev => Math.min(prev + 1, maxSlide));
    }
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <SliderContainer>
        <Container maxWidth="lg">
          {[1, 2, 3].map((index) => (
            <Box key={index} sx={{ mb: 6 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                  <Box sx={{ width: 200, height: 32, bgcolor: 'grey.300', borderRadius: 1, mb: 1 }} />
                  <Box sx={{ width: 300, height: 20, bgcolor: 'grey.200', borderRadius: 1 }} />
                </Box>
                <Box sx={{ width: 100, height: 36, bgcolor: 'grey.300', borderRadius: 1 }} />
              </Box>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(auto-fill, minmax(280px, 1fr))',
                  sm: 'repeat(auto-fill, minmax(300px, 1fr))',
                  md: 'repeat(auto-fill, minmax(320px, 1fr))',
                  lg: 'repeat(auto-fill, minmax(350px, 1fr))'
                },
                gap: 3
              }}>
                {[1, 2, 3, 4].map((courseIndex) => (
                  <Box key={courseIndex} sx={{
                    bgcolor: 'grey.100',
                    borderRadius: 2,
                    height: 400,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Box sx={{ height: 200, bgcolor: 'grey.300', borderRadius: '8px 8px 0 0' }} />
                    <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ width: '60%', height: 16, bgcolor: 'grey.300', borderRadius: 1 }} />
                      <Box sx={{ width: '90%', height: 20, bgcolor: 'grey.300', borderRadius: 1 }} />
                      <Box sx={{ width: '70%', height: 16, bgcolor: 'grey.200', borderRadius: 1 }} />
                      <Box sx={{ width: '40%', height: 16, bgcolor: 'grey.200', borderRadius: 1 }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Container>
      </SliderContainer>
    );
  }

  if (error) {
    return (
      <SliderContainer>
        <Container maxWidth="lg">
          <Box sx={{
            textAlign: 'center',
            py: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <Typography variant="h5" color="error.main" sx={{ mb: 2 }}>
              حدث خطأ في تحميل المجموعات
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.location.reload()}
              sx={{ borderRadius: '8px', textTransform: 'none' }}
            >
              إعادة المحاولة
            </Button>
          </Box>
        </Container>
      </SliderContainer>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <SliderContainer>
        <Container maxWidth="lg">
          <Box sx={{
            textAlign: 'center',
            py: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              لا توجد مجموعات متاحة حالياً
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              سيتم إضافة مجموعات جديدة قريباً
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              component={RouterLink}
              to="/courses"
              sx={{ borderRadius: '8px', textTransform: 'none' }}
            >
              {t('coursesBrowseAllCourses')}
            </Button>
          </Box>
        </Container>
      </SliderContainer>
    );
  }

  return (
    <SliderContainer>
      <Container maxWidth="lg">
        {collections.map((collection, collectionIndex) => (
          <Box key={collection.id} sx={{ mb: 6 }}>
            <SliderHeader>
              <Box>
                <SectionTitle variant="h4" component="h2">
                  {collection.name}
                </SectionTitle>
                {collection.description && (
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                    {collection.description}
                  </Typography>
                )}
              </Box>
              <Button
                variant="outlined"
                color="primary"
                component={RouterLink}
                to={`/courses?collection=${collection.slug}`}
                endIcon={<KeyboardArrowLeft />}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3,
                  // Responsive sizing
                  fontSize: { xs: '0.8rem', md: '0.875rem' },
                  minHeight: { xs: '36px', md: '40px' },
                  '&:hover': {
                    backgroundColor: 'rgba(74, 108, 247, 0.05)',
                  },
                  '& .MuiButton-endIcon': {
                    marginRight: '4px',
                    marginLeft: '-4px',
                    fontSize: { xs: '1rem', md: '1.2rem' },
                  }
                }}
              >
                عرض الكل
              </Button>
            </SliderHeader>

            {collection.courses && collection.courses.length > 0 ? (
              <Box
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  width: '100%',
                  margin: '0 auto',
                }}
              >
                {/* Navigation Buttons */}
                {collection.courses.length > slidesToShow && (
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    pointerEvents: 'none',
                    zIndex: 2,
                    px: 1,
                  }}>
                  <SliderButton
                    onClick={() => prevSlide()}
                    disabled={currentSlide === 0}
                    sx={{
                      pointerEvents: 'auto',
                      opacity: currentSlide === 0 ? 0.3 : 1,
                      ml: { xs: -0.5, sm: -1, md: -2 }, // Responsive margin
                      display: { xs: 'flex', sm: 'flex', md: 'flex' }, // Always visible on mobile
                    }}
                  >
                    <KeyboardArrowRight />
                  </SliderButton>
                  <SliderButton
                    onClick={() => nextSlide(collectionIndex)}
                    disabled={collection.courses.length <= slidesToShow || currentSlide >= Math.max(0, collection.courses.length - slidesToShow)}
                    sx={{
                      pointerEvents: 'auto',
                      opacity: (collection.courses.length <= slidesToShow || currentSlide >= Math.max(0, collection.courses.length - slidesToShow)) ? 0.3 : 1,
                      mr: { xs: -0.5, sm: -1, md: -2 }, // Responsive margin
                      display: { xs: 'flex', sm: 'flex', md: 'flex' }, // Always visible on mobile
                    }}
                  >
                    <KeyboardArrowLeft />
                  </SliderButton>
                  </Box>
                )}

                <SliderTrack
                  ref={sliderRef}
                  sx={{
                    display: 'flex',
                    width: collection.courses.length > slidesToShow ? `${collection.courses.length * 100}%` : '100%',
                    transform: collection.courses.length > slidesToShow ? `translateX(-${currentSlide * (100 / collection.courses.length)}%)` : 'translateX(0%)',
                    transition: 'transform 0.5s ease-in-out',
                    justifyContent: collection.courses.length <= slidesToShow ? 'center' : 'flex-start',
                    // Enhanced responsive spacing based on slidesToShow
                    gap: {
                      xs: theme.spacing(1.5), // Mobile: smaller gap
                      sm: theme.spacing(2),   // Tablet: medium gap
                      md: theme.spacing(2.5), // Desktop: larger gap
                    },
                    padding: {
                      xs: theme.spacing(0, 0.5, 3, 0.5),   // Mobile: minimal padding
                      sm: theme.spacing(0, 1.5, 3.5, 1.5), // Tablet: medium padding
                      md: theme.spacing(0, 2, 4, 2),       // Desktop: larger padding
                    },
                  }}
                >
                  {collection.courses.map((course) => (
                    <CourseCard 
                      key={course.id} 
                      component={RouterLink} 
                      to={`/courses/${course.id}`} 
                      sx={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        flex: collection.courses.length > slidesToShow ? `0 0 ${100 / collection.courses.length}%` : `0 0 ${100 / slidesToShow}%`,
                        minWidth: 0,
                        maxWidth: collection.courses.length <= slidesToShow ? `${100 / slidesToShow}%` : 'none',
                        // Responsive card sizing
                        width: {
                          xs: collection.courses.length > slidesToShow ? `${100 / collection.courses.length}%` : '90%', // Mobile: smaller width
                          sm: collection.courses.length > slidesToShow ? `${100 / collection.courses.length}%` : '85%', // Tablet: medium width
                          md: collection.courses.length > slidesToShow ? `${100 / collection.courses.length}%` : '80%', // Desktop: larger width
                        },
                      }}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <CourseMedia
                          image={course.image_url || 'https://via.placeholder.com/300x180'}
                          title={course.title}
                        >
                          <PlayButton className="play-button">
                            <PlayCircleOutline fontSize="large" color="primary" />
                          </PlayButton>
                        </CourseMedia>
                        {course.discount_percentage && (
                          <DiscountBadge>
                            {course.discount_percentage}% خصم
                          </DiscountBadge>
                        )}
                      </Box>
                      <CourseCardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Rating
                            value={course.rating || course.average_rating || 0}
                            precision={0.1}
                            readOnly
                            size="small"
                            sx={{
                              '& .MuiRating-iconFilled': {
                                color: '#3F51B5',
                              },
                              '& .MuiRating-iconEmpty': {
                                color: '#E0E0E0',
                              },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ color: '#666666', fontSize: '0.8rem' }}>
                            ({course.reviews_count || course.ratings_count || 0})
                          </Typography>
                        </Box>
                        <CourseTitle variant="subtitle1" component="h3">
                          {course.title}
                        </CourseTitle>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, fontSize: '0.8rem', color: '#666666' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{
                              width: 12,
                              height: 12,
                              backgroundColor: '#666666',
                              borderRadius: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.6rem',
                              color: '#ffffff'
                            }}>
                              📄
                            </Box>
                            <span>درس: {course.lessons_count || course.lessons?.length || 0}</span>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{
                              width: 12,
                              height: 12,
                              backgroundColor: '#666666',
                              borderRadius: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.6rem',
                              color: '#ffffff'
                            }}>
                              👥
                            </Box>
                            <span>طلاب: {course.enrolled_count || course.students_count || 0}</span>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span>{course.level || 'مبتدئ'}</span>
                          </Box>
                        </Box>
                        <Box sx={{ borderTop: '1px solid #E0E0E0', pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              backgroundColor: '#E0E0E0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.7rem',
                              color: '#666666',
                              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'%23666666\'%3E%3Cpath d=\'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z\'/%3E%3C/svg%3E")',
                              backgroundSize: 'contain',
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'center'
                            }}>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#333333', fontWeight: 500 }}>
                              {course.instructors && course.instructors.length > 0
                                ? course.instructors[0].name
                                : 'Test'
                              }
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CurrentPrice>
                              {course.is_free ? 'مجاني' : `${parseFloat(course.discount_price || course.price)} $`}
                            </CurrentPrice>
                            {course.discount_price && course.price && course.discount_price < course.price && (
                              <OriginalPrice>
                                {parseFloat(course.price)} $
                              </OriginalPrice>
                            )}
                          </Box>
                        </Box>
                      </CourseCardContent>
                    </CourseCard>
                  ))}
                </SliderTrack>

                {/* Slider Dots */}
                {collection.courses.length > slidesToShow && (
                  <SliderDots>
                    {Array.from({ length: Math.ceil(collection.courses.length / slidesToShow) }).map((_, index) => (
                      <Dot
                        key={index}
                        active={Math.floor(currentSlide / slidesToShow) === index}
                        onClick={() => goToSlide(index * slidesToShow)}
                      />
                    ))}
                  </SliderDots>
                )}
              </Box>
            ) : (
              <Box sx={{
                textAlign: 'center',
                py: 6,
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'grey.300'
              }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  لا توجد دورات في هذه المجموعة حالياً
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  سيتم إضافة دورات جديدة قريباً
                </Typography>
              </Box>
            )}
          </Box>
        ))}
      </Container>
    </SliderContainer>
  );
};

export default CourseCollections;
