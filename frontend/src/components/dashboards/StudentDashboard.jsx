import { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Avatar, LinearProgress, useTheme, Chip, Skeleton, Card, CardContent, IconButton, Tabs, Tab, Dialog, DialogContent } from '@mui/material';
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
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboard.service';
import { contentAPI } from '../../services/content.service';
import CourseDetails from '../courses/CourseDetails';

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
  const [achievements, setAchievements] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [upcomingLectures, setUpcomingLectures] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetailsOpen, setCourseDetailsOpen] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadDashboardData();
    loadUserName();
  }, []);

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

  const handleCourseContinue = (courseId) => {
    navigate(`/student/my-courses?courseId=${courseId}`);
  };

  const handleCourseView = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const handleCourseDetails = (course) => {
    setSelectedCourse(course);
    setCourseDetailsOpen(true);
  };

  const handleCloseCourseDetails = () => {
    setCourseDetailsOpen(false);
    setSelectedCourse(null);
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
        <Box sx={{ mb: 5, px: 1 }}>
          <motion.div variants={item}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(45deg, #fff, #90caf9)'
                  : 'linear-gradient(45deg, #663399, #42a5f5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}
            >
              {t('dashboardWelcome')}، {userName}! 👋
            </Typography>
          </motion.div>
          <motion.div variants={item}>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 4,
                '&::before': {
                  content: '""',
                  display: 'block',
                  width: 24,
                  height: 3,
                  background: theme.palette.primary.main,
                  borderRadius: 2
                }
              }}
            >
              {t('dashboardThisIsOverviewOfYourAcademicPerformance')}
            </Typography>
          </motion.div>
        </Box>

        {/* Stats Cards - مطابقة لشكل المعلم */}
        <Box sx={{ mb: 5, px: 1 }}>
          <Grid container spacing={2} sx={{ '& .MuiGrid-root': { paddingTop: '0 !important' } }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <motion.div variants={item}>
                <Card
                  sx={{
                    height: 100,
                    borderRadius: 3,
                    background: 'white',
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
                    },
                    transition: 'all 0.3s ease',
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
                          background: '#9c27b0',
                          color: 'white',
                          '& svg': {
                            fontSize: '1.5rem'
                          }
                        }}
                      >
                        <SchoolIcon />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}>
                          {t('studentDashboardEnrolledCourses')}
                        </Typography>
                        <Typography variant="h4" fontWeight={700} sx={{ color: '#333', lineHeight: 1 }}>
                          {stats.enrolledCourses || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <motion.div variants={item}>
                <Card
                  sx={{
                    height: 100,
                    borderRadius: 3,
                    background: 'white',
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
                    },
                    transition: 'all 0.3s ease',
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
                          background: '#4caf50',
                          color: 'white',
                          '& svg': {
                            fontSize: '1.5rem'
                          }
                        }}
                      >
                        <MenuBookIcon />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}>
                          {t('studentDashboardCompletedLessons')}
                        </Typography>
                        <Typography variant="h4" fontWeight={700} sx={{ color: '#333', lineHeight: 1 }}>
                          {stats.completedLessons || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>



            </Grid>
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
              background: 'linear-gradient(135deg, #333679, #1a6ba8)',
              borderRadius: '16px 16px 0 0',
              p: 0
            }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  '& .MuiTab-root': {
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1rem',
                    minHeight: 60,
                    '&.Mui-selected': {
                      color: 'white',
                      fontWeight: 700
                    }
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'white',
                    height: 3
                  }
                }}
              >
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
              {/* My Courses Tab */}
              {activeTab === 0 && (
                <Box sx={{ p: 3 }}>
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: '#333679' }}>
                        {t('studentDashboardActiveCourses')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('studentDashboardTrackProgress')}
                      </Typography>
                    </Box>
                  </Box>

                  {coursesLoading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[1, 2, 3].map((item) => (
                        <Skeleton key={item} variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
                      ))}
                    </Box>
                  ) : courses.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {courses.map((course, index) => (
                        <motion.div key={course.id} variants={item}>
                          <Card
                            sx={{
                              borderRadius: 3,
                              background: 'white',
                              border: '1px solid #e0e0e0',
                              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer',
                              '&:hover': {
                                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
                                transform: 'translateY(-2px)',
                                borderColor: '#333679'
                              }
                            }}
                            onClick={() => handleCourseContinue(course.id)}
                          >
                            <CardContent sx={{ p: 3 }}>
                              {/* Header with course info */}
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  {/* Course icon */}
                                  <Box
                                    sx={{
                                      width: 48,
                                      height: 48,
                                      borderRadius: 2,
                                      background: 'linear-gradient(135deg, #333679, #1a6ba8)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0
                                    }}
                                  >
                                    <SchoolIcon sx={{ color: 'white', fontSize: 22 }} />
                                  </Box>

                                  {/* Course title and progress */}
                                  <Box>
                                    <Typography variant="h6" fontWeight={600} sx={{ color: '#333', fontSize: '1.1rem', mb: 0.5 }}>
                                      {course.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem' }}>
                                      {course.completed_lessons || 0} {t('studentDashboardOf')} {course.total_lessons || 0} {t('studentDashboardLessonsCompleted')}
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* Progress percentage */}
                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography variant="h6" fontWeight={700} sx={{ color: '#333679', fontSize: '1.2rem' }}>
                                    {Math.round(course.progress || 0)}%
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                                    {t('studentDashboardCompleted')}
                                  </Typography>
                                </Box>
                              </Box>

                              {/* Progress bar */}
                              <Box sx={{ mb: 2 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(course.progress || 0, 100)}
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: '#f0f0f0',
                                    '& .MuiLinearProgress-bar': {
                                      background: 'linear-gradient(90deg, #333679, #1a6ba8)',
                                      borderRadius: 4
                                    }
                                  }}
                                />
                              </Box>

                              {/* Action buttons */}
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<VisibilityIcon />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCourseDetails(course);
                                    }}
                                    sx={{
                                      borderRadius: 2,
                                      px: 2,
                                      py: 0.5,
                                      fontSize: '0.8rem',
                                      fontWeight: 600,
                                      textTransform: 'none',
                                      borderColor: '#333679',
                                      color: '#333679',
                                      '&:hover': {
                                        borderColor: '#1a6ba8',
                                        color: '#1a6ba8',
                                        background: 'rgba(51, 54, 121, 0.04)'
                                      }
                                    }}
                                  >
                                    {t('studentDashboardDetails')}
                                  </Button>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    sx={{
                                      background: 'linear-gradient(45deg, #333679, #1a6ba8)',
                                      borderRadius: 2,
                                      px: 2,
                                      py: 0.5,
                                      fontSize: '0.8rem',
                                      fontWeight: 600,
                                      textTransform: 'none',
                                      '&:hover': {
                                        background: 'linear-gradient(45deg, #1a6ba8, #333679)',
                                      }
                                    }}
                                  >
                                    {t('studentDashboardContinue')}
                                  </Button>
                                </Box>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </Box>
                  ) : (
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
                  )}

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

      {/* Course Details Dialog */}
      <Dialog
        open={courseDetailsOpen}
        onClose={handleCloseCourseDetails}
        maxWidth="md"
        fullWidth
        fullScreen={false}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            height: '70vh',
            maxHeight: '70vh',
            width: '80vw',
            maxWidth: '800px',
            margin: 2,
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogContent sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedCourse && (
            <CourseDetails
              course={selectedCourse}
              onClose={handleCloseCourseDetails}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default StudentDashboard;
