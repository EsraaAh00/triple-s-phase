import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  IconButton,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Link,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon, DeleteOutline as DeleteIcon, Edit as EditIcon, AttachFile as AttachFileIcon, Launch as LaunchIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import contentAPI from '../../../services/content.service';
import BunnyVideoSelector from '../../../components/BunnyVideoSelector';
// import { testAuth, testBunnyAPI } from '../../../utils/authTest';

const Wrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  border: `1px solid ${theme.palette.divider}`,
}));

const LessonForm = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { courseId, unitId, lessonId } = useParams();
  const { t, i18n } = useTranslation();
  
  const LESSON_TYPES = [
    { value: 'video', label: t('lessonsVideo') },
    { value: 'article', label: t('lessonsArticle') },
  ];
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    title: '',
    lesson_type: 'article',
    duration_minutes: 0,
    is_free: false,
    video_url: '',
    bunny_video_id: '',
    bunny_video_url: '',
    content: '',
  });

  // Resource (file/link) optional add-on
  const [resourceMode, setResourceMode] = useState('none'); // none | file | url
  const [resource, setResource] = useState({
    title: '',
    resource_type: 'document',
    file: null,
    url: '',
    is_public: true,
  });
  const [resources, setResources] = useState([]);
  const [resLoading, setResLoading] = useState(false);
  const [resError, setResError] = useState(null);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!isEdit) return;
      try {
        setLoading(true);
        setError(null);
        // Try to fetch lesson via module -> lessons list as fallback
        const moduleData = await contentAPI.getModuleById(unitId);
        const item = (moduleData?.lessons || []).find((l) => String(l.id) === String(lessonId));
        if (item) {
          setForm({
            title: item.title || '',
            lesson_type: item.lesson_type || 'article',
            duration_minutes: item.duration_minutes || 0,
            is_free: !!item.is_free,
            video_url: item.video_url || '',
            bunny_video_id: item.bunny_video_id || '',
            bunny_video_url: item.bunny_video_url || '',
            content: item.content || '',
          });
        } else {
          setError(t('lessonsLessonNotFound'));
        }
      } catch (e) {
        setError(t('lessonsFailedToLoadLesson'));
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [isEdit, unitId, lessonId]);

  useEffect(() => {
    const fetchResources = async () => {
      if (!isEdit || !lessonId) return;
      try {
        setResLoading(true);
        setResError(null);
        const data = await contentAPI.getLessonResources({ lessonId });
        const arr = Array.isArray(data) ? data : (data?.results || data?.data || []);
        setResources(arr);
      } catch (e) {
        setResError(t('lessonsFailedToLoadResources'));
      } finally {
        setResLoading(false);
      }
    };
    fetchResources();
  }, [isEdit, lessonId]);

  const handleDeleteResource = async (resourceId) => {
    try {
      await contentAPI.deleteLessonResource(resourceId);
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
    } catch (e) {
      setResError(t('lessonsFailedToDeleteResource'));
    }
  };

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleBunnyVideoSelect = (videoInfo) => {
    setForm(prev => ({
      ...prev,
      bunny_video_id: videoInfo.id,
      bunny_video_url: videoInfo.playable_url || '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      let currentLessonId = lessonId;
      if (isEdit) {
        const res = await contentAPI.updateLesson(lessonId, { module: unitId, ...form });
        currentLessonId = res?.id || lessonId;
      } else {
        const created = await contentAPI.createLesson({ module: unitId, ...form });
        currentLessonId = created?.id;
      }

      // Optionally create a resource if provided
      if (currentLessonId && resourceMode !== 'none') {
        console.log('Creating resource with mode:', resourceMode);
        console.log('Current lesson ID:', currentLessonId);
        console.log('Resource data:', resource);
        
        if (resourceMode === 'file' && resource.file) {
          const resourceData = {
            lesson: currentLessonId,
            title: resource.title || 'Resource',
            resource_type: resource.resource_type || 'document',
            file: resource.file,
            is_public: resource.is_public ? 'true' : 'false',
          };
          console.log('Creating file resource with data:', resourceData);
          await contentAPI.createLessonResource(resourceData);
        } else if (resourceMode === 'url' && resource.url) {
          const resourceData = {
            lesson: currentLessonId,
            title: resource.title || 'Resource',
            resource_type: 'link',
            url: resource.url,
            is_public: resource.is_public ? 'true' : 'false',
          };
          console.log('Creating URL resource with data:', resourceData);
          await contentAPI.createLessonResource(resourceData);
        }
      }
      navigate(`/teacher/courses/${courseId}/units/${unitId}/lessons`);
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || t('lessonsFailedToSaveLesson');
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, direction: i18n.language === 'en' ? 'ltr' : 'rtl' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>{isEdit ? t('lessonsEditLesson') : t('lessonsAddLesson')}</Typography>
      </Box>

      <Wrapper component="form" onSubmit={handleSubmit}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label={t('lessonsLessonTitle')}
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
          />

          <FormControl>
            <InputLabel>{t('lessonsLessonType')}</InputLabel>
            <Select
              label={t('lessonsLessonType')}
              value={form.lesson_type}
              onChange={(e) => handleChange('lesson_type', e.target.value)}
            >
              {LESSON_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label={t('lessonsDurationMinutes')}
            type="number"
            inputProps={{ min: 0 }}
            value={form.duration_minutes}
            onChange={(e) => handleChange('duration_minutes', Number(e.target.value || 0))}
          />

          {/* Bunny CDN Video Section */}
          <Box sx={{ gridColumn: '1 / -1', mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
              {t('lessonsBunnyCDNVideo')}
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label={t('lessonsBunnyVideoID')}
                value={form.bunny_video_id}
                onChange={(e) => handleChange('bunny_video_id', e.target.value)}
                placeholder={t('lessonsBunnyVideoIDPlaceholder')}
                helperText={t('lessonsBunnyVideoIDHelper')}
                fullWidth
              />
              
              <TextField
                label={t('lessonsBunnyVideoURL')}
                value={form.bunny_video_url}
                onChange={(e) => handleChange('bunny_video_url', e.target.value)}
                placeholder="https://vz-c239d8b2-f7d.b-cdn.net/..."
                helperText={t('lessonsBunnyVideoURLHelper')}
                fullWidth
              />
            </Box>
            
            {/* Bunny CDN Video Selector */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                {t('lessonsOrUseBunnySelector')}
              </Typography>
              <BunnyVideoSelector
                value={form.bunny_video_id}
                onChange={(value) => handleChange('bunny_video_id', value)}
                label={t('lessonsBunnyVideoID')}
                placeholder={t('lessonsBunnyVideoIDPlaceholder')}
                onVideoSelect={handleBunnyVideoSelect}
                showPreview={true}
              />
            </Box>
          </Box>
          
          {/* Fallback: External Video URL */}
          <Box sx={{ gridColumn: '1 / -1', mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'secondary.main' }}>
              {t('lessonsExternalVideoURL')}
            </Typography>
            <TextField
              label={t('lessonsExternalVideoURLLabel')}
              value={form.video_url}
              onChange={(e) => handleChange('video_url', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              helperText={t('lessonsExternalVideoURLHelper')}
              fullWidth
            />
          </Box>
        </Box>

        <FormControlLabel
          control={<Checkbox checked={form.is_free} onChange={(e) => handleChange('is_free', e.target.checked)} />}
          label={t('lessonsAvailableAsPreview')}
          sx={{ mt: 2 }}
        />

        <TextField
          label={t('lessonsContent')}
          value={form.content}
          onChange={(e) => handleChange('content', e.target.value)}
          fullWidth
          multiline
          rows={6}
          sx={{ mt: 2 }}
        />

        {/* Resources */}
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>{t('lessonsAttachedResources')}</Typography>
        {isEdit && (
          <Box sx={{ mb: 2 }}>
            {resError && <Alert severity="error" sx={{ mb: 1 }}>{resError}</Alert>}
            {resLoading ? (
              <Typography variant="body2" color="text.secondary">{t('lessonsLoadingResources')}</Typography>
            ) : (
              resources.length > 0 ? (
                <List dense>
                  {resources.map((res) => (
                    <ListItem key={res.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                      <AttachFileIcon fontSize="small" style={{ marginInlineEnd: 6 }} />
                      <ListItemText
                        primary={res.title}
                        secondary={res.resource_type}
                      />
                      {res.file && (
                        <IconButton component={Link} href={res.file} target="_blank" rel="noopener noreferrer">
                          <LaunchIcon fontSize="small" />
                        </IconButton>
                      )}
                      {res.url && (
                        <IconButton component={Link} href={res.url} target="_blank" rel="noopener noreferrer">
                          <LaunchIcon fontSize="small" />
                        </IconButton>
                      )}
                      <ListItemSecondaryAction>
                        {/* Can later add resource editing */}
                        <IconButton edge="end" color="error" onClick={() => handleDeleteResource(res.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">{t('lessonsNoResourcesAttached')}</Typography>
              )
            )}
          </Box>
        )}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <FormControl>
            <InputLabel>{t('lessonsAddMethod')}</InputLabel>
            <Select
              label={t('lessonsAddMethod')}
              value={resourceMode}
              onChange={(e) => setResourceMode(e.target.value)}
            >
              <MenuItem value="none">{t('lessonsNone')}</MenuItem>
              <MenuItem value="file">{t('lessonsUploadFile')}</MenuItem>
              <MenuItem value="url">{t('lessonsExternalLink')}</MenuItem>
            </Select>
          </FormControl>

          {resourceMode !== 'none' && (
            <TextField
              label={t('lessonsResourceTitle')}
              value={resource.title}
              onChange={(e) => setResource((p) => ({ ...p, title: e.target.value }))}
              required
            />
          )}
        </Box>

        {resourceMode === 'file' && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
            <FormControl>
              <InputLabel>{t('lessonsResourceType')}</InputLabel>
              <Select
                label={t('lessonsResourceType')}
                value={resource.resource_type}
                onChange={(e) => setResource((p) => ({ ...p, resource_type: e.target.value }))}
              >
                <MenuItem value="document">{t('lessonsDocument')}</MenuItem>
                <MenuItem value="presentation">{t('lessonsPresentation')}</MenuItem>
                <MenuItem value="spreadsheet">{t('lessonsSpreadsheet')}</MenuItem>
                <MenuItem value="image">{t('lessonsImage')}</MenuItem>
                <MenuItem value="audio">{t('lessonsAudio')}</MenuItem>
                <MenuItem value="video">{t('lessonsVideo')}</MenuItem>
                <MenuItem value="other">{t('lessonsOther')}</MenuItem>
              </Select>
            </FormControl>
            <Button component="label" variant="outlined">
              {t('lessonsChooseFile')}
              <input
                hidden
                type="file"
                onChange={(e) => {
                  const file = e.target.files && e.target.files.length ? e.target.files[0] : null;
                  setResource((p) => ({ ...p, file }));
                }}
              />
            </Button>
            {resource.file && (
              <Typography variant="caption" color="text.secondary">{resource.file.name}</Typography>
            )}
          </Box>
        )}

        {resourceMode === 'url' && (
          <Box sx={{ mt: 2 }}>
            <TextField
              label={t('lessonsResourceLink')}
              fullWidth
              value={resource.url}
              onChange={(e) => setResource((p) => ({ ...p, url: e.target.value }))}
              placeholder="https://example.com/resource.pdf"
            />
          </Box>
        )}


        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate(-1)} disabled={saving}>{t('lessonsCancel')}</Button>
          <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving}>
            {t('lessonsSave')}
          </Button>
        </Box>
      </Wrapper>
    </Container>
  );
};

export default LessonForm;


