import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
  Badge,
  Tabs,
  Tab,
  Paper,
  Container,
  InputAdornment,
  Skeleton,
  useTheme,
  alpha,
  keyframes,
  styled,
  Pagination,
  Chip,
  Avatar
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Psychology as PsychologyIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import FlashcardForm from './FlashcardForm';
import FlashcardCard from './FlashcardCard';
import useFlashcards from '../../hooks/useFlashcards';

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
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
    pointerEvents: 'none'
  }
}));

const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(2),
  background: 'white',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
  }
}));

const FilterBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
  border: '1px solid #dee2e6'
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

const FlashcardManager = ({ product = null, topic = null }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    related_question: '',
    has_images: ''
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const {
    flashcards = [],
    loading = false,
    error = null,
    pagination = { page: 1, pageSize: 20, totalPages: 1, totalCount: 0 },
    fetchFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    setPage,
    clearError
  } = useFlashcards();

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const handleOpenDialog = (flashcard = null) => {
    setEditingFlashcard(flashcard);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingFlashcard(null);
  };

  const handleFlashcardSubmit = async (flashcardData) => {
    // This function is called by FlashcardForm after successful creation/update
    // Refresh the flashcards list to show the new/updated flashcard
    await fetchFlashcards();
    showNotification(
      editingFlashcard ? t('flashcardUpdatedSuccessfully') : t('flashcardCreatedSuccessfully'),
      'success'
    );
    handleCloseDialog();
  };

  const handleDeleteFlashcard = async (flashcardId) => {
    try {
      const result = await deleteFlashcard(flashcardId);
      if (result.success) {
        showNotification(t('flashcardDeletedSuccessfully'), 'success');
      } else {
        showNotification(t('flashcardDeleteError'), 'error');
      }
    } catch (error) {
      showNotification(t('flashcardDeleteError'), 'error');
    }
  };

  const handleSearch = async (event) => {
    const searchValue = event.target.value;
    setSearchTerm(searchValue);
    
    if (searchValue.trim()) {
      await fetchFlashcards({
        search: searchValue,
        ...filters
      });
    } else {
      await fetchFlashcards(filters);
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
      await fetchFlashcards({
        search: searchTerm,
        ...newFilters
      });
    } else {
      await fetchFlashcards(newFilters);
    }
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setFilters({
      related_question: '',
      has_images: ''
    });
    fetchFlashcards();
  };

  const showNotification = (message, severity) => {
    setNotification({
      open: true,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handlePageChange = (event, page) => {
    setPage(page);
  };

  // Stats calculation
  const totalFlashcards = flashcards.length;
  const flashcardsWithImages = flashcards.filter(f => f.front_image || f.back_image).length;
  const flashcardsWithQuestions = flashcards.filter(f => f.related_question).length;

  const LoadingSkeleton = () => (
    <Grid container spacing={{ xs: 2, sm: 3, md: 3, lg: 3 }}>
      {[...Array(8)].map((_, index) => (
        <Grid 
          item 
          xs={12} 
          sm={6} 
          md={4} 
          lg={3} 
          xl={2.4}
          key={index}
        >
          <Skeleton 
            variant="rectangular" 
            height={{ xs: 250, sm: 280, md: 300, lg: 320 }} 
            sx={{ 
              borderRadius: 2,
              width: '100%'
            }} 
          />
        </Grid>
      ))}
    </Grid>
  );

  const EmptyState = () => (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <PsychologyIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
      <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
        {t('flashcardNoCards')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {t('flashcardNoCardsDescription')}
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleOpenDialog()}
        sx={{
          background: 'linear-gradient(135deg, #333679, #1a6ba8)',
          borderRadius: 2,
          px: 4,
          py: 1.5,
          '&:hover': {
            background: 'linear-gradient(135deg, #2a2d5a, #155a8a)'
          }
        }}
      >
        {t('flashcardCreateNew')}
      </Button>
    </Box>
  );

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
              <PsychologyIcon sx={{ fontSize: 32, color: 'white' }} />
              <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
                {t('flashcardTitle')}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
              {t('flashcardDescription')}
            </Typography>
          </Box>
        </Box>
        
        <Container sx={{ py: 4 }}>
          <Grid container spacing={{ xs: 2, sm: 3, md: 3, lg: 3 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                lg={3} 
                xl={2.4}
                key={item}
              >
                <Skeleton 
                  variant="rectangular" 
                  height={{ xs: 250, sm: 280, md: 300, lg: 320 }} 
                  sx={{ 
                    borderRadius: 3, 
                    mb: 2,
                    width: '100%'
                  }} 
                />
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

      <Container sx={{ py: 3 }}>
        {/* Create Flashcard Button - Fixed */}
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



        {/* Main Content */}
        <Box sx={{ mt: 3 }}>

          {/* Error Display */}
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : flashcards.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Flashcards Grid - Responsive */}
              <Grid container spacing={{ xs: 2, sm: 3, md: 3, lg: 3 }}>
                <AnimatePresence>
                  {flashcards.map((flashcard) => (
                    <Grid 
                      item 
                      xs={12} 
                      sm={6} 
                      md={4} 
                      lg={3} 
                      xl={2.4}
                      key={flashcard.id}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <FlashcardCard
                        flashcard={flashcard}
                        onEdit={handleOpenDialog}
                        onDelete={handleDeleteFlashcard}
                      />
                    </Grid>
                  ))}
                </AnimatePresence>
              </Grid>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </Container>

      {/* Flashcard Form Dialog */}
      <FlashcardForm
        open={openDialog}
        onClose={handleCloseDialog}
        flashcard={editingFlashcard}
        onSuccess={handleFlashcardSubmit}
        product={product}
        topic={topic}
      />

      {/* Notification Snackbar */}
      <Alert
        open={notification.open}
        onClose={handleCloseNotification}
        severity={notification.severity}
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          minWidth: 300
        }}
      >
        {notification.message}
      </Alert>
    </Box>
  );
};

export default FlashcardManager;
