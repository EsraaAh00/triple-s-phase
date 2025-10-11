import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Email, 
  Phone, 
  LocationOn,
  Send
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PageBanner from '../components/common/PageBanner';
import axios from 'axios';

const PageContainer = styled(Box)({
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
});

const ContentSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 0),
  background: 'linear-gradient(135deg, rgba(102, 51, 153, 0.02) 0%, rgba(85, 34, 136, 0.05) 100%)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(6, 0),
  },
}));

const InfoCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(102, 51, 153, 0.12)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid rgba(102, 51, 153, 0.1)',
  background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #663399 0%, #552288 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 16px 48px rgba(102, 51, 153, 0.2)',
    '&::before': {
      opacity: 1,
    },
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #663399 0%, #552288 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  boxShadow: '0 8px 24px rgba(102, 51, 153, 0.25)',
  transition: 'all 0.3s ease',
  '& .MuiSvgIcon-root': {
    fontSize: '2.5rem',
    color: '#ffffff',
  },
  '.InfoCard:hover &': {
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: '0 12px 32px rgba(102, 51, 153, 0.35)',
  },
}));

const ContactUs = () => {
  const { t, i18n } = useTranslation();
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Helper function to get localized text
  const getLocalizedText = (enText, arText) => {
    const currentLang = i18n.language || 'en';
    if (currentLang === 'ar' && arText) {
      return arText;
    }
    return enText;
  };

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/extras/contact-info/latest/`);
        setContactInfo(response.data);
      } catch (error) {
        console.error('Error fetching contact info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/extras/contact-messages/`,
        formData
      );
      
      if (response.data.success) {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitError(t('contactUsSubmitError') || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitError(
        error.response?.data?.message || 
        t('contactUsSubmitError') || 
        'Failed to send message. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <PageContainer>
        <PageBanner
          title={t('contactUsTitle') || 'Contact Us'}
          subtitle={t('contactUsSubtitle') || 'Get in touch with us'}
          breadcrumbs={[
            { label: t('commonHome') || 'Home', link: '/' },
            { label: t('contactUsTitle') || 'Contact Us' }
          ]}
        />

        <ContentSection>
          <Container maxWidth="lg">
            {/* Alerts */}
            {submitSuccess && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                {t('contactUsSubmitSuccess') || 'Your message has been sent successfully!'}
              </Alert>
            )}

            {submitError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {submitError}
              </Alert>
            )}

            {/* Contact Information Cards */}
            {loading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress size={60} sx={{ color: '#663399' }} />
              </Box>
            ) : contactInfo ? (
              <Grid container spacing={4} sx={{ mb: 8, justifyContent: 'center' }}>
                {contactInfo.email && (
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoCard sx={{ 
                      height: '300px', 
                      width: '350px',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <CardContent sx={{ 
                        textAlign: 'center', 
                        py: 4, 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <IconWrapper>
                          <Email />
                        </IconWrapper>
                        <Typography variant="h5" gutterBottom fontWeight={700} sx={{ color: '#333', mb: 2 }}>
                          {t('contactUsEmail') || 'Email'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem', fontWeight: 500, wordBreak: 'break-word', textAlign: 'center' }}>
                          {contactInfo.email}
                        </Typography>
                      </CardContent>
                    </InfoCard>
                  </Grid>
                )}

                {contactInfo.phone && (
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoCard sx={{ 
                      height: '300px', 
                      width: '350px',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <CardContent sx={{ 
                        textAlign: 'center', 
                        py: 4, 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <IconWrapper>
                          <Phone />
                        </IconWrapper>
                        <Typography variant="h5" gutterBottom fontWeight={700} sx={{ color: '#333', mb: 2 }}>
                          {t('contactUsPhone') || 'Phone'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem', fontWeight: 500, wordBreak: 'break-word', textAlign: 'center' }}>
                          {contactInfo.phone}
                        </Typography>
                      </CardContent>
                    </InfoCard>
                  </Grid>
                )}

                {(contactInfo.address || contactInfo.address_ar) && (
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoCard sx={{ 
                      height: '300px', 
                      width: '350px',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <CardContent sx={{ 
                        textAlign: 'center', 
                        py: 4, 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <IconWrapper>
                          <LocationOn />
                        </IconWrapper>
                        <Typography variant="h5" gutterBottom fontWeight={700} sx={{ color: '#333', mb: 2 }}>
                          {t('contactUsAddress') || 'Address'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem', fontWeight: 500, lineHeight: 1.6, wordBreak: 'break-word', textAlign: 'center' }}>
                          {getLocalizedText(contactInfo.address, contactInfo.address_ar)}
                        </Typography>
                      </CardContent>
                    </InfoCard>
                  </Grid>
                )}
              </Grid>
            ) : (
              <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
                {t('contactUsNoInfo') || 'Contact information not available'}
              </Alert>
            )}

            {/* Contact Form */}
            <InfoCard sx={{ maxWidth: '1000px', mx: 'auto', borderRadius: '24px' }}>
              <CardContent sx={{ p: { xs: 4, sm: 5, md: 6 } }}>
                {/* Form Header */}
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                  <Typography 
                    variant="h3" 
                    gutterBottom 
                    fontWeight={800} 
                    sx={{
                      background: 'linear-gradient(135deg, #663399 0%, #552288 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2,
                      fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
                    }}
                  >
                    {t('contactUsSendMessage') || 'Send us a Message'}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ fontSize: '1.1rem', maxWidth: '600px', mx: 'auto' }}>
                    {t('contactUsFormDesc') || 'Fill out the form below and we will get back to you as soon as possible'}
                  </Typography>
                </Box>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={5}>
                    {/* Row 1: Name & Email جنب بعض */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('contactUsName') || 'Name'}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        placeholder="Enter your full name"
                        sx={{
                          width: '430px',
                          mb: 3,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '16px',
                            backgroundColor: 'rgba(102, 51, 153, 0.02)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(102, 51, 153, 0.05)',
                            },
                            '&.Mui-focused': {
                              backgroundColor: '#ffffff',
                              boxShadow: '0 4px 16px rgba(102, 51, 153, 0.12)',
                              '& fieldset': {
                                borderColor: '#663399',
                                borderWidth: '2px',
                              },
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#663399',
                            fontWeight: 600,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('contactUsEmail') || 'Email'}
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        placeholder="your.email@example.com"
                        sx={{
                          width: '430px',
                          mb: 3,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '16px',
                            backgroundColor: 'rgba(102, 51, 153, 0.02)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(102, 51, 153, 0.05)',
                            },
                            '&.Mui-focused': {
                              backgroundColor: '#ffffff',
                              boxShadow: '0 4px 16px rgba(102, 51, 153, 0.12)',
                              '& fieldset': {
                                borderColor: '#663399',
                                borderWidth: '2px',
                              },
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#663399',
                            fontWeight: 600,
                          },
                        }}
                      />
                    </Grid>
                    
                    {/* Row 2: Phone & Subject جنب بعض */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('contactUsPhone') || 'Phone'}
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="+1 (555) 000-0000"
                        sx={{
                          width: '430px',
                          mb: 3,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '16px',
                            backgroundColor: 'rgba(102, 51, 153, 0.02)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(102, 51, 153, 0.05)',
                            },
                            '&.Mui-focused': {
                              backgroundColor: '#ffffff',
                              boxShadow: '0 4px 16px rgba(102, 51, 153, 0.12)',
                              '& fieldset': {
                                borderColor: '#663399',
                                borderWidth: '2px',
                              },
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#663399',
                            fontWeight: 600,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('contactUsSubject') || 'Subject'}
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        placeholder="What is this regarding?"
                        sx={{
                          width: '430px',
                          mb: 3,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '16px',
                            backgroundColor: 'rgba(102, 51, 153, 0.02)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(102, 51, 153, 0.05)',
                            },
                            '&.Mui-focused': {
                              backgroundColor: '#ffffff',
                              boxShadow: '0 4px 16px rgba(102, 51, 153, 0.12)',
                              '& fieldset': {
                                borderColor: '#663399',
                                borderWidth: '2px',
                              },
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#663399',
                            fontWeight: 600,
                          },
                        }}
                      />
                    </Grid>
                    
                    {/* Row 3: Message بعرض كامل */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label={t('contactUsMessage') || 'Message'}
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        multiline
                        rows={6}
                        variant="outlined"
                        placeholder="Tell us more about your inquiry..."
                        sx={{
                          width: '870px',
                          height: '200px',
                          mb: 4,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '16px',
                            alignItems: 'flex-start',
                            backgroundColor: 'rgba(102, 51, 153, 0.02)',
                            transition: 'all 0.3s ease',
                            width: '870px',
                            height: '200px',
                            '&:hover': {
                              backgroundColor: 'rgba(102, 51, 153, 0.05)',
                            },
                            '&.Mui-focused': {
                              backgroundColor: '#ffffff',
                              boxShadow: '0 4px 16px rgba(102, 51, 153, 0.12)',
                              '& fieldset': {
                                borderColor: '#663399',
                                borderWidth: '2px',
                              },
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#663399',
                            fontWeight: 600,
                          },
                        }}
                      />
                    </Grid>
                    
                    {/* Row 4: Button تحت الرسالة مباشرة */}
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={submitting}
                        endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                        sx={{
                          py: 3,
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          borderRadius: '16px',
                          textTransform: 'none',
                          background: 'linear-gradient(135deg, #663399 0%, #552288 100%)',
                          boxShadow: '0 8px 32px rgba(102, 51, 153, 0.3)',
                          transition: 'all 0.3s ease',
                          width: '100%',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #552288 0%, #441177 100%)',
                            transform: 'translateY(-3px)',
                            boxShadow: '0 12px 40px rgba(102, 51, 153, 0.4)',
                          },
                          '&.Mui-disabled': {
                            background: 'linear-gradient(135deg, #999 0%, #777 100%)',
                            color: '#fff',
                          },
                        }}
                      >
                        {submitting ? (t('contactUsSending') || 'Sending...') : (t('contactUsSendButton') || 'Send Message')}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </InfoCard>
          </Container>
        </ContentSection>
      </PageContainer>
      <Footer />
    </>
  );
};

export default ContactUs;
