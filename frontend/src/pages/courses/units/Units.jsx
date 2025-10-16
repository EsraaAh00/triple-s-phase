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
  CardActions,
  Chip,
  IconButton,
  Tooltip,
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
  Checkbox,
  Divider,
  Avatar,
  Badge,
  LinearProgress,
  CircularProgress,
  Alert,
  Snackbar,
  Menu,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  LibraryBooks as LibraryBooksIcon,
  MoreVert as MoreVertIcon,
  ArrowBack as ArrowBackIcon,
  AccessTime as AccessTimeIcon,
  PlayCircleOutline as PlayIcon,
  Article as ArticleIcon,
  Quiz as QuizIcon,
  Code as CodeIcon,
  VideoLibrary as VideoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  CloudUpload as CloudUploadIcon,
  Settings as SettingsIcon,
  ContentCopy as ContentCopyIcon,
  Archive as ArchiveIcon,
  RestoreFromTrash as RestoreIcon,
  AddCircleOutline,
  AddCircle,
  SubdirectoryArrowRight as SubdirectoryArrowRightIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import contentAPI from '../../../services/content.service';
import { courseAPI } from '../../../services/api.service';

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
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '12px',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  border: `1px solid ${theme.palette.divider}`,
  maxWidth: 320,
  marginInline: 'auto',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    borderColor: theme.palette.primary.main,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: '8px 20px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
}));

const Units = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { t, i18n } = useTranslation();
  const [units, setUnits] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('order');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100); // Increase default to show more units

  // Loading course data
  const fetchCourse = async () => {
    try {
      const courseData = await courseAPI.getCourse(courseId);
      setCourse(courseData);
      console.log('Course loaded:', courseData);
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  // Fetching from API instead of dummy data

  useEffect(() => {
    const fetchUnits = async () => {
      setLoading(true);
      try {
        const data = await contentAPI.getModules(courseId);
        console.log('Raw API response:', data);
        
        // Handle different response formats
        let items = [];
        if (Array.isArray(data)) {
          items = data;
        } else if (data?.results && Array.isArray(data.results)) {
          items = data.results;
        } else if (data?.modules && Array.isArray(data.modules)) {
          items = data.modules;
        } else if (data?.data && Array.isArray(data.data)) {
          items = data.data;
        }
        
        console.log('Processed items:', items);
        console.log('Total items count:', items.length);
        
        if (items.length === 0) {
          console.warn('No items found in API response');
        }
        
        const mapped = items.map((m) => ({
          id: m.id,
          title: m.name || '',
          description: m.description || '',
          duration: typeof m.video_duration === 'number' ? Math.round(m.video_duration / 60) : 0,
          order: m.order,
          status: m.status || (m.is_active ? 'published' : 'draft'),
          isPreview: m.is_active === false,
          lessonsCount: Array.isArray(m.lessons) ? m.lessons.length : (m.lessons_count || 0),
          completedLessons: 0,
          createdAt: m.created_at,
          updatedAt: m.updated_at,
          submodule: m.submodule || null,
          submodule_name: m.submodule_name || null,
          is_submodule: m.is_submodule || false,
          submodules_count: m.submodules_count || 0,
        }));
        setUnits(mapped);
        console.log('Final mapped units count:', mapped.length);
        
        // Show warning if we got fewer units than expected
        if (mapped.length < 20) {
          console.warn(`Only ${mapped.length} units loaded. Expected more.`);
        }
        
        // Log main modules count
        const mainModules = mapped.filter(m => !m.is_submodule);
        console.log(`Main modules count: ${mainModules.length}`);
      } catch (error) {
        console.error('Error fetching units:', error);
        console.error('Error details:', error.response?.data);
        setSnackbar({
          open: true,
          message: t('unitsErrorLoadingUnits'),
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
    fetchUnits();
  }, [courseId]);

  const handleMenuOpen = (event, unit) => {
    console.log('Menu opened for unit:', unit);
    console.log('Setting selectedUnit to:', unit);
    setAnchorEl(event.currentTarget);
    setSelectedUnit(unit);
    console.log('selectedUnit state updated');
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Only clear selectedUnit if dialog is not open
    if (!openDeleteDialog) {
      setSelectedUnit(null);
    }
  };

  const handleEditUnit = (unit) => {
    handleMenuClose();
    if (unit) {
      navigate(`/teacher/courses/${courseId}/units/${unit.id}/edit`);
    }
  };

  const handleViewUnit = (unit) => {
    handleMenuClose();
    if (unit) {
      navigate(`/teacher/courses/${courseId}/units/${unit.id}`);
    }
  };

  const handleOpenLessons = (unit) => {
    handleMenuClose();
    if (unit) {
      navigate(`/teacher/courses/${courseId}/units/${unit.id}/lessons`);
    }
  };

  const handleDeleteUnit = () => {
    console.log('handleDeleteUnit called for unit:', selectedUnit);
    console.log('Setting openDeleteDialog to true');
    // Don't close menu yet, keep selectedUnit for the dialog
    setAnchorEl(null); // Close menu but keep selectedUnit
    setOpenDeleteDialog(true);
  };

  const confirmDeleteUnit = async () => {
    console.log('confirmDeleteUnit called');
    console.log('selectedUnit:', selectedUnit);
    console.log('selectedUnit type:', typeof selectedUnit);
    console.log('selectedUnit is null:', selectedUnit === null);
    console.log('selectedUnit is undefined:', selectedUnit === undefined);
    
    if (selectedUnit) {
      try {
        setLoading(true);
        
        console.log('Starting delete process for unit:', selectedUnit.id);
        console.log('Token exists:', !!localStorage.getItem('token'));
        console.log('Token value:', localStorage.getItem('token'));
        console.log('Course data:', course);
        
        // Check authentication
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (!token || !user) {
          setSnackbar({
            open: true,
            message: t('unitsMustLoginFirst'),
            severity: 'error'
          });
          setOpenDeleteDialog(false);
          setSelectedUnit(null);
          setLoading(false);
          return;
        }
        
        // Parse user data to check role
        try {
          const userData = JSON.parse(user);
          console.log('User data:', userData);
          console.log('User profile:', userData.profile);
          
          // Get role from profile or user data
          const userRole = userData.profile?.status || userData.role || 'student';
          console.log('User role:', userRole);
          
          // Check if user is teacher, instructor, or admin
          if (!['teacher', 'instructor', 'admin'].includes(userRole.toLowerCase())) {
            setSnackbar({
              open: true,
              message: t('unitsNoPermissionToDelete'),
              severity: 'error'
            });
            setOpenDeleteDialog(false);
            setSelectedUnit(null);
            setLoading(false);
            return;
          }
          
          // Check if user is the course owner (for teachers/instructors)
          if (['teacher', 'instructor'].includes(userRole.toLowerCase()) && course && course.instructor_id !== userData.id) {
            setSnackbar({
              open: true,
              message: t('unitsCanOnlyDeleteOwnUnits'),
              severity: 'error'
            });
            setOpenDeleteDialog(false);
            setSelectedUnit(null);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          setSnackbar({
            open: true,
            message: t('unitsUserDataError'),
            severity: 'error'
          });
          setOpenDeleteDialog(false);
          setSelectedUnit(null);
          setLoading(false);
          return;
        }
        
        // Check if unit has submodules
        if (selectedUnit.submodules_count > 0) {
          setSnackbar({
            open: true,
            message: t('unitsCannotDeleteWithSubunits'),
            severity: 'error'
          });
          setOpenDeleteDialog(false);
          setSelectedUnit(null);
          setLoading(false);
          return;
        }
        
        console.log('Calling deleteModule API...');
        // Call API to delete the unit
        await contentAPI.deleteModule(selectedUnit.id);
        console.log('Delete API call successful');
        
        // Update local state
        setUnits(prev => prev.filter(unit => unit.id !== selectedUnit.id));
        setSnackbar({
          open: true,
          message: t('unitsUnitDeletedSuccessfully'),
          severity: 'success'
        });
      } catch (error) {
        console.error('Error deleting unit:', error);
        console.error('Error response:', error.response);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        
        let errorMessage = t('unitsErrorDeletingUnit');
        
        if (error.response?.status === 401) {
          errorMessage = t('unitsMustLoginFirst');
        } else if (error.response?.status === 403) {
          errorMessage = t('unitsNoPermissionToDeleteThisUnit');
        } else if (error.response?.status === 404) {
          errorMessage = t('unitsUnitNotFound');
        } else if (error.response?.status === 400) {
          errorMessage = error.response.data?.error || t('unitsCannotDeleteThisUnit');
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    } else {
      console.log('No selectedUnit found, cannot delete');
      setSnackbar({
        open: true,
        message: t('unitsNoUnitSelectedForDeletion'),
        severity: 'error'
      });
    }
    setOpenDeleteDialog(false);
    setSelectedUnit(null);
  };

  const handleCreateUnit = () => {
    navigate(`/teacher/courses/${courseId}/units/new`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'published':
        return t('unitsPublished');
      case 'draft':
        return t('unitsDraft');
      case 'archived':
        return t('unitsArchived');
      default:
        return t('unitsUnknown');
    }
  };

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || unit.status === filterStatus;
    const matchesType = filterType === 'all' || 
                       (filterType === 'main' && !unit.is_submodule) ||
                       (filterType === 'sub' && unit.is_submodule);
    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedUnits = [...filteredUnits].sort((a, b) => {
    switch (sortBy) {
      case 'order':
        return a.order - b.order;
      case 'title':
        return a.title.localeCompare(b.title);
      case 'duration':
        return b.duration - a.duration;
      case 'created':
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return a.order - b.order;
    }
  });

  const getUnitIcon = (unit) => {
    // You can customize this based on unit type or content
    if (unit.is_submodule) {
      return <SubdirectoryArrowRightIcon />;
    }
    return <ArticleIcon />;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, direction: i18n.language === 'en' ? 'ltr' : 'rtl' }}>
      {/* Header */}
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
            onClick={() => navigate(`/teacher/my-courses`)} 
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
              {t('unitsCourseUnits')}
            </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
              {t('unitsManageCourseUnits')}
            </Typography>
          </Box>
        </Box>
        
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
            variant="contained"
            startIcon={<AddCircle />}
            onClick={handleCreateUnit}
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
            {t('unitsAddNewUnit')}
              </Button>
          {selectedUnit && (
                <Button
              variant="outlined"
              startIcon={<LibraryBooksIcon />}
              onClick={() => handleOpenLessons(selectedUnit)}
                  sx={{ 
                    borderColor: 'rgba(255,255,255,0.4)',
                    color: 'white',
                    borderRadius: '25px',
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 15px rgba(255,255,255,0.2)',
                    },
                    transition: 'all 0.3s ease',
                  }}
            >
              {t('unitsLessons')}
                </Button>
          )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Filters and Search */}
      <StyledPaper elevation={0}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          <TextField
            fullWidth
            placeholder={t('unitsSearchUnits')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
            sx={{ minWidth: 300 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>{t('unitsStatus')}</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label={t('unitsStatus')}
            >
              <MenuItem value="all">{t('unitsAll')}</MenuItem>
              <MenuItem value="published">{t('unitsPublished')}</MenuItem>
              <MenuItem value="draft">{t('unitsDraft')}</MenuItem>
              <MenuItem value="archived">{t('unitsArchived')}</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>{t('unitsUnitType')}</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label={t('unitsUnitType')}
            >
              <MenuItem value="all">{t('unitsAll')}</MenuItem>
              <MenuItem value="main">{t('unitsMainUnits')}</MenuItem>
              <MenuItem value="sub">{t('unitsSubUnits')}</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>{t('unitsSortBy')}</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label={t('unitsSortBy')}
            >
              <MenuItem value="order">{t('unitsOrder')}</MenuItem>
              <MenuItem value="title">{t('unitsTitle')}</MenuItem>
              <MenuItem value="duration">{t('unitsDuration')}</MenuItem>
              <MenuItem value="created">{t('unitsCreationDate')}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Units Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <LinearProgress sx={{ width: '100%' }} />
          </Box>
        ) : sortedUnits.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {t('unitsNoUnits')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {searchTerm || filterStatus !== 'all' 
                ? t('unitsTryChangingSearchCriteria') 
                : t('unitsStartAddingNewUnit')
              }
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: 2, 
                overflow: 'auto', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                maxHeight: '70vh',
                '&::-webkit-scrollbar': {
                  width: '8px',
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#c1c1c1',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#a8a8a8',
                  },
                },
              }}
            >
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                    <TableCell sx={{ 
                      color: 'white', 
                      fontWeight: 600, 
                      py: 2, 
                      px: 3, 
                      textAlign: 'center',
                      minWidth: '200px',
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                      backgroundColor: theme.palette.primary.main
                    }}>{t('unitsUnit')}</TableCell>
                    <TableCell sx={{ 
                      color: 'white', 
                      fontWeight: 600, 
                      py: 2, 
                      px: 3, 
                      textAlign: 'center', 
                      minWidth: '200px',
                      maxWidth: '300px'
                    }}>{t('unitsDescription')}</TableCell>
                    <TableCell sx={{ 
                      color: 'white', 
                      fontWeight: 600, 
                      py: 2, 
                      px: 1, 
                      textAlign: 'center', 
                      width: '140px', 
                      minWidth: '140px'
                    }}>{t('unitsMainUnit')}</TableCell>
                    <TableCell sx={{ 
                      color: 'white', 
                      fontWeight: 600, 
                      py: 2, 
                      px: 2, 
                      textAlign: 'center', 
                      width: '100px', 
                      minWidth: '100px'
                    }}>{t('unitsDuration')}</TableCell>
                    <TableCell sx={{ 
                      color: 'white', 
                      fontWeight: 600, 
                      py: 2, 
                      px: 2, 
                      textAlign: 'center', 
                      width: '120px', 
                      minWidth: '120px'
                    }}>{t('unitsLessonsCount')}</TableCell>
                    <TableCell sx={{ 
                      color: 'white', 
                      fontWeight: 600, 
                      py: 2, 
                      px: 2, 
                      textAlign: 'center', 
                      width: '140px', 
                      minWidth: '140px'
                    }}>{t('unitsStatus')}</TableCell>
                    <TableCell sx={{ 
                      color: 'white', 
                      fontWeight: 600, 
                      py: 2, 
                      px: 3, 
                      textAlign: 'center',
                      width: '200px',
                      minWidth: '200px',
                      position: 'sticky',
                      right: 0,
                      zIndex: 1,
                      backgroundColor: theme.palette.primary.main
                    }}>{t('unitsActions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedUnits
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((unit) => (
                    <TableRow key={unit.id} hover sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                      <TableCell sx={{ 
                        py: 2, 
                        px: 3,
                        minWidth: '200px',
                        position: 'sticky',
                        left: 0,
                        zIndex: 1,
                        backgroundColor: 'inherit'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: theme.palette.primary.main,
                              width: 48,
                              height: 48,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                          >
                            {getUnitIcon(unit)}
                          </Avatar>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.2 }}>
                              {unit.title}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                              {t('unitsOrder')}: {unit.order}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ 
                        py: 2, 
                        px: 3, 
                        minWidth: '200px',
                        maxWidth: '300px'
                      }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 300, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            lineHeight: 1.4
                          }}
                        >
                          {unit.description || t('unitsNoDescription')}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2, px: 1, textAlign: 'center', width: '140px', minWidth: '140px' }}>
                        {unit.is_submodule ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <Chip
                              label={unit.submodule_name || t('unitsSubUnit')}
                              color="secondary"
                              size="small"
                              variant="outlined"
                              sx={{ 
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: '24px',
                                '& .MuiChip-label': {
                                  px: 1
                                }
                              }}
                            />
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
                            {t('unitsMainUnit')}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 2, px: 2, textAlign: 'center', width: '100px', minWidth: '100px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                            {unit.duration} {t('unitsMinutes')}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2, px: 2, textAlign: 'center', width: '120px', minWidth: '120px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <ArticleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                            {unit.lessonsCount}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2, px: 2, textAlign: 'center', width: '140px', minWidth: '140px' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                          <Chip
                            label={getStatusText(unit.status)}
                            color={getStatusColor(unit.status)}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600, minWidth: 70 }}
                          />
                          {unit.isPreview && (
                            <Chip
                              label={t('unitsPreview')}
                              color="primary"
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 600, minWidth: 70 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ 
                        py: 2, 
                        px: 3, 
                        textAlign: 'center',
                        width: '200px',
                        minWidth: '200px',
                        position: 'sticky',
                        right: 0,
                        zIndex: 1,
                        backgroundColor: 'inherit'
                      }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title={t('unitsViewUnit')}>
                            <IconButton
                              size="small"
                              onClick={() => handleViewUnit(unit)}
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
                          <Tooltip title={t('unitsLessons')}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenLessons(unit)}
                              sx={{ 
                                color: 'success.main',
                                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                '&:hover': {
                                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <LibraryBooksIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('unitsEdit')}>
                            <IconButton
                              size="small"
                              onClick={() => handleEditUnit(unit)}
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
                          <Tooltip title={t('unitsMore')}>
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, unit)}
                              sx={{ 
                                backgroundColor: 'rgba(158, 158, 158, 0.1)',
                                '&:hover': {
                                  backgroundColor: 'rgba(158, 158, 158, 0.2)',
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <MoreVertIcon fontSize="small" />
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
              count={sortedUnits.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage={t('unitsRowsPerPage')}
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${t('unitsOf')} ${count}`}
            />
          </>
        )}
      </StyledPaper>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          console.log('Menu close clicked');
          handleMenuClose();
        }}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <MenuItem onClick={() => {
          console.log('View menu item clicked');
          handleViewUnit(selectedUnit);
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('unitsViewUnit')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          console.log('Lessons menu item clicked');
          handleOpenLessons(selectedUnit);
        }}>
          <ListItemIcon>
            <LibraryBooksIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('unitsLessons')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          console.log('Edit menu item clicked');
          handleEditUnit(selectedUnit);
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('unitsEditUnit')}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          console.log('Delete menu item clicked');
          handleDeleteUnit();
        }} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>{t('unitsDeleteUnit')}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => {
          console.log('Dialog close clicked');
          setOpenDeleteDialog(false);
          setSelectedUnit(null); // Clear selectedUnit when dialog closes
        }}
        PaperProps={{
          sx: { borderRadius: '12px' },
        }}
      >
        <DialogTitle>{t('unitsConfirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('unitsDeleteConfirmationMessage', { title: selectedUnit?.title })}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Unit ID: {selectedUnit?.id}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDeleteDialog(false);
            setSelectedUnit(null);
          }} disabled={loading}>
            {t('unitsCancel')}
          </Button>
          <Button 
            onClick={() => {
              console.log('Delete button clicked in dialog');
              confirmDeleteUnit();
            }} 
            color="error" 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? t('unitsDeleting') : t('unitsDelete')}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Container>
  );
};

export default Units; 