import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Container,
  Skeleton,
  useTheme,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  alpha,
  keyframes,
  Tabs,
  Tab,
  Badge,
  Divider,
  LinearProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { articleAPI } from '../../../services/api.service';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  PublishedWithChanges as PublishedIcon,
  Drafts as DraftIcon,
  Archive as ArchiveIcon,
  Article as ArticleIcon,
  TrendingUp as TrendingUpIcon,
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Star as StarIcon,
  Share as ShareIcon,
  ArrowForward as ArrowForwardIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(103, 58, 183, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(103, 58, 183, 0); }
  100% { box-shadow: 0 0 0 0 rgba(103, 58, 183, 0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const slideIn = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

// Styled components

const ModernCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 12,
  overflow: 'hidden',
  background: '#ffffff',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
  border: 'none',
  transition: 'all 0.3s ease',
  position: 'relative',
  minHeight: '450px',
  width: '100%',
  '& .image-container': {
    width: '100%',
    height: '200px',
    overflow: 'hidden',
    position: 'relative'
  },
  '& .article-image': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    transition: 'transform 0.4s ease',
    borderRadius: '12px 12px 0 0'
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    '& .article-image': {
      transform: 'scale(1.05)'
    },
    '& .action-buttons': {
      opacity: 1,
    }
  },
  '& .action-buttons': {
    opacity: 0.8,
    transition: 'opacity 0.3s ease',
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 700,
  borderRadius: '20px',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  fontSize: '0.7rem',
  height: 24,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  ...(status === 'published' && {
    backgroundColor: '#2e7d32',
    color: 'white',
    '&:hover': {
      backgroundColor: '#1b5e20',
      transform: 'translateY(-1px)',
    }
  }),
  ...(status === 'draft' && {
    backgroundColor: '#ed6c02',
    color: 'white',
    '&:hover': {
      backgroundColor: '#e65100',
      transform: 'translateY(-1px)',
    }
  }),
  ...(status === 'archived' && {
    backgroundColor: '#757575',
    color: 'white',
    '&:hover': {
      backgroundColor: '#616161',
      transform: 'translateY(-1px)',
    }
  }),
}));

const FilterChip = styled(Chip)(({ theme, active }) => ({
  fontWeight: 600,
  borderRadius: '20px',
  transition: 'all 0.3s ease',
  height: 32,
  ...(active && {
    background: `linear-gradient(45deg, #663399, #42a5f5)`,
    color: 'white',
    boxShadow: `0 4px 12px ${alpha('#663399', 0.3)}`,
    transform: 'translateY(-2px)',
  }),
  '&:hover': {
    transform: active ? 'translateY(-2px)' : 'translateY(-1px)',
    boxShadow: active 
      ? `0 6px 16px ${alpha('#663399', 0.4)}`
      : `0 4px 12px ${alpha('#663399', 0.2)}`,
  }
}));

const SearchBox = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 20,
    backgroundColor: alpha('#ffffff', 0.95),
    backdropFilter: 'blur(10px)',
    '&:hover fieldset': {
      borderColor: '#663399',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#663399',
      borderWidth: 2,
    },
  },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 16,
  background: `linear-gradient(135deg, ${alpha('#663399', 0.08)}, ${alpha('#42a5f5', 0.08)})`,
  border: `1px solid ${alpha('#663399', 0.15)}`,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: `linear-gradient(90deg, #663399, #42a5f5)`,
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${alpha('#663399', 0.2)}`,
  }
}));

const ActionButton = styled(IconButton)(({ theme, variant }) => ({
  width: 32,
  height: 32,
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  backdropFilter: 'blur(10px)',
  ...(variant === 'edit' && {
    backgroundColor: '#663399',
    color: 'white',
    '&:hover': {
      backgroundColor: '#1565c0',
      transform: 'scale(1.1)',
      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
    }
  }),
  ...(variant === 'delete' && {
    backgroundColor: '#d32f2f',
    color: 'white',
    '&:hover': {
      backgroundColor: '#c62828',
      transform: 'scale(1.1)',
      boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
    }
  }),
  ...(variant === 'view' && {
    backgroundColor: '#4DBFB3',
    color: 'white',
    '&:hover': {
      backgroundColor: '#388e3c',
      transform: 'scale(1.1)',
      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
    }
  }),
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha('#ffffff', 0.95)}, ${alpha('#f8f9ff', 0.95)})`,
  borderRadius: 24,
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  boxShadow: `0 8px 32px ${alpha('#663399', 0.08)}`,
  border: `1px solid ${alpha('#663399', 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, #663399, #42a5f5, #1565c0)`,
    backgroundSize: '200% 100%',
    animation: `${shimmer} 3s ease-in-out infinite`,
  }
}));

const ArticlesList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  // Fetch articles from API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        console.log('Fetching articles...');
        
        const response = await articleAPI.getArticles({
          page: currentPage,
          page_size: pageSize,
          search: searchQuery,
          status: activeTab === 0 ? 'published' : activeTab === 1 ? 'draft' : 'archived',
          ordering: sortBy === 'newest' ? '-created_at' : sortBy === 'oldest' ? 'created_at' : '-views_count'
        });
        
        console.log('Articles response:', response);
        
        // Handle different response formats
        let articlesData = [];
        let totalCount = 0;
        
        if (Array.isArray(response)) {
          articlesData = response;
          totalCount = response.length;
        } else if (response.results) {
          articlesData = response.results;
          totalCount = response.count || response.results.length;
        } else if (response.data) {
          articlesData = response.data;
          totalCount = response.total || response.data.length;
        } else {
          articlesData = [];
          totalCount = 0;
        }
        
        // Transform articles data to match our component structure
        const transformedArticles = articlesData.map(article => ({
          id: article.id,
          title: article.title || '',
          summary: article.summary || '',
          status: article.status || 'draft',
          views_count: article.views_count || 0,
          created_at: article.created_at,
          updated_at: article.updated_at,
          published_at: article.published_at,
          featured: article.featured || false,
          tags: article.tags ? article.tags.map(tag => tag.name || tag) : [],
          image: article.image ? (article.image.startsWith('http') ? article.image : `http://localhost:8000${article.image}`) : null,
          reading_time: article.reading_time || 5,
          likes_count: article.likes_count || 0,
          comments_count: article.comments_count || 0,
          category: article.category || 'عام'
        }));
        
        setArticles(transformedArticles);
        setTotalCount(totalCount);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setError(t('articlesLoadError'));
        setLoading(false);
      }
    };

    fetchArticles();
  }, [currentPage, pageSize, searchQuery, activeTab, sortBy]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };



  const handleEdit = (article) => {
    navigate(`/teacher/articles/${article.id}/edit`);
  };

  const handleDelete = (article) => {
    setSelectedArticle(article);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (article) => {
    console.log(t('articlesViewingDetails'), article.title);
    navigate(`/articles/${article.slug || article.id}`);
  };

  const confirmDelete = async () => {
    try {
      console.log('Deleting article:', selectedArticle.id);
      
      // Call API to delete article
      await articleAPI.deleteArticle(selectedArticle.id);
      
      // Remove article from local state
      setArticles(prev => prev.filter(article => article.id !== selectedArticle.id));
      setDeleteDialogOpen(false);
      setSelectedArticle(null);
      
      console.log('Article deleted successfully');
    } catch (error) {
      console.error('Error deleting article:', error);
      setError(t('articlesDeleteError'));
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || article.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case 'created_at':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'updated_at':
        return new Date(b.updated_at) - new Date(a.updated_at);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'views':
        return b.views_count - a.views_count;
      default:
        return 0;
    }
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStats = () => {
    const total = articles.length;
    const published = articles.filter(a => a.status === 'published').length;
    const draft = articles.filter(a => a.status === 'draft').length;
    const archived = articles.filter(a => a.status === 'archived').length;
    const totalViews = articles.reduce((sum, a) => sum + a.views_count, 0);
    
    return { total, published, draft, archived, totalViews };
  };

  const stats = getStats();

  const renderArticleCard = (article) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
      style={{ width: '100%' }}
    >
      <ModernCard 
        sx={{ height: '100%', cursor: 'pointer', width: '100%' }}
        onClick={() => handleViewDetails(article)}
      >
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <Box className="image-container" sx={{ 
            position: 'relative', 
            width: '100%', 
            height: '200px',
            overflow: 'hidden'
          }}>
            <img
              src={article.image || 'https://via.placeholder.com/400x200/4A6CF7/ffffff?text=No+Image'}
              alt={article.title}
              className="article-image"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                transition: 'transform 0.4s ease',
                borderRadius: '12px 12px 0 0'
              }}
              onError={(e) => {
                console.error('Image failed to load:', article.image);
                e.target.src = 'https://via.placeholder.com/400x200/4A6CF7/ffffff?text=Image+Error';
              }}
              onLoad={() => {
                console.log('Article image loaded successfully:', article.image);
              }}
            />
          </Box>
          
          {/* Action Buttons */}
          <Box 
            className="action-buttons"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              opacity: 1,
              zIndex: 3
            }}
          >
            <Tooltip title={t('articlesViewDetails')} placement="left">
              <ActionButton
                variant="view"
                onClick={(e) => { e.stopPropagation(); handleViewDetails(article); }}
                size="small"
                sx={{
                  backgroundColor: '#4DBFB3',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#388e3c',
                    transform: 'scale(1.1)',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                  }
                }}
              >
                <OpenInNewIcon sx={{ fontSize: 16 }} />
              </ActionButton>
            </Tooltip>
            <Tooltip title={t('articlesEditArticle')} placement="left">
              <ActionButton
                variant="edit"
                onClick={(e) => { e.stopPropagation(); handleEdit(article); }}
                size="small"
              >
                <EditIcon sx={{ fontSize: 16 }} />
              </ActionButton>
            </Tooltip>
            <Tooltip title={t('articlesDeleteArticle')} placement="left">
              <ActionButton
                variant="delete"
                onClick={(e) => { e.stopPropagation(); handleDelete(article); }}
                size="small"
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </ActionButton>
            </Tooltip>
          </Box>
          
          {/* Featured Badge */}
          {article.featured && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                zIndex: 2,
              }}
            >
              <Box
                sx={{
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  borderRadius: '6px',
                  px: 0.6,
                  py: 0.2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.2,
                  boxShadow: '0 2px 6px rgba(255, 215, 0, 0.4)',
                }}
              >
                <StarIcon sx={{ fontSize: 10, color: 'white' }} />
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.55rem' }}>
                  {t('articlesFeatured')}
                </Typography>
              </Box>
            </Box>
          )}
          
          {/* Status Badge */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              zIndex: 2,
            }}
          >
            <StatusChip
              label={article.status === 'published' ? t('articlesPublished') : 
                     article.status === 'draft' ? t('articlesDraft') : t('articlesArchived')}
              status={article.status}
              size="small"
            />
          </Box>
        </Box>
        
        <CardContent className="card-content" sx={{ 
          flexGrow: 1, 
          p: 3, 
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          minHeight: '250px'
        }}>
          {/* Header with Status, Date and Quick View */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StatusChip
                label={article.status === 'published' ? t('articlesPublished') : 
                       article.status === 'draft' ? t('articlesDraft') : t('articlesArchived')}
                status={article.status}
                size="small"
              />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {formatDate(article.updated_at)}
              </Typography>
            </Box>
            <Tooltip title={t('articlesViewDetails')}>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); handleViewDetails(article); }}
                sx={{
                  width: 28,
                  height: 28,
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  color: '#4DBFB3',
                  '&:hover': {
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    transform: 'scale(1.1)',
                  }
                }}
              >
                <OpenInNewIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
          
          {/* Title */}
          <Typography variant="h6" component="h3" sx={{ 
            fontWeight: 700, 
            lineHeight: 1.3, 
            minHeight: '2.4em',
            maxHeight: '2.4em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            color: '#333',
            fontSize: '1.1rem',
            mb: 2
          }}>
            {article.title}
          </Typography>
          
          {/* Summary */}
          <Typography variant="body2" color="text.secondary" sx={{ 
            lineHeight: 1.5, 
            minHeight: '3.6em',
            maxHeight: '3.6em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            fontSize: '0.85rem',
            mb: 3,
            color: '#666'
          }}>
            {article.summary}
          </Typography>
          
          {/* Footer with Actions and Stats */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 'auto'
          }}>
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              alignItems: 'center'
            }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<OpenInNewIcon />}
                onClick={(e) => { e.stopPropagation(); handleViewDetails(article); }}
                sx={{
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: '#4DBFB3',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                  '&:hover': {
                    backgroundColor: '#388e3c',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                  }
                }}
              >
                {t('articlesViewDetails')}
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={(e) => { e.stopPropagation(); handleEdit(article); }}
                sx={{
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  borderColor: '#663399',
                  color: '#663399',
                  '&:hover': {
                    borderColor: '#1565c0',
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                {t('articlesEdit')}
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 0.5
              }}>
                <ScheduleIcon sx={{ fontSize: 14, color: '#999' }} />
                <Typography variant="caption" sx={{ fontWeight: 500, color: '#999', fontSize: '0.7rem' }}>
                  {article.reading_time} {t('articlesMinutes')}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 0.5
              }}>
                <VisibilityIcon sx={{ fontSize: 14, color: '#999' }} />
                <Typography variant="caption" sx={{ fontWeight: 500, color: '#999', fontSize: '0.7rem' }}>
                  {article.views_count.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 0.5
              }}>
                <FavoriteIcon sx={{ fontSize: 14, color: '#999' }} />
                <Typography variant="caption" sx={{ fontWeight: 500, color: '#999', fontSize: '0.7rem' }}>
                  {article.likes_count.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 0.5
              }}>
                <CommentIcon sx={{ fontSize: 14, color: '#999' }} />
                <Typography variant="caption" sx={{ fontWeight: 500, color: '#999', fontSize: '0.7rem' }}>
                  {article.comments_count.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </ModernCard>
    </motion.div>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Compact Header Skeleton */}
        <Box sx={{ 
          mb: 4, 
          p: 3, 
          background: 'linear-gradient(135deg, #663399 0%, #42a5f5 100%)',
          borderRadius: 3,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            position: 'absolute', 
            top: -20, 
            right: -20, 
            width: 100, 
            height: 100, 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.1)',
            zIndex: 1
          }} />
          <Box sx={{ 
            position: 'absolute', 
            bottom: -30, 
            left: -30, 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.08)',
            zIndex: 1
          }} />
          
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <ArticleIcon sx={{ fontSize: 32, color: 'white' }} />
              <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
                {t('articlesManagement')}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
              {t('articlesManageAndCreate')}
            </Typography>
          </Box>
        </Box>
        
        <Container sx={{ py: 4 }}>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} md={6} key={item}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 2 }} />
                <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={20} width="60%" sx={{ mb: 1 }} />
                <Skeleton variant="text" height={20} width="40%" />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Compact Header */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        background: 'linear-gradient(90deg, #333679 0%, #4DBFB3 100%)',
        borderRadius: 3,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          position: 'absolute', 
          top: -20, 
          right: -20, 
          width: 100, 
          height: 100, 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.1)',
          zIndex: 1
        }} />
        <Box sx={{ 
          position: 'absolute', 
          bottom: -30, 
          left: -30, 
          width: 80, 
          height: 80, 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.08)',
          zIndex: 1
        }} />
        
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <ArticleIcon sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
              {t('articlesManagement')}
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
            {t('articlesManageAndCreate')}
          </Typography>
        </Box>
      </Box>

      <Container sx={{ py: 3 }}>
        {/* Create Article Button - Fixed */}
        <Box sx={{ 
          position: 'fixed', 
          top: 100, 
          [i18n.language === 'en' ? 'right' : 'left']: 32, 
          zIndex: 1200 
        }}>
          <IconButton
            onClick={() => navigate('/teacher/articles/create')}
            sx={{
              width: 56,
              height: 56,
              background: 'linear-gradient(90deg, #333679 0%, #4DBFB3 100%)',
              boxShadow: '0 4px 20px rgba(14, 81, 129, 0.3)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(90deg, #0a3d5f 0%, #d17a6e 100%)',
                boxShadow: '0 6px 25px rgba(14, 81, 129, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <AddIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Box>
        
        {/* Compact Statistics Row */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 4, 
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            p: 2, 
            backgroundColor: 'background.paper', 
            borderRadius: 2, 
            border: '1px solid #e0e0e0',
            minWidth: 140,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <ArticleIcon sx={{ color: '#663399', fontSize: 24 }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary">
                {stats.total}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('articlesTotalArticles')}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            p: 2, 
            backgroundColor: 'background.paper', 
            borderRadius: 2, 
            border: '1px solid #e0e0e0',
            minWidth: 140,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <PublishedIcon sx={{ color: '#2e7d32', fontSize: 24 }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="success.main">
                {stats.published}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('articlesPublished')}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            p: 2, 
            backgroundColor: 'background.paper', 
            borderRadius: 2, 
            border: '1px solid #e0e0e0',
            minWidth: 140,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <DraftIcon sx={{ color: '#f57c00', fontSize: 24 }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="warning.main">
                {stats.draft}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('articlesDraft')}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            p: 2, 
            backgroundColor: 'background.paper', 
            borderRadius: 2, 
            border: '1px solid #e0e0e0',
            minWidth: 140,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <VisibilityIcon sx={{ color: '#7b1fa2', fontSize: 24 }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="secondary.main">
                {stats.totalViews.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('articlesTotalViews')}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Filters and Search */}
        <HeaderContainer>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mr: 2, color: 'primary.main' }}>
              {t('articlesFilterArticles')}:
            </Typography>
            
            <SearchBox
              placeholder={t('articlesSearchPlaceholder')}
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                minWidth: 280, 
                flexGrow: 1,
              }}
            />
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FilterChip
                label={t('articlesAll')}
                onClick={() => handleFilterChange('all')}
                active={filterStatus === 'all'}
              />
              <FilterChip
                label={t('articlesPublished')}
                onClick={() => handleFilterChange('published')}
                active={filterStatus === 'published'}
              />
              <FilterChip
                label={t('articlesDraft')}
                onClick={() => handleFilterChange('draft')}
                active={filterStatus === 'draft'}
              />
              <FilterChip
                label={t('articlesArchived')}
                onClick={() => handleFilterChange('archived')}
                active={filterStatus === 'archived'}
              />
            </Box>
          </Box>
          
        </HeaderContainer>

        <Box sx={{ mt: 3 }}>
          {sortedArticles.length > 0 ? (
          <Box>
            <AnimatePresence>
              <Grid container spacing={3} sx={{ width: '100%' }}>
                {sortedArticles.map((article) => (
                  <Grid item xs={12} md={6} key={article.id} sx={{ display: 'flex' }}>
                    {renderArticleCard(article)}
                  </Grid>
                ))}
              </Grid>
            </AnimatePresence>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                {t('articlesNoArticles')} {searchQuery && `${t('articlesMatching')} "${searchQuery}"`}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/teacher/articles/create')}
                sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #333679 0%, #4DBFB3 100%)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #0a3d5f 0%, #d17a6e 100%)',
                  },
                }}
              >
                {t('articlesCreateNew')}
              </Button>
            </motion.div>
          </Box>
        )}
        </Box>
      </Container>



      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 400
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          fontWeight: 600,
          color: '#d32f2f',
          borderBottom: '1px solid #eee',
          pb: 2
        }}>
          ⚠️ {t('articlesConfirmDelete')}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ textAlign: 'center', mb: 2 }}>
            {t('articlesConfirmDeleteMessage')}:
          </Typography>
          <Typography sx={{ 
            fontWeight: 600, 
            textAlign: 'center', 
            color: 'primary.main',
            mb: 2,
            p: 2,
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
            borderRadius: 2
          }}>
            "{selectedArticle?.title}"
          </Typography>
          <Typography sx={{ 
            textAlign: 'center', 
            color: 'error.main',
            fontSize: '0.9rem',
            fontWeight: 500
          }}>
            ⚠️ {t('articlesDeleteWarning')}!
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            {t('articlesCancel')}
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            sx={{ 
              borderRadius: 2,
              px: 3,
              fontWeight: 600
            }}
          >
            {t('articlesDeleteArticle')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ArticlesList; 