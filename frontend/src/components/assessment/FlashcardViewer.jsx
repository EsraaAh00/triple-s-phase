import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  useTheme,
  alpha,
  keyframes,
  CircularProgress,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  FlipToBack as FlipIcon,
  FlipToFront as UnflipIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Psychology as PsychologyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Animation keyframes
const flip = keyframes`
  0% { transform: rotateY(0deg); }
  50% { transform: rotateY(90deg); }
  100% { transform: rotateY(180deg); }
`;

const flipBack = keyframes`
  0% { transform: rotateY(180deg); }
  50% { transform: rotateY(90deg); }
  100% { transform: rotateY(0deg); }
`;

const slideIn = keyframes`
  from { transform: translateX(100px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideOut = keyframes`
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(-100px); opacity: 0; }
`;

const FlashcardViewer = ({ 
  flashcards = [], 
  currentIndex = 0, 
  onNext, 
  onPrevious,
  onClose,
  isLoading = false 
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentFlashcard = flashcards[currentIndex];

  // Reset flip state when changing cards
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  const handleFlip = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setIsFlipped(!isFlipped);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsFlipped(false);
    onNext?.();
  };

  const handlePrevious = () => {
    if (isAnimating) return;
    setIsFlipped(false);
    onPrevious?.();
  };

  if (isLoading) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} sx={{ color: '#7c4dff' }} />
        <Typography variant="h6" sx={{ color: '#333' }}>
          جاري تحميل البطاقات التعليمية...
        </Typography>
      </Box>
    );
  }

  if (!currentFlashcard) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        flexDirection: 'column',
        gap: 2,
        color: '#333',
        textAlign: 'center'
      }}>
        <PsychologyIcon sx={{ fontSize: 80, opacity: 0.5, color: '#333679' }} />
        <Typography variant="h5" sx={{ mb: 1, color: '#333' }}>
          {t('assessmentNoFlashcardsAvailable')}
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.7, color: '#666' }}>
          {t('assessmentNoFlashcardsMessage')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 3,
      position: 'relative',
      bgcolor: 'white',
      borderRadius: 2
    }}>
      {/* Header */}
      <Box sx={{
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        display: 'flex',
        justifyContent: 'right',
        alignItems: 'center',
        zIndex: 10
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PsychologyIcon sx={{ color: '#333679', fontSize: 24 }} />
          <Typography variant="h6" sx={{ color: '#333679', fontWeight: 'bold' }}>
            البطاقات التعليمية
          </Typography>
        </Box>
      </Box>

      {/* Main Flashcard */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        style={{ width: '100%', maxWidth: 500, height: 320 }}
      >
        <Box 
          sx={{ 
            perspective: '1000px',
            width: '100%',
            height: '100%',
            cursor: 'pointer'
          }}
          onClick={handleFlip}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              transition: 'transform 0.6s ease-in-out',
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              animation: isAnimating ? (isFlipped ? `${flip} 0.6s ease-in-out` : `${flipBack} 0.6s ease-in-out`) : 'none'
            }}
          >
            {/* Front Side */}
            <Card
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                border: '2px solid rgba(255,255,255,0.2)'
              }}
            >
              <CardContent sx={{ p: 4, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="subtitle1" sx={{ 
                  mb: 2, 
                  opacity: 0.8,
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}>
                  الوجه الأمامي
                </Typography>
                
                {currentFlashcard.front_image && (
                  <Box sx={{ mb: 2, maxWidth: '80%', maxHeight: 120, mx: 'auto' }}>
                    <img 
                      src={currentFlashcard.front_image} 
                      alt="Front" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%', 
                        objectFit: 'contain',
                        borderRadius: 8,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                      }} 
                    />
                  </Box>
                )}
                
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontSize: '1.5rem',
                    lineHeight: 1.4,
                    fontWeight: 600,
                    textAlign: 'center',
                    wordBreak: 'break-word'
                  }}
                >
                  {currentFlashcard.front_text || currentFlashcard.front}
                </Typography>
              </CardContent>
            </Card>

            {/* Back Side */}
            <Card
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                border: '2px solid rgba(255,255,255,0.2)'
              }}
            >
              <CardContent sx={{ p: 4, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="subtitle1" sx={{ 
                  mb: 2, 
                  opacity: 0.8,
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}>
                  الوجه الخلفي
                </Typography>
                
                {currentFlashcard.back_image && (
                  <Box sx={{ mb: 2, maxWidth: '80%', maxHeight: 120, mx: 'auto' }}>
                    <img 
                      src={currentFlashcard.back_image} 
                      alt="Back" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%', 
                        objectFit: 'contain',
                        borderRadius: 8,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                      }} 
                    />
                  </Box>
                )}
                
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontSize: '1.5rem',
                    lineHeight: 1.4,
                    fontWeight: 600,
                    textAlign: 'center',
                    wordBreak: 'break-word'
                  }}
                >
                  {currentFlashcard.back_text || currentFlashcard.back}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </motion.div>

      {/* Controls */}
      <Box sx={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2
      }}>
        {/* Previous Button */}
        <Button
          variant="outlined"
          disabled={currentIndex === 0 || isAnimating}
          onClick={handlePrevious}
          startIcon={<ArrowBackIcon />}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 2,
            px: 3,
            py: 1,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
            '&:disabled': {
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.3)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          السابق
        </Button>

        {/* Flip Button */}
        <Button
          variant="contained"
          onClick={handleFlip}
          disabled={isAnimating}
          startIcon={isFlipped ? <UnflipIcon /> : <FlipIcon />}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            borderRadius: 2,
            px: 4,
            py: 1,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.3)',
              transform: 'translateY(-2px)',
            },
            '&:disabled': {
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.5)',
            },
          }}
        >
          {isFlipped ? 'عرض الوجه الأمامي' : 'عرض الوجه الخلفي'}
        </Button>

        {/* Next Button */}
        <Button
          variant="outlined"
          disabled={currentIndex === flashcards.length - 1 || isAnimating}
          onClick={handleNext}
          endIcon={<ArrowForwardIcon />}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 2,
            px: 3,
            py: 1,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
            '&:disabled': {
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.3)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          التالي
        </Button>
      </Box>

      {/* Instructions */}
      <Box sx={{
        position: 'absolute',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center'
      }}>
        <Typography variant="caption" sx={{ 
          color: '#666',
          fontSize: '0.75rem'
        }}>
          اضغط على البطاقة أو استخدم الأزرار لقلبها
        </Typography>
      </Box>
    </Box>
  );
};

export default FlashcardViewer;
