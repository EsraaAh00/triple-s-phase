import React from 'react';
import {
    Box,
    Typography,
    Button,
    Container
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
    PeopleAltOutlined,
    PlayCircleOutline,
    AccessTime,
    ArrowForward
} from '@mui/icons-material';

const CourseDetailBottomBar = ({
    course,
    isAddingToCart,
    handleAddToCart
}) => {
    const { t } = useTranslation();
    // Return null if course data is not loaded yet
    if (!course) {
        return null;
    }

    return (
        <Box sx={{
            display: { xs: 'block', md: 'none' }, // Show only on small screens
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: 'white',
            borderTop: '1px solid #e0e0e0',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
            p: { xs: 1.5, sm: 2 },
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            width: '100%', // Fixed width
            maxWidth: '100vw', // Prevent expansion
            boxSizing: 'border-box'
        }}>
            <Container maxWidth="sm" sx={{ width: '100%', maxWidth: '100%' }}>
                {/* Vertical Layout for Mobile */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { xs: 1.5, sm: 2 },
                    width: '100%',
                    maxWidth: '100%'
                }}>
                    {/* Top Row - Image and Price */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 1.5, sm: 2 },
                        width: '100%',
                        minWidth: 0 // Prevent overflow
                    }}>
                        {/* Course Image */}
                        <Box
                            sx={{
                                width: { xs: '50px', sm: '60px' },
                                height: { xs: '50px', sm: '60px' },
                                borderRadius: { xs: '6px', sm: '8px' },
                                backgroundImage: 'url(/src/assets/images/CourseDetail.png)',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                flexShrink: 0
                            }}
                        />

                        {/* Price and Title */}
                        <Box sx={{
                            flex: 1,
                            minWidth: 0,
                            overflow: 'hidden' // Prevent text overflow
                        }}>
                            <Typography variant="h6" sx={{
                                fontWeight: 'bold',
                                mb: 0.5,
                                fontSize: { xs: '1rem', sm: '1.2rem' },
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {course?.price || '74.00'} دينار
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{
                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {course?.title || 'Mastering Internal Medicine'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Course Info Icons */}
                    <Box sx={{
                        display: 'flex',
                        gap: { xs: 1.5, sm: 2 },
                        justifyContent: 'center',
                        width: '100%',
                        flexWrap: 'wrap' // Allow wrapping if needed
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            minWidth: 0,
                            flex: '1 1 auto'
                        }}>
                            <PeopleAltOutlined sx={{ 
                                color: '#666', 
                                fontSize: { xs: 12, sm: 14 } 
                            }} />
                            <Typography sx={{
                                color: '#666',
                                fontSize: { xs: '10px', sm: '12px' },
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {course?.instructor || 'Eleanor Fant'}
                            </Typography>
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            minWidth: 0,
                            flex: '1 1 auto'
                        }}>
                            <PlayCircleOutline sx={{ 
                                color: '#666', 
                                fontSize: { xs: 12, sm: 14 } 
                            }} />
                            <Typography sx={{
                                color: '#666',
                                fontSize: { xs: '10px', sm: '12px' },
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {course?.videoCount || '14'} {t('coursesVideos')}
                            </Typography>
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            minWidth: 0,
                            flex: '1 1 auto'
                        }}>
                            <AccessTime sx={{ 
                                color: '#666', 
                                fontSize: { xs: 12, sm: 14 } 
                            }} />
                            <Typography sx={{
                                color: '#666',
                                fontSize: { xs: '10px', sm: '12px' },
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {course?.duration || `6 ${t('coursesHours')}`}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Add to Cart Button */}
                    <Button
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForward sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                        sx={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            fontWeight: 'bold',
                            py: { xs: 1.2, sm: 1.5 },
                            borderRadius: { xs: '6px', sm: '8px' },
                            textTransform: 'none',
                            fontSize: { xs: '13px', sm: '14px' },
                            width: '100%',
                            maxWidth: '100%',
                            '&:hover': {
                                backgroundColor: '#218838'
                            }
                        }}
                    >
                        {isAddingToCart ? t('cartAdding') : t('cartAddToCart')}
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default CourseDetailBottomBar;
