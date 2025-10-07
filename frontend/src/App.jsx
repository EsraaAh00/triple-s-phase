import { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import {
  ThemeProvider as MuiThemeProvider,
  StyledEngineProvider,
  GlobalStyles,
  Box,
  CircularProgress,
  createTheme
} from '@mui/material';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ArticleProvider } from './contexts/ArticleContext';
import themeConfig, { globalStyles } from './theme/index';
import { HelmetProvider } from 'react-helmet-async';

// Create rtl cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
  prepend: true,
});

// Import Tajawal font
import '@fontsource/tajawal/300.css';
import '@fontsource/tajawal/400.css';
import '@fontsource/tajawal/500.css';
import '@fontsource/tajawal/700.css';

// Using @mui/icons-material for all icons
// No need for additional icon libraries

console.log('App component is being loaded...');

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import HomePage from './pages/HomePage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Courses from './pages/courses/Courses';
import CourseDetail from './pages/courses/CourseDetail';
import CreateCourse from './pages/courses/CreateCourse';
import EditCourse from './pages/courses/EditCourse';
import CreateUnit from './pages/courses/units/CreateUnit';
import Units from './pages/courses/units/Units';
import EditUnit from './pages/courses/units/EditUnit';
import UnitDetail from './pages/courses/units/UnitDetail';
import Lessons from './pages/courses/lessons/Lessons';
import LessonDetail from './pages/courses/lessons/LessonDetail';
import LessonForm from './pages/courses/lessons/LessonForm';

// Quiz Components
import Profile from './pages/profile/Profile';
import TeacherMyCourses from './pages/teacher/MyCourses';
import StudentMyCourses from './pages/student/MyCourses';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import DashboardRedirect from './pages/DashboardRedirect';


// Dashboard Pages
import StudentDashboard from './components/dashboards/StudentDashboard';
import TeacherDashboard from './components/dashboards/TeacherDashboard';
import CourseTracking from './pages/student/CourseTracking';


// Meeting Components
import TeacherMeetings from './pages/teacher/meetings/TeacherMeetings';
import StudentMeetings from './pages/student/meetings/StudentMeetings';
import LiveMeeting from './pages/teacher/meetings/LiveMeeting';
import StudentLiveMeeting from './pages/student/meetings/StudentLiveMeeting';

// Article Components
import ArticlesPage from './pages/articles/ArticlesPage';
import ArticleDetail from './pages/articles/ArticleDetail';
import ArticlesList from './pages/teacher/articles/ArticlesList';
import CreateArticle from './pages/teacher/articles/CreateArticle';
import EditArticle from './pages/teacher/articles/EditArticle';
import CartPage from './pages/cart/CartPage';
import PaymentPage from './pages/payment/PaymentPage';
import AboutAcademyDetail from './components/home/AboutAcademyDetail';

// Question Bank Components
import QuestionBankPage from './pages/teacher/QuestionBankPage';
import FlashcardsPage from './pages/teacher/FlashcardsPage';

// Public Home Page Component (accessible to all users)
const PublicHomePage = ({ children }) => {
  return children; // Always show the home page regardless of auth status
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading, getUserRole } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute - user:', user);
  console.log('ProtectedRoute - allowedRoles:', allowedRoles);
  console.log('ProtectedRoute - current path:', location.pathname);

  if (loading) {
    console.log('ProtectedRoute - Loading auth state...');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login');
    // Redirect to login, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required and user doesn't have any of them
  if (allowedRoles.length > 0) {
    const userRole = getUserRole();
    console.log('ProtectedRoute - User role:', userRole);

    // Check if user role matches any of the allowed roles
    // Handle both 'instructor' and 'teacher' as equivalent
    const hasAllowedRole = allowedRoles.some(allowedRole => {
      if (allowedRole === 'teacher' && userRole === 'instructor') return true;
      if (allowedRole === 'instructor' && userRole === 'teacher') return true;
      return allowedRole === userRole;
    });

    if (!hasAllowedRole) {
      console.log(`ProtectedRoute - User role ${userRole} not in allowed roles:`, allowedRoles);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  console.log('ProtectedRoute - Access granted');
  return children;
};

// Public Route Component (only for non-authenticated users)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, getUserRole } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If user is authenticated, redirect to dashboard based on role
  if (isAuthenticated) {
    const userRole = getUserRole();
    let redirectPath = '/student/dashboard'; // Default to student dashboard

    // Handle both 'instructor' and 'teacher' as equivalent
    if (userRole === 'instructor' || userRole === 'teacher') {
      redirectPath = '/teacher/dashboard';
    }

    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// Main App component
const AppContent = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('darkMode', !isDarkMode);
  };

  // Check for saved theme preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
  }, []);

  // Apply theme based on dark mode
  const appTheme = useMemo(
    () =>
      createTheme({
        ...themeConfig,
        palette: {
          ...themeConfig.palette,
          mode: isDarkMode ? 'dark' : 'light',
          background: {
            ...themeConfig.palette.background,
            default: isDarkMode ? '#121212' : '#F8FAFF',
            paper: isDarkMode ? '#1E1E1E' : '#FFFFFF',
          },
        },
      }),
    [isDarkMode]
  );

  useEffect(() => {
    console.log('App component mounted');
    setIsInitialized(true);

    return () => {
      console.log('App component unmounting');
    };
  }, []);

  console.log('App component rendering...');

  if (!isInitialized) {
    console.log('App not yet initialized, showing loading state');
    return (
      <CacheProvider value={cacheRtl}>
        <MuiThemeProvider theme={appTheme}>
          <div dir="rtl" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: appTheme.palette.background.default,
            fontFamily: 'Tajawal, sans-serif',
            direction: 'rtl'
          }}>
            <div>جاري تحميل التطبيق...</div>
          </div>
        </MuiThemeProvider>
      </CacheProvider>
    );
  }

  return (
    <HelmetProvider>
      <CacheProvider value={cacheRtl}>
        <StyledEngineProvider injectFirst>
          <MuiThemeProvider theme={appTheme}>
            <CssBaseline />
            <GlobalStyles styles={globalStyles} />
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              autoHideDuration={4000}
              style={{ direction: 'rtl' }}
              classes={{
                containerRoot: 'snackbar-container',
              }}
              dense
            >
              <div className="App" dir="rtl" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                <Routes>
                  {/* Public Routes - Only accessible when not authenticated */}
                  <Route path="/login" element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } />
                  <Route path="/register" element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  } />

                  {/* Public Routes - Accessible to all */}
                  <Route path="/" element={
                    <PublicHomePage>
                      <HomePage />
                    </PublicHomePage>
                  } />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/courses/:id" element={<CourseDetail />} />
                  <Route path="/articles" element={<ArticlesPage />} />
                  <Route path="/articles/:slug" element={<ArticleDetail />} />
                  <Route path="/about-academy-detail" element={<AboutAcademyDetail />} />
                  {/* Store Routes */}
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/payment/:courseId" element={<PaymentPage />} />


                  {/* Protected Routes - Student */}
                  <Route path="/student/*" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <MainLayout toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode}>
                        <Routes>
                          <Route index element={<StudentDashboard />} />
                          <Route path="dashboard" element={<StudentDashboard />} />
                          <Route path="courses" element={<StudentMyCourses />} />
                          <Route path="my-courses" element={<StudentMyCourses />} />
                          {/* مسارات الامتحان الشامل للطالب - DISABLED */}
                          <Route path="my-courses/:courseId/exam" element={<div style={{padding: '20px', textAlign: 'center'}}><h2>Exam functionality has been disabled</h2></div>} />
                          <Route path="my-courses/:courseId/exam/taking" element={<div style={{padding: '20px', textAlign: 'center'}}><h2>Exam functionality has been disabled</h2></div>} />
                          <Route path="my-courses/:courseId/exam/result" element={<div style={{padding: '20px', textAlign: 'center'}}><h2>Exam functionality has been disabled</h2></div>} />
                          <Route path="meetings" element={<StudentMeetings />} />
                          <Route path="meetings/live/:meetingId" element={<StudentLiveMeeting />} />
                          <Route path="settings" element={<Profile />} />
                        </Routes>
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  {/* Course Tracking - Standalone Page */}
                  <Route path="/student/courses/:id/tracking" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <CourseTracking />
                    </ProtectedRoute>
                  } />

                  {/* Protected Routes - Teacher */}
                  <Route path="/teacher/*" element={
                    <ProtectedRoute allowedRoles={['teacher', 'instructor']}>
                      <MainLayout toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode}>
                        <Routes>
                          <Route index element={<TeacherDashboard />} />
                          <Route path="dashboard" element={<TeacherDashboard />} />
                          <Route path="courses" element={<div>إدارة الدورات</div>} />
                          <Route path="my-courses" element={<TeacherMyCourses />} />
                          <Route path="courses/new" element={<CreateCourse />} />
                          <Route path="courses/:id/edit" element={<EditCourse />} />
                          <Route path="courses/:courseId/units" element={<Units />} />
                          <Route path="courses/:courseId/units/new" element={<CreateUnit />} />
                          <Route path="courses/:courseId/units/:unitId" element={<UnitDetail />} />
                          <Route path="courses/:courseId/units/:unitId/edit" element={<EditUnit />} />
                          <Route path="courses/:courseId/units/:unitId/lessons" element={<Lessons />} />
                          <Route path="courses/:courseId/units/:unitId/lessons/create" element={<LessonForm />} />
                          <Route path="courses/:courseId/units/:unitId/lessons/:lessonId/edit" element={<LessonForm isEdit />} />
                          <Route path="courses/:courseId/units/:unitId/lessons/:lessonId" element={<LessonDetail />} />
                          <Route path="question-bank" element={<QuestionBankPage />} />
                          <Route path="flashcards" element={<FlashcardsPage />} />                  
                          <Route path="students" element={<div>الطلاب</div>} />
                          <Route path="reports" element={<div>التقارير</div>} />
                          <Route path="settings" element={<Profile />} />
                          {/* Quizzes routes - DISABLED */}
                          <Route path="quizzes" element={<div style={{padding: '20px', textAlign: 'center'}}><h2>Quiz functionality has been disabled</h2></div>} />
                          <Route path="quizzes/create" element={<div style={{padding: '20px', textAlign: 'center'}}><h2>Quiz functionality has been disabled</h2></div>} />
                          <Route path="quizzes/:quizId/edit" element={<div style={{padding: '20px', textAlign: 'center'}}><h2>Quiz functionality has been disabled</h2></div>} />
                          <Route path="quizzes/:quizId" element={<div style={{padding: '20px', textAlign: 'center'}}><h2>Quiz functionality has been disabled</h2></div>} />
                          {/* مسارات الامتحانات الشاملة - DISABLED */}
                          <Route path="exams" element={<div style={{padding: '20px', textAlign: 'center'}}><h2>Exam functionality has been disabled</h2></div>} />
                          <Route path="exams/create" element={<div style={{padding: '20px', textAlign: 'center'}}><h2>Exam functionality has been disabled</h2></div>} />
                          <Route path="exams/:examId" element={<div style={{padding: '20px', textAlign: 'center'}}><h2>Exam functionality has been disabled</h2></div>} />
                          <Route path="exams/:examId/edit" element={<div style={{padding: '20px', textAlign: 'center'}}><h2>Exam functionality has been disabled</h2></div>} />
                          <Route path="meetings" element={<TeacherMeetings />} />
                          <Route path="meetings/live/:meetingId" element={<LiveMeeting />} />
                          {/* Articles routes */}
                          <Route path="articles" element={<ArticlesList />} />
                          <Route path="articles/create" element={<CreateArticle />} />
                          <Route path="articles/:id/edit" element={<EditArticle />} />
                        </Routes>
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  {/* Common Protected Routes */}
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Profile />
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  {/* Dashboard Redirect - Handles role-based redirection */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardRedirect />
                    </ProtectedRoute>
                  } />

                  {/* Redirect old dashboard routes to new structure */}
                  <Route path="/dashboard/student" element={<Navigate to="/student/dashboard" replace />} />
                  <Route path="/dashboard/teacher" element={<Navigate to="/teacher/dashboard" replace />} />

                  {/* 404 Not Found */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </SnackbarProvider>
          </MuiThemeProvider>
        </StyledEngineProvider>
      </CacheProvider>
    </HelmetProvider>
  );
};

// Main App wrapper with AuthProvider and ArticleProvider
const App = () => {
  return (
    <AuthProvider>
      <ArticleProvider>
        <AppContent />
      </ArticleProvider>
    </AuthProvider>
  );
};

export default App;
