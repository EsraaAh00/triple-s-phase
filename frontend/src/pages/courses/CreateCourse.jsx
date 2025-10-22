import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Box, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  Checkbox, 
  FormControlLabel,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
  VideoLibrary as VideoLibraryIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { courseAPI } from '../../services/api.service';
import BunnyVideoSelector from '../../components/BunnyVideoSelector';

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

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: theme.palette.background.paper,
    padding: '0 16px',
    '& input': {
      textAlign: 'right',
      padding: '12px 0',
      fontSize: '1rem',
      '&::placeholder': {
        textAlign: 'right',
        opacity: 1,
      },
    },
    '& textarea': {
      textAlign: 'right',
      padding: '16px 0',
      fontSize: '1rem',
      lineHeight: '1.5',
      '&::placeholder': {
        textAlign: 'right',
        opacity: 1,
      },
    },
  },
  '& .MuiInputLabel-root': {
    right: 16,
    left: 'auto',
    transformOrigin: 'right',
    '&.MuiInputLabel-shrink': {
      transform: 'translate(-14px, -9px) scale(0.75)',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    textAlign: 'right',
  },
  '& .MuiInputBase-multiline': {
    padding: '8px 16px',
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
  '&.MuiButton-contained': {
    padding: '10px 24px',
  },
}));

const UploadArea = styled('div')(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: '8px',
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: isDragActive ? 'rgba(25, 118, 210, 0.05)' : theme.palette.background.paper,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: 'rgba(25, 118, 210, 0.03)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const LEVEL_OPTIONS = [
  { value: 'beginner', label: 'مبتدئ' },
  { value: 'intermediate', label: 'متوسط' },
  { value: 'advanced', label: 'متقدم' },
];

const LANGUAGE_OPTIONS = [
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
];

const CreateCourse = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form state
  const [courseData, setCourseData] = useState({
    // Basic Information
    title: '',
    subtitle: '',
    description: '',
    short_description: '',
    
    // Course Details
    level: 'beginner',
    language: 'ar',
    category: '',
    tags: [],
    instructors: [],
    
    // Pricing
    is_free: false,
    price: 0,
    discount_price: null,
    
    // Status
    status: 'published',
    is_featured: false,
    is_certified: false,
    
    // Media
    image: null,
    promotional_video: '',
    bunny_promotional_video_id: '',
    bunny_promotional_video_url: '',
    syllabus_pdf: null,
    materials_pdf: null,
  });
  
  const [newTag, setNewTag] = useState('');

  // Fetch categories and instructors on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesData = await courseAPI.getCategories();
        console.log('Categories API response:', categoriesData);
        // Ensure categoriesData is an array
        const categoriesArray = Array.isArray(categoriesData) ? categoriesData : 
                               categoriesData.results ? categoriesData.results : 
                               categoriesData.data ? categoriesData.data : [];
        console.log('Processed categories array:', categoriesArray);
        setCategories(categoriesArray);

        // Fetch instructors
        console.log('Fetching instructors...');
        try {
          const instructorsData = await courseAPI.getInstructors();
          console.log('Instructors API response:', instructorsData);
          console.log('Instructors data type:', typeof instructorsData);
          console.log('Instructors is array:', Array.isArray(instructorsData));
          setInstructors(instructorsData);
        } catch (instructorError) {
          console.error('Error fetching instructors:', instructorError);
          setInstructors([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setSnackbar({
          open: true,
          message: 'خطأ في تحميل البيانات',
          severity: 'error'
        });
        // Set empty arrays as fallback
        setCategories([]);
        setInstructors([]);
      }
    };

    fetchData();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (courseData.category) {
        try {
          const subcategoriesData = await courseAPI.getSubCategories(courseData.category);
          console.log('Subcategories API response:', subcategoriesData);
          setSubcategories(subcategoriesData);
        } catch (error) {
          console.error('Error fetching subcategories:', error);
          setSubcategories([]);
        }
      } else {
        setSubcategories([]);
      }
    };

    fetchSubCategories();
  }, [courseData.category]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log('HandleChange called:', { name, value, type, checked });
    if (name === 'instructors') {
      console.log('Instructors changed:', value);
    }
    setCourseData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBunnyVideoSelect = (videoInfo) => {
    setCourseData(prev => ({
      ...prev,
      bunny_promotional_video_id: videoInfo.id,
      bunny_promotional_video_url: videoInfo.playable_url || '',
    }));
  };
  
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setCourseData(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };
  
  const handleAddTag = () => {
    if (newTag.trim() && !courseData.tags.includes(newTag.trim())) {
      setCourseData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setCourseData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (activeStep === steps.length - 1) {
      // This is the final step, handle form submission
      setLoading(true);
      try {

        console.log('Submitting course data:', courseData);
        console.log('Instructors data:', courseData.instructors);
        console.log('Instructors type:', typeof courseData.instructors);
        console.log('Instructors is array:', Array.isArray(courseData.instructors));
        const response = await courseAPI.createCourse(courseData);
        console.log('Course created successfully:', response);
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'تم حفظ الدورة بنجاح! سيتم توجيهك إلى صفحة دوراتك...',
          severity: 'success'
        });
        
        // Navigate to the teacher's courses list after a short delay
        setTimeout(() => {
          navigate('/teacher/my-courses');
        }, 2000);
        
      } catch (error) {
        console.error('Error creating course:', error);
        
        // Check if the course was actually created despite the 500 error
        if (error.response?.status === 500) {
          try {
            // Try to fetch the latest courses to see if our course was created
            const coursesData = await courseAPI.getCourses();
            const coursesArray = Array.isArray(coursesData) ? coursesData : 
                               coursesData.results ? coursesData.results : 
                               coursesData.data ? coursesData.data : [];
            
            // Check if our course was created by looking for a course with the same title
            const createdCourse = coursesArray.find(course => 
              course.title === courseData.title && 
              course.subtitle === courseData.subtitle
            );
            
            if (createdCourse) {
              // Course was created successfully despite the 500 error
              setSnackbar({
                open: true,
                message: 'تم حفظ الدورة بنجاح! سيتم توجيهك إلى صفحة دوراتك...',
                severity: 'success'
              });
              
              // Navigate to the teacher's courses list
              setTimeout(() => {
                navigate('/teacher/my-courses');
              }, 2000);
              return;
            }
          } catch (fetchError) {
            console.error('Error fetching courses to verify creation:', fetchError);
          }
        }
        
        // Show error message
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.detail || 
                           error.message || 
                           'خطأ في حفظ الدورة';
        setSnackbar({
          open: true,
          message: `${errorMessage} - يمكنك المحاولة مرة أخرى أو الانتقال إلى صفحة دوراتك`,
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Move to next step if not on final step
      handleNext();
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e, field) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setCourseData(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };
  
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, color: theme.palette.primary.main }}>
              {t('courseBasicInformation')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <StyledTextField
                fullWidth
                label={t('courseTitle')}
                name="title"
                value={courseData.title}
                onChange={handleChange}
                variant="outlined"
                required
                size="medium"
                sx={{ mb: 2 }}
              />
              
              <StyledTextField
                fullWidth
                label={t('courseShortDescription')}
                name="subtitle"
                value={courseData.subtitle}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
              
              <StyledTextField
                fullWidth
                label={t('courseFullDescription')}
                name="description"
                value={courseData.description}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={6}
                sx={{ mb: 3 }}
              />
              
              <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                  <InputLabel>{t('courseDifficultyLevel')}</InputLabel>
                  <Select
                    name="level"
                    value={courseData.level}
                    onChange={handleChange}
                    label={t('courseDifficultyLevel')}
                    sx={{ textAlign: 'right' }}
                  >
                    {LEVEL_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                  <InputLabel>{t('courseLanguage')}</InputLabel>
                  <Select
                    name="language"
                    value={courseData.language}
                    onChange={handleChange}
                    label={t('courseLanguage')}
                    sx={{ textAlign: 'right' }}
                  >
                    {LANGUAGE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <InputLabel>{t('courseInstructors')}</InputLabel>
                <Select
                  name="instructors"
                  multiple
                  value={courseData.instructors}
                  onChange={handleChange}
                  label={t('courseInstructors')}
                  sx={{ textAlign: 'right' }}
                  disabled={instructors.length === 0}
                  renderValue={(selected) => {
                    if (!selected || selected.length === 0) {
                      return <em>{t('courseSelectInstructors')}</em>;
                    }
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const instructor = instructors.find(inst => inst.id === value);
                          return (
                            <Chip 
                              key={value} 
                              label={instructor?.name || `Instructor ${value}`} 
                              size="small"
                              sx={{ 
                                backgroundColor: theme.palette.primary.light,
                                color: theme.palette.primary.contrastText,
                              }}
                            />
                          );
                        })}
                      </Box>
                    );
                  }}
                >
                  {instructors && instructors.length > 0 ? (
                    instructors.map((instructor) => {
                      console.log('Rendering instructor:', instructor);
                      return (
                        <MenuItem key={instructor.id} value={instructor.id}>
                          {instructor.name || `Instructor ${instructor.id}`}
                        </MenuItem>
                      );
                    })
                  ) : (
                    <MenuItem disabled>
                      {t('courseNoInstructorsAvailable')}
                    </MenuItem>
                  )}
                </Select>
                {instructors.length === 0 && (
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    {t('courseCannotLoadInstructors')}
                  </Typography>
                )}
              </FormControl>
            </Box>
          </>
        );
      
      case 1:
        return (
          <>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, color: theme.palette.primary.main }}>
              {t('courseMediaAndContent')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>{t('courseCoverImage')}</Typography>
                <UploadArea 
                  isDragActive={isDragging}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'image')}
                  onClick={() => document.getElementById('image-upload').click()}
                  sx={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileChange(e, 'image')}
                  />
                  {courseData.image ? (
                    <Box textAlign="center" width="100%">
                      <img 
                        src={URL.createObjectURL(courseData.image)} 
                        alt="Course preview" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '300px',
                          borderRadius: '8px',
                          marginBottom: '16px',
                          border: '1px solid #e0e0e0'
                        }} 
                      />
                      <Typography variant="body2" color="textSecondary">
                        {t('courseClickToChangeImage')}
                      </Typography>
                    </Box>
                  ) : (
                    <Box textAlign="center" p={3}>
                      <ImageIcon color="action" fontSize="large" sx={{ fontSize: 48, mb: 1 }} />
                      <Typography variant="body1" sx={{ mt: 1, mb: 1, fontWeight: 500 }}>
                        {t('courseDragImageHere')}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {t('courseRecommendedImageSize')}
                      </Typography>
                    </Box>
                  )}
                </UploadArea>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  {t('coursePromotionalVideo')}
                </Typography>
                
                {/* Bunny CDN Video Selector */}
                <BunnyVideoSelector
                  value={courseData.bunny_promotional_video_id}
                  onChange={(value) => setCourseData(prev => ({ ...prev, bunny_promotional_video_id: value }))}
                  label="Bunny Video ID"
                  placeholder={t('courseEnterBunnyVideoId')}
                  onVideoSelect={handleBunnyVideoSelect}
                  showPreview={true}
                />
                
                {/* Fallback: External Video URL */}
                <StyledTextField
                  fullWidth
                  label={t('courseExternalVideoUrl')}
                  name="promotional_video"
                  value={courseData.promotional_video}
                  onChange={handleChange}
                  variant="outlined"
                  placeholder="https://www.youtube.com/watch?v=..."
                  InputProps={{
                    startAdornment: <VideoLibraryIcon color="action" sx={{ ml: 1 }} />,
                  }}
                  sx={{ mt: 2 }}
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>{t('courseAttachedFiles')}</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <input
                      id="syllabus-upload"
                      type="file"
                      accept=".pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange(e, 'syllabus_pdf')}
                    />
                    <Button
                      component="label"
                      htmlFor="syllabus-upload"
                      variant="outlined"
                      startIcon={<PdfIcon />}
                      fullWidth
                      sx={{ 
                        py: 1.5, 
                        borderRadius: '8px',
                        justifyContent: 'flex-start',
                        textAlign: 'right',
                        textTransform: 'none'
                      }}
                    >
                      {courseData.syllabus_pdf ? 
                        `${t('courseUploaded')}: ${courseData.syllabus_pdf.name}` : 
                        t('courseUploadSyllabus')}
                    </Button>
                  </Box>
                  
                  <Box>
                    <input
                      id="materials-upload"
                      type="file"
                      accept=".pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange(e, 'materials_pdf')}
                    />
                    <Button
                      component="label"
                      htmlFor="materials-upload"
                      variant="outlined"
                      startIcon={<PdfIcon />}
                      fullWidth
                      sx={{ 
                        py: 1.5, 
                        borderRadius: '8px',
                        justifyContent: 'flex-start',
                        textAlign: 'right',
                        textTransform: 'none'
                      }}
                    >
                      {courseData.materials_pdf ? 
                        `${t('courseUploaded')}: ${courseData.materials_pdf.name}` : 
                        t('courseUploadMaterials')}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          </>
        );
      
      case 2:
        return (
          <>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, color: theme.palette.primary.main }}>
              {t('courseCategoriesAndTags')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <InputLabel>{t('courseCategory')}</InputLabel>
                <Select
                  name="category"
                  value={courseData.category}
                  onChange={handleChange}
                  label={t('courseCategory')}
                  sx={{ textAlign: 'right' }}
                >
                  <MenuItem value="">
                    <em>{t('courseSelectCategory')}</em>
                  </MenuItem>
                  {Array.isArray(categories) && categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>{t('courseTags')}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <StyledTextField
                    fullWidth
                    label={t('courseAddNewTags')}
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    variant="outlined"
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <Button 
                    variant="contained"
                    onClick={handleAddTag}
                    startIcon={<AddIcon />}
                    sx={{ minWidth: '100px' }}
                  >
                    {t('commonAdd')}
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: '42px', border: '1px solid #e0e0e0', borderRadius: '4px', p: 1 }}>
                  {courseData.tags.length > 0 ? (
                    courseData.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        sx={{ 
                          backgroundColor: theme.palette.primary.light,
                          color: theme.palette.primary.contrastText,
                          '& .MuiChip-deleteIcon': {
                            color: theme.palette.primary.contrastText,
                          },
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ p: 1, width: '100%', textAlign: 'center' }}>
                      {t('courseNoTagsAdded')}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </>
        );
      
      case 3:
        return (
          <>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, color: theme.palette.primary.main }}>
              {t('coursePricingAndSettings')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={courseData.is_free}
                      onChange={handleChange}
                      name="is_free"
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">{t('courseIsFree')}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {t('courseFreePriceFieldsHidden')}
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0 }}
                />
              </Box>
              
              {!courseData.is_free && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                  <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <StyledTextField
                      fullWidth
                      label={t('coursePriceUSD')}
                      name="price"
                      type="number"
                      value={courseData.price}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      InputProps={{
                        startAdornment: <Typography sx={{ ml: 1 }}>$</Typography>,
                      }}
                    />
                    
                    <StyledTextField
                      fullWidth
                      label={t('courseDiscountPrice')}
                      name="discount_price"
                      type="number"
                      value={courseData.discount_price || ''}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      InputProps={{
                        startAdornment: <Typography sx={{ ml: 1 }}>$</Typography>,
                      }}
                    />
                  </Box>
                  
                  {courseData.price > 0 && courseData.discount_price > 0 && (
                    <Box sx={{ textAlign: 'center', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('courseSavePercentage', { percentage: Math.round((1 - courseData.discount_price / courseData.price) * 100) })}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
              
              <Divider sx={{ my: 1 }} />
              
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={courseData.is_featured}
                      onChange={handleChange}
                      name="is_featured"
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">{t('courseFeaturedStatus')}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {t('courseFeaturedDescription')}
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, alignItems: 'flex-start' }}
                />
              </Box>
              
            </Box>
          </>
        );
      
      default:
        return t('courseUnknownStepError');
    }
  };
  
  const steps = [
    t('courseBasicInformation'),
    t('courseMediaAndContent'),
    t('courseCategoriesAndTags'),
    t('coursePricingAndSettings'),
  ];
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
    // If it was a success message, navigate to courses list
    if (snackbar.severity === 'success') {
      navigate('/teacher/my-courses');
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
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
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
          {t('courseCreateNewCourse')}
        </Typography>
      </Box>
      
      <StyledPaper elevation={0}>
        <Box sx={{ width: '100%', mb: 4, position: 'relative' }}>
          {/* Progress line that extends from first to last step */}
          <Box 
            sx={{
              position: 'absolute',
              top: 20,
              left: '50px',
              right: '50px',
              height: '2px',
              backgroundColor: theme.palette.grey[300],
              zIndex: 0,
            }}
          >
            <Box 
              sx={{
                height: '100%',
                backgroundColor: theme.palette.primary.main,
                width: `${(activeStep / (steps.length - 1)) * 100}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, position: 'relative', zIndex: 1 }}>
            {steps.map((label, index) => (
              <Box 
                key={label} 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  flex: 1,
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: activeStep >= index ? theme.palette.primary.main : theme.palette.grey[300],
                    color: activeStep >= index ? '#fff' : theme.palette.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    mb: 1,
                    position: 'relative',
                    border: `2px solid ${theme.palette.background.paper}`,
                    boxSizing: 'border-box',
                  }}
                >
                  {index + 1}
                </Box>
                <Typography 
                  variant="caption" 
                  align="center" 
                  sx={{ 
                    fontSize: '0.75rem',
                    color: activeStep >= index ? theme.palette.primary.main : theme.palette.text.secondary,
                    fontWeight: activeStep === index ? 600 : 'normal',
                    maxWidth: '100px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit}>
          {renderStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ 
                minWidth: '120px',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {t('commonPrevious')}
            </Button>
            
            <StyledButton
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : (activeStep === steps.length - 1 ? <SaveIcon /> : null)}
              sx={{ 
                minWidth: activeStep === steps.length - 1 ? '200px' : '120px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {loading ? t('courseSaving') : (activeStep === steps.length - 1 ? t('courseSaveCourse') : t('commonNext'))}
            </StyledButton>
          </Box>
        </Box>
      </StyledPaper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === 'success' ? 6000 : 4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => navigate('/teacher/my-courses')}
              sx={{ fontWeight: 600 }}
            >
              {snackbar.severity === 'success' ? t('courseViewMyCourses') : t('courseBackToCourses')}
            </Button>
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateCourse;
