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
                        <Grid xs={6} md={3}>
                            <FeatureItem>
                                <ScheduleIcon />
                                <Typography variant="body2">{t('coursesDuration')}: {course.duration}</Typography>
                            </FeatureItem>
                        </Grid>
                        <Grid xs={6} md={3}>
                            <FeatureItem>
                                <VideoLibraryIcon />
                                <Typography variant="body2">{t('coursesLectures')}: {totalLessons}</Typography>
                            </FeatureItem>
                        </Grid>
                        <Grid xs={6} md={3}>
                            <FeatureItem>
                                <LanguageIcon />
                                <Typography variant="body2">{t('coursesLanguage')}: {course.language}</Typography>
                            </FeatureItem>
                        </Grid>
                        <Grid xs={6} md={3}>
                            <FeatureItem>
                                <WorkspacePremiumIcon />
                                <Typography variant="body2">{t('coursesCertificate')}: {t('commonYes')}</Typography>
                            </FeatureItem>
                        </Grid>
                    </Grid>

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
                                        📋 المتطلبات الأساسية
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
                        الخطة الزمنية
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
                                    📅 الخطة الزمنية للدورة
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
                                title="الخطة الزمنية"
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
                            لا توجد خطة زمنية متاحة حالياً.
                        </Alert>
                    )}
                </Box>
            )}

            {overviewSubTab === 2 && (
                <Box>
                    <SectionTitle variant="h5" component="h2" gutterBottom>
                        المحتوى الإثرائي
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
                                    📚 المحتوى الإثرائي والموارد
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
                                title="المحتوى الإثرائي"
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
                            لا يوجد محتوى إثرائي متاح حالياً.
                        </Alert>
                    )}
                </Box>
            )}
        </ContentSection>
    );
};

export default CourseDescriptionTab;
