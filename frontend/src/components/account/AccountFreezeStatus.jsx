import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Lock as LockIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import accountFreezeService from '../../services/accountFreeze.service';

const AccountFreezeStatus = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [freezeData, setFreezeData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFreezeStatus();
  }, []);

  const loadFreezeStatus = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await accountFreezeService.getFreezeStatus();
      if (response.success) {
        setFreezeData(response.data);
      } else {
        setError(response.error || 'فشل في تحميل حالة التجميد');
      }
    } catch (error) {
      console.error('Error loading freeze status:', error);
      
      // معالجة أخطاء المصادقة
      if (error.message && error.message.includes('انتهت صلاحية الجلسة')) {
        setError('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى');
      } else if (error.message && error.message.includes('يجب تسجيل الدخول')) {
        setError('يجب تسجيل الدخول أولاً للوصول إلى هذه الميزة');
      } else {
        setError('حدث خطأ أثناء تحميل حالة التجميد');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (isFrozen, frozenByAdmin) => {
    if (!isFrozen) return 'success';
    if (frozenByAdmin) return 'error';
    return 'warning';
  };

  const getStatusText = (isFrozen, frozenByAdmin) => {
    if (!isFrozen) return 'نشط';
    if (frozenByAdmin) return 'مجمد (إدارة)';
    return 'مجمد (طالب)';
  };

  const getStatusIcon = (isFrozen, frozenByAdmin) => {
    if (!isFrozen) return <CheckCircleIcon />;
    if (frozenByAdmin) return <LockIcon />;
    return <ScheduleIcon />;
  };

  const getProgressValue = () => {
    if (!freezeData || !freezeData.freeze_start_date || !freezeData.freeze_end_date) {
      return 0;
    }

    const startDate = new Date(freezeData.freeze_start_date);
    const endDate = new Date(freezeData.freeze_end_date);
    const now = new Date();

    if (now <= startDate) return 0;
    if (now >= endDate) return 100;

    const totalDuration = endDate - startDate;
    const elapsed = now - startDate;
    return (elapsed / totalDuration) * 100;
  };

  if (loading) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2, color: '#666' }}>
            جاري تحميل حالة التجميد...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Alert severity="error">
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!freezeData) {
    return null;
  }

  const isCurrentlyFrozen = freezeData.is_currently_frozen;
  const progressValue = getProgressValue();

  return (
    <Card sx={{ 
      borderRadius: 3, 
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      border: isCurrentlyFrozen ? '2px solid #ff9800' : '2px solid #4caf50'
    }}>
      <CardContent>
        {/* حالة التجميد */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 1.5, 
            borderRadius: 2,
            bgcolor: isCurrentlyFrozen ? '#fff3e0' : '#e8f5e8',
            mr: 2
          }}>
            {getStatusIcon(isCurrentlyFrozen, freezeData.frozen_by_admin)}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>
              حالة الحساب
            </Typography>
            <Chip
              label={getStatusText(isCurrentlyFrozen, freezeData.frozen_by_admin)}
              color={getStatusColor(isCurrentlyFrozen, freezeData.frozen_by_admin)}
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>

        {isCurrentlyFrozen && (
          <>
            {/* تفاصيل التجميد */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                تفاصيل التجميد
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                  سبب التجميد:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {freezeData.freeze_reason || 'غير محدد'}
                </Typography>
              </Box>

              {freezeData.freeze_start_date && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                    تاريخ بداية التجميد:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatDate(freezeData.freeze_start_date)}
                  </Typography>
                </Box>
              )}

              {freezeData.freeze_end_date && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                    تاريخ انتهاء التجميد:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatDate(freezeData.freeze_end_date)}
                  </Typography>
                </Box>
              )}

              {freezeData.remaining_days !== null && freezeData.remaining_days > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                    الأيام المتبقية: {freezeData.remaining_days} يوم
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={progressValue}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: freezeData.remaining_days <= 7 ? '#f44336' : '#ff9800'
                      }
                    }}
                  />
                </Box>
              )}

              {freezeData.frozen_by_admin && freezeData.admin_notes && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                    ملاحظات الإدارة:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {freezeData.admin_notes}
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* تحذيرات */}
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                ملاحظة مهمة:
              </Typography>
              <Typography variant="body2">
                {freezeData.frozen_by_admin 
                  ? 'تم تجميد حسابك من قبل الإدارة. يرجى التواصل مع الدعم الفني لإلغاء التجميد.'
                  : 'حسابك مجمد حالياً. سيتم إلغاء التجميد تلقائياً عند انتهاء المدة المحددة.'
                }
              </Typography>
            </Alert>
          </>
        )}

        {!isCurrentlyFrozen && (
          <>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: '#4caf50', mb: 1 }} />
              <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 600 }}>
                حسابك نشط
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                يمكنك استخدام جميع ميزات المنصة
              </Typography>
            </Box>

            {/* معلومات استخدام التجميد */}
            {freezeData.has_used_freeze && (
              <>
                <Divider sx={{ my: 2 }} />
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    ملاحظة:
                  </Typography>
                  <Typography variant="body2">
                    لقد استخدمت ميزة التجميد من قبل. يمكنك استخدامها مرة واحدة فقط.
                  </Typography>
                </Alert>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountFreezeStatus;
