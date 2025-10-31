import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  CircularProgress,
  TextField,
  IconButton,
  Divider,
  Button,
  Paper,
  Collapse,
  Badge,
  useTheme,
  useMediaQuery,
  alpha,
  keyframes,
  Tooltip,
  linearProgressClasses,
  Fade,
  Modal,
  Backdrop,
  Alert,
  Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
// Global scrollbar styles to force visibility
const globalScrollbarStyles = `
  * {
    scrollbar-width: auto !important;
    scrollbar-color: rgba(255,255,255,0.6) rgba(255,255,255,0.2) !important;
  }
  *::-webkit-scrollbar {
    width: 25px !important;
    height: 25px !important;
    display: block !important;
    background: rgba(255,255,255,0.1) !important;
  }
  *::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.2) !important;
    border-radius: 12px !important;
    border: 2px solid rgba(255,255,255,0.1) !important;
    display: block !important;
  }
  *::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.6) !important;
    border-radius: 12px !important;
    border: 3px solid rgba(255,255,255,0.3) !important;
    min-height: 25px !important;
    display: block !important;
  }
  *::-webkit-scrollbar-thumb:hover {
    background: rgba(255,255,255,0.8) !important;
  }
  *::-webkit-scrollbar-corner {
    background: rgba(255,255,255,0.2) !important;
    display: block !important;
  }
  *::-webkit-scrollbar-button {
    display: block !important;
    height: 25px !important;
    width: 25px !important;
    background: rgba(255,255,255,0.3) !important;
    border: 2px solid rgba(255,255,255,0.2) !important;
    border-radius: 8px !important;
  }
`;
// Inject global styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = globalScrollbarStyles;
  document.head.appendChild(styleSheet);
}
import {
  PlayCircleOutline,
  PlayArrow,
  Close as CloseIcon,
  Pause,
  Fullscreen,
  FullscreenExit,
  VolumeUp,
  VolumeOff,
  Speed as SpeedIcon,
  ClosedCaption,
  Settings,
  PictureInPicture,
  CheckCircle,
  MenuBook,
  Assignment,
  VideoLibrary,
  ArrowBack,
  ArrowForward,
  DescriptionOutlined,
  School,
  Timeline,
  LocalLibrary,
  Speed,
  InsertChart,
  CalendarToday,
  HourglassEmpty,
  CheckCircle as CheckCircleIcon,
  Menu,
  Close,
  NoteAlt,
  Download,
  Share,
  MoreVert,
  Subscriptions,
  ThumbUp,
  ThumbUpOutlined,
  ForumOutlined,
  NoteAltOutlined,
  DownloadOutlined,
  ShareOutlined,
  MoreVertOutlined,
  CloudOff,
  Forum,
  ChevronRight,
  ChevronLeft,
  PictureAsPdf,
  Image,
  TableChart,
  TextSnippet,
  Code,
  AudioFile,
  VideoFile,
  Archive,
  InsertDriveFile,
  Visibility,
  OpenInNew,
  Search,
  EmojiEvents,
} from '@mui/icons-material';
import { courseAPI } from '../../services/api.service';
import { contentAPI } from '../../services/content.service';
import { API_CONFIG } from '../../config/api.config';
// Force reload
// Process file URL to ensure it's absolute - moved outside component for global access
const processFileUrl = (fileUrl) => {
  try {
    if (!fileUrl || typeof fileUrl !== 'string') {
      console.warn('Invalid file URL provided:', fileUrl);
      return null;
    }
    // If it's already a full URL, return as is
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    // If it starts with /media/ or /static/, make it absolute
    if (fileUrl.startsWith('/media/') || fileUrl.startsWith('/static/')) {
      return `${API_CONFIG.baseURL}${fileUrl}`;
    }
    // If it's a relative path, assume it's in media
    if (!fileUrl.startsWith('/')) {
      return `${API_CONFIG.baseURL}/media/${fileUrl}`;
    }
    return fileUrl;
  } catch (error) {
    console.error('Error processing file URL:', error, fileUrl);
    return null;
  }
};
// Helper function to get file icon based on extension
const getFileIcon = (fileName, extension) => {
  const iconProps = { sx: { fontSize: 48, color: '#757575' } };
  
  switch (extension) {
    case 'pdf':
      return <PictureAsPdf {...iconProps} />;
    case 'doc':
    case 'docx':
      return <DescriptionOutlined {...iconProps} />;
    case 'ppt':
    case 'pptx':
      return <TableChart {...iconProps} />;
    case 'xls':
    case 'xlsx':
      return <TableChart {...iconProps} />;
    case 'txt':
    case 'md':
      return <TextSnippet {...iconProps} />;
    case 'zip':
    case 'rar':
      return <Archive {...iconProps} />;
    case 'mp3':
    case 'wav':
    case 'ogg':
      return <AudioFile {...iconProps} />;
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'flv':
    case 'webm':
    case 'mkv':
      return <VideoFile {...iconProps} />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
    case 'svg':
      return <Image {...iconProps} />;
    default:
      return <InsertDriveFile {...iconProps} />;
  }
};
// Simple video player component to replace ReactPlayer
const VideoPlayer = ({ url, playing, onPlay, onPause, onProgress, onDuration, width, height, style, lessonData, previewResource }) => {
  const videoRef = React.useRef(null);
  
  // Check if lesson has Bunny CDN video
  const hasBunnyVideo = lessonData?.bunny_video_id;
  // Get the appropriate video URL
  const getVideoUrl = () => {
    if (hasBunnyVideo) {
      // Use the private embed URL with token from API response
      if (lessonData.bunny_video_url) {
        return lessonData.bunny_video_url;
      }
      // Fallback: generate embed URL if bunny_video_url is not provided
      const fallbackUrl = `https://iframe.mediadelivery.net/embed/495146/${lessonData.bunny_video_id}?autoplay=false&loop=false&muted=false&responsive=true&startTime=0`;
      return fallbackUrl;
    }
    return url;
  };
  // Process URL to ensure it's absolute (for videos)
  const processVideoUrl = (videoUrl) => {
    if (!videoUrl || typeof videoUrl !== 'string') {
      return null;
    }
    // If it's already a full URL, return as is
    if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
      return videoUrl;
    }
    // If it starts with /media/ or /static/, make it absolute
    if (videoUrl.startsWith('/media/') || videoUrl.startsWith('/static/')) {
      return `${API_CONFIG.baseURL}${videoUrl}`;
    }
    // If it's a relative path, assume it's in media
    if (!videoUrl.startsWith('/')) {
      return `${API_CONFIG.baseURL}/media/${videoUrl}`;
    }
    return videoUrl;
  };
  const processedUrl = processVideoUrl(getVideoUrl());
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handlePlay = () => onPlay && onPlay();
    const handlePause = () => onPause && onPause();
    const handleTimeUpdate = () => {
      if (onProgress && video.duration) {
        onProgress({
          played: video.currentTime / video.duration,
          playedSeconds: video.currentTime,
          loaded: 1,
          loadedSeconds: video.duration,
        });
      }
    };
    const handleDuration = () => onDuration && onDuration(video.duration);
    const handleLoadedMetadata = () => onDuration && onDuration(video.duration);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDuration);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDuration);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [onPlay, onPause, onProgress, onDuration]);
  React.useEffect(() => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.play().catch(e => console.error('Error playing video:', e));
    } else {
      videoRef.current.pause();
    }
  }, [playing]);
  // Check if URL is valid for direct video files
  const isValidVideoUrl = processedUrl && (
    processedUrl.includes('.mp4') ||
    processedUrl.includes('.webm') ||
    processedUrl.includes('.ogg') ||
    processedUrl.includes('.avi') ||
    processedUrl.includes('.mov') ||
    processedUrl.includes('.wmv') ||
    processedUrl.includes('.flv') ||
    processedUrl.includes('blob:') ||
    processedUrl.startsWith('http://') ||
    processedUrl.startsWith('https://')
  );
  // Check if URL is external video (YouTube, Vimeo, Bunny CDN, etc.)
  // For Bunny videos with DRM, ALWAYS use iframe to avoid HLS key errors
  const isExternalVideoUrl = hasBunnyVideo || (processedUrl && (
    processedUrl.includes('youtube.com') ||
    processedUrl.includes('youtu.be') ||
    processedUrl.includes('vimeo.com') ||
    processedUrl.includes('dailymotion.com') ||
    processedUrl.includes('twitch.tv') ||
    processedUrl.includes('facebook.com') ||
    processedUrl.includes('instagram.com') ||
    processedUrl.includes('mediadelivery.net') ||
    processedUrl.includes('b-cdn.net')
  ));
  // Convert external video URLs to embed format
  const getEmbedUrl = (url) => {
    if (!url) return '';
    // For Bunny videos with DRM, ALWAYS use iframe embed to avoid HLS key errors
    if (hasBunnyVideo && lessonData?.bunny_video_id) {
      // Use the private embed URL with token if available
      if (lessonData.bunny_video_url) {
        return lessonData.bunny_video_url;
      }
      // Fallback to basic embed URL
      const fallbackEmbedUrl = `https://iframe.mediadelivery.net/embed/495146/${lessonData.bunny_video_id}?autoplay=false&loop=false&muted=false&responsive=true&startTime=0`;
      return fallbackEmbedUrl;
    }
    // Bunny CDN URLs
    if (url.includes('mediadelivery.net') || url.includes('b-cdn.net')) {
      // If it's already an embed URL, return as is
      if (url.includes('/embed/')) {
        return url;
      }
      // If it's a direct video URL, try to convert to embed format
      if (url.includes('b-cdn.net')) {
        // Extract video ID from Bunny CDN URL
        const urlParts = url.split('/');
        // The video ID is the second to last part (before playlist.m3u8)
        const videoId = urlParts[urlParts.length - 2];
        if (videoId && videoId !== 'playlist.m3u8') {
          const convertedUrl = `https://iframe.mediadelivery.net/embed/495146/${videoId}?autoplay=false&loop=false&muted=false&responsive=true`;
          return convertedUrl;
        }
      }
      return url;
    }
    // YouTube URLs
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    // Vimeo URLs
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    // DailyMotion URLs
    if (url.includes('dailymotion.com/video/')) {
      const videoId = url.split('dailymotion.com/video/')[1]?.split('?')[0];
      return videoId ? `https://www.dailymotion.com/embed/video/${videoId}` : url;
    }
    // Twitch URLs (for VODs)
    if (url.includes('twitch.tv/videos/')) {
      const videoId = url.split('twitch.tv/videos/')[1]?.split('?')[0];
      return videoId ? `https://player.twitch.tv/?video=${videoId}` : url;
    }
    // For other platforms, return original URL
    return url;
  };
  // If it's an external video URL, display it in an iframe
  if (isExternalVideoUrl) {
    const embedUrl = getEmbedUrl(processedUrl);
    const isBunnyVideo = hasBunnyVideo || processedUrl.includes('mediadelivery.net') || processedUrl.includes('b-cdn.net');
    return (
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <iframe
          src={embedUrl}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: '#000',
            padding: '20px'
          }}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title="External Video"
          onError={() => {}}
        />
      </Box>
    );
  }
  // Check if URL is a file (not video)
  const isFileUrl = processedUrl && (
    processedUrl.includes('.pdf') ||
    processedUrl.includes('.doc') ||
    processedUrl.includes('.docx') ||
    processedUrl.includes('.ppt') ||
    processedUrl.includes('.pptx') ||
    processedUrl.includes('.xls') ||
    processedUrl.includes('.xlsx') ||
    processedUrl.includes('.txt') ||
    processedUrl.includes('.zip') ||
    processedUrl.includes('.rar') ||
    processedUrl.includes('.mp3') ||
    processedUrl.includes('.wav') ||
    processedUrl.includes('.ogg')
  );
  // If it's a file URL, display it in an iframe or download link
  if (isFileUrl) {
    try {
      const fileName = processedUrl?.split('/').pop() || 'ملف';
      const fileExtension = fileName?.split('.').pop()?.toLowerCase() || '';
      return (
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          {/* File indicator */}
          <Box sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 10,
            bgcolor: 'rgba(0,0,0,0.7)',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}>
            ملف خارجي
          </Box>
          {/* File content area */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f5f5f5',
            p: 3
          }}>
            {/* File icon and info */}
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3,
              textAlign: 'center'
            }}>
              {getFileIcon(fileName, fileExtension)}
              <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: '#333' }}>
                {fileName}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                نوع الملف: {fileExtension.toUpperCase()}
              </Typography>
            </Box>
            {/* Action buttons */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {/* Preview button for supported files */}
              {(fileExtension === 'pdf' || fileExtension === 'txt') && (
                <Button
                  variant="contained"
                  startIcon={<Visibility />}
                  onClick={() => {
                    try {
                      const iframe = document.createElement('iframe');
                      iframe.src = processedUrl;
                      iframe.style.width = '100%';
                      iframe.style.height = '100%';
                      iframe.style.border = 'none';
                      // Create a new window for preview
                      const previewWindow = window.open('', '_blank', 'width=800,height=600');
                      if (previewWindow) {
                        previewWindow.document.write(`
                          <html>
                            <head><title>معاينة ${fileName}</title></head>
                            <body style="margin:0; padding:0;">
                              ${iframe.outerHTML}
                            </body>
                          </html>
                        `);
                        previewWindow.document.close();
                      }
                    } catch (error) {
                      console.error('Error opening file preview:', error);
                      // Fallback: open file directly
                      window.open(processedUrl, '_blank');
                    }
                  }}
                  sx={{
                    bgcolor: '#1976d2',
                    '&:hover': { bgcolor: '#1565c0' }
                  }}
                >
                  معاينة
                </Button>
            )}
            {/* Download button */}
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => {
                try {
                  const link = document.createElement('a');
                  link.href = processedUrl;
                  link.download = fileName;
                  link.target = '_blank';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                } catch (error) {
                  console.error('Error downloading file:', error);
                  // Fallback: open file in new tab
                  window.open(processedUrl, '_blank');
                }
              }}
              sx={{
                bgcolor: '#4caf50',
                '&:hover': { bgcolor: '#45a049' }
              }}
            >
              تحميل
            </Button>
            {/* Open in new tab button */}
            <Button
              variant="outlined"
              startIcon={<OpenInNew />}
              onClick={() => {
                try {
                  window.open(processedUrl, '_blank');
                } catch (error) {
                  console.error('Error opening file in new tab:', error);
                }
              }}
              sx={{
                borderColor: '#1976d2',
                color: '#1976d2',
                '&:hover': { 
                  borderColor: '#1565c0',
                  bgcolor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              فتح في نافذة جديدة
            </Button>
          </Box>
          {/* File URL info */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1, maxWidth: '100%' }}>
            <Typography variant="caption" sx={{ 
              color: '#666', 
              wordBreak: 'break-all',
              fontSize: '0.7rem'
            }}>
              رابط الملف: {processedUrl}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
    } catch (error) {
      console.error('Error rendering file display:', error);
      return (
        <Box sx={{ 
          position: 'relative', 
          width: '100%', 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5',
          p: 3
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <InsertDriveFile sx={{ fontSize: 48, color: '#757575', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
              خطأ في عرض الملف
            </Typography>
            <Typography variant="body2" sx={{ color: '#888' }}>
              لا يمكن عرض هذا الملف حالياً
            </Typography>
          </Box>
        </Box>
      );
    }
  }
  if (!isValidVideoUrl) {
    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        color: 'white',
        flexDirection: 'column',
        padding: 5
      }}>
        {/* عرض محتوى الدرس مباشرة */}
        {lessonData?.content ? (
          <Box sx={{
            width: '100%',
            height: '100%',
            p: 3,
            overflow: 'auto',
            bgcolor: 'rgba(255,255,255,0.95)',
            color: 'text.primary'
          }}>
            <Typography
              variant="body1"
              sx={{
                textAlign: 'right',
                lineHeight: 1.8,
                fontSize: '1.1rem',
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  color: 'primary.main',
                  fontWeight: 'bold',
                  mb: 2
                },
                '& p': {
                  mb: 2
                },
                '& ul, & ol': {
                  pr: 2,
                  mb: 2
                },
                '& li': {
                  mb: 1
                },
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 1,
                  boxShadow: 2
                },
                '& blockquote': {
                  borderLeft: 4,
                  borderColor: 'primary.main',
                  pl: 2,
                  fontStyle: 'italic',
                  bgcolor: 'grey.50',
                  p: 2,
                  borderRadius: 1,
                  mb: 2
                },
                '& code': {
                  bgcolor: 'grey.100',
                  px: 1,
                  py: 0.5,
                  borderRadius: 0.5,
                  fontFamily: 'monospace'
                },
                '& pre': {
                  bgcolor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  mb: 2
                }
              }}
              dangerouslySetInnerHTML={{ __html: lessonData.content }}
            />
          </Box>
        ) : lessonData?.resources && lessonData.resources.length > 0 ? (
          // عرض الملف مباشرة في نفس المكان
          <Box sx={{
            width: '100%',
            height: '100%',
            position: 'relative',
            bgcolor: 'rgba(255,255,255,0.95)',
            color: 'text.primary'
          }}>
            {(() => {
              const resource = lessonData.resources[0]; // عرض الملف الأول
              const fileName = resource.title || resource.name || resource.file_url?.split('/').pop() || 'ملف';
              const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
              const fileUrl = resource.file_url || resource.url;
              const processedFileUrl = processFileUrl(fileUrl);
              // عرض PDF
              if (fileExtension === 'pdf') {
                return (
                  <iframe
                    src={processedFileUrl}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                    title={fileName}
                  />
                );
              }
              // عرض الفيديو
              if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(fileExtension)) {
                return (
                  <video
                    src={processedFileUrl}
                    controls
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                    title={fileName}
                  />
                );
              }
              // عرض الصور
              if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension)) {
                return (
                  <img
                    src={processedFileUrl}
                    alt={fileName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                );
              }
              // عرض ملفات النص
              if (['txt', 'md', 'json', 'xml', 'csv'].includes(fileExtension)) {
                return (
                  <iframe
                    src={processedFileUrl}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                    title={fileName}
                  />
                );
              }
              // للملفات الأخرى
              return (
                <iframe
                  src={processedFileUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  title={fileName}
                />
              );
            })()}
          </Box>
        ) : (
          <>
            <Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }}>
              لا يوجد محتوى متاح
            </Typography>
            <Typography variant="body2" sx={{ color: 'white', textAlign: 'center', opacity: 0.7 }}>
              {url ? `رابط الفيديو غير صحيح أو غير مدعوم` : 'لم يتم توفير رابط الفيديو أو محتوى'}
            </Typography>
          </>
        )}
        {url && (
          <Typography variant="caption" sx={{ color: 'white', textAlign: 'center', opacity: 0.5, wordBreak: 'break-all' }}>
            الرابط الأصلي: {url}
          </Typography>
        )}
        {processedUrl && processedUrl !== url && (
          <Typography variant="caption" sx={{ color: 'white', textAlign: 'center', opacity: 0.5, wordBreak: 'break-all' }}>
            الرابط المعالج: {processedUrl}
          </Typography>
        )}
      </div>
    );
  }
  return (
    <>
      <video
        ref={videoRef}
        src={processedUrl}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#000',
          objectFit: 'contain', // Ensures video fits within container while maintaining aspect ratio
          objectPosition: 'center', // Centers the video within the container
          padding: '20px',
          ...style
        }}
        controls
        playsInline
        preload="metadata"
        onError={() => {}}
        onLoadStart={() => {}}
        onLoadedData={() => {}}
        onCanPlay={() => {}}
      />
    </>
  );
};
// Calculate module-specific stats
const calculateModuleStats = (modules, selectedModuleId) => {
  if (!selectedModuleId) {
    return null;
  }
  const module = modules.find(m => m.id == selectedModuleId);
  if (!module) {
    // Check if it's a submodule
    for (const mainModule of modules) {
      if (mainModule.submodules) {
        const subModule = mainModule.submodules.find(sm => sm.id == selectedModuleId);
        if (subModule) {
          const totalLessons = subModule.lessons ? subModule.lessons.length : 0;
          const completedLessons = subModule.lessons ? subModule.lessons.filter(lesson => lesson.completed).length : 0;
          return {
            totalLessons,
            completedLessons,
            moduleTitle: subModule.title || subModule.name
          };
        }
      }
    }
    return null;
  }
  // Calculate stats for main module
  let totalLessons = module.lessons ? module.lessons.length : 0;
  let completedLessons = module.lessons ? module.lessons.filter(lesson => lesson.completed).length : 0;
  // Add submodule stats
  if (module.submodules && module.submodules.length > 0) {
    module.submodules.forEach(subModule => {
      if (subModule.lessons) {
        totalLessons += subModule.lessons.length;
        completedLessons += subModule.lessons.filter(lesson => lesson.completed).length;
      }
    });
  }
  return {
    totalLessons,
    completedLessons,
    moduleTitle: module.title
  };
};
// Calculate filtered lessons count based on selected module
const calculateFilteredLessonsCount = (modules, selectedModuleId) => {
  if (!selectedModuleId) {
    // Return total lessons count from all modules
    return modules.reduce((sum, module) => {
      let moduleLessons = module.lessons ? module.lessons.length : 0;
      let subModuleLessons = 0;
      if (module.submodules && module.submodules.length > 0) {
        subModuleLessons = module.submodules.reduce((subSum, subModule) => {
          return subSum + (subModule.lessons ? subModule.lessons.length : 0);
        }, 0);
      }
      return sum + moduleLessons + subModuleLessons;
    }, 0);
  } else {
    // Return lessons count from selected module only
    const selectedModule = modules.find(module => module.id == selectedModuleId);
    if (!selectedModule) return 0;
    let moduleLessons = selectedModule.lessons ? selectedModule.lessons.length : 0;
    let subModuleLessons = 0;
    if (selectedModule.submodules && selectedModule.submodules.length > 0) {
      subModuleLessons = selectedModule.submodules.reduce((subSum, subModule) => {
        return subSum + (subModule.lessons ? subModule.lessons.length : 0);
      }, 0);
    }
    return moduleLessons + subModuleLessons;
  }
};
const CourseContent = ({ modules, expandedModule, onModuleClick, onLessonClick, currentLessonId, isSidebarExpanded, activeTab, selectedModuleId, searchParams, setSearchParams, setSelectedModuleId, bookmarkedLessons, toggleBookmark }) => {
  const theme = useTheme();
  // Filter content based on active tab and selected module
  const getFilteredContent = () => {
    if (activeTab === 'lessons') {
      // If a specific module is selected, show only lessons from that module
      if (selectedModuleId) {
        const allLessons = [];
        (modules || []).forEach((module, moduleIndex) => {
          // Check if this is the selected module or if any of its submodules match
          const isSelectedModule = module.id == selectedModuleId;
          let hasSelectedSubModule = false;
          if (module.submodules && module.submodules.length > 0) {
            hasSelectedSubModule = module.submodules.some(subModule => subModule.id == selectedModuleId);
          }
          if (isSelectedModule || hasSelectedSubModule) {
            // Add lessons from main module only if the main module is selected
            if (isSelectedModule && module.lessons && module.lessons.length > 0) {
              module.lessons.forEach((lesson, lessonIndex) => {
                allLessons.push({
                  ...lesson,
                  moduleTitle: module.title,
                  moduleIndex: moduleIndex + 1,
                  lessonIndex: lessonIndex + 1,
                  moduleId: module.id
                });
              });
            }
            // Add lessons from submodules
            if (module.submodules && module.submodules.length > 0) {
              module.submodules.forEach((subModule) => {
                // Only add lessons from the selected submodule, or all submodules if main module is selected
                const shouldAddSubModule = hasSelectedSubModule 
                  ? subModule.id == selectedModuleId 
                  : isSelectedModule;
                if (shouldAddSubModule && subModule.lessons && subModule.lessons.length > 0) {
                  subModule.lessons.forEach((lesson, lessonIndex) => {
                    allLessons.push({
                      ...lesson,
                      moduleTitle: subModule.title || subModule.name,
                      moduleIndex: moduleIndex + 1,
                      lessonIndex: lessonIndex + 1,
                      moduleId: subModule.id,
                      isSubModule: true,
                      parentModuleId: module.id
                    });
                  });
                }
              });
            }
          }
        });
        return allLessons;
      } else {
        // Return all lessons from all modules if no specific module is selected
        const allLessons = [];
        (modules || []).forEach((module, moduleIndex) => {
          if (module.lessons && module.lessons.length > 0) {
            module.lessons.forEach((lesson, lessonIndex) => {
              allLessons.push({
                ...lesson,
                moduleTitle: module.title,
                moduleIndex: moduleIndex + 1,
                lessonIndex: lessonIndex + 1,
                moduleId: module.id
              });
            });
          }
          // Add lessons from submodules
          if (module.submodules && module.submodules.length > 0) {
            module.submodules.forEach((subModule) => {
              if (subModule.lessons && subModule.lessons.length > 0) {
                subModule.lessons.forEach((lesson, lessonIndex) => {
                  allLessons.push({
                    ...lesson,
                    moduleTitle: subModule.title || subModule.name,
                    moduleIndex: moduleIndex + 1,
                    lessonIndex: lessonIndex + 1,
                    moduleId: subModule.id,
                    isSubModule: true,
                    parentModuleId: module.id
                  });
                });
              }
            });
          }
        });
        return allLessons;
      }
    } else {
      // Default to modules
      return modules || [];
    }
  };
  const filteredContent = getFilteredContent();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', p: isSidebarExpanded ? 0.25 : 0.125 }}>
      {activeTab === 'lessons' ? (
        // Display all lessons from all modules
        filteredContent.map((lesson, index) => {
            const isSelected = currentLessonId === lesson.id;
        return (
          <Box
                key={lesson.id}
                onClick={() => onLessonClick(lesson.moduleId, lesson.id)}
            sx={{
              p: isSidebarExpanded ? 1 : 0.75,
              bgcolor: isSelected ? 'white' : 'rgba(255,255,255,0.08)',
              borderRadius: 1,
              cursor: 'pointer',
              color: isSelected ? '#1e40af' : 'white',
              border: isSelected ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease',
              position: 'relative',
              minHeight: isSidebarExpanded ? 45 : 35,
              '&:hover': {
                bgcolor: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255,255,255,0.12)',
                borderColor: isSelected ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.2)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Radio Button / Icon */}
              <Box
                sx={{
                  width: isSidebarExpanded ? 14 : 10,
                  height: isSidebarExpanded ? 14 : 10,
                  borderRadius: '50%',
                  border: `2px solid ${isSelected ? '#3b82f6' : 'rgba(255,255,255,0.6)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: isSelected ? '#3b82f6' : 'transparent',
                  position: 'relative'
                }}
              >
                {isSelected && (
                  <Box
                    sx={{
                      width: isSidebarExpanded ? 5 : 3,
                      height: isSidebarExpanded ? 5 : 3,
                      borderRadius: '50%',
                      bgcolor: 'white'
                    }}
                  />
                )}
              </Box>
                  {/* Lesson Icon */}
              <Box
                sx={{
                  width: isSidebarExpanded ? 18 : 14,
                  height: isSidebarExpanded ? 18 : 14,
                  borderRadius: '50%',
                  bgcolor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSelected ? '#3b82f6' : 'rgba(255,255,255,0.8)',
                }}
              >
                    {lesson.type === 'video' ? (
                      <VideoLibrary sx={{ fontSize: isSidebarExpanded ? 10 : 8 }} />
                    ) : lesson.type === 'assignment' ? (
                      <Assignment sx={{ fontSize: isSidebarExpanded ? 10 : 8 }} />
                ) : (
                      <MenuBook sx={{ fontSize: isSidebarExpanded ? 10 : 8 }} />
                )}
              </Box>
                  {/* Lesson Content */}
              {isSidebarExpanded && (
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{
                    fontWeight: 'bold',
                    color: isSelected ? '#1e40af' : 'white',
                    fontSize: '0.75rem',
                    mb: 0.2,
                    lineHeight: 1.2
                  }}>
                        {lesson.title}
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: isSelected ? 'rgba(30, 64, 175, 0.8)' : 'rgba(255,255,255,0.8)',
                    fontSize: '0.65rem',
                    fontWeight: 500
                  }}>
                        {lesson.moduleTitle} • {lesson.duration || '0:00'}
                  </Typography>
                </Box>
              )}
            </Box>
                {/* Completion Indicator */}
                {lesson.completed && isSidebarExpanded && (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 4, 
                    right: 4,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: '#10b981'
                  }} />
                )}
                {/* Flag Button - Left side */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 4, 
                  left: 4,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(lesson.id);
                    }}
                    sx={{
                      width: isSidebarExpanded ? 16 : 12,
                      height: isSidebarExpanded ? 16 : 12,
                      minWidth: 'auto',
                      padding: 0,
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    <Box sx={{
                      width: isSidebarExpanded ? 12 : 8,
                      height: isSidebarExpanded ? 12 : 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {bookmarkedLessons[lesson.id] ? (
                        // Filled flag (bookmarked) - Red color
                        <Box sx={{
                          width: isSidebarExpanded ? 12 : 8,
                          height: isSidebarExpanded ? 12 : 8,
                          background: '#ff0000',
                          clipPath: 'polygon(0% 0%, 0% 100%, 70% 70%, 100% 50%, 70% 30%)',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
                          border: '1px solid rgba(255,255,255,0.3)'
                        }} />
                      ) : (
                        // White flag (not bookmarked) - White filled
                        <Box sx={{
                          width: isSidebarExpanded ? 12 : 8,
                          height: isSidebarExpanded ? 12 : 8,
                          background: 'rgba(255,255,255,0.9)',
                          clipPath: 'polygon(0% 0%, 0% 100%, 70% 70%, 100% 50%, 70% 30%)',
                          border: '1px solid rgba(255,255,255,0.8)',
                          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
                        }} />
                      )}
                    </Box>
                  </IconButton>
                </Box>
              </Box>
            );
        })
      ) : (
        // Display modules with lesson count and progress
        filteredContent.map((module, index) => {
          // Calculate module-specific stats
          const moduleLessons = module.lessons || [];
          const moduleSubModules = module.submodules || [];
          // Count lessons in main module and submodules
          let totalLessons = moduleLessons.length;
          let completedLessons = moduleLessons.filter(lesson => lesson.completed).length;
          // Add submodule lessons
          moduleSubModules.forEach(subModule => {
            if (subModule.lessons) {
              totalLessons += subModule.lessons.length;
              completedLessons += subModule.lessons.filter(lesson => lesson.completed).length;
            }
          });
          const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
          const isExpanded = expandedModule === module.id;
          return (
            <Box
              key={module.id}
              sx={{
                mb: 1,
                bgcolor: 'rgba(255,255,255,0.08)',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.1)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.12)',
                  borderColor: 'rgba(255,255,255,0.2)',
                }
              }}
            >
              {/* Module Header */}
              <Box
                onClick={() => onModuleClick(module.id)}
                sx={{
                  p: isSidebarExpanded ? 1.5 : 1,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: isExpanded ? 'rgba(255,255,255,0.1)' : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                  }
                }}
              >
                {/* Module Icon */}
                <Box sx={{ 
                  width: isSidebarExpanded ? 24 : 20, 
                  height: isSidebarExpanded ? 24 : 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Box sx={{
                    width: isSidebarExpanded ? 20 : 16,
                    height: isSidebarExpanded ? 20 : 16,
                    borderRadius: 1,
                    bgcolor: '#4DBFB3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: isSidebarExpanded ? '12px' : '10px',
                    fontWeight: 'bold'
                  }}>
                    {index + 1}
                  </Box>
                </Box>
                {/* Module Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: isSidebarExpanded ? '0.8rem' : '0.7rem',
                    mb: 0.5,
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {module.title}
                  </Typography>
                  {/* Progress Bar */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={progressPercentage}
                      sx={{
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 2,
                          background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '0.65rem',
                      fontWeight: 500,
                      minWidth: 'fit-content'
                    }}>
                      {completedLessons}/{totalLessons}
                    </Typography>
                  </Box>
                  {/* Lesson Count */}
                  <Typography variant="caption" sx={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.6rem',
                    mt: 0.5,
                    display: 'block'
                  }}>
                    {totalLessons} درس • {Math.round(progressPercentage)}% مكتمل
                  </Typography>
                </Box>
                {/* Expand/Collapse Icon */}
                <Box sx={{
                  width: isSidebarExpanded ? 20 : 16,
                  height: isSidebarExpanded ? 20 : 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.7)',
                  transition: 'transform 0.2s ease',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </Box>
              </Box>
              {/* Module Lessons (when expanded) */}
              {isExpanded && (
                <Box sx={{ 
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  bgcolor: 'rgba(0,0,0,0.1)'
                }}>
                  {/* Main Module Lessons */}
                  {moduleLessons.map((lesson, lessonIndex) => (
                    <Box
                      key={lesson.id}
                      onClick={() => onLessonClick(module.id, lesson.id)}
                      sx={{
                        p: isSidebarExpanded ? 1.25 : 1,
                        pl: isSidebarExpanded ? 4 : 3,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        borderBottom: lessonIndex < moduleLessons.length - 1 || moduleSubModules.length > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.08)',
                        }
                      }}
                    >
                      <Box sx={{
                        width: isSidebarExpanded ? 8 : 6,
                        height: isSidebarExpanded ? 8 : 6,
                        borderRadius: '50%',
                        bgcolor: lesson.completed ? '#10b981' : 'rgba(255,255,255,0.3)',
                        border: lesson.completed ? 'none' : '1px solid rgba(255,255,255,0.5)'
                      }} />
                      <Typography variant="body2" sx={{
                        color: lesson.completed ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)',
                        fontSize: isSidebarExpanded ? '0.7rem' : '0.65rem',
                        fontWeight: lesson.completed ? 'bold' : 'normal',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {lesson.title}
                      </Typography>
                      {lesson.duration && (
                        <Typography variant="caption" sx={{
                          color: 'rgba(255,255,255,0.5)',
                          fontSize: '0.6rem',
                          ml: 'auto'
                        }}>
                          {lesson.duration}
                        </Typography>
                      )}
                    </Box>
                  ))}
                  {/* Submodule Lessons */}
                  {moduleSubModules.map((subModule, subIndex) => (
                    <Box key={subModule.id} sx={{ mt: 1 }}>
                      {/* Submodule Header */}
                      <Box sx={{
                        px: isSidebarExpanded ? 4 : 3,
                        py: 0.5,
                        bgcolor: 'rgba(255,255,255,0.05)',
                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        <Typography variant="caption" sx={{
                          color: 'rgba(255,255,255,0.6)',
                          fontSize: '0.65rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {subModule.title || subModule.name}
                        </Typography>
                      </Box>
                      {/* Submodule Lessons */}
                      {subModule.lessons?.map((lesson, lessonIndex) => (
                        <Box
                          key={lesson.id}
                          onClick={() => onLessonClick(subModule.id, lesson.id)}
                          sx={{
                            p: isSidebarExpanded ? 1.25 : 1,
                            pl: isSidebarExpanded ? 6 : 4.5,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            borderBottom: lessonIndex < subModule.lessons.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: 'rgba(255,255,255,0.05)',
                            }
                          }}
                        >
                          <Box sx={{
                            width: isSidebarExpanded ? 6 : 4,
                            height: isSidebarExpanded ? 6 : 4,
                            borderRadius: '50%',
                            bgcolor: lesson.completed ? '#10b981' : 'rgba(255,255,255,0.2)',
                            border: lesson.completed ? 'none' : '1px solid rgba(255,255,255,0.3)'
                          }} />
                          <Typography variant="body2" sx={{
                            color: lesson.completed ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.6)',
                            fontSize: isSidebarExpanded ? '0.65rem' : '0.6rem',
                            fontWeight: lesson.completed ? 'bold' : 'normal',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {lesson.title}
                          </Typography>
                          {lesson.duration && (
                            <Typography variant="caption" sx={{
                              color: 'rgba(255,255,255,0.4)',
                              fontSize: '0.55rem',
                              ml: 'auto'
                            }}>
                              {lesson.duration}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          );
        })
      )}
    </Box>
  );
};
const CourseTracking = () => {
  const { t } = useTranslation();
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  const [expandedModule, setExpandedModule] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Load bookmarked lessons from localStorage on component mount
  const [bookmarkedLessons, setBookmarkedLessons] = useState(() => {
    try {
      const saved = localStorage.getItem(`bookmarkedLessons_${courseId}`);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading bookmarked lessons from localStorage:', error);
      return {};
    }
  });
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('lessons');
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [imagePreview, setImagePreview] = useState({ open: false, url: '', title: '' });
  // File preview states
  const [filePreview, setFilePreview] = useState({ 
    open: false, 
    url: '', 
    title: '', 
    type: '',
    content: null 
  });
  // Clean up old bookmarked lessons data when course changes
  useEffect(() => {
    // This effect runs when courseId changes
    // The bookmarkedLessons state will be reset by the useState initializer above
  }, [courseId]);
  // Handle URL parameters for tab and module selection
  useEffect(() => {
    const tab = searchParams.get('tab');
    const moduleId = searchParams.get('moduleId');
    const lessonId = searchParams.get('lessonId');
    if (tab) {
      setActiveTab(tab);
    } else {
      // Default to lessons tab if no tab specified
      setActiveTab('lessons');
    }
    if (moduleId) {
      setSelectedModuleId(moduleId);
      setExpandedModule(moduleId);
      // If no specific lessonId is provided, open first lesson in the module
      if (!lessonId && courseData?.modules) {
        const module = courseData.modules.find(m => m.id == moduleId);
        if (module) {
          let firstLesson = null;
          // Check main module lessons first
          if (module.lessons && module.lessons.length > 0) {
            firstLesson = module.lessons[0];
          } else if (module.submodules && module.submodules.length > 0) {
            // Check submodules for first lesson
            for (const subModule of module.submodules) {
              if (subModule.lessons && subModule.lessons.length > 0) {
                firstLesson = subModule.lessons[0];
                break;
              }
            }
          }
          if (firstLesson) {
            setCurrentLesson(firstLesson);
            setActiveTab('lessons');
          }
        }
      }
    }
    // Handle specific content selection
    if (lessonId && courseData?.modules) {
      // Find and open the specific lesson
      const allModules = [...courseData.modules];
      let lessonFound = false;
      for (const module of allModules) {
        if (module.lessons) {
          const lesson = module.lessons.find(l => l.id == lessonId);
          if (lesson) {
            setCurrentLesson(lesson);
            setSelectedModuleId(module.id);
            setExpandedModule(module.id);
            setActiveTab('lessons');
            lessonFound = true;
            break;
          }
        }
        // Check submodules
        if (module.submodules) {
          for (const subModule of module.submodules) {
            if (subModule.lessons) {
              const lesson = subModule.lessons.find(l => l.id == lessonId);
              if (lesson) {
                setCurrentLesson(lesson);
                setSelectedModuleId(module.id);
                setExpandedModule(module.id);
                setActiveTab('lessons');
                lessonFound = true;
                break;
              }
            }
          }
        }
      }
    }
  }, [searchParams, courseData?.modules]);
  // Fetch course data on component mount
  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);
  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (!courseId) {
        setError('معرف الدورة غير صحيح');
        setIsLoading(false);
        return;
      }
      const response = await courseAPI.getCourseTrackingData(courseId);
      // Check if response has required data
      if (!response || !response.course) {
        setError('بيانات الدورة غير متاحة');
        setIsLoading(false);
        return;
      }
      // Transform API data to match component structure
      const transformedData = {
        id: response.course.id,
        title: response.course.title,
        instructor: response.course.instructor,
        instructorAvatar: response.course.instructor_avatar,
        category: response.course.category,
        level: response.course.level,
        duration: response.course.duration,
        progress: response.course.overall_progress,
        rating: response.course.rating,
        totalStudents: response.course.total_students,
        lastAccessed: {
          moduleId: response.course.modules[0]?.id || 'm1',
          lessonId: response.course.modules[0]?.lessons[0]?.id || 'l1',
          title: response.course.modules[0]?.lessons[0]?.title || 'الدرس الأول',
          duration: response.course.modules[0]?.lessons[0]?.duration_minutes || 15,
          completion: response.course.completed_lessons
        },
        enrolledDate: response.enrollment?.enrollment_date,
        hasFinalExam: response.course.has_final_exam,
        modules: (response.course.modules || []).map(module => ({
          id: module.id,
          title: module.name,
          progress: module.progress,
          totalLessons: module.total_lessons,
          completedLessons: module.completed_lessons,
          lessons: (module.lessons || []).map(lesson => {
            // Find video resource if no direct video_url
            let videoUrl = lesson.video_url;
            // Use bunny_video_url if available (contains token for DRM protected videos)
            if (lesson.bunny_video_url) {
              videoUrl = lesson.bunny_video_url;
            } else if (!videoUrl && lesson.resources) {
              const videoResource = lesson.resources.find(resource =>
                resource.resource_type === 'video' ||
                (resource.file_url && (
                  resource.file_url.includes('.mp4') ||
                  resource.file_url.includes('.webm') ||
                  resource.file_url.includes('.mov') ||
                  resource.file_url.includes('.avi')
                ))
              );
              if (videoResource) {
                videoUrl = videoResource.file_url || videoResource.url;
              }
            }
            return {
              id: lesson.id,
              title: lesson.title,
              duration: `${Math.floor(lesson.duration_minutes / 60)}:${(lesson.duration_minutes % 60).toString().padStart(2, '0')}`,
              durationMinutes: lesson.duration_minutes,
              type: lesson.lesson_type,
              completed: lesson.completed,
              videoUrl: videoUrl,
              content: lesson.content,
              resources: lesson.resources || [],
              bunny_video_id: lesson.bunny_video_id,
              bunny_video_url: lesson.bunny_video_url
            };
          })
        })),
      };
      setCourseData(transformedData);
      // Set initial expanded module to first module
      if (transformedData.modules && transformedData.modules.length > 0) {
        setExpandedModule(transformedData.modules[0].id);
      }
      // Set initial current lesson
      if (transformedData.modules && transformedData.modules.length > 0 &&
        transformedData.modules[0].lessons && transformedData.modules[0].lessons.length > 0) {
        const firstLesson = transformedData.modules[0].lessons[0];
        setCurrentLesson({
          moduleId: transformedData.modules[0].id,
          lessonId: firstLesson.id,
          ...firstLesson
        });
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('الدورة غير موجودة أو غير متاحة لك.');
      } else if (err.response?.status === 403) {
        setError('أنت غير مسجل في هذه الدورة.');
      } else if (err.response?.status === 401) {
        setError('يرجى تسجيل الدخول مرة أخرى.');
      } else {
        setError('حدث خطأ أثناء جلب بيانات الدورة. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  // Calculate course statistics
  const courseStats = courseData ? {
    totalLessons: (courseData.modules || []).reduce((sum, module) => sum + (module.lessons?.length || 0), 0),
    completedLessons: (courseData.modules || []).reduce((sum, module) => sum + (module.completedLessons || 0), 0),
    completionPercentage: courseData.progress || 0,
    totalDuration: courseData.duration || 0,
    remainingLessons: (courseData.modules || []).reduce((sum, module) => sum + (module.lessons?.length || 0), 0) - (courseData.modules || []).reduce((sum, module) => sum + (module.completedLessons || 0), 0)
  } : { totalLessons: 0, completedLessons: 0, completionPercentage: 0, totalDuration: 0, remainingLessons: 0 };
  // Handle module expansion
  const handleModuleClick = (moduleId) => {
    setExpandedModule(expandedModule == moduleId ? null : moduleId);
  };
  // Handle lesson selection
  const handleLessonClick = (moduleId, lessonId) => {
    const module = (courseData.modules || []).find(m => m.id == moduleId);
    if (module) {
      const lesson = (module.lessons || []).find(l => l.id == lessonId);
      if (lesson) {
        setCurrentLesson({
          moduleId,
          lessonId,
          ...lesson
        });
        // Clear other content when selecting a lesson
        setIsPlaying(true);
        if (isMobile) {
          setShowSidebar(false);
        }
      }
    }
  };
  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  // Handle video progress
  const handleProgress = (state) => {
    setVideoProgress(state.playedSeconds);
  };
  // Handle video duration
  const handleDuration = (duration) => {
    setVideoDuration(duration);
  };
  // Handle video end
  const handleVideoEnd = () => {
    setIsPlaying(false);
    setVideoProgress(0);
  };
  // Mark lesson as completed
  const markLessonAsCompleted = async () => {
    if (!currentLesson || !courseId) return;
    try {
      await courseAPI.markLessonCompleted(courseId, currentLesson.id);
      // Update local state
      setCourseData(prevData => {
        const updatedModules = prevData.modules.map(module => {
          if (module.id === currentLesson.moduleId) {
            const updatedLessons = module.lessons.map(lesson => {
              if (lesson.id === currentLesson.id) {
                return { ...lesson, completed: true };
              }
              return lesson;
            });
            return {
              ...module,
              lessons: updatedLessons,
              completedLessons: updatedLessons.filter(l => l.completed).length
            };
          }
          return module;
        });
        return {
          ...prevData,
          modules: updatedModules
        };
      });
      showSnackbar('تم إكمال الدرس بنجاح!', 'success');
      // Auto-advance to next lesson if available
      setTimeout(() => {
        navigateToNextLesson();
      }, 2000);
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
      showSnackbar('حدث خطأ أثناء إكمال الدرس', 'error');
    }
  };
  // Navigate to next lesson
  const navigateToNextLesson = () => {
    if (!currentLesson || !courseData) return;
    const currentModuleIndex = courseData.modules.findIndex(m => m.id === currentLesson.moduleId);
    if (currentModuleIndex >= 0) {
      const currentModule = courseData.modules[currentModuleIndex];
      const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLesson.id);
      if (currentLessonIndex < currentModule.lessons.length - 1) {
        // Next lesson in same module
        const nextLesson = currentModule.lessons[currentLessonIndex + 1];
        handleLessonClick(currentModule.id, nextLesson.id);
      } else if (currentModuleIndex < courseData.modules.length - 1) {
        // First lesson of next module
        const nextModule = courseData.modules[currentModuleIndex + 1];
        if (nextModule.lessons.length > 0) {
          const nextLesson = nextModule.lessons[0];
          handleLessonClick(nextModule.id, nextLesson.id);
        }
      }
    }
  };
  // Navigate to previous lesson
  const navigateToPreviousLesson = () => {
    if (!currentLesson || !courseData) return;
    const currentModuleIndex = courseData.modules.findIndex(m => m.id === currentLesson.moduleId);
    if (currentModuleIndex >= 0) {
      const currentModule = courseData.modules[currentModuleIndex];
      const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLesson.id);
      if (currentLessonIndex > 0) {
        // Previous lesson in same module
        const prevLesson = currentModule.lessons[currentLessonIndex - 1];
        handleLessonClick(currentModule.id, prevLesson.id);
      } else if (currentModuleIndex > 0) {
        // Last lesson of previous module
        const prevModule = courseData.modules[currentModuleIndex - 1];
        if (prevModule.lessons.length > 0) {
          const prevLesson = prevModule.lessons[prevModule.lessons.length - 1];
          handleLessonClick(prevModule.id, prevLesson.id);
        }
      }
    }
  };
  // Download resource
  const downloadResource = async (resource) => {
    try {
      if (!resource) {
        showSnackbar('معلومات الملف غير متوفرة', 'error');
        return;
      }
      const fileUrl = resource.file_url || resource.url;
      if (!fileUrl) {
        showSnackbar('رابط الملف غير متوفر', 'error');
        return;
      }
      const processedUrl = processFileUrl(fileUrl);
      if (!processedUrl) {
        showSnackbar('لا يمكن معالجة رابط الملف', 'error');
        return;
      }
      const fileName = resource.title || resource.name || 'ملف';
      // Direct download for file resources
      const link = document.createElement('a');
      link.href = processedUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSnackbar('تم بدء تحميل الملف', 'success');
    } catch (error) {
      console.error('Error downloading resource:', error);
      showSnackbar('حدث خطأ أثناء تحميل الملف', 'error');
    }
  };
  // Preview resource
  const previewResource = (resource) => {
    try {
      if (!resource) {
        showSnackbar('معلومات الملف غير متوفرة', 'error');
        return;
      }
      const fileUrl = resource.file_url || resource.url;
      if (!fileUrl) {
        showSnackbar('رابط الملف غير متوفر', 'error');
        return;
      }
      const processedUrl = processFileUrl(fileUrl);
      if (!processedUrl) {
        showSnackbar('لا يمكن معالجة رابط الملف', 'error');
        return;
      }
      const fileName = resource.title || resource.name || 'ملف';
      const extension = fileName.split('.').pop()?.toLowerCase() || '';
      // For images, show in modal preview
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
        setImagePreview({
          open: true,
          url: processedUrl,
          title: fileName
        });
        return;
      }
      // For PDFs, show in same page
      if (extension === 'pdf') {
        setFilePreview({
          open: true,
          url: processedUrl,
          title: fileName,
          type: 'pdf',
          content: null
        });
        return;
      }
      // For videos, show in same page
      if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension)) {
        setFilePreview({
          open: true,
          url: processedUrl,
          title: fileName,
          type: 'video',
          content: null
        });
        return;
      }
      // For text files, try to fetch and display content
      if (['txt', 'md', 'json', 'xml', 'csv'].includes(extension)) {
        fetch(processedUrl)
          .then(response => response.text())
          .then(content => {
            setFilePreview({
              open: true,
              url: processedUrl,
              title: fileName,
              type: 'text',
              content: content
            });
          })
          .catch(() => {
            // If fetch fails, open in new tab
            window.open(processedUrl, '_blank');
            showSnackbar('تم فتح الملف في نافذة جديدة', 'info');
          });
        return;
      }
      // For other files, open in new tab
      window.open(processedUrl, '_blank');
      showSnackbar('تم فتح الملف في نافذة جديدة', 'info');
    } catch (error) {
      console.error('Error previewing resource:', error);
      showSnackbar('حدث خطأ أثناء معاينة الملف', 'error');
    }
  };
  // Track video progress
  const trackVideoProgress = async (progress) => {
    if (!currentLesson || !courseId) return;
    try {
      await courseAPI.trackLessonProgress(courseId, currentLesson.id, {
        content_type: 'video',
        progress_percentage: progress.played * 100,
        current_time: progress.playedSeconds,
        duration: videoDuration
      });
    } catch (error) {
      console.error('Error tracking video progress:', error);
    }
  };
  // Handle video progress with throttling
  const handleProgressWithTracking = (state) => {
    setVideoProgress(state.playedSeconds);
    // Track progress every 10 seconds or when video ends
    if (state.playedSeconds % 10 < 1 || state.played >= 0.95) {
      trackVideoProgress(state);
    }
  };
  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  const toggleSidebarExpand = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };
  // Handle lessons filter toggle
  // Snackbar handlers
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };
  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  const toggleBookmark = (lessonId) => {
    const isCurrentlyBookmarked = bookmarkedLessons[lessonId];
    const newBookmarkedState = {
      ...bookmarkedLessons,
      [lessonId]: !bookmarkedLessons[lessonId]
    };
    setBookmarkedLessons(newBookmarkedState);
    // Save to localStorage
    try {
      localStorage.setItem(`bookmarkedLessons_${courseId}`, JSON.stringify(newBookmarkedState));
    } catch (error) {
      console.error('Error saving bookmarked lessons to localStorage:', error);
    }
    // Show confirmation message
    const message = !isCurrentlyBookmarked 
      ? 'تم وضع علامة على الدرس' 
      : 'تم إزالة العلامة من الدرس';
    showSnackbar(message, 'info');
  };
  if (isLoading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        bgcolor: 'background.default'
      }}>
        <CircularProgress size={60} sx={{ color: '#7c4dff' }} />
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        bgcolor: 'background.default',
        flexDirection: 'column',
        padding: 24
      }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={fetchCourseData}
          sx={{ bgcolor: '#7c4dff' }}
        >
          إعادة المحاولة
        </Button>
      </Box>
    );
  }
  if (!courseId) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        bgcolor: 'background.default',
        flexDirection: 'column',
        padding: 24
      }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          معرف الدورة غير صحيح
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/student/my-courses')}
          sx={{ bgcolor: '#7c4dff' }}
        >
          العودة إلى كورساتي
        </Button>
      </Box>
    );
  }
  if (!courseData) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        bgcolor: 'background.default'
      }}>
        <Typography>لا توجد بيانات متاحة</Typography>
      </Box>
    );
  }
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #663399 0%, #333679 50%, #1B1B48 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Mobile Backdrop/Overlay */}
      {showSidebar && (
        <Box
          sx={{
            display: { xs: 'block', md: 'none' },
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1099,
            backdropFilter: 'blur(2px)',
            transition: 'all 0.3s ease-in-out',
          }}
          onClick={toggleSidebar}
        />
      )}
      {/* Left Sidebar - Course Content */}
      <Box
        sx={{
          width: { xs: showSidebar ? '100%' : 0, md: isSidebarExpanded ? '280px' : '60px' },
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          position: { xs: 'fixed', md: 'relative' },
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 1100,
          height: { xs: showSidebar ? '100vh' : 0, md: '100vh' },
          background: 'linear-gradient(180deg, #663399 0%, #333679 50%, #1B1B48 100%)',
          boxShadow: { xs: 3, md: 2 },
          transform: {
            xs: showSidebar ? 'translateX(0)' : 'translateX(-100%)',
            md: 'none'
          },
        }}
      >
        <Box sx={{
          p: isSidebarExpanded ? 1.5 : 0.5,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          color: 'white'
        }}>
          {/* Header with close and collapse buttons */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: isSidebarExpanded ? 2 : 1
          }}>
            {/* Mobile close button - only show on mobile */}
            <IconButton
              onClick={toggleSidebar}
              sx={{
                display: { xs: 'flex', md: 'none' },
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                width: 32,
                height: 32,
                borderRadius: '50%',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                }
              }}
            >
              <Close sx={{ fontSize: 18 }} />
            </IconButton>
            {/* Desktop navigation button - only show on desktop */}
            <IconButton
              onClick={() => {
                const targetModuleId = selectedModuleId || currentLesson?.parentModuleId || currentLesson?.moduleId || expandedModule || '';
                const params = new URLSearchParams();
                params.set('courseId', courseId);
                if (targetModuleId) params.set('moduleId', targetModuleId);
                navigate(`/student/my-courses?${params.toString()}`);
              }}
              sx={{
                display: { xs: 'none', md: 'flex' },
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                width: 32,
                height: 32,
                borderRadius: '50%',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                }
              }}
            >
              <Close sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              onClick={toggleSidebarExpand}
              sx={{
                display: { xs: 'none', md: 'flex' },
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                width: 32,
                height: 32,
                borderRadius: '50%',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                }
              }}
            >
              {isSidebarExpanded ? <ChevronLeft sx={{ fontSize: 18 }} /> : <ChevronRight sx={{ fontSize: 18 }} />}
            </IconButton>
          </Box>
          {/* Course Information */}
          {isSidebarExpanded && (
            <Box sx={{}}>
              <Typography variant="body2" sx={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.7rem',
                fontWeight: 500,
                mb: 0.4,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Biology
              </Typography>
              <Typography variant="h6" sx={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                lineHeight: 1.3,
                mb: 0
              }}>
                Molecules and Fundamentals of Biology
              </Typography>
            </Box>
          )}
          {/* Progress Section */}
          {isSidebarExpanded && (
            <Box sx={{}}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
                <Typography variant="body2" sx={{
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {(() => {
                    const moduleStats = selectedModuleId ? calculateModuleStats(courseData?.modules || [], selectedModuleId) : null;
                    return moduleStats ? `${moduleStats.moduleTitle} - الدروس المكتملة` : 'الدروس المكتملة';
                  })()}
                </Typography>
              </Box>
              {(() => {
                // Get stats for selected module or overall course
                const moduleStats = selectedModuleId ? calculateModuleStats(courseData?.modules || [], selectedModuleId) : null;
                const totalLessons = moduleStats ? moduleStats.totalLessons : calculateFilteredLessonsCount(courseData?.modules || [], selectedModuleId);
                const completedLessons = moduleStats ? moduleStats.completedLessons : courseStats.completedLessons;
                return (
                  <>
              <Typography variant="h5" sx={{
                color: 'white',
                fontWeight: 'bold',
                mb: 1.25,
                fontSize: '1.1rem'
              }}>
                      {completedLessons}/{totalLessons}
              </Typography>
              <LinearProgress
                variant="determinate"
                      value={totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0}
                sx={{
                  height: 2.5,
                  borderRadius: 1.25,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 1.25,
                    background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                  }
                }}
              />
                    <Typography variant="caption" sx={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '0.65rem',
                      mt: 0.5,
                      display: 'block',
                      textAlign: 'center'
                    }}>
                      {totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0}% مكتمل
                    </Typography>
                  </>
                );
              })()}
            </Box>
          )}
          {/* Content Tabs */}
          {isSidebarExpanded && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 0.4 }}>
                <Box 
                  onClick={() => {
                    setActiveTab('lessons');
                    setSearchParams({ tab: 'lessons' });
                  }}
                  sx={{
                  px: 1.25,
                  py: 0.6,
                  borderRadius: 1.25,
                    bgcolor: activeTab === 'lessons' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                    }
                }}>
                  <Typography variant="body2" sx={{
                    color: activeTab === 'lessons' ? 'white' : 'rgba(255,255,255,0.7)',
                    fontWeight: activeTab === 'lessons' ? 'bold' : 500,
                    fontSize: '0.7rem'
                  }}>
                    {t('courseTrackingLessons')}
                    {(() => {
                      const bookmarkedCount = Object.values(bookmarkedLessons).filter(Boolean).length;
                      return bookmarkedCount > 0 ? ` (${bookmarkedCount} flagged)` : '';
                    })()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
          {/* Lessons Filter Toggle */}
          {isSidebarExpanded && activeTab === 'lessons' && (
            <Box sx={{ mb: 2 }}>
              <Button
                onClick={() => {
                  if (selectedModuleId) {
                    setSelectedModuleId(null);
                    setSearchParams({ tab: 'lessons' });
                  } else {
                    // Find first module with lessons
                    const firstModule = courseData?.modules?.find(module => 
                      module.lessons && module.lessons.length > 0
                    );
                    if (firstModule) {
                      setSelectedModuleId(firstModule.id);
                      setExpandedModule(firstModule.id);
                      setSearchParams({ tab: 'lessons', moduleId: firstModule.id });
                    }
                  }
                }}
                variant={selectedModuleId ? "contained" : "outlined"}
                size="small"
                fullWidth
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  borderRadius: 1.25,
                  py: 0.75,
                  textTransform: 'none',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  bgcolor: selectedModuleId ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.5)',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                {selectedModuleId ? 'Show All Lessons' : 'Show Selected Module Only'}
              </Button>
            </Box>
          )}
          {/* Scrollable Content */}
          <Box sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            pr: isSidebarExpanded ? 0.75 : 0,
            '&::-webkit-scrollbar': {
              width: isSidebarExpanded ? '5px' : '3px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '2.5px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '2.5px',
              '&:hover': {
                background: 'rgba(255,255,255,0.5)',
              }
            },
          }}>
            <CourseContent
              modules={courseData.modules}
              expandedModule={expandedModule}
              onModuleClick={handleModuleClick}
              onLessonClick={handleLessonClick}
              currentLessonId={currentLesson?.id}
              isSidebarExpanded={isSidebarExpanded}
              activeTab={activeTab}
              selectedModuleId={selectedModuleId}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              setSelectedModuleId={setSelectedModuleId}
              bookmarkedLessons={bookmarkedLessons}
              toggleBookmark={toggleBookmark}
            />
          </Box>
        </Box>
      </Box>
      {/* Main Content Area - Split Layout */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}>
        {/* Mobile Header */}
        <Box sx={{
          display: { xs: 'flex', md: 'none' },
          alignItems: 'center',
          p: 2,
          background: 'linear-gradient(135deg, rgba(102, 51, 153, 0.95) 0%, rgba(51, 54, 121, 0.95) 50%, rgba(27, 27, 72, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Menu Button */}
          <IconButton onClick={toggleSidebar} sx={{ mr: 2, color: 'white' }}>
            <Menu />
          </IconButton>
          {/* Course Title */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
              {currentLesson?.title || courseData.title}
            </Typography>
          </Box>
          {/* Dashboard Return Button */}
          <IconButton 
            onClick={() => {
              const targetModuleId = selectedModuleId || currentLesson?.parentModuleId || currentLesson?.moduleId || expandedModule || '';
              const params = new URLSearchParams();
              params.set('courseId', courseId);
              if (targetModuleId) params.set('moduleId', targetModuleId);
              navigate(`/student/my-courses?${params.toString()}`);
            }} 
            sx={{ 
              ml: 2, 
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
              }
            }}
          >
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
        {/* Main Split Layout */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          height: '100%',
          overflow: 'hidden'
        }}>
          {/* Left Panel - Main Video Player */}
          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(102, 51, 153, 0.1) 0%, rgba(51, 54, 121, 0.1) 50%, rgba(27, 27, 72, 0.1) 100%)',
            backdropFilter: 'blur(5px)'
          }}>
            {/* Course Title Header - Fixed at top */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              p: 2,
              background: 'linear-gradient(135deg, rgba(102, 51, 153, 0.95) 0%, rgba(51, 54, 121, 0.95) 50%, rgba(27, 27, 72, 0.95) 100%)',
              backdropFilter: 'blur(10px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <IconButton
                onClick={() => {
                  // Clear all content and reset to default state
                  setCurrentLesson(null);
                }}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                  }
                }}
              >
                <Close sx={{ fontSize: 20 }} />
              </IconButton>
              <Box sx={{ flex: 1, mx: 2 }}>
                <Typography variant="h4" sx={{
                  fontWeight: 'bold',
                  fontSize: '2rem',
                  mb: 0.5,
                  textAlign: 'right',
                  color: 'white',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}>
                  {courseData?.title || 'Biological Chemistry'}
                </Typography>
              </Box>
            </Box>
            
            {/* Video Player Area */}
            {currentLesson ? (
              <Box sx={{
                position: 'absolute',
                top: 60,
                left: 0,
                right: 0,
                bottom: 60,
                zIndex: 5
              }}>
                <VideoPlayer
                  url={currentLesson.videoUrl}
                  playing={isPlaying}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onProgress={handleProgress}
                  onDuration={handleDuration}
                  lessonData={currentLesson}
                  style={{
                    width: '100%',
                    height: '100%'
                  }}
                />
              </Box>
            ) : (
              <Box sx={{
                position: 'absolute',
                top: 60,
                left: 0,
                right: 0,
                bottom: 60,
                zIndex: 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(102, 51, 153, 0.1) 0%, rgba(51, 54, 121, 0.1) 50%, rgba(27, 27, 72, 0.1) 100%)',
                color: 'white',
                textAlign: 'center',
                p: 4
              }}>
                <Box>
                  <VideoLibrary sx={{ fontSize: 64, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                    اختر درساً للبدء
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    قم باختيار درس من القائمة الجانبية لعرض المحتوى
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
          {/* Navigation Buttons */}
          <Box sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            background: 'linear-gradient(135deg, rgba(102, 51, 153, 0.95) 0%, rgba(51, 54, 121, 0.95) 50%, rgba(27, 27, 72, 0.95) 100%)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center'
          }}>
            {(
              // Lesson navigation buttons
              <>
                <Button
                  variant="outlined"
                  disabled={!currentLesson}
                  onClick={navigateToPreviousLesson}
                  sx={{
                    width: 40,
                    height: 40,
                    minWidth: 40,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      color: 'rgba(255, 255, 255, 0.3)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ArrowForward />
                </Button>
                <Button
                  variant="outlined"
                  disabled={!currentLesson}
                  onClick={navigateToNextLesson}
                  sx={{
                    width: 40,
                    height: 40,
                    minWidth: 40,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      color: 'rgba(255, 255, 255, 0.3)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ArrowBack />
                </Button>
                <Button
                  variant="contained"
                  disabled={!currentLesson}
                  onClick={markLessonAsCompleted}
                  sx={{
                    minWidth: 200,
                    height: 40,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    backdropFilter: 'blur(5px)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%)',
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)',
                    },
                    '&:disabled': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'rgba(255, 255, 255, 0.3)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Complete and Continue
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>
      {/* Image Preview Modal */}
      <Modal
        open={imagePreview.open}
        onClose={() => setImagePreview({ open: false, url: '', title: '' })}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={imagePreview.open}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95vw', sm: '80vw', md: '70vw' },
            height: { xs: '80vh', sm: '70vh', md: '60vh' },
            maxWidth: '1200px',
            maxHeight: '800px',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Header */}
            <Box sx={{
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1, textAlign: 'center' }}>
                {imagePreview.title}
              </Typography>
              <IconButton
                onClick={() => setImagePreview({ open: false, url: '', title: '' })}
                sx={{ ml: 2 }}
              >
                <Close />
              </IconButton>
            </Box>
            {/* Image Content */}
            <Box sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
              overflow: 'hidden'
            }}>
              <img
                src={processFileUrl(imagePreview.url)}
                alt={imagePreview.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: 8,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }}
                onError={(e) => {
                  console.error('Error loading image:', e);
                  showSnackbar('حدث خطأ أثناء تحميل الصورة', 'error');
                }}
              />
            </Box>
            {/* Footer Actions */}
            <Box sx={{
              p: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => {
                  const processedUrl = processFileUrl(imagePreview.url);
                  const link = document.createElement('a');
                  link.href = processedUrl;
                  link.download = imagePreview.title;
                  link.target = '_blank';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  showSnackbar('تم بدء تحميل الصورة', 'success');
                }}
              >
                تحميل الصورة
              </Button>
              <Button
                variant="outlined"
                startIcon={<OpenInNew />}
                onClick={() => {
                  const processedUrl = processFileUrl(imagePreview.url);
                  window.open(processedUrl, '_blank');
                  showSnackbar('تم فتح الصورة في نافذة جديدة', 'info');
                }}
              >
                فتح في نافذة جديدة
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
      {/* File Preview Modal */}
      <Modal
        open={filePreview.open}
        onClose={() => setFilePreview({ open: false, url: '', title: '', type: '', content: null })}
        closeAfterTransition
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={filePreview.open}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: '90%', md: '80%', lg: '70%' },
            maxWidth: '1200px',
            height: { xs: '90%', md: '80%' },
            maxHeight: '800px',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <Box sx={{
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {filePreview.title}
              </Typography>
              <IconButton onClick={() => setFilePreview({ open: false, url: '', title: '', type: '', content: null })}>
                <Close />
              </IconButton>
            </Box>
            {/* Content */}
            <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              {filePreview.type === 'pdf' && (
                <iframe
                  src={filePreview.url}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  title={filePreview.title}
                />
              )}
              {filePreview.type === 'video' && (
                <video
                  src={filePreview.url}
                  controls
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                  title={filePreview.title}
                />
              )}
              {filePreview.type === 'text' && (
                <Box sx={{
                  p: 2,
                  height: '100%',
                  overflow: 'auto',
                  bgcolor: '#f5f5f5',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  lineHeight: 1.5
                }}>
                  <pre style={{ 
                    margin: 0, 
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {filePreview.content}
                  </pre>
                </Box>
              )}
            </Box>
          </Box>
        </Fade>
      </Modal>
      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box >
  );
};
export default CourseTracking;
