import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Grid,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
    Schedule as ScheduleIcon,
    VideoLibrary as VideoLibraryIcon,
    Language as LanguageIcon,
    WorkspacePremium as WorkspacePremiumIcon,
    CheckCircle
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

const FeatureItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: { xs: theme.spacing(1), sm: theme.spacing(1.5) },
    borderRadius: theme.spacing(1),
    backgroundColor: 'rgba(14, 81, 129, 0.05)',
    border: '1px solid rgba(14, 81, 129, 0.1)',
    transition: 'all 0.3s ease',
    minHeight: { xs: '48px', sm: '56px' },
    '&:hover': {
        backgroundColor: 'rgba(14, 81, 129, 0.08)',
        transform: 'translateY(-2px)',
    },
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        textAlign: 'center',
        gap: theme.spacing(0.5),
    },
}));

const SoftDivider = styled(Box)(({ theme }) => ({
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(14, 81, 129, 0.2) 50%, transparent 100%)',
    margin: theme.spacing(3, 0),
}));

const CourseDescriptionTab = ({ course, totalLessons }) => {
    const { t } = useTranslation();
    const [overviewSubTab, setOverviewSubTab] = useState(0);
    
    console.log('CourseDescriptionTab - totalLessons received:', totalLessons);
    console.log('CourseDescriptionTab - course:', course);
    console.log('CourseDescriptionTab - course.modules:', course?.modules);
    
    // Calculate total lessons if not provided or is 0
    const calculatedTotalLessons = totalLessons || (Array.isArray(course?.modules) ? course.modules.reduce((total, module) => {
        const lessonCount = Array.isArray(module.lessons) ? module.lessons.length : 0;
        console.log('Calculating lessons for module:', module.title, 'lessons:', lessonCount);
        return total + lessonCount;
    }, 0) : 0);
    
    console.log('CourseDescriptionTab - calculatedTotalLessons:', calculatedTotalLessons);

    const handleOverviewSubTabChange = (e, v) => setOverviewSubTab(v);

    if (!course) {
        return null;
    }

    return (
        <ContentSection>
            {/* Nested tabs under Overview */}
            <Tabs
                value={overviewSubTab}
                onChange={handleOverviewSubTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ 
                    mb: { xs: 2, sm: 3 }, 
                    '& .MuiTab-root': { 
                        minWidth: 'auto',
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        px: { xs: 1, sm: 2 },
                        py: { xs: 0.5, sm: 1 }
                    },
                    '& .MuiTabs-scrollButtons': {
                        width: { xs: 30, sm: 40 }
                    }
                }}
            >
                <Tab label={t('coursesCourseDescription')} />
                <Tab label={t('coursesTimeline')} />
                <Tab label={t('coursesEnrichmentContent')} />
            </Tabs>

            {overviewSubTab === 0 && (
                <Box>
                    <SectionTitle 
                        variant="h5" 
                        component="h2" 
                        gutterBottom
                        sx={{
                            fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.75rem' }
                        }}
                    >
                        {t('coursesCourseDescription')}
                    </SectionTitle>
                    <Typography 
                        variant="body1" 
                        paragraph 
                        dir="rtl" 
                        sx={{ 
                            lineHeight: { xs: 1.6, sm: 1.8 }, 
                            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
                        }}
                    >
                        {course.longDescription}
                    </Typography>

                    {/* {t('courses.quickInfoCard')} */}
                    <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mt: 1 }}>
                        <Grid xs={6} md={4}>
                            <FeatureItem>
                                <ScheduleIcon />
                                <Typography variant="body2">{t('coursesDuration')}: {course.duration}</Typography>
                            </FeatureItem>
                        </Grid>
                        <Grid xs={6} md={4}>
                            <FeatureItem>
                                <VideoLibraryIcon />
                                <Typography variant="body2">{t('coursesLectures')}: {calculatedTotalLessons}</Typography>
                            </FeatureItem>
                        </Grid>
                        <Grid xs={6} md={4}>
                            <FeatureItem>
                                <VideoLibraryIcon />
                                <Typography variant="body2">الوحدات: {course.modules?.length || 0}</Typography>
                            </FeatureItem>
                        </Grid>
                    </Grid>

                    {/* المدربين */}
                    {course.instructors && course.instructors.length > 0 && (
                        <Box sx={{ 
                            mt: 3, 
                            p: 2, 
                            borderRadius: 2, 
                            background: 'rgba(77, 191, 179, 0.05)',
                            border: '1px solid rgba(77, 191, 179, 0.1)'
                        }}>
                            <Typography variant="subtitle2" sx={{ 
                                mb: 1.5, 
                                color: '#4DBFB3', 
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                            }}>
                                👨‍🏫 المدربين
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                {course.instructors.slice(0, 5).map((instructor, index) => (
                                    <Box
                                        key={instructor.id || index}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            p: 1,
                                            borderRadius: 1.5,
                                            background: 'rgba(255, 255, 255, 0.7)',
                                            border: '1px solid rgba(77, 191, 179, 0.2)',
                                            minWidth: 'fit-content'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                background: instructor.profile_pic 
                                                    ? `url(${instructor.profile_pic})` 
                                                    : 'linear-gradient(135deg, #4DBFB3 0%, #333679 100%)',
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '0.9rem',
                                                fontWeight: 'bold',
                                                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                                border: '2px solid #fff',
                                                boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
                                                position: 'relative',
                                                '&::after': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    borderRadius: '50%',
                                                    background: instructor.profile_pic 
                                                        ? 'rgba(0, 0, 0, 0.3)' 
                                                        : 'transparent',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    zIndex: 1
                                                }
                                            }}
                                            title={instructor.name || 'مدرب'}
                                        >
                                            <Box sx={{
                                                position: 'relative',
                                                zIndex: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '100%',
                                                height: '100%',
                                                color: 'white',
                                                fontSize: '0.9rem',
                                                fontWeight: 'bold',
                                                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {instructor.name ? instructor.name.charAt(0).toUpperCase() : 'م'}
                                            </Box>
                                        </Box>
                                        <Typography variant="caption" sx={{ 
                                            color: '#333679', 
                                            fontWeight: 500,
                                            fontSize: '0.75rem'
                                        }}>
                                            {instructor.name || 'مدرب'}
                                        </Typography>
                                    </Box>
                                ))}
                                {course.instructors.length > 5 && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            p: 1,
                                            borderRadius: 1.5,
                                            background: 'rgba(224, 224, 224, 0.7)',
                                            border: '1px solid rgba(189, 189, 189, 0.3)',
                                            minWidth: 'fit-content'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#666',
                                                fontSize: '0.8rem',
                                                fontWeight: 'bold',
                                                border: '2px solid #fff',
                                                boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
                                                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                            }}
                                            title={`و ${course.instructors.length - 5} مدربين آخرين`}
                                        >
                                            +{course.instructors.length - 5}
                                        </Box>
                                        <Typography variant="caption" sx={{ 
                                            color: '#666', 
                                            fontWeight: 500,
                                            fontSize: '0.75rem'
                                        }}>
                                            آخرين
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    )}

                    <SoftDivider sx={{ my: 3 }} />

                    {/* أقسام إضافية مقترحة */}
                    <Grid container spacing={3}>
                        {Array.isArray(course.requirements) && course.requirements.length > 0 && (
                            <Grid xs={12} md={6}>
                                <Box sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, rgba(14, 81, 129, 0.05) 0%, rgba(14, 81, 129, 0.02) 100%)',
                                    border: '1px solid rgba(14, 81, 129, 0.1)',
                                    boxShadow: '0 4px 15px rgba(14, 81, 129, 0.05)'
                                }}>
                                    <SectionTitle variant="h6" component="h3" sx={{ mb: 2, color: '#333679' }}>
                                        📋 {t('courseDescription.prerequisites')}
                                    </SectionTitle>
                                    <List disablePadding>
                                        {course.requirements.map((req, idx) => (
                                            <ListItem key={idx} disableGutters sx={{ py: 0.75 }}>
                                                <ListItemIcon sx={{ minWidth: 30 }}>
                                                    <CheckCircle htmlColor="#333679" fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText primary={<Typography variant="body2" dir="rtl" sx={{ color: 'text.primary' }}>{req}</Typography>} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            </Grid>
                        )}
                        {Array.isArray(course.whoIsThisFor) && course.whoIsThisFor.length > 0 && (
                            <Grid xs={12} md={6}>
                                <Box sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, rgba(229, 151, 139, 0.05) 0%, rgba(229, 151, 139, 0.02) 100%)',
                                    border: '1px solid rgba(229, 151, 139, 0.1)',
                                    boxShadow: '0 4px 15px rgba(229, 151, 139, 0.05)'
                                }}>
                                    <SectionTitle variant="h6" component="h3" sx={{ mb: 2, color: '#4DBFB3' }}>
                                        🎯 هذه الدورة مناسبة لـ
                                    </SectionTitle>
                                    <List disablePadding>
                                        {course.whoIsThisFor.map((who, idx) => (
                                            <ListItem key={idx} disableGutters sx={{ py: 0.75 }}>
                                                <ListItemIcon sx={{ minWidth: 30 }}>
                                                    <CheckCircle htmlColor="#4DBFB3" fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText primary={<Typography variant="body2" dir="rtl" sx={{ color: 'text.primary' }}>{who}</Typography>} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            )}

            {overviewSubTab === 1 && (
                <Box>
                    <SectionTitle variant="h5" component="h2" gutterBottom>
                        {t('courseDescription.timeline')}
                    </SectionTitle>
                    {course.planPdfUrl ? (
                        <Box sx={{
                            border: '2px solid',
                            borderColor: 'rgba(14, 81, 129, 0.2)',
                            borderRadius: 3,
                            overflow: 'hidden',
                            boxShadow: '0 8px 25px rgba(14, 81, 129, 0.1)',
                            background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)',
                        }}>
                            <Box sx={{
                                p: 2,
                                background: 'linear-gradient(135deg, #333679 0%, #4DBFB3 100%)',
                                color: 'white',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Typography variant="h6" fontWeight={600}>
                                    📅 {t('courseDescription.courseTimeline')}
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="small"
                                    component={Link}
                                    to={course.planPdfUrl}
                                    target="_blank"
                                    rel="noopener"
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                                    }}
                                >
                                    فتح في نافذة جديدة
                                </Button>
                            </Box>
                            <Box component="iframe"
                                src={course.planPdfUrl}
                                title={t('courseDescription.timeline')}
                                width="100%"
                                height="600px"
                                style={{ border: 0 }}
                            />
                        </Box>
                    ) : (
                        <Alert severity="info" sx={{
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, rgba(14, 81, 129, 0.05) 0%, rgba(229, 151, 139, 0.05) 100%)',
                            border: '1px solid rgba(14, 81, 129, 0.1)'
                        }}>
                            {t('courseDescription.noTimelineAvailable')}.
                        </Alert>
                    )}
                </Box>
            )}

            {overviewSubTab === 2 && (
                <Box>
                    <SectionTitle variant="h5" component="h2" gutterBottom>
                        {t('courseDescription.enrichmentContent')}
                    </SectionTitle>
                    {course.enrichmentPdfUrl ? (
                        <Box sx={{
                            border: '2px solid',
                            borderColor: 'rgba(14, 81, 129, 0.2)',
                            borderRadius: 3,
                            overflow: 'hidden',
                            boxShadow: '0 8px 25px rgba(14, 81, 129, 0.1)',
                            background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)',
                        }}>
                            <Box sx={{
                                p: 2,
                                background: 'linear-gradient(135deg, #333679 0%, #4DBFB3 100%)',
                                color: 'white',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Typography variant="h6" fontWeight={600}>
                                    📚 {t('courseDescription.enrichmentContentAndResources')}
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="small"
                                    component={Link}
                                    to={course.enrichmentPdfUrl}
                                    target="_blank"
                                    rel="noopener"
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                                    }}
                                >
                                    فتح في نافذة جديدة
                                </Button>
                            </Box>
                            <Box component="iframe"
                                src={course.enrichmentPdfUrl}
                                title={t('courseDescription.enrichmentContent')}
                                width="100%"
                                height="600px"
                                style={{ border: 0 }}
                            />
                        </Box>
                    ) : (
                        <Alert severity="info" sx={{
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, rgba(14, 81, 129, 0.05) 0%, rgba(229, 151, 139, 0.05) 100%)',
                            border: '1px solid rgba(14, 81, 129, 0.1)'
                        }}>
                            {t('courseDescription.noEnrichmentContentAvailable')}.
                        </Alert>
                    )}
                </Box>
            )}
        </ContentSection>
    );
};

export default CourseDescriptionTab;
