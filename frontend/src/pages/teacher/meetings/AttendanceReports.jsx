import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Paper, Alert, LinearProgress, 
  Snackbar, CircularProgress, List, ListItem, ListItemAvatar, ListItemText,
  Divider, Badge, Tooltip, Switch, FormControlLabel, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Checkbox, Radio,
  RadioGroup, FormLabel, Accordion, AccordionSummary, AccordionDetails,
  Tabs, Tab, Chart as ChartIcon, TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon, Download as DownloadIcon, Print as PrintIcon,
  FilterList as FilterListIcon, DateRange as DateRangeIcon
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
  Upload as UploadIcon, History as HistoryIcon, TrendingDown as TrendingDownIcon,
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

const AttendanceReports = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [attendanceReport, setAttendanceReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [filterStatus, setFilterStatus] = useState('all');

  // Load meetings on component mount
  useEffect(() => {
    fetchTeachingMeetings();
  }, []);

  const fetchTeachingMeetings = async () => {
    try {
      setLoading(true);
      console.log('Fetching teaching meetings for reports...');
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

  const fetchAttendanceReport = async (meetingId) => {
    try {
      setLoading(true);
      console.log('Fetching attendance report for meeting:', meetingId);
      const response = await meetingAPI.getMeetingAttendanceReport(meetingId);
      console.log('Attendance report response:', response);
      setAttendanceReport(response);
      return response;
    } catch (err) {
      console.error('Error fetching attendance report:', err);
      setSnackbar({
        open: true,
        message: t('meetingsLoadAttendanceReportError'),
        severity: 'error'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReportDialog = async (meeting) => {
    setSelectedMeeting(meeting);
    await fetchAttendanceReport(meeting.id);
    setOpenReportDialog(true);
  };

  const handleExportReport = async (meetingId, format = 'pdf') => {
    try {
      setLoading(true);
      const response = await meetingAPI.exportMeetingData(meetingId, format);
      
      // Create download link
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance_report_${meetingId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({
        open: true,
        message: `${t('meetingsReportExportedSuccessfully')} ${format.toUpperCase()}`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error exporting report:', err);
      setSnackbar({
        open: true,
        message: t('meetingsExportReportError'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
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
    if (!attendanceReport?.participants) return { total: 0, present: 0, absent: 0, late: 0, notMarked: 0 };
    
    const participants = attendanceReport.participants;
    const total = participants.length;
    const present = participants.filter(p => p.attendance_status === 'present').length;
    const absent = participants.filter(p => p.attendance_status === 'absent').length;
    const late = participants.filter(p => p.attendance_status === 'late').length;
    const notMarked = participants.filter(p => p.attendance_status === 'not_marked').length;
    
    return { total, present, absent, late, notMarked };
  };

  const stats = getAttendanceStats();

  // Filter meetings based on tab
  const filteredMeetings = Array.isArray(meetings) ? meetings.filter(meeting => {
    const status = getMeetingStatus(meeting);
    if (tabValue === 0) return true; // All meetings
    if (tabValue === 1) return status === 'completed'; // Completed meetings
    if (tabValue === 2) return status === 'ongoing'; // Ongoing meetings
    if (tabValue === 3) return status === 'upcoming'; // Upcoming meetings
    return true;
  }) : [];

  return (
    <Box className="meetings-container">
      {/* Header */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        background: 'linear-gradient(135deg, #663399 0%, #7b1fa2 100%)',
        borderRadius: 3,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <ChartIcon sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
              تقارير الحضور والغياب
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
            عرض وتحليل تقارير الحضور والغياب للاجتماعات والمحاضرات
          </Typography>
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
              color: '#663399',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#663399',
            },
          }}
        >
          <Tab label={`جميع الاجتماعات (${meetings.length})`} />
          <Tab label={`الاجتماعات المنتهية (${meetings.filter(m => getMeetingStatus(m) === 'completed').length})`} />
          <Tab label={`الاجتماعات الجارية (${meetings.filter(m => getMeetingStatus(m) === 'ongoing').length})`} />
          <Tab label={`الاجتماعات القادمة (${meetings.filter(m => getMeetingStatus(m) === 'upcoming').length})`} />
        </Tabs>
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
          <ChartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            لا توجد اجتماعات لعرض التقارير
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            لا توجد اجتماعات قمت بإنشائها لعرض تقارير الحضور
          </Typography>
        </Box>
      )}

      {/* Meetings Grid */}
      <Grid container spacing={3}>
        {filteredMeetings.map((meeting) => {
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
                      onClick={() => handleOpenReportDialog(meeting)}
                      startIcon={<AssessmentIcon />}
                      sx={{ 
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        minWidth: 'fit-content'
                      }}
                    >
                      عرض التقرير
                    </Button>
                    
                    {status === 'completed' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleExportReport(meeting.id, 'pdf')}
                        startIcon={<DownloadIcon />}
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          minWidth: 'fit-content'
                        }}
                      >
                        تصدير PDF
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          );
        })}
      </Grid>

      {/* Attendance Report Dialog */}
      <Dialog 
        open={openReportDialog} 
        onClose={() => setOpenReportDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #663399 0%, #7b1fa2 100%)', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AssessmentIcon />
            تقرير الحضور - {selectedMeeting?.title}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => handlePrintReport()}
              sx={{ color: 'white' }}
            >
              <PrintIcon />
            </IconButton>
            <IconButton
              onClick={() => handleExportReport(selectedMeeting?.id, 'pdf')}
              sx={{ color: 'white' }}
            >
              <DownloadIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>جاري تحميل التقرير...</Typography>
            </Box>
          ) : (
            <Box>
              {/* Meeting Info */}
              <Paper elevation={0} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #f3e5f5 0%, #ffffff 100%)', borderRadius: 3, border: '1px solid #e1bee7' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom color="secondary.main">
                  معلومات الاجتماع
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {selectedMeeting?.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        عنوان الاجتماع
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {formatDate(selectedMeeting?.start_time)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        تاريخ الاجتماع
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {formatTime(selectedMeeting?.start_time)} - {selectedMeeting?.duration} دقيقة
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        وقت البدء والمدة
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {selectedMeeting?.creator_name || 'غير محدد'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        منشئ الاجتماع
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

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
                
                {/* Attendance Rate */}
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="h5" fontWeight={700} color="primary">
                    نسبة الحضور: {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={stats.total > 0 ? (stats.present / stats.total) * 100 : 0}
                    sx={{ mt: 2, height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Paper>

              {/* Participants Table */}
              <Paper elevation={0} sx={{ background: 'linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%)', borderRadius: 3, border: '1px solid #c8e6c9' }}>
                <Typography variant="h6" fontWeight={600} sx={{ p: 3, pb: 1 }} color="success.main">
                  تفاصيل الحضور
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>الطالب</TableCell>
                        <TableCell>البريد الإلكتروني</TableCell>
                        <TableCell>حالة الحضور</TableCell>
                        <TableCell>وقت الانضمام</TableCell>
                        <TableCell>ملاحظات</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceReport?.participants?.map((participant) => (
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
                              label={getAttendanceStatusText(participant.attendance_status)}
                              color={getAttendanceStatusColor(participant.attendance_status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {participant.joined_at ? formatTime(participant.joined_at) : 'لم ينضم'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {participant.notes || '-'}
                            </Typography>
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
            onClick={() => setOpenReportDialog(false)} 
            disabled={loading}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            إغلاق
          </Button>
          <Button 
            onClick={() => handleExportReport(selectedMeeting?.id, 'pdf')}
            disabled={loading}
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #663399 0%, #7b1fa2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%)',
              }
            }}
          >
            تصدير PDF
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

export default AttendanceReports;
