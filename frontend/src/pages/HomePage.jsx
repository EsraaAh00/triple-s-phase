import { Box } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeroBanner from '../components/home/HeroBanner';
import CourseCollections from '../components/home/CourseSlider';
import BannerFile from '../components/home/BannerFile';
import WhyChooseUsSection from '../components/home/WhyChooseUsSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import FeaturedArticlesSection from '../components/home/FeaturedArticlesSection';
import LearningMethodsSection from '../components/home/LearningMethodsSection';
import AboutAcademySection from '../components/home/AboutAcademySection';


const HomePage = () => {
  const { t } = useTranslation();
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      // Responsive container adjustments
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden'
    }}>
      <Helmet>
        <title>{t('headerHome')} | {t('platform')}</title>
        <meta
          name="description"
          content={t('platformDescription')}
        />
        <meta name="keywords" content="تعليم عن بعد, دورات تدريبية, تعلم اونلاين, شهادات معتمدة, تطوير مهني" />
        {/* Responsive viewport meta tag */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>

      {/* Header */}
      <Header />

      <Box component="main" sx={{ 
        flex: 1,
        width: '100%',
        // Responsive spacing adjustments
        py: { xs: 1, sm: 2, md: 3 },
        px: { xs: 0, sm: 1, md: 2 }
      }}>
        {/* Hero Banner Section */}
        <Box component="section" id="home" sx={{
          width: '100%',
          // Responsive section spacing
          mb: { xs: 2, sm: 3, md: 4 }
        }}>
          <HeroBanner />
        </Box>

        {/* Learning Methods Section */}
        <Box component="section" id="learning-methods" sx={{
          width: '100%',
          // Responsive section spacing
          mb: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3, md: 4 }
        }}>
          <LearningMethodsSection />
        </Box>

        {/* About Academy Section */}
        <Box component="section" id="about-academy" sx={{
          width: '100%',
          // Responsive section spacing
          mb: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3, md: 4 }
        }}>
          <AboutAcademySection />
        </Box>

        {/* Course Collections Section */}
        <Box component="section" id="course-collections" sx={{ 
          bgcolor: 'background.default',
          width: '100%',
          // Responsive section spacing
          mb: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3, md: 4 }
        }}>
          <CourseCollections />
        </Box>

        {/* Banner File Section */}
        <Box component="section" id="banner-file" sx={{
          width: '100%',
          // Responsive section spacing
          mb: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3, md: 4 }
        }}>
          <BannerFile />
        </Box>

        {/* Why Choose Us Section */}
        <Box component="section" id="why-choose-us" sx={{
          width: '100%',
          // Responsive section spacing
          mb: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3, md: 4 }
        }}>
          <WhyChooseUsSection />
        </Box>

        {/* Testimonials Section */}
        <Box component="section" id="testimonials" sx={{ 
          bgcolor: 'background.default',
          width: '100%',
          // Responsive section spacing
          mb: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3, md: 4 }
        }}>
          <TestimonialsSection />
        </Box>

        {/* Featured Articles Section */}
        <Box component="section" id="featured-articles" sx={{
          width: '100%',
          // Responsive section spacing
          mb: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3, md: 4 }
        }}>
          <FeaturedArticlesSection />
        </Box>

      </Box>
      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default HomePage;
