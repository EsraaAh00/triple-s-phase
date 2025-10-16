import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { profileService } from '../../services/profileService';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Button, 
  Box, 
  Tabs, 
  Tab, 
  Divider, 
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  CircularProgress,
  Badge,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Paper,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Slide,
  Stack,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fab,
  Tooltip
} from '@mui/material';
import { 
  Edit, 
  Save, 
  Lock, 
  Email, 
  Phone, 
  LocationOn, 
  School, 
  Work, 
  CalendarToday, 
  CheckCircle,
  Cancel,
  Visibility,
  VisibilityOff,
  Add,
  Close,
  DeleteOutline,
  Security,
  Notifications,
  Palette,
  Language,
  Person,
  PhotoCamera,
  CloudUpload,
  Star,
  TrendingUp,
  Assignment,
  VideoCall,
  Article,
  Settings,
  AccountCircle,
  VerifiedUser,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  VideoCall as VideoCallIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Book as BookIcon,
  Schedule as ScheduleIcon,
  ExpandMore,
  MoreVert,
  Favorite,
  Share,
  Bookmark,
  BookmarkBorder,
  Grade,
  EmojiEvents,
  Psychology,
  Code,
  Business,
  Science,
  SportsEsports,
  MusicNote,
  Movie,
  CameraAlt,
  Videocam,
  Headphones,
  Laptop,
  Smartphone,
  Tablet,
  Watch,
  FitnessCenter,
  Restaurant,
  LocalHospital
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import profileImage from '../../assets/images/profile.jpg';

// Styled Components
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, #333679 0%, #4DBFB3 100%)`,
  borderRadius: theme.spacing(3),
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.3,
  }
}));

const ProfileCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(14, 81, 129, 0.1)',
  border: '1px solid',
  borderColor: alpha('#333679', 0.08),
  transition: 'all 0.3s ease',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(229, 151, 139, 0.02) 100%)',
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(14, 81, 129, 0.15)',
    borderColor: alpha('#333679', 0.15),
  }
}));

const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2.5),
  background: `linear-gradient(135deg, ${alpha('#333679', 0.03)} 0%, ${alpha('#4DBFB3', 0.03)} 100%)`,
  border: '1px solid',
  borderColor: alpha('#333679', 0.08),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(14, 81, 129, 0.12)',
  }
}));

const SkillChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  fontWeight: 600,
  background: `linear-gradient(135deg, ${alpha('#333679', 0.1)} 0%, ${alpha('#4DBFB3', 0.1)} 100%)`,
  border: `1px solid ${alpha('#333679', 0.2)}`,
  color: '#333679',
  '&:hover': {
    transform: 'scale(1.05)',
    background: `linear-gradient(135deg, ${alpha('#333679', 0.15)} 0%, ${alpha('#4DBFB3', 0.15)} 100%)`,
  }
}));

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const Profile = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, getUserRole, updateUser } = useAuth();
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef(null);
  
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    website: user?.website || '',
    bio: user?.bio || '',
    avatar: user?.profile_picture || profileImage,
    coverImage: 'https://source.unsplash.com/random/1200x300?programming',
    joinDate: user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en-US') : '',
    skills: user?.skills || [],
    education: user?.education || [],
    experience: user?.experience || [],
    coursesEnrolled: 0,
    coursesCompleted: 0,
    certificates: 0,
    lectures: 0,
    lastActive: t('profileLastActive'),
    isVerified: user?.is_verified || false,
    profileCompletion: 0
  });

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: {
      courseAnnouncements: true,
      privateMessages: true,
      promotionalOffers: false,
      weeklyDigest: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: true,
      allowMessages: true
    },
    appearance: {
      theme: 'auto',
      language: 'ar',
      fontSize: 'medium'
    }
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSettingsChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Prepare profile data
      const profileUpdateData = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
        website: profileData.website,
        bio: profileData.bio
      };
      
      // Try to update profile
      let updatedProfile;
      try {
        updatedProfile = await profileService.updateProfile(profileUpdateData);
      } catch (error) {
        console.warn('Profile update failed, using local update:', error);
        // If API fails, update locally
        updatedProfile = {
          ...user,
          ...profileUpdateData
        };
      }
      
      // Update user context
      if (updateUser) {
        updateUser(updatedProfile);
      }
      
      setSnackbar({
        open: true,
        message: t('profileProfileUpdatedSuccessfully'),
        severity: 'success',
      });
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || t('profileProfileUpdateFailed'),
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      try {
        await profileService.updateSettings(settings);
      } catch (error) {
        console.warn('Settings update failed, saving locally:', error);
        // If API fails, save locally
        localStorage.setItem('userSettings', JSON.stringify(settings));
      }
      
      setSnackbar({
        open: true,
        message: t('profileSettingsSavedSuccessfully'),
        severity: 'success',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || t('profileSettingsSaveFailed'),
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load profile data from API
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setInitialLoading(true);
        
        // Try to load profile data
        let profileData = {};
        let statistics = {};
        
        try {
          profileData = await profileService.getProfile();
        } catch (error) {
          console.warn('Could not load profile data:', error);
          // Use user data from context as fallback
          profileData = {
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            location: user?.location || '',
            website: user?.website || '',
            bio: user?.bio || '',
            profile_picture: user?.profile_picture || profileImage,
            date_joined: user?.date_joined || '',
            skills: user?.skills || [],
            education: user?.education || [],
            experience: user?.experience || [],
            is_verified: user?.is_verified || false
          };
        }
        
        try {
          statistics = await profileService.getStatistics();
        } catch (error) {
          console.warn('Could not load statistics:', error);
          // Use default statistics
          statistics = {
            coursesEnrolled: 0,
            coursesCompleted: 0,
            certificates: 0,
            lectures: 0
          };
        }
        
        setProfileData(prev => ({
          ...prev,
          ...profileData,
          ...statistics
        }));
      } catch (error) {
        console.error('Error loading profile data:', error);
        setSnackbar({
          open: true,
          message: t('profileLoadProfileDataFailed'),
          severity: 'error',
        });
      } finally {
        setInitialLoading(false);
      }
    };

    if (user) {
      loadProfileData();
    }
  }, [user]);

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false,
    }));
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setSnackbar({
        open: true,
        message: t('profileNewPasswordsDoNotMatch'),
        severity: 'error',
      });
      return;
    }

    if (passwordData.new_password.length < 8) {
      setSnackbar({
        open: true,
        message: t('profileNewPasswordMinLength'),
        severity: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      
      try {
        await profileService.changePassword(passwordData);
      } catch (error) {
        console.warn('Password change failed:', error);
        // Show specific error message
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.detail || 
                           t('profilePasswordChangeFailed');
        throw new Error(errorMessage);
      }
      
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      setSnackbar({
        open: true,
        message: t('profilePasswordChangedSuccessfully'),
        severity: 'success',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setSnackbar({
        open: true,
        message: error.message || t('profilePasswordChangeFailed'),
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSnackbar({
        open: true,
        message: t('profilePleaseSelectValidImageFile'),
        severity: 'error',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: t('profileImageSizeMustBeLessThan5MB'),
        severity: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      
      try {
        const result = await profileService.uploadProfilePicture(file);
        
        setProfileData(prev => ({
          ...prev,
          avatar: result.profile_picture
        }));
        
        // Update user context
        if (updateUser) {
          updateUser({ ...user, profile_picture: result.profile_picture });
        }
        
        setSnackbar({
          open: true,
          message: t('profileProfilePictureUpdatedSuccessfully'),
          severity: 'success',
        });
      } catch (error) {
        console.warn('Profile picture upload failed, using local preview:', error);
        // If API fails, create local preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setProfileData(prev => ({
            ...prev,
            avatar: e.target.result
          }));
        };
        reader.readAsDataURL(file);
        
        setSnackbar({
          open: true,
          message: t('profileProfilePictureUpdatedLocally'),
          severity: 'warning',
        });
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || t('profileProfilePictureUpdateFailed'),
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: t('profileEnrolledCourses'),
      value: profileData.coursesEnrolled || 0,
      icon: <SchoolIcon />,
      color: 'primary',
      gradient: 'linear-gradient(135deg, #667eea 0%, #333679 100%)'
    },
    {
      title: t('profileCompletedCourses'),
      value: profileData.coursesCompleted || 0,
      icon: <AssignmentIcon />,
      color: 'success',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      title: t('profileCertificates'),
      value: profileData.certificates || 0,
      icon: <AssessmentIcon />,
      color: 'warning',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      title: t('commonLectures'),
      value: profileData.lectures || 0,
      icon: <VideoCallIcon />,
      color: 'info',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
  ];

  // Show loading screen
  if (initialLoading) {
  return (
      <Container maxWidth="xl" sx={{ py: 4, direction: 'rtl' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh' 
        }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      direction: i18n.language === 'en' ? 'ltr' : 'rtl',
      width: '100%',
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box'
    }}>

                <Box sx={{ 
                  width: '100%',
                  maxWidth: '100%',
                  padding: { xs: 1, sm: 2, md: 3 },
                  boxSizing: 'border-box',
                  overflow: 'hidden'
                }}>
        {/* Single Block - All Profile Information */}
        <Slide direction="up" in timeout={1000}>
          <ProfileCard>
              <CardContent sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: { xs: 'flex-start', sm: 'center' }, 
                  mb: { xs: 2, sm: 3 },
                  pb: 1,
                  borderBottom: '2px solid',
                  borderColor: alpha('#333679', 0.1),
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1, sm: 0 }
                }}>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    color="#333679"
                    sx={{
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                      textAlign: { xs: 'center', sm: 'left' }
                    }}
                  >
                    {t('profilePersonalInfo')}
                  </Typography>
                  <Button 
                    variant={editMode ? "contained" : "outlined"} 
                    size="small"
                    sx={{
                      backgroundColor: editMode ? '#333679' : 'transparent',
                      color: editMode ? 'white' : '#333679',
                      borderColor: '#333679',
                      '&:hover': {
                        backgroundColor: editMode ? '#0a3d5f' : alpha('#333679', 0.1),
                      },
                      px: { xs: 1.5, sm: 2 },
                      py: { xs: 0.5, sm: 1 },
                      borderRadius: 2,
                      fontWeight: 'bold',
                      fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                      minWidth: { xs: '100%', sm: 'auto' },
                      '& .MuiButton-startIcon': {
                        marginLeft: { xs: 0.5, sm: 1 }
                      }
                    }}
                    startIcon={editMode ? <Save /> : <Edit />}
                    onClick={editMode ? handleSaveProfile : handleEditToggle}
                    disabled={loading}
                  >
                    {editMode ? t('profileSaveChanges') : t('profileEditProfile')}
                  </Button>
                </Box>

                <Box sx={{ 
                  display: 'flex !important', 
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: { xs: 2, sm: 3 },
                  width: '100%',
                  flex: 1
                }}>
                  {/* Left Side - Profile Picture Section (3/4 width) */}
                  <Box sx={{ 
                    flex: { xs: '1', md: '3' },
                    textAlign: 'center', 
                    p: { xs: 2, sm: 3 },
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha('#333679', 0.02)} 0%, ${alpha('#4DBFB3', 0.02)} 100%)`,
                    border: '1px solid',
                    borderColor: alpha('#333679', 0.08),
                    minHeight: { xs: 'auto', md: '400px' }
                  }}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight="bold" 
                      gutterBottom 
                      sx={{ 
                        mb: { xs: 2, sm: 3 }, 
                        color: '#333679',
                        fontSize: { xs: '1rem', sm: '1.1rem' }
                      }}
                    >
                      {t('profileProfilePicture')}
                    </Typography>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <Avatar 
                        src={profileData.avatar} 
                        alt={`${profileData.firstName} ${profileData.lastName}`}
                        sx={{ 
                          width: { xs: 120, sm: 150, md: 180 }, 
                          height: { xs: 120, sm: 150, md: 180 },
                          border: '4px solid',
                          borderColor: '#333679',
                          mb: { xs: 2, sm: 3 },
                          boxShadow: '0 8px 25px rgba(14, 81, 129, 0.2)'
                        }}
                      />
                      {editMode && (
                        <IconButton 
                          color="error"
                          sx={{
                            position: 'absolute',
                            top: { xs: -6, sm: -8 },
                            right: { xs: -6, sm: -8 },
                            backgroundColor: 'error.main',
                            color: 'white',
                            width: { xs: 24, sm: 32 },
                            height: { xs: 24, sm: 32 },
                            '&:hover': {
                              backgroundColor: 'error.dark',
                            },
                          }}
                          onClick={() => setProfileData(prev => ({ ...prev, avatar: profileImage }))}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    {editMode && (
                      <Button
                        variant="outlined"
                        startIcon={<PhotoCamera sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} />}
                        onClick={() => fileInputRef.current?.click()}
                        fullWidth
                        sx={{ 
                          mb: 2,
                          borderColor: '#333679',
                          color: '#333679',
                          fontSize: { xs: '0.8rem', sm: '0.9rem' },
                          py: { xs: 1, sm: 1.5 },
                          '&:hover': {
                            borderColor: '#0a3d5f',
                            backgroundColor: alpha('#333679', 0.05),
                          },
                          '& .MuiButton-startIcon': {
                            marginLeft: { xs: 0.5, sm: 1 }
                          }
                        }}
                      >
                        {t('profileUploadImage')}
                      </Button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleProfilePictureUpload}
                    />
                  </Box>
                  
                  {/* Right Side - Password Change Section (1/4 width) */}
                  <Box sx={{
                    flex: { xs: '1', md: '1' },
                    p: { xs: 2, sm: 3 },
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha('#333679', 0.02)} 0%, ${alpha('#4DBFB3', 0.02)} 100%)`,
                    border: '1px solid',
                    borderColor: alpha('#333679', 0.08),
                    minHeight: { xs: 'auto', md: '400px' }
                  }}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight="bold" 
                      gutterBottom 
                      sx={{ 
                        mb: { xs: 2, sm: 3 }, 
                        color: '#333679',
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }}
                    >
                      {t('profileChangePassword')}
                    </Typography>
                    <Stack spacing={1.5}>
                      <TextField
                        fullWidth
                        label={t('profileCurrentPassword')}
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        size="small"
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData(prev => ({
                          ...prev,
                          current_password: e.target.value
                        }))}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: alpha('#333679', 0.2),
                            },
                            '&:hover fieldset': {
                              borderColor: alpha('#333679', 0.4),
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#333679',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: { xs: '0.7rem', sm: '0.8rem' }
                          },
                          '& .MuiInputBase-input': {
                            fontSize: { xs: '0.7rem', sm: '0.8rem' }
                          }
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <IconButton 
                                size="small" 
                                onClick={() => setShowPassword(!showPassword)}
                                edge="start"
                                sx={{ color: '#333679' }}
                              >
                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        label={t('profileNewPassword')}
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        size="small"
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData(prev => ({
                          ...prev,
                          new_password: e.target.value
                        }))}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: alpha('#333679', 0.2),
                            },
                            '&:hover fieldset': {
                              borderColor: alpha('#333679', 0.4),
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#333679',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: { xs: '0.7rem', sm: '0.8rem' }
                          },
                          '& .MuiInputBase-input': {
                            fontSize: { xs: '0.7rem', sm: '0.8rem' }
                          }
                        }}
                      />
                      <TextField
                        fullWidth
                        label={t('profileConfirmPassword')}
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        size="small"
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData(prev => ({
                          ...prev,
                          confirm_password: e.target.value
                        }))}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: alpha('#333679', 0.2),
                            },
                            '&:hover fieldset': {
                              borderColor: alpha('#333679', 0.4),
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#333679',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: { xs: '0.7rem', sm: '0.8rem' }
                          },
                          '& .MuiInputBase-input': {
                            fontSize: { xs: '0.7rem', sm: '0.8rem' }
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={loading ? <CircularProgress size={16} /> : <Lock />}
                        onClick={handlePasswordChange}
                        disabled={loading}
                        sx={{
                          backgroundColor: '#333679',
                          '&:hover': {
                            backgroundColor: '#0a3d5f',
                          },
                          py: { xs: 1, sm: 1.2 },
                          borderRadius: 2,
                          fontWeight: 'bold',
                          fontSize: { xs: '0.7rem', sm: '0.8rem' },
                          '& .MuiButton-startIcon': {
                            marginLeft: { xs: 0.5, sm: 1 }
                          }
                        }}
                      >
                        {t('profileChangePassword')}
                      </Button>
                    </Stack>
                  </Box>
                </Box>

                 {/* Profile Information Section - Same Width as First Section */}
                 <Box sx={{ 
                   display: 'flex', 
                   flexDirection: 'column',
                   gap: { xs: 2, sm: 3 },
                   width: '100%',
                   mt: 3
                 }}>
                   {/* Profile Information Section */}
                   <Box sx={{
                     p: { xs: 2, sm: 3 },
                     borderRadius: 3,
                     background: `linear-gradient(135deg, ${alpha('#333679', 0.02)} 0%, ${alpha('#4DBFB3', 0.02)} 100%)`,
                     border: '1px solid',
                     borderColor: alpha('#333679', 0.08)
                   }}>
                      <Typography 
                        variant="subtitle1" 
                        fontWeight="bold" 
                        gutterBottom 
                        sx={{ 
                          mb: { xs: 2, sm: 3 }, 
                          color: '#333679',
                          fontSize: { xs: '1rem', sm: '1.1rem' }
                        }}
                      >
                        {t('profilePersonalInformation')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 1.5 }, flexWrap: 'nowrap' }}>
                        <TextField
                          fullWidth
                          label={t('profileUsername')}
                          name="username"
                          value={user?.username || ''}
                          variant="outlined"
                          size="small"
                          sx={{
                            flex: 1,
                            minWidth: { xs: '100%', md: '180px' },
                            '& .MuiOutlinedInput-root': {
                              height: '36px',
                              width: '100%',
                              '& fieldset': {
                                borderColor: alpha('#333679', 0.2),
                              },
                              '&:hover fieldset': {
                                borderColor: alpha('#333679', 0.4),
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#333679',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.7rem', sm: '0.8rem' }
                            },
                            '& .MuiInputBase-input': {
                              fontSize: { xs: '0.7rem', sm: '0.8rem' },
                              padding: '8px 12px'
                            }
                          }}
                          InputProps={{
                            readOnly: !editMode,
                          }}
                        />
                        <TextField
                          fullWidth
                          label={t('profileFirstName')}
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleProfileChange}
                          variant="outlined"
                          size="small"
                          sx={{
                            flex: 1,
                            minWidth: { xs: '100%', md: '180px' },
                            '& .MuiOutlinedInput-root': {
                              height: '36px',
                              width: '100%',
                              '& fieldset': {
                                borderColor: alpha('#333679', 0.2),
                              },
                              '&:hover fieldset': {
                                borderColor: alpha('#333679', 0.4),
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#333679',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.7rem', sm: '0.8rem' }
                            },
                            '& .MuiInputBase-input': {
                              fontSize: { xs: '0.7rem', sm: '0.8rem' },
                              padding: '8px 12px'
                            }
                          }}
                          InputProps={{
                            readOnly: !editMode,
                          }}
                        />
                        <TextField
                          fullWidth
                          label={t('profileRole')}
                          name="role"
                          value={getUserRole() === 'instructor' ? t('commonTeacher') : t('commonStudent')}
                          variant="outlined"
                          size="small"
                          sx={{
                            flex: 1,
                            minWidth: { xs: '100%', md: '180px' },
                            '& .MuiOutlinedInput-root': {
                              height: '36px',
                              width: '100%',
                              '& fieldset': {
                                borderColor: alpha('#333679', 0.2),
                              },
                              '&:hover fieldset': {
                                borderColor: alpha('#333679', 0.4),
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#333679',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.7rem', sm: '0.8rem' }
                            },
                            '& .MuiInputBase-input': {
                              fontSize: { xs: '0.7rem', sm: '0.8rem' },
                              padding: '8px 12px'
                            }
                          }}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                        <TextField
                          fullWidth
                          label={t('profileLastName')}
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleProfileChange}
                          variant="outlined"
                          size="small"
                          sx={{
                            flex: 1,
                            minWidth: { xs: '100%', md: '180px' },
                            '& .MuiOutlinedInput-root': {
                              height: '36px',
                              width: '100%',
                              '& fieldset': {
                                borderColor: alpha('#333679', 0.2),
                              },
                              '&:hover fieldset': {
                                borderColor: alpha('#333679', 0.4),
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#333679',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.7rem', sm: '0.8rem' }
                            },
                            '& .MuiInputBase-input': {
                              fontSize: { xs: '0.7rem', sm: '0.8rem' },
                              padding: '8px 12px'
                            }
                          }}
                          InputProps={{
                            readOnly: !editMode,
                          }}
                        />
                      </Box>
                   </Box>
                           
                   {/* Contact Info Section */}
                   <Box sx={{
                     p: { xs: 2, sm: 3 },
                     borderRadius: 3,
                     background: `linear-gradient(135deg, ${alpha('#333679', 0.02)} 0%, ${alpha('#4DBFB3', 0.02)} 100%)`,
                     border: '1px solid',
                     borderColor: alpha('#333679', 0.08)
                   }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 3, color: '#333679' }}>
                        {t('profileContactInfo')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 1.5 }, flexWrap: 'nowrap' }}>
                        <TextField
                          fullWidth
                          label={t('profileEmailRequired')}
                          name="email"
                          type="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          variant="outlined"
                          size="small"
                          sx={{
                            flex: 1,
                            minWidth: { xs: '100%', md: '180px' },
                            '& .MuiOutlinedInput-root': {
                              height: '36px',
                              width: '100%',
                              '& fieldset': {
                                borderColor: alpha('#333679', 0.2),
                              },
                              '&:hover fieldset': {
                                borderColor: alpha('#333679', 0.4),
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#333679',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.7rem', sm: '0.8rem' }
                            },
                            '& .MuiInputBase-input': {
                              fontSize: { xs: '0.7rem', sm: '0.8rem' },
                              padding: '8px 12px'
                            }
                          }}
                          InputProps={{
                            readOnly: !editMode,
                          }}
                        />
                        <TextField
                          fullWidth
                          label={t('profileWhatsapp')}
                          name="whatsapp"
                          value={profileData.whatsapp || ''}
                          onChange={handleProfileChange}
                          variant="outlined"
                          size="small"
                          sx={{
                            flex: 1,
                            minWidth: { xs: '100%', md: '180px' },
                            '& .MuiOutlinedInput-root': {
                              height: '36px',
                              width: '100%',
                              '& fieldset': {
                                borderColor: alpha('#333679', 0.2),
                              },
                              '&:hover fieldset': {
                                borderColor: alpha('#333679', 0.4),
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#333679',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.7rem', sm: '0.8rem' }
                            },
                            '& .MuiInputBase-input': {
                              fontSize: { xs: '0.7rem', sm: '0.8rem' },
                              padding: '8px 12px'
                            }
                          }}
                          InputProps={{
                            readOnly: !editMode,
                          }}
                        />
                        <TextField
                          fullWidth
                          label={t('profileWebsite')}
                          name="website"
                          value={profileData.website}
                          onChange={handleProfileChange}
                          variant="outlined"
                          size="small"
                          sx={{
                            flex: 1,
                            minWidth: { xs: '100%', md: '180px' },
                            '& .MuiOutlinedInput-root': {
                              height: '36px',
                              width: '100%',
                              '& fieldset': {
                                borderColor: alpha('#333679', 0.2),
                              },
                              '&:hover fieldset': {
                                borderColor: alpha('#333679', 0.4),
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#333679',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.7rem', sm: '0.8rem' }
                            },
                            '& .MuiInputBase-input': {
                              fontSize: { xs: '0.7rem', sm: '0.8rem' },
                              padding: '8px 12px'
                            }
                          }}
                          InputProps={{
                            readOnly: !editMode,
                          }}
                        />
                        <TextField
                          fullWidth
                          label={t('profilePhone')}
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          variant="outlined"
                          size="small"
                          sx={{
                            flex: 1,
                            minWidth: { xs: '100%', md: '180px' },
                            '& .MuiOutlinedInput-root': {
                              height: '36px',
                              width: '100%',
                              '& fieldset': {
                                borderColor: alpha('#333679', 0.2),
                              },
                              '&:hover fieldset': {
                                borderColor: alpha('#333679', 0.4),
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#333679',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.7rem', sm: '0.8rem' }
                            },
                            '& .MuiInputBase-input': {
                              fontSize: { xs: '0.7rem', sm: '0.8rem' },
                              padding: '8px 12px'
                            }
                          }}
                          InputProps={{
                            readOnly: !editMode,
                          }}
                        />
                      </Box>
                   </Box>
 
                   {/* About User Section */}
                   <Box sx={{
                     p: { xs: 2, sm: 3 },
                     borderRadius: 3,
                     background: `linear-gradient(135deg, ${alpha('#333679', 0.02)} 0%, ${alpha('#4DBFB3', 0.02)} 100%)`,
                     border: '1px solid',
                     borderColor: alpha('#333679', 0.08)
                   }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 3, color: '#333679' }}>
                        {t('profileAboutUser')}
                      </Typography>
                      <TextField
                        fullWidth
                        label={t('profileBioInfo')}
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        multiline
                        rows={4}
                        variant="outlined"
                        size="small"
                        placeholder={t('profileBioPlaceholder')}
                        sx={{
                          flex: 1,
                          minWidth: { xs: '100%', md: '200px' },
                          '& .MuiOutlinedInput-root': {
                            width: '100%',
                            '& fieldset': {
                              borderColor: alpha('#333679', 0.2),
                            },
                            '&:hover fieldset': {
                              borderColor: alpha('#333679', 0.4),
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#333679',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: { xs: '0.7rem', sm: '0.8rem' }
                          },
                          '& .MuiInputBase-input': {
                            fontSize: { xs: '0.7rem', sm: '0.8rem' },
                            padding: '8px 12px'
                          }
                        }}
                        InputProps={{
                          readOnly: !editMode,
                        }}
                      />
                   </Box>
                 </Box>
            </CardContent>
          </ProfileCard>
        </Slide>
      </Box>


      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ direction: i18n.language === 'en' ? 'ltr' : 'rtl' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;