import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Chip,
  Avatar,
  Skeleton,
  Alert,
  IconButton
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  School as SchoolIcon,
  Quiz as QuizIcon,
  Psychology as PsychologyIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  MenuBook as MenuBookIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { contentAPI } from '../../services/content.service';
import assessmentService from '../../services/assessment.service';

const CourseDetails = ({ course, onClose }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [modules, setModules] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedSubModules, setExpandedSubModules] = useState({});
  const [loading, setLoading] = useState({
    modules: false,
    questions: false,
    flashcards: false
  });

  useEffect(() => {
    if (course) {
      loadCourseData();
    }
  }, [course]);

  const loadCourseData = async () => {
    if (!course?.id) return;

    try {
      console.log('Loading data for course:', course.id);
      
      // Load modules with lessons
      setLoading(prev => ({ ...prev, modules: true }));
      try {
        const modulesData = await contentAPI.getCourseModulesWithLessons(course.id);
        console.log('Modules data:', modulesData);
        
        // Organize modules: separate main modules and sub modules
        const modulesList = modulesData?.modules || [];
        const mainModules = modulesList.filter(module => !module.submodule);
        const subModules = modulesList.filter(module => module.submodule);
        
        // Group sub modules under their parent modules
        const organizedModules = mainModules.map(mainModule => {
          const relatedSubModules = subModules.filter(subModule => subModule.submodule === mainModule.id);
          
          return {
            ...mainModule,
            submodules: relatedSubModules
          };
        });
        
        setModules(organizedModules);
        console.log('Processed modules:', organizedModules);
      } catch (err) {
        console.error('Error loading modules:', err);
        setModules([]);
        console.warn('فشل في تحميل الوحدات. تأكد من أنك مسجل في المقرر.');
      } finally {
        setLoading(prev => ({ ...prev, modules: false }));
      }

      // Load questions
      setLoading(prev => ({ ...prev, questions: true }));
      try {
        const questionsData = await contentAPI.getCourseQuestionBank(course.id);
        console.log('Questions data:', questionsData);
        
        // Process the API response correctly - flatten all questions from all modules and lessons
        const allQuestions = questionsData?.modules?.flatMap(module => 
          module.lessons?.flatMap(lesson => 
            lesson.questions?.map(question => ({
              ...question,
              question_text: question.question,
              lesson_title: lesson.title,
              module_title: module.name
            })) || []
          ) || []
        ) || [];
        
        setQuestions(allQuestions);
        console.log('Processed questions:', allQuestions);
      } catch (err) {
        console.error('Error loading questions:', err);
        setQuestions([]);
        console.warn('فشل في تحميل الأسئلة. تأكد من أنك مسجل في المقرر.');
      } finally {
        setLoading(prev => ({ ...prev, questions: false }));
      }

      // Load flashcards
      setLoading(prev => ({ ...prev, flashcards: true }));
      try {
        const flashcardsData = await contentAPI.getCourseFlashcards(course.id);
        console.log('Flashcards data:', flashcardsData);
        
        // Process the API response correctly - flatten all flashcards from all modules and lessons
        const allFlashcards = flashcardsData?.modules?.flatMap(module => 
          module.lessons?.flatMap(lesson => 
            lesson.flashcards?.map(flashcard => ({
              ...flashcard,
              front_text: flashcard.front,
              back_text: flashcard.back,
              lesson_title: lesson.title,
              module_title: module.name
            })) || []
          ) || []
        ) || [];
        
        setFlashcards(allFlashcards);
        console.log('Processed flashcards:', allFlashcards);
      } catch (err) {
        console.error('Error loading flashcards:', err);
        setFlashcards([]);
        console.warn('فشل في تحميل البطاقات التعليمية. تأكد من أنك مسجل في المقرر.');
      } finally {
        setLoading(prev => ({ ...prev, flashcards: false }));
      }

    } catch (error) {
      console.error('Error loading course data:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatDuration = (duration) => {
    if (!duration) return '0د';
    return duration;
  };

  const getDifficultyLabel = (level) => {
    const labels = {
      'easy': 'سهل',
      'medium': 'متوسط',
      'hard': 'صعب'
    };
    return labels[level] || 'غير محدد';
  };

  const getDifficultyColor = (level) => {
    const colors = {
      'easy': 'success',
      'medium': 'warning',
      'hard': 'error'
    };
    return colors[level] || 'default';
  };

  if (!course) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      dir="rtl"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Card sx={{
        width: '100%',
        height: '100%',
        background: 'white',
        borderRadius: { xs: 2, sm: 3 },
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Course Header */}
        <Box sx={{
          background: 'linear-gradient(135deg, #333679, #1a6ba8)',
          borderRadius: { xs: '8px 8px 0 0', sm: '12px 12px 0 0' },
          p: { xs: 1, sm: 1.5 },
          color: 'white',
          flexShrink: 0
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, mb: 0 }}>
            <Avatar sx={{
              width: { xs: 30, sm: 35 },
              height: { xs: 30, sm: 35 },
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <SchoolIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="subtitle1" 
                fontWeight={700} 
                sx={{ 
                  mb: 0.25,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  lineHeight: { xs: 1.2, sm: 1.3 }
                }}
              >
                {course.title}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  opacity: 0.9,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                }}
              >
                {course.description || 'لا يوجد وصف متاح'}
              </Typography>
              <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 }, mt: 0.5 }}>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {(() => {
                    const totalLessons = modules.reduce((total, module) => {
                      const mainLessons = module.lessons ? module.lessons.length : 0;
                      const subModulesLessons = module.submodules ? 
                        module.submodules.reduce((subTotal, sub) => subTotal + (sub.lessons ? sub.lessons.length : 0), 0) : 0;
                      return total + mainLessons + subModulesLessons;
                    }, 0);
                    return `${totalLessons} درس`;
                  })()}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  •
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {questions.length} سؤال
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  •
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {flashcards.length} بطاقة
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                width: 28,
                height: 28,
                '&:hover': { background: 'rgba(255,255,255,0.2)' }
              }}
            >
              ×
            </IconButton>
          </Box>

        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                minHeight: { xs: 36, sm: 40 },
                textTransform: 'none',
                px: { xs: 1, sm: 2 }
              },
              '& .MuiTabs-scrollButtons': {
                width: { xs: 30, sm: 40 },
                '&.Mui-disabled': {
                  opacity: 0.3
                }
              }
            }}
          >
            <Tab
              icon={<MenuBookIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
              label={t('courseTrackingLessons')}
              iconPosition="start"
              sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.3, sm: 0.5 } }}
            />
            <Tab
              icon={<QuizIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
              label={t('navQuestionBank')}
              iconPosition="start"
              sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.3, sm: 0.5 } }}
            />
            <Tab
              icon={<PsychologyIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
              label={t('navFlashcards')}
              iconPosition="start"
              sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.3, sm: 0.5 } }}
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ 
          p: { xs: 1, sm: 1.5 }, 
          flex: 1, 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Lessons Tab */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#333679' }}>
                  وحدات المقرر ({modules.length})
                </Typography>
              </Box>

              {loading.modules ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[1, 2, 3].map((item) => (
                    <Skeleton key={item} variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                  ))}
                </Box>
              ) : modules.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {modules.map((module, index) => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card sx={{
                        borderRadius: 2,
                        border: '1px solid #e0e0e0',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          borderColor: '#333679'
                        },
                        transition: 'all 0.3s ease'
                      }}>
                        <CardContent sx={{ p: 1.5 }}>
                          {/* Module Header */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <Box sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1,
                              background: 'linear-gradient(135deg, #333679, #1a6ba8)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white'
                            }}>
                              <MenuBookIcon sx={{ fontSize: 16 }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.25 }}>
                                {module.title || module.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {(() => {
                                  const mainLessons = module.lessons ? module.lessons.length : 0;
                                  const subModulesLessons = module.submodules ? 
                                    module.submodules.reduce((total, sub) => total + (sub.lessons ? sub.lessons.length : 0), 0) : 0;
                                  const totalLessons = mainLessons + subModulesLessons;
                                  return `${totalLessons} درس`;
                                })()}
                                {module.submodules && module.submodules.length > 0 && ` • ${module.submodules.length} وحدة فرعية`}
                              </Typography>
                            </Box>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => setExpandedModules(prev => ({
                                ...prev,
                                [module.id]: !prev[module.id]
                              }))}
                              sx={{
                                borderRadius: 2,
                                fontSize: '0.75rem',
                                px: 1.5,
                                py: 0.5,
                                minWidth: 'auto'
                              }}
                            >
                              {expandedModules[module.id] ? 'إخفاء' : 'عرض'}
                            </Button>
                          </Box>

                          {/* Expanded Content */}
                          {expandedModules[module.id] && (
                            <Box sx={{ 
                              borderTop: '1px solid #f0f0f0',
                              pt: 1.5,
                              mt: 1
                            }}>
                              {/* Main Module Lessons */}
                              {module.lessons && module.lessons.length > 0 && (
                                <Box sx={{ mb: 1 }}>
                                  <Typography variant="caption" fontWeight={600} sx={{ 
                                    color: '#333679',
                                    display: 'block',
                                    mb: 1
                                  }}>
                                    دروس الوحدة الرئيسية ({module.lessons.length})
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {module.lessons.map((lesson, lessonIndex) => (
                                      <Box key={lesson.id} sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        p: 1,
                                        borderRadius: 1,
                                        background: '#f8f9fa',
                                        border: '1px solid #e9ecef'
                                      }}>
                                        <Typography variant="caption" sx={{ 
                                          color: '#666',
                                          minWidth: '20px',
                                          textAlign: 'center'
                                        }}>
                                          {lessonIndex + 1}
                                        </Typography>
                                        <Box sx={{ flex: 1 }}>
                                          <Typography variant="caption" fontWeight={500}>
                                            {lesson.title}
                                          </Typography>
                                          {lesson.duration && (
                                            <Typography variant="caption" sx={{ 
                                              color: '#666',
                                              display: 'block'
                                            }}>
                                              {formatDuration(lesson.duration)}
                                            </Typography>
                                          )}
                                        </Box>
                                        {lesson.is_completed && (
                                          <CheckCircleIcon sx={{ color: 'success.main', fontSize: 14 }} />
                                        )}
                                      </Box>
                                    ))}
                                  </Box>
                                </Box>
                              )}

                              {/* Sub Modules */}
                              {module.submodules && module.submodules.length > 0 && (
                                <Box>
                                  <Typography variant="caption" fontWeight={600} sx={{ 
                                    color: '#333679',
                                    display: 'block',
                                    mb: 1
                                  }}>
                                    الوحدات الفرعية ({module.submodules.length})
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {module.submodules.map((subModule, subIndex) => (
                                      <Box key={subModule.id}>
                                        <Box sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 1,
                                          p: 1,
                                          borderRadius: 1,
                                          background: '#e8f5e8',
                                          border: '1px solid #d4edda',
                                          cursor: 'pointer'
                                        }}
                                        onClick={() => setExpandedSubModules(prev => ({
                                          ...prev,
                                          [subModule.id]: !prev[subModule.id]
                                        }))}>
                                          <Typography variant="caption" sx={{ 
                                            color: '#666',
                                            minWidth: '20px',
                                            textAlign: 'center'
                                          }}>
                                            {subIndex + 1}
                                          </Typography>
                                          <Box sx={{ flex: 1 }}>
                                            <Typography variant="caption" fontWeight={500}>
                                              {subModule.title || subModule.name}
                                            </Typography>
                                            <Typography variant="caption" sx={{ 
                                              color: '#666',
                                              display: 'block'
                                            }}>
                                              {subModule.lessons ? `${subModule.lessons.length} درس` : '0 درس'}
                                            </Typography>
                                          </Box>
                                          <Typography variant="caption" sx={{ 
                                            color: '#666',
                                            fontSize: '0.7rem'
                                          }}>
                                            {expandedSubModules[subModule.id] ? 'إخفاء' : 'عرض'}
                                          </Typography>
                                        </Box>

                                        {/* Sub Module Lessons */}
                                        {expandedSubModules[subModule.id] && subModule.lessons && subModule.lessons.length > 0 && (
                                          <Box sx={{ 
                                            mt: 1,
                                            ml: 2,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 0.5
                                          }}>
                                            {subModule.lessons.map((lesson, lessonIndex) => (
                                              <Box key={lesson.id} sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                p: 0.75,
                                                borderRadius: 1,
                                                background: '#f8f9fa',
                                                border: '1px solid #e9ecef'
                                              }}>
                                                <Typography variant="caption" sx={{ 
                                                  color: '#666',
                                                  minWidth: '16px',
                                                  textAlign: 'center',
                                                  fontSize: '0.7rem'
                                                }}>
                                                  {lessonIndex + 1}
                                                </Typography>
                                                <Box sx={{ flex: 1 }}>
                                                  <Typography variant="caption" fontWeight={500} sx={{ fontSize: '0.7rem' }}>
                                                    {lesson.title}
                                                  </Typography>
                                                  {lesson.duration && (
                                                    <Typography variant="caption" sx={{ 
                                                      color: '#666',
                                                      display: 'block',
                                                      fontSize: '0.65rem'
                                                    }}>
                                                      {formatDuration(lesson.duration)}
                                                    </Typography>
                                                  )}
                                                </Box>
                                                {lesson.is_completed && (
                                                  <CheckCircleIcon sx={{ color: 'success.main', fontSize: 12 }} />
                                                )}
                                              </Box>
                                            ))}
                                          </Box>
                                        )}
                                      </Box>
                                    ))}
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <MenuBookIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    لا توجد وحدات متاحة
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    لم يتم إضافة أي وحدات لهذا المقرر بعد
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Questions Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#333679' }}>
                  {t('navQuestionBank')} ({questions.length})
                </Typography>
              </Box>

              {loading.questions ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[1, 2, 3].map((item) => (
                    <Skeleton key={item} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                  ))}
                </Box>
              ) : questions.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {questions.map((question, index) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card sx={{
                        borderRadius: 2,
                        border: '1px solid #e0e0e0',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          borderColor: '#333679'
                        },
                        transition: 'all 0.3s ease'
                      }}>
                        <CardContent sx={{ p: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1,
                              background: 'linear-gradient(135deg, #ff9800, #f57c00)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white'
                            }}>
                              <QuizIcon sx={{ fontSize: 16 }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.25 }}>
                                {question.question_text?.substring(0, 80)}...
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                <Chip
                                  label={getDifficultyLabel(question.difficulty_level)}
                                  color={getDifficultyColor(question.difficulty_level)}
                                  size="small"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                                <Chip
                                  label={question.question_type || 'اختيار من متعدد'}
                                  variant="outlined"
                                  size="small"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <QuizIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    لا توجد أسئلة متاحة
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    لم يتم إضافة أي أسئلة لهذا المقرر بعد
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Flashcards Tab */}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#333679' }}>
                  {t('navFlashcards')} ({flashcards.length})
                </Typography>
              </Box>

              {loading.flashcards ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[1, 2, 3].map((item) => (
                    <Skeleton key={item} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                  ))}
                </Box>
              ) : flashcards.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {flashcards.map((flashcard, index) => (
                    <motion.div
                      key={flashcard.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card sx={{
                        borderRadius: 2,
                        border: '1px solid #e0e0e0',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          borderColor: '#333679'
                        },
                        transition: 'all 0.3s ease'
                      }}>
                        <CardContent sx={{ p: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1,
                              background: 'linear-gradient(135deg, #9c27b0, #673ab7)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white'
                            }}>
                              <PsychologyIcon sx={{ fontSize: 16 }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.25 }}>
                                {flashcard.front_text?.substring(0, 60)}...
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {flashcard.lesson_title || 'بدون درس مرتبط'}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <PsychologyIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    لا توجد بطاقات تعليمية متاحة
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    لم يتم إضافة أي بطاقات تعليمية لهذا المقرر بعد
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Card>
    </motion.div>
  );
};

export default CourseDetails;
