import { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Avatar, LinearProgress, useTheme, Chip, Skeleton, Card, CardContent, IconButton, Tabs, Tab } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { alpha } from '@mui/material/styles';
import {
  School as SchoolIcon,
  Event as EventIcon,
  MenuBook as MenuBookIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  VideoLibrary as VideoLibraryIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Lock as LockIcon,
  Style as FlashcardsIcon,
  Quiz as QBIcon,
  OpenInNew as OpenIcon,
  Assessment as PerformanceIcon,
  Pause as FreezeIcon,
  Assignment as SelfAssessmentIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboard.service';
import { contentAPI } from '../../services/content.service';
import { courseAPI } from '../../services/courseService';
import assessmentService from '../../services/assessment.service';
import accountFreezeService from '../../services/accountFreeze.service';
import AccountFreezeModal from '../account/AccountFreezeModal';
// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};
const StudentDashboard = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedLessons: 0
  });
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [upcomingLectures, setUpcomingLectures] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [instructorsLoading, setInstructorsLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [enrollmentStatus, setEnrollmentStatus] = useState({
    questionBank: false,
    flashcards: false
  });
  const [freezeModalOpen, setFreezeModalOpen] = useState(false);
  const [freezeStatus, setFreezeStatus] = useState(null);
  useEffect(() => {
    loadDashboardData();
    loadUserName();
    checkEnrollmentStatus();
    loadFreezeStatus();
  }, []);

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

  const loadFreezeStatus = async () => {
    try {
      const response = await accountFreezeService.getFreezeStatus();
      if (response.success) {
        setFreezeStatus(response.data);
      }
    } catch (error) {
      console.error('Error loading freeze status:', error);
    }
  };
  const loadUserName = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        // Try different possible name fields in order of preference
        let name = '';
        if (user.first_name && user.last_name) {
          name = `${user.first_name} ${user.last_name}`;
        } else if (user.first_name) {
          name = user.first_name;
        } else if (user.name) {
          name = user.name;
        } else if (user.username) {
          name = user.username;
        } else if (user.email) {
          name = user.email.split('@')[0];
        } else {
          name = t('commonStudent');
        }
        setUserName(name);
      } else {
        setUserName(t('commonStudent'));
      }
    } catch (error) {
      console.error('Error loading user name:', error);
      setUserName(t('commonStudent'));
    }
  };
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // {t('dashboardLoadingDataInParallel')}
      const [
        statsData,
        coursesData,
        achievementsData,
        activityData,
        meetingsData
      ] = await Promise.all([
        dashboardService.getStudentStats(),
        dashboardService.getStudentCourses(),
        dashboardService.getAchievements(),
        dashboardService.getRecentActivity(),
        dashboardService.getUpcomingMeetings()
      ]);
      // {t('dashboardUsingRealDataFromAPI')}
      const enhancedStats = {
        completedLessons: statsData.completedLessons || 0,
        enrolledCourses: statsData.enrolledCourses || 0
      };
      setStats(enhancedStats);
      // Set loading state for courses
      setCoursesLoading(true);
      // Process and validate course data from API
      const processedCourses = coursesData.length > 0 ? await Promise.all(coursesData.map(async (course) => {
        try {
          console.log(`Fetching content for course ${course.id}:`, course.title);
          // Fetch questions and flashcards count for each course
          const [questionsData, flashcardsData] = await Promise.all([
            contentAPI.getCourseQuestionBank(course.id).catch((err) => {
              console.log(`No questions found for course ${course.id}:`, err.message);
              return { results: [] };
            }),
            contentAPI.getCourseFlashcards(course.id).catch((err) => {
              console.log(`No flashcards found for course ${course.id}:`, err.message);
              return { results: [] };
            })
          ]);
          const questionCount = questionsData?.results?.length || questionsData?.length || 0;
          const flashcardCount = flashcardsData?.results?.length || flashcardsData?.length || 0;
          console.log(`Course ${course.id} - Questions: ${questionCount}, Flashcards: ${flashcardCount}`);
          return {
            ...course,
            progress: Math.min(Math.max(course.progress || 0, 0), 100),
            total_lessons: course.total_lessons || course.totalLessons || 0,
            completed_lessons: course.completed_lessons || course.completedLessons || Math.floor(((course.progress || 0) / 100) * (course.total_lessons || course.totalLessons || 0)),
            duration: course.duration || course.total_duration || `0${t('studentDashboardMinutes')}`,
            question_count: questionCount,
            flashcard_count: flashcardCount
          };
        } catch (error) {
          console.error(`Error fetching content for course ${course.id}:`, error);
          return {
            ...course,
            progress: Math.min(Math.max(course.progress || 0, 0), 100),
            total_lessons: course.total_lessons || course.totalLessons || 0,
            completed_lessons: course.completed_lessons || course.completedLessons || Math.floor(((course.progress || 0) / 100) * (course.total_lessons || course.totalLessons || 0)),
            duration: course.duration || course.total_duration || `0${t('studentDashboardMinutes')}`,
            question_count: 0,
            flashcard_count: 0
          };
        }
      })) : [];
      setCourses(processedCourses);
      setCoursesLoading(false);
      
      // Load modules and instructors for the first course if available
      if (processedCourses.length > 0) {
        loadModules(processedCourses[0].id);
        loadInstructors(processedCourses[0].id);
      }
      
      // {t('dashboardAddingMockAchievementData')}
      const mockAchievements = achievementsData.length > 0 ? achievementsData : [
        {
          id: 1,
          title: t('dashboardFirstLesson'),
          description: t('dashboardCompleteFirstLesson'),
          color: 'primary',
          icon: <MenuBookIcon />,
          progress: 100,
          reward: `10 ${t('dashboardPoints')}`
        },
        {
          id: 2,
          title: t('dashboardPersistentStudent'),
          description: t('dashboardComplete5ConsecutiveLessons'),
          color: 'success',
          icon: <CheckCircleIcon />,
          progress: 60,
          reward: `25 ${t('dashboardPoints')}`
        },
        {
          id: 3,
          title: t('dashboardExcellentInTests'),
          description: t('dashboardGet90PercentInTest'),
          color: 'warning',
          icon: <QuizIcon />,
          progress: 0,
          reward: `50 ${t('dashboardPoints')}`
        }
      ];
      setAchievements(mockAchievements);
      setRecentActivity(activityData);
      setUpcomingMeetings(meetingsData);
      // Set empty array for lectures if no data from API
      setUpcomingLectures([]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleCourseContinue = (courseId, moduleId = null) => {
    const url = moduleId 
      ? `/student/my-courses?courseId=${courseId}&moduleId=${moduleId}`
      : `/student/my-courses?courseId=${courseId}`;
    navigate(url);
  };
  const handleCourseView = (courseId) => {
    navigate(`/courses/${courseId}`);
  };
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  const getDayName = (date) => {
    const days = [t('dashboardSunday'), t('dashboardMonday'), t('dashboardTuesday'), t('dashboardWednesday'), t('dashboardThursday'), t('dashboardFriday'), t('dashboardSaturday')];
    return days[date.getDay()];
  };
  const loadInstructors = async (courseId) => {
    try {
      setInstructorsLoading(true);
      console.log('Loading instructors for course ID:', courseId);
      const courseData = await courseAPI.getCourseById(courseId);
      console.log('Course data:', courseData);
      
      // Extract instructors from course data
      let courseInstructors = [];
      if (courseData.instructors && Array.isArray(courseData.instructors)) {
        courseInstructors = courseData.instructors;
      } else if (courseData.teachers && Array.isArray(courseData.teachers)) {
        courseInstructors = courseData.teachers;
      } else if (courseData.instructor) {
        courseInstructors = Array.isArray(courseData.instructor) ? courseData.instructor : [courseData.instructor];
      }
      
      console.log('Course instructors found:', courseInstructors);
      // Filter out admin
      const filteredInstructors = (courseInstructors || []).filter((ins) => {
        const name = (ins?.name || ins?.username || ins?.first_name || '').toString().trim().toLowerCase();
        return name !== 'admin' && name !== '';
      });
      
      // If no instructors found from API, use mock data for demonstration
      if (filteredInstructors.length === 0) {
        console.log('No instructors found in API response, using mock data');
        const mockInstructors = [
          {
            id: 1,
            first_name: 'Dr. Ahmed',
            last_name: 'Hassan',
            username: 'ahmed_hassan',
            email: 'ahmed@example.com'
          },
          {
            id: 2,
            first_name: 'Prof. Sarah',
            last_name: 'Johnson',
            username: 'sarah_johnson',
            email: 'sarah@example.com'
          },
          {
            id: 3,
            first_name: 'Dr. Mohammed',
            last_name: 'Ali',
            username: 'mohammed_ali',
            email: 'mohammed@example.com'
          }
        ];
        setInstructors(mockInstructors);
      } else {
        setInstructors(filteredInstructors);
      }
    } catch (error) {
      console.error('Error loading instructors:', error);
      // Fallback to mock instructors on error
      const mockInstructors = [
        {
          id: 1,
          first_name: 'Dr. Ahmed',
          last_name: 'Hassan',
          username: 'ahmed_hassan',
          email: 'ahmed@example.com'
        },
        {
          id: 2,
          first_name: 'Prof. Sarah',
          last_name: 'Johnson',
          username: 'sarah_johnson',
          email: 'sarah@example.com'
        },
        {
          id: 3,
          first_name: 'Dr. Mohammed',
          last_name: 'Ali',
          username: 'mohammed_ali',
          email: 'mohammed@example.com'
        }
      ];
      setInstructors(mockInstructors);
    } finally {
      setInstructorsLoading(false);
    }
  };

  const loadModules = async (courseId) => {
    try {
      setModulesLoading(true);
      console.log('Loading modules for course ID:', courseId);
      
      // Try to get modules with course ID first
      let modulesData;
      try {
        modulesData = await contentAPI.getModules(courseId);
      } catch (error) {
        console.log('Failed to get modules with course ID, trying without course filter');
        // If that fails, try to get all modules
        try {
          const response = await fetch('/api/content/modules/');
          modulesData = await response.json();
        } catch (fetchError) {
          console.error('Failed to fetch modules:', fetchError);
          throw error; // Throw original error
        }
      }
      console.log('Raw modules data:', modulesData);
      console.log('Modules data type:', typeof modulesData);
      console.log('Modules data keys:', Object.keys(modulesData || {}));
      
      // Handle different response formats
      let modules = [];
      if (Array.isArray(modulesData)) {
        modules = modulesData;
      } else if (modulesData && modulesData.results) {
        modules = modulesData.results;
      } else if (modulesData && modulesData.data) {
        modules = modulesData.data;
      }
      
      // Filter to show only main modules (not submodules)
      const mainModules = modules.filter(module => !module.submodule);
      
      console.log('All modules:', modules);
      console.log('Main modules only:', mainModules);
      
      // If no main modules found, add some mock data for testing
      if (mainModules.length === 0) {
        console.log('No main modules found, adding mock data for testing');
        const mockModules = [
          {
            id: 1,
            name: 'Introduction to Biology',
            title: 'Introduction to Biology',
            is_active: true,
            order: 1,
            description: 'Basic concepts of biology',
            submodule: false // Explicitly mark as main module
          },
          {
            id: 2,
            name: 'Cell Structure',
            title: 'Cell Structure',
            is_active: true,
            order: 2,
            description: 'Understanding cell components',
            submodule: false // Explicitly mark as main module
          },
          {
            id: 3,
            name: 'Genetics',
            title: 'Genetics',
            is_active: false,
            order: 3,
            description: 'Introduction to genetics',
            submodule: false // Explicitly mark as main module
          }
        ];
        setModules(mockModules);
      } else {
        setModules(mainModules);
      }
    } catch (error) {
      console.error('Error loading modules:', error);
      console.error('Error details:', error.response?.data);
      setModules([]);
    } finally {
      setModulesLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset instructors when changing tabs
    setInstructors([]);
    // Load modules and instructors for the selected course
    if (courses[newValue]) {
      console.log('Tab changed to course:', courses[newValue].title, 'ID:', courses[newValue].id);
      loadModules(courses[newValue].id);
      loadInstructors(courses[newValue].id);
    }
  };
  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} lg={3} key={item}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
      >
        {/* Header Section */}
        <Box sx={{ px: 1 }}>
          <motion.div variants={item}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 2,
                color: 'text.primary'
              }}
            >
              {t('dashboardWelcome')}، {userName}! 👋
            </Typography>
          </motion.div>
        </Box>
        
        {/* Dashboard Cards - 6 uniform cards */}
        <Box sx={{ mb: 5, px: 1 }}>
          <Box>
            {/* Top row - first 3 cards */}
            <Grid container spacing={2} sx={{ mb: 0.25, '& .MuiGrid-root': { paddingTop: '0 !important' } }}>
              {/* Flashcards Card */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <motion.div variants={item}>
            <Card
              sx={{
                    height: 80,
                    borderRadius: 2,
                background: 'white',
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
                },
                transition: 'all 0.3s ease',
                cursor: enrollmentStatus.flashcards ? 'pointer' : 'not-allowed'
              }}
              onClick={() => {
                if (enrollmentStatus.flashcards) {
                  navigate('/student/flashcards/filter');
                }
              }}
            >
                  <CardContent sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                          width: 45,
                          height: 45,
                          borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                          background: '#2196f3',
                        color: 'white',
                        '& svg': {
                            fontSize: '1.5rem'
                        }
                      }}
                    >
                        <FlashcardsIcon />
                    </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}>
                          {t('navFlashcards')}
            </Typography>
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                          {t('dashboardStudyWithFlashcards')}
                    </Typography>
                  </Box>
                </Box>
                    <Box sx={{ color: enrollmentStatus.flashcards ? '#4caf50' : '#ccc' }}>
                      {enrollmentStatus.flashcards ? <OpenIcon /> : <LockIcon />}
                    </Box>
                  </CardContent>
                </Card>
          </motion.div>
            </Grid>
            {/* Question Bank Card */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <motion.div variants={item}>
                <Card
                          sx={{
                    height: 80,
                    borderRadius: 2,
                    background: 'white',
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
                    },
                    transition: 'all 0.3s ease',
                    cursor: enrollmentStatus.questionBank ? 'pointer' : 'not-allowed'
                  }}
                  onClick={() => {
                    if (enrollmentStatus.questionBank) {
                      navigate('/student/questionbank/filter');
                    }
                  }}
                >
                  <CardContent sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 45,
                          height: 45,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#2196f3',
                          color: 'white',
                          '& svg': {
                            fontSize: '1.5rem'
                          }
                        }}
                      >
                        <QBIcon />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}>
                          {t('navQuestionBank')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                          {t('dashboardPracticeQuestions')}
                      </Typography>
                    </Box>
                  </Box>
                    <Box sx={{ color: enrollmentStatus.questionBank ? '#4caf50' : '#ccc' }}>
                      {enrollmentStatus.questionBank ? <OpenIcon /> : <LockIcon />}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
            {/* Simulation Exam Card */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <motion.div variants={item}>
                <Card
                          sx={{
                    height: 80,
                    borderRadius: 2,
                    background: 'white',
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
                    },
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                >
                  <CardContent sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 45,
                          height: 45,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#f44336',
                          color: 'white',
                          '& svg': {
                            fontSize: '1.5rem'
                          }
                        }}
                      >
                        <SelfAssessmentIcon />
                      </Box>
                  <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}>
                          {t('dashboardSelfAssessment')}
                    </Typography>
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                          {t('dashboardTestYourKnowledge')}
                      </Typography>
                    </Box>
                  </Box>
                    <Box sx={{ color: '#ccc' }}>
                      <LockIcon />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
            </Grid>
            </Grid>
            {/* Bottom row - last 3 cards */}
          <Grid container spacing={2} sx={{ '& .MuiGrid-root': { paddingTop: '0 !important' } }}>
              {/* Schedule Card */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <motion.div variants={item}>
            <Card
              sx={{
                    height: 80,
                    borderRadius: 2,
                background: 'white',
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
                },
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => {
                // Navigate to schedule with first course if available
                if (courses.length > 0) {
                  navigate(`/student/schedule?courseId=${courses[0].id}`);
                } else {
                  navigate('/student/schedule');
                }
              }}
            >
                  <CardContent sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                          width: 45,
                          height: 45,
                          borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                          background: '#2196f3',
                        color: 'white',
                        '& svg': {
                            fontSize: '1.5rem'
                        }
                      }}
                    >
                        <ScheduleIcon />
                    </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}>
                          {t('dashboardSchedule')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                          {t('dashboardManageYourTime')}
                    </Typography>
                  </Box>
                </Box>
                    <Box sx={{ color: '#4caf50' }}>
                      <OpenIcon />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
            {/* Performance Card */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <motion.div variants={item}>
                <Card
                          sx={{
                    height: 80,
                    borderRadius: 2,
                    background: 'white',
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
                    },
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                >
                  <CardContent sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 45,
                          height: 45,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#2196f3',
                          color: 'white',
                          '& svg': {
                            fontSize: '1.5rem'
                          }
                        }}
                      >
                        <PerformanceIcon />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}>
                          {t('dashboardPerformance')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                          {t('dashboardTrackProgress')}
                      </Typography>
                    </Box>
                  </Box>
                    <Box sx={{ color: '#ccc' }}>
                      <LockIcon />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
            {/* Freeze Account Card */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <motion.div variants={item}>
                <Card
                  sx={{
                    height: 80,
                    borderRadius: 2,
                    background: 'white',
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    '&:hover': {
                      transform: freezeStatus?.has_used_freeze ? 'none' : 'translateY(-2px)',
                      boxShadow: freezeStatus?.has_used_freeze ? '0 2px 12px rgba(0, 0, 0, 0.08)' : '0 6px 20px rgba(0, 0, 0, 0.12)',
                    },
                    transition: 'all 0.3s ease',
                    cursor: freezeStatus?.has_used_freeze ? 'not-allowed' : 'pointer',
                    opacity: freezeStatus?.has_used_freeze ? 0.6 : 1
                  }}
                  onClick={() => {
                    if (!freezeStatus?.has_used_freeze) {
                      setFreezeModalOpen(true);
                    }
                  }}
                >
                  <CardContent sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 45,
                          height: 45,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: freezeStatus?.has_used_freeze ? '#ccc' : '#dc3545',
                          color: 'white',
                          '& svg': {
                            fontSize: '1.5rem'
                          }
                        }}
                      >
                        <FreezeIcon />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: freezeStatus?.has_used_freeze ? '#ccc' : 'text.secondary', fontWeight: 500, mb: 0.5 }}>
                          {t('dashboardFreeze')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: freezeStatus?.has_used_freeze ? '#999' : '#666', fontSize: '0.75rem' }}>
                          {freezeStatus?.has_used_freeze ? t('freezeModal.alreadyUsed') || 'تم استخدام التجميد من قبل' : t('dashboardPauseSubscription')}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ color: freezeStatus?.has_used_freeze ? '#ccc' : '#dc3545' }}>
                      {freezeStatus?.has_used_freeze ? <LockIcon /> : <FreezeIcon />}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
            </Grid>
          </Box>
        </Box>
        {/* Main Content with Tabs */}
        <motion.div variants={item}>
          <Card sx={{
            width: '100%',
            background: 'white',
            borderRadius: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            {/* Tab Header */}
            <Box sx={{
              background: 'linear-gradient(135deg, #333679 0%, #4DBFB3 50%, #333679 100%)',
              borderRadius: '16px 16px 0 0',
              p: 0
            }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    minHeight: 60,
                    minWidth: 'auto',
                    px: 2,
                    '&.Mui-selected': {
                      color: 'white',
                      fontWeight: 700
                    }
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'white',
                    height: 3
                  },
                  '& .MuiTabs-scrollButtons': {
                    color: 'white'
                  }
                }}
              >
                {courses.length > 0 ? courses.map((course, index) => (
                  <Tab
                    key={course.id}
                    icon={<SchoolIcon />}
                    label={course.title}
                    iconPosition="start"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      maxWidth: 200,
                      '& .MuiTab-wrapper': {
                        flexDirection: 'row',
                        gap: 1
                      }
                    }}
                  />
                )) : (
                <Tab
                  icon={<SchoolIcon />}
                  label={t('studentDashboardMyCourses')}
                  iconPosition="start"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                />
                )}
                {/* <Tab
                  icon={<CalendarIcon />}
                  label={t('studentDashboardLectureSchedule')}
                  iconPosition="start"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                /> */}
              </Tabs>
            </Box>
            {/* Tab Content */}
            <Box sx={{ height: 600, overflow: 'auto' }}>
              {/* Course Content */}
                  {coursesLoading || modulesLoading ? (
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[1, 2, 3].map((item) => (
                        <Skeleton key={item} variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
                      ))}
                  </Box>
                    </Box>
                  ) : courses.length > 0 ? (
                  <Box sx={{
                  p: 3, 
                  background: 'linear-gradient(135deg, #333679 0%, #4DBFB3 50%, #333679 100%)', 
                  minHeight: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5
                }}>
                  {/* Modules List */}
                  {modules.length > 0 ? modules.map((module, index) => {
                    const colors = ['#4285F4', '#00BFA5', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
                    const color = colors[index % colors.length];
                    
                    // Debug: Log instructors for this module
                    console.log('Instructors for module:', module.name, instructors);
                    
                    return (
                      <Card 
                        key={module.id} 
                        sx={{
                          background: 'white',
                          borderRadius: 2,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          border: 'none',
                          p: 2,
                          height: 120,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
                          }
                        }}
                        onClick={() => handleCourseContinue(courses[activeTab]?.id, module.id)}
                      >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* Left side - Subject info */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        {/* Module Icon */}
                        <Box sx={{
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          background: color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          <SchoolIcon sx={{ fontSize: 24 }} />
                        </Box>
                        
                        {/* Module Title and Progress */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700, 
                            color: color,
                            mb: 1
                          }}>
                            {module.name || module.title || `Module ${module.id}`}
                          </Typography>
                          
                          {/* Progress Bars Side by Side */}
                          <Box sx={{ display: 'flex', gap: 4 }}>
                            {/* Questions Progress */}
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ mb: 1 }}>
                                <Box sx={{ 
                                  width: '100%', 
                                  height: 6, 
                                  backgroundColor: '#E0E0E0', 
                              borderRadius: 3,
                                  overflow: 'hidden',
                                  mb: 0.5
                                }}>
                                  <Box sx={{ 
                                    width: '0.14%', // 4/2786 * 100
                                    height: '100%', 
                                    backgroundColor: '#E0E0E0',
                                    borderRadius: 3
                                  }} />
                                </Box>
                                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                                  {t('dashboardQuestionsTagged', { count: 0 })}
                                </Typography>
                              </Box>
                            </Box>
                            
                            {/* Lessons Progress */}
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ mb: 1 }}>
                                <Box sx={{ 
                                  width: '100%', 
                                  height: 6, 
                                  backgroundColor: '#E0E0E0', 
                                  borderRadius: 3,
                                  overflow: 'hidden',
                                  mb: 0.5
                                }}>
                                  <Box sx={{ 
                                    width: '0%', // 0/380 * 100
                                    height: '100%', 
                                    backgroundColor: '#E0E0E0',
                                    borderRadius: 3
                                  }} />
                                </Box>
                                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                                  {t('dashboardLessonsCompleted', { count: 0 })}
                                </Typography>
                                  </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      
                      {/* Right side - Content Experts */}
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        minWidth: 200
                      }}>
                        <Typography variant="caption" sx={{ 
                          color: '#999', 
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          mb: 1
                        }}>
                          {t('dashboardContentExperts')}
                        </Typography>
                        
                        {/* Instructor Avatars and Arrow */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          {instructorsLoading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#f0f0f0' }} />
                              <Typography variant="caption" sx={{ color: '#666' }}>
                                {t('commonLoading')}
                              </Typography>
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', gap: -1 }}>
                              {instructors && instructors.length > 0 ? (
                                instructors
                                  .filter((ins) => {
                                    const n = (ins?.name || ins?.username || ins?.first_name || '').toString().trim().toLowerCase();
                                    return n !== 'admin' && n !== '';
                                  })
                                  .slice(0, 3)
                                  .map((instructor, index) => (
                                  <Avatar key={instructor.id || index} sx={{ 
                                    width: 32, 
                                    height: 32, 
                                    border: '2px solid white',
                                    ml: -1,
                                    '&:first-of-type': { ml: 0 },
                                    backgroundColor: '#6A5ACD'
                                  }}>
                                    {instructor.first_name ? instructor.first_name.charAt(0).toUpperCase() : 
                                     instructor.username ? instructor.username.charAt(0).toUpperCase() : 
                                     instructor.name ? instructor.name.charAt(0).toUpperCase() : 'I'}
                                  </Avatar>
                                ))
                              ) : (
                                <>
                                  <Avatar sx={{ 
                                    width: 32, 
                                    height: 32, 
                                    border: '2px solid white',
                                    ml: -1,
                                    '&:first-of-type': { ml: 0 },
                                    backgroundColor: '#6A5ACD'
                                  }}>
                                    I
                                  </Avatar>
                                  <Avatar sx={{ 
                                    width: 32, 
                                    height: 32, 
                                    border: '2px solid white',
                                    ml: -1,
                                    backgroundColor: '#6A5ACD'
                                  }}>
                                    N
                                  </Avatar>
                                  <Avatar sx={{ 
                                    width: 32, 
                                    height: 32, 
                                    border: '2px solid white',
                                    ml: -1,
                                    backgroundColor: '#6A5ACD'
                                  }}>
                                    S
                                  </Avatar>
                                </>
                              )}
                            </Box>
                          )}
                          <ChevronRightIcon sx={{ color: '#ccc', fontSize: 16 }} />
                        </Box>
                        
                        <Typography variant="body2" sx={{ 
                          color: '#333', 
                          fontSize: '0.875rem',
                          fontWeight: 500
                        }}>
                          {instructorsLoading ? (
                            t('dashboardLoadingInstructors')
                          ) : instructors && instructors.length > 0 ? 
                            (() => {
                              const filtered = instructors.filter((ins) => {
                                const n = (ins?.name || ins?.username || ins?.first_name || '').toString().trim().toLowerCase();
                                return n !== 'admin' && n !== '';
                              });
                              const names = filtered.slice(0, 3).map(instructor => {
                                const name = instructor.first_name || instructor.username || instructor.name || t('commonInstructor');
                                return name;
                              }).join(', ');
                              return names + (filtered.length > 3 ? ` ${t('commonAnd')} ${t('commonMore')}` : '');
                            })() :
                            t('commonInstructors')
                          }
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                    );
                  }) : (
                  <Box sx={{
                    textAlign: 'center',
                      py: 6,
                    px: 3,
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                              borderRadius: 3,
                    border: '2px dashed #e0e0e0'
                  }}>
                    <SchoolIcon sx={{
                        fontSize: 64,
                      color: '#ccc',
                      mb: 2,
                      opacity: 0.6
                    }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                        {t('dashboardNoModulesAvailable')}
                                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('dashboardNoModulesDescription')}
                                    </Typography>
                                  </Box>
                  )}
                    </Box>
                  ) : (
                <Box sx={{ p: 3 }}>
                    <Box sx={{
                      textAlign: 'center',
                      py: 6,
                      px: 3,
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                      borderRadius: 3,
                      border: '2px dashed #e0e0e0'
                    }}>
                      <SchoolIcon sx={{
                        fontSize: 64,
                        color: '#ccc',
                        mb: 2,
                        opacity: 0.6
                      }} />
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                        {t('studentDashboardNoEnrolledCourses')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                        {t('studentDashboardNoEnrolledCoursesDescription')}
                      </Typography>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<AddIcon />}
                        sx={{
                          borderRadius: 3,
                          background: 'linear-gradient(45deg, #333679, #1a6ba8)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1a6ba8, #333679)',
                          }
                        }}
                        onClick={() => navigate('/courses')}
                      >
                        {t('studentDashboardBrowseCourses')}
                      </Button>
                    </Box>
                </Box>
              )}
              {/* Calendar Tab - جدول المحاضرات والواجبات */}
              {/* {activeTab === 1 && (
                <Box sx={{ p: 3 }}>
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" fontWeight={700} sx={{ color: '#333' }}>
                      جدول المحاضرات والواجبات
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        sx={{ color: '#666' }}
                        onClick={() => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
                      >
                        <ChevronLeftIcon />
                      </IconButton>
                      <Typography variant="body1" sx={{ minWidth: 120, textAlign: 'center', color: '#333', fontWeight: 600 }}>
                        {currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                      </Typography>
                      <IconButton
                        size="small"
                        sx={{ color: '#666' }}
                        onClick={() => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
                      >
                        <ChevronRightIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    overflow: 'hidden',
                    background: 'white'
                  }}>
                    <Box sx={{
                      display: 'grid',
                      gridTemplateColumns: '80px repeat(4, 1fr)',
                      borderBottom: '1px solid #e0e0e0',
                      background: '#f8f9fa'
                    }}>
                      <Box sx={{
                        p: 2,
                        borderRight: '1px solid #e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                          الأيام
                        </Typography>
                      </Box>
                      {[t('dashboardTuesday'), t('dashboardWednesday'), t('dashboardThursday'), t('dashboardFriday')].map((day, index) => (
                        <Box key={day} sx={{
                          p: 2,
                          borderRight: index < 3 ? '1px solid #e0e0e0' : 'none',
                          textAlign: 'center'
                        }}>
                          <Typography variant="body2" fontWeight={600} color="text.secondary">
                            {day}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {10 + index}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    {['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00'].map((time, timeIndex) => (
                      <Box key={time} sx={{
                        display: 'grid',
                        gridTemplateColumns: '80px repeat(4, 1fr)',
                        borderBottom: timeIndex < 6 ? '1px solid #e0e0e0' : 'none',
                        minHeight: 60
                      }}>
                        <Box sx={{
                          p: 2,
                          borderRight: '1px solid #e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#f8f9fa'
                        }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            {time}
                          </Typography>
                        </Box>
                        {[0, 1, 2, 3].map((dayIndex) => (
                          <Box
                            key={dayIndex}
                            sx={{
                              p: 1,
                              borderRight: dayIndex < 3 ? '1px solid #e0e0e0' : 'none',
                              position: 'relative',
                              minHeight: 60
                            }}
                          >
                            {upcomingLectures
                              .filter(lecture => {
                                const lectureTime = lecture.time.split(' - ')[0];
                                const lectureDay = lecture.day;
                                const dayNames = [t('dashboardTuesday'), t('dashboardWednesday'), t('dashboardThursday'), t('dashboardFriday')];
                                return lectureTime === time && lectureDay === dayNames[dayIndex];
                              })
                              .map((lecture) => (
                                <Box
                                  key={lecture.id}
                                  sx={{
                                    position: 'absolute',
                                    top: 4,
                                    left: 4,
                                    right: 4,
                                    bottom: 4,
                                    background: 'rgba(14, 81, 129, 0.08)',
                                    borderRadius: 1,
                                    p: 1,
                                    color: '#333679',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                    border: '1px solid rgba(14, 81, 129, 0.1)'
                                  }}
                                >
                                  <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}>
                                    {lecture.title}
                                  </Typography>
                                  <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.6rem', lineHeight: 1.2 }}>
                                    {lecture.time}
                                  </Typography>
                                </Box>
                              ))}
                          </Box>
                        ))}
                      </Box>
                    ))}
                  </Box>
                  {upcomingLectures.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <CalendarIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        لا توجد محاضرات أو واجبات مجدولة
                      </Typography>
                      <Button
                        variant="contained"
                        sx={{
                          background: '#4DBFB3',
                          '&:hover': { background: '#f0a8a0' }
                        }}
                        onClick={() => navigate('/student/calendar')}
                      >
                        عرض التقويم الكامل
                      </Button>
                    </Box>
                  )}
                </Box>
              )} */}
            </Box>
          </Card>
        </motion.div>
      </motion.div>
      
      {/* Account Freeze Modal */}
      <AccountFreezeModal
        open={freezeModalOpen}
        onClose={() => setFreezeModalOpen(false)}
        onSuccess={(freezeData) => {
          setFreezeStatus(freezeData);
          setFreezeModalOpen(false);
        }}
        freezeStatus={freezeStatus}
      />
    </Box>
  );
};
export default StudentDashboard;
