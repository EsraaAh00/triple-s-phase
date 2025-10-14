import React from 'react';
import {
    Box,
    Typography,
    Button,
    Rating,
    Avatar,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
    DescriptionOutlined,
    StarBorder,
    Favorite,
    FavoriteBorder,
    ExpandMore
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

// Styled Components
const SectionTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    color: '#333679',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
        fontSize: '1.5rem',
    },
}));

const CourseReviewsTab = ({
    course,
    setShowReviewForm,
    handleLikeReview,
    isAuthenticated
}) => {
    const { t } = useTranslation();
    const theme = useTheme();

    if (!course) {
        return null;
    }

    return (
        <Box>
            {/* Reviews Section */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', sm: 'center' }, 
                mb: { xs: 3, sm: 4 },
                gap: { xs: 2, sm: 0 }
            }}>
                <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    <SectionTitle 
                        variant="h5" 
                        component="h2" 
                        sx={{ 
                            mb: 0.5,
                            fontSize: { xs: '1.3rem', sm: '1.5rem' }
                        }}
                    >
                        {t('coursesStudentReviews')}
                    </SectionTitle>
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: { xs: 1, sm: 0 }
                    }}>
                        <Typography 
                            variant="h3" 
                            component="span" 
                            sx={{ 
                                mr: { xs: 0, sm: 1 }, 
                                fontWeight: 700,
                                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                            }}
                        >
                            {(() => {
                                const rating = course.rating;
                                if (typeof rating === 'number') {
                                    return rating.toFixed(1);
                                } else if (typeof rating === 'string') {
                                    const numRating = parseFloat(rating);
                                    return isNaN(numRating) ? '0.0' : numRating.toFixed(1);
                                } else {
                                    return '0.0';
                                }
                            })()}
                        </Typography>
                        <Rating
                            value={course.rating}
                            precision={0.1}
                            readOnly
                            size="large"
                            emptyIcon={<StarBorder fontSize="inherit" />}
                            sx={{ 
                                mr: { xs: 0, sm: 1.25 },
                                '& .MuiRating-icon': {
                                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                                }
                            }}
                        />
                        <Typography 
                            variant="body1" 
                            color="text.secondary" 
                            sx={{ 
                                ml: { xs: 0, sm: 0.5 },
                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
                            }}
                        >
                            {t('coursesRateCourse')} • {course.courseReviews?.length || 0} {t('coursesReviews')}
                        </Typography>
                    </Box>
                </Box>
                {isAuthenticated ? (
                    <Button
                        variant="contained"
                        startIcon={<DescriptionOutlined sx={{ fontSize: { xs: '16px', sm: '18px' } }} />}
                        onClick={() => setShowReviewForm(true)}
                        sx={{
                            borderRadius: { xs: 2, sm: 3 },
                            px: { xs: 2, sm: 4 },
                            py: { xs: 1, sm: 1.5 },
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            background: 'linear-gradient(135deg, #333679 0%, #4DBFB3 100%)',
                            boxShadow: '0 8px 25px rgba(14, 81, 129, 0.2)',
                            width: { xs: '100%', sm: 'auto' },
                            minWidth: { xs: 'auto', sm: '140px' },
                            '&:hover': {
                                background: 'linear-gradient(135deg, #4DBFB3 0%, #333679 100%)',
                                boxShadow: '0 12px 35px rgba(14, 81, 129, 0.3)',
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        {t('coursesWriteReview')}
                    </Button>
                ) : (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            fontStyle: 'italic',
                            textAlign: 'center',
                            py: 2
                        }}
                    >
                        {t('courseReviews.loginToWriteReview')}
                    </Typography>
                )}
            </Box>

            {/* Rating Distribution */}
            <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    {t('courseReviews.ratingBreakdown')}
                </Typography>
                {[5, 4, 3, 2, 1].map((star) => (
                    <Box key={star} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <Box sx={{ width: 80, display: 'flex', justifyContent: 'space-between', mr: 2 }}>
                            <Typography variant="body2" fontWeight={500}>{star} {t('courseReviews.star')}</Typography>
                            <Box sx={{ width: 8 }} />
                        </Box>
                        <Box sx={{ flexGrow: 1, mx: 2 }}>
                            <Box sx={{ width: '100%', height: 10, bgcolor: 'divider', borderRadius: 5, overflow: 'hidden' }}>
                                <Box
                                    sx={{
                                        height: '100%',
                                        width: `${(star / 5) * 100}%`,
                                        background: `linear-gradient(90deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.light} 100%)`,
                                        borderRadius: 5
                                    }}
                                />
                            </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40, textAlign: 'right' }}>
                            {Math.round((star / 5) * (course.courseReviews?.length || 0))} {t('courseReviews.review')}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* Reviews List */}
            <Box>
                {Array.isArray(course.courseReviews) ? course.courseReviews.map((review) => (
                    <Box
                        key={review.id}
                        sx={{
                            p: 3,
                            mb: 3,
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                    src={review.user?.avatar}
                                    alt={review.user?.name}
                                    sx={{ width: 48, height: 48, mr: 2 }}
                                />
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={600} dir="rtl">
                                        {review.user?.name || 'مستخدم'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Rating
                                            value={review.rating}
                                            precision={0.5}
                                            readOnly
                                            size="small"
                                            emptyIcon={<StarBorder fontSize="inherit" />}
                                            sx={{ mr: 1.25, color: 'warning.main' }}
                                        />
                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                                            {review.date}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <IconButton
                                size="small"
                                color={review.isLiked ? 'primary' : 'default'}
                                onClick={() => handleLikeReview(review.id)}
                                sx={{
                                    '&:hover': {
                                        transform: 'scale(1.1)',
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {review.isLiked ? <Favorite color="error" /> : <FavoriteBorder />}
                                <Typography variant="body2" sx={{ ml: 0.5 }}>
                                    {review.likes}
                                </Typography>
                            </IconButton>
                        </Box>
                        {review.title && (
                            <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600 }} dir="rtl">
                                {review.title}
                            </Typography>
                        )}
                        <Typography variant="body1" color="text.secondary" dir="rtl" sx={{ lineHeight: 1.8 }}>
                            {review.content}
                        </Typography>
                    </Box>
                )) : null}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, pb: 3 }}>
                    <Button
                        variant="outlined"
                        sx={{
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: '#333679',
                            color: '#333679',
                            '&:hover': {
                                bgcolor: '#333679',
                                color: 'white',
                                borderColor: '#333679',
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        {t('courseReviews.loadMoreReviews')}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default CourseReviewsTab;
