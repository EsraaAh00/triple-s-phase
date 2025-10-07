import { Box, Button, Container, Typography } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Unauthorized = () => {
  const { t } = useTranslation();
  
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          p: 3,
        }}
      >
        <LockIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          {t('unauthorizedTitle')}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {t('unauthorizedMessage')}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('unauthorizedContactAdmin')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/"
          sx={{ mt: 3 }}
        >
          {t('unauthorizedGoHome')}
        </Button>
      </Box>
    </Container>
  );
};

export default Unauthorized;
