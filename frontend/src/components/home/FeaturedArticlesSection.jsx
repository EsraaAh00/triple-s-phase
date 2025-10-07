import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    IconButton,
    useTheme,
    useMediaQuery,
    styled,
    CircularProgress,
    Alert,
    Card,
    CardContent
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ArrowForward, ChevronLeft, ChevronRight, Article, ErrorOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { articleAPI } from '../../services/api.service';
import { useArticle } from '../../contexts/ArticleContext';

const SectionContainer = styled(Box)(({ theme }) => ({
    backgroundColor: '#FFFFFF',
    position: 'relative',
    // Responsive padding
    padding: theme.spacing(8, 0),
    '@media (max-width: 600px)': {
        padding: theme.spacing(4, 0),
    },
    '@media (min-width: 600px) and (max-width: 900px)': {
        padding: theme.spacing(6, 0),
    },
    '@media (min-width: 900px)': {
        padding: theme.spacing(8, 0),
    },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(6),
    // Enhanced responsive layout
    '@media (max-width: 600px)': {
        flexDirection: 'column',
        gap: theme.spacing(2),
        alignItems: 'flex-start',
        marginBottom: theme.spacing(4),
    },
    '@media (min-width: 600px) and (max-width: 900px)': {
        flexDirection: 'column',
        gap: theme.spacing(2.5),
        alignItems: 'flex-start',
        marginBottom: theme.spacing(5),
    },
    '@media (min-width: 900px)': {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing(6),
    },
}));

const HeaderLeft = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

// Title label styled like AboutAcademySection.SectionLabel
const SectionLabel = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2),
    backgroundColor: 'rgba(111, 66, 193, 0.1)',
    borderRadius: '30px',
    marginBottom: theme.spacing(1),
    '& .MuiSvgIcon-root': {
        color: '#6f42c1',
        fontSize: '1.2rem',
    },
    '& span': {
        color: '#6f42c1',
        fontSize: '0.9rem',
        fontWeight: 600,
    },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 800,
    color: '#663399',
    lineHeight: 1.2,
    direction: 'rtl',
    // Responsive font size
    fontSize: '2.5rem',
    '@media (max-width: 600px)': {
        fontSize: '1.75rem',
    },
    '@media (min-width: 600px) and (max-width: 900px)': {
        fontSize: '2rem',
    },
    '@media (min-width: 900px)': {
        fontSize: '2.5rem',
    },
}));

const ViewAllButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#333679',
    color: '#FFFFFF',
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(51, 54, 121, 0.3)',
    transition: 'all 0.3s ease',
    direction: 'rtl',
    // Responsive sizing
    padding: theme.spacing(1.5, 3),
    fontSize: '1rem',
    minHeight: '44px',
    '@media (max-width: 600px)': {
        padding: theme.spacing(1.2, 2.5),
        fontSize: '0.9rem',
        minHeight: '40px',
    },
    '@media (min-width: 600px) and (max-width: 900px)': {
        padding: theme.spacing(1.3, 2.8),
        fontSize: '0.95rem',
    },
    '@media (min-width: 900px)': {
        padding: theme.spacing(1.5, 3),
        fontSize: '1rem',
    },
    '&:hover': {
        backgroundColor: '#2A2D5F',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 16px rgba(51, 54, 121, 0.4)',
    },
    '& .MuiButton-endIcon': {
        marginLeft: theme.spacing(0.5),
    },
}));

const ArticlesContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(3),
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
    padding: theme.spacing(0, 8),
    margin: theme.spacing(0, -2),
    // Enhanced responsive spacing
    '@media (max-width: 600px)': {
        gap: theme.spacing(1.5),
        padding: theme.spacing(0, 2),
        margin: theme.spacing(0, -1),
    },
    '@media (min-width: 600px) and (max-width: 900px)': {
        gap: theme.spacing(2),
        padding: theme.spacing(0, 4),
        margin: theme.spacing(0, -1.5),
    },
    '@media (min-width: 900px) and (max-width: 1200px)': {
        gap: theme.spacing(2.5),
        padding: theme.spacing(0, 6),
        margin: theme.spacing(0, -1.8),
    },
    '@media (min-width: 1200px)': {
        gap: theme.spacing(3),
        padding: theme.spacing(0, 8),
        margin: theme.spacing(0, -2),
    },
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(0, 4),
        margin: theme.spacing(0, -1),
    },
}));

const NavigationButton = styled(IconButton)(({ theme }) => ({
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E0E0E0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    zIndex: 2,
    '&:hover': {
        backgroundColor: '#663399',
        color: '#FFFFFF',
        borderColor: '#663399',
        transform: 'scale(1.1)',
    },
    '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
}));

const ArticlesGrid = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(3),
    overflowX: 'auto',
    overflowY: 'hidden',
    flex: 1,
    scrollBehavior: 'smooth',
    padding: theme.spacing(1, 0),
    margin: theme.spacing(0, 2),
    '&::-webkit-scrollbar': {
        height: '6px',
    },
    '&::-webkit-scrollbar-track': {
        backgroundColor: '#f1f1f1',
        borderRadius: '3px',
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#663399',
        borderRadius: '3px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: '#333679',
    },
    [theme.breakpoints.down('lg')]: {
        gap: theme.spacing(2),
        margin: theme.spacing(0, 1),
    },
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
        gap: theme.spacing(2),
        overflowX: 'hidden',
        margin: 0,
    },
}));

const ArticleCard = styled(Box)(({ theme }) => ({
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    width: '100%',
    flex: '0 0 auto',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    },
    // Enhanced responsive sizing
    '@media (max-width: 600px)': {
        minWidth: '100%',
        maxWidth: '100%',
        width: '100%',
    },
    '@media (min-width: 600px) and (max-width: 900px)': {
        minWidth: '260px',
        maxWidth: '300px',
    },
    '@media (min-width: 900px) and (max-width: 1200px)': {
        minWidth: '280px',
        maxWidth: '320px',
    },
    '@media (min-width: 1200px) and (max-width: 1536px)': {
        minWidth: '300px',
        maxWidth: '350px',
    },
    '@media (min-width: 1536px)': {
        minWidth: '320px',
        maxWidth: '380px',
    },
}));

const ArticleImage = styled(Box)(({ theme }) => ({
    width: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
    // Responsive height
    height: '180px',
    '@media (max-width: 600px)': {
        height: '160px',
    },
    '@media (min-width: 600px) and (max-width: 900px)': {
        height: '170px',
    },
    '@media (min-width: 900px) and (max-width: 1200px)': {
        height: '175px',
    },
    '@media (min-width: 1200px)': {
        height: '180px',
    },
    '&:after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '4px',
        backgroundColor: '#000000',
    },
}));

const ArticleContent = styled(Box)(({ theme }) => ({
    // Responsive padding
    padding: theme.spacing(2.5),
    '@media (max-width: 600px)': {
        padding: theme.spacing(2),
    },
    '@media (min-width: 600px) and (max-width: 900px)': {
        padding: theme.spacing(2.2),
    },
    '@media (min-width: 900px) and (max-width: 1200px)': {
        padding: theme.spacing(2.3),
    },
    '@media (min-width: 1200px)': {
        padding: theme.spacing(2.5),
    },
}));

const ArticleTitle = styled(Typography)(({ theme }) => ({
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#663399',
    marginBottom: theme.spacing(1.5),
    lineHeight: 1.4,
    direction: 'rtl',
    textAlign: 'right',
    [theme.breakpoints.down('lg')]: {
        fontSize: '1rem',
        marginBottom: theme.spacing(1),
    },
    [theme.breakpoints.down('md')]: {
        fontSize: '1.1rem',
        marginBottom: theme.spacing(1.5),
    },
}));

const ArticleMeta = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1.5),
    fontSize: '0.85rem',
    color: '#A0A0A0',
    [theme.breakpoints.down('lg')]: {
        fontSize: '0.8rem',
        marginBottom: theme.spacing(1),
    },
    [theme.breakpoints.down('md')]: {
        fontSize: '0.85rem',
        marginBottom: theme.spacing(1.5),
    },
}));

const ReadMoreButton = styled(Button)(({ theme }) => ({
    color: '#663399',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    padding: 0,
    direction: 'rtl',
    '&:hover': {
        backgroundColor: 'transparent',
        color: '#333679',
    },
    '& .MuiButton-endIcon': {
        marginLeft: theme.spacing(0.5),
    },
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(8, 0),
    gap: theme.spacing(2),
}));

const ErrorContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4, 0),
    gap: theme.spacing(2),
}));

const EmptyStateContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(6, 0),
    gap: theme.spacing(2),
    textAlign: 'center',
}));

const FeaturedArticlesSection = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const { saveArticleData } = useArticle();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Fetch articles from API
    useEffect(() => {
        const fetchArticles = async () => {
            try {
                console.log('🔄 Fetching articles from API...');
                setLoading(true);
                setError(null);

                let finalArticles = [];

                // Try different API endpoints in order of preference
                const apiEndpoints = [
                    { name: 'Featured Articles', method: () => articleAPI.getFeaturedArticles() },
                    { name: 'Recent Articles', method: () => articleAPI.getRecentArticles() },
                    { name: 'General Articles', method: () => articleAPI.getArticles({ limit: 6 }) },
                    { name: 'All Articles', method: () => articleAPI.getArticles() }
                ];

                for (const endpoint of apiEndpoints) {
                    try {
                        console.log(`🔍 Trying ${endpoint.name}...`);
                        const articlesData = await endpoint.method();
                        console.log(`✅ ${endpoint.name} response:`, articlesData);

                        // Extract articles from different response formats
                        let extractedArticles = [];

                        if (Array.isArray(articlesData)) {
                            extractedArticles = articlesData;
                            console.log(`📋 ${endpoint.name} - Direct array:`, extractedArticles.length);
                        } else if (articlesData?.results && Array.isArray(articlesData.results)) {
                            extractedArticles = articlesData.results;
                            console.log(`📋 ${endpoint.name} - Results array:`, extractedArticles.length);
                        } else if (articlesData?.data && Array.isArray(articlesData.data)) {
                            extractedArticles = articlesData.data;
                            console.log(`📋 ${endpoint.name} - Data array:`, extractedArticles.length);
                        } else if (articlesData && typeof articlesData === 'object') {
                            // If it's an object but not an array, try to extract articles
                            console.log(`📋 ${endpoint.name} - Object structure:`, Object.keys(articlesData));
                            // Check if it's a single article object
                            if (articlesData.title || articlesData.id) {
                                extractedArticles = [articlesData];
                                console.log(`📋 ${endpoint.name} - Single article object`);
                            }
                        }

                        if (extractedArticles.length > 0) {
                            console.log(`✅ ${endpoint.name} success - Found ${extractedArticles.length} articles`);

                            // Process articles to ensure proper author information
                            const processedArticles = extractedArticles.map(article => {
                                // Extract author information from different possible fields
                                const authorId = article.author || article.author_id || article.created_by || article.user;
                                const authorName = article.author_name ||
                                    (article.author?.profile?.name) ||
                                    (article.author?.first_name && article.author?.last_name ? `${article.author.first_name} ${article.author.last_name}` : null) ||
                                    article.author?.first_name ||
                                    article.author?.last_name ||
                                    article.author?.username ||
                                    article.author?.name ||
                                    (article.created_by_name) ||
                                    (article.user_name) ||
                                    t('articlesUnknownAuthor');

                                // Return processed article with standardized author info
                                return {
                                    ...article,
                                    author: {
                                        id: authorId,
                                        name: authorName,
                                        ...article.author // Keep original author data for backward compatibility
                                    }
                                };
                            });

                            finalArticles = processedArticles;
                            console.log(`📝 Processed articles with author info:`, processedArticles.map(a => ({ id: a.id, title: a.title, author: a.author?.name })));
                            break; // Exit the loop if we found articles
                        } else {
                            console.log(`⚠️ ${endpoint.name} - No articles found in response`);
                        }

                    } catch (endpointError) {
                        console.log(`❌ ${endpoint.name} failed:`, endpointError.message);
                        console.log(`❌ ${endpoint.name} error details:`, endpointError);
                        continue; // Try next endpoint
                    }
                }

                if (finalArticles.length === 0) {
                    console.log('⚠️ No articles found from any API endpoint');
                }

                console.log('📊 Final articles to set:', finalArticles.length);
                console.log('📊 Final articles data:', finalArticles);
                setArticles(finalArticles);

            } catch (err) {
                console.error('❌ Critical error in fetchArticles:', err);
                console.error('❌ Error stack:', err.stack);
                setError(t('articlesLoadingError'));
            } finally {
                setLoading(false);
                console.log('🏁 fetchArticles completed');
            }
        };

        fetchArticles();
    }, []);

    // Format date helper - Using Gregorian calendar
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ar-SA-u-ca-gregory', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                calendar: 'gregory'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    };

    // Get author name helper - Enhanced to match ArticleDetail.jsx logic
    const getAuthorName = (author) => {
        if (!author) return t('articlesUnknownAuthor');

        // If it's already a string, return it
        if (typeof author === 'string') return author;

        // If it's an object, try different fields
        if (typeof author === 'object') {
            // Check for profile name first
            if (author.profile?.name) return author.profile.name;

            // Check for first_name and last_name combination
            if (author.first_name && author.last_name) {
                return `${author.first_name} ${author.last_name}`;
            }

            // Check for individual name fields
            if (author.first_name) return author.first_name;
            if (author.last_name) return author.last_name;

            // Check for username
            if (author.username) return author.username;

            // Check for name field
            if (author.name) return author.name;

            // Check for email (use part before @)
            if (author.email) return author.email.split('@')[0];

            // Check for user fields (nested user object)
            if (author.user?.first_name && author.user?.last_name) {
                return `${author.user.first_name} ${author.user.last_name}`;
            }
            if (author.user?.username) return author.user.username;
            if (author.user?.name) return author.user.name;
        }

        return 'مؤلف غير معروف';
    };

    // Get image URL helper
    const getImageUrl = (image) => {
        if (!image) {
            return null;
        }

        if (typeof image === 'string') {
            // If it's already a full URL, return it
            if (image.startsWith('http')) return image;

            // If it's a relative path, construct full URL
            return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${image}`;
        }

        return null;
    };

    const handlePrevious = () => {
        const container = document.getElementById('articles-scroll-container');
        if (container) {
            const cardWidth = 320 + 24; // card width + gap
            container.scrollBy({
                left: -cardWidth,
                behavior: 'smooth'
            });
        }
    };

    const handleNext = () => {
        const container = document.getElementById('articles-scroll-container');
        if (container) {
            const cardWidth = 320 + 24; // card width + gap
            container.scrollBy({
                left: cardWidth,
                behavior: 'smooth'
            });
        }
    };

    const handleArticleClick = (article) => {
        console.log('📖 Opening article:', article);
        console.log('📖 Article data:', {
            id: article.id,
            slug: article.slug,
            title: article.title,
            author: article.author
        });

        try {
            // Save the complete article data to context (like shared preferences)
            // This ensures ArticleDetail.jsx has all the data immediately
            const articleDataToSave = {
                id: article.id,
                slug: article.slug,
                title: article.title || '',
                summary: article.summary || '',
                content: article.content || '',
                author: {
                    id: article.author?.id,
                    name: getAuthorName(article.author),
                    avatar: article.author?.avatar || `https://via.placeholder.com/40x40/1976d2/ffffff?text=${getAuthorName(article.author).charAt(0)}`
                },
                category: article.category || article.category_name || 'عام',
                category_id: article.category_id,
                tags: article.tags ? (Array.isArray(article.tags) ? article.tags.map(tag => tag.name || tag) : [article.tags]) : [],
                image: getImageUrl(article.image),
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
            };

            console.log('💾 Saving article data to context:', articleDataToSave);
            saveArticleData(articleDataToSave);

            // Navigate to article detail page using React Router
            // The route is /articles/:slug in App.jsx
            if (article.slug) {
                navigate(`/articles/${article.slug}`);
                console.log('✅ Navigating to article by slug:', article.slug);
            } else if (article.id) {
                navigate(`/articles/${article.id}`);
                console.log('✅ Navigating to article by ID:', article.id);
            } else {
                console.error('❌ No slug or ID found for article:', article);
                // Fallback to articles page if no valid identifier
                navigate('/articles');
            }
        } catch (error) {
            console.error('❌ Error navigating to article:', error);
            // Fallback to articles page on error
            navigate('/articles');
        }
    };

    // Loading state
    if (loading) {
        return (
            <SectionContainer>
                <Container maxWidth="lg">
                    <LoadingContainer>
                        <CircularProgress size={60} sx={{ color: '#663399' }} />
                        <Typography variant="h6" sx={{ color: '#663399', direction: 'rtl' }}>
                            {t('articlesLoading')}
                        </Typography>
                    </LoadingContainer>
                </Container>
            </SectionContainer>
        );
    }

    // Error state
    if (error) {
        return (
            <SectionContainer>
                <Container maxWidth="lg">
                    <ErrorContainer>
                        <ErrorOutline sx={{ fontSize: 60, color: '#ff6b6b' }} />
                        <Typography variant="h6" sx={{ color: '#ff6b6b', direction: 'rtl' }}>
                            {error}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => window.location.reload()}
                            sx={{
                                backgroundColor: '#663399',
                                '&:hover': { backgroundColor: '#333679' }
                            }}
                        >
                            {t('commonRetry')}
                        </Button>
                    </ErrorContainer>
                </Container>
            </SectionContainer>
        );
    }

    // Debug logging
    console.log('🔍 Component render state:', {
        loading,
        error,
        articlesCount: articles?.length || 0,
        articles: articles
    });

    // Empty state
    if (!articles || articles.length === 0) {
        console.log('🚫 Showing empty state - no articles available');
        return (
            <SectionContainer>
                <Container maxWidth="lg">
                    <SectionHeader>
                        <HeaderLeft>
                        <SectionLabel>
                            <Article />
                            <span>{t('homeLatestArticles')}</span>
                        </SectionLabel>
                        <SectionTitle variant="h2" component="h2">
                            {t('homeFeaturedArticles')}
                        </SectionTitle>
                        </HeaderLeft>
                    </SectionHeader>
                    <EmptyStateContainer>
                        <Article sx={{ fontSize: 80, color: '#A0A0A0' }} />
                        <Typography variant="h6" sx={{ color: '#A0A0A0', direction: 'rtl' }}>
                            {t('articlesNoArticlesAvailable')}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#A0A0A0', direction: 'rtl' }}>
                            {t('articlesNewArticlesComingSoon')}
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={() => window.location.reload()}
                            sx={{
                                borderColor: '#663399',
                                color: '#663399',
                                '&:hover': {
                                    borderColor: '#333679',
                                    backgroundColor: 'rgba(102, 51, 153, 0.04)'
                                }
                            }}
                        >
                            {t('commonReloadPage')}
                        </Button>
                    </EmptyStateContainer>
                </Container>
            </SectionContainer>
        );
    }

    const visibleArticles = articles;

    console.log('🎨 Rendering articles section:', {
        visibleArticlesCount: visibleArticles?.length || 0,
        firstArticle: visibleArticles?.[0] || null
    });

    return (
        <SectionContainer>
            <Container maxWidth="lg">
                {/* Section Header */}
                <SectionHeader>
                    <HeaderLeft>
                        <SectionLabel>
                            <Article />
                            <span>{t('homeLatestArticles')}</span>
                        </SectionLabel>
                        <SectionTitle variant="h2" component="h2">
                            {t('homeFeaturedArticles')}
                        </SectionTitle>
                    </HeaderLeft>
                    <ViewAllButton
                        endIcon={<ArrowForward />}
                        onClick={() => navigate('/articles')}
                    >
                        {t('homeViewAllArticles')}
                    </ViewAllButton>
                </SectionHeader>

                {/* Articles Section */}
                <ArticlesContainer>
                    <NavigationButton
                        onClick={handlePrevious}
                        sx={{ position: 'absolute', left: -24, zIndex: 2 }}
                    >
                        <ChevronLeft />
                    </NavigationButton>

                    <ArticlesGrid id="articles-scroll-container">
                        {visibleArticles.map((article, index) => {
                            console.log(`📄 Rendering article ${index + 1}:`, {
                                id: article.id,
                                title: article.title,
                                author: article.author,
                                image: article.image,
                                published_at: article.published_at,
                                created_at: article.created_at
                            });

                            const imageUrl = getImageUrl(article.image);

                            return (
                                <ArticleCard key={article.id}>
                                    {imageUrl ? (
                                        <ArticleImage
                                            sx={{ backgroundImage: `url(${imageUrl})` }}
                                        />
                                    ) : (
                                        <ArticleImage
                                            sx={{
                                                backgroundColor: '#f5f5f5',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Article sx={{ fontSize: 48, color: '#ccc' }} />
                                        </ArticleImage>
                                    )}
                                    <ArticleContent>
                                        <ArticleTitle>{article.title}</ArticleTitle>
                                        <ArticleMeta>
                                            <Typography variant="body2" sx={{ color: '#A0A0A0' }}>
                                                {t('articlesBy')} {getAuthorName(article.author)}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#A0A0A0' }}>
                                                {formatDate(article.published_at || article.created_at)}
                                            </Typography>
                                        </ArticleMeta>
                                        <ReadMoreButton
                                            endIcon={<ArrowForward />}
                                            onClick={() => handleArticleClick(article)}
                                        >
                                            {t('commonReadMore')}
                                        </ReadMoreButton>
                                    </ArticleContent>
                                </ArticleCard>
                            );
                        })}
                    </ArticlesGrid>

                    <NavigationButton
                        onClick={handleNext}
                        sx={{ position: 'absolute', right: -24, zIndex: 2 }}
                    >
                        <ChevronRight />
                    </NavigationButton>
                </ArticlesContainer>
            </Container>
        </SectionContainer>
    );
};

export default FeaturedArticlesSection;