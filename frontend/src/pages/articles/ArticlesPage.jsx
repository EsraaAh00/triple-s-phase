import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Container,
  Skeleton,
  useTheme,
  IconButton,
  Tooltip,
  Avatar,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  alpha,
  keyframes
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  Article as ArticleIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { articleAPI, bannerAPI } from '../../services/api.service';
import { useArticle } from '../../contexts/ArticleContext';
import BackGroundImage from '../../assets/images/BackGround.png';
import BGTriangleImage from '../../assets/images/BGtriangle.png';

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
`;

const triangleFloat = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-15px) rotate(2deg); }
  50% { transform: translateY(-8px) rotate(-1deg); }
  75% { transform: translateY(-20px) rotate(1deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

// Styled components
const HeroSection = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'backgroundImage',
})(({ theme, backgroundImage }) => ({
  background: `url(${backgroundImage || BackGroundImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'fixed',
  color: 'white',
  padding: theme.spacing(12, 0, 6), // Increased padding for more height
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  minHeight: '65vh', // Decreased height from 80vh to 65vh
  display: 'flex',
  alignItems: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.25) 50%, rgba(0, 0, 0, 0.3) 100%),
      url(${backgroundImage || BackGroundImage})
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    filter: 'brightness(1.2) contrast(1.1) saturate(1.1)',
    zIndex: 1,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '200%',
    height: '200%',
    background: `radial-gradient(circle, ${alpha('#ffffff', 0.08)} 0%, transparent 70%)`,
    transform: 'translate(-50%, -50%)',
    animation: `${float} 6s ease-in-out infinite`,
    zIndex: 2,
  }
}));

const AnimatedTriangle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '20px',
  left: '20px',
  width: '250px',
  height: '250px',
  backgroundImage: `url(${BGTriangleImage})`,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  opacity: 0.7,
  zIndex: 2,
  animation: `${triangleFloat} 4s ease-in-out infinite`,
  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
  '&:hover': {
    opacity: 1,
    transform: 'scale(1.1)',
  },
  [theme.breakpoints.down('md')]: {
    width: '200px',
    height: '200px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '160px',
    height: '160px',
    bottom: '15px',
    left: '15px',
  },
  [theme.breakpoints.down('xs')]: {
    width: '120px',
    height: '120px',
  }
}));

const ModernCard = styled(Card)(({ theme }) => ({
  height: '420px', // ارتفاع ثابت مطلق
  width: '100%', // عرض كامل
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 16,
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  border: '1px solid rgba(25, 118, 210, 0.08)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #663399, #42a5f5, #1565c0)',
    backgroundSize: '200% 100%',
    animation: `${shimmer} 3s ease-in-out infinite`,
  },
  '&:hover': {
    transform: 'translateY(-12px)',
    boxShadow: '0 24px 48px rgba(25, 118, 210, 0.18)',
    '& .article-image': {
      transform: 'scale(1.05)'
    },
    '& .read-more': {
      transform: 'translateY(-2px)',
    }
  }
}));

const CategoryChip = styled(Chip)(({ theme, category }) => ({
  fontWeight: 800,
  borderRadius: '25px',
  fontSize: '0.65rem',
  height: 28,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px) scale(1.05)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
  },
  ...(category === 'تطوير الويب' && {
    background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
    color: 'white',
  }),
  ...(category === 'الذكاء الاصطناعي' && {
    background: 'linear-gradient(135deg, #2196F3, #42A5F5)',
    color: 'white',
  }),
  ...(category === 'تصميم' && {
    background: 'linear-gradient(135deg, #FF9800, #FFB74D)',
    color: 'white',
  }),
  ...(category === 'تطوير الموبايل' && {
    background: 'linear-gradient(135deg, #9C27B0, #BA68C8)',
    color: 'white',
  }),
  ...(category === 'الأمن السيبراني' && {
    background: 'linear-gradient(135deg, #F44336, #EF5350)',
    color: 'white',
  }),
  ...(category === 'قواعد البيانات' && {
    background: 'linear-gradient(135deg, #607D8B, #90A4AE)',
    color: 'white',
  }),
}));

const SearchBox = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 25,
    backgroundColor: alpha('#ffffff', 0.95),
    backdropFilter: 'blur(10px)',
    fontSize: '1.1rem',
    '&:hover fieldset': {
      borderColor: '#333679',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#333679',
      borderWidth: 2,
    },
  },
}));

const FilterPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 20,
  background: `linear-gradient(135deg, ${alpha('#ffffff', 0.95)}, ${alpha('#f8f9ff', 0.95)})`,
  backdropFilter: 'blur(20px)',
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
    height: '3px',
    background: `linear-gradient(90deg, #663399, #42a5f5, #1565c0)`,
    backgroundSize: '200% 100%',
    animation: `${shimmer} 3s ease-in-out infinite`,
  }
}));

const ActionButton = styled(IconButton)(({ theme, variant }) => ({
  width: 40,
  height: 40,
  borderRadius: '14px',
  transition: 'all 0.3s ease',
  ...(variant === 'like' && {
    backgroundColor: alpha('#663399', 0.1),
    color: '#663399',
    '&:hover': {
      backgroundColor: '#663399',
      color: 'white',
      transform: 'scale(1.1)',
    }
  }),
  ...(variant === 'bookmark' && {
    backgroundColor: alpha('#42a5f5', 0.1),
    color: '#42a5f5',
    '&:hover': {
      backgroundColor: '#42a5f5',
      color: 'white',
      transform: 'scale(1.1)',
    }
  }),
}));

const ReadMoreButton = styled(Box)(({ theme, category }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  fontWeight: 700,
  fontSize: '0.85rem',
  color: '#663399',
  padding: '8px 16px',
  borderRadius: '25px',
  background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(66, 165, 245, 0.1))',
  border: '1px solid rgba(25, 118, 210, 0.2)',
  '& .arrow-circle': {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    ...(category === 'تطوير الويب' && {
      background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
    }),
    ...(category === 'الذكاء الاصطناعي' && {
      background: 'linear-gradient(135deg, #2196F3, #42A5F5)',
    }),
    ...(category === 'تصميم' && {
      background: 'linear-gradient(135deg, #FF9800, #FFB74D)',
    }),
    ...(category === 'تطوير الموبايل' && {
      background: 'linear-gradient(135deg, #9C27B0, #BA68C8)',
    }),
    ...(category === 'الأمن السيبراني' && {
      background: 'linear-gradient(135deg, #F44336, #EF5350)',
    }),
    ...(category === 'قواعد البيانات' && {
      background: 'linear-gradient(135deg, #607D8B, #90A4AE)',
    }),
  },
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.15), rgba(66, 165, 245, 0.15))',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(25, 118, 210, 0.2)',
    '& .arrow-circle': {
      transform: 'scale(1.15) rotate(15deg)',
      boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
    }
  }
}));

const ArticlesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { saveArticleData } = useArticle();
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bookmarkedArticles, setBookmarkedArticles] = useState(new Set());
  const [likedArticles, setLikedArticles] = useState(new Set());
  const [headerBanner, setHeaderBanner] = useState(null);

  // Helper function to get image URL
  const getImageUrl = (image) => {
    if (!image) {
      return BackGroundImage;
    }

    if (typeof image === 'string') {
      // If it's already a full URL, return it
      if (image.startsWith('http')) return image;

      // If it's a relative path, construct full URL
      return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${image}`;
    }

    return BackGroundImage;
  };

  // Fetch header banner from API
  useEffect(() => {
    const fetchHeaderBanner = async () => {
      try {
        console.log('🔄 Fetching header banner from API...');

        // Try to get header banners specifically
        let bannerData;
        try {
          console.log('🔍 Trying to fetch header banners...');
          bannerData = await bannerAPI.getHeaderBanners();
          console.log('✅ Header banners received:', bannerData);
        } catch (headerBannerError) {
          console.log('⚠️ Header banners failed, trying by type...');
          try {
            bannerData = await bannerAPI.getBannersByType('header');
            console.log('✅ Header banners by type received:', bannerData);
          } catch (byTypeError) {
            console.log('⚠️ By type failed, trying active banners...');
            bannerData = await bannerAPI.getActiveBanners();
            console.log('✅ Active banners received:', bannerData);
          }
        }

        // Filter to only header type banners
        let filteredBanners = [];
        if (Array.isArray(bannerData)) {
          filteredBanners = bannerData.filter(banner => banner.banner_type === 'header');
        } else if (bannerData?.results) {
          filteredBanners = bannerData.results.filter(banner => banner.banner_type === 'header');
        } else if (bannerData?.data) {
          filteredBanners = bannerData.data.filter(banner => banner.banner_type === 'header');
        }

        console.log('📊 Filtered header banners:', filteredBanners.length);

        // Set the first header banner
        if (filteredBanners.length > 0) {
          const banner = filteredBanners[0];
          setHeaderBanner({
            id: banner.id,
            title: banner.title,
            description: banner.description || '',
            image_url: getImageUrl(banner.image || banner.image_url),
            url: banner.url || null,
            banner_type: banner.banner_type || 'header'
          });
          console.log('✅ Header banner set successfully');
        } else {
          console.log('⚠️ No header banners found');
          setHeaderBanner(null);
        }

      } catch (error) {
        console.error('❌ Error fetching header banner:', error);
        console.error('❌ Error details:', error.response?.data || error.message);
        setHeaderBanner(null);
      }
    };

    fetchHeaderBanner();
  }, []);

  // Fetch articles from API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        console.log('Fetching articles from API...');

        const response = await articleAPI.getArticles({
          page: currentPage,
          page_size: 9, // زيادة عدد المقالات لكل صفحة
          search: searchQuery,
          status: 'published',
          ordering: sortBy === 'latest' ? '-created_at' :
            sortBy === 'oldest' ? 'created_at' :
              sortBy === 'popular' ? '-views_count' : '-created_at'
        });

        console.log('Articles API response:', response);

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

        // Transform articles data to match our component structure with comprehensive data
        const transformedArticles = articlesData.map(article => ({
          id: article.id,
          slug: article.slug,
          title: article.title || '',
          summary: article.summary || '',
          content: article.content || '',
          author: {
            id: article.author || article.author_id,
            name: article.author_name || article.author?.name || article.author?.first_name || 'مؤلف غير معروف',
            avatar: article.author?.image_profile || article.author?.avatar || `https://via.placeholder.com/40x40/1976d2/ffffff?text=${(article.author_name || article.author?.name || 'A').charAt(0)}`
          },
          category: article.category || article.category_name || 'عام',
          category_id: article.category_id,
          tags: article.tags ? (Array.isArray(article.tags) ? article.tags.map(tag => tag.name || tag) : [article.tags]) : [],
          image: article.image ? (article.image.startsWith('http') ? article.image : `http://localhost:8000${article.image}`) : 'https://via.placeholder.com/400x250/1976d2/ffffff?text=No+Image',
          cover_image: article.cover_image ? (article.cover_image.startsWith('http') ? article.cover_image : `http://localhost:8000${article.cover_image}`) : null,
          published_at: article.published_at || article.created_at,
          created_at: article.created_at,
          updated_at: article.updated_at,
          reading_time: article.reading_time || 5,
          views_count: article.views_count || 0,
          likes_count: article.likes_count || 0,
          comments_count: article.comments_count || 0,
          featured: article.featured || false,
          status: article.status || 'published',
          rating: article.rating || 4.5,
          meta_description: article.meta_description || '',
          meta_keywords: article.meta_keywords || '',
          allow_comments: article.allow_comments !== false,
          word_count: article.word_count || 0,
          is_published: article.status === 'published'
        }));

        setArticles(transformedArticles);
        setTotalPages(Math.ceil(totalCount / 9));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setLoading(false);
      }
    };

    fetchArticles();
  }, [currentPage, searchQuery, selectedCategory, sortBy]);

  const categories = [
    { value: 'all', label: 'الكل' },
    { value: 'تطوير الويب', label: 'تطوير الويب' },
    { value: 'الذكاء الاصطناعي', label: 'الذكاء الاصطناعي' },
    { value: 'تصميم', label: 'التصميم' },
    { value: 'تطوير الموبايل', label: 'تطوير الموبايل' },
    { value: 'الأمن السيبراني', label: 'الأمن السيبراني' },
    { value: 'قواعد البيانات', label: 'قواعد البيانات' }
  ];

  const sortOptions = [
    { value: 'latest', label: 'الأحدث' },
    { value: 'oldest', label: 'الأقدم' },
    { value: 'popular', label: 'الأكثر شعبية' },
    { value: 'rating', label: 'الأعلى تقييماً' }
  ];

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleBookmark = (articleId) => {
    setBookmarkedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  const handleLike = (articleId) => {
    setLikedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  // Handle article click - save data and navigate
  const handleArticleClick = (article) => {
    console.log('📖 Article clicked:', article);
    console.log('📖 Article ID:', article.id);
    console.log('📖 Article title:', article.title);

    // Save the complete article data to context (like shared preferences)
    saveArticleData(article);

    // Navigate to article detail page
    navigate(`/articles/${article.slug || article.id}`);
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.published_at) - new Date(a.published_at);
      case 'oldest':
        return new Date(a.published_at) - new Date(b.published_at);
      case 'popular':
        return b.views_count - a.views_count;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const paginatedArticles = sortedArticles.slice((currentPage - 1) * 9, currentPage * 9);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderArticleCard = (article) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.02 }}
    >
      <ModernCard
        sx={{ cursor: 'pointer' }}
        onClick={() => handleArticleClick(article)}
      >
        {/* Image Section - Fixed Height */}
        <Box sx={{
          position: 'relative',
          overflow: 'hidden',
          height: '200px', // ارتفاع ثابت للصورة
          minHeight: '200px', // ضمان الارتفاع الأدنى
          maxHeight: '200px', // ضمان الارتفاع الأقصى
          width: '100%',
          flexShrink: 0 // منع التقلص
        }}>
          <CardMedia
            component="img"
            height="100%"
            width="100%"
            image={article.image}
            alt={article.title}
            className="article-image"
            sx={{
              objectFit: 'cover',
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x200/1976d2/ffffff?text=No+Image';
            }}
          />

          {/* Category Badge Overlay */}
          <Box sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 2
          }}>
            <CategoryChip
              label={article.category}
              size="small"
              category={article.category}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#663399',
                fontWeight: 700,
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                }
              }}
            />
          </Box>

          {/* Action Buttons Overlay */}
          <Box sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            display: 'flex',
            gap: 0.5,
            zIndex: 2
          }}>
            <Tooltip title={likedArticles.has(article.id) ? t('articlesUnlike') : t('articlesLike')}>
              <ActionButton
                variant="like"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(article.id);
                }}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: likedArticles.has(article.id) ? '#663399' : '#666',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    backgroundColor: likedArticles.has(article.id) ? '#663399' : '#f5f5f5',
                    color: likedArticles.has(article.id) ? 'white' : '#663399',
                  }
                }}
              >
                {likedArticles.has(article.id) ? <FavoriteIcon sx={{ fontSize: 18 }} /> : <FavoriteBorderIcon sx={{ fontSize: 18 }} />}
              </ActionButton>
            </Tooltip>

            <Tooltip title={bookmarkedArticles.has(article.id) ? t('articlesRemoveBookmark') : t('articlesBookmark')}>
              <ActionButton
                variant="bookmark"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookmark(article.id);
                }}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: bookmarkedArticles.has(article.id) ? '#42a5f5' : '#666',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    backgroundColor: bookmarkedArticles.has(article.id) ? '#42a5f5' : '#f5f5f5',
                    color: bookmarkedArticles.has(article.id) ? 'white' : '#42a5f5',
                  }
                }}
              >
                {bookmarkedArticles.has(article.id) ? <BookmarkIcon sx={{ fontSize: 18 }} /> : <BookmarkBorderIcon sx={{ fontSize: 18 }} />}
              </ActionButton>
            </Tooltip>
          </Box>

          {/* Gradient Overlay */}
          <Box sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.3))',
          }} />
        </Box>

        {/* Content Section */}
        <CardContent sx={{
          flexGrow: 1,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          position: 'relative',
          height: '220px', // ارتفاع ثابت للمحتوى
          minHeight: '220px', // ضمان الارتفاع الأدنى
          maxHeight: '220px' // ضمان الارتفاع الأقصى
        }}>
          {/* Title */}
          <Typography variant="h6" component="h3" sx={{
            fontWeight: 800,
            lineHeight: 1.3,
            color: '#1a1a1a',
            fontSize: '1.1rem',
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '2.6rem' // ارتفاع ثابت للعنوان
          }}>
            {article.title}
          </Typography>

          {/* Summary */}
          <Typography variant="body2" color="text.secondary" sx={{
            lineHeight: 1.5,
            fontSize: '0.9rem',
            color: '#666',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexGrow: 1
          }}>
            {article.summary}
          </Typography>

          {/* Stats Row */}
          <Box sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            flexWrap: 'wrap',
            mb: 1.5
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              padding: '3px 8px',
              borderRadius: '10px'
            }}>
              <ScheduleIcon sx={{ fontSize: 14, color: '#663399' }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#663399', fontSize: '0.7rem' }}>
                {article.reading_time} {t('articlesMinutes')}
              </Typography>
            </Box>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              backgroundColor: 'rgba(76, 175, 80, 0.08)',
              padding: '3px 8px',
              borderRadius: '10px'
            }}>
              <VisibilityIcon sx={{ fontSize: 14, color: '#4CAF50' }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#4CAF50', fontSize: '0.7rem' }}>
                {article.views_count.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              backgroundColor: 'rgba(244, 67, 54, 0.08)',
              padding: '3px 8px',
              borderRadius: '10px'
            }}>
              <FavoriteIcon sx={{ fontSize: 14, color: '#F44336' }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#F44336', fontSize: '0.7rem' }}>
                {(article.likes_count + (likedArticles.has(article.id) ? 1 : 0)).toLocaleString()}
              </Typography>
            </Box>
          </Box>

          {/* Read More Button */}
          <ReadMoreButton
            category={article.category}
            className="read-more"
            sx={{
              alignSelf: 'flex-start',
              mt: 'auto'
            }}
          >
            {t('articlesReadMore')}
            <Box className="arrow-circle">
              <ArrowForwardIcon sx={{ fontSize: 14, color: 'white' }} />
            </Box>
          </ReadMoreButton>
        </CardContent>
      </ModernCard>
    </motion.div>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <Box component="main" sx={{ flex: 1 }}>
          <HeroSection>
            <Container>
              <Skeleton variant="text" width={300} height={80} sx={{ mx: 'auto', mb: 3 }} />
              <Skeleton variant="text" width={500} height={30} sx={{ mx: 'auto', mb: 4 }} />
              <Skeleton variant="rectangular" width={400} height={50} sx={{ mx: 'auto', borderRadius: '25px' }} />
            </Container>
          </HeroSection>

          <Container sx={{ py: 4 }}>
            {/* Horizontal Scrolling Skeleton */}
            <Box sx={{
              display: 'flex',
              gap: 3,
              overflowX: 'auto',
              pb: 2,
              px: 1,
              '&::-webkit-scrollbar': {
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#663399',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: '#5a2d87',
                },
              },
            }}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Box key={item} sx={{
                  flexShrink: 0,
                  width: { xs: '280px', sm: '320px', md: '350px' },
                  height: '420px',
                  borderRadius: 3,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Skeleton variant="rectangular" height={200} sx={{ flexShrink: 0 }} />
                  <Box sx={{
                    flex: 1,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    height: '220px',
                    minHeight: '220px',
                    maxHeight: '220px'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Skeleton variant="circular" width={32} height={32} />
                        <Skeleton variant="circular" width={32} height={32} />
                      </Box>
                    </Box>
                    <Skeleton variant="text" width="90%" height={32} />
                    <Skeleton variant="text" width="70%" height={32} />
                    <Skeleton variant="text" width="100%" sx={{ flexGrow: 1 }} />
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="60%" />
                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                      <Skeleton variant="rectangular" width={50} height={20} sx={{ borderRadius: 1 }} />
                      <Skeleton variant="rectangular" width={50} height={20} sx={{ borderRadius: 1 }} />
                      <Skeleton variant="rectangular" width={50} height={20} sx={{ borderRadius: 1 }} />
                    </Box>
                    <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 2, mt: 'auto' }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden'
    }}>
      <Header />

      <Box component="main" sx={{ flex: 1 }}>
        <HeroSection backgroundImage={headerBanner?.image_url}>
          <AnimatedTriangle />
          <Container sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{ position: 'relative', zIndex: 3 }}
            >
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 800,
                  mb: { xs: 2, sm: 3 },
                  color: '#ffffff',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
                  lineHeight: { xs: 1.3, sm: 1.2 },
                  textShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  textAlign: 'center',
                  wordBreak: 'break-word'
                }}
              >
                {t('articlesPageTitle')}
              </Typography>
              <Typography variant="body1" sx={{
                opacity: 0.95,
                mb: { xs: 3, sm: 4 },
                fontWeight: 400,
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem', lg: '1.2rem' },
                maxWidth: { xs: '100%', sm: '500px', md: '600px' },
                mx: 'auto',
                px: { xs: 2, sm: 0 },
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                textAlign: 'center',
                lineHeight: { xs: 1.5, sm: 1.6 }
              }}>
                {t('articlesPageSubtitle')}
              </Typography>

            </motion.div>
          </Container>
        </HeroSection>

        <Container sx={{ 
          py: { xs: 4, sm: 6, md: 8 },
          px: { xs: 2, sm: 3, md: 4 }
        }}>
          <FilterPaper sx={{ 
            mb: { xs: 4, sm: 5, md: 6 },
            p: { xs: 2, sm: 3 }
          }}>
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 1.5, sm: 2 }, 
              flexWrap: 'wrap', 
              alignItems: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
              '& > *': {
                width: { xs: '100%', sm: 'auto' }
              }
            }}>
              <Typography 
                variant="h6" 
                sx={{
                  fontWeight: 700,
                  mr: { xs: 0, sm: 2 },
                  mb: { xs: 2, sm: 0 },
                  color: '#663399',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  justifyContent: { xs: 'center', sm: 'flex-start' }
                }}
              >
                <TrendingUpIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
                {t('articlesFilterArticles')}:
              </Typography>

              <FormControl sx={{ 
                minWidth: { xs: '100%', sm: 150 },
                maxWidth: { xs: '100%', sm: 'none' }
              }}>
                <InputLabel sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>{t('articlesCategory')}</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  label={t('articlesCategory')}
                  size="small"
                  sx={{
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem 
                      key={category.value} 
                      value={category.value}
                      sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                    >
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ 
                minWidth: { xs: '100%', sm: 150 },
                maxWidth: { xs: '100%', sm: 'none' }
              }}>
                <InputLabel sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>{t('articlesSortBy')}</InputLabel>
                <Select
                  value={sortBy}
                  onChange={handleSortChange}
                  label={t('articlesSortBy')}
                  size="small"
                  sx={{
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}
                >
                  {sortOptions.map((option) => (
                    <MenuItem 
                      key={option.value} 
                      value={option.value}
                      sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </FilterPaper>

          {paginatedArticles.length > 0 ? (
            <Box>
              {/* Responsive Grid Layout */}
              <Box sx={{
                display: {
                  xs: 'flex',
                  md: 'grid'
                },
                flexDirection: {
                  xs: 'column',
                  sm: 'row'
                },
                gap: { xs: 2, sm: 2.5, md: 3 },
                overflowX: { xs: 'visible', sm: 'auto' },
                pb: { xs: 0, sm: 2 },
                px: { xs: 0, sm: 1 },
                // Grid layout for desktop
                gridTemplateColumns: {
                  md: 'repeat(auto-fit, minmax(300px, 1fr))',
                  lg: 'repeat(auto-fit, minmax(320px, 1fr))'
                },
                '&::-webkit-scrollbar': {
                  height: '8px',
                  display: { xs: 'none', sm: 'block' }
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#663399',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#5a2d87',
                  },
                },
              }}>
                {paginatedArticles.map((article) => (
                  <Box 
                    key={article.id} 
                    sx={{
                      flexShrink: { xs: 'none', sm: 0 },
                      width: { 
                        xs: '100%', 
                        sm: '280px', 
                        md: '100%' 
                      },
                      maxWidth: { 
                        xs: '100%', 
                        sm: '280px', 
                        md: '350px' 
                      },
                      height: { 
                        xs: 'auto', 
                        sm: '420px' 
                      },
                      minHeight: { 
                        xs: '400px', 
                        sm: '420px' 
                      }
                    }}
                  >
                    {renderArticleCard(article)}
                  </Box>
                ))}
              </Box>

              {/* Pagination - Keep if needed */}
              {totalPages > 1 && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mt: { xs: 3, sm: 4 },
                  px: { xs: 2, sm: 0 }
                }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size={{ xs: 'small', sm: 'medium', md: 'large' }}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                      },
                      '& .Mui-selected': {
                        background: 'linear-gradient(45deg, #663399, #42a5f5)',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                      }
                    }}
                  />
                </Box>
              )}
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
                  variant="outlined"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  sx={{
                    borderRadius: 2,
                    borderColor: '#663399',
                    color: '#663399',
                    '&:hover': {
                      borderColor: '#1565c0',
                      backgroundColor: alpha('#663399', 0.08),
                    }
                  }}
                >
                  {t('articlesViewAllArticles')}
                </Button>
              </motion.div>
            </Box>
          )}
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default ArticlesPage; 