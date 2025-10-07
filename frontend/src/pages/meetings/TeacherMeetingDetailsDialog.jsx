import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Grid,
  Chip,
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
  CircularProgress,
  Avatar
} from '@mui/material';
import { useTranslation } from 'react-i18next';
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
  Create as CreateIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon
} from '@mui/icons-material';
import { meetingAPI } from '../../services/meeting.service';

const TeacherMeetingDetailsDialog = ({ 
  open, 
  onClose, 
  meeting, 
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
  const [participants, setParticipants] = useState([]);
  
  // Pagination state for participants table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch detailed meeting information when dialog opens
  useEffect(() => {
    if (open && meeting?.id) {
      console.log('TeacherMeetingDetailsDialog useEffect triggered - fetching details for meeting:', meeting.id);
      fetchMeetingDetails();
    }
  }, [open, meeting?.id, meeting?.updated_at, meeting?.start_time, meeting?.duration]);

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
      const participantsResponse = await meetingAPI.getMeetingParticipants(meeting.id);
      console.log('Participants response:', participantsResponse);
      setParticipants(participantsResponse);
      
    } catch (err) {
      console.error('Error fetching meeting details:', err);
      setError(t('meetingsLoadMeetingDetailsError'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle attendance status change
  const handleAttendanceChange = async (participantId, newStatus) => {
    try {
      await meetingAPI.updateParticipantAttendance(meeting.id, participantId, newStatus);
      
      // Update local state
      setParticipants(prev => 
        prev.map(p => 
          p.id === participantId 
            ? { ...p, attendance_status: newStatus }
            : p
        )
      );
      
      // Show success message
      alert(`${t('meetingsAttendanceStatusUpdatedTo')}: ${newStatus === 'present' ? t('meetingsPresent') : newStatus === 'late' ? t('meetingsLate') : t('meetingsAbsent')}`);
      
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert(t('meetingsUpdateAttendanceStatusError'));
    }
  };

  // Mark absent participants
  const handleMarkAbsent = async () => {
    try {
      const result = await meetingAPI.markAbsentParticipants(meeting.id);
      alert(result.message);
      
      // Refresh participants list
      const participantsResponse = await meetingAPI.getMeetingParticipants(meeting.id);
      setParticipants(participantsResponse);
      
    } catch (error) {
      console.error('Error marking absent participants:', error);
      alert(t('meetingsMarkAbsentError'));
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming': return t('meetingsUpcoming');
      case 'ongoing': return t('meetingsOngoing');
      case 'completed': return t('meetingsCompleted');
      case 'cancelled': return t('meetingsCancelled');
      default: return t('commonNotSpecified');
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
      case 'lecture': return 'محاضرة';
      case 'discussion': return 'مناقشة';
      case 'workshop': return 'ورشة عمل';
      case 'exam': return 'امتحان';
      default: return 'اجتماع عادي';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'تاريخ غير صحيح';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'غير محدد';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'وقت غير صحيح';
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'غير محدد';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} ساعة ${mins} دقيقة`;
    }
    return `${mins} دقيقة`;
  };

  if (!meeting) return null;

  const meetingData = meetingDetails || meeting;
  const status = meetingData.status || 'upcoming';
  const totalParticipants = participants.length;
  const attendingParticipants = participants.filter(p => p.attendance_status === 'present' || p.attendance_status === 'late').length;
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
            تفاصيل الاجتماع - لوحة المعلم
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

      <DialogContent sx={{ p: 0, overflow: 'auto' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
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
        )}

        {!loading && !error && meetingData && (
          <Box sx={{ p: 4 }}>
            {/* Meeting Title and Description */}
            <Paper elevation={0} sx={{ p: 4, mb: 3, background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', borderRadius: 3, border: '1px solid #e9ecef' }}>
              <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
                {meetingData.title}
              </Typography>
              
              {meetingData.description && (
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2, lineHeight: 1.8 }}>
                  {meetingData.description}
                </Typography>
              )}
            </Paper>

            {/* Basic Info Grid */}
            <Paper elevation={0} sx={{ p: 4, mb: 3, background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)', borderRadius: 3, border: '1px solid #bbdefb' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <CalendarTodayIcon sx={{ color: '#667eea', ml: 2, fontSize: 24 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {formatDate(meetingData.start_time)}
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
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        وقت البدء والمدة
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

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
              </Grid>

              {/* Additional Info Grid */}
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

              {/* Meeting Features */}
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
            </Paper>

            {/* Zoom Link Section */}
            {meetingData.zoom_link && (
              <Paper elevation={0} sx={{ p: 4, mb: 3, background: 'linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%)', borderRadius: 3, border: '1px solid #c8e6c9' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom color="success.main">
                  رابط الاجتماع
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                  <TextField
                    fullWidth
                    value={meetingData.zoom_link}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    size="small"
                  />
                  <Button
                    variant="outlined"
                    startIcon={copied ? <CheckIcon /> : <FileCopyIcon />}
                    onClick={() => copyToClipboard(meetingData.zoom_link)}
                    color={copied ? 'success' : 'primary'}
                  >
                    {copied ? 'تم النسخ' : 'نسخ الرابط'}
                  </Button>
                </Box>
              </Paper>
            )}

            {/* Attendance Statistics */}
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

            {/* Participants Table */}
            <Paper elevation={0} sx={{ p: 4, background: 'linear-gradient(135deg, #f3e5f5 0%, #ffffff 100%)', borderRadius: 3, border: '1px solid #e1bee7' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600} color="secondary.main">
                  قائمة المشاركين
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={handleMarkAbsent}
                  startIcon={<CloseIcon2 />}
                >
                  تسجيل الغائبين
                </Button>
              </Box>

              {participants.length > 0 ? (
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
                        <TableCell sx={{ fontWeight: 600 }}>الإجراءات</TableCell>
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
                                <CheckIcon fontSize="large" sx={{ color: 'success.main' }} />
                              ) : (
                                <Box sx={{ width: 24, height: 24 }} />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              {participant.attendance_status === 'late' ? (
                                <ScheduleIcon2 fontSize="large" sx={{ color: 'warning.main' }} />
                              ) : (
                                <Box sx={{ width: 24, height: 24 }} />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              {participant.attendance_status === 'absent' ? (
                                <CloseIcon2 fontSize="large" sx={{ color: 'error.main' }} />
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
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="تسجيل حضور">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleAttendanceChange(participant.id, 'present')}
                                >
                                  <CheckIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="تسجيل تأخير">
                                <IconButton
                                  size="small"
                                  color="warning"
                                  onClick={() => handleAttendanceChange(participant.id, 'late')}
                                >
                                  <ScheduleIcon2 />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="تسجيل غياب">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleAttendanceChange(participant.id, 'absent')}
                                >
                                  <CloseIcon2 />
                                </IconButton>
                              </Tooltip>
                            </Box>
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
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    لا يوجد مشاركون
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    لم يتم تسجيل أي مشاركين في هذا الاجتماع بعد
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        )}
      </DialogContent>

      {/* Action Buttons */}
      <DialogActions sx={{ p: 3, gap: 2, justifyContent: 'flex-start', direction: 'rtl' }}>
        {status === 'upcoming' && onEdit && (
          <Button
            variant="outlined"
            color="primary"
            onClick={() => onEdit(meetingData)}
            startIcon={<EditIcon />}
          >
            تعديل الاجتماع
          </Button>
        )}

        {status === 'ongoing' && onStartLive && (
          <Button
            variant="contained"
            color="success"
            onClick={() => onStartLive(meetingData.id)}
            startIcon={<PlayArrowIcon />}
          >
            بدء البث المباشر
          </Button>
        )}

        {meetingData.zoom_link && status === 'ongoing' && onJoinMeeting && (
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

export default TeacherMeetingDetailsDialog;
