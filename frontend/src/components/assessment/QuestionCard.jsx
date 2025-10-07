import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Divider,
  Collapse,
  Button
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  QuestionAnswer as QuestionAnswerIcon,
  CheckCircle as CheckCircleIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
  Edit as EditIcon2,
  Psychology as PsychologyIcon2
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme, alpha } from '@mui/material/styles';

const QuestionCard = ({ 
  question, 
  onEdit, 
  onDelete, 
  onView, 
  onCopy,
  showActions = true,
  compact = false 
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(false);

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'mcq': return <QuestionAnswerIcon />;
      case 'true_false': return <CheckCircleIcon />;
      case 'short_answer': return <EditIcon2 />;
      case 'essay': return <AssessmentIcon />;
      case 'fill_blank': return <PsychologyIcon2 />;
      case 'matching': return <PsychologyIcon />;
      case 'ordering': return <AssessmentIcon />;
      default: return <QuestionAnswerIcon />;
    }
  };

  const getQuestionTypeLabel = (type) => {
    const types = {
      'mcq': 'اختيار من متعدد',
      'true_false': 'صح أو خطأ',
      'short_answer': 'إجابة قصيرة',
      'essay': 'مقال',
      'fill_blank': 'ملء الفراغ',
      'matching': 'مطابقة',
      'ordering': 'ترتيب'
    };
    return types[type] || type;
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        sx={{
          height: '100%',
          position: 'relative',
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.default, 0.9)})`
            : `linear-gradient(135deg, ${theme.palette.background.paper}, ${alpha(theme.palette.background.default, 0.5)})`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          '&:hover': {
            boxShadow: theme.shadows[8],
            borderColor: alpha(theme.palette.primary.main, 0.3),
          },
          transition: 'all 0.3s ease',
        }}
      >
        <CardContent sx={{ p: compact ? 2 : 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                width: 40,
                height: 40
              }}
            >
              {getQuestionTypeIcon(question.question_type)}
            </Avatar>
            
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={getQuestionTypeLabel(question.question_type)}
                  size="small"
                  color="primary"
                  variant="outlined"
                  icon={getQuestionTypeIcon(question.question_type)}
                />
                <Chip
                  label={getDifficultyLabel(question.difficulty_level)}
                  size="small"
                  color={getDifficultyColor(question.difficulty_level)}
                  variant="outlined"
                />
                {question.tags && question.tags.length > 0 && (
                  <Chip
                    label={`${question.tags.length} علامة`}
                    size="small"
                    variant="outlined"
                    color="info"
                  />
                )}
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {question.course_title && `${question.course_title}`}
                {question.lesson_title && ` • ${question.lesson_title}`}
              </Typography>
            </Box>

            {showActions && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title={t('commonView')}>
                  <IconButton size="small" onClick={() => onView?.(question)}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('commonEdit')}>
                  <IconButton size="small" onClick={() => onEdit?.(question)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('commonCopy')}>
                  <IconButton size="small" onClick={() => onCopy?.(question)}>
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('commonDelete')}>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => onDelete?.(question)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>

          {/* Question Text */}
          <Typography 
            variant={compact ? "body2" : "body1"} 
            sx={{ 
              mb: 2,
              lineHeight: 1.6,
              color: 'text.primary'
            }}
          >
            {compact ? truncateText(question.question_text, 80) : question.question_text}
          </Typography>

          {/* Options Preview for MCQ */}
          {question.question_type === 'mcq' && question.options_list && question.options_list.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                الخيارات:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {question.options_list.slice(0, compact ? 2 : 4).map((option, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 20 }}>
                      {String.fromCharCode(65 + index)}.
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {truncateText(option, 50)}
                    </Typography>
                  </Box>
                ))}
                {question.options_list.length > (compact ? 2 : 4) && (
                  <Typography variant="caption" color="text.secondary">
                    +{question.options_list.length - (compact ? 2 : 4)} خيارات أخرى
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {/* Correct Answer Preview */}
          {!compact && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                الإجابة الصحيحة:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  p: 1, 
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  borderRadius: 1,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  color: 'success.main',
                  fontWeight: 500
                }}
              >
                {question.correct_answer}
              </Typography>
            </Box>
          )}

          {/* Explanation */}
          {question.explanation && !compact && (
            <Collapse in={expanded}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  الشرح:
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    p: 1, 
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    borderRadius: 1,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    color: 'info.main'
                  }}
                >
                  {question.explanation}
                </Typography>
              </Box>
            </Collapse>
          )}

          {/* Tags */}
          {question.tags && question.tags.length > 0 && !compact && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                العلامات:
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {question.tags.slice(0, 5).map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    variant="outlined"
                    color="info"
                  />
                ))}
                {question.tags.length > 5 && (
                  <Chip
                    label={`+${question.tags.length - 5}`}
                    size="small"
                    variant="outlined"
                    color="default"
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Media Files */}
          {(question.image || question.audio || question.video) && !compact && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                الملفات المرفقة:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {question.image && (
                  <Chip
                    icon={<VisibilityIcon />}
                    label="صورة"
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {question.audio && (
                  <Chip
                    icon={<VisibilityIcon />}
                    label="صوت"
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                )}
                {question.video && (
                  <Chip
                    icon={<VisibilityIcon />}
                    label="فيديو"
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Footer */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {formatDate(question.created_at)}
            </Typography>
            
            {question.explanation && !compact && (
              <Button
                size="small"
                onClick={() => setExpanded(!expanded)}
                endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ textTransform: 'none' }}
              >
                {expanded ? 'إخفاء الشرح' : 'عرض الشرح'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuestionCard;
