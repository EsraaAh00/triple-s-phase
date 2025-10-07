import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Paper, Divider,
  List, ListItem, ListItemText, ListItemAvatar, Badge, LinearProgress, Alert,
  Tabs, Tab, Fab, Drawer, AppBar, Toolbar
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  VideoCall as VideoCallIcon, Mic as MicIcon, MicOff as MicOffIcon,
  Videocam as VideocamIcon, VideocamOff as VideocamOffIcon, ScreenShare as ScreenShareIcon,
  StopScreenShare as StopScreenShareIcon, Chat as ChatIcon, People as PeopleIcon,
  Settings as SettingsIcon, MoreVert as MoreVertIcon, Close as CloseIcon,
  Send as SendIcon, AttachFile as AttachFileIcon, EmojiEmotions as EmojiIcon,
  RecordVoiceOver as RecordIcon, Stop as StopIcon, Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon, VolumeUp as VolumeUpIcon, VolumeOff as VolumeOffIcon,
  CheckCircle as CheckCircleIcon, Cancel as CancelIcon, Timer as TimerIcon,
  Notifications as NotificationsIcon, FileCopy as FileCopyIcon
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled Components
const VideoContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: 12,
  overflow: 'hidden',
  background: '#000',
  '&:hover .controls-overlay': {
    opacity: 1,
  },
}));

const ControlsOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
  padding: theme.spacing(2),
  opacity: 0,
  transition: 'opacity 0.3s ease',
}));

const ChatMessage = styled(Box)(({ theme, isOwn }) => ({
  display: 'flex',
  flexDirection: isOwn ? 'row-reverse' : 'row',
  marginBottom: theme.spacing(1),
  '& .message-content': {
    maxWidth: '70%',
    padding: theme.spacing(1, 2),
    borderRadius: 16,
    background: isOwn ? '#333679' : '#f5f5f5',
    color: isOwn ? '#fff' : '#333',
    margin: theme.spacing(0, 1),
  },
}));

import { useParams, useNavigate } from 'react-router-dom';
import { meetingAPI } from '../../../services/meeting.service';

const LiveMeeting = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [meetingInfo, setMeetingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isLiveStarted, setIsLiveStarted] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (err) {
        console.error('Error parsing user from localStorage:', err);
      }
    }
  }, []);

  // Fetch meeting details
  useEffect(() => {
    const fetchMeetingDetails = async () => {
      try {
        setLoading(true);
        console.log('Fetching meeting details for ID:', meetingId);
        const response = await meetingAPI.getMeetingDetails(meetingId);
        console.log('Meeting details response:', response);
        setMeetingInfo(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching meeting details:', err);
        setError('حدث خطأ في تحميل تفاصيل الاجتماع');
      } finally {
        setLoading(false);
      }
    };

    if (meetingId) {
      fetchMeetingDetails();
    }
  }, [meetingId]);

  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async () => {
    if (chatMessage.trim()) {
      try {
        console.log('Sending message:', chatMessage);
        const newMessage = await meetingAPI.sendChatMessage(meetingId, chatMessage);
        console.log('Message sent successfully:', newMessage);
        setChatMessage('');
        // Refresh chat messages
        fetchChatMessages();
      } catch (error) {
        console.error('Error sending message:', error);
        // Show error to user
        alert('حدث خطأ في إرسال الرسالة');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleMic = () => setIsMicOn(!isMicOn);
  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing);
  const toggleRecording = () => setIsRecording(!isRecording);
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
  const toggleMute = () => setIsMuted(!isMuted);

  // Start live meeting
  const handleStartLive = async () => {
    try {
      console.log('Starting live meeting:', meetingId);
      await meetingAPI.startLiveMeeting(meetingId);
      console.log('Successfully started live meeting');
      setIsLiveStarted(true);
    } catch (err) {
      console.error('Error starting live meeting:', err);
      alert('حدث خطأ في بدء الاجتماع المباشر');
    }
  };

  // Fetch participants from API
  const fetchParticipants = async () => {
    try {
      console.log('Fetching participants for meeting:', meetingId);
      const response = await meetingAPI.getMeetingParticipants(meetingId);
      console.log('Participants response:', response);
      if (response && Array.isArray(response)) {
        setParticipants(response);
        console.log('Set participants from API:', response.length);
      } else {
        console.log('No participants found or invalid response');
        setParticipants([]);
      }
    } catch (err) {
      console.error('Error fetching participants:', err);
      setParticipants([]);
    }
  };

  // Fetch chat messages from API
  const fetchChatMessages = async () => {
    try {
      console.log('Fetching chat messages for meeting:', meetingId);
      const response = await meetingAPI.getChatMessages(meetingId);
      console.log('Chat messages response:', response);
      if (response && Array.isArray(response)) {
        setChatMessages(response);
        console.log('Set chat messages from API:', response.length);
      } else {
        console.log('No chat messages found or invalid response');
        setChatMessages([]);
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
      setChatMessages([]);
    }
  };

  // Fetch participants when meeting info is loaded
  useEffect(() => {
    if (meetingInfo) {
      console.log('Meeting info loaded, starting data fetch...');
      
      // Initial fetch
      fetchParticipants();
      fetchChatMessages();
      
      // Set up interval to refresh participants and chat
      const participantsInterval = setInterval(() => {
        console.log('Refreshing participants...');
        fetchParticipants();
      }, 10000); // Refresh every 10 seconds
      
      const chatInterval = setInterval(() => {
        console.log('Refreshing chat...');
        fetchChatMessages();
      }, 5000); // Refresh chat every 5 seconds
      
      return () => {
        console.log('Cleaning up intervals...');
        clearInterval(participantsInterval);
        clearInterval(chatInterval);
      };
    }
  }, [meetingInfo]);

  // Start live meeting when component mounts
  useEffect(() => {
    if (meetingInfo && !isLiveStarted) {
      handleStartLive();
    }
  }, [meetingInfo]);

  const handleEndMeeting = async () => {
    try {
      console.log('Ending live meeting:', meetingId);
      await meetingAPI.endLiveMeeting(meetingId);
      console.log('Successfully ended meeting');
    } catch (err) {
      console.error('Error ending meeting:', err);
      alert('حدث خطأ في إنهاء الاجتماع');
    } finally {
      // Always navigate back regardless of API success/failure
      navigate('/teacher/meetings');
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        bgcolor: '#1a1a1a',
        color: 'white'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#333679', mb: 2 }} />
          <Typography variant="h6">جاري تحميل الاجتماع...</Typography>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error && !meetingInfo) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        bgcolor: '#1a1a1a',
        color: 'white'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/teacher/meetings')}
            sx={{ bgcolor: '#333679' }}
          >
            العودة لصفحة الاجتماعات
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#1a1a1a' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: '#2d2d2d', boxShadow: 'none' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              {meetingInfo?.title || 'اجتماع'}
            </Typography>
            <Chip
              label="مباشر"
              color="error"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {formatTime(elapsedTime)}
            </Typography>
            <IconButton color="inherit" onClick={() => setSettingsOpen(true)}>
              <SettingsIcon />
            </IconButton>
            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={handleEndMeeting}
              sx={{ 
                bgcolor: '#d32f2f',
                '&:hover': { bgcolor: '#b71c1c' },
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              إنهاء الاجتماع
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Video Area */}
        <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
          {/* Main Video */}
          <VideoContainer sx={{ flex: 1, mb: 2 }}>
            <Box
              sx={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(45deg, #333 30%, #555 90%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <Box sx={{ textAlign: 'center', color: '#fff' }}>
                <VideocamIcon sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6">الفيديو الرئيسي</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  {isVideoOn ? 'فيديو نشط' : 'الفيديو معطل'}
                </Typography>
              </Box>
            </Box>
            <ControlsOverlay className="controls-overlay">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="#fff">
                  {participants.length} مشارك
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,0.3)' }}
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                  </IconButton>
                </Box>
              </Box>
            </ControlsOverlay>
          </VideoContainer>

          {/* Participants Grid */}
          <Grid container spacing={1} sx={{ height: 120 }}>
            {participants.slice(0, 6).map((participant) => (
              <Grid item xs={2} key={participant.id}>
                <VideoContainer sx={{ height: '100%' }}>
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(45deg, #444 30%, #666 90%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <Avatar sx={{ width: 40, height: 40 }}>
                      {participant.user_name ? participant.user_name.charAt(0) : '?'}
                    </Avatar>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 4,
                        left: 4,
                        display: 'flex',
                        gap: 0.5,
                      }}
                    >
                      {participant.attendance_status === 'absent' && (
                        <MicOffIcon sx={{ fontSize: 16, color: '#fff', bgcolor: 'rgba(0,0,0,0.5)', borderRadius: 1 }} />
                      )}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        bottom: 4,
                        right: 4,
                        color: '#fff',
                        fontSize: '0.7rem',
                      }}
                    >
                      {participant.user_name || 'مستخدم'}
                    </Typography>
                  </Box>
                </VideoContainer>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Sidebar */}
        <Box sx={{ width: 320, display: 'flex', flexDirection: 'column' }}>
          {/* Tabs */}
          <Paper sx={{ borderRadius: 0 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{
                '& .MuiTab-root': {
                  minWidth: 'auto',
                  flex: 1,
                },
              }}
            >
              <Tab
                icon={<ChatIcon />}
                label="الدردشة"
                onClick={() => setChatOpen(true)}
              />
              <Tab
                icon={<PeopleIcon />}
                label={`المشاركون (${participants.length})`}
                onClick={() => setParticipantsOpen(true)}
              />
            </Tabs>
          </Paper>

          {/* Chat Panel */}
          {tabValue === 0 && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  الدردشة
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {participants.length} مشارك
                </Typography>
              </Box>
              
              <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                {chatMessages.length > 0 ? (
                  chatMessages.map((msg) => (
                    <ChatMessage key={msg.id} isOwn={msg.user === currentUser?.id}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                        {msg.user_name ? msg.user_name.charAt(0) : '?'}
                      </Avatar>
                      <Box className="message-content">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {msg.user_name || 'مستخدم'}
                          </Typography>
                          {msg.is_teacher && (
                            <Chip label="المعلم" size="small" color="primary" sx={{ height: 16, fontSize: '0.6rem' }} />
                          )}
                        </Box>
                        <Typography variant="body2">
                          {msg.message}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {msg.created_at_formatted || 'الآن'}
                        </Typography>
                      </Box>
                    </ChatMessage>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    <Typography variant="body2">لا توجد رسائل بعد</Typography>
                    <Typography variant="caption">ابدأ المحادثة الآن</Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <IconButton size="small">
                    <AttachFileIcon />
                  </IconButton>
                  <IconButton size="small">
                    <EmojiIcon />
                  </IconButton>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  placeholder="اكتب رسالة..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  variant="outlined"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<SendIcon />}
                  onClick={handleSendMessage}
                  sx={{ mt: 1, borderRadius: 2 }}
                  disabled={!chatMessage.trim()}
                >
                  إرسال
                </Button>
              </Box>
            </Box>
          )}

          {/* Participants Panel */}
          {tabValue === 1 && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  المشاركون
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {participants.length} من {meetingInfo?.max_participants || 20}
                </Typography>
              </Box>
              
              <List sx={{ flex: 1, overflowY: 'auto' }}>
                {participants.length > 0 ? (
                  participants.map((participant) => (
                    <ListItem key={participant.id} sx={{ py: 1 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 40, height: 40 }}>
                          {participant.user_name ? participant.user_name.charAt(0) : '?'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {participant.user_name || 'مستخدم'}
                            </Typography>
                            {participant.is_teacher && (
                              <Chip label="المعلم" size="small" color="primary" />
                            )}
                            {participant.attendance_status === 'attending' && (
                              <Chip label="حاضر" size="small" color="success" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              انضم في {participant.join_time_formatted || 'الآن'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {participant.attendance_status === 'absent' && (
                                <MicOffIcon sx={{ fontSize: 16, color: '#666' }} />
                              )}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    <Typography variant="body2">لا يوجد مشاركون بعد</Typography>
                  </Box>
                )}
              </List>
            </Box>
          )}
        </Box>
      </Box>

      {/* Controls */}
      <Box sx={{ p: 2, bgcolor: '#2d2d2d', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <IconButton
            onClick={toggleMic}
            sx={{
              bgcolor: isMicOn ? '#4DBFB3' : '#f44336',
              color: '#fff',
              '&:hover': {
                bgcolor: isMicOn ? '#45a049' : '#d32f2f',
              },
            }}
          >
            {isMicOn ? <MicIcon /> : <MicOffIcon />}
          </IconButton>

          <IconButton
            onClick={toggleVideo}
            sx={{
              bgcolor: isVideoOn ? '#4DBFB3' : '#f44336',
              color: '#fff',
              '&:hover': {
                bgcolor: isVideoOn ? '#45a049' : '#d32f2f',
              },
            }}
          >
            {isVideoOn ? <VideocamIcon /> : <VideocamOffIcon />}
          </IconButton>

          <IconButton
            onClick={toggleScreenShare}
            sx={{
              bgcolor: isScreenSharing ? '#ff9800' : '#666',
              color: '#fff',
              '&:hover': {
                bgcolor: isScreenSharing ? '#f57c00' : '#555',
              },
            }}
          >
            {isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
          </IconButton>

          <IconButton
            onClick={toggleRecording}
            sx={{
              bgcolor: isRecording ? '#f44336' : '#666',
              color: '#fff',
              '&:hover': {
                bgcolor: isRecording ? '#d32f2f' : '#555',
              },
            }}
          >
            {isRecording ? <StopIcon /> : <RecordIcon />}
          </IconButton>

          <IconButton
            onClick={toggleMute}
            sx={{
              bgcolor: isMuted ? '#ff9800' : '#666',
              color: '#fff',
              '&:hover': {
                bgcolor: isMuted ? '#f57c00' : '#555',
              },
            }}
          >
            {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>

          <Divider orientation="vertical" flexItem sx={{ bgcolor: '#555' }} />

          <Button
            variant="contained"
            color="error"
            startIcon={<CloseIcon />}
            onClick={handleEndMeeting}
            sx={{ borderRadius: 2 }}
          >
            إنهاء الاجتماع
          </Button>
        </Box>
      </Box>

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600 }}>
          إعدادات الاجتماع
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                معلومات الاجتماع
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>معرف الاجتماع:</strong> {meetingInfo?.id}
                </Typography>
                <Typography variant="body2">
                  <strong>المدة:</strong> {formatTime(elapsedTime)}
                </Typography>
                <Typography variant="body2">
                  <strong>المشاركون:</strong> {participants.length}/{meetingInfo?.max_participants || 20}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                مشاركة الرابط
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  fullWidth
                  value={`${window.location.origin}/student/meetings/live/${meetingInfo?.id}`}
                  variant="outlined"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <IconButton
                  size="small"
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/student/meetings/live/${meetingInfo?.id}`)}
                  sx={{ color: '#333679' }}
                >
                  <FileCopyIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setSettingsOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LiveMeeting; 