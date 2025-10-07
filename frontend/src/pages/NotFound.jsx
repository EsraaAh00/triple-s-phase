import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';

const StyledContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '80vh',
  textAlign: 'center',
  padding: theme.spacing(4),
}));

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <StyledContainer maxWidth="md">
      <Box sx={{ width: 200, height: 200, mb: 4 }}>
        <svg 
          viewBox="0 0 500 500" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%' }}
        >
          <rect width="500" height="500" rx="250" fill="#F5F7FA"/>
          <path d="M250 150V300M300 225H200" stroke="#4F46E5" strokeWidth="20" strokeLinecap="round"/>
          <path d="M250 350C245.5 350 242 346.5 242 342C242 337.5 245.5 334 250 334C254.5 334 258 337.5 258 342C258 346.5 254.5 350 250 350Z" fill="#4F46E5"/>
          <path d="M250 100C172.525 100 110 162.525 110 240C110 317.475 172.525 380 250 380C327.475 380 390 317.475 390 240C390 162.525 327.475 100 250 100ZM250 350C189.725 350 140 300.275 140 240C140 179.725 189.725 130 250 130C310.275 130 360 179.725 360 240C360 300.275 310.275 350 250 350Z" fill="#4F46E5"/>
        </svg>
      </Box>
      
      <Typography variant="h1" component="h1" sx={{ fontSize: '6rem', fontWeight: 700, mb: 2 }}>
        404
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        {t('notFoundTitle')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '600px' }}>
        {t('notFoundMessage')}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          size="large" 
          onClick={() => navigate(-1)}
          sx={{ px: 4, py: 1.5 }}
        >
          {t('notFoundGoBack')}
        </Button>
        <Button 
          variant="outlined" 
          size="large" 
          onClick={() => navigate('/')}
          sx={{ px: 4, py: 1.5 }}
        >
          {t('notFoundGoHome')}
        </Button>
      </Box>
    </StyledContainer>
  );
};

export default NotFound;
