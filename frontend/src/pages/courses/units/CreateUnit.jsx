import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
  VideoLibrary as VideoLibraryIcon,
  Article as ArticleIcon,
  Code as CodeIcon,
  Quiz as QuizIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import contentAPI from '../../../services/content.service';
import BunnyVideoSelector from '../../../components/BunnyVideoSelector';

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

const CreateUnit = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { t, i18n } = useTranslation();
  
  const LESSON_TYPES = [
    { value: 'video', label: t('lessonsVideo'), icon: <VideoLibraryIcon /> },
    { value: 'article', label: t('lessonsArticle'), icon: <ArticleIcon /> },
  ];
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Form state
  const [unitData, setUnitData] = useState({
    title: '',
    description: '',
    duration: '',
    isPreview: false,
    videoFile: null,
    bunny_video_id: '',
    bunny_video_url: '',
    pdfFile: null,
    order: 1,
    submodule: '',
    lessons: [
      {
        id: Date.now(),
        title: '',
        type: 'video',
        duration: '',
        content: '',
        isPreview: false,
        resources: [],
      },
    ],
  });

  const [modules, setModules] = useState([]);

  // No steps anymore

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUnitData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileSelect = (type, file) => {
    setUnitData(prev => ({
      ...prev,
      [`${type}File`]: file || null,
    }));
  };

  const handleBunnyVideoSelect = (videoInfo) => {
    setUnitData(prev => ({
      ...prev,
      bunny_video_id: videoInfo.id,
      bunny_video_url: videoInfo.playable_url || '',
    }));
  };

  // Preload next available order to avoid unique constraint (course, order)
  useEffect(() => {
    const preloadOrder = async () => {
      try {
        const data = await contentAPI.getModules(courseId);
        console.log('CreateUnit - Raw API response:', data);
        
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
        
        console.log('CreateUnit - Processed items:', items);
        
        // Set modules for submodule selection (only main modules)
        const mainModules = items.filter(m => !m.is_submodule);
        setModules(mainModules);
        
        // Find the maximum order and add 1, or start from 1 if no modules exist
        const maxOrder = items.length > 0 ? 
          items.reduce((max, m) => (typeof m.order === 'number' && m.order > max ? m.order : max), 0) : 0;
        setUnitData(prev => ({ ...prev, order: maxOrder + 1 }));
      } catch (e) {
        console.error('Error loading modules:', e);
        setLoadError(t('unitsFailedToLoadNextOrder'));
        // Set default order to 1 if loading fails
        setUnitData(prev => ({ ...prev, order: 1 }));
      }
    };
    if (courseId) preloadOrder();
  }, [courseId]);

  const handleLessonChange = (index, field, value) => {
    const updatedLessons = [...unitData.lessons];
    updatedLessons[index] = {
      ...updatedLessons[index],
      [field]: value
    };
    setUnitData(prev => ({
      ...prev,
      lessons: updatedLessons
    }));
  };

  const addNewLesson = () => {
    setUnitData(prev => ({
      ...prev,
      lessons: [
        ...prev.lessons,
        {
          id: Date.now(),
          title: '',
          type: 'video',
          duration: '',
          content: '',
          isPreview: false,
          resources: [],
        },
      ],
    }));
  };

  const removeLesson = (index) => {
    const updatedLessons = [...unitData.lessons];
    updatedLessons.splice(index, 1);
    setUnitData(prev => ({
      ...prev,
      lessons: updatedLessons
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setSubmitError(null);
      const payload = {
        courseId: courseId,
        title: unitData.title,
        name: unitData.title,
        description: unitData.description,
        durationMinutes: unitData.duration ? Number(unitData.duration) : 0,
        isActive: true,
        status: 'published',
        order: unitData.order || 1, // Ensure order is always provided
        submodule: unitData.submodule || null, // Add submodule support
      };
      
      // Only add files if they exist
      if (unitData.videoFile) {
        payload.videoFile = unitData.videoFile;
      }
      if (unitData.pdfFile) {
        payload.pdfFile = unitData.pdfFile;
      }
      const created = await contentAPI.createModule(payload);
      console.log('Module created:', created);
      
      // Show success message
      setSnackbar({
        open: true,
        message: t('unitsUnitSavedSuccessfully'),
        severity: 'success'
      });
      
      // Navigate after showing success message
      setTimeout(() => {
        navigate(`/teacher/courses/${courseId}/units`);
      }, 2000);
    } catch (error) {
      console.error('Error creating module:', error);
      let serverMsg = t('unitsFailedToSaveUnit');
      try {
        if (typeof error?.response?.data === 'string') serverMsg = error.response.data;
        else if (error?.response?.data?.detail) serverMsg = error.response.data.detail;
        else if (error?.response?.data?.error) serverMsg = error.response.data.error;
      } catch {}
      setSubmitError(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Render a top-level error if exists

  // No back after removing steps

  // Form: single section without final review

  return (
    <Container maxWidth="lg" sx={{ py: 4, direction: i18n.language === 'en' ? 'ltr' : 'rtl' }}>
      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}
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
          {t('unitsAddNewUnit')}
        </Typography>
      </Box>
      
      <StyledPaper elevation={0}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            {t('unitsBasicUnitInformation')}
          </Typography>

          <StyledTextField
            fullWidth
            label={t('unitsUnitTitle')}
            name="title"
            value={unitData.title}
            onChange={handleChange}
            variant="outlined"
            required
            size="medium"
          />

          <StyledTextField
            fullWidth
            label={t('unitsUnitDescription')}
            name="description"
            value={unitData.description}
            onChange={handleChange}
            variant="outlined"
            multiline
            rows={4}
          />

          <FormControl fullWidth>
            <InputLabel>{t('unitsMainUnitOptional')}</InputLabel>
            <Select
              name="submodule"
              value={unitData.submodule}
              onChange={handleChange}
              label={t('unitsMainUnitOptional')}
            >
              <MenuItem value="">
                <em>{t('unitsNoneMainUnit')}</em>
              </MenuItem>
              {modules.map((module) => (
                <MenuItem key={module.id} value={module.id}>
                  {module.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {t('unitsSelectMainUnitIfSubUnit')}
            </FormHelperText>
          </FormControl>

          <StyledTextField
            fullWidth
            label={t('unitsUnitDurationMinutes')}
            name="duration"
            type="number"
            value={unitData.duration}
            onChange={handleChange}
            variant="outlined"
            size="medium"
            InputProps={{ endAdornment: <InputAdornment position="end">{t('unitsMinutes')}</InputAdornment> }}
          />

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>{t('lessonsVideo')}</Typography>
            
            {/* Bunny CDN Video Selector */}
            <BunnyVideoSelector
              value={unitData.bunny_video_id}
              onChange={(value) => setUnitData(prev => ({ ...prev, bunny_video_id: value }))}
              label="Bunny Video ID"
              placeholder={t('lessonsBunnyVideoIDPlaceholder')}
              onVideoSelect={handleBunnyVideoSelect}
              showPreview={true}
            />
            
            {/* Fallback: Upload Video File */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                {t('unitsUploadLocalVideo')}
              </Typography>
              {!unitData.videoFile ? (
                <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} disabled={submitting}>
                  {t('unitsUploadVideo')}
                  <input hidden type="file" accept="video/*" onChange={(e) => handleFileSelect('video', e.target.files && e.target.files.length ? e.target.files[0] : null)} />
                </Button>
              ) : (
                <Box>
                  <video src={URL.createObjectURL(unitData.videoFile)} controls style={{ width: '100%', maxHeight: 360, borderRadius: 8, border: `1px solid ${theme.palette.divider}` }} />
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Chip label={unitData.videoFile.name} size="small" />
                    <Button color="error" onClick={() => handleFileSelect('video', null)}>{t('unitsRemove')}</Button>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
          
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>{t('unitsPDFFile')}</Typography>
            {!unitData.pdfFile ? (
              <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
                {t('unitsUploadPDFFile')}
                <input hidden type="file" accept="application/pdf" onChange={(e) => handleFileSelect('pdf', e.target.files && e.target.files.length ? e.target.files[0] : null)} />
              </Button>
            ) : (
              <Box>
                <Box sx={{ position: 'relative', border: `1px solid ${theme.palette.divider}`, borderRadius: 1, overflow: 'hidden' }}>
                  <iframe title="pdf-preview" src={URL.createObjectURL(unitData.pdfFile)} style={{ width: '100%', height: 480, border: 0 }} />
                </Box>
                <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip label={unitData.pdfFile.name} size="small" />
                  <Button component="a" href={URL.createObjectURL(unitData.pdfFile)} target="_blank" rel="noopener noreferrer">{t('unitsOpenInTab')}</Button>
                  <Button color="error" onClick={() => handleFileSelect('pdf', null)}>{t('unitsDeleteFile')}</Button>
                </Box>
              </Box>
            )}
        </Box>
        
          <FormControlLabel
            control={<Checkbox checked={unitData.isPreview} onChange={handleChange} name="isPreview" color="primary" />}
            label={t('unitsAvailableAsPreview')}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
            <StyledButton variant="contained" color="primary" type="submit" disabled={submitting}>
              {t('unitsSaveUnit')}
            </StyledButton>
          </Box>
        </Box>
      </StyledPaper>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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
              onClick={() => navigate(`/teacher/courses/${courseId}/units`)}
              sx={{ fontWeight: 600 }}
            >
              {t('unitsViewUnits')}
            </Button>
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateUnit;
