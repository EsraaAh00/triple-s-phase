import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert
} from '@mui/material';
import { ExpandMore, HelpOutline } from '@mui/icons-material';
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

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: '12px !important',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: `${theme.spacing(2, 0)} !important`,
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  borderRadius: '12px',
  '&.Mui-expanded': {
    backgroundColor: 'rgba(102, 51, 153, 0.05)',
  },
  '& .MuiAccordionSummary-content': {
    margin: theme.spacing(2, 0),
  },
}));

const FAQ = () => {
  const { t, i18n } = useTranslation();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  // Helper function to get localized text
  const getLocalizedText = (enText, arText) => {
    const currentLang = i18n.language || 'en';
    if (currentLang === 'ar' && arText) {
      return arText;
    }
    return enText;
  };

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'https://admin.triplesacademy.com'}/api/extras/refunding-faq/latest/`);
        setFaqs(response.data || []);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <>
      <Header />
      <PageContainer>
        <PageBanner
          title={t('faqTitle') || 'Frequently Asked Questions'}
          subtitle={t('faqSubtitle') || 'Find answers to common questions'}
          breadcrumbs={[
            { label: t('commonHome') || 'Home', link: '/' },
            { label: t('faqTitle') || 'FAQ' }
          ]}
        />

        <ContentSection>
          <Container maxWidth="md">
            {loading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress size={60} sx={{ color: '#663399' }} />
              </Box>
            ) : faqs.length > 0 ? (
              <Box>
                {faqs.map((faq, index) => (
                  <StyledAccordion
                    key={faq.id}
                    expanded={expanded === `panel${index}`}
                    onChange={handleChange(`panel${index}`)}
                  >
                    <StyledAccordionSummary
                      expandIcon={<ExpandMore sx={{ color: '#663399' }} />}
                      aria-controls={`panel${index}bh-content`}
                      id={`panel${index}bh-header`}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <HelpOutline sx={{ color: '#663399' }} />
                        <Typography variant="h6" fontWeight={600}>
                          {getLocalizedText(faq.question, faq.question_ar)}
                        </Typography>
                      </Box>
                    </StyledAccordionSummary>
                    <AccordionDetails sx={{ pt: 2 }}>
                      <Typography 
                        color="text.secondary" 
                        lineHeight={1.7}
                        sx={{ whiteSpace: 'pre-wrap' }}
                      >
                        {getLocalizedText(faq.answer, faq.answer_ar)}
                      </Typography>
                    </AccordionDetails>
                  </StyledAccordion>
                ))}
              </Box>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                {t('faqNoQuestions') || 'No FAQs available at the moment.'}
              </Alert>
            )}

            {/* Contact Section */}
            {!loading && faqs.length > 0 && (
              <Box
                sx={{
                  mt: 6,
                  p: 4,
                  backgroundColor: 'rgba(102, 51, 153, 0.05)',
                  borderRadius: 2,
                  textAlign: 'center'
                }}
              >
                <Typography variant="h5" gutterBottom fontWeight={700} color="#663399">
                  {t('faqStillHaveQuestions') || 'Still have questions?'}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {t('faqContactUs') || 'Feel free to contact us for more information'}
                </Typography>
              </Box>
            )}
          </Container>
        </ContentSection>
      </PageContainer>
      <Footer />
    </>
  );
};

export default FAQ;

