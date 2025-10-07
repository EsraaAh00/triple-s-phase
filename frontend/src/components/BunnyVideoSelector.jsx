import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  VideoLibrary as VideoIcon,
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  PlayArrow as PlayIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { bunnyAPI } from '../services/bunnyAPI.service';

const BunnyVideoSelector = ({ 
  value, 
  onChange, 
  label,
  placeholder,
  onVideoSelect,
  showPreview = true 
}) => {
  const { t } = useTranslation();
  const [videoId, setVideoId] = useState(value || '');
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const validateVideo = async (id) => {
    if (!id.trim()) {
      setError('');
      setVideoInfo(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await bunnyAPI.validateVideo(id);

      if (data.valid) {
        setVideoInfo(data.video_info);
        setError('');
        if (onVideoSelect) {
          onVideoSelect(data.video_info);
        }
      } else {
        setError(data.error || t('bunnyInvalidVideo'));
        setVideoInfo(null);
      }
    } catch (err) {
      setError(err.message || t('bunnyVideoCheckError'));
      setVideoInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoIdChange = (event) => {
    const newValue = event.target.value;
    setVideoId(newValue);
    onChange(newValue);
    
    // Auto-validate after user stops typing
    if (newValue.trim()) {
      const timeoutId = setTimeout(() => {
        validateVideo(newValue);
      }, 1000);
      return () => clearTimeout(timeoutId);
    } else {
      setVideoInfo(null);
      setError('');
    }
  };

  const handleSearch = () => {
    validateVideo(videoId);
  };

  const generateEmbedUrl = (id) => {
    return `https://iframe.mediadelivery.net/embed/495146/${id}?autoplay=false&loop=false&muted=false&responsive=true&startTime=0`;
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          label={label}
          value={videoId}
          onChange={handleVideoIdChange}
          placeholder={placeholder}
          variant="outlined"
          error={!!error}
          helperText={error || (videoInfo ? 'فيديو صحيح' : '')}
          InputProps={{
            startAdornment: <VideoIcon color="action" sx={{ ml: 1 }} />,
          }}
        />
        <Button
          variant="outlined"
          onClick={handleSearch}
          disabled={loading || !videoId.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
        >
          تحقق
        </Button>
      </Box>

      {videoInfo && showPreview && (
        <Card sx={{ mb: 2, border: '1px solid', borderColor: 'success.main' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" color="success.main">
                <CheckIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                فيديو صحيح
              </Typography>
              <Tooltip title="عرض الفيديو">
                <IconButton onClick={() => setOpen(true)} color="primary">
                  <PlayIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="subtitle1" gutterBottom>
                  {videoInfo.title || 'بدون عنوان'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  <Chip 
                    label={`المدة: ${formatDuration(videoInfo.length || 0)}`} 
                    size="small" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={`الحالة: ${videoInfo.status === 4 ? 'جاهز' : 'قيد المعالجة'}`} 
                    size="small" 
                    color={videoInfo.status === 4 ? 'success' : 'warning'}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  معرف الفيديو: {videoInfo.id}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                {videoInfo.thumbnail && (
                  <CardMedia
                    component="img"
                    height="120"
                    image={`https://vz-c239d8b2-f7d.b-cdn.net/${videoInfo.id}/thumbnail.jpg`}
                    alt="Video thumbnail"
                    sx={{ borderRadius: 1 }}
                  />
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Video Preview Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              معاينة الفيديو
            </Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {videoInfo && (
            <Box sx={{ textAlign: 'center' }}>
              <iframe
                src={generateEmbedUrl(videoInfo.id)}
                width="100%"
                height="400"
                frameBorder="0"
                allowFullScreen
                style={{ borderRadius: '8px' }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BunnyVideoSelector;
