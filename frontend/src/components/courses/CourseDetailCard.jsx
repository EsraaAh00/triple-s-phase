import React from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Container,
    Paper,
    Grid,
    Breadcrumbs,
    Chip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
    PeopleAltOutlined,
    PlayCircleOutline,
    AccessTime,
    ArrowForward,
    School as SchoolIcon,
    Star as StarIcon
} from '@mui/icons-material';

const CourseDetailCard = ({
    course,
    isAddingToCart,
    handleAddToCart
}) => {
    const { t } = useTranslation();
    // Return null if course data is not loaded yet
    if (!course) {
        return null;
    }

    // Helper function to get course image URL with fallback
    const getCourseImageUrl = () => {
        console.log('CourseDetailCard - Course data:', {
            bannerImage: course?.bannerImage,
            thumbnail: course?.thumbnail,
            title: course?.title
        });

        if (course?.bannerImage && course.bannerImage !== 'https://source.unsplash.com/random/1600x500?programming,react') {
            return course.bannerImage;
        }
        if (course?.thumbnail && course.thumbnail !== 'https://source.unsplash.com/random/1600x500?programming,react') {
            return course.thumbnail;
        }
        // Fallback to default image
        return '/src/assets/images/coursedetailMGE.jpeg';
    };

    return (
        <>
            {/* Desktop Layout - Complete Course Detail Page */}
            <Box sx={{
                display: { xs: 'none', md: 'block' },
                bgcolor: '#ffffff',
                minHeight: { md: '20vh', lg: '30vh', xl: '40vh' },
                width: '100%',
                overflow: 'hidden',
                '@keyframes float': {
                    '0%, 100%': {
                        transform: 'translateY(0px)'
                    },
                    '50%': {
                        transform: 'translateY(-15px)'
                    }
                }
            }}>
                <Container
                    maxWidth="lg"
                    sx={{
                        py: 0,
                        px: { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
                        display: 'flex',
                        justifyContent: 'flex-end',
                        width: '100%'
                    }}
                >
                    <Box sx={{
                        maxWidth: { md: '100%', lg: '1000px', xl: '1200px' },
                        width: '100%',
                        direction: 'rtl',
                        margin: '0 0 0 auto',
                        position: 'relative'
                    }}>



                        {/* Main Content - Full Width Layout with Right Side Card */}
                        <Box sx={{ position: 'relative', width: '100%' }}>
                            {/* Course Visual - Full Width with Enhanced Design */}
                            <Box
                                sx={{
                                    position: 'relative',
                                    width: '100%',
                                    height: {
                                        xs: '300px',
                                        sm: '350px',
                                        md: '450px',
                                        lg: '550px',
                                        xl: '650px'
                                    },
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    display: 'flex',
                                    mb: 4,
                                    background: 'linear-gradient(135deg, #1B1B48 0%, #333679 50%, #663399 100%)',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    minHeight: '300px',
                                    '@media (max-width: 1200px)': {
                                        height: '400px'
                                    },
                                    '@media (max-width: 1000px)': {
                                        height: '350px'
                                    }
                                }}
                            >
                                {/* Left Side - Enhanced Content Area */}
                                <Box
                                    sx={{
                                        width: {
                                            xs: '65%',
                                            sm: '62%',
                                            md: '60%',
                                            lg: '65%',
                                            xl: '70%'
                                        },
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'flex-start',
                                        p: {
                                            xs: 2,
                                            sm: 3,
                                            md: 4,
                                            lg: 6,
                                            xl: 8
                                        },
                                        position: 'relative',
                                        zIndex: 2,
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                                        backdropFilter: 'blur(10px)',
                                        borderRight: '1px solid rgba(255,255,255,0.1)',
                                        minHeight: '100%',
                                        '@media (max-width: 1200px)': {
                                            width: '65%'
                                        },
                                        '@media (max-width: 1000px)': {
                                            width: '70%'
                                        }
                                    }}
                                >
                                    {/* Triple 8 Academy Logo - Larger Size */}
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: { md: 4, lg: 6, xl: 8 },
                                        flexWrap: 'wrap',
                                        gap: 2
                                    }}>
                                        <Box
                                            sx={{
                                                width: { md: 80, lg: 100, xl: 120 },
                                                height: { md: 80, lg: 100, xl: 120 },
                                                backgroundImage: 'url(/src/assets/images/logo.png)',
                                                backgroundSize: 'contain',
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat',
                                                mr: { md: 2, lg: 3, xl: 4 },
                                                filter: 'brightness(0) invert(1)',
                                                boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                                                borderRadius: '50%',
                                                border: '3px solid rgba(255, 255, 255, 0.2)',
                                                flexShrink: 0
                                            }}
                                        />
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography
                                                sx={{
                                                    color: 'white',
                                                    fontSize: { md: '24px', lg: '28px', xl: '32px' },
                                                    fontWeight: 'bold',
                                                    lineHeight: 1.1,
                                                    mb: 1,
                                                    textShadow: '0 3px 6px rgba(0,0,0,0.4)',
                                                    wordBreak: 'break-word'
                                                }}
                                            >
                                                Triple s Academy
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    color: 'rgba(255, 255, 255, 0.9)',
                                                    fontSize: { md: '14px', lg: '15px', xl: '16px' },
                                                    lineHeight: 1.2,
                                                    fontWeight: 500,
                                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                                }}
                                            >
                                                {t('platform')}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Enhanced Course Title with JavaScript Theme */}
                                    <Box sx={{
                                        mb: { md: 4, lg: 5, xl: 6 },
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: { md: 2, lg: 3, xl: 4 },
                                        flexWrap: 'wrap'
                                    }}>
                                        {/* Enhanced JavaScript Logo */}
                                        <Box
                                            sx={{
                                                width: { md: '80px', lg: '100px', xl: '120px' },
                                                height: { md: '80px', lg: '100px', xl: '120px' },
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #F7DF1E 0%, #F0DB4F 50%, #FFD700 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '4px solid rgba(255, 255, 255, 0.4)',
                                                boxShadow: '0 8px 30px rgba(247, 223, 30, 0.4), 0 0 0 1px rgba(255,255,255,0.1)',
                                                flexShrink: 0,
                                                position: 'relative',
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: '-2px',
                                                    left: '-2px',
                                                    right: '-2px',
                                                    bottom: '-2px',
                                                    background: 'linear-gradient(45deg, #F7DF1E, #F0DB4F, #FFD700)',
                                                    borderRadius: '50%',
                                                    zIndex: -1,
                                                    opacity: 0.3
                                                }
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    color: '#ffffff',
                                                    fontSize: { md: '24px', lg: '30px', xl: '36px' },
                                                    fontWeight: 'bold',
                                                    fontFamily: 'monospace',
                                                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                }}
                                            >
                                                SSS
                                            </Typography>
                                        </Box>

                                        {/* Enhanced Arabic Title Text */}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography
                                                sx={{
                                                    color: 'white',
                                                    fontSize: { md: '1.8rem', lg: '2.5rem', xl: '3.5rem' },
                                                    fontWeight: 'bold',
                                                    lineHeight: 1.1,
                                                    textAlign: 'right',
                                                    textShadow: '0 3px 10px rgba(0,0,0,0.5)',
                                                    mb: 1,
                                                    direction: 'rtl',
                                                    background: 'linear-gradient(45deg, #ffffff, #f0f0f0)',
                                                    backgroundClip: 'text',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    wordBreak: 'break-word',
                                                    overflow: 'hidden',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical'
                                                }}
                                            >
                                                {course?.title || 'إتقان الطب الباطني لامتحانات الترخيص'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Right Side - Redesigned Image Section */}
                                <Box
                                    sx={{
                                        width: {
                                            xs: '35%',
                                            sm: '38%',
                                            md: '40%',
                                            lg: '35%',
                                            xl: '30%'
                                        },
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        borderLeft: '1px solid rgba(255,255,255,0.1)',
                                        background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)',
                                        minHeight: '100%',
                                        '@media (max-width: 1200px)': {
                                            width: '35%'
                                        },
                                        '@media (max-width: 1000px)': {
                                            width: '30%'
                                        },
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundImage: `url(${getCourseImageUrl()})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat',
                                            opacity: 0.3,
                                            zIndex: 1
                                        }
                                    }}
                                >
                                    {/* Image Frame with Modern Design */}
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            zIndex: 2,
                                            width: { md: '85%', lg: '90%', xl: '95%' },
                                            height: { md: '70%', lg: '80%', xl: '85%' },
                                            borderRadius: '20px',
                                            overflow: 'hidden',
                                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                                            border: '3px solid rgba(255,255,255,0.3)',
                                            background: 'rgba(255,255,255,0.95)',
                                            backdropFilter: 'blur(10px)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            minHeight: '200px',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                backgroundImage: `url(${getCourseImageUrl()})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat',
                                                opacity: 0.9,
                                                zIndex: 1
                                            }
                                        }}
                                    >

                                        {/* Course Badge */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: '20px',
                                                left: '20px',
                                                zIndex: 3,
                                                background: 'rgba(27, 27, 72, 0.9)',
                                                borderRadius: '15px',
                                                px: 2,
                                                py: 1,
                                                backdropFilter: 'blur(10px)'
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    color: 'white',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1px'
                                                }}
                                            >
                                                {course?.level === 'beginner' ? t('coursesBeginnerLevel') :
                                                    course?.level === 'intermediate' ? t('coursesIntermediateLevel') :
                                                        course?.level === 'advanced' ? t('coursesAdvancedLevel') : t('coursesBeginnerLevel')}
                                            </Typography>
                                        </Box>

                                        {/* Decorative Corner Elements */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: '10px',
                                                left: '10px',
                                                width: '30px',
                                                height: '30px',
                                                border: '2px solid rgba(255,255,255,0.5)',
                                                borderRight: 'none',
                                                borderBottom: 'none',
                                                borderRadius: '8px 0 0 0',
                                                zIndex: 3
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: '10px',
                                                right: '10px',
                                                width: '30px',
                                                height: '30px',
                                                border: '2px solid rgba(255,255,255,0.5)',
                                                borderLeft: 'none',
                                                borderTop: 'none',
                                                borderRadius: '0 0 8px 0',
                                                zIndex: 3
                                            }}
                                        />
                                    </Box>

                                </Box>
                            </Box>

                            {/* Floating Card - Positioned to the left side of screen */}
                            <Box sx={{
                                position: 'absolute',
                                top: '50%',
                                left: {
                                    xs: '-40px',
                                    sm: '-50px',
                                    md: '-100px',
                                    lg: '-140px',
                                    xl: '-170px'
                                },
                                transform: 'translateY(-50%)',
                                zIndex: 1000,
                                width: {
                                    xs: '280px',
                                    sm: '300px',
                                    md: '320px',
                                    lg: '340px',
                                    xl: '360px'
                                },
                                display: { xs: 'block', sm: 'block', md: 'block' },
                                maxWidth: '90vw',
                                '@media (max-width: 1200px)': {
                                    left: '-90px',
                                    width: '300px'
                                },
                                '@media (max-width: 1000px)': {
                                    left: '-70px',
                                    width: '280px'
                                },
                                '@media (max-width: 768px)': {
                                    left: '-50px',
                                    width: '260px'
                                }
                            }}>
                                <Paper
                                    elevation={8}
                                    sx={{
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1)',
                                        border: '2px solid rgba(255, 255, 255, 0.8)',
                                        height: 'fit-content',
                                        width: '100%',
                                        animation: 'float 4s ease-in-out infinite',
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(10px)',
                                        minHeight: '400px',
                                        '@media (max-width: 1200px)': {
                                            minHeight: '350px'
                                        },
                                        '@media (max-width: 1000px)': {
                                            minHeight: '320px'
                                        }
                                    }}
                                >
                                    {/* Small Thumbnail */}
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            height: {
                                                xs: '120px',
                                                sm: '130px',
                                                md: '140px',
                                                lg: '150px',
                                                xl: '160px'
                                            },
                                            backgroundImage: `url(${getCourseImageUrl()})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat',
                                            overflow: 'hidden',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                background: 'linear-gradient(135deg, rgba(27, 27, 72, 0.1) 0%, rgba(51, 54, 121, 0.1) 50%, rgba(102, 51, 153, 0.1) 100%)',
                                                zIndex: 1
                                            },
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '40%',
                                                bottom: 0,
                                                background: 'linear-gradient(135deg, #1B1B48 0%, #333679 50%, #663399 100%)',
                                                zIndex: 2
                                            }
                                        }}
                                    >
                                        {/* Course Badge on Image */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                zIndex: 3,
                                                background: 'rgba(255, 255, 255, 0.9)',
                                                borderRadius: '12px',
                                                px: 1.5,
                                                py: 0.5,
                                                backdropFilter: 'blur(10px)'
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    color: '#333679',
                                                    fontSize: { xs: '10px', sm: '11px', md: '12px' },
                                                    fontWeight: 'bold',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}
                                            >
                                                دورة جديدة
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Content */}
                                    <Box sx={{
                                        p: {
                                            xs: 2,
                                            sm: 2.25,
                                            md: 2.5,
                                            lg: 3,
                                            xl: 3.5
                                        },
                                        minHeight: '200px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between'
                                    }}>
                                        {/* Price */}
                                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                                            <Typography
                                                variant="h4"
                                                sx={{
                                                    color: '#333679',
                                                    fontWeight: 'bold',
                                                    fontSize: {
                                                        xs: '1.5rem',
                                                        sm: '1.75rem',
                                                        md: '2rem',
                                                        lg: '2.25rem',
                                                        xl: '2.5rem'
                                                    },
                                                    textAlign: 'center',
                                                    background: 'linear-gradient(135deg, #333679 0%, #4DBFB3 100%)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                ${course?.price || '74.00'}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    color: '#666',
                                                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                                                    mt: 0.5
                                                }}
                                            >
                                                سعر الدورة
                                            </Typography>
                                        </Box>

                                        {/* Course Information */}
                                        <Box sx={{
                                            mb: { xs: 2, sm: 2.25, md: 2.5, lg: 3, xl: 3.5 },
                                            flex: 1
                                        }}>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mb: { xs: 1.5, sm: 1.75, md: 2, lg: 2.25, xl: 2.5 },
                                                pb: 1,
                                                borderBottom: '1px solid rgba(0,0,0,0.1)'
                                            }}>
                                                <PeopleAltOutlined sx={{
                                                    color: '#333679',
                                                    fontSize: { xs: 16, sm: 17, md: 18, lg: 19, xl: 20 },
                                                    mr: 1.5
                                                }} />
                                                <Typography sx={{
                                                    color: '#333',
                                                    fontSize: { xs: '11px', sm: '12px', md: '13px', lg: '14px', xl: '15px' },
                                                    wordBreak: 'break-word',
                                                    fontWeight: 500
                                                }}>
                                                    <span style={{ color: '#666' }}>المدرب:</span> <span style={{ color: '#333679', fontWeight: 'bold' }}>{course?.instructor || 'إليانور فانت'}</span>
                                                </Typography>
                                            </Box>

                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mb: { xs: 1.5, sm: 1.75, md: 2, lg: 2.25, xl: 2.5 },
                                                pb: 1,
                                                borderBottom: '1px solid rgba(0,0,0,0.1)'
                                            }}>
                                                <PlayCircleOutline sx={{
                                                    color: '#4DBFB3',
                                                    fontSize: { xs: 16, sm: 17, md: 18, lg: 19, xl: 20 },
                                                    mr: 1.5
                                                }} />
                                                <Typography sx={{
                                                    color: '#333',
                                                    fontSize: { xs: '11px', sm: '12px', md: '13px', lg: '14px', xl: '15px' },
                                                    fontWeight: 500
                                                }}>
                                                    <span style={{ color: '#666' }}>الفيديوهات:</span> <span style={{ color: '#4DBFB3', fontWeight: 'bold' }}>{course?.lectures || '14'}</span>
                                                </Typography>
                                            </Box>

                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mb: { xs: 1.5, sm: 1.75, md: 2, lg: 2.25, xl: 2.5 }
                                            }}>
                                                <AccessTime sx={{
                                                    color: '#FF6B6B',
                                                    fontSize: { xs: 16, sm: 17, md: 18, lg: 19, xl: 20 },
                                                    mr: 1.5
                                                }} />
                                                <Typography sx={{
                                                    color: '#333',
                                                    fontSize: { xs: '11px', sm: '12px', md: '13px', lg: '14px', xl: '15px' },
                                                    fontWeight: 500
                                                }}>
                                                    <span style={{ color: '#666' }}>المدة:</span> <span style={{ color: '#FF6B6B', fontWeight: 'bold' }}>{course?.duration || '6 ساعات'}</span>
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Add To Cart Button */}
                                        <Button
                                            variant="contained"
                                            size="large"
                                            endIcon={<ArrowForward sx={{
                                                fontSize: { xs: 16, sm: 17, md: 18, lg: 19, xl: 20 }
                                            }} />}
                                            sx={{
                                                background: 'linear-gradient(135deg, #333679 0%, #4DBFB3 100%)',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                py: { xs: 1.25, sm: 1.5, md: 1.75, lg: 2, xl: 2.25 },
                                                px: { xs: 2, sm: 2.5, md: 3, lg: 3.5, xl: 4 },
                                                borderRadius: '12px',
                                                textTransform: 'none',
                                                fontSize: { xs: '13px', sm: '14px', md: '15px', lg: '16px', xl: '17px' },
                                                width: '100%',
                                                minHeight: { xs: '44px', sm: '48px', md: '52px', lg: '56px', xl: '60px' },
                                                boxShadow: '0 4px 15px rgba(51, 54, 121, 0.3)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #4DBFB3 0%, #333679 100%)',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 25px rgba(51, 54, 121, 0.4)'
                                                },
                                                '&:active': {
                                                    transform: 'translateY(0px)',
                                                    boxShadow: '0 4px 15px rgba(51, 54, 121, 0.3)'
                                                },
                                                '&:disabled': {
                                                    background: '#ccc',
                                                    color: '#666',
                                                    transform: 'none',
                                                    boxShadow: 'none'
                                                }
                                            }}
                                            onClick={handleAddToCart}
                                            disabled={isAddingToCart}
                                        >
                                            {isAddingToCart ? 'جاري الإضافة...' : 'أضف إلى السلة'}
                                        </Button>
                                    </Box>
                                </Paper>

                                {/* Decorative Dots */}
                                <Box sx={{
                                    position: 'absolute',
                                    right: { xs: '-25px', sm: '-28px', md: '-30px', lg: '-35px', xl: '-40px' },
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: { xs: 0.75, sm: 1, md: 1.25, lg: 1.5, xl: 1.75 },
                                    zIndex: 1001
                                }}>
                                    {[...Array(5)].map((_, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                width: { xs: 3, sm: 4, md: 5, lg: 6, xl: 7 },
                                                height: { xs: 3, sm: 4, md: 5, lg: 6, xl: 7 },
                                                backgroundColor: '#4DBFB3',
                                                borderRadius: '50%',
                                                opacity: 0.6 + (index * 0.1),
                                                animation: `pulse 2s ease-in-out infinite ${index * 0.2}s`,
                                                '@keyframes pulse': {
                                                    '0%, 100%': {
                                                        opacity: 0.6 + (index * 0.1),
                                                        transform: 'scale(1)'
                                                    },
                                                    '50%': {
                                                        opacity: 1,
                                                        transform: 'scale(1.2)'
                                                    }
                                                }
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Mobile Layout */}
            <Box sx={{
                display: { xs: 'block', md: 'none' },
                bgcolor: '#ffffff',
                width: '100%',
                overflow: 'hidden'
            }}>
                <Container
                    maxWidth="sm"
                    sx={{
                        py: { xs: 2, sm: 3 },
                        px: { xs: 2, sm: 3 },
                        width: '100%'
                    }}
                >
                    <Box sx={{
                        width: '100%',
                        direction: 'rtl'
                    }}>
                        {/* Mobile Course Card */}
                        <Paper
                            elevation={4}
                            sx={{
                                borderRadius: 3,
                                overflow: 'hidden',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.8)',
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                width: '100%'
                            }}
                        >
                            {/* Course Image */}
                            <Box
                                sx={{
                                    position: 'relative',
                                    height: { xs: '200px', sm: '220px' },
                                    backgroundImage: `url(${getCourseImageUrl()})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'linear-gradient(135deg, rgba(27, 27, 72, 0.2) 0%, rgba(51, 54, 121, 0.2) 50%, rgba(102, 51, 153, 0.2) 100%)',
                                        zIndex: 1
                                    }
                                }}
                            >
                                {/* Course Badge */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        zIndex: 3,
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        borderRadius: '12px',
                                        px: { xs: 1.5, sm: 2 },
                                        py: 0.5,
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: '#333679',
                                            fontWeight: 'bold',
                                            fontSize: { xs: '10px', sm: '11px' }
                                        }}
                                    >
                                        {course?.level || 'متوسط'}
                                    </Typography>
                                </Box>

                                {/* Play Button */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        zIndex: 3,
                                        width: { xs: '60px', sm: '70px' },
                                        height: { xs: '60px', sm: '70px' },
                                        borderRadius: '50%',
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            background: 'rgba(255, 255, 255, 1)',
                                            transform: 'translate(-50%, -50%) scale(1.1)'
                                        }
                                    }}
                                >
                                    <PlayCircleOutline
                                        sx={{
                                            color: '#333679',
                                            fontSize: { xs: '30px', sm: '35px' }
                                        }}
                                    />
                                </Box>
                            </Box>

                            {/* Course Content */}
                            <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                                {/* Course Title */}
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: '#222222',
                                        fontWeight: 'bold',
                                        fontSize: { xs: '1.1rem', sm: '1.2rem' },
                                        lineHeight: 1.3,
                                        mb: 1.5,
                                        textAlign: 'right'
                                    }}
                                >
                                    {course?.title || 'إتقان الطب الباطني لامتحانات الترخيص'}
                                </Typography>

                                {/* Course Stats */}
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1,
                                    mb: 2
                                }}>
                                    {/* Students */}
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                        <PeopleAltOutlined sx={{
                                            color: '#4DBFB3',
                                            fontSize: { xs: '18px', sm: '20px' }
                                        }} />
                                        <Typography sx={{
                                            color: '#666666',
                                            fontSize: { xs: '13px', sm: '14px' }
                                        }}>
                                            {course?.studentCount || '1,234'} طالب مسجل
                                        </Typography>
                                    </Box>

                                    {/* Duration */}
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                        <AccessTime sx={{
                                            color: '#4DBFB3',
                                            fontSize: { xs: '18px', sm: '20px' }
                                        }} />
                                        <Typography sx={{
                                            color: '#666666',
                                            fontSize: { xs: '13px', sm: '14px' }
                                        }}>
                                            {course?.duration || '12 ساعة'} مدة الدورة
                                        </Typography>
                                    </Box>

                                    {/* Rating */}
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                        <StarIcon sx={{
                                            color: '#FFD700',
                                            fontSize: { xs: '18px', sm: '20px' }
                                        }} />
                                        <Typography sx={{
                                            color: '#666666',
                                            fontSize: { xs: '13px', sm: '14px' }
                                        }}>
                                            {course?.rating || '4.5'} ({course?.reviewCount || '20'} تقييم)
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Price and Add to Cart */}
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 2,
                                    mt: 2,
                                    pt: 2,
                                    borderTop: '1px solid rgba(0, 0, 0, 0.1)'
                                }}>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            color: '#333679',
                                            fontWeight: 'bold',
                                            fontSize: { xs: '1.3rem', sm: '1.4rem' }
                                        }}
                                    >
                                        {course?.price ? `$${course.price}` : '$99'}
                                    </Typography>

                                    <Button
                                        variant="contained"
                                        onClick={handleAddToCart}
                                        disabled={isAddingToCart}
                                        sx={{
                                            background: 'linear-gradient(135deg, #4DBFB3 0%, #333679 100%)',
                                            borderRadius: 2,
                                            px: { xs: 2, sm: 3 },
                                            py: { xs: 1, sm: 1.2 },
                                            fontSize: { xs: '13px', sm: '14px' },
                                            fontWeight: 'bold',
                                            textTransform: 'none',
                                            minWidth: { xs: '120px', sm: '140px' },
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #45A69A 0%, #2E2A5A 100%)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 4px 12px rgba(77, 191, 179, 0.3)'
                                            },
                                            '&:disabled': {
                                                background: '#cccccc',
                                                color: '#666666'
                                            }
                                        }}
                                        endIcon={<ArrowForward sx={{ fontSize: { xs: '16px', sm: '18px' } }} />}
                                    >
                                        {isAddingToCart ? 'جاري الإضافة...' : 'أضف للسلة'}
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </Container>
            </Box>

        </>
    );
};

export default CourseDetailCard;
