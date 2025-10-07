import React from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Breadcrumbs,
    Chip,
    Container
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
    Star as StarIcon
} from '@mui/icons-material';
import { styled, keyframes, alpha } from '@mui/material/styles';

// Animation keyframes
const float = keyframes`
  0% { 
    transform: translateY(0px) rotate(0deg);
    filter: drop-shadow(0 5px 15px rgba(0,0,0,0.1));
  }
  25% {
    transform: translateY(-8px) rotate(0.5deg);
    filter: drop-shadow(0 8px 20px rgba(0,0,0,0.15));
  }
  50% {
    transform: translateY(-12px) rotate(-0.5deg);
    filter: drop-shadow(0 12px 25px rgba(0,0,0,0.2));
  }
  75% {
    transform: translateY(-8px) rotate(0.5deg);
    filter: drop-shadow(0 8px 20px rgba(0,0,0,0.15));
  }
  100% { 
    transform: translateY(0px) rotate(0deg);
    filter: drop-shadow(0 5px 15px rgba(0,0,0,0.1));
  }
`;

const pulse = keyframes`
  0% { 
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  50% { 
    transform: scale(1.03);
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  }
  100% { 
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

// Styled Components
const HeroSection = styled('div')(({ theme }) => ({
    background: '#ffffff',
    color: '#333333',
    padding: { 
        xs: theme.spacing(10, 0, 2), // زيادة المسافة العلوية للموبايل
        sm: theme.spacing(12, 0, 3), 
        md: theme.spacing(14, 0, 4) 
    },
    margin: '0',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 'auto',
    display: 'flex',
    alignItems: 'flex-start',
    boxShadow: 'none',
    // إضافة مسافة إضافية لضمان عدم التداخل مع الـ header
    marginTop: { 
        xs: theme.spacing(2), // مسافة إضافية للموبايل
        sm: theme.spacing(3), 
        md: theme.spacing(4) 
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: { xs: '120px', sm: '160px', md: '200px' },
        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.2) 50%, transparent 100%)',
        zIndex: 1,
        pointerEvents: 'none'
    }
}));

const FloatingShape = styled('div')(({ theme }) => ({
    position: 'absolute',
    borderRadius: '50%',
    background: 'linear-gradient(45deg, rgba(102, 51, 153, 0.15), rgba(139, 75, 140, 0.12))',
    filter: 'blur(80px)',
    opacity: 0.3,
    zIndex: 1,
    animation: `${float} 20s ease-in-out infinite`,
    [theme.breakpoints.down('md')]: {
        filter: 'blur(60px)',
        opacity: 0.2,
    },
    [theme.breakpoints.down('sm')]: {
        filter: 'blur(40px)',
        opacity: 0.15,
    },
    '&:nth-of-type(1)': {
        width: { xs: '200px', sm: '300px', md: '400px' },
        height: { xs: '200px', sm: '300px', md: '400px' },
        top: { xs: '-80px', sm: '-120px', md: '-150px' },
        right: { xs: '-80px', sm: '-120px', md: '-150px' },
        animationDelay: '0s',
        background: 'linear-gradient(45deg, rgba(102, 51, 153, 0.18), rgba(139, 75, 140, 0.08))',
    },
    '&:nth-of-type(2)': {
        width: { xs: '150px', sm: '200px', md: '300px' },
        height: { xs: '150px', sm: '200px', md: '300px' },
        bottom: '10%',
        right: { xs: '5%', sm: '8%', md: '10%' },
        animationDelay: '8s',
        background: 'linear-gradient(45deg, rgba(102, 51, 153, 0.12), rgba(153, 102, 204, 0.15))',
    },
    '&:nth-of-type(3)': {
        width: { xs: '180px', sm: '250px', md: '350px' },
        height: { xs: '180px', sm: '250px', md: '350px' },
        top: '20%',
        left: { xs: '5%', sm: '8%', md: '10%' },
        animationDelay: '15s',
        background: 'linear-gradient(45deg, rgba(102, 51, 153, 0.14), rgba(123, 63, 152, 0.10))',
    },
}));

const CourseHeader = styled(Box)(({ theme }) => ({
    position: 'relative',
    zIndex: 2,
    maxWidth: '1200px',
    margin: '0 auto',
    transition: 'all 0.3s ease-in-out',
    padding: theme.spacing(2, 2), // إضافة مسافة علوية داخلية
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2, 1.5), // إضافة مسافة علوية للموبايل
        textAlign: 'center',
        '& .MuiBreadcrumbs-root': {
            justifyContent: 'center',
            '& .MuiBreadcrumbs-separator': {
                margin: theme.spacing(0, 1),
            },
        },
    },
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(2.5, 2), // مسافة إضافية للتابلت
    },
}));

const CourseDetailBanner = ({
    course
}) => {
    const { t } = useTranslation();
    // Return null if course data is not loaded yet
    if (!course) {
        return null;
    }

    return (
        <HeroSection>
            {/* Animated Background Elements */}
            <FloatingShape />
            <FloatingShape />
            <FloatingShape />

            <CourseHeader>
                <Container maxWidth="lg" sx={{ 
                    position: 'relative', 
                    zIndex: 1, 
                    py: 0, 
                    px: { xs: 2, sm: 3, md: 4 },
                    left: { xs: 0, md: "25%" }
                }}>
                    {/* Banner content matching the image design exactly */}
                    <Box sx={{
                        textAlign: { xs: 'center', md: 'right' },
                        maxWidth: '1200px',
                        width: '100%',
                        direction: 'rtl',
                        margin: '0 auto',
                    }}>
                        {/* Breadcrumb */}
                        <Breadcrumbs
                            aria-label="breadcrumb"
                            sx={{
                                color: '#666666',
                                mb: { xs: 2, sm: 2.5, md: 3 }, // زيادة المسافة السفلية
                                mt: { xs: 1, sm: 1.5, md: 2 }, // إضافة مسافة علوية
                                direction: 'rtl',
                                justifyContent: { xs: 'center', md: 'flex-start' },
                                flexWrap: 'wrap',
                                '& .MuiBreadcrumbs-separator': {
                                    color: '#999999',
                                    fontSize: { xs: '14px', sm: '16px' },
                                    mx: { xs: 0.5, sm: 1 }
                                }
                            }}
                        >
                            <Link to="/" style={{
                                color: '#666666',
                                textDecoration: 'none',
                                fontSize: '18px',
                                '@media (max-width: 600px)': {
                                    fontSize: '16px'
                                }
                            }}>
                                {t('navHome')}
                            </Link>
                            <Link to="/courses" style={{
                                color: '#666666',
                                textDecoration: 'none',
                                fontSize: '18px',
                                '@media (max-width: 600px)': {
                                    fontSize: '16px'
                                }
                            }}>
                                {t('navCourses')}
                            </Link>
                            <Typography color="#333333" sx={{ 
                                fontSize: { xs: '16px', sm: '20px', md: '24px' }, 
                                fontWeight: 400,
                                textAlign: { xs: 'center', md: 'right' }
                            }}>
                                {course?.title || 'إتقان الطب الباطني لامتحانات الترخيص'}
                            </Typography>
                        </Breadcrumbs>

                        {/* Categories */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: { xs: 0.5, sm: 1 }, 
                            mb: { xs: 2, sm: 3 }, 
                            justifyContent: { xs: 'center', md: 'flex-start' },
                            flexWrap: 'wrap'
                        }}>
                            <Chip
                                label="البحث"
                                size="small"
                                sx={{
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    fontSize: { xs: '12px', sm: '14px', md: '16px' },
                                    height: { xs: '28px', sm: '30px', md: '32px' },
                                    borderRadius: { xs: '14px', sm: '15px', md: '16px' }
                                }}
                            />
                            <Chip
                                label="الطب الباطني"
                                size="small"
                                sx={{
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    fontSize: { xs: '12px', sm: '14px', md: '16px' },
                                    height: { xs: '28px', sm: '30px', md: '32px' },
                                    borderRadius: { xs: '14px', sm: '15px', md: '16px' }
                                }}
                            />
                        </Box>

                        {/* Main Title - Two lines as shown in image */}
                        <Typography
                            variant="h3"
                            component="h1"
                            sx={{
                                color: '#222222',
                                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem', lg: '3.2rem' },
                                fontWeight: 'bold',
                                lineHeight: { xs: 1.1, sm: 1.2 },
                                mb: { xs: 2.5, sm: 3.5, md: 4 }, // زيادة المسافة السفلية
                                mt: { xs: 1, sm: 1.5, md: 2 }, // إضافة مسافة علوية إضافية
                                textAlign: { xs: 'center', md: 'right' },
                                wordBreak: 'break-word'
                            }}
                        >
                            {course?.title || 'إتقان الطب الباطني لامتحانات الترخيص'}
                        </Typography>

                        {/* Review Section */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: { xs: 0.5, sm: 1 }, 
                            mb: { xs: 2, sm: 3 }, 
                            justifyContent: { xs: 'center', md: 'flex-start' },
                            flexWrap: 'wrap'
                        }}>
                            <Typography sx={{ 
                                color: '#333333', 
                                fontSize: { xs: '14px', sm: '16px', md: '18px', lg: '20px' }, 
                                fontWeight: 500 
                            }}>
                                التقييم:
                            </Typography>
                            <StarIcon sx={{ 
                                color: '#FFD700', 
                                fontSize: { xs: '18px', sm: '20px', md: '22px', lg: '24px' } 
                            }} />
                            <Typography sx={{
                                color: '#222222',
                                fontSize: { xs: '16px', sm: '18px', md: '20px', lg: '22px' },
                                fontWeight: 'bold',
                                mr: { xs: 0.5, sm: 1 }
                            }}>
                                {course?.rating || '4.5'}
                            </Typography>
                            <Typography sx={{ 
                                color: '#222222', 
                                fontSize: { xs: '14px', sm: '16px', md: '18px', lg: '20px' }, 
                                fontWeight: 'bold' 
                            }}>
                                ({course?.reviewCount || '20'} طالب)
                            </Typography>
                        </Box>
                    </Box>

                </Container>
            </CourseHeader>
        </HeroSection>
    );
};

export default CourseDetailBanner;
