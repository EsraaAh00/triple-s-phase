import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Divider,
  Alert,
  FormControlLabel,
  Switch,
  FormGroup,
  FormHelperText,
  Paper,
  Container,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Image as ImageIcon,
  Psychology as PsychologyIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Book as BookIcon,
  Tag as TagIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useTheme, alpha, styled } from '@mui/material/styles';
import assessmentService from '../../services/assessment.service';

// Styled Components for Clean Form Design with RTL Support
const FormContainer = styled(Container)(({ theme }) => ({
  maxWidth: '1200px',
  padding: theme.spacing(3),
  direction: 'rtl',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const FormCard = styled(Card)(({ theme }) => ({
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e0e0e0',
  direction: 'rtl',
}));

const FormTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    '& fieldset': {
      borderColor: '#d0d0d0',
    },
    '&:hover fieldset': {
      borderColor: '#1976d2',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#666666',
    fontSize: '14px',
    fontWeight: 500,
    right: 14,
    left: 'auto',
    transformOrigin: 'right',
    '&.Mui-focused': {
      color: '#1976d2',
    },
    '&.MuiInputLabel-shrink': {
      transform: 'translate(-14px, -9px) scale(0.75)',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '12px 14px',
    fontSize: '14px',
    textAlign: 'right',
    '&::placeholder': {
      textAlign: 'right',
      opacity: 1,
    },
  },
  '& .MuiOutlinedInput-multiline': {
    padding: '8px 14px',
    '& textarea': {
      textAlign: 'right',
      '&::placeholder': {
        textAlign: 'right',
        opacity: 1,
      },
    },
  },
}));

const FormSelect = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    '& fieldset': {
      borderColor: '#d0d0d0',
    },
    '&:hover fieldset': {
      borderColor: '#1976d2',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
      borderWidth: '2px',
    },
  },
  '& .MuiSelect-select': {
    padding: '12px 14px',
    fontSize: '14px',
    textAlign: 'right',
    paddingRight: '32px !important',
    color: '#333333',
  },
  '& .MuiSelect-icon': {
    right: 14,
    left: 'auto',
    color: '#666666',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#d0d0d0',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#1976d2',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#1976d2',
    borderWidth: '2px',
  },
}));

const FormButton = styled(Button)(({ theme }) => ({
  borderRadius: '4px',
  padding: '10px 24px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '14px',
  minHeight: '40px',
  direction: 'rtl',
  '&.MuiButton-contained': {
    backgroundColor: '#1976d2',
    '&:hover': {
      backgroundColor: '#1565c0',
    },
  },
  '&.MuiButton-outlined': {
    borderColor: '#d0d0d0',
    color: '#666666',
    '&:hover': {
      borderColor: '#1976d2',
      color: '#1976d2',
      backgroundColor: 'rgba(25, 118, 210, 0.04)',
    },
  },
  '& .MuiButton-startIcon': {
    marginLeft: theme.spacing(1),
    marginRight: 0,
  },
  '& .MuiButton-endIcon': {
    marginRight: theme.spacing(1),
    marginLeft: 0,
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  fontWeight: 600,
  color: '#333333',
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  direction: 'rtl',
  textAlign: 'right',
}));

const RequiredAsterisk = styled('span')({
  color: '#d32f2f',
  marginRight: '4px',
  marginLeft: 0,
});

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: '#fafafa',
  borderRadius: '6px',
  border: '1px solid #e0e0e0',
  direction: 'rtl',
}));

const FlashcardForm = ({ open, onClose, flashcard = null, onSuccess }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    front_text: '',
    back_text: '',
    related_question: '',
    lesson: '',
    front_image: null,
    back_image: null,
    front_image_preview: null,
    back_image_preview: null,
    tags: []
  });

  const [questions, setQuestions] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (open) {
      loadQuestions();
      loadLessons();
      if (flashcard) {
        setFormData({
          front_text: flashcard.front_text || '',
          back_text: flashcard.back_text || '',
          related_question: flashcard.related_question || '',
          lesson: flashcard.lesson || '',
          front_image: null,
          back_image: null,
          front_image_preview: flashcard.front_image || null,
          back_image_preview: flashcard.back_image || null,
          tags: flashcard.tags || []
        });
      } else {
        resetForm();
      }
      setError(null);
      setErrors({});
    }
  }, [open, flashcard]);

  const loadQuestions = async () => {
    try {
      const result = await assessmentService.getQuestions({ page_size: 100 });
      if (result.success) {
        setQuestions(result.data);
      }
    } catch (err) {
      console.error('Error loading questions:', err);
    }
  };

  const loadLessons = async () => {
    try {
      const result = await assessmentService.getLessons({ page_size: 100 });
      if (result.success) {
        setLessons(result.data);
      }
    } catch (err) {
      console.error('Error loading lessons:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      front_text: '',
      back_text: '',
      related_question: '',
      lesson: '',
      front_image: null,
      back_image: null,
      front_image_preview: null,
      back_image_preview: null,
      tags: []
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleImageUpload = (field) => (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          [field]: file,
          [`${field}_preview`]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (field) => () => {
    setFormData(prev => ({
      ...prev,
      [field]: null,
      [`${field}_preview`]: null
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.front_text.trim()) {
      newErrors.front_text = t('assessmentFrontTextRequired');
    }

    if (!formData.back_text.trim()) {
      newErrors.back_text = t('assessmentBackTextRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setLoading(true);
        setError(null);

        // Format data for API
        const formattedData = {
          front_text: formData.front_text,
          back_text: formData.back_text,
          related_question: formData.related_question || null,
          lesson: formData.lesson || null,
          tags: formData.tags || [],
          ...(formData.front_image && { front_image: formData.front_image }),
          ...(formData.back_image && { back_image: formData.back_image })
        };

        console.log('Submitting flashcard data:', formattedData);
        let result;
        if (flashcard) {
          result = await assessmentService.updateFlashcard(flashcard.id, formattedData);
        } else {
          result = await assessmentService.createFlashcard(formattedData);
        }

        if (result.success) {
          // Call onSuccess to notify parent component
          onSuccess(result.data);
          onClose();
          resetForm();
        } else {
          setError(result.error?.detail || result.error || 'حدث خطأ أثناء حفظ البطاقة');
        }
      } catch (err) {
        setError('حدث خطأ أثناء حفظ البطاقة');
        console.error('Error saving flashcard:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth={false}
      fullWidth
      dir="rtl"
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '85vh',
          maxHeight: '90vh',
          width: '95vw',
          maxWidth: '1200px'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #1976d2, #1565c0)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 3,
        px: 4
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PsychologyIcon />
          <Typography variant="h6" fontWeight={600}>
            {flashcard ? t('assessmentEditFlashcard') : t('assessmentCreateFlashcard')}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: '#fafbfc' }}>
        <Container maxWidth={false} sx={{ py: 3, px: 4, maxWidth: '1200px', mx: 'auto' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={3} component="form" onSubmit={handleSubmit}>

            {/* Lesson Selection */}
            <FormSection>
              <SectionTitle>
                <BookIcon sx={{ fontSize: 20 }} />
                ربط بالدرس
              </SectionTitle>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ 
                  color: '#666666', 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  mb: 1,
                  textAlign: 'right'
                }}>
                  ربط البطاقة بالدرس *
                </Typography>
                <FormSelect fullWidth>
                  <Select
                    value={formData.lesson}
                    onChange={(e) => handleInputChange('lesson', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">لا يوجد ربط</MenuItem>
                    {lessons.map((lesson) => (
                      <MenuItem key={lesson.id} value={lesson.id}>
                        {lesson.title} - {lesson.module?.title || lesson.module?.name || 'بدون وحدة'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormSelect>
              </Box>
            </FormSection>

            {/* Related Question */}
            <FormSection>
              <SectionTitle>
                <QuestionAnswerIcon sx={{ fontSize: 20 }} />
                ربط بسؤال
              </SectionTitle>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ 
                  color: '#666666', 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  mb: 1,
                  textAlign: 'right'
                }}>
                  ربط البطاقة بسؤال (اختياري)
                </Typography>
                <FormSelect fullWidth>
                  <Select
                    value={formData.related_question}
                    onChange={(e) => handleInputChange('related_question', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">لا يوجد ربط</MenuItem>
                    {questions.map((question) => (
                      <MenuItem key={question.id} value={question.id}>
                        {question.question_text?.substring(0, 100)}...
                      </MenuItem>
                    ))}
                  </Select>
                </FormSelect>
              </Box>
            </FormSection>

            {/* Flashcard Content */}
            <FormSection>
              <SectionTitle>
                <BookIcon sx={{ fontSize: 20 }} />
                محتوى البطاقة التعليمية
              </SectionTitle>
              
              <Grid container spacing={6}>
                {/* Front Side */}
                <Grid size={{ xs: 12, lg: 6 }} sx={{ 
                  '&.MuiGrid-root': {
                    width: '520px'
                  }
                }}>
                  <Box sx={{ 
                    p: 3, 
                    borderRadius: 2, 
                    backgroundColor: '#ffffff',
                    border: '2px solid #e3f2fd',
                    height: '100%'
                  }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ 
                        color: '#1976d2', 
                        fontSize: '16px', 
                        fontWeight: 600, 
                        mb: 2,
                        textAlign: 'right',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <ImageIcon sx={{ fontSize: 20 }} />
                        الوجه الأمامي
                        <RequiredAsterisk>*</RequiredAsterisk>
                      </Typography>
                      <FormTextField
                        fullWidth
                        multiline
                        rows={6}
                        value={formData.front_text}
                        onChange={(e) => handleInputChange('front_text', e.target.value)}
                        error={!!errors.front_text}
                        helperText={errors.front_text}
                        placeholder="أدخل النص الذي سيظهر على الوجه الأمامي للبطاقة..."
                        sx={{ mb: 3 }}
                      />

                      <Box sx={{ mb: 2 }}>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="front-image-upload"
                          type="file"
                          onChange={handleImageUpload('front_image')}
                        />
                        <label htmlFor="front-image-upload">
                          <FormButton variant="outlined" component="span" startIcon={<UploadIcon />} fullWidth>
                            رفع صورة للوجه الأمامي
                          </FormButton>
                        </label>
                      </Box>

                      {formData.front_image_preview && (
                        <Box sx={{ position: 'relative', mb: 2 }}>
                          <img 
                            src={formData.front_image_preview} 
                            alt="Front preview" 
                            style={{ 
                              width: '100%', 
                              height: 200, 
                              objectFit: 'cover', 
                              borderRadius: 8 
                            }} 
                          />
                          <IconButton
                            onClick={removeImage('front_image')}
                            sx={{ 
                              position: 'absolute', 
                              top: 8, 
                              right: 8, 
                              bgcolor: 'rgba(0,0,0,0.5)',
                              color: 'white',
                              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Grid>

                {/* Back Side */}
                <Grid size={{ xs: 12, lg: 6 }} sx={{ 
                  '&.MuiGrid-root': {
                    width: '520px'
                  }
                }}>
                  <Box sx={{ 
                    p: 3, 
                    borderRadius: 2, 
                    backgroundColor: '#ffffff',
                    border: '2px solid #e8f5e8',
                    height: '100%'
                  }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ 
                        color: '#2e7d32', 
                        fontSize: '16px', 
                        fontWeight: 600, 
                        mb: 2,
                        textAlign: 'right',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <QuestionAnswerIcon sx={{ fontSize: 20 }} />
                        الوجه الخلفي
                        <RequiredAsterisk>*</RequiredAsterisk>
                      </Typography>
                      <FormTextField
                        fullWidth
                        multiline
                        rows={6}
                        value={formData.back_text}
                        onChange={(e) => handleInputChange('back_text', e.target.value)}
                        error={!!errors.back_text}
                        helperText={errors.back_text}
                        placeholder="أدخل النص الذي سيظهر على الوجه الخلفي للبطاقة..."
                        sx={{ mb: 3 }}
                      />

                      <Box sx={{ mb: 2 }}>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="back-image-upload"
                          type="file"
                          onChange={handleImageUpload('back_image')}
                        />
                        <label htmlFor="back-image-upload">
                          <FormButton variant="outlined" component="span" startIcon={<UploadIcon />} fullWidth>
                            رفع صورة للوجه الخلفي
                          </FormButton>
                        </label>
                      </Box>

                      {formData.back_image_preview && (
                        <Box sx={{ position: 'relative', mb: 2 }}>
                          <img 
                            src={formData.back_image_preview} 
                            alt="Back preview" 
                            style={{ 
                              width: '100%', 
                              height: 200, 
                              objectFit: 'cover', 
                              borderRadius: 8 
                            }} 
                          />
                          <IconButton
                            onClick={removeImage('back_image')}
                            sx={{ 
                              position: 'absolute', 
                              top: 8, 
                              right: 8, 
                              bgcolor: 'rgba(0,0,0,0.5)',
                              color: 'white',
                              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </FormSection>
            
          </Stack>
        </Container>
      </DialogContent>

      <DialogActions sx={{ p: 4, bgcolor: '#f8f9fa', borderRadius: '0 0 12px 12px' }}>
        <FormButton 
          variant="outlined" 
          onClick={onClose}
        >
          إلغاء
        </FormButton>
        <FormButton 
          type="submit" 
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSubmit}
        >
          {loading ? 'جاري الحفظ...' : (flashcard ? 'تحديث البطاقة' : 'إنشاء البطاقة')}
        </FormButton>
      </DialogActions>
    </Dialog>
  );
};

export default FlashcardForm;