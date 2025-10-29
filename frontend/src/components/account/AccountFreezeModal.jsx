import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ar, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import accountFreezeService from '../../services/accountFreeze.service';

const AccountFreezeModal = ({ open, onClose, onSuccess, freezeStatus }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    freeze_reason: '',
    freeze_end_date: null,
    freeze_end_time: null
  });
  const [hasUsedFreeze, setHasUsedFreeze] = useState(false);

  // تحميل حالة التجميد عند فتح الـ Modal
  useEffect(() => {
    if (open) {
      loadFreezeStatus();
    }
  }, [open]);

  const loadFreezeStatus = async () => {
    try {
      const response = await accountFreezeService.getFreezeStatus();
      if (response.success && response.data) {
        setHasUsedFreeze(response.data.has_used_freeze || false);
      }
    } catch (error) {
      console.error('Error loading freeze status:', error);
    }
  };

  // خيارات مدة التجميد المحددة مسبقاً (أقصى مدة 60 يوم)
  const predefinedDurations = [
    { label: t('freezeModal.oneWeek'), days: 7 },
    { label: t('freezeModal.twoWeeks'), days: 14 },
    { label: t('freezeModal.oneMonth'), days: 30 },
    { label: t('freezeModal.twoMonths'), days: 60 }
  ];

  // أسباب التجميد الشائعة
  const commonReasons = [
    t('freezeModal.focusOnStudy'),
    t('freezeModal.personalIssues'),
    t('freezeModal.travel'),
    t('freezeModal.illness'),
    t('freezeModal.familyCircumstances'),
    t('freezeModal.otherReasons')
  ];

  useEffect(() => {
    if (open) {
      setError('');
      setSuccess('');
      setFormData({
        freeze_reason: '',
        freeze_end_date: null,
        freeze_end_time: null
      });
      // استخدام freezeStatus إذا كان متوفراً من الـ prop
      if (freezeStatus) {
        setHasUsedFreeze(freezeStatus.has_used_freeze || false);
      }
    }
  }, [open, freezeStatus]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handlePredefinedDuration = (days) => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    setFormData(prev => ({
      ...prev,
      freeze_end_date: endDate,
      freeze_end_time: new Date(endDate.getTime())
    }));
  };

  const handleSubmit = async () => {
    // التحقق من أن المستخدم لم يستخدم التجميد من قبل
    if (hasUsedFreeze) {
      setError(t('freezeModal.alreadyUsedMessage') || 'لقد قمت باستخدام ميزة التجميد من قبل. يمكنك استخدام هذه الميزة مرة واحدة فقط.');
      return;
    }

    if (!formData.freeze_reason.trim()) {
      setError(t('freezeModal.errors.enterReason'));
      return;
    }

    if (!formData.freeze_end_date) {
      setError(t('freezeModal.errors.selectEndDate'));
      return;
    }

    // التحقق من أن التاريخ في المستقبل
    const now = new Date();
    const selectedDate = new Date(formData.freeze_end_date);
    if (selectedDate <= now) {
      setError(t('freezeModal.errors.futureDate'));
      return;
    }

    // التحقق من أن المدة لا تتجاوز 60 يوم
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    if (selectedDate > maxDate) {
      setError(t('freezeModal.errors.maxSixtyDays') || 'مدة التجميد لا يمكن أن تتجاوز 60 يوم');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // دمج التاريخ والوقت
      const freezeEndDateTime = new Date(formData.freeze_end_date);
      if (formData.freeze_end_time) {
        freezeEndDateTime.setHours(formData.freeze_end_time.getHours());
        freezeEndDateTime.setMinutes(formData.freeze_end_time.getMinutes());
      }

      const response = await accountFreezeService.freezeAccount({
        freeze_reason: formData.freeze_reason,
        freeze_end_date: freezeEndDateTime.toISOString()
      });

      if (response.success) {
        setSuccess(t('freezeModal.success.accountFrozen'));
        setTimeout(() => {
          onSuccess && onSuccess(response.data);
          onClose();
        }, 2000);
      } else {
        setError(response.error || t('freezeModal.errors.freezeFailed'));
      }
    } catch (error) {
      console.error('Error freezing account:', error);
      
      // معالجة أخطاء المصادقة
      if (error.message && error.message.includes('انتهت صلاحية الجلسة')) {
        setError(t('freezeModal.errors.sessionExpired'));
      } else if (error.message && error.message.includes('يجب تسجيل الدخول')) {
        setError(t('freezeModal.errors.loginRequired'));
      } else {
        // معالجة أخطاء التجميد المحددة
        const errorMessage = error.response?.data?.error;
        if (errorMessage && typeof errorMessage === 'object' && errorMessage.freeze_end_date) {
          // خطأ من validation (مثل: استخدم التجميد من قبل)
          setError(Array.isArray(errorMessage.freeze_end_date) 
            ? errorMessage.freeze_end_date[0] 
            : errorMessage.freeze_end_date);
        } else if (errorMessage && typeof errorMessage === 'string') {
          setError(errorMessage);
        } else {
          setError(error.message || t('freezeModal.errors.freezeFailed'));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    // استخدام التاريخ الميلادي للعربية أيضاً
    const locale = 'en-US';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getRemainingDays = () => {
    if (!formData.freeze_end_date) return 0;
    const now = new Date();
    const endDate = new Date(formData.freeze_end_date);
    const diffTime = endDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isRTL = i18n.language === 'ar';
  // استخدام التاريخ الميلادي للعربية أيضاً
  const dateLocale = enUS;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateLocale}>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            direction: isRTL ? 'rtl' : 'ltr'
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pb: 2,
          background: 'linear-gradient(135deg, #333679 0%, #4DBFB3 100%)',
          color: 'white',
          borderRadius: '12px 12px 0 0',
          fontSize: '1.5rem',
          fontWeight: 700
        }}>
          🔒 {t('freezeModal.title')}
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {hasUsedFreeze && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {t('freezeModal.alreadyUsedTitle') || 'تم استخدام التجميد من قبل'}
              </Typography>
              <Typography variant="body2">
                {t('freezeModal.alreadyUsedMessage') || 'لقد قمت باستخدام ميزة التجميد من قبل. يمكنك استخدام هذه الميزة مرة واحدة فقط.'}
              </Typography>
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* سبب التجميد */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
              {t('freezeModal.freezeReason')} *
            </Typography>
            
            {/* أسباب شائعة */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                {t('freezeModal.commonReasons')}:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {commonReasons.map((reason) => (
                  <Chip
                    key={reason}
                    label={reason}
                    onClick={() => !hasUsedFreeze && handleInputChange('freeze_reason', reason)}
                    variant={formData.freeze_reason === reason ? 'filled' : 'outlined'}
                    color={formData.freeze_reason === reason ? 'primary' : 'default'}
                    disabled={hasUsedFreeze}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder={t('freezeModal.reasonPlaceholder')}
              value={formData.freeze_reason}
              onChange={(e) => handleInputChange('freeze_reason', e.target.value)}
              disabled={hasUsedFreeze}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* مدة التجميد */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
              {t('freezeModal.freezeDuration')} *
            </Typography>
            
            {/* خيارات مدة محددة مسبقاً */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                {t('freezeModal.quickOptions')}:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {predefinedDurations.map((duration) => (
                  <Chip
                    key={duration.days}
                    label={duration.label}
                    onClick={() => !hasUsedFreeze && handlePredefinedDuration(duration.days)}
                    variant="outlined"
                    color="secondary"
                    disabled={hasUsedFreeze}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            </Box>

            {/* اختيار تاريخ مخصص */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              alignItems: 'flex-start',
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
                <DatePicker
                  label={t('freezeModal.endDate')}
                  value={formData.freeze_end_date}
                  onChange={(date) => handleInputChange('freeze_end_date', date)}
                  disabled={hasUsedFreeze}
                  minDate={new Date()}
                  maxDate={new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'medium',
                      sx: { 
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                          height: '56px',
                          fontSize: '1rem',
                          '& fieldset': {
                            borderColor: '#e0e0e0',
                            borderWidth: '1px'
                          },
                          '&:hover fieldset': {
                            borderColor: '#333679'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#333679',
                            borderWidth: '2px'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '0.9rem',
                          color: '#666'
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#333679'
                        }
                      }
                    },
                    popper: {
                      sx: {
                        '& .MuiPaper-root': {
                          borderRadius: 2,
                          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                          border: '1px solid #e0e0e0'
                        }
                      }
                    }
                  }}
                />
              </Box>
              
              <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '150px' } }}>
                <TimePicker
                  label={t('freezeModal.time')}
                  value={formData.freeze_end_time}
                  onChange={(time) => handleInputChange('freeze_end_time', time)}
                  disabled={hasUsedFreeze}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'medium',
                      sx: { 
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                          height: '56px',
                          fontSize: '1rem',
                          '& fieldset': {
                            borderColor: '#e0e0e0',
                            borderWidth: '1px'
                          },
                          '&:hover fieldset': {
                            borderColor: '#333679'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#333679',
                            borderWidth: '2px'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '0.9rem',
                          color: '#666'
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#333679'
                        }
                      }
                    },
                    popper: {
                      sx: {
                        '& .MuiPaper-root': {
                          borderRadius: 2,
                          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                          border: '1px solid #e0e0e0'
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Box>

            {/* عرض المدة المتبقية */}
            {formData.freeze_end_date && (
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: '#f8f9fa', 
                borderRadius: 2,
                border: '1px solid #e9ecef'
              }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  <strong>{t('freezeModal.remainingDays')}:</strong> {getRemainingDays()} {t('freezeModal.days')}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  <strong>{t('freezeModal.endDate')}:</strong> {formatDate(formData.freeze_end_date)}
                </Typography>
              </Box>
            )}
          </Box>

          {/* تحذيرات مهمة */}
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              {t('freezeModal.importantWarnings')}:
            </Typography>
            <Typography variant="body2" component="div">
              • {t('freezeModal.warning1')}<br/>
              • {t('freezeModal.warning2')}<br/>
              • {t('freezeModal.warning3') || 'يمكنك استخدام التجميد مرة واحدة فقط'}<br/>
              • {t('freezeModal.warning4') || 'أقصى مدة للتجميد هي 60 يوم'}<br/>
              • {t('freezeModal.warning5') || 'سيتم إمداد اشتراكاتك تلقائياً بنفس مدة التجميد'}
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{ borderRadius: 2 }}
            disabled={loading}
          >
            {t('freezeModal.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || hasUsedFreeze || !formData.freeze_reason.trim() || !formData.freeze_end_date}
            sx={{ 
              borderRadius: 2,
              background: hasUsedFreeze 
                ? 'linear-gradient(45deg, #ccc, #999)' 
                : 'linear-gradient(45deg, #dc3545, #c82333)',
              '&:hover': {
                background: hasUsedFreeze 
                  ? 'linear-gradient(45deg, #ccc, #999)' 
                  : 'linear-gradient(45deg, #c82333, #bd2130)'
              }
            }}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading ? t('freezeModal.freezing') : hasUsedFreeze 
              ? (t('freezeModal.alreadyUsed') || 'تم الاستخدام من قبل') 
              : t('freezeModal.freezeAccount')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AccountFreezeModal;
