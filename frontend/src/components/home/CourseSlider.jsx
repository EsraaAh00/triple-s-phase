import { useState, useEffect, useRef } from 'react';
import { Box, Button, Card, CardContent, CardMedia, Container, IconButton, Rating, Stack, Typography, useMediaQuery, useTheme, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import { PlayCircleOutline, KeyboardArrowRight, KeyboardArrowLeft } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { courseAPI } from '../../services/courseService';
import coursesliderBG from '../../assets/images/coursesliderBG.png';

const SliderContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(2, 0, 0, 0), // تقليل المسافات
  overflow: 'visible',
  direction: 'rtl',
  backgroundImage: `url(${coursesliderBG})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  minHeight: 'auto', // إزالة الارتفاع الثابت
  // Responsive padding - تقليل المسافات
  '@media (max-width: 600px)': {
    padding: theme.spacing(1, 0, 0, 0), // تقليل المسافات على الموبايل
    minHeight: 'auto',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    padding: theme.spacing(1.5, 0, 0, 0), // تقليل المسافات على التابلت
    minHeight: 'auto',
  },
  '@media (min-width: 900px)': {
    padding: theme.spacing(2, 0, 0, 0), // تقليل المسافات على الديسكتوب
    minHeight: 'auto',
  },
}));

const SliderHeader = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isRTL',
})(({ theme, isRTL }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(0, 2),
  // Responsive layout
  '@media (max-width: 600px)': {
    flexDirection: 'column',
    alignItems: isRTL ? 'flex-start' : 'flex-end',
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

const SectionTitle = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'isRTL',
})(({ theme, isRTL }) => ({
  fontWeight: 700,
  position: 'relative',
  fontSize: '1.5rem',
  textAlign: isRTL ? 'right' : 'left',
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
    right: isRTL ? 0 : 'auto',
    left: isRTL ? 'auto' : 0,
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


const SliderTrack = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2.5),
  overflowX: 'auto',
  scrollBehavior: 'smooth',
  padding: theme.spacing(2, 1),
  alignItems: 'center',
  minHeight: '320px',
  '&::-webkit-scrollbar': {
    height: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0,0,0,0.1)',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'linear-gradient(90deg, #6f42c1 0%, #8b5cf6 100%)',
    borderRadius: '3px',
    '&:hover': {
      background: 'linear-gradient(90deg, #5a3594 0%, #7a6b9a 100%)',
    }
  },
  // Responsive gap
  '@media (max-width: 600px)': {
    gap: theme.spacing(1.5),
    minHeight: '280px',
    padding: theme.spacing(1.5, 0.5),
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    gap: theme.spacing(2),
    minHeight: '300px',
    padding: theme.spacing(2, 0.5),
  },
  '@media (min-width: 900px)': {
    gap: theme.spacing(2.5),
    minHeight: '320px',
    padding: theme.spacing(2, 1),
  },
  '@media (max-width: 900px)': {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  }
}));

const CourseCard = styled(Card)(({ theme }) => ({
  borderRadius: '50%',
  overflow: 'hidden',
  backgroundColor: '#ffffff',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'relative',
  width: '300px',
  height: '300px',
  flexShrink: 0,
  // Responsive sizing
  '@media (max-width: 600px)': {
    width: '240px',
    height: '240px',
    '&:hover': {
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: '0 12px 50px rgba(102, 51, 153, 0.25)',
    },
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    width: '270px',
    height: '270px',
    '&:hover': {
      transform: 'translateY(-10px) scale(1.03)',
      boxShadow: '0 14px 55px rgba(102, 51, 153, 0.28)',
    },
  },
  '@media (min-width: 900px)': {
    width: '300px',
    height: '300px',
    '&:hover': {
      transform: 'translateY(-12px) scale(1.05)',
      boxShadow: '0 16px 60px rgba(102, 51, 153, 0.3)',
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

const CourseMedia = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  backgroundColor: '#F0F0F0',
  overflow: 'hidden',
  zIndex: 0,
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'all 0.4s ease',
  },
  '&:hover img': {
    transform: 'scale(1.1)',
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

const CourseCardContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: '15px 12px',
  background: 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 60%, transparent 100%)',
  backdropFilter: 'blur(8px)',
  borderRadius: '0 0 50% 50%',
  transition: 'all 0.3s ease',
  textAlign: 'center',
  zIndex: 2,
  height: '40%', // تصغير الجزء المبهم
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  paddingBottom: '20px',
  // Responsive sizing
  '@media (max-width: 600px)': {
    padding: '12px 10px',
    paddingBottom: '18px',
    height: '35%', // أصغر على الموبايل
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    padding: '14px 11px',
    paddingBottom: '20px',
    height: '38%',
  },
  '& .MuiRating-root': {
    direction: 'ltr',
    justifyContent: 'center',
    // Responsive rating size
    '@media (max-width: 600px)': {
      fontSize: '0.85rem',
    },
    '@media (min-width: 600px) and (max-width: 900px)': {
      fontSize: '0.95rem',
    },
    '@media (min-width: 900px)': {
      fontSize: '1rem',
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
  minHeight: '2.4em',
  lineHeight: '1.3',
  fontWeight: 800, // زيادة الوزن للوضوح
  color: '#1a1a1a', // لون أغمق للوضوح
  fontSize: '0.9rem', // خط أكبر قليلاً
  marginBottom: '0px', // حذف المسافة أسفل العنوان
  textAlign: 'center',
  textShadow: '0 1px 2px rgba(255,255,255,0.8)', // ظل نص للوضوح
  // Responsive font size and height
  '@media (max-width: 600px)': {
    fontSize: '0.8rem', // خط أكبر على الموبايل
    minHeight: '2.2em',
    marginBottom: '0px', // حذف المسافة على الموبايل
    fontWeight: 700, // وزن أقل قليلاً على الموبايل
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    fontSize: '0.85rem', // خط أكبر على التابلت
    minHeight: '2.3em',
    marginBottom: '0px', // حذف المسافة على التابلت
    fontWeight: 750,
  },
  '@media (min-width: 900px)': {
    fontSize: '0.9rem', // خط أكبر على الديسكتوب
    minHeight: '2.4em',
    marginBottom: '0px', // حذف المسافة على الديسكتوب
    fontWeight: 800,
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
  color: '#663399',
  fontWeight: 700,
  fontSize: '0.85rem',
  textAlign: 'center',
  // Responsive font size
  '@media (max-width: 600px)': {
    fontSize: '0.75rem',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    fontSize: '0.8rem',
  },
  '@media (min-width: 900px)': {
    fontSize: '0.85rem',
  },
}));

const OriginalPrice = styled(Typography)(({ theme }) => ({
  color: '#999',
  textDecoration: 'line-through',
  fontSize: '0.7rem',
  textAlign: 'center',
  // Responsive font size
  '@media (max-width: 600px)': {
    fontSize: '0.65rem',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    fontSize: '0.68rem',
  },
  '@media (min-width: 900px)': {
    fontSize: '0.7rem',
  },
}));

const StudentsCount = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
}));


const CourseCollections = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sliderRef = useRef(null);

  // Helper function to get localized text
  const getLocalizedText = (enText, arText) => {
    const currentLang = i18n.language || 'en';
    if (currentLang === 'ar' && arText) {
      return arText;
    }
    return enText;
  };


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
          <Box key={collection.id} sx={{ mb: 0 }}>
            <SliderHeader isRTL={i18n.language === 'ar'}>
              {i18n.language === 'ar' ? (
                <>
                  <Box sx={{ order: 1 }}>
                    <SectionTitle variant="h4" component="h2" isRTL={true}>
                      {getLocalizedText(collection.name, collection.name_ar)}
                    </SectionTitle>
                    {(collection.description || collection.description_ar) && (
                      <Typography variant="body1" color="text.secondary" sx={{
                        mt: 1,
                        textAlign: 'right'
                      }}>
                        {getLocalizedText(collection.description, collection.description_ar)}
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
                      order: 2,
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
                    {t('coursesViewAll')}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    component={RouterLink}
                    to={`/courses?collection=${collection.slug}`}
                    endIcon={<KeyboardArrowRight />}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 500,
                      px: 3,
                      order: 1,
                      fontSize: { xs: '0.8rem', md: '0.875rem' },
                      minHeight: { xs: '36px', md: '40px' },
                      '&:hover': {
                        backgroundColor: 'rgba(74, 108, 247, 0.05)',
                      },
                      '& .MuiButton-endIcon': {
                        marginLeft: '4px',
                        marginRight: '-4px',
                        fontSize: { xs: '1rem', md: '1.2rem' },
                      }
                    }}
                  >
                    {t('coursesViewAll')}
                  </Button>
                  <Box sx={{ order: 2 }}>
                    <SectionTitle variant="h4" component="h2" isRTL={false}>
                      {getLocalizedText(collection.name, collection.name_ar)}
                    </SectionTitle>
                    {(collection.description || collection.description_ar) && (
                      <Typography variant="body1" color="text.secondary" sx={{
                        mt: 1,
                        textAlign: 'left'
                      }}>
                        {getLocalizedText(collection.description, collection.description_ar)}
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </SliderHeader>

            {collection.courses && collection.courses.length > 0 ? (
              <Box
                sx={{
                  position: 'relative',
                  overflow: 'visible',
                  width: '100%',
                  margin: '0 auto',
                  padding: theme.spacing(2, 0),
                }}
              >
                <SliderTrack ref={sliderRef}>
                  {collection.courses.map((course) => {
                    console.log('Full course data:', course);
                    return (
                      <CourseCard
                        key={course.id}
                        component={RouterLink}
                        to={`/courses/${course.id}`}
                        sx={{
                          textDecoration: 'none',
                          color: 'inherit',
                        }}
                      >
                        {/* Background Image */}
                        <CourseMedia>
                          <img
                            src={course.image_url || 'https://via.placeholder.com/300x300'}
                            alt={course.title}
                          />
                        </CourseMedia>

                        {/* Play Button */}
                        <PlayButton className="play-button" sx={{ zIndex: 3 }}>
                          <PlayCircleOutline fontSize="large" sx={{ color: '#663399' }} />
                        </PlayButton>

                        {/* Discount Badge */}
                        {course.discount_percentage && (
                          <DiscountBadge sx={{
                            top: '15px',
                            right: '15px',
                            left: 'auto',
                            zIndex: 3,
                          }}>
                            {course.discount_percentage}% خصم
                          </DiscountBadge>
                        )}

                        {/* Content Overlay */}
                        <CourseCardContent>
                          {/* العنوان */}
                          <CourseTitle variant="subtitle1" component="h3">
                            {course.title}
                          </CourseTitle>

                          {/* عدد الوحدات، الدروس والتقييم في نفس السطر */}
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            mb: 0.2, // تقليل المسافة من 0.8 إلى 0.2
                            flexWrap: 'wrap'
                          }}>
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.3,
                              fontSize: '0.7rem',
                              color: '#666'
                            }}>
                              <span>📑</span>
                              <span>{(() => {
                                const count = course.modules_count || course.modules?.length || course.units?.length || course.units_count || 0;
                                return count;
                              })()} وحدة</span>
                            </Box>

                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.3,
                              fontSize: '0.7rem',
                              color: '#666'
                            }}>
                              <span>📚</span>
                              <span>{(() => {
                                const count = course.lessons_count || course.lessons?.length || course.lectures || 0;
                                console.log(`Lessons count for ${course.title}:`, {
                                  lessons_count: course.lessons_count,
                                  lessons: course.lessons?.length,
                                  lectures: course.lectures,
                                  final: count
                                });
                                return count;
                              })()} درس</span>
                            </Box>

                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.3,
                              fontSize: '0.75rem',
                              color: '#663399',
                              fontWeight: 600
                            }}>
                              <span>⭐</span>
                              <span>{(course.rating || course.average_rating || 0).toFixed(1)}</span>
                            </Box>
                          </Box>

                          {/* المدربين والسعر في نفس السطر */}
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2,
                            flexWrap: 'wrap',
                            mt: 0.5 // إضافة مسافة صغيرة من الأعلى
                          }}>
                            {/* عرض المدربين ملتصقين ببعض */}
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}>
                              <Box sx={{ display: 'flex' }}>
                                {course.instructors && course.instructors.filter((ins) => ((ins?.name || ins?.username || ins?.first_name || '').toString().trim().toLowerCase() !== 'admin' && (ins?.name || ins?.username || ins?.first_name))).length > 0 ? (
                                  course.instructors
                                    .filter((ins) => {
                                      const n = (ins?.name || ins?.username || ins?.first_name || '').toString().trim().toLowerCase();
                                      return n !== 'admin' && n !== '';
                                    })
                                    .slice(0, 3)
                                    .map((instructor, index) => (
                                    <Box
                                      key={instructor.id || index}
                                      sx={{
                                        width: 18, // تصغير أكثر من 24 إلى 18
                                        height: 18, // تصغير أكثر من 24 إلى 18
                                        borderRadius: '50%',
                                        border: '1px solid white', // تصغير الحدود أكثر
                                        marginLeft: index > 0 ? '-4px' : '0', // تقليل التداخل أكثر
                                        backgroundColor: '#6A5ACD',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '0.5rem', // تصغير الخط أكثر
                                        fontWeight: 700,
                                        boxShadow: '0 1px 4px rgba(106, 90, 205, 0.3)', // تصغير الظل أكثر
                                        cursor: 'pointer',
                                        position: 'relative',
                                        zIndex: 3 - index,
                                        '&:hover': {
                                          zIndex: 10,
                                          transform: 'scale(1.1)',
                                          transition: 'all 0.3s ease',
                                          boxShadow: '0 2px 6px rgba(106, 90, 205, 0.4)'
                                        }
                                      }}
                                    >
                                      {instructor.first_name ? instructor.first_name.charAt(0).toUpperCase() : 
                                       instructor.username ? instructor.username.charAt(0).toUpperCase() : 
                                       instructor.name ? instructor.name.charAt(0).toUpperCase() : 'م'}
                                    </Box>
                                  ))
                                ) : (
                                  <>
                                    <Box sx={{
                                      width: 18, // تصغير أكثر من 24 إلى 18
                                      height: 18, // تصغير أكثر من 24 إلى 18
                                      borderRadius: '50%',
                                      border: '1px solid white', // تصغير الحدود أكثر
                                      marginLeft: '0',
                                      backgroundColor: '#6A5ACD',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: 'white',
                                      fontSize: '0.5rem', // تصغير الخط أكثر
                                      fontWeight: 700,
                                      boxShadow: '0 1px 4px rgba(106, 90, 205, 0.3)', // تصغير الظل أكثر
                                      position: 'relative',
                                      zIndex: 3
                                    }}>
                                      م
                                    </Box>
                                    <Box sx={{
                                      width: 18, // تصغير أكثر من 24 إلى 18
                                      height: 18, // تصغير أكثر من 24 إلى 18
                                      borderRadius: '50%',
                                      border: '1px solid white', // تصغير الحدود أكثر
                                      marginLeft: '-4px', // تقليل التداخل أكثر
                                      backgroundColor: '#6A5ACD',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: 'white',
                                      fontSize: '0.5rem', // تصغير الخط أكثر
                                      fontWeight: 700,
                                      boxShadow: '0 1px 4px rgba(106, 90, 205, 0.3)', // تصغير الظل أكثر
                                      position: 'relative',
                                      zIndex: 2
                                    }}>
                                      د
                                    </Box>
                                    <Box sx={{
                                      width: 18, // تصغير أكثر من 24 إلى 18
                                      height: 18, // تصغير أكثر من 24 إلى 18
                                      borderRadius: '50%',
                                      border: '1px solid white', // تصغير الحدود أكثر
                                      marginLeft: '-4px', // تقليل التداخل أكثر
                                      backgroundColor: '#6A5ACD',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: 'white',
                                      fontSize: '0.5rem', // تصغير الخط أكثر
                                      fontWeight: 700,
                                      boxShadow: '0 1px 4px rgba(106, 90, 205, 0.3)', // تصغير الظل أكثر
                                      position: 'relative',
                                      zIndex: 1
                                    }}>
                                      ر
                                    </Box>
                                  </>
                                )}
                              </Box>
                              <Box sx={{ color: '#ccc', fontSize: '0.8rem' }}>
                                →
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CurrentPrice>
                                {course.is_free ? 'مجاني' : `${parseFloat(course.discount_price || course.price)} دينار`}
                              </CurrentPrice>
                              {course.discount_price && course.price && course.discount_price < course.price && (
                                <OriginalPrice>
                                  {parseFloat(course.price)} دينار
                                </OriginalPrice>
                              )}
                            </Box>
                          </Box>
                        </CourseCardContent>
                      </CourseCard>
                    );
                  })}
                </SliderTrack>
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
