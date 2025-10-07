import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Chip,
  Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  PlayArrow as PlayIcon,
  Close as CloseIcon,
  VideoLibrary as VideoIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

const UnitVideoPlayer = ({ unit }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  // Check if unit has Bunny video
  const hasBunnyVideo = unit?.bunny_video_id;
  const hasUploadedVideo = unit?.video;
  const hasExternalVideo = unit?.video_url;

  // Use private embed URL with token from unit data
  const getBunnyEmbedUrl = (videoId) => {
    // If unit has bunny_video_url (with token), use it
    if (unit?.bunny_video_url) {
      return unit.bunny_video_url;
    }
    // Fallback to basic embed URL
    return `https://iframe.mediadelivery.net/embed/495146/${videoId}?autoplay=false&loop=false&muted=false&responsive=true&startTime=0`;
  };

  // Get video source type
  const getVideoSource = () => {
    if (hasBunnyVideo) return 'bunny';
    if (hasUploadedVideo) return 'uploaded';
    if (hasExternalVideo) return 'external';
    return null;
  };

  const videoSource = getVideoSource();

  if (!videoSource) {
    return null; // No video available
  }

  const handlePlayClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const renderVideoContent = () => {
    if (videoSource === 'bunny') {
      return (
        <iframe
          src={getBunnyEmbedUrl(unit.bunny_video_id)}
          width="100%"
          height="400"
          frameBorder="0"
          allowFullScreen
          style={{ borderRadius: '8px' }}
        />
      );
    } else if (videoSource === 'uploaded') {
      return (
        <video
          src={unit.video}
          controls
          style={{ width: '100%', height: '400px', borderRadius: '8px' }}
        />
      );
    } else if (videoSource === 'external') {
      // Handle external video URLs (YouTube, Vimeo, etc.)
      const videoUrl = unit.video_url;
      
      // Check if it's a YouTube URL
      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        const videoId = videoUrl.includes('youtu.be') 
          ? videoUrl.split('youtu.be/')[1]?.split('?')[0]
          : videoUrl.split('v=')[1]?.split('&')[0];
        
        if (videoId) {
          return (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              width="100%"
              height="400"
              frameBorder="0"
              allowFullScreen
              style={{ borderRadius: '8px' }}
            />
          );
        }
      }
      
      // For other video URLs, show a link
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" gutterBottom>
            فيديو خارجي
          </Typography>
          <Button
            variant="contained"
            color="primary"
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<PlayIcon />}
          >
            {t('lessonsWatchVideo')}
          </Button>
        </Box>
      );
    }
    
    return null;
  };

  const getVideoSourceLabel = () => {
    switch (videoSource) {
      case 'bunny': return 'Bunny CDN';
      case 'uploaded': return 'فيديو مرفوع';
      case 'external': return 'فيديو خارجي';
      default: return '';
    }
  };

  const getVideoSourceColor = () => {
    switch (videoSource) {
      case 'bunny': return 'success';
      case 'uploaded': return 'primary';
      case 'external': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Card sx={{ 
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
        }
      }}>
        {/* Video Thumbnail/Preview */}
        <Box
          sx={{
            position: 'relative',
            height: '200px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={handlePlayClick}
        >
          {/* Play Button Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0, 0, 0, 0.7)',
              borderRadius: '50%',
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.9)',
                transform: 'translate(-50%, -50%) scale(1.1)',
              }
            }}
          >
            <PlayIcon sx={{ color: 'white', fontSize: '40px', ml: 0.5 }} />
          </Box>

          {/* Video Source Badge */}
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <Chip
              icon={videoSource === 'bunny' ? <CheckIcon /> : <VideoIcon />}
              label={getVideoSourceLabel()}
              color={getVideoSourceColor()}
              size="small"
              sx={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                color: `${getVideoSourceColor()}.main`,
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            فيديو الوحدة
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {videoSource === 'bunny' 
              ? 'شاهد فيديو الوحدة عالي الجودة من Bunny CDN'
              : videoSource === 'uploaded'
              ? 'شاهد فيديو الوحدة المرفوع'
              : 'شاهد فيديو الوحدة الخارجي'
            }
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handlePlayClick}
            startIcon={<PlayIcon />}
            fullWidth
            sx={{ 
              borderRadius: '8px',
              py: 1.5,
              fontWeight: 600,
            }}
          >
            مشاهدة فيديو الوحدة
          </Button>
        </CardContent>
      </Card>

      {/* Video Modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1,
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            فيديو الوحدة - {unit?.name || unit?.title}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {renderVideoContent()}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={handleClose} variant="outlined">
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UnitVideoPlayer;
