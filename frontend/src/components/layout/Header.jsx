import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Button,
  Container,
  useTheme,
  useMediaQuery,
  InputBase,
  Badge,
  Stack,
  alpha,
  keyframes,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import logo from '../../assets/images/logo.png';
import { courseAPI } from '../../services/api.service';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';

// Animation
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled components
const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'scrolled' && prop !== 'pageType',
})(({ theme, scrolled, pageType }) => ({
  background: pageType === 'course-detail'
    ? scrolled
      ? `linear-gradient(135deg, 
          rgba(102, 51, 153, 0.6) 0%, 
          rgba(51, 54, 121, 0.5) 50%, 
          rgba(27, 27, 72, 0.4) 100%)`
      : `linear-gradient(135deg, 
          rgba(102, 51, 153, 0.7) 0%, 
          rgba(51, 54, 121, 0.6) 50%, 
          rgba(27, 27, 72, 0.5) 100%)`
    : scrolled
      ? `linear-gradient(135deg, 
          rgba(102, 51, 153, 0.65) 0%, 
          rgba(51, 54, 121, 0.62) 50%, 
          rgba(27, 27, 72, 0.58) 100%)`
      : 'transparent', // Make header transparent when not scrolled
  backdropFilter: pageType === 'course-detail' ? 'blur(10px)' : 'none',
  WebkitBackdropFilter: pageType === 'course-detail' ? 'blur(10px)' : 'none',
  boxShadow: 'none',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  borderBottom: 'none',
  animation: `${fadeIn} 0.6s ease-out`,
  // Enhanced responsive sizing - Further reduced height
  padding: scrolled ? '2px 0' : '4px 0',
  minHeight: scrolled ? '40px' : '48px',
  '@media (min-width: 480px)': {
    padding: scrolled ? '3px 0' : '5px 0',
    minHeight: scrolled ? '44px' : '52px',
  },
  '@media (min-width: 768px)': {
    padding: scrolled ? '4px 0' : '6px 0',
    minHeight: scrolled ? '48px' : '56px',
  },
  '@media (min-width: 1024px)': {
    padding: scrolled ? '6px 0' : '8px 0',
    minHeight: scrolled ? '52px' : '60px',
  },
  '@media (min-width: 1200px)': {
    padding: scrolled ? '6px 0' : '8px 0',
    minHeight: scrolled ? '52px' : '60px',
  },
  '&.MuiAppBar-root': {
    zIndex: theme.zIndex.drawer + 1,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: scrolled
      ? 'linear-gradient(90deg, #663399, #333679, #1B1B48)'
      : 'linear-gradient(90deg, #4DBFB3, #D17A6F, #4DBFB3)',
    opacity: scrolled ? 0.8 : 1,
    transition: 'all 0.4s ease',
  },
}));

const GradientButton = styled(Button)(({ theme, scrolled }) => ({
  background: scrolled
    ? 'linear-gradient(135deg, #663399 0%, #333679 50%, #1B1B48 100%)'
    : 'linear-gradient(135deg, #2D1B69 0%, #1A103F 50%, #0F0A2A 100%)',
  color: 'white',
  borderRadius: '20px',
  fontWeight: '500',
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: scrolled
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(229, 151, 139, 0.2)',
  // Enhanced responsive sizing - Reduced size
  padding: '6px 16px',
  fontSize: '12px',
  minHeight: '32px',
  '@media (min-width: 480px)': {
  padding: '8px 20px',
  fontSize: '13px',
    minHeight: '36px',
  },
  '@media (min-width: 768px)': {
    padding: '10px 24px',
    fontSize: '14px',
    minHeight: '40px',
  },
  '@media (min-width: 1024px)': {
    padding: '10px 24px',
    fontSize: '14px',
    minHeight: '40px',
  },
  '@media (min-width: 1200px)': {
    padding: '10px 24px',
    fontSize: '14px',
    minHeight: '40px',
  },
  '&:hover': {
    transform: 'none',
    boxShadow: 'none',
    background: scrolled
      ? 'linear-gradient(135deg, #663399 0%, #333679 50%, #1B1B48 100%)'
      : 'linear-gradient(135deg, #2D1B69 0%, #1A103F 50%, #0F0A2A 100%)',
  },
  '&:active': {
    transform: 'none',
  },
}));

const Search = styled('div')(({ theme, scrolled }) => ({
  position: 'relative',
  borderRadius: '30px',
  backgroundColor: scrolled
    ? 'rgba(255, 255, 255, 0.12)'
    : 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(10px)',
  border: scrolled
    ? '1px solid rgba(255, 255, 255, 0.15)'
    : '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  // Enhanced responsive sizing
  margin: '0 4px',
  width: '100%',
  maxWidth: '200px',
  '@media (min-width: 480px)': {
    margin: '0 6px',
    maxWidth: '240px',
  },
  '@media (min-width: 768px)': {
    margin: '0 8px',
    maxWidth: '300px',
  },
  '@media (min-width: 1024px)': {
    margin: '0 12px',
    maxWidth: '350px',
  },
  '@media (min-width: 1200px)': {
    margin: '0 16px',
    maxWidth: '450px',
  },
  '&:hover': {
    backgroundColor: scrolled
      ? 'rgba(255, 255, 255, 0.18)'
      : 'rgba(255, 255, 255, 0.12)',
    borderColor: scrolled
      ? 'rgba(255, 255, 255, 0.25)'
      : 'rgba(229, 151, 139, 0.3)',
    boxShadow: scrolled
      ? '0 4px 15px rgba(102, 51, 153, 0.3)'
      : '0 4px 15px rgba(229, 151, 139, 0.2)',
  },
  '&:focus-within': {
    backgroundColor: scrolled
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(255, 255, 255, 0.15)',
    borderColor: scrolled ? '#663399' : '#4DBFB3',
    boxShadow: scrolled
      ? '0 0 0 3px rgba(102, 51, 153, 0.2)'
      : '0 0 0 3px rgba(229, 151, 139, 0.2)',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  left: 0,
  top: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#FFFFFF',
  pointerEvents: 'none',
  fontSize: '20px',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: '#FFFFFF',
  width: '100%',
  '& .MuiInputBase-input': {
    width: '100%',
    fontWeight: '500',
    // Enhanced responsive sizing
    padding: '8px 12px 8px 35px',
    fontSize: '12px',
    '@media (min-width: 480px)': {
      padding: '10px 14px 10px 40px',
      fontSize: '13px',
    },
    '@media (min-width: 768px)': {
      padding: '12px 16px 12px 45px',
      fontSize: '14px',
    },
    '@media (min-width: 1024px)': {
      padding: '14px 18px 14px 50px',
      fontSize: '15px',
    },
    '@media (min-width: 1200px)': {
      padding: '16px 20px 16px 55px',
      fontSize: '15px',
    },
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.7)',
      opacity: 1,
      fontWeight: '400',
    },
  },
}));

const NavButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isHome' && prop !== 'scrolled',
})(({ theme, isHome, scrolled }) => ({
  color: isHome ? '#FFD700' : '#FFFFFF',
  margin: theme.spacing(0, 0.25),
  fontWeight: '400',
  fontSize: '14px',
  textTransform: 'none',
  position: 'relative',
  padding: '6px 12px',
  borderRadius: '8px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '@media (min-width: 768px)': {
    fontSize: '15px',
  },
  '@media (min-width: 1024px)': {
    fontSize: '16px',
  },
  border: 'none',
  backgroundColor: 'transparent',
  backdropFilter: 'none',
  '&:hover': {
    backgroundColor: 'transparent',
    transform: 'none',
    borderColor: 'transparent',
    boxShadow: 'none',
  },
  '& .MuiButton-endIcon': {
    marginRight: 4,
    marginLeft: -4,
    '& svg': {
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  '&[aria-expanded="true"]': {
    '& .MuiButton-endIcon svg': {
      transform: 'rotate(180deg)',
    },
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  marginRight: '60px',
  '&:hover': {
    '& img': {
      transform: 'scale(1.08) rotate(2deg)',
    },
    '& .MuiTypography-root': {
      background: 'linear-gradient(135deg, #663399, #333679, #1B1B48)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
  },
  [theme.breakpoints.down('sm')]: {
    marginRight: '30px',
  },
}));

const LogoImage = styled('img')({
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  filter: 'none',
  // Enhanced responsive sizing - Larger logo with fixed header height
  height: '45px',
  width: 'auto',
  '@media (min-width: 480px)': {
    height: '48px',
  },
  '@media (min-width: 768px)': {
    height: '52px',
  },
  '@media (min-width: 1024px)': {
    height: '56px',
  },
  '@media (min-width: 1200px)': {
    height: '60px',
  },
});

const LogoText = styled(Typography)(({ theme, scrolled }) => ({
  fontWeight: 700,
  background: scrolled
    ? 'linear-gradient(135deg, #663399 0%, #333679 50%, #1B1B48 100%)'
    : 'linear-gradient(135deg, #4DBFB3 0%, #D17A6F 50%, #4DBFB3 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginRight: '15px',
  lineHeight: 1.2,
  transition: 'all 0.3s ease',
  // Enhanced responsive font sizing
  fontSize: '1rem',
  '@media (min-width: 480px)': {
    fontSize: '1.1rem',
  },
  '@media (min-width: 768px)': {
    fontSize: '1.2rem',
  },
  '@media (min-width: 1024px)': {
    fontSize: '1.3rem',
  },
  '@media (min-width: 1200px)': {
    fontSize: '1.5rem',
  },
}));

const UserMenu = styled(Menu)({
  '& .MuiPaper-root': {
    backgroundColor: 'rgba(27, 27, 72, 0.95)',
    color: '#FFFFFF',
    marginTop: '15px',
    minWidth: '220px',
    boxShadow: '0 12px 40px rgba(102, 51, 153, 0.4)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    '& .MuiDivider-root': {
      borderColor: 'rgba(255, 255, 255, 0.1)',
      margin: '8px 0',
    },
  },
});

const UserMenuItem = styled(MenuItem)({
  padding: '12px 20px',
  borderRadius: '8px',
  margin: '2px 8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(102, 51, 153, 0.2)',
    transform: 'translateX(5px)',
  },
  '& .MuiSvgIcon-root': {
    marginLeft: '12px',
    color: '#663399',
    fontSize: '20px',
  },
});

const NotificationBadge = styled(Badge)({
  '& .MuiBadge-badge': {
    backgroundColor: '#663399',
    color: '#FFFFFF',
    border: '2px solid rgba(27, 27, 72, 0.95)',
    fontSize: '10px',
    fontWeight: '600',
  },
});

const LanguageSwitch = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  background: 'rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  padding: '4px 8px',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  marginLeft: theme.spacing(1),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  backdropFilter: 'blur(8px)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(102, 51, 153, 0.2), transparent)',
    transition: 'left 0.5s ease',
  },
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(102, 51, 153, 0.4)',
    transform: 'scale(1.05)',
    boxShadow: '0 8px 25px rgba(102, 51, 153, 0.3)',
    '&::before': {
      left: '100%',
    },
  },
  '& .MuiSwitch-root': {
    width: '50px',
    height: '28px',
    padding: 0,
    '& .MuiSwitch-switchBase': {
      padding: 0,
      margin: '2px',
      transitionDuration: '300ms',
      '&.Mui-checked': {
        transform: 'translateX(22px)',
        color: '#fff',
        '& + .MuiSwitch-track': {
          backgroundColor: '#663399',
          opacity: 1,
          border: 0,
          boxShadow: '0 0 15px rgba(102, 51, 153, 0.5)',
        },
        '&.Mui-disabled + .MuiSwitch-track': {
          opacity: 0.5,
        },
      },
      '&.Mui-focusVisible .MuiSwitch-thumb': {
        color: '#663399',
        border: '3px solid #fff',
      },
      '&.Mui-disabled .MuiSwitch-thumb': {
        color: theme.palette.grey[100],
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.7,
      },
    },
    '& .MuiSwitch-thumb': {
      boxSizing: 'border-box',
      width: '24px',
      height: '24px',
      background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
      boxShadow: '0 3px 8px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(102, 51, 153, 0.1)',
      border: '1px solid rgba(102, 51, 153, 0.15)',
    },
    '& .MuiSwitch-track': {
      borderRadius: '24px',
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      opacity: 1,
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: theme.transitions.create(['background-color', 'box-shadow'], {
        duration: 300,
      }),
    },
  },
}));

const LanguageLabel = styled(Typography)(({ theme, active }) => ({
  fontSize: '12px',
  fontWeight: '600',
  color: active ? '#663399' : 'rgba(102, 51, 153, 0.6)',
  margin: '0 5px',
  transition: 'all 0.3s ease',
  minWidth: '20px',
  textAlign: 'center',
  letterSpacing: '0.3px',
  textShadow: active ? '0 1px 2px rgba(0, 0, 0, 0.2)' : 'none',
}));

// Mobile Navigation Item Component
const MobileNavItem = ({ item, location, loadingCategories, onClose }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleItemClick = () => {
    if (item.dropdown) {
      setDropdownOpen(!dropdownOpen);
    } else {
      navigate(item.path);
      onClose();
    }
  };

  const isActive = location.pathname === item.path || 
    (item.path !== '/' && location.pathname.startsWith(item.path));

  return (
    <Box sx={{ mb: 1 }}>
      <Button
        fullWidth
        startIcon={item.icon}
        endIcon={item.dropdown ? (dropdownOpen ? <KeyboardArrowDown sx={{ transform: 'rotate(180deg)' }} /> : <KeyboardArrowDown />) : null}
        onClick={handleItemClick}
        sx={{
          justifyContent: 'flex-start',
          color: isActive ? '#663399' : '#333',
          backgroundColor: isActive ? 'rgba(102, 51, 153, 0.1)' : 'transparent',
          mb: 1,
          borderRadius: '12px',
          padding: '12px 16px',
          textAlign: 'left',
          border: '1px solid rgba(102, 51, 153, 0.1)',
          '&:hover': {
            backgroundColor: 'rgba(102, 51, 153, 0.08)',
            borderColor: 'rgba(102, 51, 153, 0.2)',
          },
          '& .MuiButton-startIcon': {
            marginRight: '15px',
            marginLeft: '5px',
            color: isActive ? '#663399' : '#666',
          },
          '& .MuiButton-endIcon': {
            marginLeft: 'auto',
            color: '#666',
            marginRight: '2px',
            transition: 'transform 0.3s ease',
          }
        }}
      >
        {item.text}
      </Button>

      {/* Dropdown Items */}
      {item.dropdown && dropdownOpen && (
        <Box sx={{ 
          ml: 2, 
          mt: 1,
          borderLeft: '2px solid rgba(102, 51, 153, 0.1)',
          pl: 2
        }}>
          {loadingCategories ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress size={20} sx={{ color: '#663399' }} />
            </Box>
          ) : item.dropdown.length > 0 ? (
            item.dropdown.map((subItem, index) => (
              <Button
                key={`${subItem.path}-${index}`}
                component={RouterLink}
                to={subItem.path}
                fullWidth
                size="small"
                onClick={onClose}
                sx={{
                  justifyContent: 'flex-start',
                  color: location.pathname === subItem.path ? '#663399' : '#666',
                  backgroundColor: location.pathname === subItem.path ? 'rgba(102, 51, 153, 0.08)' : 'transparent',
                  mb: 0.5,
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 51, 153, 0.08)',
                    color: '#663399',
                  },
                }}
              >
                {subItem.text}
              </Button>
            ))
          ) : (
            <Typography variant="body2" color="#999" sx={{ px: 2, py: 1, fontStyle: 'italic' }}>
              لا توجد أقسام متاحة
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

const Header = ({ pageType }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryAnchorEl, setCategoryAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [coursesData, setCoursesData] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Translation hooks
  const { t } = useTranslation();
  const { currentLanguage, toggleLanguage, isRTL } = useLanguage();

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const categoriesData = await courseAPI.getCategories();
        console.log('Fetched categories:', categoriesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to default categories if API fails
        setCategories([
          { id: 1, name: 'الدورات', slug: 'courses', courses_count: 0 },
          { id: 2, name: 'التدريب الإلكتروني', slug: 'e-learning', courses_count: 0 },
          { id: 3, name: 'الدبلومات', slug: 'diplomas', courses_count: 0 },
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch courses for each category
  useEffect(() => {
    const fetchCoursesForCategories = async () => {
      if (!categories || categories.length === 0) return;
      
      try {
        const coursesPromises = categories.map(async (category) => {
          if (!category || !category.id) return { categoryId: null, courses: [] };
          
          try {
            // Try different parameter formats for category
            let courses;
            const categoryParam = category.slug || category.id;
            
            try {
              // Try with category parameter
              courses = await courseAPI.getPublicCourses({ 
                category: categoryParam,
                page_size: 5 
              });
            } catch (error) {
              console.log('Trying with category_id parameter:', error);
              try {
                // Try with category_id parameter
                courses = await courseAPI.getPublicCourses({ 
                  category_id: categoryParam,
                  page_size: 5 
                });
              } catch (error2) {
                console.log('Trying regular courses API:', error2);
                try {
                  courses = await courseAPI.getCourses({ 
                    category: categoryParam,
                    page_size: 5 
                  });
                } catch (error3) {
                  console.log('All API calls failed:', error3);
                  courses = [];
                }
              }
            }
            
            console.log(`Courses for category ${category.name}:`, courses);
            
            // Handle different response formats
            let coursesArray = [];
            if (Array.isArray(courses)) {
              coursesArray = courses;
            } else if (courses && Array.isArray(courses.results)) {
              coursesArray = courses.results;
            } else if (courses && Array.isArray(courses.data)) {
              coursesArray = courses.data;
            }
            
            console.log(`Processed courses array for ${category.name}:`, coursesArray);
            
            // If no courses found, try to get all courses and filter manually
            if (coursesArray.length === 0) {
              console.log('No courses found, trying to get all courses...');
              try {
                const allCourses = await courseAPI.getPublicCourses({ page_size: 50 });
                let allCoursesArray = [];
                if (Array.isArray(allCourses)) {
                  allCoursesArray = allCourses;
                } else if (allCourses && Array.isArray(allCourses.results)) {
                  allCoursesArray = allCourses.results;
                } else if (allCourses && Array.isArray(allCourses.data)) {
                  allCoursesArray = allCourses.data;
                }
                
                // Filter courses by category
                coursesArray = allCoursesArray.filter(course => 
                  course.category === categoryParam || 
                  course.category_id === category.id ||
                  course.category === category.id ||
                  (course.category && course.category.id === category.id) ||
                  (course.category && course.category.slug === category.slug)
                ).slice(0, 5);
                
                console.log(`Filtered courses for ${category.name}:`, coursesArray);
              } catch (error) {
                console.log('Failed to get all courses:', error);
              }
            }
            
            return {
              categoryId: category.id,
              courses: coursesArray.slice(0, 5)
            };
          } catch (error) {
            console.error(`Error fetching courses for category ${category.name}:`, error);
            return { categoryId: category.id, courses: [] };
          }
        });

        const coursesResults = await Promise.all(coursesPromises);
        const coursesMap = {};
        coursesResults.forEach(result => {
          if (result.categoryId) {
            coursesMap[result.categoryId] = result.courses || [];
          }
        });
        
        console.log('Final courses data:', coursesMap);
        setCoursesData(coursesMap);
      } catch (error) {
        console.error('Error fetching courses for categories:', error);
        setCoursesData({});
      }
    };

    fetchCoursesForCategories();
  }, [categories]);

  // Navigation items with dynamic categories - No dropdowns
  const navItems = [
    // {
    //   text: t('navHome'),
    //   path: '/',
    //   icon: <HomeIcon />
    // },
    {
      text: t('navDashboard'),
      path: '/dashboard',
      icon: <DashboardIcon />,
      auth: true
    },

    {
      text: t('navAbout'),
      path: '/about-us',
      icon: <SchoolIcon />
    },
        // Blog and About Us as separate links
        {
          text: t('navBlog'),
          path: '/articles',
          icon: <MenuBookIcon />
        },

        // All courses categories as separate links with dropdown
        ...categories.map(category => ({
          text: category.name,
          path: `/courses?category=${category.slug || category.id || 'all'}`,
          icon: <MenuBookIcon />,
          categoryId: category.id,
          hasDropdown: true
        })),
  ];

  const menuId = 'primary-search-account-menu';

  // Handle category dropdown
  const handleCategoryClick = (event, category) => {
    setCategoryAnchorEl(event.currentTarget);
    setSelectedCategory(category);
  };

  const handleCategoryClose = () => {
    setCategoryAnchorEl(null);
    setSelectedCategory(null);
  };

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 30;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleMenuClose();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.checked ? 'en' : 'ar';
    toggleLanguage();
    console.log('Language changed to:', newLanguage);
  };


  const renderUserMenu = () => (
    <Box display="flex" alignItems="center">
      <NotificationBadge badgeContent={3} color="error">
        <IconButton
          size="large"
          aria-label="show new notifications"
          color="inherit"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            marginLeft: 1,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          <NotificationsNoneIcon />
        </IconButton>
      </NotificationBadge>

      <IconButton
        onClick={handleProfileMenuOpen}
        size="small"
        sx={{
          ml: 2,
          p: 0,
          '&:hover': {
            '& .MuiAvatar-root': {
              transform: 'scale(1.1)',
              boxShadow: '0 0 0 2px #663399',
            },
          },
        }}
      >
        <Avatar
          alt={user?.name || 'User'}
          src={user?.avatar}
          sx={{
            width: 40,
            height: 40,
            transition: 'all 0.3s ease',
            border: '2px solid #663399',
          }}
        />
      </IconButton>

      <UserMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box px={2} py={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            {user?.name || t('commonUser')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email || ''}
          </Typography>
        </Box>
        <Divider />
        <UserMenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
          <AccountCircleIcon />
          {t('headerProfile')}
        </UserMenuItem>
        <UserMenuItem onClick={() => { navigate('/dashboard'); handleMenuClose(); }}>
          <DashboardIcon />
          {t('headerDashboard')}
        </UserMenuItem>
        <Divider />
        <UserMenuItem onClick={handleLogout}>
          <ExitToAppIcon />
          {t('headerLogout')}
        </UserMenuItem>
      </UserMenu>
    </Box>
  );

  const renderMobileMenu = () => (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '80%',
        maxWidth: '300px',
        height: '100vh',
        backgroundColor: '#1A1A2E',
        zIndex: 1300,
        transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out',
        boxShadow: '-5px 0 30px rgba(0, 0, 0, 0.3)',
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      {/* <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <LogoContainer component={RouterLink} to="/" onClick={() => setMobileMenuOpen(false)}>
          <LogoImage src={logo} alt="شعار المنصة" />
        </LogoContainer>
        <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: '#FFFFFF' }}>
          <Box component="span" sx={{ fontSize: '1.5rem' }}>×</Box>
        </IconButton>
      </Box>
      
      <Box mb={3}>
        <form onSubmit={handleSearch}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder={t('headerSearch')}
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Search>
        </form>
      </Box> */}

      {/* <Box>
        {navItems.map((item) => (
          (!item.auth || isAuthenticated) && (
            <Button
              key={item.path}
              component={RouterLink}
              to={item.path}
              fullWidth
              startIcon={item.icon}
              sx={{
                justifyContent: 'flex-start',
                color: location.pathname === item.path ? '#663399' : '#FFFFFF',
                mb: 1,
                borderRadius: '8px',
                padding: '10px 15px',
                '&:hover': {
                  backgroundColor: 'rgba(14, 81, 129, 0.1)',
                },
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.text}
            </Button>
          )
        ))}
      </Box> */}

      <Box mt={3}>
        {isAuthenticated ? (
          <Button
            fullWidth
            variant="contained"
            onClick={handleLogout}
            startIcon={<ExitToAppIcon />}
            sx={{
              background: 'linear-gradient(135deg, #663399 0%, #333679 50%, #1B1B48 100%)',
              '&:hover': {
                opacity: 0.9,
              },
            }}
          >
            تسجيل الخروج
          </Button>
        ) : (
          <>
            <Button
              fullWidth
              variant="outlined"
              component={RouterLink}
              to="/login"
              sx={{
                color: '#FFFFFF',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                mb: 1,
                '&:hover': {
                  borderColor: '#663399',
                  backgroundColor: 'rgba(102, 51, 153, 0.1)',
                },
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              تسجيل الدخول
            </Button>
            <Button
              fullWidth
              variant="contained"
              component={RouterLink}
              to="/register"
              sx={{
                background: scrolled
                  ? 'linear-gradient(135deg, #663399 0%, #333679 50%, #1B1B48 100%)'
                  : 'linear-gradient(135deg, #2D1B69 0%, #1A103F 50%, #0F0A2A 100%)',
                '&:hover': {
                  opacity: 0.9,
                },
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              إنشاء حساب
            </Button>
          </>
        )}
      </Box>
    </Box>
  );

  const renderBackdrop = () => (
    <Box
      onClick={() => setMobileMenuOpen(false)}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
    />
  );

  return (
    <>
      <StyledAppBar position="fixed" scrolled={scrolled} pageType={pageType}>
        <Container maxWidth="xl" sx={{ px: { xs: 0.5, sm: 1, md: 2, lg: 3 } }}>
          <Toolbar disableGutters sx={{ 
            minHeight: { xs: 48, sm: 52, md: 56, lg: 64 },
            px: { xs: 0.5, sm: 1, md: 1.5, lg: 2 }
          }}>
            {/* Desktop User Avatar and Language Switch - hidden on mobile */}
            <Box sx={{ 
              display: { xs: 'none', lg: 'flex' }, 
              alignItems: 'center' 
            }}>
              {/* User Avatar and Icons */}
              {isAuthenticated ? (
                <>
                  {/* Cart Icon */}
                  <IconButton
                    size="small"
                    aria-label="shopping cart"
                    color="inherit"
                    component={RouterLink}
                    to="/cart"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      marginLeft: 1,
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      width: '28px',
                      height: '28px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        transform: 'none',
                        borderColor: 'rgba(102, 51, 153, 0.4)',
                        boxShadow: 'none',
                      },
                      '& .MuiSvgIcon-root': {
                        fontSize: '16px',
                      },
                    }}
                  >
                      <ShoppingCartIcon />
                  </IconButton>

                  {/* <IconButton
                    size="small"
                    aria-label="show notifications"
                    color="inherit"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      marginLeft: 1,
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      width: '28px',
                      height: '28px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        transform: 'none',
                        borderColor: 'rgba(102, 51, 153, 0.4)',
                        boxShadow: 'none',
                      },
                      '& .MuiSvgIcon-root': {
                        fontSize: '16px',
                      },
                    }}
                  >
                      <NotificationsNoneIcon />
                  </IconButton> */}
                  <IconButton
                    onClick={handleProfileMenuOpen}
                    size="small"
                    sx={{
                      ml: 2,
                      p: 0,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        '& .MuiAvatar-root': {
                          transform: 'scale(1.1) rotate(5deg)',
                          boxShadow: '0 0 0 3px #663399, 0 8px 25px rgba(102, 51, 153, 0.4)',
                        },
                      },
                    }}
                  >
                    <Avatar
                      alt={user?.name || 'User'}
                      src={user?.avatar}
                      sx={{
                        width: 28,
                        height: 28,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: '2px solid #663399',
                        boxShadow: 'none',
                      }}
                    />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <Box px={2} py={1}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {user?.name || 'المستخدم'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user?.email || ''}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                      <AccountCircleIcon sx={{ ml: 1 }} />
                      الملف الشخصي
                    </MenuItem>
                    <MenuItem onClick={() => { navigate('/dashboard'); handleMenuClose(); }}>
                      <DashboardIcon sx={{ ml: 1 }} />
                      لوحة التحكم
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ExitToAppIcon sx={{ ml: 1 }} />
                      تسجيل الخروج
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <IconButton
                  component={RouterLink}
                  to="/login"
                  size="small"
                  aria-label="login"
                  color="inherit"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    marginLeft: 1,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'none',
                      borderColor: 'rgba(102, 51, 153, 0.4)',
                      boxShadow: 'none',
                    },
                    '& .MuiSvgIcon-root': {
                      fontSize: '18px',
                    },
                  }}
                >
                  <AccountCircleIcon />
                </IconButton>
              )}

              {/* Language Switch */}
              <LanguageSwitch sx={{ marginLeft: 1 }}>
                <LanguageLabel active={currentLanguage === 'ar'}>AR</LanguageLabel>
                <Switch
                  checked={currentLanguage === 'en'}
                  onChange={handleLanguageChange}
                  size="small"
                />
                <LanguageLabel active={currentLanguage === 'en'}>EN</LanguageLabel>
              </LanguageSwitch>
            </Box>

            {/* Desktop Navigation */}
            <Box sx={{
              flexGrow: 1,
              display: { xs: 'none', lg: 'flex' },
              ml: { lg: 1, xl: 2 },
              justifyContent: 'center',
              gap: { lg: 0.25, xl: 0.5 },
              '& > *:not(:last-child)': {
                mr: { lg: 0.15, xl: 0.25 },
              },
            }}>
              {navItems.map((item) => {
                // Only hide items that require authentication and user is not authenticated
                if (item.auth && !isAuthenticated) return null;

                // Check if this item has a dropdown (category with courses)
                if (item.hasDropdown && item.categoryId) {
                  return (
                      <NavButton
                      key={item.text}
                      onClick={(e) => handleCategoryClick(e, item)}
                      className={location.pathname.includes(item.path) ? 'active' : ''}
                        scrolled={scrolled}
                      endIcon={<KeyboardArrowDown sx={{ fontSize: '14px', ml: 0.5 }} />}
                      >
                        {item.text}
                      </NavButton>
                  );
                } else {
                return (
                  <NavButton
                      key={item.path || item.text}
                    component={RouterLink}
                    to={item.path}
                    className={location.pathname === item.path ? 'active' : ''}
                    isHome={item.text === 'الرئيسية'}
                    scrolled={scrolled}
                  >
                    {item.text}
                  </NavButton>
                );
                }
              })}
            </Box>


            {/* Logo - moved to right */}
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
              <LogoContainer component={RouterLink} to="/">
                <LogoImage src={logo} alt="شعار المنصة" />
                {!isMobile && (
                  <LogoText variant="h6" scrolled={scrolled}>

                  </LogoText>
                )}
              </LogoContainer>
            </Box>

            {/* Mobile Menu Button */}
            <Box sx={{ display: { xs: 'flex', lg: 'none' }, mr: { xs: 0.5, sm: 1 } }}>
              <IconButton
                size="small"
                aria-label="show menu"
                onClick={() => setMobileMenuOpen(true)}
                color="inherit"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  width: '32px',
                  height: '32px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'none',
                    borderColor: 'rgba(102, 51, 153, 0.4)',
                  },
                  '& .MuiSvgIcon-root': {
                    fontSize: '18px',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </StyledAppBar>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: { xs: '90%', sm: '85%', md: '80%' },
            maxWidth: { xs: '300px', sm: '320px', md: '350px' },
            height: '100vh',
            backgroundColor: 'rgba(248, 249, 250, 0.95)',
            backdropFilter: 'blur(20px)',
            zIndex: 1300,
            boxShadow: '-5px 0 30px rgba(0, 0, 0, 0.15)',
            padding: { xs: '16px', sm: '20px', md: '24px' },
            overflowY: 'auto',
            transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
          }}
        >
          {/* Mobile Header with Close Button */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <LogoContainer component={RouterLink} to="/" onClick={() => setMobileMenuOpen(false)}>
              <LogoImage src={logo} alt="شعار المنصة" />
            </LogoContainer>
            <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: '#333' }}>
              <Box component="span" sx={{ fontSize: '1.5rem' }}>×</Box>
            </IconButton>
          </Box>

          {/* User Profile Section for Mobile */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 3,
            p: 2,
            borderRadius: '12px',
            background: 'rgba(102, 51, 153, 0.08)',
            border: '1px solid rgba(102, 51, 153, 0.15)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isAuthenticated ? (
                <Avatar
                  alt={user?.name || 'User'}
                  src={user?.avatar}
                  sx={{
                    width: 50,
                    height: 50,
                    border: '2px solid #663399',
                  }}
                />
              ) : (
                <AccountCircleIcon sx={{ fontSize: 50, color: '#663399' }} />
              )}
              
              <Box>
                <Typography variant="h6" sx={{ color: '#333', fontWeight: 600 }}>
                  {isAuthenticated ? (user?.name || t('commonUser')) : t('commonGuest')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(51, 51, 51, 0.7)' }}>
                  {isAuthenticated ? (user?.email || '') : t('authLoginForMore')}
                </Typography>
              </Box>
            </Box>

            {/* Language Switch for Mobile */}
            <LanguageSwitch sx={{ marginLeft: 2 }}>
              <LanguageLabel active={currentLanguage === 'ar'}>AR</LanguageLabel>
              <Switch
                checked={currentLanguage === 'en'}
                onChange={handleLanguageChange}
                size="small"
              />
              <LanguageLabel active={currentLanguage === 'en'}>EN</LanguageLabel>
            </LanguageSwitch>
          </Box>

          {/* Mobile Action Buttons */}
          {isAuthenticated && (
            <Box sx={{ 
              display: 'flex', 
              gap: 1, 
              mb: 3,
              flexWrap: 'wrap'
            }}>
              {/* Notifications Button */}
  {/*             <IconButton
                sx={{
                  flex: 1,
                  minWidth: '120px',
                  backgroundColor: 'rgba(102, 51, 153, 0.08)',
                  border: '1px solid rgba(102, 51, 153, 0.15)',
                  borderRadius: '12px',
                  py: 1.5,
                  color: '#333',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 51, 153, 0.1)',
                  }
                }}
              >
                  <NotificationsNoneIcon />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  الإشعارات
                </Typography>
              </IconButton> */}

              {/* Cart Button */}
              <IconButton
                component={RouterLink}
                to="/cart"
                sx={{
                  flex: 1,
                  minWidth: '120px',
                  backgroundColor: 'rgba(102, 51, 153, 0.08)',
                  border: '1px solid rgba(102, 51, 153, 0.15)',
                  borderRadius: '12px',
                  py: 1.5,
                  color: '#333',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 51, 153, 0.1)',
                  }
                }}
              >
                  <ShoppingCartIcon />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  سلة التسوق
                </Typography>
              </IconButton>
            </Box>
          )}


          {/* Navigation Menu */}
          <Box sx={{ mb: 3 }}>
            {navItems.map((item) => (
              (!item.auth || isAuthenticated) && (
                <MobileNavItem 
                  key={item.path} 
                  item={item} 
                  location={location} 
                  loadingCategories={loadingCategories}
                  onClose={() => setMobileMenuOpen(false)}
                />
              )
            ))}
          </Box>

          {/* Login/Logout Button */}
          <Box mt={3}>
            {isAuthenticated ? (
              <Button
                fullWidth
                variant="contained"
                onClick={handleLogout}
                startIcon={<ExitToAppIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #663399 0%, #333679 50%, #1B1B48 100%)',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  py: 1.5,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(102, 51, 153, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7a3fb3 0%, #3d42a0 50%, #23235a 100%)',
                    boxShadow: '0 6px 16px rgba(102, 51, 153, 0.4)',
                  },
                }}
              >
                تسجيل الخروج
              </Button>
            ) : (
              <Button
                fullWidth
                variant="contained"
                component={RouterLink}
                to="/login"
                startIcon={<AccountCircleIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #663399 0%, #333679 50%, #1B1B48 100%)',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  py: 1.5,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(102, 51, 153, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7a3fb3 0%, #3d42a0 50%, #23235a 100%)',
                    boxShadow: '0 6px 16px rgba(102, 51, 153, 0.4)',
                  },
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                تسجيل الدخول
              </Button>
            )}
          </Box>
        </Box>
      )}

      {/* Category Dropdown Menu */}
      <Menu
        anchorEl={categoryAnchorEl}
        open={Boolean(categoryAnchorEl)}
        onClose={handleCategoryClose}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(102, 51, 153, 0.2)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            mt: 1,
            minWidth: 180,
            maxWidth: 280,
            maxHeight: 350,
            overflow: 'auto'
          }
        }}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      >
        {/* Display courses for selected category */}
        {(() => {
          console.log('Selected category:', selectedCategory);
          console.log('Courses data:', coursesData);
          console.log('Category courses:', selectedCategory ? coursesData[selectedCategory.categoryId] : 'No selected category');
          return null;
        })()}
        {selectedCategory && coursesData[selectedCategory.categoryId] && coursesData[selectedCategory.categoryId].length > 0 && (
          <Box sx={{ px: 1, py: 0.5 }}>
            {coursesData[selectedCategory.categoryId].map((course) => (
              <MenuItem
                key={course.id}
                component={RouterLink}
                to={`/courses/${course.id}`}
                onClick={handleCategoryClose}
                sx={{
                  color: '#666',
                  fontSize: '0.75rem',
                  py: 0.6,
                  px: 1.5,
                  borderRadius: '6px',
                  mb: 0.3,
                  maxWidth: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 51, 153, 0.08)',
                    color: '#663399',
                  }
                }}
              >
                {course.title}
              </MenuItem>
            ))}
          </Box>
        )}
        
        {/* Show message if no courses */}
        {selectedCategory && (!coursesData[selectedCategory.categoryId] || coursesData[selectedCategory.categoryId].length === 0) && (
          <MenuItem
            sx={{
              color: '#999',
              fontSize: '0.75rem',
              fontStyle: 'italic',
              textAlign: 'center',
              py: 1.5,
              px: 1.5
            }}
          >
            لا توجد كورسات متاحة حالياً
          </MenuItem>
        )}
      </Menu>

      {/* Backdrop for mobile menu */}
      {mobileMenuOpen && (
        <Box
          onClick={() => setMobileMenuOpen(false)}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1200,
          }}
        />
      )}

      {/* No space needed since background covers full height */}
    </>
  );
};

export default Header;
