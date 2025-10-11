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
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
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
  boxShadow: pageType === 'course-detail'
    ? scrolled
      ? '0 4px 20px 0 rgba(31, 38, 135, 0.2)'
      : '0 2px 10px 0 rgba(31, 38, 135, 0.15)'
    : scrolled
      ? '0 4px 20px rgba(102, 51, 153, 0.3)'
      : 'none',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  borderBottom: pageType === 'course-detail'
    ? scrolled
      ? '1px solid rgba(255, 255, 255, 0.15)'
      : '1px solid rgba(255, 255, 255, 0.08)'
    : scrolled
      ? '1px solid rgba(255, 255, 255, 0.08)'
      : 'none',
  animation: `${fadeIn} 0.6s ease-out`,
  // Enhanced responsive sizing
  padding: scrolled ? '6px 0' : '12px 0',
  minHeight: scrolled ? '56px' : '70px',
  '@media (min-width: 480px)': {
    padding: scrolled ? '8px 0' : '14px 0',
    minHeight: scrolled ? '60px' : '75px',
  },
  '@media (min-width: 768px)': {
    padding: scrolled ? '10px 0' : '16px 0',
    minHeight: scrolled ? '65px' : '80px',
  },
  '@media (min-width: 1024px)': {
    padding: scrolled ? '12px 0' : '18px 0',
    minHeight: scrolled ? '70px' : '85px',
  },
  '@media (min-width: 1200px)': {
    padding: scrolled ? '12px 0' : '20px 0',
    minHeight: scrolled ? '70px' : '90px',
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
  borderRadius: '30px',
  fontWeight: '600',
  textTransform: 'none',
  boxShadow: scrolled
    ? '0 6px 20px rgba(102, 51, 153, 0.4)'
    : '0 6px 20px rgba(45, 27, 105, 0.4)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: scrolled
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(229, 151, 139, 0.3)',
  // Enhanced responsive sizing
  padding: '8px 20px',
  fontSize: '13px',
  minHeight: '40px',
  '@media (min-width: 480px)': {
    padding: '10px 24px',
    fontSize: '14px',
    minHeight: '42px',
  },
  '@media (min-width: 768px)': {
    padding: '12px 28px',
    fontSize: '15px',
    minHeight: '44px',
  },
  '@media (min-width: 1024px)': {
    padding: '12px 30px',
    fontSize: '15px',
    minHeight: '48px',
  },
  '@media (min-width: 1200px)': {
    padding: '12px 30px',
    fontSize: '15px',
    minHeight: '48px',
  },
  '&:hover': {
    transform: 'translateY(-3px) scale(1.02)',
    boxShadow: scrolled
      ? '0 10px 30px rgba(102, 51, 153, 0.6)'
      : '0 10px 30px rgba(229, 151, 139, 0.6)',
    background: scrolled
      ? 'linear-gradient(135deg, #7a3fb3 0%, #3d42a0 50%, #23235a 100%)'
      : 'linear-gradient(135deg, #3A2375 0%, #2D1B69 50%, #1A103F 100%)',
  },
  '&:active': {
    transform: 'translateY(-1px) scale(0.98)',
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
  margin: theme.spacing(0, 1),
  fontWeight: '500',
  fontSize: '16px',
  textTransform: 'none',
  position: 'relative',
  padding: '12px 18px',
  borderRadius: '12px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: scrolled ? '1px solid transparent' : '1px solid rgba(255, 255, 255, 0.1)',
  backgroundColor: scrolled ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
  backdropFilter: scrolled ? 'none' : 'blur(10px)',
  '&:hover': {
    backgroundColor: scrolled
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(255, 255, 255, 0.15)',
    transform: 'translateY(-2px)',
    borderColor: isHome
      ? 'rgba(255, 215, 0, 0.3)'
      : scrolled
        ? 'rgba(255, 255, 255, 0.2)'
        : 'rgba(229, 151, 139, 0.3)',
    boxShadow: isHome
      ? '0 6px 20px rgba(255, 215, 0, 0.3)'
      : scrolled
        ? '0 6px 20px rgba(102, 51, 153, 0.3)'
        : '0 6px 20px rgba(229, 151, 139, 0.3)',
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
  marginRight: '40px',
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
    marginRight: '20px',
  },
}));

const LogoImage = styled('img')({
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  filter: 'drop-shadow(0 2px 8px rgba(102, 51, 153, 0.3))',
  // Enhanced responsive sizing
  height: '40px',
  '@media (min-width: 480px)': {
    height: '50px',
  },
  '@media (min-width: 768px)': {
    height: '60px',
  },
  '@media (min-width: 1024px)': {
    height: '70px',
  },
  '@media (min-width: 1200px)': {
    height: '80px',
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
  borderRadius: '20px',
  padding: '6px 12px',
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

  // Navigation items with dynamic categories
  const navItems = [
    {
      text: t('navHome'),
      path: '/',
      icon: <HomeIcon />
    },
    {
      text: t('navCourses'),
      path: '#',
      icon: <MenuBookIcon />,
      dropdown: categories.map(category => ({
        text: category.courses_count ? `${category.name} (${category.courses_count})` : category.name,
        path: `/courses?category=${category.slug || category.id || 'all'}`,
      }))
    },
    {
      text: t('navAbout'),
      path: '#',
      icon: <SchoolIcon />,
      dropdown: [
        { text: t('navAbout'), path: '/about-us' },
        { text: t('navArticles'), path: '/articles' },
        { text: t('navContact'), path: '/contact-us' },
        { text: t('navFAQ'), path: '/faq' },
        { text: t('navPrivacyPolicy'), path: '/privacy-policy' },
        { text: t('navTermsConditions'), path: '/terms-and-conditions' },
      ]
    },
    {
      text: t('navDashboard'),
      path: '/dashboard',
      icon: <DashboardIcon />,
      auth: true
    },
  ];

  const menuId = 'primary-search-account-menu';

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
                    size="large"
                    aria-label="shopping cart"
                    color="inherit"
                    component={RouterLink}
                    to="/cart"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      marginLeft: 1,
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        transform: 'translateY(-2px) scale(1.05)',
                        borderColor: 'rgba(102, 51, 153, 0.4)',
                        boxShadow: '0 6px 20px rgba(102, 51, 153, 0.3)',
                      },
                    }}
                  >
                    <Badge badgeContent={0} color="error">
                      <ShoppingCartIcon />
                    </Badge>
                  </IconButton>

                  <IconButton
                    size="large"
                    aria-label="show notifications"
                    color="inherit"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      marginLeft: 1,
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        transform: 'translateY(-2px) scale(1.05)',
                        borderColor: 'rgba(102, 51, 153, 0.4)',
                        boxShadow: '0 6px 20px rgba(102, 51, 153, 0.3)',
                      },
                    }}
                  >
                    <Badge badgeContent={3} color="error">
                      <NotificationsNoneIcon />
                    </Badge>
                  </IconButton>
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
                        width: 44,
                        height: 44,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: '2px solid #663399',
                        boxShadow: '0 4px 15px rgba(102, 51, 153, 0.3)',
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
                  size="large"
                  aria-label="login"
                  color="inherit"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    width: '48px',
                    height: '48px',
                    marginLeft: 1,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(-2px) scale(1.05)',
                      borderColor: 'rgba(102, 51, 153, 0.4)',
                      boxShadow: '0 6px 20px rgba(102, 51, 153, 0.3)',
                    },
                  }}
                >
                  <AccountCircleIcon />
                </IconButton>
              )}

              {/* Language Switch */}
              <LanguageSwitch sx={{ marginLeft: 20 }}>
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
              ml: { lg: 2, xl: 4 },
              justifyContent: 'center',
              gap: { lg: 1, xl: 2 },
              '& > *:not(:last-child)': {
                mr: { lg: 0.5, xl: 1 },
              },
            }}>
              {navItems.map((item) => {
                // Only hide items that require authentication and user is not authenticated
                if (item.auth && !isAuthenticated) return null;

                if (item.dropdown) {
                  const [anchorEl, setAnchorEl] = useState(null);
                  const open = Boolean(anchorEl);

                  const handleClick = (event) => {
                    setAnchorEl(event.currentTarget);
                  };

                  const handleClose = () => {
                    setAnchorEl(null);
                  };

                  return (
                    <div key={item.text}>
                      <NavButton
                        aria-controls={open ? item.text : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick}
                        endIcon={<KeyboardArrowDown />}
                        className={location.pathname.startsWith(item.path) ? 'active' : ''}
                        scrolled={scrolled}
                      >
                        {item.text}
                      </NavButton>
                      <Menu
                        id={item.text}
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                          'aria-labelledby': item.text,
                        }}
                        PaperProps={{
                          style: {
                            backgroundColor: 'rgba(27, 27, 72, 0.95)',
                            color: '#FFFFFF',
                            marginTop: '15px',
                            minWidth: '220px',
                            borderRadius: '16px',
                            boxShadow: '0 12px 40px rgba(102, 51, 153, 0.4)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                      >
                        {loadingCategories ? (
                          <Box display="flex" justifyContent="center" p={3}>
                            <CircularProgress size={24} sx={{ color: '#663399' }} />
                          </Box>
                        ) : item.dropdown.length > 0 ? (
                          item.dropdown.map((subItem, index) => (
                            <MenuItem
                              key={`${subItem.path}-${index}`}
                              component={RouterLink}
                              to={subItem.path}
                              onClick={handleClose}
                              sx={{
                                color: '#E6E6E6',
                                padding: '12px 20px',
                                margin: '2px 8px',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  backgroundColor: 'rgba(102, 51, 153, 0.2)',
                                  color: '#FFFFFF',
                                  transform: 'translateX(5px)',
                                },
                                '&.Mui-selected': {
                                  backgroundColor: 'rgba(102, 51, 153, 0.15)',
                                  color: '#663399',
                                },
                              }}
                            >
                              {subItem.text}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled sx={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            padding: '16px 20px',
                            textAlign: 'center'
                          }}>
                            لا توجد أقسام متاحة
                          </MenuItem>
                        )}
                      </Menu>
                    </div>
                  );
                }

                return (
                  <NavButton
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    className={location.pathname === item.path ? 'active' : ''}
                    isHome={item.text === 'الرئيسية'}
                    scrolled={scrolled}
                  >
                    {item.text}
                  </NavButton>
                );
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
                size="large"
                aria-label="show menu"
                onClick={() => setMobileMenuOpen(true)}
                color="inherit"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.05)',
                    borderColor: 'rgba(102, 51, 153, 0.4)',
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
              <IconButton
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
                <Badge badgeContent={3} color="error" sx={{ mr: 1 }}>
                  <NotificationsNoneIcon />
                </Badge>
                <Typography variant="body2" sx={{ ml: 1 }}>
                  الإشعارات
                </Typography>
              </IconButton>

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
                <Badge badgeContent={0} color="error" sx={{ mr: 1 }}>
                  <ShoppingCartIcon />
                </Badge>
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
