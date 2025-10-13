import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, styled, CircularProgress, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Handshake, KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import api from '../../services/api.service';

const SectionContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#f9fafb',
  position: 'relative',
  overflow: 'hidden',
  padding: theme.spacing(2, 0),
  '@media (max-width: 600px)': {
    padding: theme.spacing(2, 0),
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    padding: theme.spacing(2, 0),
  },
  '@media (min-width: 900px)': {
    padding: theme.spacing(2, 0),
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  position: 'relative',
  zIndex: 1,
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(3),
  },
}));

const SectionLabel = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  backgroundColor: 'rgba(111, 66, 193, 0.1)',
  borderRadius: '30px',
  marginBottom: theme.spacing(2),
  '& .MuiSvgIcon-root': {
    color: '#6f42c1',
    fontSize: '1.2rem',
  },
  '& span': {
    color: '#6f42c1',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  color: '#663399',
  lineHeight: 1.2,
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  fontSize: '2.5rem',
  '@media (max-width: 600px)': {
    fontSize: '1.75rem',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    fontSize: '2rem',
  },
  '@media (min-width: 900px)': {
    fontSize: '2.5rem',
  },
}));

const PartnersSliderContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
  padding: theme.spacing(2, 0),
}));

const PartnersTrack = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(4),
  overflowX: 'auto',
  scrollBehavior: 'smooth',
  padding: theme.spacing(2, 0),
  '&::-webkit-scrollbar': {
    height: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0,0,0,0.1)',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'linear-gradient(90deg, #6f42c1 0%, #8b5cf6 100%)',
    borderRadius: '3px',
    '&:hover': {
      background: 'linear-gradient(90deg, #5a3594 0%, #7a6b9a 100%)',
    }
  },
  '@media (max-width: 900px)': {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  }
}));

const PartnerCard = styled(Box)(({ theme }) => ({
  width: '180px',
  height: '180px',
  minWidth: '180px',
  backgroundColor: '#ffffff',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), 0 0 0 4px rgba(111, 66, 193, 0.1)',
  border: '3px solid rgba(111, 66, 193, 0.2)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  flexShrink: 0,
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle, rgba(111, 66, 193, 0.1) 0%, transparent 70%)',
    opacity: 0,
    transition: 'opacity 0.4s ease',
  },
  '&:hover': {
    transform: 'translateY(-10px) scale(1.05)',
    boxShadow: '0 12px 40px rgba(111, 66, 193, 0.3), 0 0 0 6px rgba(111, 66, 193, 0.2)',
    borderColor: 'rgba(111, 66, 193, 0.4)',
    '&:before': {
      opacity: 1,
    },
  },
  '@media (max-width: 600px)': {
    width: '140px',
    height: '140px',
    minWidth: '140px',
    padding: theme.spacing(2),
    border: '2px solid rgba(111, 66, 193, 0.2)',
  },
  '@media (min-width: 600px) and (max-width: 900px)': {
    width: '160px',
    height: '160px',
    minWidth: '160px',
    padding: theme.spacing(2.5),
  },
}));

const PartnerLogo = styled('img')({
  maxWidth: '80%',
  maxHeight: '80%',
  objectFit: 'contain',
  transition: 'all 0.4s ease',
  position: 'relative',
  zIndex: 2,
  filter: 'none',
  '&:hover': {
    filter: 'brightness(1.1)',
    transform: 'scale(1.1) rotate(5deg)',
  },
});

const NavigationButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: '#ffffff',
  color: '#6f42c1',
  width: '40px',
  height: '40px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  zIndex: 3,
  '&:hover': {
    backgroundColor: '#f8f9fa',
    transform: 'translateY(-50%) scale(1.1)',
  },
  '@media (max-width: 900px)': {
    display: 'none',
  }
}));

const OurPartnersSection = () => {
  const { t } = useTranslation();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  // Fetch partners from API
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching partnerships from API...');
        
        const response = await api.get('/api/extras/partnerships/');
        console.log('✅ Partnerships received:', response);
        
        // Handle response format
        let partnersData = [];
        if (Array.isArray(response.data)) {
          partnersData = response.data;
        } else if (response.data?.results) {
          partnersData = response.data.results;
        } else if (response.data?.data) {
          partnersData = response.data.data;
        }
        
        console.log('📊 Partners count:', partnersData.length);
        setPartners(partnersData);
        
      } catch (error) {
        console.error('❌ Error loading partners:', error);
        console.error('❌ Error details:', error.response?.data || error.message);
        setError(error.message);
        setPartners([]);
      } finally {
        setLoading(false);
        console.log('🏁 Partners loading completed');
      }
    };
    
    fetchPartners();
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: -250,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: 250,
        behavior: 'smooth'
      });
    }
  };

  const getPartnerName = (partner, lang = 'en') => {
    if (lang === 'ar' && partner.name_ar) {
      return partner.name_ar;
    }
    return partner.name;
  };

  const handlePartnerClick = (partner) => {
    if (partner.website) {
      window.open(partner.website, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <SectionContainer>
      <Container maxWidth="lg">
        <SectionHeader>
          <SectionLabel>
            <Handshake />
            <span>{t('partnersOurPartners') || 'Our Partners'}</span>
          </SectionLabel>
          
          <SectionTitle variant="h2" component="h2">
            {t('partnersTrustedBy') || 'Our Partnership'}
          </SectionTitle>
        </SectionHeader>

        {loading ? (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 6,
            gap: 2
          }}>
            <CircularProgress sx={{ color: '#663399' }} />
            <Typography variant="body1" color="text.secondary">
              {t('commonLoading')}...
            </Typography>
          </Box>
        ) : partners.length === 0 ? (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 6,
            gap: 2
          }}>
            <Typography variant="h6" color="text.secondary">
              {t('partnersNoPartnersYet') || 'No partners available yet'}
            </Typography>
          </Box>
        ) : (
          <PartnersSliderContainer>
            {partners.length > 4 && (
              <>
                <NavigationButton
                  onClick={scrollLeft}
                  sx={{ left: '-20px' }}
                >
                  <KeyboardArrowLeft />
                </NavigationButton>

                <NavigationButton
                  onClick={scrollRight}
                  sx={{ right: '-20px' }}
                >
                  <KeyboardArrowRight />
                </NavigationButton>
              </>
            )}

            <PartnersTrack ref={scrollRef}>
              {partners.map((partner) => (
                <PartnerCard
                  key={partner.id}
                  onClick={() => handlePartnerClick(partner)}
                  title={getPartnerName(partner)}
                >
                  <PartnerLogo
                    src={partner.logo_url || partner.logo}
                    alt={getPartnerName(partner)}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </PartnerCard>
              ))}
            </PartnersTrack>
          </PartnersSliderContainer>
        )}
      </Container>
    </SectionContainer>
  );
};

export default OurPartnersSection;

