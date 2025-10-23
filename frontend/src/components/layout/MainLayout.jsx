import { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout as logoutAction } from '../../store/slices/authSlice';
import { useAuth } from '../../contexts/AuthContext';
import profileImage from '../../assets/images/profile.jpg';
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItemButton, ListItemIcon, ListItemText,
  Avatar, Divider, Badge, Paper, Collapse, useTheme, useMediaQuery
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Menu as MenuIcon, 
  Dashboard as DashboardIcon, 
  Assessment as AssessmentIcon, 
  Message as MessageIcon,
  Settings as SettingsIcon, 
  Notifications as NotificationsIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  CalendarToday as CalendarTodayIcon,
  Grade as GradeIcon,
  Home as HomeIcon,
  Quiz as QuizIcon,
  VideoCall as VideoCallIcon,
  Article as ArticleIcon,
  Psychology as PsychologyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Language as LanguageIcon,
  Style as FlashcardsIcon,
  Quiz as QBIcon,
  Assessment as PerformanceIcon,
  Pause as FreezeIcon,
  Help as FAQsIcon,
  RateReview as ReviewIcon,
  ContactSupport as ContactUsIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { courseAPI } from '../../services/courseService';
import { contentAPI } from '../../services/content.service';
import assessmentService from '../../services/assessment.service';

const drawerWidth = {
  xs: 180,
  sm: 200,
  md: 220,
  lg: 240,
  xl: 260,
};

const MainLayout = ({ children, toggleDarkMode, isDarkMode }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getUserRole, user } = useAuth(); // Get user data from auth context
  
  // Enrollment status state
  const [enrollmentStatus, setEnrollmentStatus] = useState({
    questionBank: false,
    flashcards: false
  });
  
  // Navigation items for teacher
  const teacherNavItems = [
    { text: t('navHome'), icon: <HomeIcon />, path: '/', exact: true },
    { text: t('navDashboard'), icon: <DashboardIcon />, path: '/teacher/dashboard' },
    { text: t('navMyCourses'), icon: <ClassIcon />, path: '/teacher/my-courses' },
    { text: t('navQuestionBank'), icon: <QuizIcon />, path: '/teacher/question-bank' },
    { text: t('navFlashcards'), icon: <PsychologyIcon />, path: '/teacher/flashcards' },
    // { text: t('navMeetings'), icon: <VideoCallIcon />, path: '/teacher/meetings' },
    { text: t('navArticles'), icon: <ArticleIcon />, path: '/teacher/articles' },
    { text: t('navSettings'), icon: <SettingsIcon />, path: '/teacher/settings' },
  ];

  // Navigation items for student
  const studentNavItems = [
    { text: t('navHome'), icon: <HomeIcon />, path: '/', exact: true },
    { text: t('navDashboard'), icon: <DashboardIcon />, path: '/student/dashboard' },
    // Courses will be dynamically added below
    { 
      text: t('navFlashcards'), 
      icon: <FlashcardsIcon />, 
      path: enrollmentStatus.flashcards ? '/student/flashcards/filter' : null,
      requiresEnrollment: true,
      enrollmentStatus: enrollmentStatus.flashcards
    },
    { 
      text: t('navQuestionBank'), 
      icon: <QBIcon />, 
      path: enrollmentStatus.questionBank ? '/student/questionbank/filter' : null,
      requiresEnrollment: true,
      enrollmentStatus: enrollmentStatus.questionBank
    },
    { text: t('dashboardPerformance'), icon: <PerformanceIcon /> },
    { text: t('dashboardFreeze'), icon: <FreezeIcon /> },
    { text: t('navFAQ'), icon: <FAQsIcon /> },
    { text: t('navReview'), icon: <ReviewIcon /> },
    { text: t('navContact'), icon: <ContactUsIcon /> },
    // { text: t('navMyMeetings'), icon: <VideoCallIcon />, path: '/student/meetings' },
    { text: t('navSettings'), icon: <SettingsIcon />, path: '/student/settings' },
  ];
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  
  const [myCourses, setMyCourses] = useState([]);
  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
  const [courseDropdowns, setCourseDropdowns] = useState({});
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

  // Sample notifications data
  const notifications = [
    { id: 1, text: t('notificationsNewAssignment'), time: t('notificationsTenMinutesAgo'), read: false },
    { id: 2, text: t('notificationsGradesAdded'), time: t('notificationsOneHourAgo'), read: false },
    { id: 3, text: t('notificationsNewLecture'), time: t('notificationsOneDayAgo'), read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Get user data with fallbacks
  const getUserData = () => {
    if (user) {
      return {
        name: user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : user.username || t('commonUser'),
        email: user.email || '',
        avatar: user.profile_picture || profileImage,
        role: getUserRole() === 'instructor' ? t('commonTeacher') : t('commonStudent'),
        description: user.bio || (getUserRole() === 'instructor' ? t('commonTeacherOnPlatform') : t('commonStudentOnPlatform'))
      };
    }
    return {
      name: t('commonUser'),
      email: '',
      avatar: profileImage,
      role: t('commonStudent'),
      description: t('commonStudentOnPlatform')
    };
  };

  const userData = getUserData();

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifMenuOpen = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotifAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate('/login');
    handleMenuClose();
  };

  const handleLanguageChange = () => {
    const newLang = currentLanguage === 'en' ? 'ar' : 'en';
    setCurrentLanguage(newLang);
    i18n.changeLanguage(newLang);
    // Update document direction for RTL support
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  // Check enrollment status for Question Bank and Flashcards
  const checkEnrollmentStatus = async () => {
    try {
      const response = await assessmentService.checkEnrollmentStatus();
      if (response.success) {
        setEnrollmentStatus({
          questionBank: response.data.questionBank.is_enrolled,
          flashcards: response.data.flashcards.is_enrolled
        });
      } else {
        console.error('Error checking enrollment status:', response.error);
        setEnrollmentStatus({
          questionBank: false,
          flashcards: false
        });
      }
    } catch (error) {
      console.error('Error checking enrollment status:', error);
      setEnrollmentStatus({
        questionBank: false,
        flashcards: false
      });
    }
  };

  // Handle courses dropdown toggle
  const handleCoursesDropdownToggle = () => {
    console.log('Courses dropdown toggled:', !coursesDropdownOpen);
    setCoursesDropdownOpen(!coursesDropdownOpen);
  };

  const handleCourseDropdownToggle = (courseId) => {
    setCourseDropdowns(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  // No filtering needed anymore - show all courses
  const filteredCourses = myCourses;

  // Initialize language state and set document direction
  useEffect(() => {
    const currentLang = i18n.language || 'en';
    setCurrentLanguage(currentLang);
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [i18n.language]);

  // Check enrollment status on component mount
  useEffect(() => {
    checkEnrollmentStatus();
  }, []);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setCurrentLanguage(lng);
      document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lng;
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // Fetch my courses on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch my courses if user is a student
        if (getUserRole() === 'student') {
          setLoadingCourses(true);
          const coursesData = await courseAPI.getMyCourses();
          console.log('My courses data:', coursesData);
          // The API returns an array of courses directly
            const coursesArray = Array.isArray(coursesData) ? coursesData : [];
            console.log('Courses array:', coursesArray);
           
            // Fetch modules for each course
            const coursesWithModules = await Promise.all(
              coursesArray.map(async (course) => {
                try {
                  const modulesResponse = await contentAPI.getCourseModulesWithLessons(course.id);
                  console.log(`Modules response for course ${course.id}:`, modulesResponse);
                  // Extract modules from response - could be direct array or nested under 'modules' property
                  const modulesData = Array.isArray(modulesResponse) ? modulesResponse : (modulesResponse?.modules || []);
                  console.log(`Extracted modules for course ${course.id}:`, modulesData);
                  
                  // Filter to show only main modules (not submodules)
                  const mainModules = modulesData.filter(module => !module.submodule);
                  console.log(`Main modules for course ${course.id}:`, mainModules);
                  
                  return {
                    ...course,
                    modules: mainModules
                  };
                } catch (error) {
                  console.error(`Error fetching modules for course ${course.id}:`, error);
                  return {
                    ...course,
                    modules: []
                  };
                }
              })
            );
           
            setMyCourses(coursesWithModules);
            setLoadingCourses(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoadingCourses(false);
      }
    };

    fetchData();
  }, [getUserRole]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setAnchorEl(null);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifAnchorEl(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Get user role from useAuth hook
  const userRole = getUserRole();
  
  // Select navigation items based on user role
  const getNavItems = () => {
    switch(userRole) {
      case 'instructor':
      case 'teacher':
        return teacherNavItems;
      case 'student':
      default:
        // Insert course items after Dashboard for students
        const baseItems = [...studentNavItems];
        if (filteredCourses.length > 0) {
          const courseItems = filteredCourses.map(course => ({
            text: course.title,
            icon: <ClassIcon />,
            path: `/student/my-courses?courseId=${course.id}`,
            isCourseDropdown: true,
            courseId: course.id
          }));
          // Insert course items after Dashboard (index 1)
          baseItems.splice(2, 0, ...courseItems);
        }
        return baseItems;
    }
  };
  
  const navItems = getNavItems();
  
  // Check if a nav item is active based on current path
  const isActive = (itemPath, exact = false) => {
    if (exact) {
      return location.pathname === itemPath;
    }
    return location.pathname.startsWith(itemPath) && itemPath !== '/';
  };

  const drawer = (
    <Box sx={{
      height: '100%',
      background: '#FFFFFF',
      borderRadius: currentLanguage === 'ar' 
        ? { xs: '16px', md: '24px 0 0 24px' }
        : { xs: '16px', md: '0 24px 24px 0' },
      boxShadow: '0 8px 32px 0 rgba(31,38,135,0.15)',
      p: { xs: 1, sm: 1.5, md: 2 },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100%',
      overflowY: 'auto',
      border: '1px solid rgba(0,0,0,0.08)',
      '&::-webkit-scrollbar': {
        width: '4px',
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: '4px',
        '&:hover': {
          backgroundColor: 'rgba(0,0,0,0.3)',
        },
      },
    }}>
      {/* User Profile */}
      <Box sx={{
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        mb: { xs: 1.5, sm: 2 },
        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', 
        borderRadius: { xs: 2, sm: 3 }, 
        p: { xs: 1, sm: 1.5 }, 
        boxShadow: '0 4px 12px 0 rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.06)',
        width: '100%',
        maxWidth: { xs: '90%', sm: '100%' }
      }}>
        <Avatar 
          src={userData.avatar} 
          alt={userData.name}
          sx={{
            width: { xs: 50, sm: 60, md: 70 }, 
            height: { xs: 50, sm: 60, md: 70 }, 
            mb: { xs: 0.5, sm: 1 }, 
            border: { xs: '2px solid #e3f2fd', md: '3px solid #e3f2fd' }, 
            boxShadow: '0 4px 12px 0 rgba(0,0,0,0.12)'
          }}
        />
        <Typography 
          fontWeight={700}
          sx={{
            fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
            textAlign: 'center',
            lineHeight: { xs: 1.3, sm: 1.2 },
            mb: { xs: 0.3, sm: 0.5 },
            direction: currentLanguage === 'ar' ? 'rtl' : 'ltr'
          }}
        >
          {userData.name}
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.65rem', sm: '0.7rem' },
            textAlign: 'center',
            lineHeight: { xs: 1.4, sm: 1.3 },
            px: { xs: 1, sm: 0 },
            direction: currentLanguage === 'ar' ? 'rtl' : 'ltr'
          }}
        >
          {userData.description}
        </Typography>
      </Box>
      <Divider sx={{ width: '100%', mb: 1.5 }} />
      {/* Navigation */}
      <List sx={{ width: '100%' }}>
        {navItems.map((item) => {
          const active = isActive(item.path, item.exact);
          
          // Special handling for course dropdowns (student only)
          if (item.isCourseDropdown && userRole === 'student') {
            const course = filteredCourses.find(c => c.id === item.courseId);
            const courseDropdownOpen = courseDropdowns[item.courseId] || false;
            console.log('Course dropdown for:', item.text, 'Course data:', course);
            console.log('Course modules:', course?.modules);
            
            return (
              <Box key={item.text} sx={{ mb: 0 }}>
                <ListItemButton
                  onClick={() => handleCourseDropdownToggle(item.courseId)}
                  sx={{
                    borderRadius: 1,
                    color: active ? '#1976d2' : '#616161',
                    background: active ? 'rgba(25,118,210,0.1)' : 'none',
                    boxShadow: 'none',
                    py: { xs: 0.4, sm: 0.5 },
                    px: { xs: 0.6, sm: 0.8 },
                    border: 'none',
                    minHeight: { xs: 28, sm: 32 },
                    '&:hover': {
                      background: 'rgba(25,118,210,0.08)',
                      color: '#1976d2',
                      borderRadius: 1
                    }
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: { xs: 24, sm: 28 },
                    color: active ? '#1976d2' : '#9e9e9e',
                    fontSize: { xs: 16, sm: 18 }
                  }}>{item.icon}</ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    sx={{ 
                      fontWeight: 500,
                      '& .MuiListItemText-primary': {
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' }
                      }
                    }} 
                  />
                  {courseDropdownOpen ? 
                    <ExpandLessIcon sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} /> : 
                    <ExpandMoreIcon sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} />
                  }
                </ListItemButton>
                
                {/* Course Modules Dropdown */}
                <Collapse in={courseDropdownOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ 
                    pr: { xs: 1, sm: 2 },
                    pl: { xs: 1, sm: 1.5 },
                    pt: { xs: 0.5, sm: 1 },
                    maxHeight: { xs: '200px', sm: '300px' },
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '3px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: 'rgba(0,0,0,0.05)',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      borderRadius: '3px',
                    },
                  }}>
                    {course && course.modules && course.modules.length > 0 ? (
                      course.modules.map((module) => (
                        <ListItemButton
                          key={module.id}
                          onClick={() => {
                            navigate(`/student/my-courses?courseId=${course.id}&moduleId=${module.id}`);
                            if (isMobile) {
                              setMobileOpen(false);
                            }
                          }}
                          sx={{
                            borderRadius: '4px',
                            mb: { xs: 0.1, sm: 0.15 },
                            py: { xs: 0.3, sm: 0.4 },
                            px: { xs: 0.6, sm: 0.8 },
                            color: '#666',
                            margin: '1px 0',
                            minHeight: { xs: 24, sm: 28 },
                            '&:hover': {
                              background: 'rgba(25, 118, 210, 0.1)',
                              color: '#1976d2'
                            },
                            '&.active': {
                              background: 'rgba(25, 118, 210, 0.15)',
                              color: '#1976d2',
                              fontWeight: 600
                            }
                          }}
                        >
                          <ListItemText 
                            primary={module.title || module.name || `Module ${module.id}`} 
                            sx={{ 
                              '& .MuiListItemText-primary': {
                                fontSize: { xs: '10px', sm: '11px', md: '12px' },
                                fontWeight: 500,
                                lineHeight: { xs: 1.2, sm: 1.3 },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }
                            }} 
                          />
                        </ListItemButton>
                      ))
                    ) : (
                      <ListItemButton disabled sx={{ py: { xs: 0.5, sm: 1 } }}>
                        <ListItemText 
                          primary={t('dashboardNoModulesAvailable')} 
                          sx={{ 
                            fontSize: { xs: '12px', sm: '14px' }, 
                            color: '#999' 
                          }} 
                        />
                      </ListItemButton>
                    )}
                  </List>
                </Collapse>
              </Box>
            );
          }
          
          // Regular navigation items
          const handleNavClick = () => {
            // Check enrollment for items that require it
            if (item.requiresEnrollment && !item.enrollmentStatus) {
              // Show enrollment modal or redirect to enrollment page
              alert(t('enrollment.enrollmentRequired'));
              return;
            }
            
            // Close mobile drawer after navigation
            if (isMobile) {
              setMobileOpen(false);
            }
          };

          // If item requires enrollment and user is not enrolled, show disabled state
          if (item.requiresEnrollment && !item.enrollmentStatus) {
            return (
              <Box key={item.text} sx={{ position: 'relative' }}>
                <ListItemButton
                  disabled
                  sx={{
                    borderRadius: 1,
                    color: '#ccc',
                    py: { xs: 0.4, sm: 0.5 },
                    px: { xs: 0.6, sm: 0.8 },
                    minHeight: { xs: 28, sm: 32 },
                    mb: 0,
                    opacity: 0.6,
                    cursor: 'not-allowed'
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: { xs: 24, sm: 28 },
                    color: '#ccc',
                    fontSize: { xs: 16, sm: 18 }
                  }}>{item.icon}</ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    sx={{ 
                      fontWeight: 500,
                      '& .MuiListItemText-primary': {
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' }
                      }
                    }} 
                  />
                  <LockIcon sx={{ fontSize: 16, color: '#ccc' }} />
                </ListItemButton>
              </Box>
            );
          }

          return (
            <NavLink
              key={item.text}
              to={item.path || '#'}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
                marginBottom: '0px',
                borderRadius: '4px',
                background: active ? 'rgba(25,118,210,0.1)' : 'none',
                boxShadow: 'none',
                border: 'none',
              }}
              onClick={handleNavClick}
            >
              <ListItemButton
                sx={{
                  borderRadius: 1,
                  color: active ? '#1976d2' : '#616161',
                  py: { xs: 0.4, sm: 0.5 },
                  px: { xs: 0.6, sm: 0.8 },
                  minHeight: { xs: 28, sm: 32 },
                  mb: 0,
                  '&:hover': {
                    background: 'rgba(25,118,210,0.08)',
                    color: '#1976d2',
                    borderRadius: 1
                  }
                }}
              >
                <ListItemIcon sx={{
                  minWidth: { xs: 24, sm: 28 },
                  color: active ? '#1976d2' : '#9e9e9e',
                  fontSize: { xs: 16, sm: 18 }
                }}>{item.icon}</ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    fontWeight: 500,
                    '& .MuiListItemText-primary': {
                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' }
                    }
                  }} 
                />
                {item.badge && (
                  <Badge 
                    badgeContent={item.badge} 
                    color="secondary" 
                    sx={{ 
                      position: 'absolute', 
                      left: { xs: 12, sm: 16 },
                      '& .MuiBadge-badge': {
                        background: 'linear-gradient(45deg, #f44336, #ff5722)',
                        fontSize: { xs: '8px', sm: '10px' },
                        fontWeight: 700,
                        width: { xs: 16, sm: 18 },
                        height: { xs: 16, sm: 18 }
                      }
                    }} 
                  />
                )}
              </ListItemButton>
            </NavLink>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100%',
      background: '#f6f7fb', 
      direction: currentLanguage === 'ar' ? 'rtl' : 'ltr', 
      overflow: 'hidden',
      '& *': {
        '&::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0,0,0,0.02)',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.1)',
          borderRadius: '4px',
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.15)',
          },
        },
      },
    }}>
      {/* Sidebar */}
      <Box sx={{ 
        width: { xs: 0, sm: 0, md: drawerWidth.md, lg: drawerWidth.lg, xl: drawerWidth.xl },
        flexShrink: 0, 
        position: 'relative', 
        height: '100%', 
        overflowY: 'auto',
        overflowX: 'hidden',
        '&:hover': {
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#a8a8a8',
          },
        },
      }}>
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          anchor={currentLanguage === 'ar' ? 'right' : 'left'}
          sx={{
            display: { xs: 'none', sm: 'none', md: 'block' },
            width: { md: drawerWidth.md, lg: drawerWidth.lg, xl: drawerWidth.xl },
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: { md: drawerWidth.md, lg: drawerWidth.lg, xl: drawerWidth.xl },
              boxSizing: 'border-box',
              border: 'none',
              background: 'transparent',
              boxShadow: 'none',
              position: 'relative',
              height: '100%',
              overflow: 'visible'
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          anchor={currentLanguage === 'ar' ? 'right' : 'left'}
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: { xs: drawerWidth.xs, sm: drawerWidth.sm },
              boxSizing: 'border-box',
              border: 'none',
              background: 'rgba(255,255,255,0.98)',
              boxShadow: '0 8px 32px 0 rgba(31,38,135,0.15)',
              height: '100%',
              overflow: 'visible',
              backdropFilter: 'blur(20px)',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      {/* Main Content */}
      <Box sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        width: '100%', // Changed to take full width
        '& > *:first-of-type': { // AppBar
          flexShrink: 0
        },
        '& > *:last-child': { // Content area
          flexGrow: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          p: 4,
          pt: 2,
          maxWidth: '100%', // Ensure content doesn't overflow
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.3)',
            },
          },
        }
      }}>
        {/* AppBar Wrapper */}
        <Box sx={{ position: 'relative', zIndex: 1000, overflow: 'visible' }}>
        {/* AppBar */}
        <AppBar position="static" elevation={0} sx={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)', 
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(14,81,129,0.08)', 
          borderRadius: 0,
          border: '1px solid rgba(255,255,255,0.2)',
          position: 'relative',
          overflow: 'visible',
          width: '100%',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #4DBFB3 0%, #333679 50%, #4DBFB3 100%)',
            zIndex: 1
          }
        }}>
          <Toolbar sx={{ 
            justifyContent: 'space-between', 
            py: { xs: 0.5, md: 1 }, 
            px: { xs: 1, md: 2 },
            position: 'relative', 
            zIndex: 2,
            minHeight: { xs: 56, md: 64 }
          }}>
            {/* Mobile Menu Button */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => setMobileOpen(true)}
              edge={currentLanguage === 'ar' ? 'end' : 'start'}
              sx={{
                [currentLanguage === 'ar' ? 'ml' : 'mr']: { xs: 1, sm: 2 },
                display: { xs: 'block', sm: 'block', md: 'none' },
                color: '#333679',
                p: { xs: 1, sm: 1.5 },
                order: 1,
                '&:hover': {
                  backgroundColor: 'rgba(51, 54, 121, 0.1)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <MenuIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
            </IconButton>

            {/* Mobile Layout: Notifications and Profile */}
            <Box sx={{ 
              display: { xs: 'flex', sm: 'none' }, 
              alignItems: 'center', 
              gap: { xs: 0.5, sm: 1 },
              [currentLanguage === 'ar' ? 'ml' : 'mr']: 'auto',
              order: 2
            }}>
              {/* Translation Button */}
              <IconButton 
                color="inherit" 
                sx={{ 
                  bgcolor: 'transparent', 
                  p: { xs: 0.8, sm: 1, md: 1.5 },
                  borderRadius: { xs: 2, sm: 3 },
                  transition: 'all 0.3s ease',
                  minWidth: { xs: 44, sm: 48, md: 52 },
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: 'rgba(51, 54, 121, 0.1)',
                    transform: 'scale(1.05)',
                    boxShadow: 'none'
                  },
                  '&:focus': {
                    outline: 'none',
                    border: 'none',
                    boxShadow: 'none'
                  },
                  '&:active': {
                    outline: 'none',
                    border: 'none',
                    boxShadow: 'none'
                  }
                }}
                onClick={handleLanguageChange}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography 
                    sx={{ 
                      color: currentLanguage === 'ar' ? '#333679' : '#999',
                      fontSize: { xs: '10px', sm: '11px', md: '12px' },
                      fontWeight: currentLanguage === 'ar' ? 700 : 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    AR
                  </Typography>
                  <Typography 
                    sx={{ 
                      color: '#ccc',
                      fontSize: { xs: '8px', sm: '9px', md: '10px' }
                    }}
                  >
                    /
                  </Typography>
                  <Typography 
                    sx={{ 
                      color: currentLanguage === 'en' ? '#333679' : '#999',
                      fontSize: { xs: '10px', sm: '11px', md: '12px' },
                      fontWeight: currentLanguage === 'en' ? 700 : 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    EN
                  </Typography>
                </Box>
              </IconButton>

              {/* Notification Dropdown with Enhanced Design */}
              <Box ref={notifRef} sx={{ position: 'relative' }}>
                <IconButton 
                  color="inherit" 
                  sx={{ 
                    bgcolor: notifAnchorEl ? 'rgba(77, 191, 179, 0.15)' : 'rgba(77, 191, 179, 0.08)', 
                    p: { xs: 0.8, sm: 1, md: 1.5 },
                    borderRadius: { xs: 2, sm: 3 },
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(77, 191, 179, 0.2)',
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 15px rgba(77, 191, 179, 0.3)'
                    }
                  }}
                  onClick={handleNotifMenuOpen}
                >
                  <Badge 
                    badgeContent={unreadCount} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                        boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)',
                        animation: 'pulse 2s infinite',
                        fontSize: { xs: '8px', sm: '10px' },
                        width: { xs: 16, sm: 18 },
                        height: { xs: 16, sm: 18 },
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(1)' },
                          '50%': { transform: 'scale(1.1)' },
                          '100%': { transform: 'scale(1)' }
                        }
                      }
                    }}
                  >
                    <NotificationsIcon sx={{ 
                      color: '#333679',
                      fontSize: { xs: 20, sm: 22, md: 24 },
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                    }} />
                  </Badge>
                </IconButton>
                
                {/* Notification Dropdown Menu */}
                {notifAnchorEl && (
                  <Paper 
                    sx={{
                      position: 'fixed',
                      top: 56,
                      left: 8,
                      right: 8,
                      width: 'calc(100vw - 16px)',
                      maxHeight: 'calc(100vh - 80px)',
                      overflowY: 'auto',
                      borderRadius: 3,
                      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                      zIndex: 9999,
                      p: 0,
                      background: 'rgba(255,255,255,0.98)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(77, 191, 179, 0.3)',
                      mt: 0,
                      overflow: 'hidden',
                      display: 'block',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, #4DBFB3, #333679)',
                        zIndex: 1
                      }
                    }}
                  >
                    <Box sx={{ 
                      p: { xs: 2, sm: 2.5, md: 3 }, 
                      background: 'linear-gradient(135deg, rgba(77, 191, 179, 0.05) 0%, rgba(51, 54, 121, 0.05) 100%)',
                      borderBottom: '1px solid rgba(77, 191, 179, 0.1)'
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 1, sm: 0 }
                      }}>
                        <Typography 
                          variant="h6" 
                          fontWeight={700} 
                          sx={{ 
                            color: '#333679',
                            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
                          }}
                        >
                          {t('notificationsTitle')}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#4DBFB3', 
                            cursor: 'pointer',
                            fontWeight: 600,
                            px: { xs: 1.5, sm: 2 },
                            py: { xs: 0.3, sm: 0.5 },
                            borderRadius: { xs: 1.5, sm: 2 },
                            bgcolor: 'rgba(77, 191, 179, 0.1)',
                            transition: 'all 0.2s',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            textAlign: 'center',
                            '&:hover': { 
                              bgcolor: 'rgba(77, 191, 179, 0.2)',
                              transform: 'scale(1.05)'
                            }
                          }}
                        >
                          {t('notificationsMarkAllRead')}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <List sx={{ p: { xs: 1, sm: 2 } }}>
                      {notifications.map((notification, index) => (
                        <ListItemButton 
                          key={notification.id}
                          sx={{
                            borderRadius: { xs: 1.5, sm: 2 },
                            mb: { xs: 0.5, sm: 1 },
                            p: { xs: 1.5, sm: 2 },
                            bgcolor: !notification.read ? 'rgba(77, 191, 179, 0.08)' : 'transparent',
                            border: !notification.read ? '1px solid rgba(77, 191, 179, 0.2)' : '1px solid transparent',
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                              bgcolor: 'rgba(77, 191, 179, 0.12)',
                              transform: 'translateX(4px)',
                              boxShadow: '0 4px 15px rgba(77, 191, 179, 0.2)'
                            }
                          }}
                        >
                          <Box sx={{ width: '100%', position: 'relative' }}>
                            {!notification.read && (
                              <Box sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: { xs: 6, sm: 8 },
                                height: { xs: 6, sm: 8 },
                                borderRadius: '50%',
                                bgcolor: '#4DBFB3',
                                boxShadow: '0 0 8px rgba(77, 191, 179, 0.6)'
                              }} />
                            )}
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: notification.read ? 500 : 700,
                                color: notification.read ? '#666' : '#333',
                                mb: { xs: 0.2, sm: 0.3 },
                                lineHeight: { xs: 1.3, sm: 1.4 },
                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
                              }}
                            >
                              {notification.text}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: '#999',
                                fontSize: { xs: '10px', sm: '11px' },
                                fontWeight: 500
                              }}
                            >
                              {notification.time}
                            </Typography>
                          </Box>
                        </ListItemButton>
                      ))}
                    </List>
                    
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2,
                      borderTop: '1px solid rgba(77, 191, 179, 0.1)',
                      background: 'rgba(77, 191, 179, 0.02)'
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#4DBFB3',
                          cursor: 'pointer',
                          fontWeight: 600,
                          px: 3,
                          py: 1,
                          borderRadius: 2,
                          bgcolor: 'rgba(77, 191, 179, 0.1)',
                          transition: 'all 0.2s',
                          '&:hover': { 
                            bgcolor: 'rgba(77, 191, 179, 0.2)',
                            transform: 'scale(1.05)'
                          }
                        }}
                      >
                        {t('notificationsViewAll')}
                      </Typography>
                    </Box>
                  </Paper>
                )}
              </Box>

              {/* Profile Dropdown */}
              <Box ref={profileRef} sx={{ position: 'relative' }}>
                <IconButton 
                  onClick={handleProfileMenuOpen}
                  sx={{ 
                    p: 0,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -2,
                      left: -2,
                      right: -2,
                      bottom: -2,
                      borderRadius: '50%',
                      background: anchorEl ? 'linear-gradient(45deg, #4DBFB3, #333679)' : 'transparent',
                      zIndex: -1,
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <Avatar 
                    src={userData.avatar}
                    alt={userData.name}
                    sx={{ 
                      width: { xs: 28, sm: 32, md: 36 }, 
                      height: { xs: 28, sm: 32, md: 36 }, 
                      border: { xs: '1px solid white', md: '2px solid white' },
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(14,81,129,0.2)',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 6px 25px rgba(14,81,129,0.4)',
                        border: { xs: '1px solid #4DBFB3', md: '2px solid #4DBFB3' }
                      }
                    }} 
                  />
                </IconButton>
                
                {/* Profile Dropdown Menu */}
                {anchorEl && (
                  <Paper 
                    sx={{
                      position: 'fixed',
                      top: 56,
                      ...(currentLanguage === 'ar' ? { right: 12, left: 12 } : { left: 12, right: 12 }),
                      width: 'calc(100vw - 24px)',
                      maxHeight: 'calc(100vh - 100px)',
                      borderRadius: 3,
                      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                      zIndex: 9999,
                      overflow: 'hidden',
                      background: 'rgba(255,255,255,0.98)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(77, 191, 179, 0.3)',
                      mt: 0,
                      display: 'block',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, #4DBFB3, #333679)',
                        zIndex: 1
                      }
                    }}
                  >
                    <Box sx={{ 
                      p: { xs: 2, sm: 2.5, md: 3 }, 
                      textAlign: 'center', 
                      background: 'linear-gradient(135deg, rgba(77, 191, 179, 0.05) 0%, rgba(51, 54, 121, 0.05) 100%)',
                      borderBottom: '1px solid rgba(77, 191, 179, 0.1)'
                    }}>
                      <Avatar 
                        src={userData.avatar}
                        alt={userData.name}
                        sx={{ 
                          width: { xs: 50, sm: 56, md: 62 }, 
                          height: { xs: 50, sm: 56, md: 62 }, 
                          mb: { xs: 1.5, sm: 2 },
                          mx: 'auto',
                          border: { xs: '2px solid #4DBFB3', md: '3px solid #4DBFB3' },
                          boxShadow: '0 4px 20px rgba(77, 191, 179, 0.3)'
                        }} 
                      />
                      <Typography 
                        variant="h6" 
                        fontWeight={700} 
                        sx={{ 
                          color: '#333679', 
                          mb: { xs: 0.2, sm: 0.3 },
                          fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
                        }}
                      >
                        {userData.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#4DBFB3', 
                          fontWeight: 600,
                          mb: { xs: 0.2, sm: 0.3 },
                          fontSize: { xs: '0.8rem', sm: '0.875rem' }
                        }}
                      >
                        {userData.role}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#666',
                          fontSize: { xs: '10px', sm: '11px', md: '12px' },
                          fontWeight: 500
                        }}
                      >
                        {userData.email}
                      </Typography>
                    </Box>
                    
                    <List sx={{ p: { xs: 1, sm: 2 } }}>
                      {/* <ListItemButton sx={{ 
                        borderRadius: { xs: 1.5, sm: 2 },
                        mb: { xs: 0.2, sm: 0.3 },
                        py: { xs: 0.5, sm: 0.6 },
                        px: { xs: 0.8, sm: 1 },
                        transition: 'all 0.3s ease',
                        '&:hover': { 
                          bgcolor: 'rgba(77, 191, 179, 0.1)',
                          transform: 'translateX(4px)',
                          boxShadow: '0 2px 10px rgba(77, 191, 179, 0.2)'
                        } 
                      }}>
                        <ListItemIcon sx={{ 
                          minWidth: { xs: 36, sm: 40 },
                          color: '#4DBFB3'
                        }}>
                          <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={t('headerAccountSettings')} 
                          sx={{ 
                            '& .MuiListItemText-primary': {
                              fontWeight: 600,
                              color: '#333',
                              fontSize: { xs: '0.8rem', sm: '0.9rem' }
                            }
                          }}
                        />
                      </ListItemButton>
                      
                      <ListItemButton sx={{ 
                        borderRadius: { xs: 1.5, sm: 2 },
                        mb: { xs: 0.2, sm: 0.3 },
                        py: { xs: 0.5, sm: 0.6 },
                        px: { xs: 0.8, sm: 1 },
                        transition: 'all 0.3s ease',
                        '&:hover': { 
                          bgcolor: 'rgba(77, 191, 179, 0.1)',
                          transform: 'translateX(4px)',
                          boxShadow: '0 2px 10px rgba(77, 191, 179, 0.2)'
                        } 
                      }}>
                        <ListItemIcon sx={{ 
                          minWidth: { xs: 36, sm: 40 },
                          color: '#4DBFB3'
                        }}>
                          <NotificationsIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={t('notificationsTitle')} 
                          sx={{ 
                            '& .MuiListItemText-primary': {
                              fontWeight: 600,
                              color: '#333',
                              fontSize: { xs: '0.8rem', sm: '0.9rem' }
                            }
                          }}
                        />
                      </ListItemButton> */}
                      
                      <Divider sx={{ my: { xs: 0.8, sm: 1 }, borderColor: 'rgba(77, 191, 179, 0.2)' }} />
                      
                      <ListItemButton 
                        onClick={handleLogout}
                        sx={{ 
                          borderRadius: { xs: 1.5, sm: 2 },
                          color: '#ff6b6b',
                          py: { xs: 0.5, sm: 0.6 },
                          px: { xs: 0.8, sm: 1 },
                          transition: 'all 0.3s ease',
                          '&:hover': { 
                            bgcolor: 'rgba(255, 107, 107, 0.1)',
                            transform: 'translateX(4px)',
                            boxShadow: '0 2px 10px rgba(255, 107, 107, 0.2)'
                          } 
                        }}
                      >
                        <ListItemIcon sx={{ 
                          minWidth: { xs: 36, sm: 40 }, 
                          color: 'inherit' 
                        }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                        </ListItemIcon>
                        <ListItemText 
                          primary={t('headerLogout')} 
                          sx={{ 
                            '& .MuiListItemText-primary': {
                              fontWeight: 600,
                              fontSize: { xs: '0.8rem', sm: '0.9rem' }
                            }
                          }}
                        />
                      </ListItemButton>
                    </List>
                  </Paper>
                )}
              </Box>
            </Box>

            
            {/* Desktop: Notifications and Profile */}
            <Box sx={{ 
              display: { xs: 'none', sm: 'flex' }, 
              alignItems: 'center', 
              gap: { xs: 0.5, sm: 1, md: 2, lg: 3 },
              [currentLanguage === 'ar' ? 'mr' : 'ml']: 'auto',
              order: 3
            }}>
              {/* Translation Button */}
              <IconButton 
                color="inherit" 
                sx={{ 
                  bgcolor: 'transparent', 
                  p: { xs: 0.8, sm: 1, md: 1.5 },
                  borderRadius: { xs: 2, sm: 3 },
                  transition: 'all 0.3s ease',
                  minWidth: { xs: 44, sm: 48, md: 52 },
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: 'rgba(51, 54, 121, 0.1)',
                    transform: 'scale(1.05)',
                    boxShadow: 'none'
                  },
                  '&:focus': {
                    outline: 'none',
                    border: 'none',
                    boxShadow: 'none'
                  },
                  '&:active': {
                    outline: 'none',
                    border: 'none',
                    boxShadow: 'none'
                  }
                }}
                onClick={handleLanguageChange}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography 
                    sx={{ 
                      color: currentLanguage === 'ar' ? '#333679' : '#999',
                      fontSize: { xs: '10px', sm: '11px', md: '12px' },
                      fontWeight: currentLanguage === 'ar' ? 700 : 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    AR
                  </Typography>
                  <Typography 
                    sx={{ 
                      color: '#ccc',
                      fontSize: { xs: '8px', sm: '9px', md: '10px' }
                    }}
                  >
                    /
                  </Typography>
                  <Typography 
                    sx={{ 
                      color: currentLanguage === 'en' ? '#333679' : '#999',
                      fontSize: { xs: '10px', sm: '11px', md: '12px' },
                      fontWeight: currentLanguage === 'en' ? 700 : 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    EN
                  </Typography>
                </Box>
              </IconButton>

              {/* Notification Dropdown with Enhanced Design */}
              {/* <Box ref={notifRef} sx={{ position: 'relative' }}>
                <IconButton 
                  color="inherit" 
                  sx={{ 
                    bgcolor: notifAnchorEl ? 'rgba(77, 191, 179, 0.15)' : 'rgba(77, 191, 179, 0.08)', 
                    p: { xs: 0.8, sm: 1, md: 1.5 },
                    borderRadius: { xs: 2, sm: 3 },
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(77, 191, 179, 0.2)',
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 15px rgba(77, 191, 179, 0.3)'
                    }
                  }}
                  onClick={handleNotifMenuOpen}
                >
                  <Badge 
                    badgeContent={unreadCount} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                        boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)',
                        animation: 'pulse 2s infinite',
                        fontSize: { xs: '8px', sm: '10px' },
                        width: { xs: 16, sm: 18 },
                        height: { xs: 16, sm: 18 },
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(1)' },
                          '50%': { transform: 'scale(1.1)' },
                          '100%': { transform: 'scale(1)' }
                        }
                      }
                    }}
                  >
                    <NotificationsIcon sx={{ 
                      color: '#333679',
                      fontSize: { xs: 20, sm: 22, md: 24 },
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                    }} />
                  </Badge>
                </IconButton> */}
                
                {/* Notification Dropdown Menu */}
                {/* {notifAnchorEl && (
                  <Paper 
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      width: { xs: 280, sm: 320, md: 380 },
                      maxHeight: { xs: 300, sm: 350, md: 450 },
                      overflowY: 'auto',
                      borderRadius: { xs: 2, sm: 3 },
                      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                      zIndex: 10000,
                      p: 0,
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(77, 191, 179, 0.2)',
                      mt: { xs: 1, sm: 2 },
                      overflow: 'hidden',
                      display: 'block',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, #4DBFB3, #333679)',
                        zIndex: 1
                      }
                    }}
                  >
                    <Box sx={{ 
                      p: { xs: 2, sm: 2.5, md: 3 }, 
                      background: 'linear-gradient(135deg, rgba(77, 191, 179, 0.05) 0%, rgba(51, 54, 121, 0.05) 100%)',
                      borderBottom: '1px solid rgba(77, 191, 179, 0.1)'
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 1, sm: 0 }
                      }}>
                        <Typography 
                          variant="h6" 
                          fontWeight={700} 
                          sx={{ 
                            color: '#333679',
                            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
                          }}
                        >
                          {t('notificationsTitle')}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#4DBFB3', 
                            cursor: 'pointer',
                            fontWeight: 600,
                            px: { xs: 1.5, sm: 2 },
                            py: { xs: 0.3, sm: 0.5 },
                            borderRadius: { xs: 1.5, sm: 2 },
                            bgcolor: 'rgba(77, 191, 179, 0.1)',
                            transition: 'all 0.2s',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            textAlign: 'center',
                            '&:hover': { 
                              bgcolor: 'rgba(77, 191, 179, 0.2)',
                              transform: 'scale(1.05)'
                            }
                          }}
                        >
                          {t('notificationsMarkAllRead')}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <List sx={{ p: { xs: 1, sm: 2 } }}>
                      {notifications.map((notification, index) => (
                        <ListItemButton 
                          key={notification.id}
                          sx={{
                            borderRadius: { xs: 1.5, sm: 2 },
                            mb: { xs: 0.5, sm: 1 },
                            p: { xs: 1.5, sm: 2 },
                            bgcolor: !notification.read ? 'rgba(77, 191, 179, 0.08)' : 'transparent',
                            border: !notification.read ? '1px solid rgba(77, 191, 179, 0.2)' : '1px solid transparent',
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                              bgcolor: 'rgba(77, 191, 179, 0.12)',
                              transform: 'translateX(4px)',
                              boxShadow: '0 4px 15px rgba(77, 191, 179, 0.2)'
                            }
                          }}
                        >
                          <Box sx={{ width: '100%', position: 'relative' }}>
                            {!notification.read && (
                              <Box sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: { xs: 6, sm: 8 },
                                height: { xs: 6, sm: 8 },
                                borderRadius: '50%',
                                bgcolor: '#4DBFB3',
                                boxShadow: '0 0 8px rgba(77, 191, 179, 0.6)'
                              }} />
                            )}
                            <Typography 
                              variant="body2" 
                              sx={{ 
                              fontWeight: notification.read ? 500 : 700,
                              color: notification.read ? '#666' : '#333',
                                mb: { xs: 0.2, sm: 0.3 },
                                lineHeight: { xs: 1.3, sm: 1.4 },
                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
                              }}
                            >
                              {notification.text}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                              color: '#999',
                                fontSize: { xs: '10px', sm: '11px' },
                              fontWeight: 500
                              }}
                            >
                              {notification.time}
                            </Typography>
                          </Box>
                        </ListItemButton>
                      ))}
                    </List>
                    
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2,
                      borderTop: '1px solid rgba(77, 191, 179, 0.1)',
                      background: 'rgba(77, 191, 179, 0.02)'
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#4DBFB3',
                          cursor: 'pointer',
                          fontWeight: 600,
                          px: 3,
                          py: 1,
                          borderRadius: 2,
                          bgcolor: 'rgba(77, 191, 179, 0.1)',
                          transition: 'all 0.2s',
                          '&:hover': { 
                            bgcolor: 'rgba(77, 191, 179, 0.2)',
                            transform: 'scale(1.05)'
                          }
                        }}
                      >
                        {t('notificationsViewAll')}
                      </Typography>
                    </Box>
                  </Paper>
                )}
              </Box> */}

              {/* Profile Dropdown */}
              <Box ref={profileRef} sx={{ position: 'relative' }}>
                <IconButton 
                  onClick={handleProfileMenuOpen}
                  sx={{ 
                    p: 0,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -2,
                      left: -2,
                      right: -2,
                      bottom: -2,
                      borderRadius: '50%',
                      background: anchorEl ? 'linear-gradient(45deg, #4DBFB3, #333679)' : 'transparent',
                      zIndex: -1,
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <Avatar 
                    src={userData.avatar}
                    alt={userData.name}
                    sx={{ 
                      width: { xs: 28, sm: 32, md: 36 }, 
                      height: { xs: 28, sm: 32, md: 36 }, 
                      border: { xs: '1px solid white', md: '2px solid white' },
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(14,81,129,0.2)',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 6px 25px rgba(14,81,129,0.4)',
                        border: { xs: '1px solid #4DBFB3', md: '2px solid #4DBFB3' }
                      }
                    }} 
                  />
                </IconButton>
                
                {/* Profile Dropdown Menu */}
                {anchorEl && (
                  <Paper 
                    sx={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      ...(currentLanguage === 'ar' ? { right: 0 } : { left: 0 }),
                      transform: currentLanguage === 'ar' ? 'translateX(100%)' : 'translateX(-100%)',
                      width: { xs: 200, sm: 220, md: 240 },
                      maxHeight: { xs: 350, sm: 380, md: 400 },
                      borderRadius: { xs: 2, sm: 3 },
                      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                      zIndex: 10000,
                      overflow: 'hidden',
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(77, 191, 179, 0.2)',
                      mt: { xs: 1, sm: 2 },
                      display: 'block',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, #4DBFB3, #333679)',
                        zIndex: 1
                      }
                    }}
                  >
                    <Box sx={{ 
                      p: { xs: 2, sm: 2.5, md: 3 }, 
                      textAlign: 'center', 
                      background: 'linear-gradient(135deg, rgba(77, 191, 179, 0.05) 0%, rgba(51, 54, 121, 0.05) 100%)',
                      borderBottom: '1px solid rgba(77, 191, 179, 0.1)'
                    }}>
                      <Avatar 
                        src={userData.avatar}
                        alt={userData.name}
                        sx={{ 
                          width: { xs: 50, sm: 56, md: 62 }, 
                          height: { xs: 50, sm: 56, md: 62 }, 
                          mb: { xs: 1.5, sm: 2 },
                          mx: 'auto',
                          border: { xs: '2px solid #4DBFB3', md: '3px solid #4DBFB3' },
                          boxShadow: '0 4px 20px rgba(77, 191, 179, 0.3)'
                        }} 
                      />
                      <Typography 
                        variant="h6" 
                        fontWeight={700} 
                        sx={{ 
                          color: '#333679', 
                          mb: { xs: 0.2, sm: 0.3 },
                          fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
                        }}
                      >
                        {userData.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                        color: '#4DBFB3', 
                        fontWeight: 600,
                          mb: { xs: 0.2, sm: 0.3 },
                          fontSize: { xs: '0.8rem', sm: '0.875rem' }
                        }}
                      >
                        {userData.role}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                        color: '#666',
                          fontSize: { xs: '10px', sm: '11px', md: '12px' },
                        fontWeight: 500
                        }}
                      >
                        {userData.email}
                      </Typography>
                    </Box>
                    
                    <List sx={{ p: { xs: 1, sm: 2 } }}>
                      {/* <ListItemButton sx={{ 
                        borderRadius: { xs: 1.5, sm: 2 },
                        mb: { xs: 0.2, sm: 0.3 },
                        py: { xs: 0.5, sm: 0.6 },
                        px: { xs: 0.8, sm: 1 },
                        transition: 'all 0.3s ease',
                        '&:hover': { 
                          bgcolor: 'rgba(77, 191, 179, 0.1)',
                          transform: 'translateX(4px)',
                          boxShadow: '0 2px 10px rgba(77, 191, 179, 0.2)'
                        } 
                      }}>
                        <ListItemIcon sx={{ 
                          minWidth: { xs: 36, sm: 40 },
                          color: '#4DBFB3'
                        }}>
                          <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={t('headerAccountSettings')} 
                          sx={{ 
                            '& .MuiListItemText-primary': {
                              fontWeight: 600,
                              color: '#333',
                              fontSize: { xs: '0.8rem', sm: '0.9rem' }
                            }
                          }}
                        />
                      </ListItemButton>
                      
                      <ListItemButton sx={{ 
                        borderRadius: { xs: 1.5, sm: 2 },
                        mb: { xs: 0.2, sm: 0.3 },
                        py: { xs: 0.5, sm: 0.6 },
                        px: { xs: 0.8, sm: 1 },
                        transition: 'all 0.3s ease',
                        '&:hover': { 
                          bgcolor: 'rgba(77, 191, 179, 0.1)',
                          transform: 'translateX(4px)',
                          boxShadow: '0 2px 10px rgba(77, 191, 179, 0.2)'
                        } 
                      }}>
                        <ListItemIcon sx={{ 
                          minWidth: { xs: 36, sm: 40 },
                          color: '#4DBFB3'
                        }}>
                          <NotificationsIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={t('notificationsTitle')} 
                          sx={{ 
                            '& .MuiListItemText-primary': {
                              fontWeight: 600,
                              color: '#333',
                              fontSize: { xs: '0.8rem', sm: '0.9rem' }
                            }
                          }}
                        />
                      </ListItemButton> */}
                      
                      <Divider sx={{ my: { xs: 0.8, sm: 1 }, borderColor: 'rgba(77, 191, 179, 0.2)' }} />
                      
                      <ListItemButton 
                        onClick={handleLogout}
                        sx={{ 
                          borderRadius: { xs: 1.5, sm: 2 },
                          color: '#ff6b6b',
                          py: { xs: 0.5, sm: 0.6 },
                          px: { xs: 0.8, sm: 1 },
                          transition: 'all 0.3s ease',
                          '&:hover': { 
                            bgcolor: 'rgba(255, 107, 107, 0.1)',
                            transform: 'translateX(4px)',
                            boxShadow: '0 2px 10px rgba(255, 107, 107, 0.2)'
                          } 
                        }}
                      >
                        <ListItemIcon sx={{ 
                          minWidth: { xs: 36, sm: 40 }, 
                          color: 'inherit' 
                        }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                        </ListItemIcon>
                        <ListItemText 
                          primary={t('headerLogout')} 
                          sx={{ 
                            '& .MuiListItemText-primary': {
                              fontWeight: 600,
                              fontSize: { xs: '0.8rem', sm: '0.9rem' }
                            }
                          }}
                        />
                      </ListItemButton>
                    </List>
                  </Paper>
                )}
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
        </Box>
        {/* Main Dashboard Content */}
        <Box component="main" sx={{ 
          flexGrow: 1, 
          p: { xs: 1, sm: 2, md: 3, lg: 4 }, 
          pt: { xs: 1, md: 0 }, 
          width: '100%',
          height: '100%',
          overflow: 'auto',
          maxWidth: '100%',
          '&::-webkit-scrollbar': {
            width: { xs: '4px', sm: '6px', md: '8px' },
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.3)',
            },
          },
        }}>
          <Box sx={{ 
            pb: { xs: 4, sm: 6, md: 8, lg: 10 },
            px: { xs: 0.5, sm: 1, md: 0 },
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden'
          }}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;
