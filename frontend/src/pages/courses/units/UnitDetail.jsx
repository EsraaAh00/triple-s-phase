import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  PlayCircleOutline as PlayIcon,
  Article as ArticleIcon,
  VideoLibrary as VideoIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import contentAPI from '../../../services/content.service';
import LessonDetail from '../lessons/LessonDetail';
import UnitVideoPlayer from '../../../components/units/UnitVideoPlayer';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  background: theme.palette.background.paper,
  marginTop: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    borderColor: theme.palette.primary.main,
  },
}));

const UnitDetail = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { courseId, unitId } = useParams();
  const { t } = useTranslation();
  
  const LESSON_TYPES = [
    { value: 'video', label: t('lessonsVideo'), icon: <VideoIcon />, color: 'primary' },
    { value: 'article', label: t('lessonsArticle'), icon: <ArticleIcon />, color: 'secondary' },
  ];
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lessonDetailOpen, setLessonDetailOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // الجلب من API سيتم مباشرةً

  useEffect(() => {
    const fetchUnit = async () => {
      setLoading(true);
      try {
        const data = await contentAPI.getModuleById(unitId);
        const normalized = {
          id: data?.id,
          title: data?.name || '',
          description: data?.description || '',
          duration: typeof data?.video_duration === 'number' ? Math.round(data.video_duration / 60) : 0,
          order: data?.order,
          status: data?.status || (data?.is_active ? 'published' : 'draft'),
          isPreview: data?.is_active === false,
          submodule: data?.submodule || null,
          submodule_name: data?.submodule_name || null,
          is_submodule: data?.is_submodule || false,
          submodules_count: data?.submodules_count || 0,
          lessons: Array.isArray(data?.lessons)
            ? data.lessons.map((l) => ({
                id: l.id,
                title: l.title || '',
                type: l.lesson_type || 'article',
                duration: l.duration_minutes || 0,
                content: l.content || '',
                isPreview: l.is_free || false,
                completed: false,
                resources: [],
              }))
            : [],
          createdAt: data?.created_at,
          updatedAt: data?.updated_at,
        };
        setUnit(normalized);

      } catch (error) {
        console.error('Error fetching unit:', error);
        setSnackbar({
          open: true,
          message: t('unitsLoadUnitDataError'),
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (unitId) {
      fetchUnit();
    }
  }, [unitId]);



  const handleEditUnit = () => {
    navigate(`/teacher/courses/${courseId}/units/${unitId}/edit`);
  };

  const handleLessonClick = (lesson) => {
    // Open lesson detail popup
    setSelectedLessonId(lesson.id);
    setLessonDetailOpen(true);
  };

  const handleCloseLessonDetail = () => {
    setLessonDetailOpen(false);
    setSelectedLessonId(null);
  };

  const getLessonIcon = (type) => {
    const lessonType = LESSON_TYPES.find(t => t.value === type);
    return lessonType ? lessonType.icon : <ArticleIcon />;
  };

  const getLessonColor = (type) => {
    const lessonType = LESSON_TYPES.find(t => t.value === type);
    return lessonType ? lessonType.color : 'default';
  };

  const getLessonLabel = (type) => {
    const lessonType = LESSON_TYPES.find(t => t.value === type);
    return lessonType ? lessonType.label : t('commonGeneral');
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('commonNotSpecified');
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLessonStatus = (lesson) => {
    if (lesson.completed) return { label: t('commonCompleted'), color: 'success' };
    if (lesson.isPreview) return { label: t('commonPreview'), color: 'primary' };
    return { label: t('commonIncomplete'), color: 'default' };
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!unit) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {t('unitsUnitNotFound')}
        </Alert>
      </Container>
    );
  }



  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate(-1)} 
            sx={{ 
              mr: 2,
              backgroundColor: theme.palette.background.paper,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              {unit.title}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {t('unitsUnitFromProgrammingCourse')}
            </Typography>
          </Box>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleEditUnit}
          sx={{ borderRadius: '12px' }}
        >
          تعديل الوحدة
        </Button>
      </Box>

      {/* Unit Overview */}
      <StyledPaper elevation={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 64,
              height: 64,
              mr: 2,
            }}
          >
            <ArticleIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
              {unit.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Chip
                label={unit.status === 'published' ? 'منشور' : 'مسودة'}
                color={unit.status === 'published' ? 'success' : 'warning'}
                size="small"
                variant="outlined"
              />
              {unit.isPreview && (
                <Chip
                  label="معاينة"
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              )}
              {unit.is_submodule ? (
                <Chip
                  label={`وحدة فرعية: ${unit.submodule_name || 'غير محدد'}`}
                  color="secondary"
                  size="small"
                  variant="outlined"
                />
              ) : (
                <Chip
                  label="وحدة رئيسية"
                  color="info"
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                <Typography variant="body2" color="textSecondary">
                  {unit.duration} دقيقة
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ArticleIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                <Typography variant="body2" color="textSecondary">
                  {unit.lessons.length} درس
                </Typography>
              </Box>
              {!unit.is_submodule && unit.submodules_count > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Badge badgeContent={unit.submodules_count} color="secondary">
                    <ArticleIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                  </Badge>
                  <Typography variant="body2" color="textSecondary">
                    {unit.submodules_count} وحدة فرعية
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <Typography variant="body1" color="textSecondary" sx={{ mb: 3, lineHeight: 1.6 }}>
          {unit.description}
        </Typography>

        {/* Unit Video Player */}
        <UnitVideoPlayer unit={unit} />

                 {/* Unit Details */}
         <Grid container spacing={3} sx={{ mb: 3 }}>
           <Grid item xs={12}>
             <Box sx={{ 
               p: 3, 
               backgroundColor: theme.palette.grey[50], 
               borderRadius: 3,
               border: `1px solid ${theme.palette.divider}`,
               boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
             }}>
               <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main, textAlign: 'center' }}>
                 تفاصيل الوحدة
            </Typography>
        <Grid container spacing={2}>
                 <Grid item xs={12} sm={6} md={3}>
                   <Box sx={{ 
                     p: 2, 
                     backgroundColor: 'white', 
                     borderRadius: 2,
                     border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                       boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                       transform: 'translateY(-1px)'
                     }
                   }}>
                     <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                       تاريخ الإنشاء
                      </Typography>
                     <Typography variant="body1" fontWeight={600} color="primary.main">
                       {formatDate(unit.createdAt)}
                     </Typography>
                    </Box>
                 </Grid>
                 <Grid item xs={12} sm={6} md={3}>
                   <Box sx={{ 
                     p: 2, 
                     backgroundColor: 'white', 
                     borderRadius: 2,
                     border: `1px solid ${theme.palette.divider}`,
                     transition: 'all 0.3s ease',
                     '&:hover': {
                       boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                       transform: 'translateY(-1px)'
                     }
                   }}>
                     <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                       آخر تحديث
                        </Typography>
                     <Typography variant="body1" fontWeight={600} color="primary.main">
                       {formatDate(unit.updatedAt)}
                        </Typography>
                      </Box>
                 </Grid>
                 <Grid item xs={12} sm={6} md={3}>
                   <Box sx={{ 
                     p: 2, 
                     backgroundColor: 'white', 
                     borderRadius: 2,
                     border: `1px solid ${theme.palette.divider}`,
                     transition: 'all 0.3s ease',
                     '&:hover': {
                       boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                       transform: 'translateY(-1px)'
                     }
                   }}>
                     <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                       ترتيب الوحدة
                          </Typography>
                     <Typography variant="body1" fontWeight={600} color="primary.main">
                       {unit.order || 'غير محدد'}
                          </Typography>
                        </Box>
                 </Grid>
                 <Grid item xs={12} sm={6} md={3}>
                   <Box sx={{ 
                     p: 2, 
                     backgroundColor: 'white', 
                     borderRadius: 2,
                     border: `1px solid ${theme.palette.divider}`,
                     transition: 'all 0.3s ease',
                     '&:hover': {
                       boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                       transform: 'translateY(-1px)'
                     }
                   }}>
                     <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                       إجمالي الدروس
                          </Typography>
                     <Typography variant="body1" fontWeight={600} color="primary.main">
                       {unit.lessons.length} درس
                          </Typography>
                        </Box>
                 </Grid>
               </Grid>
                    </Box>
           </Grid>
           <Grid item xs={12}>
             <Box sx={{ 
               p: 3, 
               backgroundColor: theme.palette.grey[50], 
               borderRadius: 3,
               border: `1px solid ${theme.palette.divider}`,
               boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
             }}>
               <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main, textAlign: 'center' }}>
                 إحصائيات الوحدة
               </Typography>
               <Grid container spacing={2}>
                 <Grid item xs={12} sm={6} md={3}>
                   <Box sx={{ 
                     p: 2, 
                     backgroundColor: 'white', 
                     borderRadius: 2,
                     border: `1px solid ${theme.palette.divider}`,
                     transition: 'all 0.3s ease',
                            '&:hover': {
                       boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                       transform: 'translateY(-1px)'
                     }
                   }}>
                     <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                       إجمالي المدة
                        </Typography>
                     <Typography variant="body1" fontWeight={600} color="primary.main">
                       {unit.duration} دقيقة
                  </Typography>
                      </Box>
                 </Grid>
                 <Grid item xs={12} sm={6} md={3}>
                   <Box sx={{ 
                     p: 2, 
                     backgroundColor: 'white', 
                     borderRadius: 2,
                     border: `1px solid ${theme.palette.divider}`,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                       boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                       transform: 'translateY(-1px)'
                     }
                   }}>
                     <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                       الدروس المكتملة
                                        </Typography>
                     <Typography variant="body1" fontWeight={600} color="success.main">
                       {unit.lessons.filter(l => l.completed).length} من {unit.lessons.length}
                                        </Typography>
                   </Box>
                 </Grid>
                 <Grid item xs={12} sm={6} md={3}>
                   <Box sx={{ 
                     p: 2, 
                     backgroundColor: 'white', 
                     borderRadius: 2,
                     border: `1px solid ${theme.palette.divider}`,
                     transition: 'all 0.3s ease',
                     '&:hover': {
                       boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                       transform: 'translateY(-1px)'
                     }
                   }}>
                     <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                       دروس المعاينة
                      </Typography>
                     <Typography variant="body1" fontWeight={600} color="warning.main">
                       {unit.lessons.filter(l => l.isPreview).length} درس
                     </Typography>
                                      </Box>
                 </Grid>
                 <Grid item xs={12} sm={6} md={3}>
                   <Box sx={{ 
                     p: 2, 
                     backgroundColor: 'white', 
                     borderRadius: 2,
                     border: `1px solid ${theme.palette.divider}`,
                     transition: 'all 0.3s ease',
                                          '&:hover': {
                       boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                       transform: 'translateY(-1px)'
                     }
                   }}>
                     <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                       الحالة
                     </Typography>
                     <Chip 
                       label={unit.status === 'published' ? 'منشور' : 'مسودة'} 
                       color={unit.status === 'published' ? 'success' : 'warning'}
                       size="small"
                       sx={{ fontWeight: 600 }}
                     />
                                    </Box>
                              </Grid>
                        </Grid>
                      </Box>
            </Grid>
        </Grid>
      </StyledPaper>

      {/* Lessons Table */}
      <StyledPaper elevation={0} sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          دروس الوحدة ({unit.lessons.length})
                  </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={`${unit.lessons.filter(l => l.completed).length} مكتمل`} 
              color="success" 
              size="small" 
              variant="outlined"
            />
            <Chip 
              label={`${unit.lessons.filter(l => l.isPreview).length} معاينة`} 
              color="primary" 
              size="small" 
              variant="outlined"
            />
                </Box>
            </Box>
            
        <TableContainer sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ArticleIcon sx={{ fontSize: 20 }} />
                    الدرس
                </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main, textAlign: 'center' }}>
                  النوع
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main, textAlign: 'center' }}>
                  المدة
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main, textAlign: 'center' }}>
                  الحالة
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main, textAlign: 'center' }}>
                  الإجراءات
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {unit.lessons.map((lesson, index) => {
                const status = getLessonStatus(lesson);
                      return (
                  <TableRow 
                    key={lesson.id}
                            sx={{
                              '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      },
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleLessonClick(lesson)}
                  >
                    <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                  sx={{
                      bgcolor: theme.palette[getLessonColor(lesson.type)].main,
                            width: 40,
                            height: 40,
                    }}
                  >
                    {getLessonIcon(lesson.type)}
                                </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {lesson.title}
                      </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                            maxWidth: 300
                          }}>
                            {lesson.content || 'لا يوجد وصف للدرس'}
                                  </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getLessonLabel(lesson.type)}
                        size="small"
                        color={getLessonColor(lesson.type)}
                        variant="outlined"
                          sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" fontWeight={500}>
                          {lesson.duration} دقيقة
                                  </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={status.label}
                          size="small"
                          color={status.color}
                          variant="filled"
                            sx={{ fontWeight: 600 }}
                        />
                        {lesson.completed && (
                          <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                  )}
                                </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="فتح الدرس">
                                <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLessonClick(lesson);
                            }}
                    sx={{
                              backgroundColor: 'rgba(25, 118, 210, 0.1)',
                      '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.2)',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <PlayIcon />
                  </IconButton>
                        </Tooltip>
                        <Tooltip title="عرض التفاصيل">
                  <IconButton
                            size="small"
                            color="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLessonClick(lesson);
                            }}
                    sx={{
                              backgroundColor: 'rgba(156, 39, 176, 0.1)',
                      '&:hover': {
                                backgroundColor: 'rgba(156, 39, 176, 0.2)',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <VisibilityIcon />
                  </IconButton>
                        </Tooltip>
                        {lesson.resources.length > 0 && (
                          <Tooltip title={`${lesson.resources.length} مرفق`}>
                            <Badge badgeContent={lesson.resources.length} color="primary">
                  <IconButton
                                size="small"
                                color="info"
                    sx={{
                                  backgroundColor: 'rgba(3, 169, 244, 0.1)',
                      '&:hover': {
                                    backgroundColor: 'rgba(3, 169, 244, 0.2)',
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <DownloadIcon />
                  </IconButton>
                            </Badge>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
              

      </StyledPaper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Lesson Detail Popup */}
      <LessonDetail
        open={lessonDetailOpen}
        onClose={handleCloseLessonDetail}
        courseId={courseId}
        unitId={unitId}
        lessonId={selectedLessonId}
      />
    </Container>
  );
};

export default UnitDetail; 