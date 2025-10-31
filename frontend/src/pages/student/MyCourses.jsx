import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Button,
  Chip,
  Fade,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  Checkbox,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Breadcrumbs,
  Link,
  Avatar
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { 
  School as SchoolIcon, 
  PlayCircleOutline as PlayIcon,
  CheckCircle as CheckCircleIcon,
  SentimentSatisfiedAlt,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  VideoLibrary as VideoIcon,
  PictureAsPdf as PdfIcon,
  GridView as BitesIcon,
  Download as DownloadIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  Quiz as QuizIcon,
  Psychology as PsychologyIcon,
  PlayCircle as PlayCircleIcon,
  Assignment as AssignmentIcon,
  QuestionAnswer as QuestionAnswerIcon,
  HourglassEmpty
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { styled, keyframes } from '@mui/system';

// Keyframes for animations
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;
import { courseAPI } from '../../services/api.service';
import { courseAPI as courseService } from '../../services/courseService';
import { contentAPI } from '../../services/content.service';
// import { quizAPI } from '../../services/quiz.service';

// Module Lessons Component
const ModuleLessons = ({ moduleId, lessons = [], course = null, moduleProgressData = {} }) => {
  const [localLessons, setLocalLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If lessons are passed as props (from the new API), use them directly
  // Otherwise, fetch them individually (fallback)
  useEffect(() => {
    if (lessons.length > 0) {
      // Ensure each lesson has the correct module_id
      const lessonsWithModuleId = lessons.map(lesson => ({
        ...lesson,
        module_id: lesson.module_id || moduleId
      }));
      setLocalLessons(lessonsWithModuleId);
    } else {
      fetchLessons();
    }
  }, [moduleId, lessons.length]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const lessonsResponse = await contentAPI.getLessons({ moduleId });
      const lessonsData = lessonsResponse.results || lessonsResponse || [];
      setLocalLessons(lessonsData);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setLocalLessons([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#fafafa', px: 3, py: 2, textAlign: 'center' }}>
        <CircularProgress size={20} />
        <Typography variant="caption" sx={{ ml: 1 }}>
          {t('commonLoading')} {t('lessonsTitle')}...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      background: '#fafafa',
      px: 3, 
      py: 2,
      borderTop: '1px solid #e0e0e0'
    }}>
      {/* Resources Section - Only show if course has resources */}
      {course?.resources && course.resources.length > 0 && (
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          py: 1.5,
          px: 0,
          borderBottom: '1px solid #e0e0e0'
        }}>
          {/* Checkbox */}
          <Box sx={{ mr: 2 }}>
            <Checkbox 
              size="small" 
              checked={false}
              sx={{
                color: '#666',
                '&.Mui-checked': {
                  color: '#4caf50'
                }
              }}
            />
          </Box>

          {/* Document Icon */}
          <Box sx={{ mr: 2 }}>
            <Box sx={{
              width: 20,
              height: 20,
              color: '#999',
              fontSize: '16px'
            }}>
              📄
            </Box>
          </Box>

          {/* PDF Badge */}
          <Box sx={{ mr: 2 }}>
            <Box sx={{
              px: 1,
              py: 0.5,
              borderRadius: 0.5,
              background: '#f5f5f5',
              color: '#666',
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'uppercase',
              border: '1px solid #e0e0e0'
            }}>
              PDF
            </Box>
          </Box>

          {/* Resources Title */}
          <Box sx={{ flex: 1, mr: 2 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 500, 
                color: '#333',
                fontSize: '14px'
              }}
            >
              Resources ({course?.resources?.length || 0})
            </Typography>
          </Box>

          {/* Download Action */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#999',
                fontSize: '12px'
              }}
            >
              Download PDF
            </Typography>
            
            {/* Arrow Icon */}
            <Box sx={{ 
              color: '#999',
              fontSize: '16px',
              cursor: 'pointer'
            }}>
              →
            </Box>
          </Box>
        </Box>
      )}

      {/* Lessons */}
      {localLessons.map((lesson, index) => (
        <Box 
          key={lesson.id} 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            py: 1.5,
            px: 0,
            borderBottom: '1px solid #e0e0e0',
            '&:last-child': {
              borderBottom: 'none'
            }
          }}
        >
          {/* Checkbox - Left side */}
          <Box sx={{ mr: 2 }}>
            {(() => {
              // Check lesson completion status from multiple sources
              let isCompleted = false;
              
              // First, check moduleProgressData if available
              const progressData = moduleProgressData[moduleId || lesson.module_id];
              if (progressData && progressData.lessonsProgress) {
                isCompleted = progressData.lessonsProgress[lesson.id] === true || progressData.lessonsProgress[lesson.id] === 1;
              }
              
              // Fallback to lesson's own data
              if (!isCompleted) {
                isCompleted = lesson.completed === true || lesson.completed === 1 || 
                              lesson.is_completed === true || lesson.is_completed === 1;
              }
              
              return (
            <Checkbox 
              size="small" 
                  checked={isCompleted}
              sx={{
                color: '#666',
                '&.Mui-checked': {
                  color: '#4caf50'
                }
              }}
            />
              );
            })()}
          </Box>

          {/* Lesson Number */}
          <Box sx={{ mr: 2, minWidth: '20px' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#999',
                fontSize: '14px',
                fontWeight: 400
              }}
            >
              {index + 1}
            </Typography>
          </Box>

          {/* Content Type Badge */}
          <Box sx={{ mr: 2 }}>
            {(() => {
              // Get lesson type from multiple possible fields
              const lessonType = lesson.content_type || lesson.lesson_type || lesson.type || '';
              const hasVideo = lesson.video_url || lesson.bunny_video_id || lesson.bunny_video_url;
              const hasContent = lesson.content && lesson.content.trim().length > 0;
              
              // Determine final type: prefer video if exists, then article if content exists, else use lessonType
              const finalType = hasVideo ? 'video' : (hasContent ? 'article' : lessonType || 'lesson');
              
              return (
            <Box sx={{
              px: 1,
              py: 0.5,
              borderRadius: 0.5,
                  background: finalType === 'article' || finalType === 'pdf' || finalType === 'document'
                ? '#f5f5f5'
                    : finalType === 'video' || finalType === 'video_lesson'
                ? '#e8f5e8'
                : '#f5f5f5',
                  color: finalType === 'article' || finalType === 'pdf' || finalType === 'document'
                ? '#666'
                    : finalType === 'video' || finalType === 'video_lesson'
                ? '#4caf50'
                : '#666',
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'uppercase',
              border: '1px solid #e0e0e0'
            }}>
                  {finalType === 'article' || finalType === 'pdf' || finalType === 'document' ? 'PDF' : 
                   finalType === 'video' || finalType === 'video_lesson' ? 'VIDEO' : 'LESSON'}
            </Box>
              );
            })()}
          </Box>

          {/* Lesson Title with Module Info */}
          <Box sx={{ flex: 1, mr: 2 }}>
              <Typography 
              variant="body2" 
                sx={{ 
                fontWeight: 500, 
                color: '#333',
                fontSize: '14px',
                mb: 0.5
                }}
              >
                {lesson.title}
              </Typography>
            {lesson.module_name && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#4DBFB3',
                  fontSize: '11px',
                  fontWeight: 500,
                  background: '#e8f5e8',
                  px: 1,
                  py: 0.25,
                  borderRadius: 0.5
                }}
              >
                {lesson.module_name}
              </Typography>
            )}
          </Box>

          {/* Duration and Action */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {lesson.duration && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                  color: '#999',
                  fontSize: '12px'
                  }}
                >
                {lesson.duration}
                </Typography>
            )}
            
            {/* Arrow Icon - Clickable to navigate to specific lesson */}
            <Box 
              sx={{ 
                color: '#999',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#4DBFB3',
                  transform: 'translateX(2px)'
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (course?.id && lesson?.id) {
                  // Use lesson.module_id if available (for submodules), otherwise use moduleId
                  const targetModuleId = lesson.module_id || moduleId;
                  navigate(`/student/courses/${course.id}/tracking?tab=lessons&moduleId=${targetModuleId}&lessonId=${lesson.id}`);
                }
              }}
            >
              →
          </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

// Course Detail Page Component
const CourseDetailPage = ({ course, onBack }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(0);
  const [modules, setModules] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedSubModules, setExpandedSubModules] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [courseInstructors, setCourseInstructors] = useState([]);
  const [moduleProgressData, setModuleProgressData] = useState({});

  useEffect(() => {
    fetchCourseContent();
    fetchCourseInstructors();
    fetchCourseProgress();
  }, [course.id]);

  // Handle module filtering from URL parameter
  useEffect(() => {
    const moduleId = searchParams.get('moduleId');
    if (moduleId) {
      setSelectedModuleId(moduleId);
      // Auto-expand the selected module
      setExpandedModules(prev => ({
        ...prev,
        [moduleId]: true
      }));
    } else {
      setSelectedModuleId(null);
    }
  }, [searchParams]);

  const fetchCourseInstructors = async () => {
    try {
      // Try to load instructors similarly to dashboard
      const courseData = await courseService.getCourseById(course.id);
      let instructors = [];
      if (courseData?.instructors && Array.isArray(courseData.instructors)) {
        instructors = courseData.instructors;
      } else if (courseData?.teachers && Array.isArray(courseData.teachers)) {
        instructors = courseData.teachers;
      } else if (courseData?.instructor) {
        instructors = Array.isArray(courseData.instructor) ? courseData.instructor : [courseData.instructor];
      }
      // filter out admin
      const filtered = (instructors || []).filter((ins) => {
        const name = (ins?.name || ins?.username || ins?.first_name || '').toString().trim().toLowerCase();
        return name !== 'admin' && name !== '';
      });
      setCourseInstructors(filtered);
    } catch (error) {
      // fallback to what exists on the course prop
      const fallback = Array.isArray(course.instructors) ? course.instructors
        : Array.isArray(course.teachers) ? course.teachers
        : (course.instructor ? [{ name: course.instructor }] : []);
      const filtered = (fallback || []).filter((ins) => {
        const name = (ins?.name || ins?.username || ins?.first_name || '').toString().trim().toLowerCase();
        return name !== 'admin' && name !== '';
      });
      setCourseInstructors(filtered);
    }
  };

  const fetchCourseProgress = async () => {
    try {
      // Fetch progress data from tracking API (same as CourseTracking.jsx)
      const response = await courseAPI.getCourseTrackingData(course.id);
      if (response && response.course && response.course.modules) {
        // Create a map of module progress data
        const progressMap = {};
        response.course.modules.forEach(module => {
          // Create lessonsProgress map for main module lessons
          const lessonsProgressMap = (module.lessons || []).reduce((acc, lesson) => {
            acc[lesson.id] = lesson.completed === true || lesson.completed === 1;
            return acc;
          }, {});
          
          // Store progress data for main module
          progressMap[module.id] = {
            progress: module.progress,
            completed_lessons: module.completed_lessons,
            total_lessons: module.total_lessons,
            lessonsProgress: lessonsProgressMap
          };
          
          // Note: Submodules might not be in the API response separately
          // They might be included in the main module's lessons
          // If API returns submodules separately, we would process them here
        });
        setModuleProgressData(progressMap);
        console.log('Module progress data loaded:', progressMap);
      }
    } catch (error) {
      console.error('Error fetching course progress:', error);
      // Set empty object on error
      setModuleProgressData({});
    }
  };

  const fetchCourseContent = async () => {
    try {
      setLoading(true);
      
      // Fetch modules with lessons using the new API
      const modulesResponse = await contentAPI.getCourseModulesWithLessons(course.id);
      console.log('Modules response:', modulesResponse);
      const modulesData = modulesResponse.modules || [];
      
      // Organize modules: separate main modules and sub modules
      const mainModules = modulesData.filter(module => !module.submodule);
      const subModules = modulesData.filter(module => module.submodule);
      
      // Group sub modules under their parent modules
      const organizedModules = mainModules.map(mainModule => {
        const relatedSubModules = subModules.filter(subModule => subModule.submodule === mainModule.id);
        
        return {
          ...mainModule,
          submodules: relatedSubModules
        };
      });
      setModules(organizedModules);

      // Fetch questions using the new API
      const questionsResponse = await contentAPI.getCourseQuestionBank(course.id);
      console.log('Questions response:', questionsResponse);
      
      // Extract questions from modules structure and add module info
      const allQuestions = [];
      const questionsModules = questionsResponse.modules || [];
      questionsModules.forEach(module => {
        if (module.lessons) {
          module.lessons.forEach(lesson => {
            if (lesson.questions) {
              // Add module information to each question
              const questionsWithModule = lesson.questions.map(question => ({
                ...question,
                module_name: module.name,
                module_id: module.id
              }));
              allQuestions.push(...questionsWithModule);
            }
          });
        }
      });
      setQuestions(allQuestions);

      // Fetch flashcards using the new API
      const flashcardsResponse = await contentAPI.getCourseFlashcards(course.id);
      console.log('Flashcards response:', flashcardsResponse);
      
      // Extract flashcards from modules structure and add module info
      const allFlashcards = [];
      const flashcardsModules = flashcardsResponse.modules || [];
      flashcardsModules.forEach(module => {
        if (module.lessons) {
          module.lessons.forEach(lesson => {
            if (lesson.flashcards) {
              // Add module information to each flashcard
              const flashcardsWithModule = lesson.flashcards.map(flashcard => ({
                ...flashcard,
                module_name: module.name,
                module_id: module.id
              }));
              allFlashcards.push(...flashcardsWithModule);
            }
          });
        }
      });
      setFlashcards(allFlashcards);

    } catch (error) {
      console.error('Error fetching course content:', error);
      // Set empty arrays on error
      setModules([]);
      setQuestions([]);
      setFlashcards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleToggle = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleSubModuleToggle = (subModuleId) => {
    setExpandedSubModules(prev => ({
      ...prev,
      [subModuleId]: !prev[subModuleId]
    }));
  };

  const filteredModules = modules.filter(module => {
    if (!module || !module.title) return false;
    
    // If a specific module is selected, only show that module
    if (selectedModuleId) {
      return module.id == selectedModuleId;
    }
    
    // Otherwise, apply search filter
    return module.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredQuestions = questions.filter(question => {
    if (!question || !question.question) return false;
    
    // If a specific module is selected, only show questions from that module
    if (selectedModuleId) {
      return question.module_id == selectedModuleId;
    }
    
    // Otherwise, apply search filter
    return question.question.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredFlashcards = flashcards.filter(flashcard => {
    if (!flashcard) return false;
    
    // If a specific module is selected, only show flashcards from that module
    if (selectedModuleId) {
      return flashcard.module_id == selectedModuleId;
    }
    
    // Otherwise, apply search filter
    const front = flashcard.front?.toLowerCase() || '';
    const back = flashcard.back?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return front.includes(search) || back.includes(search);
  });

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #333679 0%, #4DBFB3 50%, #333679 100%)'
    }}>
      {/* Header */}
      <Box sx={{ 
        background: 'transparent',
        color: 'white', 
        py: 1.5,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="xl">
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ 
            mb: 1, 
            color: 'rgba(255,255,255,0.9)',
            '& .MuiBreadcrumbs-separator': {
              color: 'rgba(255,255,255,0.6)'
            }
          }}>
            <Link 
              color="inherit" 
              href="#" 
              onClick={onBack}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                textDecoration: 'none',
                px: 1.5,
                py: 0.5,
                borderRadius: 1.5,
                background: 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                fontSize: '0.875rem',
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }
              }}
            >
              <HomeIcon sx={{ fontSize: 18 }} />
              {t('navHome')}
            </Link>
            <Typography 
              color="inherit" 
              sx={{ 
                px: 1.5, 
                py: 0.5, 
                borderRadius: 1.5,
                background: 'rgba(255,255,255,0.15)',
                fontWeight: 600,
                fontSize: '0.875rem'
              }}
            >
              {course.title}
            </Typography>
          </Breadcrumbs>

          {/* Module Filter Inline with Title (chip next to course title) */}

          {/* Course Title and Stats */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: 2, 
            mb: 1,
            position: 'relative',
            zIndex: 2
          }}>
            <Box sx={{ 
              width: 50, 
              height: 50, 
              borderRadius: 2, 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -1,
                left: -1,
                right: -1,
                bottom: -1,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #4DBFB3, #333679, #4DBFB3)',
                zIndex: -1,
                opacity: 0.7
              }
            }}>
              <SchoolIcon sx={{ fontSize: 24, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography 
                  variant="h5" 
                  fontWeight={800} 
                  sx={{ 
                    mb: 0.5,
                    background: 'linear-gradient(45deg, #ffffff 0%, #f0f9ff 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    fontSize: { xs: '1.25rem', md: '1.5rem' }
                  }}
                >
                  {course.title}
                </Typography>
                {selectedModuleId && (
                  <Chip
                    size="small"
                    label={(() => {
                      const selectedModule = modules.find(m => m.id == selectedModuleId);
                      return selectedModule ? (selectedModule.title || selectedModule.name) : t('commonModule');
                    })()}
                    onDelete={() => {
                      setSelectedModuleId(null);
                      navigate(`/student/my-courses?courseId=${course.id}`);
                    }}
                    sx={{
                      height: 24,
                      color: 'white',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.8)' }
                    }}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {questions.length > 0 && (
                  <Chip 
                    icon={<QuestionAnswerIcon sx={{ fontSize: 14 }} />} 
                    label={`${questions.length} ${t('assessmentQuestion')}`} 
                    size="small"
                    sx={{ 
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '11px',
                      height: 24,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }
                    }}
                  />
                )}
                {modules.length > 0 && (() => {
                  // Compute lessons count and duration either for selected module or for all modules
                  const computeStats = () => {
                    if (selectedModuleId) {
                      const mod = modules.find(m => m.id == selectedModuleId);
                      if (!mod) return { lessons: 0, totalSeconds: 0 };
                      const main = mod.lessons ? mod.lessons.length : 0;
                      const sub = (mod.submodules || []).reduce((sum, sm) => sum + (sm.lessons ? sm.lessons.length : 0), 0);
                      // Prefer module.video_duration (assumed seconds) if present, else sum lesson duration_minutes
                      const durationSeconds = mod.video_duration || 0;
                      const durationMinutesFromLessons = (mod.lessons || []).reduce((s, l) => s + (l.duration_minutes || 0), 0) +
                        (mod.submodules || []).reduce((s, sm) => s + (sm.lessons || []).reduce((ss, l) => ss + (l.duration_minutes || 0), 0), 0);
                      const totalSeconds = durationSeconds || (durationMinutesFromLessons * 60);
                      return { lessons: main + sub, totalSeconds };
                    }
                    // Course totals
                    const lessonsTotal = modules.reduce((sum, m) => sum + (m.lessons ? m.lessons.length : 0) + (m.submodules || []).reduce((ss, sm) => ss + (sm.lessons ? sm.lessons.length : 0), 0), 0);
                    const totalSeconds = modules.reduce((sum, m) => {
                      const modSeconds = m.video_duration || 0;
                      const modMinutes = (m.lessons || []).reduce((s, l) => s + (l.duration_minutes || 0), 0) +
                        (m.submodules || []).reduce((s, sm) => s + (sm.lessons || []).reduce((ss, l) => ss + (l.duration_minutes || 0), 0), 0);
                      return sum + (modSeconds || (modMinutes * 60));
                    }, 0);
                    return { lessons: lessonsTotal, totalSeconds };
                  };
                  const stats = computeStats();
                  // Format duration: hours, minutes, seconds
                  const formatDuration = (totalSeconds) => {
                    const hours = Math.floor(totalSeconds / 3600);
                    const minutes = Math.floor((totalSeconds % 3600) / 60);
                    const seconds = totalSeconds % 60;
                    const parts = [];
                    if (hours > 0) parts.push(`${hours} ${t('commonHours') || 'h'}`);
                    if (minutes > 0) parts.push(`${minutes} ${t('commonMinutes') || 'm'}`);
                    if (seconds > 0 || parts.length === 0) parts.push(`${seconds} ${t('commonSeconds') || 's'}`);
                    return parts.join(' ');
                  };
                  const durationLabel = formatDuration(stats.totalSeconds);
                  return (
                    <>
                  <Chip 
                    icon={<PlayCircleIcon sx={{ fontSize: 14 }} />} 
                        label={`${stats.lessons} ${t('lessonsTitle')}`} 
                    size="small"
                    sx={{ 
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)',
                      color: 'white',
                          fontWeight: 700,
                      fontSize: '11px',
                      height: 24,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }
                    }}
                  />
                      <Chip 
                        icon={<HourglassEmpty sx={{ fontSize: 14 }} />} 
                        label={durationLabel} 
                        size="small"
                        sx={{ 
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '11px',
                          height: 24,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                          }
                        }}
                      />
                    </>
                  );
                })()}
                {flashcards.length > 0 && (
                  <Chip 
                    icon={<PsychologyIcon sx={{ fontSize: 14 }} />} 
                    label={`${flashcards.length} ${t('assessmentFlashcard')}`} 
                    size="small"
                    sx={{ 
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '11px',
                      height: 24,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }
                    }}
                  />
                )}
              </Box>
            </Box>
            {/* Instructors group - avatar stack and label on the other side of the title */}
          {(() => {
            const instructorList = courseInstructors.length > 0 ? courseInstructors
              : Array.isArray(course.instructors) ? course.instructors
              : Array.isArray(course.teachers) ? course.teachers
              : (course.instructor ? [{ name: course.instructor }] : []);
              const cleaned = (instructorList || []).filter((ins) => {
              const name = (ins?.name || ins?.username || ins?.first_name || '').toString().trim().toLowerCase();
              return name !== 'admin' && name !== '';
            });
              const topThree = cleaned.slice(0, 3);
              if (topThree.length === 0) return null;
              const getAvatarUrl = (ins) => ins?.avatar || ins?.image || ins?.profile_image || ins?.photo || '';
              const getInitial = (ins) => {
                const base = (ins?.first_name || ins?.name || ins?.username || '').toString().trim();
                return base ? base.charAt(0).toUpperCase() : 'I';
              };
              const names = cleaned.map((ins) => (ins.first_name || ins.last_name) ? `${ins.first_name || ''} ${ins.last_name || ''}`.trim() : (ins.name || ins.username || ins.email || '')).filter(Boolean);
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {topThree.map((ins, idx) => {
                      const url = getAvatarUrl(ins);
                      return (
                        <Avatar
                          key={idx}
                          src={url || undefined}
                          alt={ins?.name || ins?.username || 'Instructor'}
                  sx={{
                            width: 36,
                            height: 36,
                            border: '2px solid rgba(255,255,255,0.9)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                            ml: idx === 0 ? 0 : -1.5,
                            bgcolor: url ? 'transparent' : '#4DBFB3',
                            fontWeight: 800,
                            fontSize: '0.9rem'
                    }}
                  >
                          {!url ? getInitial(ins) : null}
                        </Avatar>
                      );
                    })}
                </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, lineHeight: 1 }}>
                      {t('commonContentExperts') || 'CONTENT EXPERTS'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, lineHeight: 1 }}>
                      {names.slice(0, 3).join(', ')}{names.length > 3 ? ` ${t('commonAnd') || '&'} ${names.length - 3} ${t('commonMore') || 'more'}` : ''}
                </Typography>
              </Box>
            </Box>
              );
          })()}
          </Box>

          {/* Course Instructors (moved inline with title) */}

        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Tabs */}
        {/* <Box sx={{ 
          mb: 4,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
          borderRadius: 4,
          p: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(90deg, #4DBFB3 0%, #333679 100%)',
                height: 4,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(77, 191, 179, 0.3)'
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '16px',
                minHeight: 56,
                borderRadius: 3,
                mx: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(77, 191, 179, 0.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(77, 191, 179, 0.2)'
                },
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, rgba(77, 191, 179, 0.15) 0%, rgba(51, 54, 121, 0.15) 100%)',
                  color: '#333679',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(77, 191, 179, 0.3)'
                }
              }
            }}
          >
            <Tab 
              icon={<VideoIcon sx={{ fontSize: 22 }} />} 
              iconPosition="start" 
              label={t('unitsTitle')} 
              sx={{ gap: 1 }}
            />
            <Tab 
              icon={<QuizIcon sx={{ fontSize: 22 }} />} 
              iconPosition="start" 
              label={t('navQuestionBank')} 
              sx={{ gap: 1 }}
            />
            <Tab 
              icon={<PsychologyIcon sx={{ fontSize: 22 }} />} 
              iconPosition="start" 
              label={t('navFlashcards')} 
              sx={{ gap: 1 }}
            />
          </Tabs>
        </Box> */}

        {/* Tab Content */}
        {/* {activeTab === 0 && (  )} */}
          <Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredModules.length === 0 ? (
              <Card sx={{ borderRadius: 2, p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  {t('unitsNoUnitsAvailable')}
                </Typography>
              </Card>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {filteredModules.map((module, index) => (
                  <Card key={module.id} sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    background: 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
                    }
                  }}>
                    {/* Module Header */}
                    <Box sx={{
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      {/* Module Number */}
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          color: '#999',
                          fontWeight: 400,
                          fontSize: '24px',
                          minWidth: '40px'
                        }}
                      >
                        {index + 1}
                      </Typography>
                      
                      {/* Module Content */}
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600, 
                            color: '#333',
                            fontSize: '18px',
                            mb: 1
                          }}
                        >
                          {module.title || module.name}
                        </Typography>
                        
                        {/* Progress Bar */}
                        <Box sx={{ mb: 1 }}>
                          {(() => {
                            // Calculate module progress
                            const mainLessons = module.lessons ? module.lessons.length : 0;
                            const subModulesLessons = module.submodules ? 
                              module.submodules.reduce((total, sub) => total + (sub.lessons ? sub.lessons.length : 0), 0) : 0;
                            const totalLessons = mainLessons + subModulesLessons;
                            
                            // Calculate completed lessons - prioritize moduleProgressData from API
                            let completedLessons = 0;
                            const progressData = moduleProgressData[module.id];
                            
                            // Strategy: Always prefer counting from lessonsProgress map for accuracy
                            // Then fall back to other methods
                            if (progressData && progressData.lessonsProgress && typeof progressData.lessonsProgress === 'object') {
                              // Count from lessonsProgress map (most accurate - per lesson basis)
                              // Main module lessons
                              const mainCompleted = module.lessons ? 
                                module.lessons.filter(lesson => 
                                  progressData.lessonsProgress[lesson.id] === true || 
                                  progressData.lessonsProgress[lesson.id] === 1
                                ).length : 0;
                              
                              // Count submodule lessons - check both parent and submodule progressData
                              const subCompleted = module.submodules ? 
                                module.submodules.reduce((total, sub) => {
                                  if (!sub.lessons) return total;
                                  // Try to get submodule progress data, or use parent module's
                                  const subProgressData = moduleProgressData[sub.id] || progressData;
                                  const subLessonsProgress = subProgressData?.lessonsProgress || progressData.lessonsProgress;
                                  
                                  return total + sub.lessons.filter(lesson => 
                                    (subLessonsProgress && (
                                      subLessonsProgress[lesson.id] === true || 
                                      subLessonsProgress[lesson.id] === 1
                                    ))
                                  ).length;
                                }, 0) : 0;
                              
                              completedLessons = mainCompleted + subCompleted;
                            } 
                            // If no lessonsProgress map, use completed_lessons from API
                            else if (progressData && progressData.completed_lessons !== undefined && progressData.completed_lessons !== null) {
                              completedLessons = parseInt(progressData.completed_lessons) || 0;
                            } 
                            // If no completed_lessons, calculate from progress percentage
                            else if (progressData && progressData.progress !== undefined && progressData.progress !== null) {
                              const progressValue = typeof progressData.progress === 'number' ? progressData.progress : parseFloat(progressData.progress) || 0;
                              completedLessons = Math.round((progressValue / 100) * totalLessons);
                            }
                            // Fallback: try module's own data if no progressData
                            else {
                              if (module.completed_lessons !== undefined && module.completed_lessons !== null) {
                                completedLessons = parseInt(module.completed_lessons) || 0;
                              } else if (module.progress !== undefined && module.progress !== null) {
                                const progressValue = typeof module.progress === 'number' ? module.progress : parseFloat(module.progress) || 0;
                                completedLessons = Math.round((progressValue / 100) * totalLessons);
                              } else {
                                // Calculate from individual lessons in module data
                                const mainCompleted = module.lessons ? 
                                  module.lessons.filter(lesson => 
                                    lesson.completed === true || 
                                    lesson.is_completed === true || 
                                    lesson.completed === 1 ||
                                    lesson.is_completed === 1
                                  ).length : 0;
                                const subCompleted = module.submodules ? 
                                  module.submodules.reduce((total, sub) => {
                                    if (!sub.lessons) return total;
                                    return total + sub.lessons.filter(lesson => 
                                      lesson.completed === true || 
                                      lesson.is_completed === true || 
                                      lesson.completed === 1 ||
                                      lesson.is_completed === 1
                                    ).length;
                                  }, 0) : 0;
                                completedLessons = mainCompleted + subCompleted;
                              }
                            }
                            
                            const progressPercentage = totalLessons > 0 ? Math.min((completedLessons / totalLessons) * 100, 100) : 0;
                            
                            // Debug log for troubleshooting
                            if (process.env.NODE_ENV === 'development' && totalLessons > 0) {
                              console.log(`Module ${module.id} (${module.title || module.name}):`, {
                                totalLessons,
                                completedLessons,
                                progressPercentage: progressPercentage.toFixed(2) + '%',
                                hasProgressData: !!progressData,
                                progressDataKeys: progressData ? Object.keys(progressData) : []
                              });
                            }
                            
                            return (
                              <LinearProgress
                                variant="determinate"
                                value={progressPercentage}
                                sx={{
                                  height: 4, 
                                  borderRadius: 2,
                                  backgroundColor: 'rgba(0,0,0,0.08)',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 2,
                                    backgroundColor: '#10b981',
                                    background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                                  }
                                }}
                              />
                            );
                          })()}
                        </Box>
                        
                        {/* Module Stats */}
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#666',
                            fontSize: '14px'
                          }}
                        >
                          {(() => {
                            const mainLessons = module.lessons ? module.lessons.length : 0;
                            const subModulesLessons = module.submodules ? 
                              module.submodules.reduce((total, sub) => total + (sub.lessons ? sub.lessons.length : 0), 0) : 0;
                            const totalLessons = mainLessons + subModulesLessons;
                            return `${totalLessons} ${t('lessonsTitle')}`;
                          })()} 
                          {module.submodules && module.submodules.length > 0 && ` • ${module.submodules.length} ${t('unitsSubUnit')}`}
                          • {module.video_duration ? `${Math.floor(module.video_duration / 60)}${t('commonMinutes')} ${module.video_duration % 60}${t('commonSeconds')}` : `0${t('commonMinutes')}`} {t('unitsPlaybackDuration')}
                        </Typography>
                      </Box>
                      
                      {/* Start Button */}
                      <Button
                        variant="contained"
                        onClick={() => {
                          // Find first lesson in the module
                          let firstLesson = null;
                          if (module.lessons && module.lessons.length > 0) {
                            firstLesson = module.lessons[0];
                          } else if (module.submodules && module.submodules.length > 0) {
                            // Check submodules for first lesson
                            for (const subModule of module.submodules) {
                              if (subModule.lessons && subModule.lessons.length > 0) {
                                firstLesson = subModule.lessons[0];
                                break;
                              }
                            }
                          }
                          
                          if (firstLesson) {
                            navigate(`/student/courses/${course.id}/tracking?tab=lessons&moduleId=${module.id}&lessonId=${firstLesson.id}`);
                          } else {
                            navigate(`/student/courses/${course.id}/tracking?tab=lessons&moduleId=${module.id}`);
                          }
                        }}
                        sx={{
                          background: '#4DBFB3',
                          color: 'white',
                          fontWeight: 600,
                          px: 3,
                          py: 1.5,
                          borderRadius: 2,
                          fontSize: '14px',
                          textTransform: 'none',
                          boxShadow: '0 2px 8px rgba(77, 191, 179, 0.3)',
                          '&:hover': {
                            background: '#45a8a0',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(77, 191, 179, 0.4)'
                          }
                        }}
                      >
                        {t('commonStart')}
                      </Button>
                    </Box>
                    
                    {/* Expandable Lessons Section */}
                    <Box sx={{
                      borderTop: '1px solid #f0f0f0',
                      bgcolor: '#fafafa'
                    }}>
                      <Button
                        fullWidth
                        onClick={() => handleModuleToggle(module.id)}
                        sx={{
                          py: 2,
                          px: 3,
                          color: '#666',
                          textTransform: 'none',
                          fontSize: '14px',
                          fontWeight: 500,
                          justifyContent: 'space-between',
                          '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.02)'
                          }
                        }}
                      >
                        <span>
                          {t('unitsViewContent')} ({(() => {
                            const mainLessons = module.lessons ? module.lessons.length : 0;
                            const subModulesLessons = module.submodules ? 
                              module.submodules.reduce((total, sub) => total + (sub.lessons ? sub.lessons.length : 0), 0) : 0;
                            const totalLessons = mainLessons + subModulesLessons;
                            return `${totalLessons} ${t('lessonsTitle')}`;
                          })()}
                          {module.submodules && module.submodules.length > 0 && ` + ${module.submodules.length} ${t('unitsSubUnit')}`})
                        </span>
                        {expandedModules[module.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </Button>
                      
                      <Collapse in={expandedModules[module.id]} timeout="auto" unmountOnExit>
                        {/* Main Module Lessons */}
                        {module.lessons && module.lessons.length > 0 && (
                          <Box sx={{ 
                            background: '#fafafa',
                            borderBottom: '1px solid #e0e0e0'
                          }}>
                            <Box sx={{ 
                              px: 3, 
                              py: 2,
                              borderBottom: '1px solid #e0e0e0',
                              background: '#f0f0f0'
                            }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 600, 
                                  color: '#333',
                                  fontSize: '14px'
                                }}
                              >
                                {t('unitsMainUnitLessons')} ({module.lessons.length})
                              </Typography>
                            </Box>
                            <ModuleLessons moduleId={module.id} lessons={module.lessons} course={course} moduleProgressData={moduleProgressData} />
                          </Box>
                        )}
                        
                        {/* Sub Modules */}
                        {module.submodules && module.submodules.length > 0 && (
                          <Box sx={{ 
                            background: '#f5f5f5'
                          }}>
                            {module.submodules.map((subModule, subIndex) => (
                              <Box key={subModule.id} sx={{ 
                                borderBottom: '1px solid #e0e0e0',
                                '&:last-child': {
                                  borderBottom: 'none'
                                }
                              }}>
                                {/* Sub Module Header - Clickable */}
                                <Button
                                  fullWidth
                                  onClick={() => handleSubModuleToggle(subModule.id)}
                                  sx={{
                                    px: 3,
                                    py: 2,
                                    borderBottom: '1px solid #e0e0e0',
                                    background: '#e8f5e8',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    textTransform: 'none',
                                    justifyContent: 'flex-start',
                                    '&:hover': {
                                      background: '#d4edda'
                                    }
                                  }}
                                >
                                  {/* Sub Module Icon */}
                                  <Box sx={{
                                    width: 20,
                                    height: 20,
                                    color: '#4DBFB3',
                                    fontSize: '14px'
                                  }}>
                                    📚
                                  </Box>
                                  
                                  {/* Sub Module Title */}
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      fontWeight: 600, 
                                      color: '#333',
                                      fontSize: '14px',
                                      flex: 1,
                                      textAlign: i18n.language === 'ar' ? 'right' : 'left',
                                      direction: i18n.language === 'ar' ? 'rtl' : 'ltr',
                                      unicodeBidi: 'bidi-override'
                                    }}
                                  >
                                    {subModule.title || subModule.name}
                                  </Typography>
                                  
                                  {/* Sub Module Stats */}
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: '#666',
                                      fontSize: '12px'
                                    }}
                                  >
                                    {subModule.lessons ? `${subModule.lessons.length} ${t('lessonsTitle')}` : `0 ${t('lessonsTitle')}`}
                                  </Typography>
                                  
                                  {/* Expand/Collapse Icon */}
                                  {expandedSubModules[subModule.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </Button>
                                
                                {/* Sub Module Lessons - Collapsible */}
                                <Collapse in={expandedSubModules[subModule.id]} timeout="auto" unmountOnExit>
                                  {subModule.lessons && subModule.lessons.length > 0 && (
                                    <ModuleLessons moduleId={subModule.id} lessons={subModule.lessons} course={course} moduleProgressData={moduleProgressData} />
                                  )}
                                </Collapse>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Collapse>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
      
      </Container>
    </Box>
  );
};

const MyCourses = () => {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    fetchMyCourses();
  }, []);

  // Handle course selection from URL parameter
  useEffect(() => {
    const courseId = searchParams.get('courseId');
    const moduleId = searchParams.get('moduleId');
    
    if (courseId && (enrolledCourses.length > 0 || completedCourses.length > 0)) {
      const course = [...enrolledCourses, ...completedCourses].find(c => c.id == courseId);
      if (course) {
        setSelectedCourse(course);
        // If moduleId is provided, we'll handle filtering in CourseDetailPage
      }
    } else if (!courseId && selectedCourse) {
      // If no courseId in URL but we have a selected course, clear it
      setSelectedCourse(null);
    }
  }, [searchParams, enrolledCourses, completedCourses, selectedCourse]);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await courseAPI.getMyEnrolledCourses();
      
      // Process and validate course data
      const processedEnrolledCourses = (response.enrolled_courses || []).map(course => ({
        ...course,
        progress: Math.min(Math.max(course.progress || 0, 0), 100),
        totalLessons: course.totalLessons || course.total_lessons || 0,
        completedLessons: course.completedLessons || Math.floor(((course.progress || 0) / 100) * (course.totalLessons || course.total_lessons || 0)),
        duration: course.duration || course.total_duration || "0د"
      }));
      
      const processedCompletedCourses = (response.completed_courses || []).map(course => ({
        ...course,
        progress: 100, // Completed courses should always show 100%
        totalLessons: course.totalLessons || course.total_lessons || 0,
        completedLessons: course.totalLessons || course.total_lessons || 0,
        duration: course.duration || course.total_duration || "0د"
      }));
      
      setEnrolledCourses(processedEnrolledCourses);
      setCompletedCourses(processedCompletedCourses);
      
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(t('coursesFetchCoursesError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId) => {
    const course = [...enrolledCourses, ...completedCourses].find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
    }
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
  };


  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2
        }}
      >
        <CircularProgress size={60} sx={{ color: '#7c4dff' }} />
        <Typography variant="h6" sx={{ color: '#7c4dff', fontWeight: 600 }}>
          {t('commonLoading')} {t('coursesTitle')}...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'white',
          py: 4
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Alert severity="error" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
              {error}
            </Alert>
            <Button 
              variant="contained" 
              onClick={fetchMyCourses}
              sx={{ 
                bgcolor: '#7c4dff',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': { bgcolor: '#6a3dcc' }
              }}
            >
              {t('commonRetry')}
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  // Show course detail page if a course is selected
  if (selectedCourse) {
    return <CourseDetailPage course={selectedCourse} onBack={handleBackToCourses} />;
  }

  // Show courses list
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: '#333' }}>
          {t('coursesMyCourses')}
        </Typography>
        
        {/* Enrolled Courses */}
        {enrolledCourses.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
              {t('coursesEnrolledCourses')} ({enrolledCourses.length})
            </Typography>
            <Grid container spacing={3}>
              {enrolledCourses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
                      }
                    }}
                    onClick={() => handleCourseClick(course.id)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={course.thumbnail || '/api/placeholder/400/200'}
                      alt={course.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                        {course.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {course.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={course.progress} 
                          sx={{ 
                            flex: 1, 
                            height: 6, 
                            borderRadius: 3,
                            backgroundColor: 'rgba(0,0,0,0.08)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              backgroundColor: '#10b981',
                              background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                            }
                          }}
                        />
                        <Typography variant="body2" sx={{ minWidth: '40px', textAlign: 'right' }}>
                          {course.progress}%
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {course.completedLessons} {t('commonOf')} {course.totalLessons} {t('lessonsTitle')} {t('commonCompleted')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Completed Courses */}
        {completedCourses.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
              {t('coursesCompletedCourses')} ({completedCourses.length})
            </Typography>
            <Grid container spacing={3}>
              {completedCourses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
                      }
                    }}
                    onClick={() => handleCourseClick(course.id)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={course.thumbnail || '/api/placeholder/400/200'}
                      alt={course.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                        {course.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {course.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={100} 
                          sx={{ 
                            flex: 1, 
                            height: 6, 
                            borderRadius: 3,
                            backgroundColor: 'rgba(0,0,0,0.08)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              backgroundColor: '#10b981',
                              background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                            }
                          }}
                        />
                        <Typography variant="body2" sx={{ minWidth: '40px', textAlign: 'right' }}>
                          100%
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {t('commonCompleted')} - {course.totalLessons} {t('lessonsTitle')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* No courses message */}
        {enrolledCourses.length === 0 && completedCourses.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              {t('coursesNoEnrollmentsYet')}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/courses')}
              sx={{ mt: 2 }}
            >
              {t('coursesBrowseCourses')}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default MyCourses;
