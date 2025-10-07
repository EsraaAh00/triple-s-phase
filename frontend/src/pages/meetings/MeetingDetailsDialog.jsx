import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  IconButton,
  TextField,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Tabs,
  Tab,
  Badge,

  Table,

  TableBody,

  TableCell,

  TableContainer,

  TableHead,

  TableRow,

  Paper,

  TablePagination,

  FormControl,

  Select,

  MenuItem,

  Tooltip,

  Alert,

  CircularProgress

} from '@mui/material';

import {

  CalendarToday as CalendarTodayIcon,

  AccessTime as AccessTimeIcon,

  Group as GroupIcon,

  VideoCall as VideoCallIcon,

  School as SchoolIcon,

  Person as PersonIcon,

  CheckCircle as CheckCircleIcon,

  Cancel as CancelIcon,

  Schedule as ScheduleIcon,

  FileCopy as FileCopyIcon,

  Download as DownloadIcon,

  VideoLibrary as VideoLibraryIcon,

  PlayArrow as PlayArrowIcon,

  Link as LinkIcon,

  Edit as EditIcon,

  Notifications as NotificationsIcon,

  Chat as ChatIcon,

  ScreenShare as ScreenShareIcon,

  Mic as MicIcon,

  MicOff as MicOffIcon,

  Visibility as VisibilityIcon,

  VisibilityOff as VisibilityOffIcon,

  TrendingUp as TrendingUpIcon,

  TrendingDown as TrendingDownIcon,

  Check as CheckIcon,

  Close as CloseIcon2,

  Schedule as ScheduleIcon2,

  Close as CloseIcon,

  Refresh as RefreshIcon,

  Create as CreateIcon

} from '@mui/icons-material';

import { meetingAPI } from '../../services/meeting.service';



const MeetingDetailsDialog = ({ 
  open, 
  onClose, 
  meeting, 
  userRole = 'student',

  onEdit,
  onStartLive,
  onJoinMeeting,
  onDownloadMaterial,
  onWatchRecording,
  onRefresh
}) => {
  const { t } = useTranslation();

  const [tabValue, setTabValue] = useState(0);

  const [copied, setCopied] = useState(false);

  const [loading, setLoading] = useState(false);

  const [meetingDetails, setMeetingDetails] = useState(null);

  const [error, setError] = useState(null);

  // Pagination state for participants table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);



  // Fetch detailed meeting information when dialog opens or when meeting data changes

  useEffect(() => {

    if (open && meeting?.id) {

      console.log('MeetingDetailsDialog useEffect triggered - fetching details for meeting:', meeting.id);

      fetchMeetingDetails();

    }

  }, [open, meeting?.id, meeting?.updated_at, meeting?.start_time, meeting?.duration]); // Add more dependencies



  // Reset meeting details when dialog closes

  useEffect(() => {

    if (!open) {

      setMeetingDetails(null);

      setError(null);

    }

  }, [open]);



  const fetchMeetingDetails = async () => {

    try {

      setLoading(true);

      setError(null);

      console.log('Fetching meeting details for ID:', meeting.id);

      const response = await meetingAPI.getMeetingDetails(meeting.id);

      console.log('Meeting details response:', response);

      setMeetingDetails(response);

      // Fetch participants separately
      try {
        console.log('Fetching participants for meeting:', meeting.id);
        const participantsResponse = await meetingAPI.getMeetingParticipants(meeting.id);
        console.log('Participants response:', participantsResponse);
        
        // Update meeting details with participants
        setMeetingDetails(prev => ({
          ...prev,
          participants: participantsResponse
        }));
      } catch (participantsError) {
        console.error('Error fetching participants:', participantsError);
        // Don't show error for participants, just log it
      }

    } catch (err) {

      console.error('Error fetching meeting details:', err);

      setError(t('meetingsLoadMeetingDetailsError'));

      // Fallback to the passed meeting data

      setMeetingDetails(meeting);

    } finally {

      setLoading(false);

    }

  };

  // Handle attendance status change
  const handleAttendanceChange = async (participantId, newStatus) => {
    try {
      // If clicking the same status, toggle it off (set to registered)
      const currentParticipant = meetingDetails?.participants?.find(p => p.id === participantId);
      const finalStatus = currentParticipant?.attendance_status === newStatus ? 'registered' : newStatus;
      
      await meetingAPI.updateParticipantAttendance(meeting.id, participantId, finalStatus);
      
      // Update local state
      setMeetingDetails(prev => ({
        ...prev,
        participants: prev.participants.map(p => 
          p.id === participantId ? { ...p, attendance_status: finalStatus } : p
        )
      }));
      
      console.log(`Attendance updated for participant ${participantId} to ${finalStatus}`);
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert(t('meetingsUpdateAttendanceError'));
    }
  };

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (!meeting) return null;



  // Use detailed data if available, otherwise use passed meeting data

  // Prioritize meetingDetails (from API) over meeting (passed props)

  const meetingData = meetingDetails || meeting;

  

  // Debug logging

  console.log('MeetingDetailsDialog - meeting prop:', meeting);

  console.log('MeetingDetailsDialog - meetingDetails state:', meetingDetails);

  console.log('MeetingDetailsDialog - final meetingData:', meetingData);



  const handleCopyLink = () => {

    if (meetingData.zoom_link) {

      navigator.clipboard.writeText(meetingData.zoom_link);

    setCopied(true);

    setTimeout(() => setCopied(false), 2000);

    }

  };



  // Enhanced date formatting function

  const formatDate = (dateString) => {

    if (!dateString) return t('commonNotSpecified');

    

    try {

      const date = new Date(dateString);

      if (isNaN(date.getTime())) {

        console.error('Invalid date in formatDate:', dateString);

        return t('meetingsInvalidDate');

      }

      

      console.log('Formatting date:', dateString, 'to:', date);

      

      return date.toLocaleDateString('en-GB', { 

        weekday: 'long', 

        year: 'numeric', 

        month: 'long', 

        day: 'numeric',

        calendar: 'gregory'

      });

    } catch (error) {

      console.error('Error formatting date:', error, 'dateString:', dateString);

      return t('meetingsInvalidDate');

    }

  };



  // Enhanced time formatting function

  const formatTime = (dateString) => {

    if (!dateString) return t('commonNotSpecified');

    

    try {

      const date = new Date(dateString);

      if (isNaN(date.getTime())) {

        console.error('Invalid date in formatTime:', dateString);

        return t('meetingsInvalidTime');

      }

      

      console.log('Formatting time:', dateString, 'to:', date);

      

      return date.toLocaleTimeString('en-GB', { 

        hour: '2-digit', 

        minute: '2-digit',

        hour12: true

      });

    } catch (error) {

      console.error('Error formatting time:', error, 'dateString:', dateString);

      return t('meetingsInvalidTime');

    }

  };



  // Enhanced duration formatting

  const formatDuration = (minutes) => {

    if (!minutes) return t('commonNotSpecified');

    

    const hours = Math.floor(minutes / 60);

    const remainingMinutes = minutes % 60;

    

    if (hours > 0) {

      return `${hours} ساعة ${remainingMinutes > 0 ? `و ${remainingMinutes} دقيقة` : ''}`;

    }

    return `${minutes} دقيقة`;

  };



  const getMeetingStatus = (meeting) => {

    if (!meeting.start_time) return 'unknown';

    

    const now = new Date();

    const startTime = new Date(meeting.start_time);

    const endTime = new Date(startTime.getTime() + (meeting.duration || 60) * 60000);

    

    if (now < startTime) return 'upcoming';

    if (now >= startTime && now <= endTime) return 'ongoing';

    return 'completed';

  };



  const getStatusText = (status) => {

    switch (status) {

      case 'upcoming': return 'قادم';

      case 'ongoing': return 'جاري الآن';

      case 'completed': return 'منتهي';

      case 'cancelled': return 'ملغي';

      default: return 'غير محدد';

    }

  };



  const getStatusColor = (status) => {

    switch (status) {

      case 'upcoming': return 'primary';

      case 'ongoing': return 'success';

      case 'completed': return 'default';

      case 'cancelled': return 'error';

      default: return 'default';

    }

  };



  const getMeetingTypeText = (type) => {

    switch (type) {

      case 'ZOOM': return 'اجتماع زووم';

      case 'LIVE': return 'اجتماع مباشر';

      case 'NORMAL': return 'اجتماع عادي';

      default: return 'غير محدد';

    }

  };



  const status = getMeetingStatus(meetingData);



  // Calculate attendance statistics

  const participants = meetingData.participants || [];

  const totalParticipants = participants.length;

  const attendingParticipants = participants.filter(p => p.attendance_status === 'attending').length;

  const registeredParticipants = participants.filter(p => p.attendance_status === 'registered').length;

  const attendanceRate = totalParticipants > 0 ? Math.round((attendingParticipants / totalParticipants) * 100) : 0;



  return (

    <Dialog

      open={open}

      onClose={onClose}

      maxWidth="xl"

      fullWidth

      PaperProps={{

        sx: {

          borderRadius: 4,

          maxHeight: '90vh',

          overflow: 'hidden',

          direction: 'rtl'

        }

      }}

    >

      {/* Header */}

      <DialogTitle

        sx={{

          background: 'linear-gradient(135deg, #667eea 0%, #333679 100%)',

          color: 'white',

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'space-between',

          py: 3,

          px: 4

        }}

      >

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

          <VideoCallIcon sx={{ fontSize: 28 }} />

          <Typography variant="h5" fontWeight={600}>

            تفاصيل الاجتماع

          </Typography>

        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

          <Chip

            label={getStatusText(status)}

            color={getStatusColor(status)}

            variant="filled"

            sx={{ 

              bgcolor: status === 'ongoing' ? '#4DBFB3' : 

                       status === 'upcoming' ? '#2196f3' : 

                       status === 'completed' ? '#9e9e9e' : '#f44336',

              color: 'white',

              fontWeight: 600

            }}

          />

          <IconButton 

            onClick={() => {

              fetchMeetingDetails();

              if (onRefresh) onRefresh();

            }}

            disabled={loading}

            sx={{ 

              color: 'white',

              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }

            }}

          >

            <RefreshIcon />

          </IconButton>

          <IconButton onClick={onClose} sx={{ color: 'white' }}>

            <CloseIcon />

          </IconButton>

        </Box>

      </DialogTitle>



      <DialogContent sx={{ 
        p: 0, 
        overflow: 'auto', 
        direction: 'rtl',
        '&::-webkit-scrollbar': {
          width: '14px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
          borderRadius: '8px',
          margin: '6px',
          border: '1px solid #dee2e6',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'linear-gradient(180deg, #667eea 0%, #333679 100%)',
          borderRadius: '8px',
          border: '2px solid #f8f9fa',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            background: 'linear-gradient(180deg, #5a6fd8 0%, #0a3d5f 100%)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          },
        },
        '&::-webkit-scrollbar-corner': {
          background: '#f8f9fa',
        },
        // Firefox scrollbar
        scrollbarWidth: 'thin',
        scrollbarColor: '#667eea #f8f9fa',
        // Smooth scrolling
        scrollBehavior: 'smooth',
      }}>

        {loading ? (

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>

            <CircularProgress />

            <Typography sx={{ mr: 2 }}>جاري تحميل تفاصيل الاجتماع...</Typography>

          </Box>

        ) : error ? (

          <Box sx={{ p: 4 }}>

            <Alert severity="error" action={

              <Button color="inherit" size="small" onClick={fetchMeetingDetails}>

                <RefreshIcon sx={{ ml: 1 }} />

                إعادة المحاولة

              </Button>

            }>

              {error}

            </Alert>

          </Box>

        ) : (

          <Box sx={{ p: 0 }}>

            {/* Main Content */}

            <Box sx={{ p: 4 }}>

            {/* Meeting Title and Description */}

              <Paper elevation={0} sx={{ p: 4, mb: 3, background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', borderRadius: 3, border: '1px solid #e9ecef' }}>

              <Typography variant="h4" fontWeight={700} gutterBottom color="primary" sx={{ mb: 2 }}>

                  {meetingData.title}

              </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>

                  {meetingData.description}

              </Typography>

              

              {/* Meeting Info Grid */}

              <Grid container spacing={3}>

                <Grid item xs={12} sm={6} md={3}>

                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #e0e0e0' }}>

                    <CalendarTodayIcon sx={{ color: '#667eea', ml: 2, fontSize: 24 }} />

                    <Box>

                      <Typography variant="body2" fontWeight={600} color="text.primary">

                          {formatDate(meetingData.start_time)}

                          {meetingData.updated_at && (

                            <Typography variant="caption" display="block" color="success.main">

                              محدث: {formatDate(meetingData.updated_at)}

                            </Typography>

                          )}

                      </Typography>

                      <Typography variant="caption" color="text.secondary">

                        تاريخ الاجتماع

                      </Typography>

                    </Box>

                  </Box>

                </Grid>

                <Grid item xs={12} sm={6} md={3}>

                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #e0e0e0' }}>

                    <AccessTimeIcon sx={{ color: '#667eea', ml: 2, fontSize: 24 }} />

                    <Box>

                      <Typography variant="body2" fontWeight={600} color="text.primary">

                          {formatTime(meetingData.start_time)} - {formatDuration(meetingData.duration)}

                          {meetingData.updated_at && (

                            <Typography variant="caption" display="block" color="success.main">

                              محدث: {formatTime(meetingData.updated_at)}

                            </Typography>

                          )}

                      </Typography>

                      <Typography variant="caption" color="text.secondary">

                        وقت البدء والمدة

                      </Typography>

                    </Box>

                  </Box>

                </Grid>

                {userRole === 'instructor' && (

                <>

                <Grid item xs={12} sm={6} md={3}>

                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #e0e0e0' }}>

                    <VideoCallIcon sx={{ color: '#667eea', ml: 2, fontSize: 24 }} />

                    <Box>

                      <Typography variant="body2" fontWeight={600} color="text.primary">

                          {getMeetingTypeText(meetingData.meeting_type)}

                      </Typography>

                      <Typography variant="caption" color="text.secondary">

                        نوع الاجتماع

                      </Typography>

                    </Box>

                  </Box>

                </Grid>

                <Grid item xs={12} sm={6} md={3}>

                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #e0e0e0' }}>

                    <GroupIcon sx={{ color: '#667eea', ml: 2, fontSize: 24 }} />

                    <Box>

                      <Typography variant="body2" fontWeight={600} color="text.primary">

                          {totalParticipants}/{meetingData.max_participants || 'غير محدد'} مشارك

                      </Typography>

                      <Typography variant="caption" color="text.secondary">

                        عدد المشاركين

                      </Typography>

                    </Box>

                  </Box>

                </Grid>

                </>

                )}

              </Grid>



                {/* Additional Info Grid - Only for instructors */}

                {userRole === 'instructor' && (

                <Grid container spacing={3} sx={{ mt: 2 }}>

                  <Grid item xs={12} sm={6} md={3}>

                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #e0e0e0' }}>

                      <CreateIcon sx={{ color: '#ff9800', ml: 2, fontSize: 24 }} />

                      <Box>

                        <Typography variant="body2" fontWeight={600} color="text.primary">

                          {formatDate(meetingData.created_at)}

                        </Typography>

                        <Typography variant="caption" color="text.secondary">

                          تاريخ الإنشاء

                        </Typography>

                      </Box>

                    </Box>

                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>

                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #e0e0e0' }}>

                      <PersonIcon sx={{ color: '#4DBFB3', ml: 2, fontSize: 24 }} />

                      <Box>

                        <Typography variant="body2" fontWeight={600} color="text.primary">

                          {meetingData.creator_name || 'غير محدد'}

                        </Typography>

                        <Typography variant="caption" color="text.secondary">

                          منشئ الاجتماع

                </Typography>

                      </Box>

                    </Box>

                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>

                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #e0e0e0' }}>

                      <ScheduleIcon sx={{ color: '#663399', ml: 2, fontSize: 24 }} />

                      <Box>

                        <Typography variant="body2" fontWeight={600} color="text.primary">

                          {meetingData.updated_at ? formatDate(meetingData.updated_at) : 'لم يتم التحديث'}

                        </Typography>

                        <Typography variant="caption" color="text.secondary">

                          آخر تحديث

                        </Typography>

                      </Box>

                    </Box>

                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>

                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #e0e0e0' }}>

                      <CheckCircleIcon sx={{ color: '#4DBFB3', ml: 2, fontSize: 24 }} />

                      <Box>

                        <Typography variant="body2" fontWeight={600} color="text.primary">

                          {meetingData.is_active ? 'نشط' : 'غير نشط'}

                        </Typography>

                        <Typography variant="caption" color="text.secondary">

                          حالة الاجتماع

                        </Typography>

                      </Box>

                    </Box>

                  </Grid>

                </Grid>

                )}

                

                {/* Meeting Features - Only for instructors */}

                {userRole === 'instructor' && (

                <Box sx={{ mt: 3 }}>

                  <Typography variant="h6" fontWeight={600} gutterBottom color="primary">

                    ميزات الاجتماع

                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>

                    <Chip

                      icon={meetingData.enable_chat ? <ChatIcon /> : <CancelIcon />}

                      label={meetingData.enable_chat ? 'الدردشة مفعلة' : 'الدردشة معطلة'}

                      color={meetingData.enable_chat ? 'success' : 'default'}

                      variant="outlined"

                    />

                    <Chip

                      icon={meetingData.enable_screen_share ? <ScreenShareIcon /> : <CancelIcon />}

                      label={meetingData.enable_screen_share ? 'مشاركة الشاشة مفعلة' : 'مشاركة الشاشة معطلة'}

                      color={meetingData.enable_screen_share ? 'success' : 'default'}

                      variant="outlined"

                    />

                    <Chip

                      icon={meetingData.enable_recording ? <VideoLibraryIcon /> : <CancelIcon />}

                      label={meetingData.enable_recording ? 'التسجيل مفعل' : 'التسجيل معطل'}

                      color={meetingData.enable_recording ? 'success' : 'default'}

                      variant="outlined"

                    />

                  </Box>

                </Box>

                )}

              </Paper>



              {/* Zoom Link Section */}

              {meetingData.zoom_link && (

                <Paper elevation={0} sx={{ p: 4, mb: 3, background: 'linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%)', borderRadius: 3, border: '1px solid #c8e6c9' }}>

                  <Typography variant="h6" fontWeight={600} gutterBottom color="success.main">

                    رابط الاجتماع

                </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>

                    <TextField

                      fullWidth

                      value={meetingData.zoom_link}

                      InputProps={{ readOnly: true }}

                      sx={{ flexGrow: 1 }}

                    />

                    <Button

                      variant="contained"

                      color="primary"

                      onClick={handleCopyLink}

                      startIcon={<FileCopyIcon />}

                    >

                      {copied ? 'تم النسخ!' : 'نسخ الرابط'}

                    </Button>

                    <Button

                      variant="contained"

                      color="success"

                      onClick={() => onJoinMeeting && onJoinMeeting(meetingData)}

                      startIcon={<PlayArrowIcon />}

                    >

                      انضم للاجتماع

                    </Button>

                  </Box>

              </Paper>

            )}



            {/* Attendance Statistics - Only for instructors */}

              {userRole === 'instructor' && (

              <Paper elevation={0} sx={{ p: 4, mb: 3, background: 'linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)', borderRadius: 3, border: '1px solid #ffcc02' }}>

                <Typography variant="h6" fontWeight={600} gutterBottom color="warning.main">

                  إحصائيات الحضور

              </Typography>

                <Grid container spacing={3}>

                  <Grid item xs={12} sm={6} md={3}>

                    <Box sx={{ textAlign: 'center', p: 2 }}>

                      <Typography variant="h4" fontWeight={700} color="primary">

                        {totalParticipants}

                      </Typography>

                      <Typography variant="body2" color="text.secondary">

                        إجمالي المسجلين

                      </Typography>

                    </Box>

                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>

                    <Box sx={{ textAlign: 'center', p: 2 }}>

                      <Typography variant="h4" fontWeight={700} color="success.main">

                        {attendingParticipants}

                      </Typography>

                      <Typography variant="body2" color="text.secondary">

                        الحضور

                      </Typography>

                    </Box>

                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>

                    <Box sx={{ textAlign: 'center', p: 2 }}>

                      <Typography variant="h4" fontWeight={700} color="warning.main">

                        {registeredParticipants}

                      </Typography>

                      <Typography variant="body2" color="text.secondary">

                        المسجلين

                      </Typography>

                    </Box>

                  </Grid>

                <Grid item xs={12} sm={6} md={3}>

                    <Box sx={{ textAlign: 'center', p: 2 }}>

                      <Typography variant="h4" fontWeight={700} color="info.main">

                        {attendanceRate}%

                    </Typography>

                      <Typography variant="body2" color="text.secondary">

                        نسبة الحضور

                    </Typography>

                  </Box>

                </Grid>

              </Grid>

                  <LinearProgress

                    variant="determinate"

                  value={attendanceRate} 

                  sx={{ mt: 2, height: 8, borderRadius: 4 }}

                />

            </Paper>

              )}



              {/* Participants Table */}

              <Paper elevation={0} sx={{ p: 4, background: 'linear-gradient(135deg, #f3e5f5 0%, #ffffff 100%)', borderRadius: 3, border: '1px solid #e1bee7' }}>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>

                  <Typography variant="h6" fontWeight={600} color="secondary.main">

                    قائمة المشاركين

                  </Typography>


                </Box>

                {userRole === 'instructor' ? (
                  // Instructor view - show participants table
                  participants.length > 0 ? (

                  <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>

                    <Table>

                      <TableHead>

                        <TableRow sx={{ bgcolor: 'grey.50' }}>

                          <TableCell sx={{ fontWeight: 600 }}>الطالب</TableCell>

                          <TableCell sx={{ fontWeight: 600 }}>حاضر</TableCell>

                          <TableCell sx={{ fontWeight: 600 }}>متأخر</TableCell>

                          <TableCell sx={{ fontWeight: 600 }}>غائب</TableCell>

                          <TableCell sx={{ fontWeight: 600 }}>الحالة</TableCell>

                          <TableCell sx={{ fontWeight: 600 }}>وقت الانضمام</TableCell>

                        </TableRow>

                      </TableHead>

                      <TableBody>

                        {participants.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((participant, index) => (

                          <TableRow key={participant.id || index} hover>

                            <TableCell>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

                                <Avatar src={participant.user_image} sx={{ width: 40, height: 40 }}>

                                  {participant.user_name?.charAt(0) || 'U'}

                                </Avatar>

                                <Box>

                                  <Typography variant="body2" fontWeight={500}>

                                    {participant.user_name || 'مستخدم غير محدد'}

                                  </Typography>

                                  <Typography variant="caption" color="text.secondary">

                                    {participant.user_email}

                                  </Typography>

                                </Box>

                              </Box>

                            </TableCell>

                            <TableCell align="center">

                              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

                                {participant.attendance_status === 'present' ? (

                                  <CheckIcon 

                                    fontSize="large" 

                                    sx={{ color: 'success.main' }}

                                  />

                                ) : (

                                  <Box sx={{ width: 24, height: 24 }} />

                                )}

                              </Box>

                            </TableCell>

                            <TableCell align="center">

                              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

                                {participant.attendance_status === 'late' ? (

                                  <ScheduleIcon2 

                                    fontSize="large" 

                                    sx={{ color: 'warning.main' }}

                                  />

                                ) : (

                                  <Box sx={{ width: 24, height: 24 }} />

                                )}

                              </Box>

                            </TableCell>

                            <TableCell align="center">

                              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

                                {participant.attendance_status === 'absent' ? (

                                  <CloseIcon2 

                                    fontSize="large" 

                                    sx={{ color: 'error.main' }}

                                  />

                                ) : (

                                  <Box sx={{ width: 24, height: 24 }} />

                                )}

                              </Box>

                            </TableCell>

                            <TableCell>

                              <Chip

                                label={

                                  participant.attendance_status === 'present' ? 'حاضر' :

                                  participant.attendance_status === 'late' ? 'متأخر' :

                                  participant.attendance_status === 'absent' ? 'غائب' :

                                  participant.attendance_status === 'registered' ? 'مسجل' : 'غير محدد'

                                }

                                color={

                                  participant.attendance_status === 'present' ? 'success' :

                                  participant.attendance_status === 'late' ? 'warning' :

                                  participant.attendance_status === 'absent' ? 'error' :

                                  participant.attendance_status === 'registered' ? 'primary' : 'default'

                                }

                                size="small"

                                variant="outlined"

                              />

                            </TableCell>

                            <TableCell>

                              <Typography variant="body2" color="text.secondary">

                                {participant.joined_at ? formatTime(participant.joined_at) : 'لم ينضم بعد'}

                              </Typography>

                            </TableCell>

                          </TableRow>

                        ))}

                      </TableBody>

                    </Table>

                    <TablePagination

                      rowsPerPageOptions={[5, 10, 25]}

                      component="div"

                      count={participants.length}

                      rowsPerPage={rowsPerPage}

                      page={page}

                      onPageChange={handleChangePage}

                      onRowsPerPageChange={handleChangeRowsPerPage}

                      labelRowsPerPage="عدد الصفوف في الصفحة:"

                      labelDisplayedRows={({ from, to, count }) => `${from}-${to} من ${count}`}

                    />

                  </TableContainer>

                  ) : (

                    <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>

                      لا يوجد مشاركون مسجلون بعد

                    </Typography>

                  )
                ) : (
                  // Student view - show attendance info only
                  <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon color="primary" />
                      معلومات الحضور
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight={500}>
                          حالة الحضور:
                        </Typography>
                        <Chip
                          label="تم التسجيل تلقائياً"
                          color="success"
                          variant="filled"
                          icon={<CheckCircleIcon />}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight={500}>
                          وقت التسجيل:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date().toLocaleString('en-GB')}
                        </Typography>
                      </Box>
                      
                      <Alert severity="info" sx={{ mt: 2 }}>
                        تم تسجيل حضورك تلقائياً عند فتح رابط الاجتماع. لا حاجة لأي إجراء إضافي.
                      </Alert>
                    </Box>
                  </Box>
                )}

              </Paper>

              </Box>

            </Box>

          )}

      </DialogContent>



      {/* Action Buttons */}

      <DialogActions sx={{ p: 3, gap: 2, justifyContent: 'flex-start', direction: 'rtl' }}>

        {userRole === 'teacher' && status === 'upcoming' && onEdit && (

          <Button

            variant="outlined"

            color="primary"

            onClick={() => onEdit(meetingData)}

            startIcon={<EditIcon />}

          >

            تعديل الاجتماع

          </Button>

        )}

        

        {userRole === 'teacher' && status === 'ongoing' && onStartLive && (

          <Button

            variant="contained"

            color="success"

            onClick={() => onStartLive(meetingData.id)}

            startIcon={<PlayArrowIcon />}

          >

            بدء البث المباشر

          </Button>

        )}

        

        {meetingData.zoom_link && status === 'ongoing' && onJoinMeeting && userRole === 'student' && (

          <Button

            variant="contained"

            color="primary"

            onClick={() => onJoinMeeting(meetingData)}

            startIcon={<VideoCallIcon />}

          >

            انضم للاجتماع

          </Button>

        )}

        

        {meetingData.zoom_link && status === 'ongoing' && onJoinMeeting && userRole === 'instructor' && (

          <Button

            variant="contained"

            color="primary"

            onClick={() => onJoinMeeting(meetingData)}

            startIcon={<VideoCallIcon />}

          >

            انضم للاجتماع

          </Button>

        )}

        

        <Button

          variant="outlined"

          onClick={onClose}

        >

          إغلاق

        </Button>

      </DialogActions>

    </Dialog>

  );

};



export default MeetingDetailsDialog; 

