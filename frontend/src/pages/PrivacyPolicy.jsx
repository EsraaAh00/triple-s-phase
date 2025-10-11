import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { Security } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PageBanner from '../components/common/PageBanner';
import axios from 'axios';

const PageContainer = styled(Box)({
  minHeight: '100vh',
  backgroundColor: '#f8f9fa',
});

const ContentSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6, 0),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4, 0),
  },
}));

const ContentCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  backgroundColor: 'rgba(102, 51, 153, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  '& .MuiSvgIcon-root': {
    fontSize: '3rem',
    color: '#663399',
  },
}));

const PrivacyPolicy = () => {
  const { t, i18n } = useTranslation();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to get localized text
  const getLocalizedText = (enText, arText) => {
    const currentLang = i18n.language || 'en';
    if (currentLang === 'ar' && arText) {
      return arText;
    }
    return enText;
  };

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/extras/privacy-policy/latest/`);
        setPolicy(response.data);
      } catch (error) {
        console.error('Error fetching privacy policy:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, []);

  return (
    <>
      <Header />
      <PageContainer>
        <PageBanner
          title={t('privacyPolicyTitle') || 'Privacy Policy'}
          subtitle={t('privacyPolicySubtitle') || 'How we protect your data'}
          breadcrumbs={[
            { label: t('commonHome') || 'Home', link: '/' },
            { label: t('privacyPolicyTitle') || 'Privacy Policy' }
          ]}
        />

        <ContentSection>
          <Container maxWidth="md">
            {loading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress size={60} sx={{ color: '#663399' }} />
              </Box>
            ) : policy ? (
              <ContentCard>
                <CardContent sx={{ p: 4 }}>
                  <IconWrapper>
                    <Security />
                  </IconWrapper>
                  
                  <Typography 
                    variant="h4" 
                    align="center" 
                    gutterBottom 
                    fontWeight={700}
                    color="#663399"
                    sx={{ mb: 3 }}
                  >
                    {getLocalizedText(policy.title, policy.title_ar)}
                  </Typography>

                  <Divider sx={{ mb: 4 }} />

                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    sx={{ 
                      lineHeight: 1.8,
                      whiteSpace: 'pre-wrap',
                      fontSize: '1.05rem'
                    }}
                  >
                    {getLocalizedText(policy.content, policy.content_ar)}
                  </Typography>

                  {policy.updated_at && (
                    <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
                      <Typography variant="caption" color="text.secondary">
                        {t('privacyPolicyLastUpdated') || 'Last Updated'}: {new Date(policy.updated_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </ContentCard>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                {t('privacyPolicyNotAvailable') || 'Privacy Policy is not available at the moment.'}
              </Alert>
            )}
          </Container>
        </ContentSection>
      </PageContainer>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;

