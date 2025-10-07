import React from 'react';
import { Box, Alert, Snackbar } from '@mui/material';
import QuestionBankManager from '../../components/assessment/QuestionBankManager';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Add CSS styling for Grid components
const gridStyles = `
  .MuiGrid-root {
    --Grid-columnSpacing: 10px;
  }
`;

// Inject the styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = gridStyles;
  document.head.appendChild(styleSheet);
}

const QuestionBankPage = () => {
  const { t } = useTranslation();
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <QuestionBankManager onNotification={handleNotification} />
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QuestionBankPage;
