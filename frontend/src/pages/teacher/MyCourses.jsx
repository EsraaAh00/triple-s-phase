import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button,
  Chip,
  CircularProgress,
  Paper,
  TextField,
  IconButton,
  Fade,
  Tooltip,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Backdrop,
  Slide
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { 
  School as SchoolIcon, 
  People as PeopleIcon, 
  Search as SearchIcon,
  Add as AddIcon,
  Star as StarIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  LibraryBooks as LibraryBooksIcon,
  FilterList,
  Clear,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@mui/system';
import { courseAPI } from '../../services/courseService';

// Helper: truncate text to a fixed number of characters and append ellipsis
const truncateText = (text, maxChars = 30) => {
  if (!text) return '';
  const clean = String(text).trim();
  return clean.length > maxChars ? `${clean.slice(0, maxChars)}…` : clean;
};

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`;

const scaleIn = keyframes`
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;


const MyCourses = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    courseId: null,
    courseName: '',
    loading: false
  });
  const navigate = useNavigate();

  // Debug: log categories state
  console.log('Categories state:', categories);
  console.log('Categories length:', categories.length);

  useEffect(() => {
    const fetchCourses = async () => {
    try {
      setLoading(true);
        const coursesData = await courseAPI.getCourses();
        console.log('Courses API response:', coursesData);
        // Ensure coursesData is an array
        const coursesArray = Array.isArray(coursesData) ? coursesData : 
                           coursesData.results ? coursesData.results : 
                           coursesData.data ? coursesData.data : [];
        console.log('Processed courses array:', coursesArray);
        
        // Log sample course data to understand structure
        if (coursesArray.length > 0) {
          console.log('Sample course data:', coursesArray[0]);
          console.log('Sample course category:', coursesArray[0].category);
          console.log('Sample course category_id:', coursesArray[0].category_id);
        }
        
        setCourses(coursesArray);
        setAllCourses(coursesArray);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setSnackbar({
          open: true,
          message: t('coursesLoadingError'),
          severity: 'error'
        });
        // Set empty array as fallback
        setCourses([]);
        setAllCourses([]);
    } finally {
      setLoading(false);
    }
  };

    fetchCourses();
  }, []);

  // Fetch categories independently
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories...');
        const categoriesData = await courseAPI.getCategories();
        console.log('Categories API response:', categoriesData);
        // Ensure categoriesData is an array
        const categoriesArray = Array.isArray(categoriesData) ? categoriesData : 
                              categoriesData.results ? categoriesData.results : 
                              categoriesData.data ? categoriesData.data : [];
        console.log('Processed categories array:', categoriesArray);
        console.log('Categories length:', categoriesArray.length);
        
        // Log sample category data
        if (categoriesArray.length > 0) {
          console.log('Sample category data:', categoriesArray[0]);
        }
        
        setCategories(categoriesArray);
      } catch (error) {
        console.error('Error fetching categories:', error);
        console.log('Trying fallback: extracting categories from courses...');
        // Try to extract categories from courses as fallback
        const uniqueCategories = [];
        const categoryMap = new Map();
        allCourses.forEach(course => {
          console.log('Course category:', course.category);
          console.log('Course category_id:', course.category_id);
          console.log('Course category_name:', course.category_name);
          
          // Try different ways to get category info
          let category = null;
          if (course.category && course.category.id) {
            category = course.category;
          } else if (course.category_id && course.category_name) {
            category = { id: course.category_id, name: course.category_name };
          } else if (course.category && typeof course.category === 'object') {
            category = course.category;
          }
          
          if (category && category.id && !categoryMap.has(category.id)) {
            categoryMap.set(category.id, category);
            uniqueCategories.push(category);
          }
        });
        console.log('Fallback categories:', uniqueCategories);
        setCategories(uniqueCategories);
      }
    };

    fetchCategories();
  }, [allCourses]);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (selectedCategory) {
        try {
          const subcategoriesData = await courseAPI.getSubCategories(selectedCategory);
          console.log('Subcategories API response:', subcategoriesData);
          setSubcategories(subcategoriesData);
        } catch (error) {
          console.error('Error fetching subcategories:', error);
          setSubcategories([]);
        }
      } else {
        setSubcategories([]);
        setSelectedSubcategory('');
      }
    };

    fetchSubCategories();
  }, [selectedCategory]);

  // Handle search input
  const handleSearch = (event) => {
    const value = event.target.value;
    console.log('Search input changed:', value);
    setSearchQuery(value);
  };

  // Apply filters
  useEffect(() => {
    console.log('=== APPLYING FILTERS ===');
    console.log('Search query:', searchQuery);
    console.log('Selected category:', selectedCategory);
    console.log('Selected status:', selectedStatus);
    console.log('Selected level:', selectedLevel);
    console.log('All courses count:', allCourses.length);
    console.log('Available categories:', categories);
    console.log('========================');
    
    let filtered = [...allCourses];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(course => {
        const titleMatch = course.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const descMatch = course.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const categoryNameMatch = course.category_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const categoryMatch = course.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return titleMatch || descMatch || categoryNameMatch || categoryMatch;
      });
      console.log('After search filter:', filtered.length);
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(course => {
        // Try different ways to get category ID
        const courseCategoryId = course.category?.id || 
                                course.category_id || 
                                course.category?.pk ||
                                course.category;
        
        // Convert both to numbers for comparison
        const courseId = parseInt(courseCategoryId);
        const selectedId = parseInt(selectedCategory);
        
        const match = courseId === selectedId;
        console.log(`Course ${course.id}: categoryId=${courseCategoryId} (${courseId}), selected=${selectedCategory} (${selectedId}), match=${match}`);
        console.log('Course category object:', course.category);
        console.log('Course category_id:', course.category_id);
        console.log('Course category_name:', course.category_name);
        return match;
      });
      console.log('After category filter:', filtered.length);
    }


    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(course => {
        const match = course.status === selectedStatus;
        console.log(`Course ${course.id}: status=${course.status}, selected=${selectedStatus}, match=${match}`);
        return match;
      });
      console.log('After status filter:', filtered.length);
    }

    // Level filter
    if (selectedLevel) {
      filtered = filtered.filter(course => {
        const match = course.level === selectedLevel;
        console.log(`Course ${course.id}: level=${course.level}, selected=${selectedLevel}, match=${match}`);
        return match;
      });
      console.log('After level filter:', filtered.length);
    }

    console.log('Final filtered count:', filtered.length);
    setCourses(filtered);
  }, [searchQuery, selectedCategory, selectedSubcategory, selectedStatus, selectedLevel, allCourses]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // This will trigger the filter effect above
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Clear all filters
  const clearFilters = () => {
    console.log('Clearing all filters...');
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedStatus('');
    setSelectedLevel('');
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Filter courses based on search query
  const filteredCourses = courses;

  // Handle course click - navigate to course detail page
  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  // Handle create course - navigate to create course page
  const handleCreateCourse = () => {
    navigate('/teacher/courses/new');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Header Component
  const Header = () => (
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
            <SchoolIcon sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
              {t('coursesMyCourses')}
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
          {t('coursesManageCoursesAndContent')}
          </Typography>
        </Box>
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Handle delete course - open confirmation dialog
  const handleDeleteCourse = (courseId, courseName) => {
    setDeleteDialog({
      open: true,
      courseId,
      courseName,
      loading: false
    });
  };

  // Confirm delete course
  const confirmDeleteCourse = async () => {
    setDeleteDialog(prev => ({ ...prev, loading: true }));
    
    try {
      await courseAPI.deleteCourse(deleteDialog.courseId);
      setSnackbar({
        open: true,
        message: t('coursesDeleteCourseSuccess'),
        severity: 'success'
      });
      // Remove course from local state
      setCourses(prevCourses => prevCourses.filter(c => c.id !== deleteDialog.courseId));
      setAllCourses(prevCourses => prevCourses.filter(c => c.id !== deleteDialog.courseId));
      
      // Close dialog
      setDeleteDialog({
        open: false,
        courseId: null,
        courseName: '',
        loading: false
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      setSnackbar({
        open: true,
        message: t('coursesDeleteCourseError'),
        severity: 'error'
      });
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteDialog({
      open: false,
      courseId: null,
      courseName: '',
      loading: false
    });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#f8f9fa',
      direction: 'rtl'
    }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Header />
        
        {/* Create Course Button - Fixed */}
        <Box sx={{ position: 'fixed', top: 100, left: 32, zIndex: 1200 }}>
          <IconButton
            onClick={handleCreateCourse}
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
        
        {/* Filters Section - Compact */}
        <Card sx={{ 
          mb: 3, 
          borderRadius: 2, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
        }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              flexWrap: 'wrap'
            }}>
              {/* Search Field */}
              <TextField
                label={t('commonSearch')}
                value={searchQuery}
                onChange={handleSearch}
                size="small"
                placeholder={t('coursesSearchPlaceholder')}
                sx={{ 
                  minWidth: 200,
                  flex: '1 1 200px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white'
                  }
                }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.2rem' }} />
                }}
              />
              
              {/* Category Filter */}
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>{t('coursesCategory')}</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label={t('coursesCategory')}
                  sx={{ 
                    borderRadius: 2,
                    backgroundColor: 'white'
                  }}
                >
                  <MenuItem value="">{t('commonAll')}</MenuItem>
                  {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              
              {/* Status Filter */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>{t('coursesStatus')}</InputLabel>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  label={t('coursesStatus')}
                  sx={{ 
                    borderRadius: 2,
                    backgroundColor: 'white'
                  }}
                >
                  <MenuItem value="">{t('commonAll')}</MenuItem>
                  <MenuItem value="published">{t('coursesPublished')}</MenuItem>
                  <MenuItem value="draft">{t('coursesDraft')}</MenuItem>
                </Select>
              </FormControl>
              
              {/* Results Counter */}
              <Chip 
                label={`${courses.length} ${t('commonOf')} ${allCourses.length}`} 
                color={courses.length !== allCourses.length ? "secondary" : "primary"}
                size="small" 
                variant="outlined"
                sx={{ 
                  minWidth: 'fit-content',
                  fontWeight: 'bold',
                  borderRadius: 2
                }}
              />
              
              {/* Clear Filters Button */}
              <IconButton
                onClick={clearFilters}
                disabled={!searchQuery && !selectedCategory && !selectedSubcategory && !selectedStatus}
                size="small"
                sx={{ 
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'rgba(244,67,54,0.1)',
                    color: 'error.main',
                    transform: 'scale(1.05)'
                  },
                  '&:disabled': {
                    opacity: 0.4,
                    cursor: 'not-allowed'
                  },
                  transition: 'all 0.2s ease'
                }}
                title={t('commonClearFilters')}
              >
                <Clear sx={{ fontSize: '1.1rem' }} />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
        
        {/* Main Content - Table */}
          {filteredCourses.length === 0 ? (
            <Fade in={true} timeout={500}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 3, md: 6 }, 
                  textAlign: 'center', 
                  bgcolor: 'white',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  maxWidth: '600px',
                  mx: 'auto',
                  my: 4
                }}
              >
                <Box sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 3,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(46, 204, 113, 0.1) 100%)',
                    animation: `${pulse} 2s infinite ease-in-out`,
                  }
                }}>
                  <SchoolIcon 
                    color="disabled" 
                          sx={{
                    fontSize: 60, 
                    position: 'relative',
                    top: '50%',
                    transform: 'translateY(-50%)'
                          }}
                        />
                      </Box>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchQuery ? t('commonNoResults') : t('coursesNoCoursesRegisteredYet')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '400px', mx: 'auto' }}>
                  {searchQuery 
                    ? t('coursesNoSearchResults')
                    : t('coursesStartCreatingNewCourse')
                  }
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleCreateCourse}
                  sx={{
                    background: 'linear-gradient(90deg, #333679 0%, #4DBFB3 100%)',
                    color: 'white',
                    borderRadius: 2,
                    px: 4,
                    py: 1,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(14, 81, 129, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #0a3d5f 0%, #d17a6e 100%)',
                      boxShadow: '0 6px 20px rgba(14, 81, 129, 0.4)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {t('coursesCreateNewCourse')}
                </Button>
              </Paper>
            </Fade>
          ) : (
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="courses table">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #e0e0e0', textAlign: 'center', py: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: 1, 
                          bgcolor: '#333679',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: 0.5, 
                            bgcolor: 'white' 
                          }} />
                        </Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {t('coursesImage')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #e0e0e0', textAlign: 'center', py: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <SchoolIcon sx={{ fontSize: 20, color: '#333679' }} />
                        <Typography variant="subtitle2" fontWeight={700}>
                          {t('coursesCourseTitle')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #e0e0e0', textAlign: 'center', py: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 20, 
                          height: 20, 
                          borderRadius: '50%', 
                          bgcolor: '#333679',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          #
                        </Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {t('coursesCategory')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #e0e0e0', textAlign: 'center', py: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <PeopleIcon sx={{ fontSize: 20, color: '#333679' }} />
                        <Typography variant="subtitle2" fontWeight={700}>
                          {t('coursesStudents')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #e0e0e0', textAlign: 'center', py: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <StarIcon sx={{ fontSize: 20, color: '#333679' }} />
                        <Typography variant="subtitle2" fontWeight={700}>
                          {t('coursesRating')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #e0e0e0', textAlign: 'center', py: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 20, 
                          height: 20, 
                          borderRadius: '50%', 
                          bgcolor: '#333679',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          $
                        </Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {t('coursesPrice')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #e0e0e0', textAlign: 'center', py: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <EditIcon sx={{ fontSize: 20, color: '#333679' }} />
                        <Typography variant="subtitle2" fontWeight={700}>
                          {t('coursesActions')}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCourses
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((course) => (
                    <TableRow 
                      key={course.id}
                      hover
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'rgba(14, 81, 129, 0.04)'
                        }
                      }}
                      onClick={() => handleCourseClick(course.id)}
                    >
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box
                          component="img"
                          src={course.image || 'https://via.placeholder.com/120x90/3498db/ffffff?text=Course'}
                          alt={course.title}
                          sx={{ 
                            width: 120, 
                            height: 90,
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            objectFit: 'cover',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                            }
                          }}
                        />
                        </Box>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5, textAlign: 'center' }}>
                            {course.title}
                          </Typography>
                          {course.module_name && (
                            <Typography 
                              variant="body2" 
                              color="primary.main"
                              sx={{
                                mb: 0.5,
                                textAlign: 'center',
                                fontWeight: 500,
                                fontSize: '0.85rem'
                              }}
                            >
                              {course.module_name}
                            </Typography>
                          )}
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',

                              textAlign: 'center'
                            }}
                          >
                            {course.short_description || course.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                          <Chip 
                            label={course.category?.name || course.category_name || t('commonNotSpecified')} 
                            size="small" 
                            sx={{ 
                              fontWeight: 'bold',
                              bgcolor: '#3498db',
                              color: 'white',
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                          <PeopleIcon color="action" fontSize="small" />
                          <Typography variant="body2">
                            {course.total_enrollments || 0}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                          <StarIcon sx={{ color: '#f39c12', fontSize: '1rem' }} />
                          <Typography variant="body2">
                            {course.average_rating || 0}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography 
                          variant="body2" 
                          color={course.is_free ? 'success.main' : 'primary.main'} 
                          fontWeight="bold"
                        >
                          {course.is_free ? t('coursesFree') : `$${course.price}`}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: 1, 
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: 120
                        }}>
                          {/* الصف الأول */}
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title={t('coursesEditCourse')}>
                              <IconButton
                                size="small"
                                sx={{ 
                                  bgcolor: 'rgba(124,77,255,0.1)', 
                                  '&:hover': {
                                    bgcolor: 'rgba(124,77,255,0.2)',
                                    transform: 'scale(1.1)'
                                  }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/teacher/courses/${course.id}/edit`);
                                }}
                              >
                                <EditIcon sx={{ color: '#7c4dff', fontSize: '1rem' }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('coursesCourseDetails')}>
                              <IconButton
                                size="small"
                                sx={{ 
                                  bgcolor: 'rgba(67,160,71,0.1)', 
                                  '&:hover': {
                                    bgcolor: 'rgba(67,160,71,0.2)',
                                    transform: 'scale(1.1)'
                                  }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/courses/${course.id}`);
                                }}
                              >
                                <VisibilityIcon sx={{ color: '#43a047', fontSize: '1rem' }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          
                          {/* الصف الثاني */}
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title={t('coursesCourseUnits')}>
                              <IconButton
                                size="small"
                                sx={{ 
                                  bgcolor: 'rgba(231,76,60,0.1)', 
                                  '&:hover': {
                                    bgcolor: 'rgba(231,76,60,0.2)',
                                    transform: 'scale(1.1)'
                                  }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/teacher/courses/${course.id}/units`);
                                }}
                              >
                                <LibraryBooksIcon sx={{ color: '#e74c3c', fontSize: '1rem' }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('coursesDeleteCourse')}>
                              <IconButton
                                size="small"
                                sx={{ 
                                  bgcolor: 'rgba(192,57,43,0.1)', 
                                  '&:hover': {
                                    bgcolor: 'rgba(192,57,43,0.2)',
                                    transform: 'scale(1.1)'
                                  }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCourse(course.id, course.title);
                                }}
                              >
                                <DeleteIcon sx={{ color: '#c0392b', fontSize: '1rem' }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredCourses.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage={t('coursesRowsPerPage')}
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} ${t('commonOf')} ${count !== -1 ? count : `${t('commonMoreThan')} ${to}`}`
              }
              sx={{ 
                direction: 'rtl',
                '& .MuiTablePagination-toolbar': {
                  direction: 'rtl'
                }
              }}
            />
          </Card>
        )}
    </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={cancelDelete}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            animation: `${scaleIn} 0.3s ease-out`,
            border: '1px solid rgba(192,57,43,0.2)'
          }
        }}
        BackdropComponent={Backdrop}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)'
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pb: 2,
          background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
          color: 'white',
          borderRadius: '12px 12px 0 0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            animation: `${pulse} 3s ease-in-out infinite`
          }} />
          <WarningIcon 
            sx={{ 
              fontSize: 48, 
              mb: 2,
              animation: `${shake} 0.5s ease-in-out infinite`,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
            }} 
          />
          <Typography variant="h5" sx={{ fontWeight: 'bold', position: 'relative', zIndex: 1 }}>
            {t('coursesConfirmDelete')}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 500 }}>
            {t('coursesAreYouSureDeleteCourse')}
          </Typography>
          
          <Paper sx={{ 
            p: 3, 
            mb: 3,
            background: 'linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%)',
            border: '2px dashed #ff6b6b',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Typography variant="body1" sx={{ 
              fontWeight: 'bold', 
              color: '#d63031',
              position: 'relative',
              zIndex: 1
            }}>
              "{deleteDialog.courseName}"
            </Typography>
            <Box sx={{
              position: 'absolute',
              top: -10,
              right: -10,
              width: 40,
              height: 40,
              background: 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
              borderRadius: '50%',
              opacity: 0.1,
              animation: `${pulse} 2s ease-in-out infinite`
            }} />
          </Paper>
          
          <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
            ⚠️ <strong>{t('coursesWarning')}:</strong> {t('coursesDeleteWarningMessage')}
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ 
          justifyContent: 'center', 
          gap: 2, 
          p: 3,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderRadius: '0 0 12px 12px'
        }}>
          <Button
            onClick={cancelDelete}
            variant="outlined"
            size="large"
            sx={{
              minWidth: 120,
              py: 1.5,
              borderRadius: 2,
              borderColor: '#6c757d',
              color: '#6c757d',
              fontWeight: 'bold',
              '&:hover': {
                borderColor: '#495057',
                backgroundColor: 'rgba(108,117,125,0.1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(108,117,125,0.3)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {t('commonCancel')}
          </Button>
          
          <Button
            onClick={confirmDeleteCourse}
            variant="contained"
            size="large"
            disabled={deleteDialog.loading}
            sx={{
              minWidth: 120,
              py: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #c82333 0%, #a71e2a 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(220,53,69,0.4)'
              },
              '&:disabled': {
                background: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)',
                transform: 'none'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {deleteDialog.loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} sx={{ color: 'white' }} />
                <span>{t('coursesDeleting')}...</span>
              </Box>
            ) : (
              <>
                <DeleteIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                {t('coursesDeletePermanently')}
              </>
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyCourses;
