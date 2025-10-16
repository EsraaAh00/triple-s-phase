import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Button,
  Grid,
  Divider,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Article as ArticleIcon,
  VideoLibrary as VideoIcon,
  Quiz as QuizIcon,
  AccessTime as AccessTimeIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  AddchartRounded,
  AddCircle,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import LessonForm from './LessonForm';
import LessonDetail from './LessonDetail';
import contentAPI from '../../../services/content.service';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: `1px solid ${theme.palette.divider}`,
}));

const LessonCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '10px',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
  }
}));

const Lessons = () => {
  const navigate = useNavigate();
  const { courseId, unitId } = useParams();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState(null);
  const [error, setError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetLesson, setTargetLesson] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [lessonDetailOpen, setLessonDetailOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  useEffect(() => {
    const fetchModule = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await contentAPI.getModuleById(unitId);
        setModule(data);
      } catch (e) {
        setError(t('lessonsLoadingError'));
      } finally {
        setLoading(false);
      }
    };
    if (unitId) fetchModule();
  }, [unitId]);

  const lessons = Array.isArray(module?.lessons) ? module.lessons : [];

  const askDelete = (lesson) => {
    setTargetLesson(lesson);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!targetLesson) return;
    setDeleting(true);
    try {
      await contentAPI.deleteLesson(targetLesson.id);
      setModule((prev) => ({
        ...prev,
        lessons: (prev?.lessons || []).filter((l) => l.id !== targetLesson.id),
      }));
      setSnackbar({ open: true, message: t('lessonsDeleteSuccess'), severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: t('lessonsDeleteError'), severity: 'error' });
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setTargetLesson(null);
    }
  };

  const getTypeIcon = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'video':
        return <VideoIcon fontSize="small" />;
      default:
        return <ArticleIcon fontSize="small" />;
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewLesson = (lessonId) => {
    setSelectedLessonId(lessonId);
    setLessonDetailOpen(true);
  };

  const handleCloseLessonDetail = () => {
    setLessonDetailOpen(false);
    setSelectedLessonId(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, direction: i18n.language === 'en' ? 'ltr' : 'rtl' }}>
      <Box sx={{
        mb: 4,
        p: 3,
        background: 'linear-gradient(135deg, #333679 0%, #4DBFB3 100%)',
        borderRadius: 3,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          zIndex: 1
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          zIndex: 1
        }} />
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                onClick={() => navigate(`/teacher/courses/${courseId}/units`)}
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                  },
                }}
              >
            <ArrowBackIcon />
          </IconButton>
          <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'white' }}>
                  {t('lessonsUnitLessons')}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
                  {module?.name || module?.title || t('lessonsManageUnitLessons')}
            </Typography>
          </Box>
        </Box>
            <Button 
              variant="contained" 
              startIcon={<AddCircle />} 
              size="large" 
              onClick={() => navigate(`/teacher/courses/${courseId}/units/${unitId}/lessons/create`)}
              sx={{ 
                background: 'linear-gradient(45deg, #333679 30%, #4DBFB3 90%)',
                color: 'white',
                borderRadius: '25px',
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem',
                boxShadow: '0 4px 15px rgba(14, 81, 129, 0.3)',
                border: 'none',
                '&:hover': {
                  background: 'linear-gradient(45deg, #0a3f66 30%, #d88a7e 90%)',
                  boxShadow: '0 6px 20px rgba(14, 81, 129, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
          {t('lessonsAddLesson')}
        </Button>
          </Box>
        </Box>
      </Box>

      <StyledPaper>
        {loading && (
          <Box sx={{ py: 3 }}>
            <LinearProgress />
          </Box>
        )}
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        )}

        {!loading && !error && (
          lessons.length > 0 ? (
            <>
              <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'primary.main' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, px: 3, textAlign: 'center' }}>{t('lessonsLesson')}</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, px: 3, textAlign: 'center' }}>{t('lessonsType')}</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, px: 3, textAlign: 'center' }}>{t('lessonsDuration')}</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, px: 3, textAlign: 'center' }}>{t('lessonsActions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lessons
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((lesson) => (
                      <TableRow key={lesson.id} hover sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                        <TableCell sx={{ py: 2, px: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              width: 48,
                              height: 48,
                              borderRadius: '50%',
                              backgroundColor: 'primary.main',
                              color: 'white',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                              {getTypeIcon(lesson.lesson_type)}
                            </Box>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.2 }}>
                                {lesson.title}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                                {t('lessonsLessonId')}: {lesson.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2, px: 3, textAlign: 'center' }}>
                          <Chip 
                            label={lesson.lesson_type || 'article'} 
                            variant="outlined" 
                            size="small"
                            color={lesson.lesson_type === 'video' ? 'primary' : 'default'}
                            sx={{ fontWeight: 600, minWidth: 80 }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2, px: 3, textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {lesson.duration_minutes || 0} {t('lessonsMinutes')}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2, px: 3, textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title={t('lessonsView')}>
                              <IconButton 
                                size="small" 
                                onClick={() => handleViewLesson(lesson.id)}
                                sx={{ 
                                  color: 'primary.main',
                                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.2)',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('lessonsEdit')}>
                              <IconButton 
                                size="small" 
                                onClick={() => navigate(`/teacher/courses/${courseId}/units/${unitId}/lessons/${lesson.id}/edit`)}
                                sx={{ 
                                  color: 'warning.main',
                                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(255, 152, 0, 0.2)',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('lessonsDelete')}>
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => askDelete(lesson)}
                                sx={{ 
                                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(244, 67, 54, 0.2)',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                component="div"
                count={lessons.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage={t('lessonsRowsPerPage')}
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${t('lessonsOf')} ${count}`}
              />
            </>
          ) : (
            <Typography variant="body1" color="text.secondary">{t('lessonsNoLessonsYet')}</Typography>
          )
        )}
      </StyledPaper>

      <Dialog open={confirmOpen} onClose={() => !deleting && setConfirmOpen(false)}>
        <DialogTitle>{t('lessonsConfirmDelete')}</DialogTitle>
        <DialogContent>
          {t('lessonsDeleteConfirmationMessage', { title: targetLesson?.title })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>{t('lessonsCancel')}</Button>
          <Button color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? t('lessonsDeleting') : t('lessonsDelete')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
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

export default Lessons;


