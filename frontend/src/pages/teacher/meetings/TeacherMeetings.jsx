import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Fab, Badge, Tabs, Tab, Divider, List, ListItem,
  ListItemText, ListItemAvatar, Paper, Alert, LinearProgress, Snackbar, CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Add as AddIcon, VideoCall as VideoCallIcon, Group as GroupIcon,
  Schedule as ScheduleIcon, Edit as EditIcon, Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon, Stop as StopIcon, Chat as ChatIcon,
  Notifications as NotificationsIcon, Link as LinkIcon, FileCopy as FileCopyIcon,
  CalendarToday as CalendarTodayIcon, AccessTime as AccessTimeIcon,
  People as PeopleIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import '../../meetings/MeetingsCommon.css';
import TeacherMeetingDetailsDialog from '../../meetings/TeacherMeetingDetailsDialog';
import { meetingAPI } from '../../../services/meeting.service';

// Styled Components
const StyledCard = styled(Card)(({ theme, status }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  border: status === 'ongoing' ? '2px solid #4DBFB3' : '1px solid #e0e0e0',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  },
  background: status === 'ongoing' ? 'linear-gradient(135deg, #f8fff8 0%, #ffffff 100%)' : '#ffffff',
}));

const StatusChip = styled(Chip)(({ status }) => ({
  borderRadius: 20,
  fontWeight: 600,
  fontSize: '0.75rem',
  height: 24,
  ...(status === 'upcoming' && {
    backgroundColor: '#e3f2fd',
    color: '#663399',
  }),
  ...(status === 'ongoing' && {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
  }),
  ...(status === 'completed' && {
    backgroundColor: '#f3e5f5',
    color: '#7b1fa2',
  }),
  ...(status === 'cancelled' && {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
  }),
}));

const TeacherMeetings = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form state for creating/editing meetings
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meeting_type: 'NORMAL',
    start_time: '',
    duration: 60,
    zoom_link: '',
    max_participants: 20,
    enable_screen_share: true,
    enable_chat: true,
    enable_recording: false,
  });

  // Load meetings on component mount and auto-refresh for ongoing meetings
  useEffect(() => {
    fetchMeetings();
    
    // Auto-refresh every 30 seconds for ongoing meetings
    const interval = setInterval(() => {
      const hasOngoingMeetings = meetings.some(meeting => getMeetingStatus(meeting) === 'ongoing');
      if (hasOngoingMeetings) {
        console.log('Auto-refreshing meetings due to ongoing meetings...');
        fetchMeetings();
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      console.log('Fetching meetings...');
      const response = await meetingAPI.getMyMeetings();
      console.log('API Response:', response);
      
      // Handle different response formats
      let meetingsData = [];
      if (response?.meetings) {
        // If response has 'meetings' key
        meetingsData = response.meetings;
      } else if (response?.results) {
        // If response has 'results' key
        meetingsData = response.results;
      } else if (Array.isArray(response)) {
        // If response is directly an array
        meetingsData = response;
      } else {
        // Fallback to empty array
        meetingsData = [];
      }
      
      console.log('Processed meetings data:', meetingsData);
      const processedMeetings = Array.isArray(meetingsData) ? meetingsData : [];
      setMeetings(processedMeetings);
      
      // Update selectedMeeting if it exists in the new data
      if (selectedMeeting) {
        const updatedMeeting = processedMeetings.find(m => m.id === selectedMeeting.id);
        if (updatedMeeting) {
          console.log('Updating selectedMeeting with fresh data:', updatedMeeting);
          setSelectedMeeting(updatedMeeting);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError(t('meetingsLoadMeetingsError'));
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.title?.trim()) {
      errors.push(t('meetingsMeetingTitleRequired'));
    }
    
    if (!formData.start_time) {
      errors.push(t('meetingsStartDateTimeRequired'));
    } else {
      const startTime = new Date(formData.start_time);
      const now = new Date();
      if (startTime <= now) {
        errors.push(t('meetingsStartDateTimeMustBeFuture'));
      }
    }
    
    if (!formData.duration || formData.duration < 15) {
      errors.push(t('meetingsDurationMinimum15Minutes'));
    }
    
    if (formData.duration > 480) {
      errors.push(t('meetingsDurationMaximum8Hours'));
    }
    
    if (formData.meeting_type === 'ZOOM' && !formData.zoom_link?.trim()) {
      errors.push(t('meetingsZoomLinkRequired'));
    }
    
    if (formData.max_participants < 1 || formData.max_participants > 200) {
      errors.push(t('meetingsParticipantsCountRange'));
    }
    
    return errors;
  };

  const handleCreateMeeting = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setSnackbar({
        open: true,
        message: errors.join('\n'),
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      await meetingAPI.createMeeting(formData);
      setSnackbar({
        open: true,
        message: t('meetingsMeetingCreatedSuccessfully'),
        severity: 'success'
      });
      setOpenCreateDialog(false);
      resetForm();
      fetchMeetings();
    } catch (err) {
      console.error('Error creating meeting:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t('teacherMeetingsCreateMeetingError'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMeeting = async (meetingId) => {
    const errors = validateForm();
    if (errors.length > 0) {
      setSnackbar({
        open: true,
        message: errors.join('\n'),
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      const updatedMeeting = await meetingAPI.updateMeeting(meetingId, formData);
      setSnackbar({
        open: true,
        message: t('teacherMeetingsUpdateMeetingSuccess'),
        severity: 'success'
      });
      setOpenCreateDialog(false);
      resetForm();
      
      // Update the selected meeting with new data
      if (selectedMeeting && selectedMeeting.id === meetingId) {
        console.log('Updating selectedMeeting after edit:', updatedMeeting);
        setSelectedMeeting(prev => ({
          ...prev,
          ...updatedMeeting,
          updated_at: new Date().toISOString() // Force refresh of details dialog
        }));
      }
      
      fetchMeetings();
    } catch (err) {
      console.error('Error updating meeting:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t('teacherMeetingsUpdateMeetingError'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (window.confirm(t('teacherMeetingsDeleteConfirm'))) {
      try {
        setLoading(true);
        await meetingAPI.deleteMeeting(meetingId);
        setSnackbar({
          open: true,
          message: t('teacherMeetingsDeleteSuccess'),
          severity: 'success'
        });
        fetchMeetings();
      } catch (err) {
        console.error('Error deleting meeting:', err);
        setSnackbar({
          open: true,
          message: err.response?.data?.message || t('teacherMeetingsDeleteError'),
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStartLiveMeeting = async (meetingId) => {
    try {
      setLoading(true);
      const response = await meetingAPI.startLiveMeeting(meetingId);
      setSnackbar({
        open: true,
        message: t('teacherMeetingsStartLiveSuccess'),
        severity: 'success'
      });
      
      // Refresh meetings to get updated status
      fetchMeetings();
      
      // Open live meeting in new window/tab
      window.open(`/teacher/meetings/live/${meetingId}`, '_blank');
      
      // Alternative: Navigate to live meeting page
      // window.location.href = `/teacher/meetings/live/${meetingId}`;
      
    } catch (err) {
      console.error('Error starting live meeting:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t('teacherMeetingsStartLiveError'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    // Set default start time to current time + 1 hour
    const defaultStartTime = new Date();
    defaultStartTime.setHours(defaultStartTime.getHours() + 1);
    defaultStartTime.setMinutes(0);
    defaultStartTime.setSeconds(0);
    
    const formatDateTimeForInput = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setFormData({
      title: '',
      description: '',
      meeting_type: 'NORMAL',
      start_time: formatDateTimeForInput(defaultStartTime),
      duration: 60,
      zoom_link: '',
      max_participants: 20,
      enable_screen_share: true,
      enable_chat: true,
      enable_recording: false,
    });
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const openEditDialog = (meeting) => {
    console.log('openEditDialog called with meeting:', meeting);
    
    // Format start_time for datetime-local input (YYYY-MM-DDTHH:MM)
    const formatDateTimeForInput = (dateString) => {
      if (!dateString) return '';
      
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          console.error('Invalid date:', dateString);
          return '';
        }
        
        // Convert to local timezone and format as YYYY-MM-DDTHH:MM
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        const formatted = `${year}-${month}-${day}T${hours}:${minutes}`;
        console.log('Formatted date:', formatted, 'from original:', dateString);
        return formatted;
      } catch (error) {
        console.error('Error formatting date:', error, 'dateString:', dateString);
        return '';
      }
    };

    const formattedStartTime = formatDateTimeForInput(meeting.start_time);
    console.log('Formatted start_time:', formattedStartTime);
    console.log('Meeting duration:', meeting.duration);

    setFormData({
      title: meeting.title || '',
      description: meeting.description || '',
      meeting_type: meeting.meeting_type || 'NORMAL',
      start_time: formattedStartTime,
      duration: meeting.duration || 60,
      zoom_link: meeting.zoom_link || '',
      max_participants: meeting.max_participants || 10,
      enable_screen_share: meeting.enable_screen_share || false,
      enable_chat: meeting.enable_chat || false,
      enable_recording: meeting.enable_recording || false,
    });
    setSelectedMeeting(meeting);
    setOpenCreateDialog(true);
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenCreateDialog = () => {
    resetForm();
    setSelectedMeeting(null);
    setOpenCreateDialog(true);
  };

  const handleMeetingDetails = (meeting) => {
    setSelectedMeeting(meeting);
    setOpenDetailsDialog(true);
  };

  const handleStartLiveMeetingClick = (meetingId) => {
    handleStartLiveMeeting(meetingId);
  };

  const handleJoinMeeting = (meeting) => {
    if (meeting.zoom_link) {
      window.open(meeting.zoom_link, '_blank');
    }
  };

  const getMeetingStatus = (meeting) => {
    const now = new Date();
    const startTime = new Date(meeting.start_time);
    
    // Handle duration - it could be a string like "01:30:00" or a number in minutes
    let durationMinutes = 60; // default
    if (typeof meeting.duration === 'string') {
      // Parse duration string like "01:30:00"
      const parts = meeting.duration.split(':');
      if (parts.length === 3) {
        durationMinutes = parseInt(parts[0]) * 60 + parseInt(parts[1]);
      }
    } else if (typeof meeting.duration === 'number') {
      durationMinutes = meeting.duration;
    }
    
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
    
    if (meeting.status === 'cancelled') return 'cancelled';
    if (now >= startTime && now <= endTime) return 'ongoing';
    if (now > endTime) return 'completed';
    return 'upcoming';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming': return t('meetingsUpcomingStatus');
      case 'ongoing': return t('meetingsOngoingStatus');
      case 'completed': return t('meetingsCompletedStatus');
      case 'cancelled': return t('meetingsCancelledStatus');
      default: return t('meetingsUndefinedStatus');
    }
  };

  const getMeetingTypeText = (type) => {
    switch (type) {
      case 'ZOOM': return t('meetingsZoomType');
      case 'LIVE': return t('meetingsLiveType');
      case 'NORMAL': return t('meetingsNormalType');
      default: return t('meetingsUndefinedType');
    }
  };

  // Date formatting functions
  const formatDate = (dateString) => {
    if (!dateString) return t('commonUndefined');
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date in formatDate:', dateString);
        return t('commonInvalidDate');
      }
      
      console.log('Formatting date:', dateString, 'to:', date);
      
      return date.toLocaleDateString('en-GB', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        calendar: 'gregory'
      });
    } catch (error) {
      console.error('Error formatting date:', error, 'dateString:', dateString);
      return t('commonInvalidDate');
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return t('commonUndefined');
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date in formatTime:', dateString);
        return t('commonInvalidTime');
      }
      
      console.log('Formatting time:', dateString, 'to:', date);
      
      return date.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting time:', error, 'dateString:', dateString);
      return t('commonInvalidTime');
    }
  };

  // Debug logging
  console.log('Current meetings state:', meetings);
  console.log('Meetings type:', typeof meetings);
  console.log('Is meetings array:', Array.isArray(meetings));
  
  // Filter meetings based on tab
  const filteredMeetings = Array.isArray(meetings) ? meetings.filter(meeting => {
    if (tabValue === 0) return true; // All meetings
    if (tabValue === 1) return getMeetingStatus(meeting) === 'upcoming';
    if (tabValue === 2) return getMeetingStatus(meeting) === 'ongoing';
    if (tabValue === 3) return getMeetingStatus(meeting) === 'completed';
    return true;
  }) : [];

  return (
    <Box className="meetings-container">
      {/* Header */}
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
            <VideoCallIcon sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
              {t('teacherMeetingsTitle')}
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
            {t('teacherMeetingsDescription')}
          </Typography>
        </Box>
      </Box>

      {/* Create Meeting Button - Fixed */}
      <Box sx={{ position: 'fixed', top: 100, left: 32, zIndex: 1200 }}>
        <IconButton
          onClick={handleOpenCreateDialog}
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

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
            },
            '& .Mui-selected': {
              color: '#ff6b6b',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#ff6b6b',
            },
          }}
        >
          <Tab label={`${t('teacherMeetingsAllMeetings')} (${filteredMeetings.length})`} />
          <Tab label={`${t('teacherMeetingsUpcoming')} (${meetings.filter(m => getMeetingStatus(m) === 'upcoming').length})`} />
          <Tab label={`${t('teacherMeetingsOngoing')} (${meetings.filter(m => getMeetingStatus(m) === 'ongoing').length})`} />
          <Tab label={`${t('teacherMeetingsCompleted')} (${meetings.filter(m => getMeetingStatus(m) === 'completed').length})`} />
        </Tabs>
      </Box>

      {/* Loading State */}
      {loading && (!Array.isArray(meetings) || meetings.length === 0) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} />
          <Typography sx={{ ml: 2 }}>{t('teacherMeetingsLoadingMeetings')}</Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <Alert severity="error" sx={{ maxWidth: 600 }}>
            {error}
            <Button 
              onClick={fetchMeetings} 
              sx={{ ml: 2 }}
              variant="outlined"
              size="small"
            >
              {t('teacherMeetingsRetry')}
            </Button>
          </Alert>
        </Box>
      )}

      {/* Empty State */}
      {!loading && (!Array.isArray(meetings) || meetings.length === 0) && !error && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          py: 8,
          textAlign: 'center'
        }}>
          <VideoCallIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            {t('teacherMeetingsNoMeetings')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t('teacherMeetingsNoMeetingsDescription')}
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpenCreateDialog}
            startIcon={<AddIcon />}
            sx={{
              background: 'linear-gradient(90deg, #333679 0%, #4DBFB3 100%)',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1.5
            }}
          >
            {t('teacherMeetingsCreateNew')}
          </Button>
        </Box>
      )}

      {/* Meetings Grid */}
      <Grid container spacing={1.25}>
        {filteredMeetings.map((meeting) => {
          const status = getMeetingStatus(meeting);
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={meeting.id}>
              <StyledCard status={status}>
                <CardContent sx={{ p: 3 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ 
                      color: 'primary.main',
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {meeting.title}
                    </Typography>
                    <StatusChip 
                      label={getStatusText(status)} 
                      status={status}
                      size="small"
                    />
                  </Box>

                  {/* Description */}
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    mb: 3,
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {meeting.description}
                  </Typography>

                  {/* Meeting Info */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(meeting.start_time)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatTime(meeting.start_time)} - {meeting.duration} دقيقة
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        المشاركين: {meeting.participants_count || 0} / {meeting.max_participants}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <VideoCallIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        نوع الاجتماع: {getMeetingTypeText(meeting.meeting_type)}
                      </Typography>
                    </Box>

                    {meeting.zoom_link && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LinkIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" color="primary" sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
                          رابط زووم متاح
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        تم الإنشاء: {formatDate(meeting.created_at)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Status and Actions */}
                  <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <StatusChip label={getStatusText(status)} status={status} />
                      {meeting.enable_chat && (
                        <Chip 
                          label={t('teacherMeetingsChatAvailable')} 
                          size="small" 
                          sx={{ 
                            backgroundColor: '#e8f5e8', 
                            color: '#2e7d32',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            borderRadius: 1.5,
                            '& .MuiChip-label': {
                              px: 1,
                            }
                          }} 
                        />
                      )}
                      {meeting.enable_screen_share && (
                        <Chip 
                          label={t('teacherMeetingsScreenShare')} 
                          size="small" 
                          sx={{ 
                            backgroundColor: '#fff3e0', 
                            color: '#f57c00',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            borderRadius: 1.5,
                            '& .MuiChip-label': {
                              px: 1,
                            }
                          }} 
                        />
                      )}
                      {meeting.enable_recording && (
                        <Chip 
                          label={t('teacherMeetingsRecordingAvailable')} 
                          size="small" 
                          sx={{ 
                            backgroundColor: '#f3e5f5', 
                            color: '#7b1fa2',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            borderRadius: 1.5,
                            '& .MuiChip-label': {
                              px: 1,
                            }
                          }} 
                        />
                      )}
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleMeetingDetails(meeting)}
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          minWidth: 'fit-content'
                        }}
                      >
                        {t('teacherMeetingsDetails')}
                      </Button>

                      {status === 'upcoming' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openEditDialog(meeting)}
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            minWidth: 'fit-content',
                            '&:hover': {
                              backgroundColor: 'rgba(33, 150, 243, 0.08)',
                            },
                          }}
                        >
                          {t('teacherMeetingsEdit')}
                        </Button>
                      )}

                      {status === 'ongoing' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleStartLiveMeetingClick(meeting.id)}
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            minWidth: 'fit-content',
                            '&:hover': {
                              backgroundColor: '#2e7d32',
                            },
                          }}
                        >
                          {t('teacherMeetingsStartLive')}
                        </Button>
                      )}

                      {status === 'upcoming' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteMeeting(meeting.id)}
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            minWidth: 'fit-content',
                            '&:hover': {
                              backgroundColor: 'rgba(244, 67, 54, 0.08)',
                            },
                          }}
                        >
                          {t('teacherMeetingsDelete')}
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          );
        })}
      </Grid>

      {/* Create Meeting Dialog */}
      <Dialog 
        open={openCreateDialog} 
        onClose={() => {
          setOpenCreateDialog(false);
          // Force refresh of meeting details if we were editing
          if (selectedMeeting) {
            setSelectedMeeting(prev => ({
              ...prev,
              updated_at: new Date().toISOString()
            }));
          }
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(90deg, #333679 0%, #4DBFB3 100%)', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <VideoCallIcon />
          {selectedMeeting ? t('teacherMeetingsEditMeeting') : t('teacherMeetingsCreateMeeting')}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            <TextField
              fullWidth
              label={`${t('teacherMeetingsMeetingTitle')} *`}
              value={formData.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              required
              sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
            />
            <TextField
              fullWidth
              label={t('teacherMeetingsMeetingDescription')}
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
            />
            <FormControl fullWidth>
              <InputLabel>نوع الاجتماع *</InputLabel>
              <Select
                value={formData.meeting_type}
                onChange={(e) => handleFormChange('meeting_type', e.target.value)}
                required
              >
                <MenuItem value="ZOOM">{t('teacherMeetingsZoomMeeting')}</MenuItem>
                <MenuItem value="LIVE">{t('teacherMeetingsLiveMeeting')}</MenuItem>
                <MenuItem value="NORMAL">{t('teacherMeetingsNormalMeeting')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label={t('teacherMeetingsMaxParticipants')}
              type="number"
              value={formData.max_participants}
              onChange={(e) => handleFormChange('max_participants', parseInt(e.target.value))}
              inputProps={{ min: 1, max: 200 }}
              helperText={t('teacherMeetingsMinMaxParticipants')}
            />
            <TextField
              fullWidth
              label={`${t('teacherMeetingsStartDateTime')} *`}
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => handleFormChange('start_time', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              helperText={t('teacherMeetingsChooseStartTime')}
            />
            <TextField
              fullWidth
              label={`${t('teacherMeetingsDuration')} *`}
              type="number"
              value={formData.duration}
              onChange={(e) => handleFormChange('duration', parseInt(e.target.value))}
              inputProps={{ min: 15, max: 480 }}
              helperText={t('teacherMeetingsMinMaxDuration')}
              required
            />
            <TextField
              fullWidth
              label={t('teacherMeetingsZoomLink')}
              value={formData.zoom_link}
              onChange={(e) => handleFormChange('zoom_link', e.target.value)}
              helperText={t('teacherMeetingsZoomLinkRequired')}
              sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setOpenCreateDialog(false)} 
            disabled={loading}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {t('teacherMeetingsCancel')}
          </Button>
          <Button 
            onClick={selectedMeeting ? () => handleUpdateMeeting(selectedMeeting.id) : handleCreateMeeting}
            disabled={loading}
            variant="contained"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(90deg, #333679 0%, #4DBFB3 100%)',
              '&:hover': {
                background: 'linear-gradient(90deg, #0a3d5f 0%, #d17a6e 100%)',
              }
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} color="inherit" />
                {t('teacherMeetingsSaving')}
              </Box>
            ) : (
selectedMeeting ? t('teacherMeetingsUpdateMeeting') : t('teacherMeetingsCreateMeetingAction')
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Meeting Details Dialog */}
      <TeacherMeetingDetailsDialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        meeting={selectedMeeting}
        onEdit={(meeting) => {
          console.log('Edit button clicked for meeting:', meeting);
          openEditDialog(meeting);
          setOpenDetailsDialog(false);
        }}
        onRefresh={() => {
          // Force refresh of meeting details
          if (selectedMeeting) {
            setSelectedMeeting(prev => ({
              ...prev,
              updated_at: new Date().toISOString()
            }));
          }
        }}
        onStartLive={(meetingId) => {
          handleStartLiveMeeting(meetingId);
          setOpenDetailsDialog(false);
        }}
        onJoinMeeting={(meeting) => {
          if (meeting.zoom_link) {
            window.open(meeting.zoom_link, '_blank');
          }
        }}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
          <LinearProgress />
        </Box>
      )}
    </Box>
  );
};

export default TeacherMeetings;
