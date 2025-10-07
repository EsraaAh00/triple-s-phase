import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  useTheme,
  alpha,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Backdrop,
  Slide,
  CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  QuestionAnswer as QuestionIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  FlipToBack as FlipIcon,
  FlipToFront as UnflipIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { keyframes } from '@mui/system';

// Animation keyframes
const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const scaleIn = keyframes`
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const FlashcardCard = ({ 
  flashcard, 
  onEdit, 
  onDelete, 
  showActions = true 
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isFlipped, setIsFlipped] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    loading: false
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDelete = () => {
    setDeleteDialog({ open: true, loading: false });
  };

  const confirmDelete = async () => {
    setDeleteDialog(prev => ({ ...prev, loading: true }));
    
    try {
      await onDelete(flashcard.id);
      setDeleteDialog({ open: false, loading: false });
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ open: false, loading: false });
  };


  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card 
          sx={{ 
            height: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
            }
          }}
        >
          <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: '#333679', width: 32, height: 32 }}>
                  <QuestionIcon fontSize="small" />
                </Avatar>
                <Typography variant="h6" fontWeight={600} color="#333679">
                  بطاقة تعليمية
                </Typography>
              </Box>
              
              {showActions && (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title={t('commonEdit')}>
                    <IconButton 
                      size="small" 
                      onClick={() => onEdit(flashcard)}
                      sx={{ color: '#1976d2' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('commonDelete')}>
                    <IconButton 
                      size="small" 
                      onClick={handleDelete}
                      sx={{ color: '#d32f2f' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>

            {/* Flip Card */}
            <Box 
              sx={{ 
                flex: 1,
                perspective: '1000px',
                cursor: 'pointer'
              }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 200,
                  transition: 'transform 0.6s',
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* Front Side */}
                <Card
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    borderRadius: 2
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8 }}>
                      الوجه الأمامي
                    </Typography>
                    {flashcard.front_image && (
                      <Box sx={{ mb: 1, maxWidth: '80%', maxHeight: 80 }}>
                        <img 
                          src={flashcard.front_image} 
                          alt="Front" 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '100%', 
                            objectFit: 'contain',
                            borderRadius: 4
                          }} 
                        />
                      </Box>
                    )}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: '0.9rem',
                        lineHeight: 1.4,
                        maxHeight: 60,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {flashcard.front_text}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Back Side */}
                <Card
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    borderRadius: 2
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8 }}>
                      الوجه الخلفي
                    </Typography>
                    {flashcard.back_image && (
                      <Box sx={{ mb: 1, maxWidth: '80%', maxHeight: 80 }}>
                        <img 
                          src={flashcard.back_image} 
                          alt="Back" 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '100%', 
                            objectFit: 'contain',
                            borderRadius: 4
                          }} 
                        />
                      </Box>
                    )}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: '0.9rem',
                        lineHeight: 1.4,
                        maxHeight: 60,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {flashcard.back_text}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Flip Button */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                size="small"
                startIcon={isFlipped ? <UnflipIcon /> : <FlipIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(!isFlipped);
                }}
                sx={{ 
                  color: '#333679',
                  '&:hover': {
                    backgroundColor: alpha('#333679', 0.1)
                  }
                }}
              >
                {isFlipped ? 'عرض الوجه الأمامي' : 'عرض الوجه الخلفي'}
              </Button>
            </Box>

            {/* Footer Info */}
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ fontSize: 16, color: '#666' }} />
                  <Typography variant="caption" color="text.secondary">
                    {flashcard.created_by_name || 'غير محدد'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimeIcon sx={{ fontSize: 16, color: '#666' }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(flashcard.created_at)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {flashcard.lesson_title && (
                  <Chip
                    label={`درس: ${flashcard.lesson_title}`}
                    size="small"
                    sx={{ 
                      bgcolor: alpha('#2e7d32', 0.1),
                      color: '#2e7d32',
                      fontSize: '0.7rem'
                    }}
                  />
                )}
                {flashcard.related_question_text && (
                  <Chip
                    label="مرتبط بسؤال"
                    size="small"
                    sx={{ 
                      bgcolor: alpha('#333679', 0.1),
                      color: '#333679',
                      fontSize: '0.7rem'
                    }}
                  />
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={cancelDelete}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            animation: `${scaleIn} 0.3s ease-out`,
            border: '1px solid rgba(192,57,43,0.2)'
          }
        }}
        BackdropComponent={Backdrop}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)'
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pb: 2,
          background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
          color: 'white',
          borderRadius: '12px 12px 0 0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            animation: `${pulse} 3s ease-in-out infinite`
          }} />
          <WarningIcon 
            sx={{ 
              fontSize: 48, 
              mb: 2,
              animation: `${shake} 0.5s ease-in-out infinite`,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
            }} 
          />
          <Typography variant="h5" sx={{ fontWeight: 'bold', position: 'relative', zIndex: 1 }}>
            {t('assessmentConfirmDelete')}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 500 }}>
            {t('assessmentConfirmDeleteFlashcard')}
          </Typography>
          
          <Box sx={{ 
            mb: 3,
            p: 3,
            background: 'linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%)',
            border: '2px dashed #ff6b6b',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: '#333679', width: 40, height: 40 }}>
                <QuestionIcon />
              </Avatar>
              <Typography variant="body1" sx={{ 
                fontWeight: 'bold', 
                color: '#d63031',
                flex: 1,
                textAlign: 'right'
              }}>
                بطاقة تعليمية
              </Typography>
            </Box>
            
            <Box sx={{ 
              background: 'white', 
              p: 2, 
              borderRadius: 1, 
              border: '1px solid #eee',
              mb: 2
            }}>
              <Typography variant="body2" sx={{ color: '#666', mb: 1, textAlign: 'right' }}>
                <strong>الوجه الأمامي:</strong>
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#333', 
                maxHeight: 40,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                textAlign: 'right'
              }}>
                {flashcard.front_text}
              </Typography>
            </Box>

            <Box sx={{
              position: 'absolute',
              top: -10,
              right: -10,
              width: 40,
              height: 40,
              background: 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
              borderRadius: '50%',
              opacity: 0.1,
              animation: `${pulse} 2s ease-in-out infinite`
            }} />
          </Box>
          
          <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
            ⚠️ <strong>تحذير:</strong> هذا الإجراء لا يمكن التراجع عنه. سيتم حذف البطاقة التعليمية وجميع البيانات المرتبطة بها نهائياً.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ 
          justifyContent: 'center', 
          gap: 2, 
          p: 3,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderRadius: '0 0 12px 12px'
        }}>
          <Button
            onClick={cancelDelete}
            variant="outlined"
            size="large"
            disabled={deleteDialog.loading}
            sx={{
              minWidth: 120,
              py: 1.5,
              borderRadius: 2,
              borderColor: '#6c757d',
              color: '#6c757d',
              fontWeight: 'bold',
              '&:hover': {
                borderColor: '#495057',
                backgroundColor: 'rgba(108,117,125,0.1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(108,117,125,0.3)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {t('commonCancel')}
          </Button>
          
          <Button
            onClick={confirmDelete}
            variant="contained"
            size="large"
            disabled={deleteDialog.loading}
            sx={{
              minWidth: 120,
              py: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #c82333 0%, #a71e2a 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(220,53,69,0.4)'
              },
              '&:disabled': {
                background: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)',
                transform: 'none'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {deleteDialog.loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} sx={{ color: 'white' }} />
                <span>جاري الحذف...</span>
              </Box>
            ) : (
              <>
                <DeleteIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                حذف نهائي
              </>
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FlashcardCard;
