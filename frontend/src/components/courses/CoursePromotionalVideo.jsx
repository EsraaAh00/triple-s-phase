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

const CoursePromotionalVideo = ({ course }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  // Check if course has Bunny promotional video
  const hasBunnyVideo = course?.bunny_promotional_video_id && course?.bunny_promotional_video_url;
  const hasExternalVideo = course?.promotional_video;

  // Generate Bunny embed URL
  const getBunnyEmbedUrl = (videoId) => {
    return `https://iframe.mediadelivery.net/embed/495146/${videoId}?autoplay=false&loop=false&muted=false&responsive=true&startTime=0`;
  };

  // Get video source type
  const getVideoSource = () => {
    if (hasBunnyVideo) return 'bunny';
    if (hasExternalVideo) return 'external';
    return null;
  };

  const videoSource = getVideoSource();

  if (!videoSource) {
    return null; // No promotional video available
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
          src={getBunnyEmbedUrl(course.bunny_promotional_video_id)}
          width="100%"
          height="400"
          frameBorder="0"
          allowFullScreen
          style={{ 
            borderRadius: '8px',
            minHeight: '200px',
            maxHeight: '400px'
          }}
        />
      );
    } else if (videoSource === 'external') {
      // Handle external video URLs (YouTube, Vimeo, etc.)
      const videoUrl = course.promotional_video;
      
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
              style={{ 
                borderRadius: '8px',
                minHeight: '200px',
                maxHeight: '400px'
              }}
            />
          );
        }
      }
      
      // For other video URLs, show a link
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" gutterBottom>
            فيديو تعريفي خارجي
          </Typography>
          <Button
            variant="contained"
            color="primary"
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<PlayIcon />}
          >
            مشاهدة الفيديو
          </Button>
        </Box>
      );
    }
    
    return null;
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Card sx={{ 
        borderRadius: { xs: '8px', sm: '12px' },
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
            height: { xs: '150px', sm: '180px', md: '200px' },
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
              width: { xs: '60px', sm: '70px', md: '80px' },
              height: { xs: '60px', sm: '70px', md: '80px' },
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
            <PlayIcon sx={{ 
              color: 'white', 
              fontSize: { xs: '30px', sm: '35px', md: '40px' }, 
              ml: 0.5 
            }} />
          </Box>

          {/* Video Source Badge */}
          <Box sx={{ 
            position: 'absolute', 
            top: { xs: 8, sm: 12, md: 16 }, 
            right: { xs: 8, sm: 12, md: 16 } 
          }}>
            <Chip
              icon={videoSource === 'bunny' ? <CheckIcon /> : <VideoIcon />}
              label={videoSource === 'bunny' ? 'Bunny CDN' : 'فيديو خارجي'}
              color={videoSource === 'bunny' ? 'success' : 'primary'}
              size="small"
              sx={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                color: videoSource === 'bunny' ? 'success.main' : 'primary.main',
                fontWeight: 600,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                height: { xs: '24px', sm: '28px', md: '32px' }
              }}
            />
          </Box>
        </Box>

        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
            }}
          >
            الفيديو التعريفي للدورة
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              lineHeight: { xs: 1.4, sm: 1.5 }
            }}
          >
            {videoSource === 'bunny' 
              ? t('coursesWatchPromoVideoBunny')
              : t('coursesWatchPromoVideoExternal')
            }
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handlePlayClick}
            startIcon={<PlayIcon sx={{ fontSize: { xs: '16px', sm: '18px' } }} />}
            fullWidth
            sx={{ 
              borderRadius: { xs: '6px', sm: '8px' },
              py: { xs: 1, sm: 1.5 },
              fontWeight: 600,
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}
          >
            {t('coursesWatchPromoVideo')}
          </Button>
        </CardContent>
      </Card>

      {/* Video Modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        fullScreen={false}
        PaperProps={{
          sx: {
            borderRadius: { xs: '8px', sm: '12px' },
            overflow: 'hidden',
            margin: { xs: 1, sm: 2 },
            maxHeight: { xs: '90vh', sm: '80vh' }
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
            الفيديو التعريفي - {course?.title}
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

export default CoursePromotionalVideo;
