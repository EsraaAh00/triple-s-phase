import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Paper,
  Divider,
  Dialog,
  DialogContent,
  DialogActions,
  Fade
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Shuffle as ShuffleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Flag as FlagIcon,
  Report as ReportIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import assessmentService from '../../services/assessment.service';

const FlashcardStudy = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State for flashcards
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for progress tracking
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [flaggedCards, setFlaggedCards] = useState(new Set());
  const [startTime, setStartTime] = useState(Date.now());
  const [completedCards, setCompletedCards] = useState(new Set());
  
  // State for completion popup
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  
  // Get filter parameters from URL
  const topics = searchParams.get('topics')?.split(',') || [];
  const chapters = searchParams.get('chapters')?.split(',') || [];
  const products = searchParams.get('products')?.split(',') || [];
  const count = parseInt(searchParams.get('count')) || 50;
  
  console.log('FlashcardStudy - Filter parameters:', { topics, chapters, products, count });

  useEffect(() => {
    fetchFlashcards();
  }, []);

  // Save session data when component unmounts or page is closed
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (flashcards.length > 0 && (correctCount > 0 || incorrectCount > 0)) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const totalAnswered = correctCount + incorrectCount;
        const accuracy = totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0;
        
        const stats = {
          totalCards: count,
          correctCount,
          incorrectCount,
          flaggedCount: flaggedCards.size,
          timeSpent,
          accuracy
        };

        // Save the study session
        await saveStudySession(stats);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [flashcards, correctCount, incorrectCount, flaggedCards, startTime]);

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      // Build parameters based on what's available
      // Request exactly the count selected by user
      const params = {
        page_size: count, // Request exactly the count selected by user
        random: 'true' // Request random flashcards
      };

      // Add filters only if they exist and are not empty
      // Note: Backend expects individual parameters for multiple values
      if (topics.length > 0) {
        // Send topics as array - backend will handle it
        params.topic = topics;
      }
      if (chapters.length > 0) {
        // Note: Backend doesn't have chapter filter, we'll filter by topic
        console.log('Chapters selected but backend filters by topic only');
      }
      if (products.length > 0) {
        // Send products as array - backend will handle it
        params.product = products;
      }
      
      // Add product status filter to ensure we get published products
      params['product__status'] = 'published';

      // If no filters are provided, try to get all available flashcards
      if (topics.length === 0 && chapters.length === 0 && products.length === 0) {
        console.log('No filters provided, getting all available flashcards...');
        // Remove all filter parameters to get all flashcards
        delete params.topic;
        delete params.product;
        // Keep product__status filter to ensure we get published products
      }

      console.log('Fetching flashcards with params:', params); // Debug log
      
      const response = await assessmentService.getFlashcards(params);
      
      console.log('Flashcards response:', response); // Debug log
      
      if (response.success && response.data && response.data.length > 0) {
        // Use all available flashcards and shuffle them
        const shuffled = response.data.sort(() => Math.random() - 0.5);
        setFlashcards(shuffled);
        setError(null);
        console.log(`Successfully loaded ${shuffled.length} flashcards (requested: ${count})`);
      } else {
        // If no flashcards found, try to get any flashcards without filters
        console.log('No flashcards found with filters, trying without filters...');
        const fallbackParams = {
          page_size: count, // Request exactly the count selected by user
          random: 'true',
          'product__status': 'published'
          // No other filters - get all published flashcards
        };
        
        const fallbackResponse = await assessmentService.getFlashcards(fallbackParams);
        
        if (fallbackResponse.success && fallbackResponse.data && fallbackResponse.data.length > 0) {
          const shuffled = fallbackResponse.data.sort(() => Math.random() - 0.5);
          setFlashcards(shuffled);
          setError(null);
          console.log(`Fallback: Successfully loaded ${shuffled.length} flashcards (requested: ${count})`);
      } else {
          console.log('Fallback also failed:', fallbackResponse);
          setError('No flashcards available in the system. Please contact support or try again later.');
        }
      }
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      console.error('Error details:', error.response?.data || error.message);
      setError(`Failed to fetch flashcards: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    // Add a subtle animation effect
    setTimeout(() => {
      // Optional: Add any additional visual feedback here
    }, 100);
  };

  const handleCorrect = () => {
    const currentCard = flashcards[currentIndex];
    if (currentCard && !completedCards.has(currentCard.id)) {
      setCorrectCount(prev => prev + 1);
      setCompletedCards(prev => new Set([...prev, currentCard.id]));
    }
    handleNext();
  };

  const handleIncorrect = () => {
    const currentCard = flashcards[currentIndex];
    if (currentCard && !completedCards.has(currentCard.id)) {
      setIncorrectCount(prev => prev + 1);
      setCompletedCards(prev => new Set([...prev, currentCard.id]));
    }
    handleNext();
  };

  const handleFlag = () => {
    const currentCard = flashcards[currentIndex];
    if (currentCard) {
      setFlaggedCards(prev => {
        const newSet = new Set(prev);
        if (newSet.has(currentCard.id)) {
          newSet.delete(currentCard.id);
        } else {
          newSet.add(currentCard.id);
        }
        return newSet;
      });
    }
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  const handleFinishStudy = () => {
    setShowCompletionPopup(true);
  };

  const handleGoToHomepage = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const totalAnswered = correctCount + incorrectCount;
    const accuracy = totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0;
    
    const stats = {
      totalCards: count,
      correctCount,
      incorrectCount,
      flaggedCount: flaggedCards.size,
      timeSpent,
      accuracy
    };

    // Save the study session
    await saveStudySession(stats);
    
    navigate('/student/dashboard');
  };

  const handleCreateNewCards = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const totalAnswered = correctCount + incorrectCount;
    const accuracy = totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0;
    
    const stats = {
      totalCards: count,
      correctCount,
      incorrectCount,
      flaggedCount: flaggedCards.size,
      timeSpent,
      accuracy
    };

    // Save the study session
    await saveStudySession(stats);
    
    navigate('/student/flashcards/filter');
  };

  const saveStudySession = async (stats) => {
    try {
      const sessionData = {
        flashcards: flashcards.map(card => ({
          id: card.id,
          front_text: card.front_text,
          back_text: card.back_text,
          topic: card.topic?.title || null,
          product: card.product?.title || null
        })),
        session_stats: {
          total_cards: count,
          correct_count: stats.correctCount,
          incorrect_count: stats.incorrectCount,
          flagged_count: stats.flaggedCount,
          time_spent: stats.timeSpent,
          accuracy: stats.accuracy,
          completed_cards: Array.from(completedCards),
          flagged_cards: Array.from(flaggedCards)
        },
        filters: {
          topics: topics,
          chapters: chapters,
          products: products,
          count: count
        },
        session_date: new Date().toISOString()
      };

      // Save to localStorage as backup
      const existingSessions = JSON.parse(localStorage.getItem('flashcard_sessions') || '[]');
      existingSessions.push(sessionData);
      localStorage.setItem('flashcard_sessions', JSON.stringify(existingSessions));

      // Try to save to backend (if API exists)
      try {
        await assessmentService.saveFlashcardSession(sessionData);
        console.log('Study session saved to backend');
      } catch (backendError) {
        console.log('Backend save failed, but data saved locally:', backendError);
      }

    } catch (error) {
      console.error('Error saving study session:', error);
    }
  };

  const handleViewStatistics = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const totalAnswered = correctCount + incorrectCount;
    const accuracy = totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0;
    
    const stats = {
      totalCards: count,
      correctCount,
      incorrectCount,
      flaggedCount: flaggedCards.size,
      timeSpent,
      accuracy
    };

    // Save the study session
    await saveStudySession(stats);
    
    navigate('/student/flashcards/statistics', { state: { stats } });
  };

  const currentCard = flashcards[currentIndex];
  const isFlagged = currentCard && flaggedCards.has(currentCard.id);
  const isCompleted = currentCard && completedCards.has(currentCard.id);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {t('flashcardStudy.loading', 'Loading flashcards...')}
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/student/flashcards/filter')}
        >
          {t('common.back', 'Back to Filter')}
        </Button>
      </Container>
    );
  }

  if (flashcards.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          {t('flashcardStudy.noCards', 'No flashcards found')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('flashcardStudy.noCardsDescription', 'No flashcards match your selected filters. Try adjusting your selection.')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/student/flashcards/filter')}
        >
          {t('common.back', 'Back to Filter')}
        </Button>
          <Button
            variant="outlined"
            onClick={fetchFlashcards}
            disabled={loading}
          >
            {t('commonTryAgain', 'Try Again')}
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: { xs: 1, sm: 2 },
      px: { xs: 1, sm: 2 }
    }}>
      <Container maxWidth="xl" sx={{ height: '100%' }}>
        {/* Compact Header */}
        <Box sx={{ 
          mb: { xs: 2, sm: 3 }, 
          p: { xs: 1.5, sm: 2 },
          borderRadius: 2,
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          backdropFilter: 'blur(10px)'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: { xs: 1, sm: 2 }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              <IconButton
                onClick={() => navigate('/student/flashcards/filter')}
                sx={{
                  background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                  color: 'white',
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                  borderRadius: 1.5,
                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0, #1976d2)',
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)'
                  }
                }}
              >
                <ArrowBackIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.2rem' } }} />
              </IconButton>
              <Typography variant="h5" sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }
              }}>
                {t('flashcardStudy.title', 'Flashcard Study')}
              </Typography>
            </Box>
            
            {/* Compact Progress Info */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1, sm: 2 },
              p: { xs: 1, sm: 1.5 },
              borderRadius: 1.5,
              background: 'rgba(25, 118, 210, 0.05)',
              border: '1px solid rgba(25, 118, 210, 0.1)'
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ 
                  fontWeight: 700, 
                  color: '#1976d2',
                  lineHeight: 1,
                  fontSize: { xs: '0.8rem', sm: '0.9rem' }
                }}>
                  {currentIndex + 1}/{flashcards.length}
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: '#666',
                  fontWeight: 500,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                }}>
                  {t('flashcardStudy.progress', 'Progress')}
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ height: { xs: 20, sm: 24 } }} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ 
                  fontWeight: 700, 
                  color: '#4caf50',
                  lineHeight: 1,
                  fontSize: { xs: '0.8rem', sm: '0.9rem' }
                }}>
                  {completedCards.size}
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: '#666',
                  fontWeight: 500,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                }}>
                  {t('flashcardStudy.answered', 'Answered')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>


      {/* Main Flashcard with Navigation Arrows - Responsive Design */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: { xs: 0.5, sm: 1, md: 2 }, 
        mb: { xs: 2, sm: 3 },
        flexDirection: { xs: 'column', sm: 'row' },
        px: { xs: 0.5, sm: 1 }
      }}>
        {/* Previous Arrow */}
        <IconButton
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          sx={{ 
            background: 'linear-gradient(135deg, #f44336, #e53935)',
            color: 'white',
            width: { xs: 40, sm: 48, md: 56 },
            height: { xs: 40, sm: 48, md: 56 },
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': { 
              background: 'linear-gradient(135deg, #d32f2f, #c62828)',
              transform: 'scale(1.05)',
              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)'
            },
            '&:disabled': { 
              background: 'linear-gradient(135deg, #e0e0e0, #bdbdbd)',
              color: '#9e9e9e',
              transform: 'none',
              boxShadow: 'none'
            }
          }}
        >
          <NavigateBeforeIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.5rem' } }} />
        </IconButton>

        {/* Main Card - Responsive with Flip Animation */}
        <Box sx={{
          width: '100%', 
          maxWidth: { xs: '100%', sm: 450, md: 550 }, 
          minHeight: { xs: 200, sm: 250, md: 300 },
          perspective: '1000px',
          cursor: !showAnswer ? 'pointer' : 'default'
        }} onClick={!showAnswer ? handleShowAnswer : undefined}>
          <Card sx={{ 
            width: '100%', 
            minHeight: { xs: 200, sm: 250, md: 300 },
            borderRadius: 2,
            boxShadow: showAnswer 
              ? '0 12px 40px rgba(76, 175, 80, 0.2)' 
              : '0 8px 32px rgba(0,0,0,0.12)',
            position: 'relative',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            background: showAnswer 
              ? 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
            border: showAnswer 
              ? '2px solid #4caf50' 
              : '1px solid rgba(0,0,0,0.08)',
            overflow: 'hidden',
            '&:hover': !showAnswer ? {
              transform: 'translateY(-4px) scale(1.02)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
              border: '1px solid #1976d2'
            } : {},
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: showAnswer 
                ? 'linear-gradient(90deg, #4caf50, #66bb6a)' 
                : 'linear-gradient(90deg, #1976d2, #42a5f5)',
              transition: 'all 0.3s ease'
            }
          }}>
          <CardContent sx={{ 
            p: { xs: 2, sm: 3, md: 4 }, 
            textAlign: 'center', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            {!showAnswer ? (
              <>
                {/* Question Icon */}
                <Box sx={{ 
                  mb: { xs: 2, sm: 2.5 }, 
                  display: 'flex', 
                  justifyContent: 'center',
                  opacity: 0.7
                }}>
                  <Box sx={{
                    width: { xs: 40, sm: 50, md: 60 },
                    height: { xs: 40, sm: 50, md: 60 },
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
                  }}>
                    <Typography sx={{ color: 'white', fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.5rem' } }}>❓</Typography>
                  </Box>
                </Box>
                
                <Typography variant="h6" sx={{ 
                  lineHeight: 1.5, 
                  color: '#1a1a1a', 
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                  fontWeight: 600,
                  mb: { xs: 1.5, sm: 2 },
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  {currentCard?.front_text || t('flashcardStudy.noQuestion', 'No question available')}
                </Typography>
                
                {currentCard?.front_image && (
                  <Box sx={{ 
                    mt: 3, 
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <img 
                      src={currentCard.front_image} 
                      alt="Question" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: 220, 
                        borderRadius: 12,
                        objectFit: 'contain',
                        display: 'block'
                      }} 
                    />
                  </Box>
                )}
                
                <Box sx={{ 
                  mt: 4, 
                  p: 2, 
                  borderRadius: 2,
                  background: isCompleted 
                    ? 'rgba(76, 175, 80, 0.05)' 
                    : 'rgba(25, 118, 210, 0.05)',
                  border: isCompleted 
                    ? '1px dashed #4caf50' 
                    : '1px dashed #1976d2'
                }}>
                  <Typography variant="body2" sx={{ 
                    color: isCompleted ? '#4caf50' : '#1976d2', 
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                  }}>
                    <span>{isCompleted ? '✅' : '👆'}</span>
                    {isCompleted 
                      ? t('flashcardStudy.alreadyAnswered', 'Already answered') 
                      : t('flashcardStudy.clickToReveal', 'Click to reveal answer')
                    }
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                {/* Answer Icon */}
                <Box sx={{ 
                  mb: 3, 
                  display: 'flex', 
                  justifyContent: 'center',
                  opacity: 0.8
                }}>
                  <Box sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                  }}>
                    <Typography sx={{ color: 'white', fontSize: '1.5rem' }}>✅</Typography>
                  </Box>
                </Box>
                
                <Typography variant="h5" sx={{ 
                  lineHeight: 1.6, 
                  color: '#1b5e20', 
                  fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' },
                  fontWeight: 600,
                  mb: 2,
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  {currentCard?.back_text || t('flashcardStudy.noAnswer', 'No answer available')}
                </Typography>
                
                {currentCard?.back_image && (
                  <Box sx={{ 
                    mt: 3, 
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)'
                  }}>
                    <img 
                      src={currentCard.back_image} 
                      alt="Answer" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: 220, 
                        borderRadius: 12,
                        objectFit: 'contain',
                        display: 'block'
                      }} 
                    />
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>
        </Box>

        {/* Next Arrow */}
        <IconButton
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          sx={{ 
            background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
            color: 'white',
            width: { xs: 40, sm: 48, md: 56 },
            height: { xs: 40, sm: 48, md: 56 },
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': { 
              background: 'linear-gradient(135deg, #388e3c, #2e7d32)',
              transform: 'scale(1.05)',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)'
            },
            '&:disabled': { 
              background: 'linear-gradient(135deg, #e0e0e0, #bdbdbd)',
              color: '#9e9e9e',
              transform: 'none',
              boxShadow: 'none'
            }
          }}
        >
          <NavigateNextIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.5rem' } }} />
        </IconButton>
      </Box>


      {/* Action Buttons with Counters - Enhanced Design */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: { xs: 1.5, sm: 2, md: 3 }, 
        mb: { xs: 2, sm: 3 },
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        background: 'rgba(255, 255, 255, 0.9)',
        border: '1px solid rgba(0,0,0,0.08)',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Incorrect Counter */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, sm: 1.5 },
          p: { xs: 1, sm: 1.5 },
          borderRadius: 1.5,
          background: 'rgba(244, 67, 54, 0.05)',
          border: '1px solid rgba(244, 67, 54, 0.2)',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'rgba(244, 67, 54, 0.1)',
            transform: 'translateY(-1px)'
          }
        }}>
          <IconButton
            onClick={handleIncorrect}
            disabled={!showAnswer}
            sx={{ 
              background: 'linear-gradient(135deg, #f44336, #e53935)',
              color: 'white',
              width: { xs: 36, sm: 40, md: 48 },
              height: { xs: 36, sm: 40, md: 48 },
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: showAnswer ? 1 : 0.5,
              '&:hover': showAnswer ? { 
                background: 'linear-gradient(135deg, #d32f2f, #c62828)',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)'
              } : {},
              '&:disabled': {
                background: 'linear-gradient(135deg, #e0e0e0, #bdbdbd)',
                color: '#9e9e9e',
                transform: 'none',
                boxShadow: 'none'
              }
            }}
          >
            <CancelIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.3rem' } }} />
          </IconButton>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 700, 
              color: '#f44336',
              lineHeight: 1,
              fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' }
            }}>
              {incorrectCount}
            </Typography>
            <Typography variant="caption" sx={{ 
              fontWeight: 600, 
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: { xs: '0.6rem', sm: '0.7rem' }
            }}>
              {t('flashcardStudy.incorrect', 'INCORRECT')}
            </Typography>
          </Box>
        </Box>

        {/* Progress Indicator - Between Counters */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #ff9800, #ffb74d)',
          color: 'white',
          borderRadius: '50%',
          width: { xs: 40, sm: 45, md: 50 },
          height: { xs: 40, sm: 45, md: 50 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
          boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': {
              boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
            },
            '50%': {
              boxShadow: '0 2px 12px rgba(255, 152, 0, 0.5)',
            },
            '100%': {
              boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
            },
          }
        }}>
          {currentIndex + 1}/{flashcards.length}
        </Box>

        {/* Correct Counter */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, sm: 1.5 },
          p: { xs: 1, sm: 1.5 },
          borderRadius: 1.5,
          background: 'rgba(76, 175, 80, 0.05)',
          border: '1px solid rgba(76, 175, 80, 0.2)',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'rgba(76, 175, 80, 0.1)',
            transform: 'translateY(-1px)'
          }
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 700, 
              color: '#4caf50',
              lineHeight: 1,
              fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' }
            }}>
              {correctCount}
            </Typography>
            <Typography variant="caption" sx={{ 
              fontWeight: 600, 
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: { xs: '0.6rem', sm: '0.7rem' }
            }}>
              {t('flashcardStudy.correct', 'CORRECT')}
            </Typography>
          </Box>
          <IconButton
            onClick={handleCorrect}
            disabled={!showAnswer}
            sx={{ 
              background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
              color: 'white',
              width: { xs: 36, sm: 40, md: 48 },
              height: { xs: 36, sm: 40, md: 48 },
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: showAnswer ? 1 : 0.5,
              '&:hover': showAnswer ? { 
                background: 'linear-gradient(135deg, #388e3c, #2e7d32)',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)'
              } : {},
              '&:disabled': {
                background: 'linear-gradient(135deg, #e0e0e0, #bdbdbd)',
                color: '#9e9e9e',
                transform: 'none',
                boxShadow: 'none'
              }
            }}
          >
            <CheckCircleIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.3rem' } }} />
          </IconButton>
        </Box>
      </Box>

      {/* Additional Controls */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: { xs: 1, sm: 2 }, 
        flexWrap: 'wrap',
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        background: 'rgba(255, 255, 255, 0.9)',
        border: '1px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(10px)'
      }}>
        <Button
          variant="outlined"
          startIcon={<FlagIcon />}
          onClick={handleFlag}
          size="small"
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: { xs: 1, sm: 1.2 },
            borderRadius: 1.5,
            borderColor: isFlagged ? '#ff9800' : '#1976d2',
            color: isFlagged ? '#ff9800' : '#1976d2',
            background: isFlagged ? 'rgba(255, 152, 0, 0.05)' : 'rgba(25, 118, 210, 0.05)',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: { xs: '0.75rem', sm: '0.8rem' },
            transition: 'all 0.3s ease',
            '&:hover': {
              background: isFlagged ? 'rgba(255, 152, 0, 0.1)' : 'rgba(25, 118, 210, 0.1)',
              transform: 'translateY(-1px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }
          }}
        >
          {isFlagged ? t('flashcardStudy.unflag', 'Unflag') : t('flashcardStudy.flag', 'Flag')}
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<ShuffleIcon />}
          onClick={handleShuffle}
          size="small"
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: { xs: 1, sm: 1.2 },
            borderRadius: 1.5,
            borderColor: '#9c27b0',
            color: '#9c27b0',
            background: 'rgba(156, 39, 176, 0.05)',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: { xs: '0.75rem', sm: '0.8rem' },
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(156, 39, 176, 0.1)',
              transform: 'translateY(-1px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }
          }}
        >
          {t('flashcardStudy.shuffle', 'Shuffle')}
        </Button>
        
        <Button
          variant="contained"
          onClick={handleFinishStudy}
          size="small"
          sx={{ 
            px: { xs: 2.5, sm: 3 },
            py: { xs: 1, sm: 1.2 },
            borderRadius: 1.5,
            background: 'linear-gradient(135deg, #333679, #4DBFB3)',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: { xs: '0.75rem', sm: '0.8rem' },
            boxShadow: '0 2px 8px rgba(51, 54, 121, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #2a2d5a, #3da89c)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(51, 54, 121, 0.4)'
            }
          }}
        >
          {t('flashcardStudy.finishStudy', 'Finish Study')}
        </Button>
      </Box>
      </Container>

      {/* Completion Popup */}
      <Dialog
        open={showCompletionPopup}
        onClose={() => setShowCompletionPopup(false)}
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            background: 'white',
            overflow: 'hidden',
            width: { xs: '90%', sm: 400 }
          }
        }}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
      >
        <DialogContent sx={{ p: 0, textAlign: 'center' }}>
          {/* Progress Message */}
          <Box sx={{ 
            pt: 3, 
            pb: 2, 
            px: 3,
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
          }}>
            <Typography variant="h6" sx={{ 
              color: '#333',
              fontWeight: 600,
              mb: 1,
              fontSize: { xs: '1rem', sm: '1.1rem' }
            }}>
              You have answered{' '}
              <Box component="span" sx={{ 
                color: '#ff6b35', 
                fontWeight: 700,
                fontSize: '1.1em'
              }}>
                {correctCount + incorrectCount}
              </Box>
              {' '}questions out of{' '}
              <Box component="span" sx={{ 
                color: '#ff6b35', 
                fontWeight: 700,
                fontSize: '1.1em'
              }}>
                {count}
              </Box>
            </Typography>
            
            <Typography variant="body2" sx={{ 
              color: '#666',
              fontWeight: 500,
              fontSize: { xs: '0.8rem', sm: '0.9rem' }
            }}>
              Nice job! You have learned new Terms and Definitions.
            </Typography>
          </Box>

          {/* Illustration */}
          <Box sx={{ 
            py: 3, 
            px: 3,
            background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)'
          }}>
            <Box sx={{
              width: 160,
              height: 120,
              mx: 'auto',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Clipboard */}
              <Box sx={{
                width: 90,
                height: 110,
                background: '#2c3e50',
                borderRadius: 2,
                position: 'relative',
                boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 16,
                  height: 16,
                  background: '#f39c12',
                  borderRadius: '50% 50% 0 0',
                  border: '2px solid #2c3e50'
                }
              }}>
                {/* Testing Text */}
                <Typography sx={{
                  position: 'absolute',
                  top: 12,
                  left: 8,
                  right: 8,
                  color: 'white',
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  textAlign: 'center'
                }}>
                  TESTING
                </Typography>
                
                {/* Checkmarks and X */}
                <Box sx={{ position: 'absolute', top: 28, left: 8, right: 8 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <Box key={i} sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 0.3,
                      fontSize: '0.5rem',
                      color: 'white'
                    }}>
                      <Box sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: i === 4 ? '#e74c3c' : '#27ae60',
                        mr: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.4rem'
                      }}>
                        {i === 4 ? '✗' : '✓'}
                      </Box>
                      <Box sx={{ flex: 1, height: 0.5, background: 'rgba(255,255,255,0.3)' }} />
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Left Character */}
              <Box sx={{
                position: 'absolute',
                left: -15,
                top: 15,
                width: 30,
                height: 45,
                background: 'linear-gradient(135deg, #3498db, #2980b9)',
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -8,
                  left: 4,
                  width: 22,
                  height: 15,
                  background: '#f1c40f',
                  borderRadius: '50%',
                  transform: 'rotate(-10deg)'
                }
              }} />

              {/* Right Character */}
              <Box sx={{
                position: 'absolute',
                right: -22,
                top: 22,
                width: 28,
                height: 38,
                background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  bottom: -12,
                  right: -8,
                  width: 20,
                  height: 12,
                  background: '#8b4513',
                  borderRadius: 2
                }
              }} />
            </Box>
          </Box>

          {/* Buttons */}
          <Box sx={{ 
            p: 2.5, 
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5
          }}>
            <Button
              variant="contained"
              onClick={handleGoToHomepage}
              sx={{
                py: 1.2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: { xs: '0.8rem', sm: '0.85rem' },
                boxShadow: '0 3px 10px rgba(39, 174, 96, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #229954, #27ae60)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 5px 14px rgba(39, 174, 96, 0.4)'
                }
              }}
            >
              Go to Homepage
            </Button>

            <Button
              variant="contained"
              onClick={handleCreateNewCards}
              sx={{
                py: 1.2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: { xs: '0.8rem', sm: '0.85rem' },
                boxShadow: '0 3px 10px rgba(231, 76, 60, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #c0392b, #a93226)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 5px 14px rgba(231, 76, 60, 0.4)'
                }
              }}
            >
              Create New Cards
            </Button>

            {/* <Button
              variant="outlined"
              onClick={handleViewStatistics}
              sx={{
                py: 1.2,
                borderRadius: 2,
                borderColor: '#f39c12',
                color: '#f39c12',
                background: 'rgba(243, 156, 18, 0.05)',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: { xs: '0.8rem', sm: '0.85rem' },
                '&:hover': {
                  background: 'rgba(243, 156, 18, 0.1)',
                  borderColor: '#e67e22',
                  color: '#e67e22',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 3px 10px rgba(243, 156, 18, 0.2)'
                }
              }}
            >
              View Statistics
            </Button> */}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FlashcardStudy;
