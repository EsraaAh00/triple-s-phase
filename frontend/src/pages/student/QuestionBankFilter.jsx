import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Stack,
  Autocomplete,
  TextField,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Slider
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Shuffle as ShuffleIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import assessmentService from '../../services/assessment.service';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const QuestionBankFilter = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State for filters
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [questionCount, setQuestionCount] = useState(50);
  
  // State for data
  const [products, setProducts] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  
  // State for loading and counts
  const [loading, setLoading] = useState({
    products: false,
    chapters: false,
    topics: false,
    count: false
  });
  
  const [availableCount, setAvailableCount] = useState(0);
  const [error, setError] = useState(null);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch chapters when products change
  useEffect(() => {
    if (selectedProducts.length > 0) {
      fetchChapters();
    } else {
      setChapters([]);
      setSelectedChapters([]);
    }
  }, [selectedProducts]);

  // Fetch topics when chapters change
  useEffect(() => {
    if (selectedChapters.length > 0) {
      fetchTopics();
    } else {
      setTopics([]);
      setSelectedTopics([]);
    }
  }, [selectedChapters]);

  // Update count when filters change
  useEffect(() => {
    if (selectedProducts.length > 0) {
      fetchAvailableCount();
    } else {
      setAvailableCount(0);
    }
  }, [selectedProducts, selectedChapters, selectedTopics]);

  // Update question count when available count changes
  useEffect(() => {
    if (availableCount > 0) {
      setQuestionCount(availableCount);
    }
  }, [availableCount]);

  const fetchProducts = async () => {
    setLoading(prev => ({ ...prev, products: true }));
    try {
      const response = await assessmentService.getQuestionBankProducts({ 
        status: 'published',
        page_size: 100,
        enrolled_only: true
      });
      
      if (response.success) {
        setProducts(response.data);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products');
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  const fetchChapters = async () => {
    setLoading(prev => ({ ...prev, chapters: true }));
    try {
      const allChapters = [];
      
      for (const productId of selectedProducts) {
        const response = await assessmentService.getChapters(productId, 'questionbank');
        if (response.success) {
          allChapters.push(...response.data);
        }
      }
      
      setChapters(allChapters);
      setError(null);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      setError('Failed to fetch chapters');
    } finally {
      setLoading(prev => ({ ...prev, chapters: false }));
    }
  };

  const fetchTopics = async () => {
    setLoading(prev => ({ ...prev, topics: true }));
    try {
      const allTopics = [];
      
      for (const chapterId of selectedChapters) {
        const response = await assessmentService.getTopics(chapterId, 'questionbank');
        if (response.success) {
          allTopics.push(...response.data);
        }
      }
      
      setTopics(allTopics);
      setError(null);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setError('Failed to fetch topics');
    } finally {
      setLoading(prev => ({ ...prev, topics: false }));
    }
  };

  const fetchAvailableCount = async () => {
    setLoading(prev => ({ ...prev, count: true }));
    try {
      let totalCount = 0;
      
      if (selectedProducts.length > 0) {
        if (selectedTopics.length > 0) {
          // If topics are selected, sum up question counts from selected topics
          for (const topicId of selectedTopics) {
            const topic = topics.find(t => t.id === topicId);
            if (topic && topic.questions_count) {
              totalCount += topic.questions_count;
            }
          }
        } else if (selectedChapters.length > 0) {
          // If chapters are selected, sum up question counts from selected chapters
          for (const chapterId of selectedChapters) {
            const chapter = chapters.find(c => c.id === chapterId);
            if (chapter && chapter.questions_count) {
              totalCount += chapter.questions_count;
            }
          }
        } else {
          // If only products are selected, sum up question counts from selected products
          for (const productId of selectedProducts) {
            const product = products.find(p => p.id === productId);
            if (product && product.questions_count) {
              totalCount += product.questions_count;
            }
          }
        }
      }
      
      setAvailableCount(totalCount);
      console.log('Available count calculated:', totalCount); // Debug log
    } catch (error) {
      console.error('Error calculating count:', error);
      setAvailableCount(0);
    } finally {
      setLoading(prev => ({ ...prev, count: false }));
    }
  };

  const handleProductChange = (event) => {
    const value = event.target.value;
    setSelectedProducts(typeof value === 'string' ? value.split(',') : value);
  };

  const handleChapterChange = (event) => {
    const value = event.target.value;
    setSelectedChapters(typeof value === 'string' ? value.split(',') : value);
  };

  const handleTopicChange = (event) => {
    const value = event.target.value;
    setSelectedTopics(typeof value === 'string' ? value.split(',') : value);
  };

  const handleCreateQuiz = () => {
    if (selectedProducts.length === 0) {
      setError('Please select at least one subject');
      return;
    }

    // Navigate to question bank quiz page with filters
    const params = new URLSearchParams({
      products: selectedProducts.join(','),
      count: questionCount.toString()
    });
    
    // Add chapters and topics if selected
    if (selectedChapters.length > 0) {
      params.append('chapters', selectedChapters.join(','));
    }
    if (selectedTopics.length > 0) {
      params.append('topics', selectedTopics.join(','));
    }
    
    navigate(`/student/questionbank/quiz?${params.toString()}`);
  };

  const handleReset = () => {
    setSelectedProducts([]);
    setSelectedChapters([]);
    setSelectedTopics([]);
    setQuestionCount(50);
    setAvailableCount(0);
    setError(null);
  };

  const getFilterSummary = () => {
    const parts = [];
    if (selectedProducts.length > 0) {
      parts.push(`${selectedProducts.length} product(s)`);
    }
    if (selectedChapters.length > 0) {
      parts.push(`${selectedChapters.length} chapter(s)`);
    }
    if (selectedTopics.length > 0) {
      parts.push(`${selectedTopics.length} topic(s)`);
    }
    return parts.join(' • ');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: { xs: 2, sm: 3, md: 4 },
      px: { xs: 1, sm: 2, md: 4 }
    }}>
        {/* Header */}
        <Box sx={{ 
          mb: { xs: 2, sm: 3 }, 
          background: 'linear-gradient(135deg, #333679 0%, #4DBFB3 50%, #333679 100%)',
          borderRadius: 2,
          p: { xs: 1.5, sm: 2, md: 2.5 },
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1.5, sm: 2 },
          boxShadow: '0 2px 8px rgba(51, 54, 121, 0.2)',
          flexDirection: { xs: 'column', sm: 'row' },
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          {/* Icon */}
          <Box sx={{ 
            width: { xs: 35, sm: 40, md: 45 }, 
            height: { xs: 35, sm: 40, md: 45 }, 
            borderRadius: 1.5, 
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            flexShrink: 0
          }}>
            <Typography sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }, color: 'white' }}>📚</Typography>
          </Box>
          
          {/* Text Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              color: 'white',
              mb: 0.5,
              fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }
            }}>
              {t('questionBankFilter.title')}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 400,
              fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.9rem' }
            }}>
              Create custom quiz from question bank for practice
            </Typography>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filters Section - Full Width */}
            <Paper sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              borderRadius: 2, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              {/* Filters Row */}
              <Box sx={{ 
                display: 'flex', 
                gap: { xs: 2, sm: 3 }, 
                mb: { xs: 3, sm: 4 }, 
                flexWrap: 'wrap',
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
                {/* Subject Filter */}
                <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '200px' }, width: { xs: '100%', sm: 'auto' } }}>
                  <Typography variant="body2" sx={{ 
                    mb: 1, 
                    fontWeight: 600, 
                    color: '#333',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' }
                  }}>
                    {t('questionBankFilter.subject')}
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      multiple
                      value={selectedProducts}
                      onChange={handleProductChange}
                      displayEmpty
                      renderValue={(selected) => {
                        if (selected.length === 0) {
                          return <Typography sx={{ color: '#999', fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>{t('questionBankFilter.subject')}</Typography>;
                        }
                        return (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => {
                              const product = products.find(p => p.id === value);
                              return (
                                <Chip
                                  key={value}
                                  label={product?.title || value}
                                  size="small"
                                  onDelete={() => {
                                    const newValue = selected.filter(item => item !== value);
                                    setSelectedProducts(newValue);
                                  }}
                                  deleteIcon={<CloseIcon />}
                                  sx={{ 
                                    backgroundColor: '#e3f2fd',
                                    color: '#1976d2',
                                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                    height: { xs: 20, sm: 24 },
                                    '& .MuiChip-deleteIcon': {
                                      color: '#1976d2',
                                      fontSize: { xs: '0.7rem', sm: '0.8rem' }
                                    }
                                  }}
                                />
                              );
                            })}
                          </Box>
                        );
                      }}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ddd'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1976d2'
                        },
                        fontSize: { xs: '0.8rem', sm: '0.9rem' }
                      }}
                      disabled={loading.products}
                    >
                      {products.map((product) => (
                        <MenuItem key={product.id} value={product.id}>
                          <Checkbox checked={selectedProducts.indexOf(product.id) > -1} />
                          <ListItemText 
                            primary={product.title}
                            secondary={product.course?.title}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography variant="body2" sx={{ mt: 1, color: '#999' }}>
                    {t('questionBankFilter.subject')}
                  </Typography>
                </Box>

                {/* Chapter Filter */}
                <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '200px' }, width: { xs: '100%', sm: 'auto' } }}>
                  <Typography variant="body2" sx={{ 
                    mb: 1, 
                    fontWeight: 600, 
                    color: '#333',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' }
                  }}>
                    {t('questionBankFilter.chapter')}
                  </Typography>
                  <FormControl fullWidth size="small" disabled={selectedProducts.length === 0}>
                    <Select
                      multiple
                      value={selectedChapters}
                      onChange={handleChapterChange}
                      displayEmpty
                      renderValue={(selected) => {
                        if (selected.length === 0) {
                          return <Typography sx={{ color: '#999', fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>{t('questionBankFilter.chapter')}</Typography>;
                        }
                        return (
                          <Typography sx={{ 
                            color: '#333',
                            fontSize: { xs: '0.8rem', sm: '0.9rem' }
                          }}>
                            {selected.length} selected Chapter{selected.length > 1 ? 's' : ''}
                          </Typography>
                        );
                      }}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ddd'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1976d2'
                        },
                        fontSize: { xs: '0.8rem', sm: '0.9rem' }
                      }}
                      disabled={loading.chapters || selectedProducts.length === 0}
                    >
                      {chapters.map((chapter) => (
                        <MenuItem key={chapter.id} value={chapter.id}>
                          <Checkbox checked={selectedChapters.indexOf(chapter.id) > -1} />
                          <ListItemText 
                            primary={chapter.title}
                            secondary={chapter.product?.title}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Topic Filter */}
                <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '200px' }, width: { xs: '100%', sm: 'auto' } }}>
                  <Typography variant="body2" sx={{ 
                    mb: 1, 
                    fontWeight: 600, 
                    color: '#333',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' }
                  }}>
                    {t('questionBankFilter.topic')}
                  </Typography>
                  <FormControl fullWidth size="small" disabled={selectedChapters.length === 0}>
                    <Select
                      multiple
                      value={selectedTopics}
                      onChange={handleTopicChange}
                      displayEmpty
                      renderValue={(selected) => {
                        if (selected.length === 0) {
                          return <Typography sx={{ color: '#999', fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>{t('questionBankFilter.topic')}</Typography>;
                        }
                        return (
                          <Typography sx={{ 
                            color: '#333',
                            fontSize: { xs: '0.8rem', sm: '0.9rem' }
                          }}>
                            {selected.length} selected Topic{selected.length > 1 ? 's' : ''}
                          </Typography>
                        );
                      }}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ddd'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1976d2'
                        },
                        fontSize: { xs: '0.8rem', sm: '0.9rem' }
                      }}
                      disabled={loading.topics || selectedChapters.length === 0}
                    >
                      {topics.map((topic) => (
                        <MenuItem key={topic.id} value={topic.id}>
                          <Checkbox checked={selectedTopics.indexOf(topic.id) > -1} />
                          <ListItemText 
                            primary={topic.title}
                            secondary={topic.chapter?.title}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* Question Count Slider - Full Width */}
              <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                <Typography variant="body2" sx={{ 
                  mb: { xs: 1.5, sm: 2 }, 
                  fontWeight: 600, 
                  color: '#333',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' }
                }}>
                  {t('questionBankFilter.questionCount', 'Number of Questions')}
                </Typography>
                <Box sx={{ px: { xs: 1, sm: 2 } }}>
                  <Slider
                    value={questionCount}
                    onChange={(event, newValue) => setQuestionCount(newValue)}
                    min={1}
                    max={availableCount || 100}
                    step={1}
                    marks={[
                      { value: 1, label: '1' },
                      { value: availableCount || 100, label: (availableCount || 100).toString() }
                    ]}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value} ${t('commonQuestions', 'Questions')}`}
                    sx={{
                      color: '#1976d2',
                      direction: 'rtl', // Ensure slider always works left-to-right regardless of page direction
                      '& .MuiSlider-thumb': {
                        backgroundColor: '#1976d2',
                        width: { xs: 16, sm: 20 },
                        height: { xs: 16, sm: 20 },
                        '&:hover': {
                          boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)',
                        },
                      },
                      '& .MuiSlider-track': {
                        backgroundColor: '#1976d2',
                        height: { xs: 3, sm: 4 },
                      },
                      '& .MuiSlider-rail': {
                        backgroundColor: '#e0e0e0',
                        height: { xs: 3, sm: 4 },
                      },
                      '& .MuiSlider-mark': {
                        backgroundColor: '#1976d2',
                        width: { xs: 4, sm: 6 },
                        height: { xs: 4, sm: 6 },
                      },
                      '& .MuiSlider-markLabel': {
                        color: '#666',
                        fontSize: { xs: '0.6rem', sm: '0.75rem' },
                      },
                      '& .MuiSlider-valueLabel': {
                        backgroundColor: '#1976d2',
                        fontSize: { xs: '0.7rem', sm: '0.8rem' },
                        '&:before': {
                          borderTopColor: '#1976d2',
                        },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" sx={{ 
                    color: '#1976d2', 
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', sm: '0.8rem' }
                  }}>
                    {t('questionBankFilter.selected', 'Selected')}: {questionCount} {t('commonQuestions', 'Questions')}
                  </Typography>
                </Box>
              </Box>

              {/* Available Questions and Button Row */}
              <Box sx={{ 
                display: 'flex', 
                gap: { xs: 2, sm: 3 }, 
                alignItems: { xs: 'stretch', sm: 'flex-end' }, 
                mb: { xs: 2, sm: 4 },
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
                {/* Available Questions Count */}
                <Box sx={{ flex: 1, mb: { xs: 2, sm: 0 } }}>
                  <Typography variant="h6" sx={{ 
                    color: '#666',
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
                  }}>
                    {t('questionBankFilter.availableQuestions')}: {loading.count ? (
                      <CircularProgress size={16} sx={{ ml: 1 }} />
                    ) : (
                      availableCount.toLocaleString()
                    )}
                  </Typography>
                </Box>

                {/* Create Quiz Button */}
                <Box sx={{ minWidth: { xs: '100%', sm: '200px' } }}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleCreateQuiz}
                    disabled={selectedProducts.length === 0 || loading.count}
                    sx={{
                      py: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #45a049, #5cb85c)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                      },
                      '&:disabled': {
                        background: 'linear-gradient(135deg, #e0e0e0, #bdbdbd)',
                        color: '#9e9e9e',
                        transform: 'none',
                        boxShadow: 'none'
                      }
                    }}
                  >
                    {t('questionBankFilter.createQuiz')}
                  </Button>
                </Box>
              </Box>
            </Paper>
    </Box>
  );
};

export default QuestionBankFilter;
