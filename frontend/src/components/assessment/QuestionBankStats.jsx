import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Quiz as QuizIcon,
  QuestionAnswer as QuestionAnswerIcon,
  CheckCircle as CheckCircleIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
  Edit as EditIcon,
  Psychology as PsychologyIcon2,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme, alpha } from '@mui/material/styles';

const QuestionBankStats = ({ stats }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'mcq': return <QuestionAnswerIcon />;
      case 'true_false': return <CheckCircleIcon />;
      case 'short_answer': return <EditIcon />;
      case 'essay': return <AssessmentIcon />;
      case 'fill_blank': return <PsychologyIcon2 />;
      case 'matching': return <PsychologyIcon />;
      case 'ordering': return <AssessmentIcon />;
      default: return <QuizIcon />;
    }
  };

  const getQuestionTypeLabel = (type) => {
    const types = {
      'mcq': t('assessmentMcq'),
      'true_false': t('assessmentTrueFalse'),
      'short_answer': t('assessmentShortAnswer'),
      'essay': t('assessmentEssay'),
      'fill_blank': t('assessmentFillBlank'),
      'matching': t('assessmentMatching'),
      'ordering': t('assessmentOrdering')
    };
    return types[type] || t('assessmentUndefinedType');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    const difficulties = {
      'easy': 'سهل',
      'medium': 'متوسط',
      'hard': 'صعب'
    };
    return difficulties[difficulty] || difficulty;
  };

  const getProgressColor = (value, max = 100) => {
    const percentage = (value / max) * 100;
    if (percentage >= 70) return 'success';
    if (percentage >= 40) return 'warning';
    return 'error';
  };

  const StatCard = ({ title, value, icon, color = 'primary', subtitle, trend }) => (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card sx={{
        height: '100%',
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)}, ${alpha(theme.palette[color].main, 0.05)})`
          : `linear-gradient(135deg, ${alpha(theme.palette[color].light, 0.2)}, ${alpha(theme.palette[color].light, 0.1)})`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
        '&:hover': {
          boxShadow: theme.shadows[8],
        },
        transition: 'all 0.3s ease',
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} color={`${color}.main`}>
                {value || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: alpha(theme.palette[color].main, 0.15),
                color: theme.palette[color].main,
                '& svg': {
                  fontSize: '1.8rem'
                }
              }}
            >
              {icon}
            </Box>
          </Box>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
              <Typography variant="caption" color="success.main" fontWeight={600}>
                +{trend}% من الشهر الماضي
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const ProgressBar = ({ label, value, max, color = 'primary' }) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {value} ({Math.round((value / max) * 100)}%)
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={(value / max) * 100}
        color={getProgressColor(value, max)}
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
  );

  if (!stats) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h6" color="text.secondary">
          لا توجد إحصائيات متاحة
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="إجمالي الأسئلة"
            value={stats.total_questions}
            icon={<QuizIcon />}
            color="primary"
            trend={12}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="أسئلة هذا الشهر"
            value={stats.questions_this_month || 0}
            icon={<TimelineIcon />}
            color="info"
            trend={8}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="المقررات النشطة"
            value={stats.active_courses || 0}
            icon={<SchoolIcon />}
            color="success"
            trend={5}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="متوسط الاستخدام"
            value={stats.average_usage || 0}
            icon={<TrendingUpIcon />}
            color="warning"
            subtitle="استخدام لكل سؤال"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Questions by Type */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <QuestionAnswerIcon color="primary" />
                توزيع الأسئلة حسب النوع
              </Typography>
              
              {stats.questions_by_type ? (
                <Box>
                  {Object.entries(stats.questions_by_type).map(([type, count]) => (
                    <ProgressBar
                      key={type}
                      label={getQuestionTypeLabel(type)}
                      value={count}
                      max={stats.total_questions}
                      color="primary"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  لا توجد بيانات متاحة
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Questions by Difficulty */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PsychologyIcon color="warning" />
                توزيع الأسئلة حسب الصعوبة
              </Typography>
              
              {stats.questions_by_difficulty ? (
                <Box>
                  {Object.entries(stats.questions_by_difficulty).map(([difficulty, count]) => (
                    <ProgressBar
                      key={difficulty}
                      label={getDifficultyLabel(difficulty)}
                      value={count}
                      max={stats.total_questions}
                      color={getDifficultyColor(difficulty)}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  لا توجد بيانات متاحة
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Questions by Lesson */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon color="info" />
                الأسئلة حسب الدرس
              </Typography>
              
              {stats.questions_by_lesson ? (
                <List dense>
                  {Object.entries(stats.questions_by_lesson)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([lesson, count]) => (
                    <ListItem key={lesson} divider>
                      <ListItemIcon>
                        <QuizIcon fontSize="small" color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={lesson}
                        secondary={`${count} سؤال`}
                      />
                      <Chip
                        label={count}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  لا توجد بيانات متاحة
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Most Used Questions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="success" />
                الأسئلة الأكثر استخداماً
              </Typography>
              
              {stats.most_used_questions && stats.most_used_questions.length > 0 ? (
                <List dense>
                  {stats.most_used_questions.slice(0, 10).map((question, index) => (
                    <ListItem key={question.id} divider>
                      <ListItemIcon>
                        <Typography variant="h6" color="primary" fontWeight={700}>
                          {index + 1}
                        </Typography>
                      </ListItemIcon>
                      <ListItemText
                        primary={question.question_text}
                        secondary={`استخدم ${question.usage_count} مرة`}
                        primaryTypographyProps={{
                          sx: {
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontSize: '0.875rem'
                          }
                        }}
                      />
                      <Chip
                        label={question.usage_count}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  لا توجد بيانات متاحة
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Question Type Distribution Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssessmentIcon color="primary" />
                تحليل مفصل لأنواع الأسئلة
              </Typography>
              
              <Grid container spacing={2}>
                {stats.questions_by_type && Object.entries(stats.questions_by_type).map(([type, count]) => {
                  const percentage = Math.round((count / stats.total_questions) * 100);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={type}>
                      <Paper
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          background: theme.palette.mode === 'dark'
                            ? alpha(theme.palette.background.paper, 0.8)
                            : alpha(theme.palette.background.paper, 0.9),
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          '&:hover': {
                            boxShadow: theme.shadows[4],
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            margin: '0 auto 16px',
                            '& svg': {
                              fontSize: '1.5rem'
                            }
                          }}
                        >
                          {getQuestionTypeIcon(type)}
                        </Box>
                        <Typography variant="h4" fontWeight={700} color="primary">
                          {count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {getQuestionTypeLabel(type)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {percentage}% من إجمالي الأسئلة
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QuestionBankStats;
