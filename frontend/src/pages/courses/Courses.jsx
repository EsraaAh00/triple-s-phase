import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Grid,
  TextField,
  Typography,
  Tabs,
  Tab,
  Avatar,
  InputAdornment,
  Skeleton,
  IconButton,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Search,
  FilterList,
  Add,
  Star,
  StarBorder,
  AccessTime,
  People,
  Category,
  School,
  TrendingUp,
  NewReleases,
  Whatshot,
  CheckCircle,
  ShoppingCart,
  AddShoppingCart,
  Check,
  Error as ErrorIcon
} from '@mui/icons-material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { keyframes } from '@emotion/react';
import { courseAPI, cartAPI } from '../../services/courseService';
import { API_CONFIG } from '../../config/api.config';
import { bannerAPI } from '../../services/api.service';
import BackGroundImage from '../../assets/images/BackGround.png';
import BGTriangleImage from '../../assets/images/BGtriangle.png';

// Helper: truncate text to a fixed number of characters and append ellipsis
const truncateText = (text, maxChars = 30) => {
  if (!text) return '';
  const clean = String(text).trim();
  return clean.length > maxChars ? `${clean.slice(0, maxChars)}…` : clean;
};

// Animation variants
const cardVariants = {
  offscreen: {
    y: 50,
    opacity: 0
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      bounce: 0.4,
      duration: 0.8
    }
  }
};

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '16px',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
  border: 'none',
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(10px)',
  '&:hover': {
    transform: 'translateY(-10px) scale(1.02)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
    '& .course-image': {
      transform: 'scale(1.08)',
    },
    '& .cart-button': {
      transform: 'scale(1.1) rotate(8deg)',
      '&::after': {
        transform: 'scale(1.2)',
        opacity: 0,
      }
    },
    '& .course-title': {
      color: theme.palette.primary.main,
    },
    '& .course-instructor': {
      transform: 'translateX(5px)',
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #e94560, #533483)',
    opacity: 0.8,
    transition: 'all 0.3s ease',
  },
}));

const CourseMedia = styled('div')(({ theme }) => ({
  position: 'relative',
  paddingTop: '56.25%', // 16:9 aspect ratio
  overflow: 'hidden',
  borderRadius: '12px 12px 0 0',
  margin: '4px',
  '& .course-image': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    willChange: 'transform',
  },
  '& .course-badge': {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    borderRadius: '20px',
    fontWeight: 600,
    padding: '6px 12px',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    background: 'rgba(255, 255, 255, 0.9)',
    color: theme.palette.primary.main,
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
    },
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
    zIndex: 1,
  },
}));

const CartButton = styled(IconButton)(({ theme, added }) => ({
  position: 'absolute',
  top: '16px',
  right: '16px',
  zIndex: 3,
  backgroundColor: added ? theme.palette.success.main : 'rgba(255, 255, 255, 0.95)',
  color: added ? '#fff' : theme.palette.primary.main,
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: added ? theme.palette.success.dark : theme.palette.primary.main,
    color: '#fff',
    transform: 'scale(1.1) rotate(8deg)',
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.2)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '50%',
    border: `2px solid ${added ? theme.palette.success.main : theme.palette.primary.main}`,
    animation: added ? `${pulse} 1.5s infinite` : 'none',
    opacity: 0.7,
  },
  '& .cart-icon': {
    transition: 'transform 0.3s ease',
  },
  '&:hover .cart-icon': {
    transform: 'scale(1.2) rotate(-8deg)',
  },
}));

const CartBadge = styled('span')(({ theme }) => ({
  position: 'absolute',
  top: '-6px',
  right: '-6px',
  backgroundColor: theme.palette.error.main,
  color: '#fff',
  borderRadius: '50%',
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.65rem',
  fontWeight: 'bold',
  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
  animation: `${pulse} 2s infinite`,
}));

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

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

// Floating shape styles are now defined in the keyframes section above

const SearchContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
  '& .search-input': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '50px',
    padding: '12px 24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      border: 'none',
      boxShadow: '0 0 0 2px rgba(229, 151, 139, 0.5)',
    },
  },
  '& .search-button': {
    position: 'absolute',
    left: 8,
    top: '50%',
    transform: 'translateY(-50%)',
    color: theme.palette.primary.main,
  },
}));

const CategoryChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'selected',
})(({ theme, selected }) => ({
  margin: theme.spacing(0.5),
  padding: theme.spacing(1, 2),
  borderRadius: '20px',
  fontWeight: 600,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '2px solid',
  borderColor: selected ? theme.palette.primary.main : 'transparent',
  backgroundColor: selected
    ? theme.palette.primary.main
    : alpha(theme.palette.background.paper, 0.8),
  color: selected
    ? '#fff'
    : theme.palette.text.primary,
  boxShadow: selected
    ? '0 4px 20px rgba(0, 0, 0, 0.15)'
    : '0 2px 8px rgba(0, 0, 0, 0.08)',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: selected
      ? theme.palette.primary.dark
      : alpha(theme.palette.primary.main, 0.1),
    color: selected
      ? '#fff'
      : theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
  },
  '& .MuiChip-label': {
    fontSize: '0.875rem',
    padding: '4px 8px',
  },
  '& .MuiChip-icon': {
    fontSize: '1rem',
  },
}));

const CourseTitle = styled(Typography)(({ theme }) => ({
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minHeight: '1.6em',
  fontWeight: 700,
  lineHeight: 1.3,
  marginBottom: '8px',
  color: theme.palette.text.primary,
  transition: 'color 0.3s ease'
}));

const InstructorInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: 'auto',
  paddingTop: '12px',
  borderTop: '1px solid rgba(0,0,0,0.05)'
}));

const CourseMeta = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  '& > *': {
    display: 'flex',
    alignItems: 'center',
    marginLeft: theme.spacing(1.5),
    '& svg': {
      fontSize: '1rem',
      marginLeft: theme.spacing(0.5)
    }
  }
}));

const AnimatedBackgroundComponent = () => (
  <AnimatedBackground>
    <FloatingShape />
    <FloatingShape style={{ width: '200px', height: '200px', bottom: '20%', right: '15%', animationDelay: '5s' }} />
    <FloatingShape style={{ width: '250px', height: '250px', top: '30%', left: '15%', animationDelay: '7s' }} />
  </AnimatedBackground>
);

const Courses = () => {
  const theme = useTheme();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState('all');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [cartItems, setCartItems] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
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

  // Update activeCategory when URL changes
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && categoryFromUrl !== activeCategory) {
      setActiveCategory(categoryFromUrl);
    } else if (!categoryFromUrl && activeCategory !== 'all') {
      setActiveCategory('all');
    }
  }, [searchParams, activeCategory]);

  // Fetch courses and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch courses and categories in parallel
        const [coursesResponse, categoriesResponse] = await Promise.all([
          courseAPI.getCourses({ status: 'published' }),
          courseAPI.getCategories()
        ]);

        const coursesData = coursesResponse.results || coursesResponse;
        const categoriesData = categoriesResponse.results || categoriesResponse;

        // Debug logging
        console.log('Courses data:', coursesData);
        console.log('Categories data:', categoriesData);
        if (coursesData.length > 0) {
          console.log('Sample course category structure:', coursesData[0].category);
        }

        setCourses(coursesData);
        setCategories(categoriesData);

        // Load cart items only if user is authenticated
        if (isAuthenticated) {
          try {
            const cartResponse = await cartAPI.getCart();
            const cartItemsMap = {};
            if (cartResponse.items) {
              cartResponse.items.forEach(item => {
                cartItemsMap[item.course.id] = true;
              });
            }
            setCartItems(cartItemsMap);
          } catch (cartError) {
            console.log('Cart not available:', cartError);
          }
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        // Don't show error for non-authenticated users trying to access courses
        if (err.response?.status === 401 && !isAuthenticated) {
          console.log('User not authenticated, showing public courses only');
          setError(null);
        } else {
          setError(t('coursesLoadingError'));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const filteredCourses = courses.filter(course => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      course.title?.toLowerCase().includes(searchLower) ||
      (course.instructors && course.instructors.some(instructor =>
        instructor.name?.toLowerCase().includes(searchLower)
      ));

    // Category filter - handle different data structures
    let matchesCategory = activeCategory === 'all';
    if (!matchesCategory && course.category) {
      // Check if category is an object with id or just an id
      const categoryId = typeof course.category === 'object' ? course.category.id : course.category;
      matchesCategory = categoryId == activeCategory; // Use == to handle string/number comparison

      // Debug logging for first few courses
      if (courses.indexOf(course) < 3) {
        console.log(`Course "${course.title}":`, {
          courseCategory: course.category,
          categoryId: categoryId,
          activeCategory: activeCategory,
          matchesCategory: matchesCategory
        });
      }
    }

    // Level filter
    const matchesLevel = tabValue === 'all' || course.level === tabValue;

    const result = matchesSearch && matchesCategory && matchesLevel;

    // Debug logging for filtering
    if (courses.indexOf(course) < 3) {
      console.log(`Course "${course.title}" filter result:`, {
        matchesSearch,
        matchesCategory,
        matchesLevel,
        finalResult: result
      });
    }

    return result;
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCategoryChange = (categoryId) => {
    console.log('Category changed to:', categoryId);
    setActiveCategory(categoryId);

    // Update URL parameters
    const newSearchParams = new URLSearchParams(searchParams);
    if (categoryId === 'all') {
      newSearchParams.delete('category');
    } else {
      newSearchParams.set('category', categoryId);
    }
    setSearchParams(newSearchParams);
  };

  const toggleCartItem = async (courseId, e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (cartItems[courseId]) {
        // Remove from cart - we need to find the cart item ID first
        const cartResponse = await cartAPI.getCart();
        const cartItem = cartResponse.items?.find(item => item.course.id === courseId);
        if (cartItem) {
          await cartAPI.removeFromCart(cartItem.id);
        }
        setCartItems(prev => {
          const newState = { ...prev };
          delete newState[courseId];
          return newState;
        });
        setSnackbar({ open: true, message: t('coursesRemovedFromCart'), severity: 'info' });
      } else {
        // Add to cart
        await cartAPI.addToCart(courseId);
        setCartItems(prev => ({ ...prev, [courseId]: true }));
        setSnackbar({ open: true, message: t('coursesAddedToCart'), severity: 'success' });
      }
    } catch (error) {
      console.error('Error toggling cart item:', error);
      setSnackbar({
        open: true,
        message: t('coursesCartUpdateError'),
        severity: 'error'
      });
    }
  };

  const getLevelLabel = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'مبتدئ';
      case 'intermediate':
        return 'متوسط';
      case 'advanced':
        return 'متقدم';
      default:
        return level || 'غير محدد';
    }
  };

  const getInstructorName = (instructors) => {
    if (!instructors || instructors.length === 0) return 'غير محدد';
    return instructors[0].name || 'غير محدد';
  };

  const getInstructorAvatar = (instructors) => {
    if (!instructors || instructors.length === 0) return null;
    return instructors[0].profile_pic;
  };

  const getCategoryName = (course) => {
    if (!course.category) return null;
    const categoryId = typeof course.category === 'object' ? course.category.id : course.category;
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : null;
  };

  const getCourseImage = (course) => {
    if (course.image) {
      return course.image.startsWith('http') ? course.image : `${API_CONFIG.baseURL}${course.image}`;
    }
    // Fallback to a default image
    return 'https://source.unsplash.com/random/800x450?course,education';
  };

  // Helper function to format duration as HH:MM:SS
  const formatDuration = (duration) => {
    if (!duration) return 'غير محدد';
    
    // If duration is already in HH:MM:SS format, return as is
    if (typeof duration === 'string' && duration.includes(':')) {
      return duration;
    }
    
    // If duration is in seconds (number or string), convert to HH:MM:SS
    const seconds = parseInt(duration);
    if (isNaN(seconds)) return 'غير محدد';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Helper function to format price without .00
  const formatPrice = (price) => {
    if (!price) return '0';
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return price;
    
    // Remove .00 if it's a whole number
    return numPrice % 1 === 0 ? numPrice.toString() : numPrice.toFixed(2).replace(/\.00$/, '');
  };

  if (loading) {
    return (
      <Box>
        <Header />
        <Box sx={{ py: 8, px: { xs: 2, md: 4 } }}>
          <Container maxWidth="xl">
            <Grid container spacing={4}>
              {[1, 2, 3, 4].map((item) => (
                <Grid key={item} sx={{
                  width: { xs: '100%', sm: 'calc(50% - 32px)', md: 'calc(33.333% - 32px)', lg: 'calc(25% - 32px)' },
                  flex: { xs: '0 0 100%', sm: '0 0 calc(50% - 32px)', md: '0 0 calc(33.333% - 32px)', lg: '0 0 calc(25% - 32px)' },
                  px: 2,
                  mb: 4
                }}>
                  <Card>
                    <Skeleton variant="rectangular" height={160} animation="wave" />
                    <CardContent>
                      <Skeleton width="80%" height={24} animation="wave" />
                      <Skeleton width="60%" height={20} animation="wave" sx={{ mt: 1 }} />
                      <Box sx={{ display: 'flex', mt: 2 }}>
                        <Skeleton variant="circular" width={24} height={24} />
                        <Skeleton width="40%" height={20} animation="wave" sx={{ mr: 1 }} />
                      </Box>
                      <Skeleton width="100%" height={40} animation="wave" sx={{ mt: 2 }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
        <Footer />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Header />
        <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
          <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" color="error" gutterBottom>
            حدث خطأ
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            إعادة المحاولة
          </Button>
        </Container>
        <Footer />
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
          // Responsive adjustments
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
          // Responsive container adjustments
          px: { xs: 2, sm: 3, md: 4 }
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Box sx={{
              textAlign: 'center',
              py: { xs: 2, sm: 3, md: 4 },
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
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 800,
                  mb: { xs: 1, sm: 2 },
                  color: '#ffffff',
                  fontSize: { xs: '1.3rem', sm: '1.8rem', md: '2.2rem', lg: '2.5rem' },
                  lineHeight: { xs: 1.3, sm: 1.2 },
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  // Better text wrapping on mobile
                  wordBreak: 'break-word',
                  hyphens: 'auto'
                }}
              >
                {t('coursesPageTitle')}
              </Typography>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    maxWidth: { xs: '100%', sm: '500px', md: '600px' },
                    mx: 'auto',
                    mb: { xs: 1.5, sm: 2 },
                    px: { xs: 2, sm: 0 },
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                    lineHeight: { xs: 1.5, sm: 1.6 },
                    fontWeight: 300,
                    textShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                >
                  {t('coursesPageSubtitle')}
                </Typography>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                style={{ width: '100%', maxWidth: '700px', margin: '0 auto' }}
              >
                <Box sx={{
                  position: 'relative',
                  maxWidth: { xs: '100%', sm: '350px', md: '400px' },
                  mx: 'auto',
                  px: { xs: 2, sm: 0 },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-2px',
                    left: '-2px',
                    right: '-2px',
                    bottom: '-2px',
                    background: 'linear-gradient(45deg, #333679, #1a5f8a, #0a3d62)',
                    borderRadius: '25px',
                    zIndex: -1,
                    opacity: 0.3,
                    animation: `${pulse} 3s ease-in-out infinite`,
                  }
                }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder={t('coursesSearchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '25px',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          border: 'none',
                        },
                        '&:hover fieldset': {
                          border: 'none',
                        },
                        '&.Mui-focused fieldset': {
                          border: 'none',
                          boxShadow: '0 0 0 2px rgba(229, 151, 139, 0.5)',
                        },
                        paddingRight: { xs: '12px', sm: '15px' },
                      },
                      '& .MuiInputBase-input': {
                        padding: { xs: '8px 12px', sm: '10px 15px' },
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        '&::placeholder': {
                          opacity: 0.7,
                          color: theme.palette.text.secondary,
                        },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{
                            color: '#333679',
                            ml: { xs: 0.5, sm: 1 },
                            fontSize: { xs: '1rem', sm: '1.1rem' },
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                          }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </motion.div>
            </Box>
          </motion.div>
        </Container>
      </HeroSection>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ 
        flex: 1, 
        py: { xs: 3, sm: 4, md: 6 }, 
        px: { xs: 2, sm: 3, md: 4 },
        position: 'relative', 
        zIndex: 1 
      }}>
        <Box sx={{ mb: { xs: 4, sm: 5, md: 6 } }}>
          {/* Categories Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Box sx={{ mb: { xs: 3, sm: 4 } }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2,
                flexWrap: 'wrap',
                gap: 1
              }}>
                <Typography 
                  variant="h6" 
                  component="h3" 
                  fontWeight={600} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                  }}
                >
                  <Category sx={{ color: 'primary.main', fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
                  {t('coursesCategories')}
                </Typography>
                {(activeCategory !== 'all' || searchTerm || tabValue !== 'all') && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      setSearchTerm('');
                      setActiveCategory('all');
                      setTabValue('all');
                      setSearchParams({});
                    }}
                    startIcon={<FilterList sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }} />}
                    sx={{
                      borderRadius: '20px',
                      textTransform: 'none',
                      fontSize: { xs: '0.7rem', sm: '0.8rem' },
                      minWidth: 'auto',
                      px: { xs: 1.5, sm: 2 }
                    }}
                  >
                    {t('coursesClearFilters')}
                  </Button>
                )}
              </Box>
              <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: { xs: 1, sm: 1.5 },
                maxHeight: { xs: '120px', sm: '140px', md: 'auto' },
                overflowY: { xs: 'auto', md: 'visible' },
                pb: { xs: 1, sm: 0 },
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(0,0,0,0.1)',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '3px',
                  '&:hover': {
                    background: 'rgba(0,0,0,0.5)',
                  },
                },
              }}>
                <CategoryChip
                  label={t('coursesAllCategories')}
                  selected={activeCategory === 'all'}
                  onClick={() => handleCategoryChange('all')}
                  icon={<Category fontSize="small" />}
                  size="small"
                  sx={{
                    backgroundColor: activeCategory === 'all' ? 'primary.main' : 'background.paper',
                    color: activeCategory === 'all' ? 'white' : 'text.primary',
                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                    height: { xs: '28px', sm: '32px' },
                    '&:hover': {
                      backgroundColor: activeCategory === 'all' ? 'primary.dark' : 'primary.light',
                      color: 'white',
                    },
                  }}
                />
                {categories.map((category) => {
                  console.log('Rendering category:', category);
                  return (
                    <CategoryChip
                      key={category.id}
                      label={category.name}
                      selected={activeCategory === category.id.toString()}
                      onClick={() => handleCategoryChange(category.id.toString())}
                      size="small"
                      sx={{
                        backgroundColor: activeCategory === category.id.toString() ? 'primary.main' : 'background.paper',
                        color: activeCategory === category.id.toString() ? 'white' : 'text.primary',
                        fontSize: { xs: '0.7rem', sm: '0.8rem' },
                        height: { xs: '28px', sm: '32px' },
                        '&:hover': {
                          backgroundColor: activeCategory === category.id.toString() ? 'primary.dark' : 'primary.light',
                          color: 'white',
                        },
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          </motion.div>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            mb: { xs: 3, sm: 4 }, 
            flexWrap: 'wrap', 
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Typography 
                variant="h4" 
                component="h2" 
                fontWeight={700}
                sx={{
                  fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem' },
                  lineHeight: { xs: 1.3, sm: 1.2 },
                  mb: { xs: 1, sm: 0.5 },
                  wordBreak: 'break-word'
                }}
              >
                {activeCategory === 'all' ? t('coursesAllCourses') : `${t('coursesCoursesOf')} ${categories.find(c => c.id === parseInt(activeCategory))?.name || ''}`}
                {searchTerm && `: ${t('coursesSearchResults')} "${searchTerm}"`}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mt: 0.5, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  flexWrap: 'wrap',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                <span style={{ fontWeight: 600, color: 'primary.main' }}>{filteredCourses.length}</span>
{t('coursesAvailableCourses')} {courses.length} {t('coursesTotalCourses')}
                {(activeCategory !== 'all' || searchTerm || tabValue !== 'all') && (
                  <Chip
                    label={t('coursesFiltered')}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{
                      height: '18px',
                      fontSize: { xs: '0.6rem', sm: '0.7rem' },
                      ml: 1
                    }}
                  />
                )}
              </Typography>
            </Box>

            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                width: { xs: '100%', sm: 'auto' },
                '& .MuiTabs-flexContainer': {
                  gap: { xs: 0.5, sm: 1 },
                },
                '& .MuiTab-root': {
                  minHeight: { xs: 32, sm: 36 },
                  padding: { xs: '4px 12px', sm: '6px 16px' },
                  borderRadius: '20px',
                  fontWeight: 500,
                  minWidth: 'auto',
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  '&.Mui-selected': {
                    color: 'white',
                    backgroundColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                },
              }}
            >
              <Tab value="all" label={t('coursesAll')} />
              <Tab value="beginner" label={t('coursesBeginner')} icon={<School fontSize="small" />} iconPosition="start" />
              <Tab value="intermediate" label={t('coursesIntermediate')} icon={<TrendingUp fontSize="small" />} iconPosition="start" />
              <Tab value="advanced" label={t('coursesAdvanced')} icon={<Whatshot fontSize="small" />} iconPosition="start" />
            </Tabs>
          </Box>

          {filteredCourses.length > 0 ? (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)'
              },
              gap: { xs: 2, sm: 2.5, md: 3 },
              width: '100%',
              // Responsive grid adjustments
              px: { xs: 1, sm: 0 }
            }}>
              {filteredCourses.map((course, index) => (
                <Box key={course.id} sx={{ width: '100%' }}>
                  <motion.div
                    initial="offscreen"
                    whileInView="onscreen"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={cardVariants}
                    style={{ height: '100%' }}
                  >
                    <StyledCard 
                      elevation={0} 
                      component={Link} 
                      to={`/courses/${course.id}`} 
                      style={{ textDecoration: 'none', color: 'inherit' }}
                      sx={{
                        // Responsive card adjustments
                        height: '100%',
                        minHeight: { xs: '400px', sm: '450px', md: '500px' }
                      }}
                    >
                      <CourseMedia>
                        <img
                          src={getCourseImage(course)}
                          alt={course.title}
                          className="course-image"
                        />
                        {course.is_featured && (
                          <Chip
                            label={t('coursesFeatured')}
                            color="primary"
                            size="small"
                            className="course-badge"
                            sx={{
                              bgcolor: 'primary.main',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: { xs: '0.6rem', sm: '0.7rem' },
                              height: { xs: '20px', sm: '24px' }
                            }}
                          />
                        )}
                        {course.is_certified && (
                          <Chip
                            label={t('coursesCertificate')}
                            color="secondary"
                            size="small"
                            className="course-badge"
                            sx={{
                              bgcolor: 'secondary.main',
                              color: 'white',
                              fontWeight: 600,
                              top: course.is_featured ? 50 : 16,
                              fontSize: { xs: '0.6rem', sm: '0.7rem' },
                              height: { xs: '20px', sm: '24px' }
                            }}
                          />
                        )}
                        <CartButton
                          className="cart-button"
                          onClick={(e) => toggleCartItem(course.id, e)}
                          added={cartItems[course.id]}
                          sx={{
                            width: { xs: '36px', sm: '44px' },
                            height: { xs: '36px', sm: '44px' },
                            '& svg': {
                              fontSize: { xs: '1rem', sm: '1.2rem' }
                            }
                          }}
                        >
                          {cartItems[course.id] ? (
                            <Check className="cart-icon" />
                          ) : (
                            <AddShoppingCart className="cart-icon" />
                          )}
                          {!cartItems[course.id] && <CartBadge>+</CartBadge>}
                        </CartButton>
                      </CourseMedia>

                      <CardContent sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                        p: { xs: 2, sm: 2.5, md: 3 },
                      }}>
                        <Box sx={{ mb: { xs: 1, sm: 1.5 } }}>
                          {getCategoryName(course) && (
                            <Chip
                              label={getCategoryName(course)}
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(229, 151, 139, 0.1)',
                                color: 'primary.main',
                                border: '1px solid rgba(229, 151, 139, 0.3)',
                                fontWeight: 500,
                                fontSize: { xs: '0.6rem', sm: '0.7rem' },
                                height: { xs: '20px', sm: '24px' },
                                mb: 1,
                                '& .MuiChip-label': {
                                  px: { xs: 1, sm: 1.5 },
                                },
                                '&:hover': {
                                  backgroundColor: 'rgba(229, 151, 139, 0.2)',
                                  borderColor: 'primary.main',
                                },
                              }}
                            />
                          )}
                          <CourseTitle 
                            variant="h6" 
                            component="h3" 
                            gutterBottom
                            sx={{
                              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                              lineHeight: { xs: 1.3, sm: 1.2 },
                              mb: { xs: 1, sm: 1.5 }
                            }}
                          >
                            {course.title}
                          </CourseTitle>
                        </Box>

                        <InstructorInfo sx={{
                          mt: 'auto',
                          pt: { xs: 1, sm: 1.5 }
                        }}>
                          <Avatar
                            src={getInstructorAvatar(course.instructors)}
                            alt={getInstructorName(course.instructors)}
                            sx={{ 
                              width: { xs: 28, sm: 32 }, 
                              height: { xs: 28, sm: 32 }, 
                              ml: { xs: 1, sm: 1.5 } 
                            }}
                          />
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ 
                                fontSize: { xs: '0.65rem', sm: '0.75rem' } 
                              }}
                            >
                              {t('coursesInstructor')}
                            </Typography>
                            <Typography 
                              variant="subtitle2" 
                              fontWeight={500}
                              sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                              }}
                            >
                              {getInstructorName(course.instructors)}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'left' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Star 
                                color="warning" 
                                fontSize="small" 
                                sx={{ 
                                  ml: 0.5,
                                  fontSize: { xs: '1rem', sm: '1.1rem' }
                                }} 
                              />
                              <Typography 
                                variant="body2" 
                                fontWeight={600}
                                sx={{
                                  fontSize: { xs: '0.7rem', sm: '0.8rem' }
                                }}
                              >
                                {course.average_rating?.toFixed(1) || '0.0'}
                              </Typography>
                            </Box>
                          </Box>
                        </InstructorInfo>

                        <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />

                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 1
                        }}>
                          <CourseMeta>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AccessTime 
                                fontSize="small" 
                                sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}
                              />
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  mr: 0.5,
                                  fontSize: { xs: '0.65rem', sm: '0.75rem' }
                                }}
                              >
                                {course.duration ? formatDuration(course.duration) : 'غير محدد'}
                              </Typography>
                            </Box>
                          </CourseMeta>

                          <Box sx={{ textAlign: 'left' }}>
                            {course.discount_price ? (
                              <>
                                <Typography 
                                  variant="body2" 
                                  color="error" 
                                  sx={{ 
                                    textDecoration: 'line-through', 
                                    opacity: 0.7, 
                                    fontSize: { xs: '0.7rem', sm: '0.8rem' } 
                                  }}
                                >
                                  ${formatPrice(course.price)}
                                </Typography>
                                <Typography 
                                  variant="h6" 
                                  color="primary" 
                                  sx={{ 
                                    lineHeight: 1, 
                                    mt: -0.5,
                                    fontSize: { xs: '1rem', sm: '1.25rem' }
                                  }}
                                >
                                  ${formatPrice(course.discount_price)}
                                </Typography>
                              </>
                            ) : (
                              <Typography 
                                variant="h6" 
                                color="primary"
                                sx={{
                                  fontSize: { xs: '1rem', sm: '1.25rem' }
                                }}
                              >
                                {course.is_free ? t('coursesFree') : `$${formatPrice(course.price)}`}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </StyledCard>
                  </motion.div>
                </Box>
              ))}
            </Box>
          ) : (
            <Box
              textAlign="center"
              py={8}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ maxWidth: 400, margin: '0 auto' }}>
                <School sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {t('coursesNoMatchingCourses')}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {t('coursesNoMatchingCoursesDescription')}
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('all');
                    setTabValue('all');
                    setSearchParams({});
                  }}
                  startIcon={<FilterList />}
                  sx={{ mt: 2 }}
                >
                  {t('coursesClearAllFilters')}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Container>

      <Footer />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Courses;
