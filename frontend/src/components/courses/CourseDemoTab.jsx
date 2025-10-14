import React from 'react';
import {
    Box,
    Typography,
    Avatar,
    Rating,
    Chip,
    Button
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
    StarBorder
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled Components
const ContentSection = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3, 0),
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2, 0),
    },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    color: '#333679',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
        fontSize: '1.5rem',
    },
}));

const CourseDemoTab = ({ course }) => {
    const { t } = useTranslation();
    if (!course) {
        return null;
    }

    return (
        <ContentSection>
            {/* Compact horizontal instructor strip */}
            <Box sx={{
                mb: { xs: 2, sm: 3 },
                p: { xs: 1.5, sm: 2 },
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: { xs: 1.5, sm: 2 },
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: { xs: 1.5, sm: 2 },
                bgcolor: 'background.paper'
            }}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: { xs: 1.5, sm: 2 },
                    width: { xs: '100%', sm: 'auto' }
                }}>
                    <Avatar
                        src={course.instructorAvatar}
                        alt={course.instructor}
                        sx={{ 
                            width: { xs: 50, sm: 56, md: 64 }, 
                            height: { xs: 50, sm: 56, md: 64 }, 
                            border: '2px solid', 
                            borderColor: 'primary.main' 
                        }}
                    />
                    <Box sx={{ textAlign: 'right', flex: 1 }}>
                        <Typography 
                            variant="subtitle1" 
                            fontWeight={700}
                            sx={{
                                fontSize: { xs: '0.9rem', sm: '1rem' }
                            }}
                        >
                            {course.instructor}
                        </Typography>
                        <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                                mt: 0.25,
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                        >
                            {course.instructorTitle}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: { xs: 1, sm: 2 }, 
                    flexWrap: 'wrap',
                    width: { xs: '100%', sm: 'auto' }
                }}>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        order: { xs: 1, sm: 1 }
                    }}>
                        <Rating
                            value={course.instructorRating}
                            precision={0.1}
                            readOnly
                            size="small"
                            emptyIcon={<StarBorder fontSize="inherit" />}
                            sx={{ 
                                mr: 1,
                                '& .MuiRating-icon': {
                                    fontSize: { xs: '1rem', sm: '1.1rem' }
                                }
                            }}
                        />
                        <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                                ml: 0.5,
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                        >
                            {(() => {
                                const r = course.instructorRating;
                                if (typeof r === 'number') return r.toFixed(1);
                                const n = parseFloat(r);
                                return isNaN(n) ? '0.0' : n.toFixed(1);
                            })()} / 5.0
                        </Typography>
                    </Box>
                    <Box sx={{
                        display: 'flex',
                        gap: 1,
                        order: { xs: 2, sm: 2 }
                    }}>
                        <Chip
                            size="small"
                            color="default"
                            variant="outlined"
                            label={`${course.instructorStudents?.toLocaleString?.() || course.instructorStudents || 0} ${t('commonStudent')}`}
                            sx={{
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                height: { xs: '24px', sm: '28px' }
                            }}
                        />
                        <Chip
                            size="small"
                            color="default"
                            variant="outlined"
                            label={`${course.instructorCourses || 0} ${t('coursesCourse')}`}
                            sx={{
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                height: { xs: '24px', sm: '28px' }
                            }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* Demo Content Section */}
            <Box sx={{ mb: 4 }}>
                <SectionTitle variant="h5" component="h2" gutterBottom>
                    {t('coursesCourseDemo')}
                </SectionTitle>

                {/* Demo Video/Content Placeholder */}
                <Box sx={{
                    position: 'relative',
                    width: '100%',
                    height: '400px',
                    borderRadius: 2,
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #333679 0%, #4DBFB3 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    boxShadow: '0 8px 25px rgba(14, 81, 129, 0.2)'
                }}>
                    {/* Play Button Overlay */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.1)'
                        }
                    }}>
                        <Box sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                            backdropFilter: 'blur(10px)',
                            border: '2px solid rgba(255, 255, 255, 0.3)'
                        }}>
                            <Typography variant="h4" sx={{ ml: 0.5 }}>
                                ▶
                            </Typography>
                        </Box>
                        <Typography variant="h6" fontWeight={600}>
                            {t('coursesWatchDemo')}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                            {t('coursesLearnContentBeforeEnroll')}
                        </Typography>
                    </Box>
                </Box>

                {/* Demo Description */}
                <Typography variant="body1" paragraph dir="rtl" sx={{
                    lineHeight: 1.8,
                    fontSize: '1.1rem',
                    color: 'text.secondary',
                    textAlign: 'center',
                    maxWidth: '600px',
                    mx: 'auto'
                }}>
                    {t('coursesDemoDescription')}
                </Typography>

                {/* Demo Features */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                    gap: 2,
                    mt: 3
                }}>
                    {[
                        { icon: '🎥', title: t('coursesSampleLectures'), desc: t('coursesWatchRealLectures') },
                        { icon: '📚', title: t('coursesEducationalMaterials'), desc: t('coursesLearnBooksReferences') },
                        { icon: '👨‍🏫', title: t('coursesTeachingStyle'), desc: t('coursesDiscoverInstructorMethod') },
                        { icon: '⏱️', title: t('coursesLectureDuration'), desc: t('coursesLearnLectureLength') }
                    ].map((feature, index) => (
                        <Box
                            key={index}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, rgba(14, 81, 129, 0.05) 0%, rgba(229, 151, 139, 0.05) 100%)',
                                border: '1px solid rgba(14, 81, 129, 0.1)',
                                textAlign: 'center',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 25px rgba(14, 81, 129, 0.15)'
                                }
                            }}
                        >
                            <Typography variant="h4" sx={{ mb: 1 }}>
                                {feature.icon}
                            </Typography>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: '#333679' }}>
                                {feature.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {feature.desc}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </ContentSection>
    );
};

export default CourseDemoTab;
