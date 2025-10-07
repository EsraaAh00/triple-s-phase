import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Paper, Alert, LinearProgress, 
  Snackbar, CircularProgress, List, ListItem, ListItemAvatar, ListItemText,
  Divider, Badge, Tooltip, Switch, FormControlLabel, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Checkbox, Radio,
  RadioGroup, FormLabel, Accordion, AccordionSummary, AccordionDetails
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
  TrendingUp as TrendingUpIcon, Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon, Save as SaveIcon, Check as CheckIcon,
  Close as CloseIcon, Warning as WarningIcon, Info as InfoIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import '../../meetings/MeetingsCommon.css';
import { meetingAPI } from '../../../services/meeting.service';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  },
}));

const AttendanceManagement = () => {
  const { t } = useTranslation();
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openAttendanceDialog, setOpenAttendanceDialog] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});
  const [bulkAttendanceData, setBulkAttendanceData] = useState({});

  // Load meetings on component mount
  useEffect(() => {
    fetchTeachingMeetings();
  }, []);

  const fetchTeachingMeetings = async () => {
    try {
      setLoading(true);
      console.log('Fetching teaching meetings...');
      const response = await meetingAPI.getTeachingMeetings();
      console.log('Teaching meetings response:', response);
      
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
      
      console.log('Processed teaching meetings:', meetingsData);
      setMeetings(Array.isArray(meetingsData) ? meetingsData : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching teaching meetings:', err);
      setError(t('meetingsLoadMeetingsError'));
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetingParticipants = async (meetingId) => {
    try {
      setLoading(true);
      console.log('Fetching participants for meeting:', meetingId);
      const response = await meetingAPI.getMeetingParticipants(meetingId);
      console.log('Participants response:', response);
      
      let participantsData = [];
      if (response?.participants) {
        participantsData = response.participants;
      } else if (response?.results) {
        participantsData = response.results;
      } else if (Array.isArray(response)) {
        participantsData = response;
      } else {
        participantsData = [];
      }
      
      console.log('Processed participants:', participantsData);
      setParticipants(participantsData);
      
      // Initialize attendance data
      const initialAttendanceData = {};
      participantsData.forEach(participant => {
        initialAttendanceData[participant.id] = participant.attendance_status || 'not_marked';
      });
      setAttendanceData(initialAttendanceData);
      setBulkAttendanceData(initialAttendanceData);
      
      return participantsData;
    } catch (err) {
      console.error('Error fetching meeting participants:', err);
      setSnackbar({
        open: true,
        message: t('meetingsLoadParticipantsListError'),
        severity: 'error'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAttendanceDialog = async (meeting) => {
    setSelectedMeeting(meeting);
    await fetchMeetingParticipants(meeting.id);
    setOpenAttendanceDialog(true);
  };

  const handleMarkAttendance = async (participantId, status) => {
    try {
      setLoading(true);
      await meetingAPI.markAttendance(selectedMeeting.id, participantId, status);
      
      // Update local state
      setAttendanceData(prev => ({
        ...prev,
        [participantId]: status
      }));
      
      setSnackbar({
        open: true,
        message: t('meetingsAttendanceRecordedSuccessfully'),
        severity: 'success'
      });
    } catch (err) {
      console.error('Error marking attendance:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t('meetingsRecordAttendanceError'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkMarkAttendance = async () => {
    try {
      setLoading(true);
      
      // Prepare attendance data for bulk update
      const attendanceDataArray = Object.entries(bulkAttendanceData).map(([participantId, status]) => ({
        participant_id: participantId,
        status: status
      }));
      
      await meetingAPI.bulkMarkAttendance(selectedMeeting.id, attendanceDataArray);
      
      // Update local state
      setAttendanceData(bulkAttendanceData);
      
      setSnackbar({
        open: true,
        message: t('meetingsAllAttendanceRecordedSuccessfully'),
        severity: 'success'
      });
      
      setOpenAttendanceDialog(false);
    } catch (err) {
      console.error('Error bulk marking attendance:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t('meetingsRecordAttendanceError'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAttendanceChange = (status) => {
    const newBulkData = {};
    participants.forEach(participant => {
      newBulkData[participant.id] = status;
    });
    setBulkAttendanceData(newBulkData);
  };

  const getMeetingStatus = (meeting) => {
    const now = new Date();
    const startTime = new Date(meeting.start_time);
    const endTime = new Date(startTime.getTime() + meeting.duration * 60000);
    
    if (meeting.status === 'cancelled') return 'cancelled';
    if (now >= startTime && now <= endTime) return 'ongoing';
    if (now > endTime) return 'completed';
    return 'upcoming';
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

  const getAttendanceStatusText = (status) => {
    switch (status) {
      case 'present': return 'حاضر';
      case 'absent': return 'غائب';
      case 'late': return 'متأخر';
      case 'not_marked': return 'لم يتم التقييم';
      default: return 'غير محدد';
    }
  };

  const getAttendanceStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      case 'not_marked': return 'default';
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

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Calculate attendance statistics
  const getAttendanceStats = () => {
    const total = participants.length;
    const present = participants.filter(p => attendanceData[p.id] === 'present').length;
    const absent = participants.filter(p => attendanceData[p.id] === 'absent').length;
    const late = participants.filter(p => attendanceData[p.id] === 'late').length;
    const notMarked = participants.filter(p => attendanceData[p.id] === 'not_marked').length;
    
    return { total, present, absent, late, notMarked };
  };

  const stats = getAttendanceStats();

  return (
    <Box className="meetings-container">
      {/* Header */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
        borderRadius: 3,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <AssessmentIcon sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
              إدارة الحضور والغياب
            </Typography>
            <IconButton 
              onClick={fetchTeachingMeetings}
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
          
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            إدارة حضور الطلاب في الاجتماعات والمحاضرات
          </Typography>
        </Box>
      </Box>

      {/* Loading State */}
      {loading && (!Array.isArray(meetings) || meetings.length === 0) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} />
          <Typography sx={{ ml: 2 }}>جاري تحميل الاجتماعات...</Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <Alert severity="error" sx={{ maxWidth: 600 }}>
            {error}
            <Button 
              onClick={fetchTeachingMeetings} 
              sx={{ ml: 2 }}
              variant="outlined"
              size="small"
            >
              إعادة المحاولة
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
          <AssessmentIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            لا توجد اجتماعات لإدارة الحضور
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            لا توجد اجتماعات قمت بإنشائها لإدارة الحضور
          </Typography>
        </Box>
      )}

      {/* Meetings Grid */}
      <Grid container spacing={3}>
        {meetings.map((meeting) => {
          const status = getMeetingStatus(meeting);
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={meeting.id}>
              <StyledCard>
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
                    <Chip 
                      label={getStatusText(status)} 
                      color={status === 'ongoing' ? 'success' : status === 'upcoming' ? 'primary' : 'default'}
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
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenAttendanceDialog(meeting)}
                      startIcon={<AssessmentIcon />}
                      sx={{ 
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        minWidth: 'fit-content'
                      }}
                    >
                      إدارة الحضور
                    </Button>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          );
        })}
      </Grid>

      {/* Attendance Management Dialog */}
      <Dialog 
        open={openAttendanceDialog} 
        onClose={() => setOpenAttendanceDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <AssessmentIcon />
          إدارة الحضور - {selectedMeeting?.title}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>جاري تحميل قائمة المشاركين...</Typography>
            </Box>
          ) : (
            <Box>
              {/* Attendance Statistics */}
              <Paper elevation={0} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)', borderRadius: 3, border: '1px solid #ffcc02' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom color="warning.main">
                  إحصائيات الحضور
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" fontWeight={700} color="primary">
                        {stats.total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        إجمالي المسجلين
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {stats.present}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        الحضور
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" fontWeight={700} color="error.main">
                        {stats.absent}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        الغياب
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" fontWeight={700} color="warning.main">
                        {stats.late}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        متأخر
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" fontWeight={700} color="text.secondary">
                        {stats.notMarked}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        لم يتم التقييم
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Bulk Actions */}
              <Paper elevation={0} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)', borderRadius: 3, border: '1px solid #2196f3' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
                  إجراءات سريعة
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={() => handleBulkAttendanceChange('present')}
                    startIcon={<CheckIcon />}
                  >
                    تحديد الكل حاضر
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleBulkAttendanceChange('absent')}
                    startIcon={<CloseIcon />}
                  >
                    تحديد الكل غائب
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() => handleBulkAttendanceChange('late')}
                    startIcon={<WarningIcon />}
                  >
                    تحديد الكل متأخر
                  </Button>
                  <Button
                    variant="outlined"
                    color="default"
                    onClick={() => handleBulkAttendanceChange('not_marked')}
                    startIcon={<InfoIcon />}
                  >
                    إعادة تعيين
                  </Button>
                </Box>
              </Paper>

              {/* Participants Table */}
              <Paper elevation={0} sx={{ background: 'linear-gradient(135deg, #f3e5f5 0%, #ffffff 100%)', borderRadius: 3, border: '1px solid #e1bee7' }}>
                <Typography variant="h6" fontWeight={600} sx={{ p: 3, pb: 1 }} color="secondary.main">
                  قائمة المشاركين
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>الطالب</TableCell>
                        <TableCell>البريد الإلكتروني</TableCell>
                        <TableCell>الحالة الحالية</TableCell>
                        <TableCell>تغيير الحالة</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {participants.map((participant) => (
                        <TableRow key={participant.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar src={participant.user_image}>
                                {participant.user_name?.charAt(0) || 'U'}
                              </Avatar>
                              <Typography variant="body2" fontWeight={600}>
                                {participant.user_name || 'مستخدم غير محدد'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {participant.user_email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getAttendanceStatusText(attendanceData[participant.id])}
                              color={getAttendanceStatusColor(attendanceData[participant.id])}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <FormControl size="small">
                              <Select
                                value={bulkAttendanceData[participant.id] || 'not_marked'}
                                onChange={(e) => {
                                  setBulkAttendanceData(prev => ({
                                    ...prev,
                                    [participant.id]: e.target.value
                                  }));
                                }}
                                sx={{ minWidth: 120 }}
                              >
                                <MenuItem value="present">حاضر</MenuItem>
                                <MenuItem value="absent">غائب</MenuItem>
                                <MenuItem value="late">متأخر</MenuItem>
                                <MenuItem value="not_marked">لم يتم التقييم</MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setOpenAttendanceDialog(false)} 
            disabled={loading}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            إلغاء
          </Button>
          <Button 
            onClick={handleBulkMarkAttendance}
            disabled={loading}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
              }
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} color="inherit" />
                جاري الحفظ...
              </Box>
            ) : (
              'حفظ الحضور'
            )}
          </Button>
        </DialogActions>
      </Dialog>

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

export default AttendanceManagement;
