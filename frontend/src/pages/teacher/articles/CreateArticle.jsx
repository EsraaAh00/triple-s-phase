import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  FormHelperText,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { articleAPI } from '../../../services/api.service';
import {
  Save as SaveIcon,
  Publish as PublishIcon,
  Drafts as DraftIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Tag as TagIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: theme.shadows[4],
  },
}));

const ImageUploadBox = styled(Box)(({ theme, hasImage }) => ({
  border: `2px dashed ${hasImage ? theme.palette.primary.main : theme.palette.grey[300]}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: hasImage ? alpha(theme.palette.primary.main, 0.05) : theme.palette.grey[50],
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

const CreateArticle = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Form state
  const [articleData, setArticleData] = useState({
    title: '',
    slug: '',
    content: '',
    summary: '',
    tags: [],
    status: 'draft',
    featured: false,
    allow_comments: true,
    meta_description: '',
    meta_keywords: '',
    image: null,
    imagePreview: null
  });

  const [newTag, setNewTag] = useState('');

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setArticleData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Auto-generate slug from title
    if (name === 'title') {
      const slug = generateSlug(value);
      setArticleData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({
          ...prev,
          image: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت'
        }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setArticleData(prev => ({
          ...prev,
          image: file,
          imagePreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.image) {
        setErrors(prev => ({
          ...prev,
          image: ''
        }));
      }
    }
  };

  // Handle image remove
  const handleImageRemove = () => {
    setArticleData(prev => ({
      ...prev,
      image: null,
      imagePreview: null
    }));
  };

  // Handle tag addition
  const handleAddTag = () => {
    if (newTag.trim() && !articleData.tags.includes(newTag.trim())) {
      setArticleData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove) => {
    setArticleData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle tag key press
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\u0600-\u06FF\w\s-]/g, '') // Remove special characters except Arabic and basic Latin
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim('-'); // Remove leading/trailing hyphens
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!articleData.title.trim()) {
      newErrors.title = 'العنوان مطلوب';
    }

    if (!articleData.content.trim()) {
      newErrors.content = 'المحتوى مطلوب';
    }

    if (!articleData.summary.trim()) {
      newErrors.summary = 'الملخص مطلوب';
    }

    if (articleData.summary.length > 200) {
      newErrors.summary = 'الملخص يجب أن يكون أقل من 200 حرف';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e, status = 'draft') => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      // Prepare article data
      const articleDataToSend = {
        ...articleData,
        status: status,
        content: articleData.content || '',
        summary: articleData.summary || '',
        meta_description: articleData.meta_description || '',
        meta_keywords: articleData.meta_keywords || '',
        featured: articleData.featured || false,
        allow_comments: articleData.allow_comments !== false,
        tags: articleData.tags || []
      };

      // Remove imagePreview from data to send
      delete articleDataToSend.imagePreview;

      console.log('Sending article data:', articleDataToSend);
      
      // Call API to create article
      const response = await articleAPI.createArticle(articleDataToSend);
      
      console.log('Article created successfully:', response);
      
      // Navigate back to articles list
      navigate('/teacher/articles');
    } catch (error) {
      console.error('Error saving article:', error);
      
      // Handle specific error cases
      if (error.response?.data) {
        const errorData = error.response.data;
        const newErrors = {};
        
        // Map backend errors to form fields
        Object.keys(errorData).forEach(key => {
          if (Array.isArray(errorData[key])) {
            newErrors[key] = errorData[key][0];
          } else {
            newErrors[key] = errorData[key];
          }
        });
        
        setErrors(newErrors);
      } else {
        setErrors(prev => ({
          ...prev,
          general: 'حدث خطأ أثناء حفظ المقالة. يرجى المحاولة مرة أخرى.'
        }));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = (e) => {
    handleSubmit(e, 'draft');
  };

  const handlePublish = (e) => {
    handleSubmit(e, 'published');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: theme.palette.primary.main, display: 'flex', alignItems: 'center' }}>
          <ArticleIcon sx={{ mr: 1 }} />
          إنشاء مقالة جديدة
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/teacher/articles')}
          sx={{ borderRadius: 2 }}
        >
          العودة للمقالات
        </Button>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Basic Information */}
              <StyledCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <ArticleIcon sx={{ mr: 1, color: 'primary.main' }} />
                    المعلومات الأساسية
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="عنوان المقالة"
                        name="title"
                        value={articleData.title}
                        onChange={handleChange}
                        error={!!errors.title}
                        helperText={errors.title}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="رابط المقالة (Slug)"
                        name="slug"
                        value={articleData.slug}
                        onChange={handleChange}
                        error={!!errors.slug}
                        helperText={errors.slug || 'سيتم إنشاؤه تلقائياً من العنوان'}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="ملخص المقالة"
                        name="summary"
                        value={articleData.summary}
                        onChange={handleChange}
                        multiline
                        rows={3}
                        error={!!errors.summary}
                        helperText={errors.summary || `${articleData.summary.length}/200`}
                        inputProps={{ maxLength: 200 }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </StyledCard>

              {/* Content */}
              <StyledCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    محتوى المقالة
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="محتوى المقالة"
                    name="content"
                    value={articleData.content}
                    onChange={handleChange}
                    multiline
                    rows={12}
                    error={!!errors.content}
                    helperText={errors.content}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'inherit',
                      }
                    }}
                  />
                </CardContent>
              </StyledCard>

              {/* Tags */}
              <StyledCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <TagIcon sx={{ mr: 1, color: 'primary.main' }} />
                    الوسوم
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    {articleData.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    ))}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="إضافة وسم جديد"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      sx={{ flexGrow: 1 }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleAddTag}
                      disabled={!newTag.trim()}
                      sx={{ borderRadius: 2 }}
                    >
                      إضافة
                    </Button>
                  </Box>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Image Upload */}
              <StyledCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <ImageIcon sx={{ mr: 1, color: 'primary.main' }} />
                    صورة المقالة
                  </Typography>
                  
                  {articleData.imagePreview ? (
                    <Box sx={{ position: 'relative', mb: 2 }}>
                      <img
                        src={articleData.imagePreview}
                        alt="Preview"
                        style={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover',
                          borderRadius: theme.spacing(1)
                        }}
                      />
                      <IconButton
                        onClick={handleImageRemove}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.7)',
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <ImageUploadBox hasImage={false}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                        id="image-upload"
                      />
                      <label htmlFor="image-upload">
                        <Box sx={{ cursor: 'pointer' }}>
                          <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="body2" color="text.secondary">
                            انقر لاختيار صورة أو اسحبها هنا
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            الحد الأقصى: 5 ميجابايت
                          </Typography>
                        </Box>
                      </label>
                    </ImageUploadBox>
                  )}
                  
                  {errors.image && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {errors.image}
                    </Alert>
                  )}
                </CardContent>
              </StyledCard>

              {/* Settings */}
              <StyledCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    الإعدادات
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>حالة المقالة</InputLabel>
                      <Select
                        name="status"
                        value={articleData.status}
                        onChange={handleChange}
                        label="حالة المقالة"
                      >
                        <MenuItem value="draft">مسودة</MenuItem>
                        <MenuItem value="published">منشور</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          name="featured"
                          checked={articleData.featured}
                          onChange={handleChange}
                          color="primary"
                        />
                      }
                      label="مقالة مميزة"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          name="allow_comments"
                          checked={articleData.allow_comments}
                          onChange={handleChange}
                          color="primary"
                        />
                      }
                      label="السماح بالتعليقات"
                    />
                  </Box>
                </CardContent>
              </StyledCard>

              {/* SEO Settings */}
              <StyledCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    إعدادات SEO
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Meta Description"
                    name="meta_description"
                    value={articleData.meta_description}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Meta Keywords"
                    name="meta_keywords"
                    value={articleData.meta_keywords}
                    onChange={handleChange}
                    multiline
                    rows={2}
                  />
                </CardContent>
              </StyledCard>

              {/* Actions */}
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  الإجراءات
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<PublishIcon />}
                    onClick={handlePublish}
                    disabled={saving}
                    sx={{
                      background: 'linear-gradient(45deg, #0288d1 30%, #333679 90%)',
                      borderRadius: 2,
                      py: 1.5,
                      fontWeight: 600,
                    }}
                  >
                    {saving ? <CircularProgress size={20} color="inherit" /> : 'نشر المقالة'}
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="outlined"
                    startIcon={<DraftIcon />}
                    onClick={handleSaveDraft}
                    disabled={saving}
                    sx={{ borderRadius: 2, py: 1.5, fontWeight: 600 }}
                  >
                    {saving ? <CircularProgress size={20} /> : 'حفظ كمسودة'}
                  </Button>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </form>

      {/* Error Alert */}
      {errors.general && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errors.general}
        </Alert>
      )}
    </Box>
  );
};

export default CreateArticle; 