import React from 'react';
import { Box, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PageBanner from '../components/common/PageBanner';
import AboutAcademySection from '../components/home/AboutAcademySection';
import { useTranslation } from 'react-i18next';

const PageContainer = styled(Box)({
  minHeight: '100vh',
  backgroundColor: '#f8f9fa',
});

const AboutUs = () => {
  const { t } = useTranslation();

  return (
    <>
      <Header />
      <PageContainer>
        <PageBanner
          title={t('aboutUsTitle') || 'About Us'}
          subtitle={t('aboutUsSubtitle') || 'Learn more about Triple S Academy'}
          breadcrumbs={[
            { label: t('commonHome') || 'Home', link: '/' },
            { label: t('aboutUsTitle') || 'About Us' }
          ]}
        />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <AboutAcademySection />
        </Container>
      </PageContainer>
      <Footer />
    </>
  );
};

export default AboutUs;

