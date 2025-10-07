import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { register } from '../../store/slices/authSlice';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Grid,
  Fade,
  StepLabel,
  StepContent,
  Stepper,
  Step,
  StepButton,
  Zoom,
  Slide,
  Divider,
  Avatar,
  useTheme,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  School as SchoolIcon, 
  PersonOutline as PersonIcon,
  LockOutlined as LockIcon,
  EmailOutlined as EmailIcon,
  Phone as PhoneIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Person as PersonIcon2,
  Work as WorkIcon,
  Business as BusinessIcon,
  AccountBalance as AccountBalanceIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(98,0,238,0.4); }
  70% { box-shadow: 0 0 0 10px rgba(98,0,238,0); }
  100% { box-shadow: 0 0 0 0 rgba(98,0,238,0); }
`;

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  padding: theme.spacing(3),
}));

const RegisterContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  overflow: 'hidden',
  maxWidth: 1100,
  width: '100%',
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: theme.shadows[10],
  position: 'relative',
  zIndex: 1,
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, #6200ee 0%, #03dac6 100%)',
    zIndex: -1,
    transform: 'skewY(-5deg)',
    opacity: 0.1,
  },
}));

const LeftPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(8, 4),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'linear-gradient(135deg, #6200ee 0%, #3700b3 100%)',
  color: theme.palette.common.white,
  textAlign: 'center',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const RightPanel = styled(Box)(({ theme }) => ({
  flex: 1.5,
  padding: theme.spacing(6, 5),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.paper,
  overflowY: 'auto',
  maxHeight: '90vh',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4, 3),
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: theme.palette.primary.main,
  width: 70,
  height: 70,
  marginBottom: theme.spacing(2),
  animation: `${pulse} 2s infinite`,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  padding: theme.spacing(1.5),
  borderRadius: 50,
  fontWeight: 600,
  letterSpacing: 0.5,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: '0 4px 14px 0 rgba(98, 0, 238, 0.2)',
  '&:hover': {
    boxShadow: '0 6px 20px 0 rgba(98, 0, 238, 0.3)',
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease',
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  margin: theme.spacing(0, 1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const FloatingIcon = styled('div')(({ theme }) => ({
  position: 'absolute',
  color: 'rgba(255, 255, 255, 0.05)',
  fontSize: '10rem',
  zIndex: 0,
  '&:nth-of-type(1)': {
    top: '10%',
    left: '10%',
    animation: `${float} 6s ease-in-out infinite`,
  },
  '&:nth-of-type(2)': {
    bottom: '10%',
    right: '10%',
    animation: `${float} 7s ease-in-out infinite`,
    animationDelay: '0.5s',
  },
}));

const StepIndicator = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active',
})(({ theme, active }) => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  backgroundColor: active ? theme.palette.primary.main : theme.palette.grey[300],
  color: active ? '#fff' : theme.palette.text.secondary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 8,
  fontWeight: 600,
  fontSize: '0.875rem',
  transition: 'all 0.3s ease',
}));

const StyledStepLabel = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'active',
})(({ theme, active }) => ({
  color: active ? theme.palette.text.primary : theme.palette.text.secondary,
  fontWeight: active ? 600 : 400,
  fontSize: '0.875rem',
  transition: 'all 0.3s ease',
}));

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'Student',
    acceptTerms: false,
    // Additional fields for organization/instructor
    organizationName: '',
    bio: '',
    website: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
    
    if (error) setError('');
  };
  
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const validateStep = (step) => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = t('authFirstNameRequired');
      if (!formData.lastName.trim()) newErrors.lastName = t('authLastNameRequired');
      if (!formData.email) {
        newErrors.email = t('authEmailRequired');
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = t('authEmailInvalid');
      }
      if (!formData.phone) {
        newErrors.phone = t('authPhoneRequired');
      }
    } else if (step === 2) {
      if (!formData.password) {
        newErrors.password = t('authPasswordRequired');
      } else if (formData.password.length < 8) {
        newErrors.password = t('authPasswordMinLength');
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = t('authConfirmPasswordRequired');
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t('authPasswordsDoNotMatch');
      }
      
      if (formData.userType === 'Organization' && !formData.organizationName) {
        newErrors.organizationName = t('authOrganizationNameRequired');
      }
    } else if (step === 3) {
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = t('authAcceptTermsRequired');
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validate = () => {
    // Validate all steps before submission
    const isStep1Valid = validateStep(1);
    const isStep2Valid = validateStep(2);
    const isStep3Valid = validateStep(3);
    
    if (!isStep1Valid) setCurrentStep(1);
    else if (!isStep2Valid) setCurrentStep(2);
    else if (!isStep3Valid) setCurrentStep(3);
    
    return isStep1Valid && isStep2Valid && isStep3Valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Prepare user data according to the backend API structure
      const userData = {
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone || '',
        status: formData.userType === 'Instructor' ? 'Instructor' : 'Student',
        ...(formData.userType === 'Instructor' && {
          bio: formData.bio || '',
          qualification: formData.qualification || ''
        })
      };
      
      // Dispatch register action
      const resultAction = await dispatch(register(userData));
      
      if (register.fulfilled.match(resultAction)) {
        // Registration successful - redirect to dashboard or login
        const userRole = resultAction.payload?.profile?.status?.toLowerCase() || 'student';
        
        if (userRole === 'instructor') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else if (register.rejected.match(resultAction)) {
        // Handle error from the auth slice
        const errorMessage = resultAction.error || 'فشل في إنشاء الحساب. يرجى المحاولة مرة أخرى.';
        setError(errorMessage);
      }
      
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.message || 'فشل في إنشاء الحساب. يرجى المحاولة مرة أخرى.');
      
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  };
  
  const handleSocialLogin = (provider) => {
    // Handle social login
    console.log(`Logging in with ${provider}`);
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StepIndicator active={currentStep >= step}>
                {currentStep > step ? <CheckCircleIcon fontSize="small" /> : step}
              </StepIndicator>
              <StyledStepLabel active={currentStep >= step}>
                {step === 1 ? t('authAccount') : step === 2 ? t('authPassword') : t('authFinish')}
              </StyledStepLabel>
            </Box>
            {step < 3 && (
              <Box 
                sx={{ 
                  width: 40, 
                  height: 2, 
                  backgroundColor: currentStep > step ? theme.palette.primary.main : theme.palette.grey[300],
                  mx: 1,
                  transition: 'all 0.3s ease',
                }} 
              />
            )}
          </React.Fragment>
        ))}
      </Box>
      
      <Box sx={{ width: '100%', height: 4, backgroundColor: theme.palette.grey[200], borderRadius: 2, overflow: 'hidden' }}>
        <Box 
          sx={{ 
            width: `${(currentStep / 3) * 100}%`, 
            height: '100%', 
            backgroundColor: theme.palette.primary.main,
            transition: 'width 0.3s ease',
          }} 
        />
      </Box>
    </Box>
  );

  // Render step content
  const renderStepContent = (step) => {
    switch (step) {
      case 1:
        return (
          <Fade in={true} timeout={300}>
            <Box>
              <Typography variant="h6" sx={{ mb: 3, color: theme.palette.text.primary, fontWeight: 600 }}>
                {t('authPersonalInfo')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete="given-name"
                    name="firstName"
                    required
                    fullWidth
                    id="firstName"
                    label={t('authFirstName')}
                    autoFocus
                    value={formData.firstName}
                    onChange={handleChange}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon2 color={errors.firstName ? 'error' : 'action'} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label={t('authLastName')}
                    name="lastName"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon2 color={errors.lastName ? 'error' : 'action'} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
              </Grid>
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label={t('authEmail')}
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color={errors.email ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="phone"
                label={t('authPhone')}
                name="phone"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color={errors.phone ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              
              <FormControl 
                fullWidth 
                margin="normal" 
                error={!!errors.userType}
                sx={{ mb: 3 }}
              >
                <InputLabel id="user-type-label">{t('authIAm')}</InputLabel>
                <Select
                  labelId="user-type-label"
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  label={t('authIAm')}
                  onChange={handleChange}
                  disabled={isLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                >
                  <MenuItem value="Student">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <span>{t('authStudent')}</span>
                    </Box>
                  </MenuItem>
                  {/* <MenuItem value="Instructor">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <span>مدرس</span>
                    </Box>
                  </MenuItem>
                  <MenuItem value="Organization">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <span>مؤسسة</span>
                    </Box>
                  </MenuItem> */}
                </Select>
                {errors.userType && <FormHelperText>{errors.userType}</FormHelperText>}
              </FormControl>
              
              {formData.userType === 'Organization' && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="organizationName"
                  label="اسم المؤسسة"
                  placeholder="أدخل اسم المؤسسة"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  error={!!errors.organizationName}
                  helperText={errors.organizationName}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon color={errors.organizationName ? 'error' : 'action'} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              )}
              
              {formData.userType === 'Instructor' && (
                <TextField
                  margin="normal"
                  fullWidth
                  multiline
                  rows={3}
                  id="bio"
                  label="نبذة قصيرة"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  error={!!errors.bio}
                  helperText={errors.bio || 'أخبرنا المزيد عن نفسك وخبراتك'}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <InfoIcon color={errors.bio ? 'error' : 'action'} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      alignItems: 'flex-start',
                    },
                  }}
                />
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={nextStep}
                  disabled={isLoading}
                  sx={{
                    borderRadius: 50,
                    px: 4,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #6200ee 0%, #7c4dff 100%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #7c4dff 0%, #6200ee 100%)',
                    },
                  }}
                >
                  {t('commonNext')}
                </Button>
              </Box>
            </Box>
          </Fade>
        );
      
      case 2:
        return (
          <Fade in={true} timeout={300}>
            <Box>
              <Typography variant="h6" sx={{ mb: 3, color: theme.palette.text.primary, fontWeight: 600 }}>
                {t('authCreatePassword')}
              </Typography>
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label={t('authPassword')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password || t('authPasswordHint')}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color={errors.password ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={t('authTogglePassword')}
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        sx={{
                          color: theme.palette.text.secondary,
                          '&:hover': {
                            color: theme.palette.primary.main,
                            backgroundColor: 'transparent',
                          },
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label={t('authConfirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color={errors.confirmPassword ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={t('authToggleConfirmPassword')}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size="small"
                        sx={{
                          color: theme.palette.text.secondary,
                          '&:hover': {
                            color: theme.palette.primary.main,
                            backgroundColor: 'transparent',
                          },
                        }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={prevStep}
                  disabled={isLoading}
                  sx={{
                    borderRadius: 50,
                    px: 4,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      backgroundColor: 'rgba(98, 0, 238, 0.04)',
                    },
                  }}
                >
                  {t('commonBack')}
                </Button>
                <Button
                  variant="contained"
                  onClick={nextStep}
                  disabled={isLoading}
                  sx={{
                    borderRadius: 50,
                    px: 4,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #6200ee 0%, #7c4dff 100%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #7c4dff 0%, #6200ee 100%)',
                    },
                  }}
                >
                  {t('commonNext')}
                </Button>
              </Box>
            </Box>
          </Fade>
        );
      
      case 3:
        return (
          <Fade in={true} timeout={300}>
            <Box>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <CheckCircleIcon 
                  sx={{ 
                    fontSize: 60, 
                    color: theme.palette.success.main, 
                    mb: 2,
                    animation: `${pulse} 2s infinite` 
                  }} 
                />
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary, fontWeight: 600 }}>
                  أنت على وشك الانتهاء!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  يرجى مراجعة معلوماتك وقبول الشروط والأحكام لإكمال تسجيلك.
                </Typography>
              </Box>
              
              <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                  معلومات الحساب
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>الاسم الكامل</Typography>
                  <Typography variant="body1">{`${formData.firstName} ${formData.lastName}`}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>البريد الإلكتروني</Typography>
                  <Typography variant="body1">{formData.email}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>رقم الهاتف</Typography>
                  <Typography variant="body1">{formData.phone}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>نوع الحساب</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    {formData.userType === 'Student' && <SchoolIcon color="primary" sx={{ mr: 1 }} />}
                    {formData.userType === 'Instructor' && <WorkIcon color="primary" sx={{ mr: 1 }} />}
                    {formData.userType === 'Organization' && <BusinessIcon color="primary" sx={{ mr: 1 }} />}
                    <Typography variant="body1">{formData.userType}</Typography>
                  </Box>
                </Box>
                
                {formData.userType === 'Organization' && formData.organizationName && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                      تفاصيل المؤسسة
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>اسم المؤسسة</Typography>
                      <Typography variant="body1">{formData.organizationName}</Typography>
                    </Box>
                  </Box>
                )}
                
                {formData.userType === 'Instructor' && formData.bio && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                      نبذة عن المدرس
                    </Typography>
                    <Typography variant="body2">{formData.bio}</Typography>
                  </Box>
                )}
              </Paper>
              
              <FormControl 
                required 
                error={!!errors.acceptTerms}
                component="fieldset" 
                variant="standard"
                sx={{ width: '100%', mb: 3 }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      name="acceptTerms"
                      color="primary"
                      disabled={isLoading}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      أوافق على{' '}
                      <Link href="/terms" target="_blank" rel="noopener" sx={{ textDecoration: 'none' }}>
                        شروط الخدمة
                      </Link>{' '}
                      و{' '}
                      <Link href="/privacy" target="_blank" rel="noopener" sx={{ textDecoration: 'none' }}>
                        سياسة الخصوصية
                      </Link>
                    </Typography>
                  }
                />
                {errors.acceptTerms && (
                  <FormHelperText>{errors.acceptTerms}</FormHelperText>
                )}
              </FormControl>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={prevStep}
                  disabled={isLoading}
                  sx={{
                    borderRadius: 50,
                    px: 4,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      backgroundColor: 'rgba(98, 0, 238, 0.04)',
                    },
                  }}
                >
                  {t('commonBack')}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    borderRadius: 50,
                    px: 4,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #6200ee 0%, #7c4dff 100%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #7c4dff 0%, #6200ee 100%)',
                    },
                    '&.Mui-disabled': {
                      background: theme.palette.grey[300],
                      color: theme.palette.grey[500],
                    },
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'إنشاء حساب'
                  )}
                </Button>
              </Box>
            </Box>
          </Fade>
        );
      
      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
      <RegisterContainer>
        {/* Left Panel - Welcome Section */}
        <LeftPanel>
          <FloatingIcon>
            <SchoolIcon sx={{ fontSize: 'inherit' }} />
          </FloatingIcon>
          <FloatingIcon>
            <WorkIcon sx={{ fontSize: 'inherit' }} />
          </FloatingIcon>
          
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', px: 4 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 700, letterSpacing: '0.5px' }}>
انضم إلى مجتمعنا التعليمي
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, lineHeight: 1.7 }}>
أنشئ حسابك واحصل على الوصول إلى آلاف الدورات والمعلمين والمؤسسات.
            </Typography>
            
            <Box sx={{ width: '100%', maxWidth: 300, mx: 'auto', mb: 4 }}>
              <img 
                src="/images/register-illustration.svg" 
                alt="Learning illustration" 
                style={{ width: '100%', height: 'auto' }}
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.style.display = 'none';
                }}
              />
            </Box>
            
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
هل لديك حساب بالفعل؟
            </Typography>
            <Button 
              component={RouterLink}
              to="/login"
              variant="outlined"
              color="inherit"
              sx={{
                borderRadius: 50,
                px: 4,
                py: 1,
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
تسجيل الدخول
            </Button>
          </Box>
        </LeftPanel>
        
        {/* Right Panel - Registration Form */}
        <RightPanel>
          <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto' }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <StyledAvatar>
                <LockIcon />
              </StyledAvatar>
              <Typography component="h1" variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
إنشاء حساب
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
الخطوة {currentStep} من 3
              </Typography>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              {renderStepIndicator()}
              {renderStepContent(currentStep)}
            </Box>
            
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
أو سجل باستخدام
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <SocialButton 
                  aria-label="Google" 
                  onClick={() => handleSocialLogin('google')}
                  sx={{ '&:hover': { color: '#DB4437' } }}
                >
                  <GoogleIcon />
                </SocialButton>
                <SocialButton 
                  aria-label="Facebook" 
                  onClick={() => handleSocialLogin('facebook')}
                  sx={{ '&:hover': { color: '#4267B2' } }}
                >
                  <FacebookIcon />
                </SocialButton>
                <SocialButton 
                  aria-label="Twitter" 
                  onClick={() => handleSocialLogin('twitter')}
                  sx={{ '&:hover': { color: '#1DA1F2' } }}
                >
                  <TwitterIcon />
                </SocialButton>
              </Box>
            </Box>
            
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                By creating an account, you agree to our{' '}
                <Link href="/terms" target="_blank" rel="noopener" color="primary">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" target="_blank" rel="noopener" color="primary">
                  Privacy Policy
                </Link>
                .
              </Typography>
            </Box>
          </Box>
        </RightPanel>
      </RegisterContainer>
    </Container>
  );
};

export default Register;
