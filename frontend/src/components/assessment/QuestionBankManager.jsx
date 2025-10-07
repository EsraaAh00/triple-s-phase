import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  Badge,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  FormGroup,
  Container,
  InputAdornment,
  Skeleton,
  useTheme,
  alpha,
  keyframes,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Quiz as QuizIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  ContentCopy as CopyIcon,
  Assessment as AssessmentIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Psychology as PsychologyIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  PublishedWithChanges as PublishedIcon,
  Drafts as DraftIcon,
  Archive as ArchiveIcon,
  Article as ArticleIcon,
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  Sort as SortIcon,
  Star as StarIcon,
  Share as ShareIcon,
  ArrowForward as ArrowForwardIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionForm from './QuestionForm';
import QuestionCard from './QuestionCard';
import QuestionBankStats from './QuestionBankStats';
import useQuestionBank from '../../hooks/useQuestionBank';

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(103, 58, 183, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(103, 58, 183, 0); }
  100% { box-shadow: 0 0 0 0 rgba(103, 58, 183, 0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const slideIn = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

// Styled components
const ModernCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 12,
  overflow: 'hidden',
  background: '#ffffff',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
  border: 'none',
  transition: 'all 0.3s ease',
  position: 'relative',
  minHeight: '300px',
  width: '100%',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  }
}));

const FilterChip = styled(Chip)(({ theme, active }) => ({
  fontWeight: 600,
  borderRadius: '20px',
  transition: 'all 0.3s ease',
  height: 32,
  ...(active && {
    background: `linear-gradient(45deg, #663399, #42a5f5)`,
    color: 'white',
    boxShadow: `0 4px 12px ${alpha('#663399', 0.3)}`,
    transform: 'translateY(-2px)',
  }),
  '&:hover': {
    transform: active ? 'translateY(-2px)' : 'translateY(-1px)',
    boxShadow: active 
      ? `0 6px 16px ${alpha('#663399', 0.4)}`
      : `0 4px 12px ${alpha('#663399', 0.2)}`,
  }
}));

const SearchBox = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 20,
    backgroundColor: alpha('#ffffff', 0.95),
    backdropFilter: 'blur(10px)',
    '&:hover fieldset': {
      borderColor: '#663399',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#663399',
      borderWidth: 2,
    },
  },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 16,
  background: `linear-gradient(135deg, ${alpha('#663399', 0.08)}, ${alpha('#42a5f5', 0.08)})`,
  border: `1px solid ${alpha('#663399', 0.15)}`,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: `linear-gradient(90deg, #663399, #42a5f5)`,
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${alpha('#663399', 0.2)}`,
  }
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha('#ffffff', 0.95)}, ${alpha('#f8f9ff', 0.95)})`,
  borderRadius: 24,
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  boxShadow: `0 8px 32px ${alpha('#663399', 0.08)}`,
  border: `1px solid ${alpha('#663399', 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, #663399, #42a5f5, #1565c0)`,
    backgroundSize: '200% 100%',
    animation: `${shimmer} 3s ease-in-out infinite`,
  }
}));

const QuestionBankManager = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    questionType: '',
    difficulty: '',
    course: '',
    lesson: ''
  });
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [orderBy, setOrderBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [tablePage, setTablePage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  const questionBankData = useQuestionBank();
  
  const {
    questions = [],
    loading = false,
    error = null,
    stats = null,
    lessons = [],
    pagination = { page: 1, pageSize: 20, totalPages: 1, totalCount: 0 },
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    bulkDeleteQuestions,
    searchQuestions,
    filterQuestions,
    setPage,
    setPageSize,
    goToNextPage,
    goToPreviousPage,
    clearError
  } = questionBankData || {};

  // Debug logging
  console.log('QuestionBankManager - lessons:', lessons);
  console.log('QuestionBankManager - lessons type:', typeof lessons, 'Is array:', Array.isArray(lessons));

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setTablePage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setTablePage(0);
  };

  // Use questions directly from API (filtering is done server-side)
  const filteredQuestions = questions || [];

  // Sort questions based on orderBy and order
  const sortedQuestions = React.useMemo(() => {
    if (!filteredQuestions || filteredQuestions.length === 0) return [];
    
    return [...filteredQuestions].sort((a, b) => {
      if (orderBy === 'created_at') {
        return order === 'asc' 
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      }
      if (orderBy === 'question_type') {
        return order === 'asc' 
          ? a.question_type.localeCompare(b.question_type)
          : b.question_type.localeCompare(a.question_type);
      }
      if (orderBy === 'difficulty_level') {
        const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
        return order === 'asc' 
          ? difficultyOrder[a.difficulty_level] - difficultyOrder[b.difficulty_level]
          : difficultyOrder[b.difficulty_level] - difficultyOrder[a.difficulty_level];
      }
      return 0;
    });
  }, [filteredQuestions, orderBy, order]);

  // Paginate questions
  const paginatedQuestions = React.useMemo(() => {
    if (!sortedQuestions || sortedQuestions.length === 0) return [];
    const startIndex = tablePage * rowsPerPage;
    return sortedQuestions.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedQuestions, tablePage, rowsPerPage]);

  const handleOpenDialog = (question = null) => {
    setEditingQuestion(question);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingQuestion(null);
  };

  const handleQuestionSubmit = async (questionData) => {
    try {
      if (editingQuestion) {
        await updateQuestion?.(editingQuestion.id, questionData);
      } else {
        await createQuestion?.(questionData);
      }
      handleCloseDialog();
      fetchQuestions?.();
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  const handleDeleteQuestion = (questionId) => {
    setQuestionToDelete(questionId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteQuestion = async () => {
    if (questionToDelete) {
      try {
        await deleteQuestion?.(questionToDelete);
        fetchQuestions?.();
        setDeleteDialogOpen(false);
        setQuestionToDelete(null);
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  const cancelDeleteQuestion = () => {
    setDeleteDialogOpen(false);
    setQuestionToDelete(null);
  };

  const handleSearch = async (event) => {
    const searchValue = event.target.value;
    setSearchTerm(searchValue);
    
    if (searchValue.trim()) {
      await searchQuestions?.(searchValue, filters);
    } else {
      await fetchQuestions?.();
    }
  };

  const handleFilterChange = async (filterType, value) => {
    const newFilters = {
      ...filters,
      [filterType]: value
    };
    setFilters(newFilters);
    
    // Apply filters
    if (searchTerm.trim()) {
      await searchQuestions?.(searchTerm, newFilters);
    } else {
      await filterQuestions?.(newFilters);
    }
  };

  const handleBulkAction = async () => {
    if (selectedQuestions.length === 0) return;

    try {
      if (bulkAction === 'delete') {
        if (window.confirm(`${t('questionBankConfirmDeleteMultiple')} ${selectedQuestions.length} ${t('questionBankConfirmDeleteMultipleSuffix')}`)) {
          const result = await bulkDeleteQuestions?.(selectedQuestions);
          if (result?.success) {
            setSelectedQuestions([]);
            // Show success message
            console.log(result.message);
          } else {
            // Show error message
            console.error(result?.error);
          }
        }
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'mcq': return <QuestionAnswerIcon />;
      case 'true_false': return <CheckCircleIcon />;
      case 'short_answer': return <EditIcon />;
      case 'essay': return <AssessmentIcon />;
      case 'fill_blank': return <PsychologyIcon />;
      default: return <QuizIcon />;
    }
  };

  const getQuestionTypeLabel = (type) => {
    const types = {
      'mcq': t('questionBankMultipleChoice'),
      'true_false': t('questionBankTrueFalse'),
      'short_answer': t('questionBankShortAnswer'),
      'essay': t('questionBankEssay'),
      'fill_blank': t('questionBankFillBlank'),
      'matching': t('questionBankMatching'),
      'ordering': t('questionBankOrdering')
    };
    return types[type] || type;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    const difficulties = {
      'easy': t('questionBankEasy'),
      'medium': t('questionBankMedium'),
      'hard': t('questionBankHard')
    };
    return difficulties[difficulty] || difficulty;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Compact Header Skeleton */}
        <Box sx={{ 
          mb: 4, 
          p: 3, 
          background: 'linear-gradient(135deg, #663399 0%, #42a5f5 100%)',
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <QuizIcon sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
              {t('questionBankTitle')}
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
            {t('questionBankDescription')}
          </Typography>
          </Box>
        </Box>
        
        <Container sx={{ py: 4 }}>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} md={6} key={item}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 2 }} />
                <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={20} width="60%" sx={{ mb: 1 }} />
                <Skeleton variant="text" height={20} width="40%" />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Compact Header */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        background: 'linear-gradient(90deg, #333679 0%, #4DBFB3 100%)',
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <QuizIcon sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
          {t('questionBankTitle')}
        </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
          {t('questionBankDescription')}
        </Typography>
        </Box>
      </Box>

      <Container sx={{ py: 3 }}>
        {/* Create Question Button - Fixed */}
        <Box sx={{ position: 'fixed', top: 100, left: 32, zIndex: 1200 }}>
          <IconButton
            onClick={() => handleOpenDialog()}
            sx={{
              width: 56,
              height: 56,
              background: 'linear-gradient(90deg, #333679 0%, #4DBFB3 100%)',
              boxShadow: '0 4px 20px rgba(14, 81, 129, 0.3)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(90deg, #0a3d5f 0%, #d17a6e 100%)',
                boxShadow: '0 6px 25px rgba(14, 81, 129, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <AddIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Box>
        
        {/* Compact Statistics Row */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 4, 
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            p: 2, 
            backgroundColor: 'background.paper', 
            borderRadius: 2, 
            border: '1px solid #e0e0e0',
            minWidth: 140,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <QuizIcon sx={{ color: '#663399', fontSize: 24 }} />
                <Box>
              <Typography variant="h5" fontWeight={700} color="primary">
                    {stats?.total_questions || 0}
                  </Typography>
              <Typography variant="caption" color="text.secondary">
                    {t('questionBankTotalQuestions')}
                  </Typography>
                </Box>
              </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            p: 2, 
            backgroundColor: 'background.paper', 
            borderRadius: 2, 
            border: '1px solid #e0e0e0',
            minWidth: 140,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <QuestionAnswerIcon sx={{ color: '#2e7d32', fontSize: 24 }} />
                <Box>
              <Typography variant="h5" fontWeight={700} color="success.main">
                    {stats?.questions_by_type?.mcq || 0}
                  </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('questionBankMultipleChoice')}
                  </Typography>
                </Box>
              </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            p: 2, 
            backgroundColor: 'background.paper', 
            borderRadius: 2, 
            border: '1px solid #e0e0e0',
            minWidth: 140,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <TrendingUpIcon sx={{ color: '#f57c00', fontSize: 24 }} />
                <Box>
              <Typography variant="h5" fontWeight={700} color="warning.main">
                    {stats?.questions_by_difficulty?.medium || 0}
                  </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('questionBankMediumDifficulty')}
                  </Typography>
                </Box>
              </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            p: 2, 
            backgroundColor: 'background.paper', 
            borderRadius: 2, 
            border: '1px solid #e0e0e0',
            minWidth: 140,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <SchoolIcon sx={{ color: '#7b1fa2', fontSize: 24 }} />
                <Box>
              <Typography variant="h5" fontWeight={700} color="secondary.main">
                    0
                  </Typography>
              <Typography variant="caption" color="text.secondary">
                    {t('questionBankAvailableCourses')}
                  </Typography>
                </Box>
              </Box>
        </Box>

        {/* Filters and Search */}
        <HeaderContainer>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mr: 2, color: 'primary.main' }}>
              {t('assessmentFilterQuestions')}:
            </Typography>
            
            <SearchBox
                      placeholder={t('assessmentSearchQuestions')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                minWidth: 280, 
                flexGrow: 1,
              }}
            />
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FilterChip
                label={t('questionBankAll')}
                onClick={() => setFilters({...filters, questionType: '', difficulty: '', course: '', lesson: ''})}
                active={!filters.questionType && !filters.difficulty && !filters.course && !filters.lesson}
              />
              <FilterChip
                label={t('questionBankMultipleChoice')}
                onClick={() => setFilters({...filters, questionType: 'mcq'})}
                active={filters.questionType === 'mcq'}
              />
              <FilterChip
                label={t('questionBankTrueFalse')}
                onClick={() => setFilters({...filters, questionType: 'true_false'})}
                active={filters.questionType === 'true_false'}
              />
              <FilterChip
                label={t('questionBankShortAnswer')}
                onClick={() => setFilters({...filters, questionType: 'short_answer'})}
                active={filters.questionType === 'short_answer'}
              />
            </Box>
              </Box>
        </HeaderContainer>

        {/* Main Content */}
        <Box sx={{ mt: 3 }}>
          {tabValue === 0 && (
            <>

              {/* Bulk Actions */}
              {selectedQuestions.length > 0 && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2">
                      {t('questionBankSelectedQuestions')} {selectedQuestions.length} {t('questionBankSelectedQuestionsSuffix')}
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>{t('questionBankBulkAction')}</InputLabel>
                      <Select
                        value={bulkAction}
                        onChange={(e) => setBulkAction(e.target.value)}
                      >
                        <MenuItem value="delete">{t('questionBankDelete')}</MenuItem>
                        <MenuItem value="export">{t('commonExport')}</MenuItem>
                        <MenuItem value="duplicate">{t('commonDuplicate')}</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleBulkAction}
                      disabled={!bulkAction}
                    >
                      {t('questionBankApply')}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setSelectedQuestions([])}
                    >
                      {t('questionBankCancelSelection')}
                    </Button>
                  </Box>
                </Paper>
              )}

              {/* Questions List */}
              {error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                  <Button 
                    size="small" 
                    onClick={() => clearError?.()} 
                    sx={{ ml: 2 }}
                  >
                    {t('questionBankClose')}
                  </Button>
                </Alert>
              ) : (filteredQuestions?.length || 0) === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                      {t('questionBankNoQuestions')} {searchTerm && `${t('questionBankNoQuestionsMatch')} "${searchTerm}"`}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                      sx={{ 
                        borderRadius: 2,
                        background: 'linear-gradient(90deg, #333679 0%, #4DBFB3 100%)',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #0a3d5f 0%, #d17a6e 100%)',
                        },
                      }}
                  >
                    {t('questionBankCreateNew')}
                  </Button>
                  </motion.div>
                </Box>
              ) : (
                <Box>
                  <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
                    <Table sx={{ minWidth: 650 }} aria-label="questions table">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell align="center">
                              <TableSortLabel
                                active={orderBy === 'question_type'}
                                direction={orderBy === 'question_type' ? order : 'asc'}
                                onClick={() => handleRequestSort('question_type')}
                              >
                                {t('questionBankQuestionType')}
                              </TableSortLabel>
                            </TableCell>
                            <TableCell align="center">
                              <TableSortLabel
                                active={orderBy === 'difficulty_level'}
                                direction={orderBy === 'difficulty_level' ? order : 'asc'}
                                onClick={() => handleRequestSort('difficulty_level')}
                              >
                                {t('questionBankDifficultyLevel')}
                              </TableSortLabel>
                            </TableCell>
                            <TableCell align="center">{t('questionBankQuestionText')}</TableCell>
                            <TableCell align="center">{t('questionBankCourseLesson')}</TableCell>
                            <TableCell align="center">
                              <TableSortLabel
                                active={orderBy === 'created_at'}
                                direction={orderBy === 'created_at' ? order : 'asc'}
                                onClick={() => handleRequestSort('created_at')}
                              >
                                {t('questionBankCreatedAt')}
                              </TableSortLabel>
                            </TableCell>
                            <TableCell align="center">{t('questionBankActions')}</TableCell>
                          </TableRow>
                        </TableHead>
                      <TableBody>
                        {paginatedQuestions.map((question) => (
                          <TableRow
                            key={question.id}
                            sx={{ 
                              '&:last-child td, &:last-child th': { border: 0 },
                              '&:hover': { backgroundColor: '#f8f9fa' }
                            }}
                          >
                            <TableCell align="center">
                              <Chip
                                label={getQuestionTypeLabel(question.question_type)}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={getDifficultyLabel(question.difficulty_level)}
                                size="small"
                                color={getDifficultyColor(question.difficulty_level)}
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ maxWidth: 300 }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  lineHeight: 1.4,
                                  textAlign: 'center'
                                }}
                              >
                                {question.question_text}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ textAlign: 'center' }}>
                                {question.course_title && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                    📚 {question.course_title}
                                  </Typography>
                                )}
                                {question.lesson_title && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                    📖 {question.lesson_title}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="caption" color="text.secondary">
                                {new Date(question.created_at).toLocaleDateString('en-US')}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                <Tooltip title={t('questionBankView')}>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleOpenDialog(question)}
                                    sx={{ color: '#4DBFB3' }}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={t('questionBankEdit')}>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleOpenDialog(question)}
                                    sx={{ color: '#663399' }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={t('questionBankDelete')}>
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleDeleteQuestion(question.id)}
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
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredQuestions?.length || 0}
                    rowsPerPage={rowsPerPage}
                    page={tablePage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage={t('questionBankRowsPerPage')}
                    labelDisplayedRows={({ from, to, count }) => 
                      `${from}-${to} من ${count !== -1 ? count : `أكثر من ${to}`}`
                    }
                    sx={{ 
                      borderTop: '1px solid #e0e0e0',
                      backgroundColor: '#fafafa'
                    }}
                  />
                </Box>
              )}
            </>
          )}

          {tabValue === 1 && (
            <QuestionBankStats stats={stats} />
          )}

          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>
                الأسئلة الأكثر استخداماً
              </Typography>
              <List>
                {stats?.most_used_questions?.map((question, index) => (
                  <ListItem key={question.id} divider>
                    <ListItemText
                      primary={`${index + 1}. ${question.question_text}`}
                      secondary={`تم استخدامها ${question.usage_count} مرة`}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={`${question.usage_count} استخدام`}
                        color="primary"
                        variant="outlined"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Container>

      {/* Question Form Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <QuestionForm
            question={editingQuestion}
            onSubmit={handleQuestionSubmit}
            onCancel={handleCloseDialog}
            lessons={lessons || []}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDeleteQuestion}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ 
          textAlign: 'center', 
          color: '#d32f2f',
          fontWeight: 'bold',
          fontSize: '1.2rem'
        }}>
          ⚠️ {t('questionBankConfirmDelete')}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography id="delete-dialog-description" sx={{ mb: 2 }}>
            {t('questionBankConfirmDeleteMessage')}
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              {t('questionBankDeleteWarning')}
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
          <Button 
            onClick={cancelDeleteQuestion}
            variant="outlined"
            sx={{ 
              minWidth: 100,
              borderRadius: '20px'
            }}
          >
            {t('questionBankCancel')}
          </Button>
          <Button 
            onClick={confirmDeleteQuestion}
            variant="contained"
            color="error"
            sx={{ 
              minWidth: 100,
              borderRadius: '20px',
              backgroundColor: '#d32f2f',
              '&:hover': {
                backgroundColor: '#b71c1c'
              }
            }}
          >
            {t('questionBankDeleteConfirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionBankManager;
