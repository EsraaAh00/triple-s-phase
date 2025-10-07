import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  Chip, 
  LinearProgress, 
  IconButton,
  useTheme,
  alpha,
  Tooltip,
  Badge
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  School, 
  Assignment, 
  Event, 
  Group,
  EmojiEvents,
  CheckCircle,
  Schedule,
  Visibility,
  Message,
  MoreVert,
  PlayArrow,
  MenuBook,
  VideoLibrary,
  Quiz,
  Grade
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// مكون البطاقة الإحصائية المحسنة
export const EnhancedStatCard = ({ 
  title, 
  value, 
  icon, 
  color = 'primary', 
  trend, 
  trendValue, 
  trendLabel,
  subtitle,
  onClick,
  loading = false 
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        onClick={onClick}
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)}, ${alpha(theme.palette[color].main, 0.05)})`
            : `linear-gradient(135deg, ${alpha(theme.palette[color].light, 0.3)}, ${alpha(theme.palette[color].light, 0.1)})`,
          border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
          },
          '&:hover': {
            boxShadow: theme.shadows[8],
            '& .stat-icon': {
              transform: 'scale(1.1) rotate(5deg)',
            }
          },
          transition: 'all 0.3s ease',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box
              className="stat-icon"
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: alpha(theme.palette[color].main, 0.15),
                color: theme.palette[color].main,
                transition: 'all 0.3s ease',
                '& svg': {
                  fontSize: '1.8rem'
                }
              }}
            >
              {icon}
            </Box>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {trend === 'up' ? (
                  <TrendingUp sx={{ color: 'success.main', fontSize: '1.2rem' }} />
                ) : (
                  <TrendingDown sx={{ color: 'error.main', fontSize: '1.2rem' }} />
                )}
                <Typography 
                  variant="caption" 
                  color={trend === 'up' ? 'success.main' : 'error.main'}
                  fontWeight={600}
                >
                  {trendValue}%
                </Typography>
              </Box>
            )}
          </Box>

          <Typography variant="h4" fontWeight={700} sx={{ mb: 1, color: theme.palette[color].main }}>
            {loading ? '...' : value}
          </Typography>
          
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            {title}
          </Typography>
          
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {subtitle}
            </Typography>
          )}
          
          {trendLabel && (
            <Typography variant="caption" color="text.secondary">
              {trendLabel}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// مكون بطاقة المقرر المحسنة
export const EnhancedCourseCard = ({ 
  course, 
  onView, 
  onContinue,
  variant = 'student' // 'student' or 'teacher'
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const getProgressColor = (progress) => {
    const progressValue = progress || 0;
    if (progressValue >= 80) return 'success';
    if (progressValue >= 60) return 'info';
    if (progressValue >= 40) return 'warning';
    return 'error';
  };

  const getProgressLabel = (progress) => {
    const progressValue = progress || 0;
    if (progressValue >= 80) return t('dashboardExcellent');
    if (progressValue >= 60) return t('dashboardVeryGood');
    if (progressValue >= 40) return t('dashboardGood');
    return t('dashboardNeedsImprovement');
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        sx={{
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.02)})`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.primary.light, 0.05)})`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          '&:hover': {
            boxShadow: theme.shadows[8],
            '& .course-image': {
              transform: 'scale(1.05)',
            }
          },
          transition: 'all 0.3s ease',
        }}
      >
        <Box sx={{ position: 'relative' }}>
          {/* Course Image/Background */}
          <Box
            className="course-image"
            sx={{
              height: 120,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              position: 'relative',
              transition: 'transform 0.3s ease',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url(/api/courses/cover-image/)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.3,
              }
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                display: 'flex',
                gap: 1,
              }}
            >
              <Chip
                label={getProgressLabel(course.progress || 0)}
                size="small"
                color={getProgressColor(course.progress || 0)}
                sx={{ 
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)',
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                }}
              />
            </Box>
          </Box>

          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                }}
              >
                {(course.title || course.name || 'C').charAt(0)}
              </Avatar>
              
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                  {course.title || course.name || 'مقرر بدون عنوان'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {course.instructors ? course.instructors.join(', ') : course.teacher || 'غير محدد'}
                </Typography>
                
                {variant === 'teacher' && (
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip
                      icon={<Group fontSize="small" />}
                      label={`${course.students || 0} طالب`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={<Assignment fontSize="small" />}
                      label={`${course.assignments || 0} واجب`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                )}
              </Box>
            </Box>

            {/* Progress Section */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  التقدم
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {course.progress || 0}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={course.progress || 0}
                color={getProgressColor(course.progress || 0)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: alpha(theme.palette.grey[400], 0.3),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                  }
                }}
              />
            </Box>

            {/* Course Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Schedule fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {course.nextSession}
                </Typography>
              </Box>
              
              {variant === 'teacher' && course.pendingAssignments > 0 && (
                <Chip
                  label={`${course.pendingAssignments} واجب قيد التصحيح`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              )}
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box sx={{ flexGrow: 1 }}>
                {variant === 'student' ? (
                  <Tooltip title="استمر في التعلم">
                    <IconButton
                      onClick={onContinue}
                      sx={{
                        width: '100%',
                        height: 40,
                        borderRadius: 2,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                        color: 'white',
                        '&:hover': {
                          background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <PlayArrow />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="إدارة المقرر">
                    <IconButton
                      onClick={onView}
                      sx={{
                        width: '100%',
                        height: 40,
                        borderRadius: 2,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                        color: 'white',
                        '&:hover': {
                          background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              
              <Tooltip title="رسائل">
                <IconButton
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.primary.main}`,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      background: alpha(theme.palette.primary.main, 0.1),
                    }
                  }}
                >
                  <Message fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </CardContent>
        </Box>
      </Card>
    </motion.div>
  );
};

// مكون الإنجازات المحسن
export const EnhancedAchievementCard = ({ achievement }) => {
  const theme = useTheme();

  // إضافة قيم افتراضية للبيانات المفقودة
  const safeAchievement = {
    id: achievement?.id || 0,
    title: achievement?.title || 'إنجاز جديد',
    description: achievement?.description || 'وصف الإنجاز',
    color: achievement?.color || 'primary',
    icon: achievement?.icon || <Star />,
    progress: achievement?.progress || 0,
    reward: achievement?.reward || null,
    ...achievement
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        sx={{
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette[safeAchievement.color]?.main || theme.palette.primary.main, 0.1)}, ${alpha(theme.palette[safeAchievement.color]?.main || theme.palette.primary.main, 0.05)})`
            : `linear-gradient(135deg, ${alpha(theme.palette[safeAchievement.color]?.light || theme.palette.primary.light, 0.2)}, ${alpha(theme.palette[safeAchievement.color]?.light || theme.palette.primary.light, 0.1)})`,
          border: `1px solid ${alpha(theme.palette[safeAchievement.color]?.main || theme.palette.primary.main, 0.2)}`,
          '&:hover': {
            boxShadow: theme.shadows[8],
            '& .achievement-icon': {
              transform: 'scale(1.1) rotate(10deg)',
            }
          },
          transition: 'all 0.3s ease',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box
              className="achievement-icon"
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: alpha(theme.palette[safeAchievement.color]?.main || theme.palette.primary.main, 0.15),
                color: theme.palette[safeAchievement.color]?.main || theme.palette.primary.main,
                transition: 'all 0.3s ease',
                '& svg': {
                  fontSize: '1.8rem'
                }
              }}
            >
              {safeAchievement.icon}
            </Box>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                {safeAchievement.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {safeAchievement.description}
              </Typography>
            </Box>
            
            {safeAchievement.progress === 100 && (
              <Badge
                badgeContent="✓"
                color="success"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '1rem',
                    fontWeight: 'bold',
                  }
                }}
              >
                <EmojiEvents sx={{ color: 'warning.main', fontSize: '2rem' }} />
              </Badge>
            )}
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                التقدم
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {safeAchievement.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={safeAchievement.progress}
              color={safeAchievement.color}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha(theme.palette.grey[400], 0.3),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                }
              }}
            />
          </Box>

          {safeAchievement.reward && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              p: 1.5,
              borderRadius: 2,
              background: alpha(theme.palette.warning.main, 0.1),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
            }}>
              <Star sx={{ color: 'warning.main', fontSize: '1.2rem' }} />
              <Typography variant="body2" fontWeight={600} color="warning.main">
                مكافأة: {safeAchievement.reward}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// مكون النشاط الأخير المحسن
export const EnhancedActivityItem = ({ activity }) => {
  const theme = useTheme();

  // إضافة قيم افتراضية للبيانات المفقودة
  const safeActivity = {
    id: activity?.id || 0,
    title: activity?.title || 'نشاط جديد',
    description: activity?.description || 'وصف النشاط',
    time: activity?.time || 'الآن',
    type: activity?.type || 'default',
    course: activity?.course || null,
    ...activity
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'lesson':
        return <MenuBook fontSize="small" />;
      case 'assignment':
        return <Assignment fontSize="small" />;
      case 'quiz':
        return <Quiz fontSize="small" />;
      case 'meeting':
        return <VideoLibrary fontSize="small" />;
      case 'grade':
        return <Grade fontSize="small" />;
      default:
        return <Event fontSize="small" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'lesson':
        return 'primary';
      case 'assignment':
        return 'warning';
      case 'quiz':
        return 'error';
      case 'meeting':
        return 'info';
      case 'grade':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <motion.div
      whileHover={{ x: 4 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        sx={{
          mb: 2,
          borderRadius: 3,
          background: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.8)
            : alpha(theme.palette.background.paper, 0.9),
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          '&:hover': {
            boxShadow: theme.shadows[4],
            borderColor: alpha(theme.palette.primary.main, 0.3),
          },
          transition: 'all 0.3s ease',
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: alpha(theme.palette[getActivityColor(safeActivity.type)]?.main || theme.palette.primary.main, 0.1),
                color: theme.palette[getActivityColor(safeActivity.type)]?.main || theme.palette.primary.main,
              }}
            >
              {getActivityIcon(safeActivity.type)}
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {safeActivity.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {safeActivity.time}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {safeActivity.description}
              </Typography>
              
              {safeActivity.course && (
                <Chip
                  label={safeActivity.course}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    height: 24,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// مكون الإعلان المحسن
export const EnhancedAnnouncementCard = ({ announcement }) => {
  const theme = useTheme();

  // إضافة قيم افتراضية للبيانات المفقودة
  const safeAnnouncement = {
    id: announcement?.id || 0,
    title: announcement?.title || 'إعلان جديد',
    content: announcement?.content || 'محتوى الإعلان',
    date: announcement?.date || new Date().toLocaleDateString('en-GB'),
    read: announcement?.read || false,
    course: announcement?.course || null,
    ...announcement
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        sx={{
          mb: 2,
          borderRadius: 3,
          background: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.8)
            : alpha(theme.palette.background.paper, 0.9),
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          position: 'relative',
          '&:hover': {
            boxShadow: theme.shadows[4],
          },
          transition: 'all 0.3s ease',
        }}
      >
        {!safeAnnouncement.read && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'error.main',
              animation: 'pulse 2s infinite',
            }}
          />
        )}
        
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main,
              }}
            >
              <Message fontSize="small" />
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {safeAnnouncement.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {safeAnnouncement.date}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {safeAnnouncement.content}
              </Typography>
              
              {safeAnnouncement.course && (
                <Chip
                  label={safeAnnouncement.course}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    height: 24,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};
