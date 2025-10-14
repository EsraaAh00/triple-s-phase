import React, { useState } from 'react';
import { 
  Box, 
  Alert, 
  Snackbar, 
  Stepper, 
  Step, 
  StepLabel, 
  Paper, 
  Typography, 
  Button,
  Divider
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import QuizIcon from '@mui/icons-material/Quiz';

// Import components
import ProductSelector from '../../components/assessment/ProductSelector';
import ChapterManager from '../../components/assessment/ChapterManager';
import TopicManager from '../../components/assessment/TopicManager';
import QuestionBankManager from '../../components/assessment/QuestionBankManager';

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
  const [activeStep, setActiveStep] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const steps = [
    t('selectCourse'),
    t('manageChapters'),
    t('manageTopics'),
    t('manageQuestions')
  ];

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

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setActiveStep(1);
  };

  const handleChapterSelect = (chapter) => {
    setSelectedChapter(chapter);
    setActiveStep(2);
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setActiveStep(3);
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      // Clear selections when going back
      if (activeStep === 1) {
        setSelectedProduct(null);
      } else if (activeStep === 2) {
        setSelectedChapter(null);
      } else if (activeStep === 3) {
        setSelectedTopic(null);
      }
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <ProductSelector 
            type="questionbank"
            onProductSelect={handleProductSelect}
            onNotification={handleNotification}
          />
        );
      case 1:
        return (
          <ChapterManager 
            product={selectedProduct}
            type="questionbank"
            onChapterSelect={handleChapterSelect}
            onNotification={handleNotification}
          />
        );
      case 2:
        return (
          <TopicManager 
            chapter={selectedChapter}
            type="questionbank"
            onTopicSelect={handleTopicSelect}
            onNotification={handleNotification}
          />
        );
      case 3:
        return (
          <QuestionBankManager 
            product={selectedProduct}
            chapter={selectedChapter}
            topic={selectedTopic}
            onNotification={handleNotification}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4, 
        gap: 2,
        p: 3,
        borderRadius: '12px',
        background: 'linear-gradient(90deg, #333679 0%, #4DBFB3 100%)',
        color: 'white'
      }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            color: 'white'
          }}
        >
          <QuizIcon />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, lineHeight: 1.2, color: 'white' }}>
            {t('questionBank')}
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            {t('questionBankDescription')}
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Navigation */}
      {activeStep > 0 && (
        <Box sx={{ 
          mb: 3, 
          p: 3, 
          backgroundColor: '#f8f9fa', 
          borderRadius: 2, 
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              variant="outlined"
              sx={{ 
                minWidth: 'auto',
                px: 2,
                py: 1,
                borderRadius: 2,
                borderColor: '#dee2e6',
                color: '#6c757d',
                '&:hover': {
                  borderColor: '#333679',
                  color: '#333679',
                  backgroundColor: 'rgba(51, 54, 121, 0.04)'
                }
              }}
            >
              {t('back')}
            </Button>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              flexWrap: 'wrap',
              ml: 1
            }}>
              {selectedProduct && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  px: 2, 
                  py: 1, 
                  backgroundColor: 'white', 
                  borderRadius: 2, 
                  border: '1px solid #e9ecef',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <Typography variant="caption" sx={{ 
                    color: '#6c757d', 
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {t('product')}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#333679', 
                    fontWeight: 600,
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {selectedProduct.title}
                  </Typography>
                </Box>
              )}
              
              {selectedChapter && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  px: 2, 
                  py: 1, 
                  backgroundColor: 'white', 
                  borderRadius: 2, 
                  border: '1px solid #e9ecef',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <Typography variant="caption" sx={{ 
                    color: '#6c757d', 
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {t('chapter')}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#333679', 
                    fontWeight: 600,
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {selectedChapter.title}
                  </Typography>
                </Box>
              )}
              
              {selectedTopic && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  px: 2, 
                  py: 1, 
                  backgroundColor: 'white', 
                  borderRadius: 2, 
                  border: '1px solid #e9ecef',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <Typography variant="caption" sx={{ 
                    color: '#6c757d', 
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {t('topic')}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#333679', 
                    fontWeight: 600,
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {selectedTopic.title}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* Step Content */}
      {renderStepContent(activeStep)}
      
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
