import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Divider,
  LinearProgress,
  Chip,
  Stack,
  Dialog,
  DialogContent,
  DialogActions,
  Fade
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import assessmentService from '../../services/assessment.service';

const QuestionBankQuiz = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for quiz
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);

  // Get filter parameters from URL
  const searchParams = new URLSearchParams(location.search);
  const products = searchParams.get('products')?.split(',') || [];
  const chapters = searchParams.get('chapters')?.split(',') || [];
  const topics = searchParams.get('topics')?.split(',') || [];
  const questionCount = parseInt(searchParams.get('count')) || 10;
  
  console.log('QuestionBankQuiz - Filter parameters:', { products, chapters, topics, questionCount });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // Build query parameters for fetching questions
      // Request more questions than needed to ensure we have enough after filtering
      const params = {
        page_size: Math.max(questionCount * 2, 50), // Request more than needed
        random: 'true'
      };

      // Add product filters
      if (products.length > 0) {
        params.product__in = products.join(',');
      }

      // Add chapter filters (if available)
      if (chapters.length > 0) {
        params.chapter__in = chapters.join(',');
      }

      // Add topic filters (if available)
      if (topics.length > 0) {
        params.topic__in = topics.join(',');
      }

      console.log('Fetching questions with params:', params);
      console.log('Token from localStorage:', localStorage.getItem('token'));
      const response = await assessmentService.getQuestions(params);
      console.log('Questions response:', response);
      
      if (response.success) {
        // Use all available questions and shuffle them
        const shuffled = response.data.sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
        console.log(`Successfully loaded ${shuffled.length} questions (requested: ${questionCount}, available: ${response.data.length})`);
        
        if (shuffled.length === 0) {
          setError('No questions found with the selected filters');
        }
      } else {
        setError(response.error || 'Failed to fetch questions');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    setShowAnswer(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Quiz completed
      setQuizCompleted(true);
      calculateScore();
      setShowCompletionPopup(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer === question.correct_answer) {
        correctAnswers++;
      }
    });
    
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    setScore({
      correct: correctAnswers,
      total: questions.length,
      percentage: percentage
    });
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuizCompleted(false);
    setScore(null);
    setShowAnswer(false);
    setShowCompletionPopup(false);
    fetchQuestions();
  };

  const handleBackToFilter = () => {
    navigate('/student/questionbank/filter');
  };

  const handleGoToHomepage = () => {
    navigate('/student/dashboard');
  };

  const handleCreateNewQuiz = () => {
    navigate('/student/questionbank/filter');
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 4,
        px: 2
      }}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={handleBackToFilter}
            startIcon={<ArrowBackIcon />}
          >
            Back to Filter
          </Button>
        </Container>
      </Box>
    );
  }

  if (questions.length === 0) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 4,
        px: 2
      }}>
        <Container maxWidth="md">
          <Alert severity="info" sx={{ mb: 3 }}>
            No questions found with the selected filters. Please try different filters.
          </Alert>
          <Button 
            variant="contained" 
            onClick={handleBackToFilter}
            startIcon={<ArrowBackIcon />}
          >
            Back to Filter
          </Button>
        </Container>
      </Box>
    );
  }


  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: 4,
      px: 2
    }}>
      <Container maxWidth="md">
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            {t('questionBankQuiz.title')}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#4caf50',
                borderRadius: 4
              }
            }} 
          />
          <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Typography>
        </Paper>

        {/* Question Card */}
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            {currentQuestion.question_text}
          </Typography>

          {currentQuestion.question_type === 'mcq' && currentQuestion.options && (
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              >
                {currentQuestion.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio />}
                    label={option}
                    disabled={showAnswer}
                    sx={{ 
                      mb: 1,
                      '& .MuiFormControlLabel-label': {
                        fontSize: '1rem'
                      }
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {currentQuestion.question_type === 'true_false' && (
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              >
                <FormControlLabel
                  value="true"
                  control={<Radio />}
                  label="True"
                  disabled={showAnswer}
                  sx={{ mb: 1 }}
                />
                <FormControlLabel
                  value="false"
                  control={<Radio />}
                  label="False"
                  disabled={showAnswer}
                  sx={{ mb: 1 }}
                />
              </RadioGroup>
            </FormControl>
          )}

          {/* Show Answer and Explanation */}
          {showAnswer && (
            <Box sx={{ mt: 3, p: 3, borderRadius: 2, background: 'rgba(76, 175, 80, 0.05)', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#4caf50', fontWeight: 600 }}>
                {t('questionBankQuiz.correctAnswer')}:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, p: 2, background: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                {currentQuestion.correct_answer}
              </Typography>
              
              {currentQuestion.explanation && (
                <>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 600 }}>
                    {t('questionBankQuiz.explanation')}:
                  </Typography>
                  <Typography variant="body1" sx={{ p: 2, background: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                    {currentQuestion.explanation}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </Paper>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            startIcon={<ArrowBackIcon />}
          >
            {t('questionBankQuiz.previous')}
          </Button>

          <Button
            variant="contained"
            onClick={handleNextQuestion}
            endIcon={<ArrowForwardIcon />}
            disabled={!answers[currentQuestion.id] || !showAnswer}
          >
            {currentQuestionIndex === questions.length - 1 ? t('questionBankQuiz.finishQuiz') : t('questionBankQuiz.next')}
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
              {t('questionBankQuiz.quizCompleted')} 🎉
            </Typography>
            
            <Typography variant="h2" sx={{ 
              color: score?.percentage >= 70 ? '#4caf50' : '#f44336',
              fontWeight: 'bold',
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.5rem' }
            }}>
              {score?.percentage}%
            </Typography>
            
            <Typography variant="body1" sx={{ 
              color: '#666',
              fontWeight: 500,
              fontSize: { xs: '0.8rem', sm: '0.9rem' }
            }}>
              You got {score?.correct} out of {score?.total} questions correct
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
                  QUIZ
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
                        background: i <= (score?.correct || 0) ? '#27ae60' : '#e74c3c',
                        mr: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.4rem'
                      }}>
                        {i <= (score?.correct || 0) ? '✓' : '✗'}
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
              {t('questionBankQuiz.goToHomepage')}
            </Button>

            <Button
              variant="contained"
              onClick={handleCreateNewQuiz}
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
              {t('questionBankQuiz.createNewQuiz')}
            </Button>

            <Button
              variant="contained"
              onClick={handleRestartQuiz}
              sx={{
                py: 1.2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #3498db, #2980b9)',
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: { xs: '0.8rem', sm: '0.85rem' },
                boxShadow: '0 3px 10px rgba(52, 152, 219, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2980b9, #1f5f8b)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 5px 14px rgba(52, 152, 219, 0.4)'
                }
              }}
            >
              {t('questionBankQuiz.tryAgain')}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default QuestionBankQuiz;
