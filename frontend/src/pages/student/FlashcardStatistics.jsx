import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  LinearProgress,
  Chip,
  Stack,
  Divider,
  IconButton,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Flag as FlagIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const FlashcardStatistics = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location.state?.stats) {
      setStats(location.state.stats);
      setLoading(false);
    } else {
      setError('No statistics data available');
      setLoading(false);
    }
  }, [location.state]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getPerformanceColor = (accuracy) => {
    if (accuracy >= 80) return '#4caf50';
    if (accuracy >= 60) return '#ff9800';
    return '#f44336';
  };

  const getPerformanceText = (accuracy) => {
    if (accuracy >= 80) return 'Excellent';
    if (accuracy >= 60) return 'Good';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading statistics...
        </Typography>
      </Container>
    );
  }

  if (error || !stats) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'No statistics data available'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/student/flashcards/filter')}
        >
          Back to Flashcard Filter
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: { xs: 2, sm: 3, md: 4 },
      px: { xs: 1, sm: 2 }
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ 
          mb: { xs: 3, sm: 4 }, 
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                onClick={() => navigate('/student/flashcards/filter')}
                sx={{
                  background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                  color: 'white',
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0, #1976d2)',
                    transform: 'scale(1.05)',
                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
                  }
                }}
              >
                <ArrowBackIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.3rem' } }} />
              </IconButton>
              <Box>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' }
                }}>
                  Study Statistics
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#666',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' }
                }}>
                  Your flashcard study performance
                </Typography>
              </Box>
            </Box>
            
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={() => navigate('/student/dashboard')}
                size="small"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Home
              </Button>
              <Button
                variant="contained"
                startIcon={<SchoolIcon />}
                onClick={() => navigate('/student/flashcards/filter')}
                size="small"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #45a049, #5cb85c)'
                  }
                }}
              >
                Study Again
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3}>
          {/* Overall Performance */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ 
                    color: getPerformanceColor(stats.accuracy),
                    fontSize: '2rem',
                    mr: 1
                  }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Overall Performance
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h2" sx={{ 
                    fontWeight: 700,
                    color: getPerformanceColor(stats.accuracy),
                    mb: 1
                  }}>
                    {stats.accuracy.toFixed(1)}%
                  </Typography>
                  <Chip 
                    label={getPerformanceText(stats.accuracy)}
                    sx={{
                      backgroundColor: getPerformanceColor(stats.accuracy),
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                </Box>

                <LinearProgress 
                  variant="determinate" 
                  value={stats.accuracy} 
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getPerformanceColor(stats.accuracy),
                      borderRadius: 4
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Time Spent */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TimerIcon sx={{ 
                    color: '#ff9800',
                    fontSize: '2rem',
                    mr: 1
                  }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Time Spent
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" sx={{ 
                    fontWeight: 700,
                    color: '#ff9800',
                    mb: 1
                  }}>
                    {formatTime(stats.timeSpent)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Total study time
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Correct Answers */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <CheckCircleIcon sx={{ 
                  color: '#4caf50',
                  fontSize: '2.5rem',
                  mb: 1
                }} />
                <Typography variant="h3" sx={{ 
                  fontWeight: 700,
                  color: '#4caf50',
                  mb: 1
                }}>
                  {stats.correctCount}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Correct Answers
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Incorrect Answers */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <CancelIcon sx={{ 
                  color: '#f44336',
                  fontSize: '2.5rem',
                  mb: 1
                }} />
                <Typography variant="h3" sx={{ 
                  fontWeight: 700,
                  color: '#f44336',
                  mb: 1
                }}>
                  {stats.incorrectCount}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Incorrect Answers
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <SchoolIcon sx={{ 
                  color: '#1976d2',
                  fontSize: '2.5rem',
                  mb: 1
                }} />
                <Typography variant="h3" sx={{ 
                  fontWeight: 700,
                  color: '#1976d2',
                  mb: 1
                }}>
                  {stats.totalCards}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Total Cards
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Flagged Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <FlagIcon sx={{ 
                  color: '#ff9800',
                  fontSize: '2.5rem',
                  mb: 1
                }} />
                <Typography variant="h3" sx={{ 
                  fontWeight: 700,
                  color: '#ff9800',
                  mb: 1
                }}>
                  {stats.flaggedCount}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Flagged Cards
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ 
          mt: 4, 
          display: 'flex', 
          justifyContent: 'center',
          gap: 2,
          flexWrap: 'wrap'
        }}>
          <Button
            variant="contained"
            startIcon={<SchoolIcon />}
            onClick={() => navigate('/student/flashcards/filter')}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049, #5cb85c)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)'
              }
            }}
          >
            Study Again
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/student/dashboard')}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              borderColor: '#1976d2',
              color: '#1976d2',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': {
                background: 'rgba(25, 118, 210, 0.05)',
                borderColor: '#1565c0',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
              }
            }}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default FlashcardStatistics;