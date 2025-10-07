import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Tabs, Tab, Paper, Alert, LinearProgress, 
  Snackbar, CircularProgress, List, ListItem, ListItemAvatar, ListItemText,
  Divider, Badge, Tooltip, Switch, FormControlLabel
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  VideoCall as VideoCallIcon, Group as GroupIcon, Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon, Stop as StopIcon, Chat as ChatIcon,
  Notifications as NotificationsIcon, Link as LinkIcon, FileCopy as FileCopyIcon,
  CalendarToday as CalendarTodayIcon, AccessTime as AccessTimeIcon,
  People as PeopleIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon,
  Refresh as RefreshIcon, Add as AddIcon, Remove as RemoveIcon,
  PersonAdd as PersonAddIcon, PersonRemove as PersonRemoveIcon,
  School as SchoolIcon, Person as PersonIcon, Edit as EditIcon,
  Download as DownloadIcon, Upload as UploadIcon, History as HistoryIcon,
  TrendingUp as TrendingUpIcon, Assessment as AssessmentIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import '../../meetings/MeetingsCommon.css';
import MeetingDetailsDialog from '../../meetings/MeetingDetailsDialog';
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

const StudentMeetings = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [registrationStatuses, setRegistrationStatuses] = useState({});
  const [attendanceStatuses, setAttendanceStatuses] = useState({});

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
  }, [tabValue]); // Remove meetings from dependency array to prevent infinite loop

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      console.log('Fetching meetings for tab:', tabValue);
      
      let response;
      switch (tabValue) {
        case 0: // Available meetings
          response = await meetingAPI.getAvailableMeetings();
          break;
        case 1: // Registered meetings
          response = await meetingAPI.getAttendingMeetings();
          break;
        case 2: // Joinable meetings (ongoing)
          try {
            response = await meetingAPI.getJoinableMeetings();
          } catch (error) {
            console.log('Could not fetch joinable meetings, trying available meetings instead:', error);
            // Fallback to available meetings and filter for ongoing ones
            const availableResponse = await meetingAPI.getAvailableMeetings();
            if (availableResponse?.meetings) {
              const ongoingMeetings = availableResponse.meetings.filter(meeting => 
                getMeetingStatus(meeting) === 'ongoing'
              );
              response = { meetings: ongoingMeetings };
            } else {
              response = { meetings: [] };
            }
          }
          break;
        case 3: // Meeting history
          response = await meetingAPI.getMeetingHistory();
          break;
        default:
          response = await meetingAPI.getAvailableMeetings();
      }
      
      console.log('API Response:', response);
      
      // Handle different response formats
      let meetingsData = [];
      if (response?.meetings) {
        meetingsData = response.meetings;
      } else if (response?.results) {
        meetingsData = response.results;
      } else if (Array.isArray(response)) {
        meetingsData = response;
      } else {
        meetingsData = [];
      }
      
      console.log('Processed meetings data:', meetingsData);
      setMeetings(Array.isArray(meetingsData) ? meetingsData : []);
      
      // Debug: Log meeting statuses (only in development)
      if (process.env.NODE_ENV === 'development' && Array.isArray(meetingsData)) {
        meetingsData.forEach(meeting => {
          if (meeting && meeting.id) {
            const status = getMeetingStatus(meeting);
            console.log(`Meeting ${meeting.id}: "${meeting.title}" - Status: ${status}, Start: ${meeting.start_time}, Duration: ${meeting.duration}`);
          }
        });
      }
      
      // Fetch registration and attendance statuses for each meeting
      await fetchStatuses(meetingsData);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('حدث خطأ في تحميل الاجتماعات');
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatuses = async (meetingsData) => {
    const newRegistrationStatuses = {};
    const newAttendanceStatuses = {};
    
    for (const meeting of meetingsData) {
      if (!meeting || !meeting.id) continue;
      
      try {
        // Use user_is_registered from meeting data if available
        newRegistrationStatuses[meeting.id] = meeting.user_is_registered || false;
        newAttendanceStatuses[meeting.id] = 'not_registered';
        
        // Only try to fetch additional status info if we don't have it from the meeting data
        if (meeting.user_is_registered === undefined) {
          try {
            const regResponse = await meetingAPI.checkRegistrationStatus(meeting.id);
            newRegistrationStatuses[meeting.id] = regResponse.is_registered || false;
          } catch (error) {
            console.log(`Could not fetch registration status for meeting ${meeting.id}:`, error);
            newRegistrationStatuses[meeting.id] = false;
          }
        }
        
        // Only try to fetch attendance status if user is registered
        if (newRegistrationStatuses[meeting.id]) {
          try {
            const attResponse = await meetingAPI.getMyAttendanceStatus(meeting.id);
            newAttendanceStatuses[meeting.id] = attResponse.attendance_status || 'not_registered';
          } catch (error) {
            console.log(`Could not fetch attendance status for meeting ${meeting.id}:`, error);
            newAttendanceStatuses[meeting.id] = 'not_registered';
          }
        }
      } catch (error) {
        console.error(`Error processing meeting ${meeting.id}:`, error);
        newRegistrationStatuses[meeting.id] = meeting.user_is_registered || false;
        newAttendanceStatuses[meeting.id] = 'not_registered';
      }
    }
    
    setRegistrationStatuses(newRegistrationStatuses);
    setAttendanceStatuses(newAttendanceStatuses);
  };

  const handleRegisterForMeeting = async (meetingId) => {
    try {
      setLoading(true);
      await meetingAPI.registerForMeeting(meetingId);
      setSnackbar({
        open: true,
        message: t('studentMeetingsRegisterSuccess'),
        severity: 'success'
      });
      
      // Update registration status
      setRegistrationStatuses(prev => ({
        ...prev,
        [meetingId]: true
      }));
      
      // Refresh meetings
      fetchMeetings();
    } catch (err) {
      console.error('Error registering for meeting:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t('studentMeetingsRegisterError'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnregisterFromMeeting = async (meetingId) => {
    try {
      setLoading(true);
      await meetingAPI.unregisterFromMeeting(meetingId);
      setSnackbar({
        open: true,
        message: t('studentMeetingsUnregisterSuccess'),
        severity: 'success'
      });
      
      // Update registration status
      setRegistrationStatuses(prev => ({
        ...prev,
        [meetingId]: false
      }));
      
      // Refresh meetings
      fetchMeetings();
    } catch (err) {
      console.error('Error unregistering from meeting:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t('studentMeetingsUnregisterError'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = async (meeting) => {
    try {
      setLoading(true);
      
      // Try to join the meeting via API
      try {
        await meetingAPI.joinMeeting(meeting.id);
        setSnackbar({
          open: true,
          message: t('studentMeetingsJoinSuccess'),
          severity: 'success'
        });
      } catch (apiError) {
        console.log('API join failed, proceeding with direct join:', apiError);
        // Continue with direct join even if API fails
      }
      
      // Open zoom link if available, otherwise open live meeting page
      if (meeting.zoom_link) {
        window.open(meeting.zoom_link, '_blank');
      } else if (meeting.meeting_type === 'LIVE') {
        window.open(`/student/meetings/live/${meeting.id}`, '_blank');
      } else {
        // For other meeting types, try to open the meeting directly
        setSnackbar({
          open: true,
          message: t('studentMeetingsOpeningMeeting'),
          severity: 'info'
        });
        
        // Try to open meeting details or redirect
        setTimeout(() => {
          window.open(`/student/meetings/details/${meeting.id}`, '_blank');
        }, 1000);
      }
      
      // Refresh meetings
      fetchMeetings();
    } catch (err) {
      console.error('Error joining meeting:', err);
      setSnackbar({
        open: true,
        message: t('studentMeetingsJoinError'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (meetingId) => {
    try {
      setLoading(true);
      await meetingAPI.markAttendance(meetingId);
      setSnackbar({
        open: true,
        message: t('studentMeetingsMarkAttendanceSuccess'),
        severity: 'success'
      });
      
      // Update attendance status
      setAttendanceStatuses(prev => ({
        ...prev,
        [meetingId]: 'present'
      }));
      
      // Refresh meetings
      fetchMeetings();
    } catch (err) {
      console.error('Error marking attendance:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t('studentMeetingsMarkAttendanceError'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      setLoading(true);
      await meetingAPI.acceptInvitation(invitationId);
      setSnackbar({
        open: true,
        message: t('studentMeetingsAcceptInvitationSuccess'),
        severity: 'success'
      });
      fetchMeetings();
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t('studentMeetingsAcceptInvitationError'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    try {
      setLoading(true);
      await meetingAPI.declineInvitation(invitationId);
      setSnackbar({
        open: true,
        message: t('studentMeetingsDeclineInvitationSuccess'),
        severity: 'success'
      });
      fetchMeetings();
    } catch (err) {
      console.error('Error declining invitation:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t('studentMeetingsDeclineInvitationError'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleMeetingDetails = (meeting) => {
    setSelectedMeeting(meeting);
    setOpenDetailsDialog(true);
  };

  const getMeetingStatus = (meeting) => {
    // Use status from API if available, otherwise calculate locally
    if (meeting.status && ['upcoming', 'ongoing', 'completed', 'cancelled'].includes(meeting.status)) {
      return meeting.status;
    }
    
    if (!meeting.start_time) return 'upcoming';
    
    const now = new Date();
    const startTime = new Date(meeting.start_time);
    
    // Handle duration - it could be a string like "01:30:00" or a number in minutes
    let durationMinutes = 60; // default
    if (typeof meeting.duration === 'string') {
      // Parse duration string like "01:30:00"
      const parts = meeting.duration.split(':');
      if (parts.length === 3) {
        durationMinutes = parseInt(parts[0]) * 60 + parseInt(parts[1]);
      } else if (parts.length === 2) {
        // Handle format like "30:00" (minutes:seconds)
        durationMinutes = parseInt(parts[0]);
      }
    } else if (typeof meeting.duration === 'number') {
      durationMinutes = meeting.duration;
    } else if (meeting.duration && typeof meeting.duration === 'object') {
      // Handle DurationField object
      durationMinutes = meeting.duration.total_seconds ? 
        Math.floor(meeting.duration.total_seconds / 60) : 60;
    }
    
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
    
    if (meeting.status === 'cancelled') return 'cancelled';
    if (now >= startTime && now <= endTime) return 'ongoing';
    if (now > endTime) return 'completed';
    return 'upcoming';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming': return t('studentMeetingsUpcoming');
      case 'ongoing': return t('studentMeetingsOngoing');
      case 'completed': return t('studentMeetingsCompleted');
      case 'cancelled': return t('studentMeetingsCancelled');
      default: return t('studentMeetingsUndefined');
    }
  };

  const getMeetingTypeText = (type) => {
    switch (type) {
      case 'ZOOM': return t('studentMeetingsZoomMeeting');
      case 'LIVE': return t('studentMeetingsLiveMeeting');
      case 'NORMAL': return t('studentMeetingsNormalMeeting');
      default: return t('studentMeetingsUndefined');
    }
  };

  const getAttendanceStatusText = (status) => {
    switch (status) {
      case 'present': return t('studentMeetingsPresent');
      case 'absent': return t('studentMeetingsAbsent');
      case 'late': return t('studentMeetingsLate');
      case 'registered': return t('studentMeetingsRegisteredStatus');
      case 'not_registered': return t('studentMeetingsNotRegistered');
      default: return t('studentMeetingsUndefined');
    }
  };

  const getAttendanceStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      case 'registered': return 'primary';
      case 'not_registered': return 'default';
      default: return 'default';
    }
  };

  // Date formatting functions
  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'تاريخ غير صحيح';
      
      return date.toLocaleDateString('en-GB', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        calendar: 'gregory'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'تاريخ غير صحيح';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'غير محدد';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'وقت غير صحيح';
      
      return date.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'وقت غير صحيح';
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return 'غير محدد';
    
    if (typeof duration === 'string') {
      // Parse duration string like "01:30:00"
      const parts = duration.split(':');
      if (parts.length === 3) {
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        if (hours > 0) {
          return `${hours} ساعة ${minutes} دقيقة`;
        } else {
          return `${minutes} دقيقة`;
        }
      }
      return duration;
    } else if (typeof duration === 'number') {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      if (hours > 0) {
        return `${hours} ساعة ${minutes} دقيقة`;
      } else {
        return `${minutes} دقيقة`;
      }
    }
    
    return 'غير محدد';
  };

  // Filter meetings based on tab
  const filteredMeetings = Array.isArray(meetings) ? meetings.filter(meeting => {
    if (!meeting || !meeting.id) return false;
    
    const status = getMeetingStatus(meeting);
    
    if (tabValue === 0) return true; // Available meetings
    if (tabValue === 1) return registrationStatuses[meeting.id] || false; // Registered meetings
    if (tabValue === 2) return status === 'ongoing'; // Joinable meetings
    if (tabValue === 3) return status === 'completed'; // History
    return true;
  }) : [];

  return (
    <Box className="meetings-container">
      {/* Header */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        background: 'linear-gradient(135deg, #333679 0%, #4DBFB3 100%)',
        borderRadius: 3,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <VideoCallIcon sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
              {t('studentMeetingsTitle')}
            </Typography>
            <IconButton 
              onClick={fetchMeetings}
              disabled={loading}
              sx={{ 
                color: 'white', 
                ml: 'auto',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        
        </Box>
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
              color: '#4DBFB3',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#4DBFB3',
            },
          }}
        >
          <Tab label={`${t('studentMeetingsAvailableMeetings')} (${meetings.filter(m => m && m.id && !registrationStatuses[m.id]).length || 0})`} />
          <Tab label={`${t('studentMeetingsMyRegisteredMeetings')} (${meetings.filter(m => m && m.id && registrationStatuses[m.id]).length || 0})`} />
          <Tab label={`${t('studentMeetingsJoinableMeetings')} (${meetings.filter(m => m && m.id && getMeetingStatus(m) === 'ongoing').length || 0})`} />
          <Tab label={`${t('studentMeetingsMeetingHistory')} (${meetings.filter(m => m && m.id && getMeetingStatus(m) === 'completed').length || 0})`} />
        </Tabs>
        
      </Box>

      {/* Loading State */}
      {loading && (!Array.isArray(meetings) || meetings.length === 0) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} />
          <Typography sx={{ ml: 2 }}>{t('studentMeetingsLoadingMeetings')}</Typography>
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
{t('studentMeetingsRetry')}
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
            {t('studentMeetingsNoMeetingsAvailable')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t('studentMeetingsNoMeetingsDescription')}
          </Typography>
        </Box>
      )}

      {/* Meetings Grid */}
      <Grid container spacing={1.25}>
        {filteredMeetings.map((meeting) => {
          if (!meeting || !meeting.id) return null;
          
          const status = getMeetingStatus(meeting);
          const isRegistered = registrationStatuses[meeting.id] || false;
          const attendanceStatus = attendanceStatuses[meeting.id] || 'not_registered';
          
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
                      {meeting.title || 'اجتماع بدون عنوان'}
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
                    {meeting.description || 'لا يوجد وصف للاجتماع'}
                  </Typography>

                  {/* Meeting Info */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.start_time ? formatDate(meeting.start_time) : 'غير محدد'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.start_time ? formatTime(meeting.start_time) : 'غير محدد'} - {formatDuration(meeting.duration)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        المشاركين: {meeting.participants_count || 0} / {meeting.max_participants || 50}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <VideoCallIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        نوع الاجتماع: {getMeetingTypeText(meeting.meeting_type || 'NORMAL')}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        المعلم: {meeting.creator_name || meeting.creator?.name || 'غير محدد'}
                      </Typography>
                    </Box>

                    {meeting.zoom_link && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LinkIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                        <Typography 
                          variant="body2" 
                          color="primary" 
                          sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                          onClick={() => window.open(meeting.zoom_link, '_blank')}
                        >
                          رابط زووم متاح
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Status and Actions */}
                  <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <StatusChip 
                      label={getStatusText(status)} 
                      status={status}
                      size="small"
                    />
                      <Chip 
                        label={getAttendanceStatusText(attendanceStatus)}
                        color={getAttendanceStatusColor(attendanceStatus)}
                        size="small"
                        sx={{ fontSize: '0.7rem' }}
                      />
                      {isRegistered && meeting.id && (
                        <Chip 
                          label="مسجل"
                          color="success"
                          size="small"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleMeetingDetails(meeting)}
                        disabled={!meeting || !meeting.id}
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          minWidth: 'fit-content'
                        }}
                      >
                        {t('studentMeetingsDetails')}
                      </Button>

                      {!isRegistered && status === 'upcoming' && meeting.id && (
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => handleRegisterForMeeting(meeting.id)}
                          startIcon={<PersonAddIcon />}
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            minWidth: 'fit-content'
                          }}
                        >
                          {t('studentMeetingsJoinMeeting')}
                        </Button>
                      )}

                      {isRegistered && status === 'upcoming' && meeting.id && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleUnregisterFromMeeting(meeting.id)}
                          startIcon={<PersonRemoveIcon />}
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            minWidth: 'fit-content'
                          }}
                        >
                          {t('studentMeetingsCancelRegistration')}
                        </Button>
                      )}

                      {isRegistered && status === 'ongoing' && meeting.id && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => {
                              // Navigate directly to live meeting page
                              window.open(`/student/meetings/live/${meeting.id}`, '_blank');
                            }}
                            startIcon={<PlayArrowIcon />}
                            sx={{ 
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              minWidth: 'fit-content'
                            }}
                          >
                            {t('studentMeetingsJoinNow')}
                          </Button>
                          
                          {attendanceStatus !== 'present' && meeting.id && (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              onClick={() => handleMarkAttendance(meeting.id)}
                              startIcon={<CheckCircleIcon />}
                              sx={{ 
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                minWidth: 'fit-content'
                              }}
                            >
                              {t('studentMeetingsMarkAttendance')}
                            </Button>
                          )}
                        </>
                      )}
                      
                      {/* Show join button for ongoing meetings even if not registered */}
                      {!isRegistered && status === 'ongoing' && meeting.id && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => {
                            // Navigate directly to live meeting page
                            window.open(`/student/meetings/live/${meeting.id}`, '_blank');
                          }}
                          startIcon={<PlayArrowIcon />}
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            minWidth: 'fit-content'
                          }}
                        >
                          {t('studentMeetingsJoinNow')}
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

      {/* Meeting Details Dialog */}
      <MeetingDetailsDialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        meeting={selectedMeeting}
        userRole="student"
        onJoinMeeting={(meeting) => {
          if (meeting.zoom_link) {
            window.open(meeting.zoom_link, '_blank');
          }
        }}
        onRefresh={() => {
          fetchMeetings();
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

export default StudentMeetings; 