import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  LinearProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Check as CheckIcon,
  AccessTime as TimeIcon,
  EventAvailable as EventAvailableIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTranslation } from 'react-i18next';
import scheduleService from '../../services/schedule.service';
import { courseAPI } from '../../services/courseService';

// Color palette for different modules/lessons
const COLORS = [
  { bg: '#E8F5E9', text: '#2E7D32' }, // Light green
  { bg: '#F3E5F5', text: '#7B1FA2' }, // Light purple
  { bg: '#FFF3E0', text: '#E65100' }, // Light orange
  { bg: '#E3F2FD', text: '#1565C0' }, // Light blue
  { bg: '#FCE4EC', text: '#C2185B' }, // Light pink
  { bg: '#E0F2F1', text: '#00695C' }, // Light teal
];

const StudySchedule = () => {
  const { t, i18n } = useTranslation();
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const courseIdFromParams = searchParams.get('courseId') || courseId;
  
  const [loading, setLoading] = useState(true);
  const [rebalancing, setRebalancing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week', 'day', or 'full'
  const [schedule, setSchedule] = useState(null);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [allScheduleItems, setAllScheduleItems] = useState([]); // Full schedule items
  const [selectedDay, setSelectedDay] = useState(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Configuration state
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [dailyHours, setDailyHours] = useState(4);
  const [daysOff, setDaysOff] = useState([]);
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayNamesAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  
  // Get current week dates
  const getWeekDates = (date) => {
    const week = [];
    const currentDate = new Date(date);
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day; // Adjust to start from Sunday
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      week.push(currentDay);
    }
    return week;
  };
  
  const weekDates = getWeekDates(currentDate);
  
  // Load schedule
  const loadSchedule = useCallback(async () => {
    if (!courseIdFromParams) return;
    
    try {
      setLoading(true);
      const response = await scheduleService.getSchedule(parseInt(courseIdFromParams));
      
      if (response.success && response.data) {
        setSchedule(response.data);
        
        // Load ALL schedule items for full schedule view
        const allItemsResponse = await scheduleService.getScheduleItems(
          response.data.id,
          response.data.start_date,
          response.data.end_date
        );
        
        if (allItemsResponse.success) {
          setAllScheduleItems(allItemsResponse.data);
        }
        
        // Load schedule items for the current week
        const currentWeekDates = getWeekDates(currentDate);
        const weekStart = currentWeekDates[0];
        const weekEnd = currentWeekDates[6];
        
        const itemsResponse = await scheduleService.getScheduleItems(
          response.data.id,
          formatDate(weekStart),
          formatDate(weekEnd)
        );
        
        if (itemsResponse.success) {
          setScheduleItems(itemsResponse.data);
        }
        
        // Set configuration from schedule
        if (response.data.start_date) setStartDate(new Date(response.data.start_date));
        if (response.data.end_date) setEndDate(new Date(response.data.end_date));
        if (response.data.daily_hours) setDailyHours(response.data.daily_hours);
        if (response.data.days_off) setDaysOff(response.data.days_off);
      } else {
        // No schedule exists, show configuration dialog
        setConfigOpen(true);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
      setSnackbar({
        open: true,
        message: t('schedule.errorLoading') || 'Error loading schedule',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [courseIdFromParams, currentDate, t]);
  
  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);
  
  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Handle create/update schedule
  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      const scheduleData = {
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        daily_hours: dailyHours,
        days_off: daysOff
      };
      
      const response = await scheduleService.createSchedule(parseInt(courseIdFromParams), scheduleData);
      
      if (response.success) {
        setSchedule(response.data);
        setConfigOpen(false);
        
        // Auto-rebalance after creating schedule
        if (response.data.id) {
          await handleRebalance(response.data.id);
        }
        
        setSnackbar({
          open: true,
          message: t('schedule.scheduleCreated') || 'Schedule created successfully',
          severity: 'success'
        });
      } else {
        const errorMsg = response.error || response.errors || t('schedule.errorCreating') || 'Error creating schedule';
        setSnackbar({
          open: true,
          message: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg),
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      setSnackbar({
        open: true,
        message: error.message || t('schedule.errorCreating') || 'Error creating schedule',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle rebalance
  const handleRebalance = async (scheduleId = null) => {
    const id = scheduleId || schedule?.id;
    if (!id) return;
    
    try {
      setRebalancing(true);
      const response = await scheduleService.rebalanceSchedule(id);
      
      if (response.success) {
        setSchedule(response.data);
        
        // Load ALL schedule items for full schedule view
        const allItemsResponse = await scheduleService.getScheduleItems(
          id,
          response.data.start_date,
          response.data.end_date
        );
        
        if (allItemsResponse.success) {
          setAllScheduleItems(allItemsResponse.data);
        }
        
        // Reload schedule items for current week
        const currentWeekDates = getWeekDates(currentDate);
        const weekStart = currentWeekDates[0];
        const weekEnd = currentWeekDates[6];
        
        const itemsResponse = await scheduleService.getScheduleItems(
          id,
          formatDate(weekStart),
          formatDate(weekEnd)
        );
        
        if (itemsResponse.success) {
          setScheduleItems(itemsResponse.data);
        }
        
        setSnackbar({
          open: true,
          message: t('schedule.scheduleRebalanced') || 'Schedule rebalanced successfully',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.error || t('schedule.errorRebalancing') || 'Error rebalancing schedule',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error rebalancing schedule:', error);
      setSnackbar({
        open: true,
        message: t('schedule.errorRebalancing') || 'Error rebalancing schedule',
        severity: 'error'
      });
    } finally {
      setRebalancing(false);
    }
  };
  
  // Toggle item completion
  const handleToggleCompletion = async (itemId) => {
    try {
      const response = await scheduleService.toggleItemCompletion(itemId);
      
      if (response.success) {
        // Update local state for scheduleItems
        setScheduleItems(items => 
          items.map(item => 
            item.id === itemId 
              ? { ...item, is_completed: !item.is_completed }
              : item
          )
        );
        
        // Update local state for allScheduleItems
        setAllScheduleItems(items => 
          items.map(item => 
            item.id === itemId 
              ? { ...item, is_completed: !item.is_completed }
              : item
          )
        );
        
        // Update schedule stats
        if (schedule) {
          const allItems = viewMode === 'full' || viewMode === 'day' ? allScheduleItems : scheduleItems;
          const completedCount = allItems.filter(i => i.is_completed).length + (allItems.find(i => i.id === itemId)?.is_completed ? 0 : 1);
          setSchedule({
            ...schedule,
            completed_items: completedCount
          });
        }
      }
    } catch (error) {
      console.error('Error toggling completion:', error);
    }
  };
  
  // Navigate to previous/next week
  const handleWeekNavigation = async (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'prev' ? -7 : 7));
    setCurrentDate(newDate);
    
    // Reload schedule items for new week
    if (schedule) {
      const newWeekDates = getWeekDates(newDate);
      const weekStart = newWeekDates[0];
      const weekEnd = newWeekDates[6];
      
      const itemsResponse = await scheduleService.getScheduleItems(
        schedule.id,
        formatDate(weekStart),
        formatDate(weekEnd)
      );
      
      if (itemsResponse.success) {
        setScheduleItems(itemsResponse.data);
      }
    }
  };
  
  // Go to today
  const handleToday = async () => {
    setCurrentDate(new Date());
    
    if (schedule) {
      const newWeekDates = getWeekDates(new Date());
      const weekStart = newWeekDates[0];
      const weekEnd = newWeekDates[6];
      
      const itemsResponse = await scheduleService.getScheduleItems(
        schedule.id,
        formatDate(weekStart),
        formatDate(weekEnd)
      );
      
      if (itemsResponse.success) {
        setScheduleItems(itemsResponse.data);
      }
    }
  };
  
  // Get items for a specific date
  const getItemsForDate = (date) => {
    const dateStr = formatDate(date);
    // Use allScheduleItems if in full or day view, otherwise use scheduleItems
    const itemsToSearch = viewMode === 'full' || viewMode === 'day' ? allScheduleItems : scheduleItems;
    return itemsToSearch.filter(item => item.date === dateStr);
  };
  
  // Format duration
  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };
  
  // Get color for item
  const getItemColor = (index) => {
    return COLORS[index % COLORS.length];
  };
  
  // Calculate progress
  const progress = schedule 
    ? Math.round((schedule.completed_items / schedule.total_items) * 100) 
    : 0;
  
  if (loading && !schedule) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          {/* Date Navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => handleWeekNavigation('prev')}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h6" sx={{ minWidth: 150, textAlign: 'center' }}>
              {i18n.language === 'ar' 
                ? currentDate.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })
                : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Typography>
            <IconButton onClick={() => handleWeekNavigation('next')}>
              <ChevronRightIcon />
            </IconButton>
            <Button variant="outlined" size="small" onClick={handleToday}>
              {t('schedule.today') || 'Today'}
            </Button>
          </Box>
          
          {/* View Mode and Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={viewMode}
                onChange={(e) => {
                  setViewMode(e.target.value);
                  if (e.target.value === 'day') {
                    // Set current date or first available date with items
                    const itemsToUse = allScheduleItems.length > 0 ? allScheduleItems : scheduleItems;
                    if (itemsToUse.length > 0) {
                      const firstDay = new Date(itemsToUse[0].date);
                      setSelectedDay(firstDay);
                    } else {
                      setSelectedDay(new Date());
                    }
                  }
                }}
              >
                <MenuItem value="week">{t('schedule.week') || 'Week'}</MenuItem>
                <MenuItem value="day">{t('schedule.day') || 'Day'}</MenuItem>
                <MenuItem value="full">{t('schedule.fullSchedule') || 'Full Schedule'}</MenuItem>
              </Select>
            </FormControl>
            
            {schedule && (
              <Button
                variant="contained"
                startIcon={rebalancing ? <CircularProgress size={16} /> : <RefreshIcon />}
                onClick={() => handleRebalance()}
                disabled={rebalancing}
              >
                {t('schedule.rebalance') || 'Rebalance'}
              </Button>
            )}
            
            <IconButton onClick={() => setConfigOpen(true)}>
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>
        
        {/* Progress Bar */}
        {schedule && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {schedule.completed_items} / {schedule.total_items} {t('schedule.assignmentsCompleted') || 'assignments completed'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {progress}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
          </Box>
        )}
        
        {/* Calendar Grid */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            {viewMode === 'week' ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                {weekDates.map((date, index) => {
                  const items = getItemsForDate(date);
                  const dayName = i18n.language === 'ar' ? dayNamesAr[date.getDay()] : dayNames[date.getDay()];
                  const isToday = new Date().toDateString() === date.toDateString();
                  
                  return (
                    <Box
                      key={index}
                      sx={{
                        borderRight: index < 6 ? '1px solid #e0e0e0' : 'none',
                        borderBottom: '1px solid #e0e0e0',
                        minHeight: 420,
                        p: 1.5,
                        bgcolor: isToday ? 'rgba(77,191,179,0.06)' : 'transparent',
                        position: 'relative'
                      }}
                    >
                      {/* Day Header */}
                      <Box sx={{ textAlign: 'center', mb: 1.5 }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.25, py: 0.5, borderRadius: 999, bgcolor: isToday ? 'primary.main' : 'rgba(0,0,0,0.06)', color: isToday ? 'white' : 'text.secondary' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {dayName}
                          </Typography>
                          <Chip size="small" icon={<EventAvailableIcon sx={{ fontSize: 16 }} />} label={items.length} sx={{ height: 22, '& .MuiChip-label': { px: 0.75, fontWeight: 600, fontSize: '0.75rem' }, bgcolor: isToday ? 'rgba(255,255,255,0.2)' : 'white' }} />
                        </Box>
                        <Typography variant="h5" sx={{ mt: 0.75, fontWeight: 800, color: isToday ? 'primary.main' : 'text.primary' }}>
                          {date.getDate()}
                        </Typography>
                      </Box>
                      
                      {/* Schedule Items */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                        {items.map((item, itemIndex) => {
                          const color = getItemColor(itemIndex);
                          return (
                            <Card
                              key={item.id}
                              sx={{
                                bgcolor: item.is_completed ? color.bg : color.bg,
                                opacity: item.is_completed ? 0.6 : 1,
                                borderRadius: 2,
                                p: 1.25,
                                cursor: 'pointer',
                                border: `1px solid ${color.text}20`,
                                transition: 'all 0.2s ease',
                                '&:hover': { boxShadow: `0 6px 18px ${color.text}25`, transform: 'translateY(-2px)' }
                              }}
                              onClick={() => handleToggleCompletion(item.id)}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                <Checkbox
                                  checked={item.is_completed}
                                  size="small"
                                  sx={{ 
                                    color: color.text,
                                    '&.Mui-checked': { color: color.text },
                                    p: 0
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleCompletion(item.id);
                                  }}
                                />
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: item.is_completed ? color.text + '80' : color.text,
                                      fontWeight: item.is_completed ? 400 : 600,
                                      display: 'block',
                                      mb: 0.75,
                                      fontSize: '0.75rem',
                                      lineHeight: 1.3
                                    }}
                                  >
                                    {item.lesson_title || item.module_title || t('schedule.studySession')}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip
                                      size="small"
                                      icon={<TimeIcon sx={{ fontSize: 16 }} />}
                                      label={formatDuration(item.hours)}
                                      sx={{ bgcolor: color.text + '20', color: color.text, height: 22, '& .MuiChip-label': { px: 0.75, fontSize: '0.7rem' } }}
                                    />
                                    {item.start_time && (
                                      <Chip
                                        size="small"
                                        label={item.start_time}
                                        sx={{ bgcolor: color.text + '10', color: color.text, height: 22, '& .MuiChip-label': { px: 0.75, fontSize: '0.7rem' } }}
                                      />
                                    )}
                                  </Box>
                                </Box>
                              </Box>
                            </Card>
                          );
                        })}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ) : viewMode === 'day' ? (
              <Box sx={{ p: 3 }}>
                {!selectedDay ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {t('schedule.selectDay') || 'Select a day to view schedule'}
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {/* Day Selector */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <IconButton onClick={() => {
                        const prevDay = new Date(selectedDay);
                        prevDay.setDate(prevDay.getDate() - 1);
                        setSelectedDay(prevDay);
                      }}>
                        <ChevronLeftIcon />
                      </IconButton>
                      <Typography variant="h6">
                        {i18n.language === 'ar' 
                          ? selectedDay.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                          : selectedDay.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </Typography>
                      <IconButton onClick={() => {
                        const nextDay = new Date(selectedDay);
                        nextDay.setDate(nextDay.getDate() + 1);
                        setSelectedDay(nextDay);
                      }}>
                        <ChevronRightIcon />
                      </IconButton>
                      <Button variant="outlined" size="small" onClick={() => setSelectedDay(new Date())}>
                        {t('schedule.today') || 'Today'}
                      </Button>
                    </Box>
                    
                    {/* Day Schedule Items */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {getItemsForDate(selectedDay).length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                          <Typography variant="body1" color="text.secondary">
                            {t('schedule.noItemsForDay') || 'No schedule items for this day'}
                          </Typography>
                        </Box>
                      ) : (
                        getItemsForDate(selectedDay).sort((a, b) => {
                          const timeA = a.start_time || '00:00';
                          const timeB = b.start_time || '00:00';
                          return timeA.localeCompare(timeB);
                        }).map((item, index) => {
                          const color = getItemColor(index);
                          const timeLabel = `${item.start_time || '09:00'} - ${item.end_time || '10:00'}`;
                          return (
                            <Card
                              key={item.id}
                              sx={{
                                bgcolor: item.is_completed ? color.bg : color.bg,
                                opacity: item.is_completed ? 0.6 : 1,
                                borderRadius: 2,
                                p: 2,
                                cursor: 'pointer',
                                border: `2px solid ${color.text}40`,
                                '&:hover': {
                                  boxShadow: `0 4px 12px ${color.text}30`
                                }
                              }}
                              onClick={() => handleToggleCompletion(item.id)}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                <Checkbox
                                  checked={item.is_completed}
                                  size="medium"
                                  sx={{ 
                                    color: color.text,
                                    '&.Mui-checked': { color: color.text }
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleCompletion(item.id);
                                  }}
                                />
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      color: item.is_completed ? color.text + '80' : color.text,
                                      fontWeight: item.is_completed ? 400 : 700,
                                      mb: 1
                                    }}
                                  >
                                    {item.lesson_title || item.module_title || t('schedule.studySession')}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    <Chip
                                      label={timeLabel}
                                      size="small"
                                      sx={{ bgcolor: color.text + '20', color: color.text }}
                                    />
                                    <Chip
                                      label={formatDuration(item.hours)}
                                      size="small"
                                      sx={{ bgcolor: color.text + '20', color: color.text }}
                                    />
                                    {item.module_title && (
                                      <Chip
                                        label={item.module_title}
                                        size="small"
                                        variant="outlined"
                                        sx={{ borderColor: color.text, color: color.text }}
                                      />
                                    )}
                                  </Box>
                                </Box>
                              </Box>
                            </Card>
                          );
                        })
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            ) : viewMode === 'full' ? (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" fontWeight={700}>
                    {t('schedule.fullSchedule') || 'Full Schedule'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {schedule?.start_date && schedule?.end_date && `${new Date(schedule.start_date).toLocaleDateString()} - ${new Date(schedule.end_date).toLocaleDateString()}`}
                  </Typography>
                </Box>
                
                {/* Group items by date */}
                {(() => {
                  const groupedByDate = {};
                  allScheduleItems.forEach(item => {
                    if (!groupedByDate[item.date]) {
                      groupedByDate[item.date] = [];
                    }
                    groupedByDate[item.date].push(item);
                  });
                  
                  const sortedDates = Object.keys(groupedByDate).sort();
                  
                  return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {sortedDates.map(dateStr => {
                        const date = new Date(dateStr);
                        const items = groupedByDate[dateStr].sort((a, b) => {
                          const timeA = a.start_time || '00:00';
                          const timeB = b.start_time || '00:00';
                          return timeA.localeCompare(timeB);
                        });
                        
                        return (
                          <Box key={dateStr}>
                            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 700 }}>
                              {date.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                              {items.map((item, index) => {
                                const color = getItemColor(index % COLORS.length);
                                return (
                                  <Card
                                    key={item.id}
                                    sx={{
                                      bgcolor: item.is_completed ? color.bg : color.bg,
                                      opacity: item.is_completed ? 0.6 : 1,
                                      borderRadius: 2,
                                      p: 1.5,
                                      cursor: 'pointer',
                                      border: `1px solid ${color.text}30`,
                                      '&:hover': {
                                        boxShadow: `0 4px 12px ${color.text}30`,
                                        transform: 'translateY(-2px)'
                                      },
                                      transition: 'all 0.3s ease'
                                    }}
                                    onClick={() => handleToggleCompletion(item.id)}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                      <Checkbox
                                        checked={item.is_completed}
                                        size="small"
                                        sx={{ 
                                          color: color.text,
                                          '&.Mui-checked': { color: color.text },
                                          p: 0
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleCompletion(item.id);
                                        }}
                                      />
                                      <Box sx={{ flex: 1 }}>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: item.is_completed ? color.text + '80' : color.text,
                                            fontWeight: item.is_completed ? 400 : 600,
                                            mb: 0.5,
                                            fontSize: '0.75rem',
                                            lineHeight: 1.3
                                          }}
                                        >
                                          {item.lesson_title || item.module_title || t('schedule.studySession')}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: color.text + 'CC', fontSize: '0.7rem' }}>
                                          {item.start_time} - {formatDuration(item.hours)}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Card>
                                );
                              })}
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })()}
              </Box>
            ) : null}
          </CardContent>
        </Card>
        
        {/* Configuration Dialog */}
        <Dialog open={configOpen} onClose={() => setConfigOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('schedule.configureSchedule') || 'Configure Study Schedule'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              <DatePicker
                label={t('schedule.startDate') || 'Start Date'}
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              
              <DatePicker
                label={t('schedule.endDate') || 'End Date'}
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              
              <FormControl fullWidth>
                <Typography gutterBottom>{t('schedule.dailyHours') || 'Daily Study Hours'}</Typography>
                <Select value={dailyHours} onChange={(e) => setDailyHours(e.target.value)}>
                  <MenuItem value={4}>4 {t('schedule.hours') || 'hours'}</MenuItem>
                  <MenuItem value={6}>6 {t('schedule.hours') || 'hours'}</MenuItem>
                  <MenuItem value={8}>8 {t('schedule.hours') || 'hours'}</MenuItem>
                </Select>
              </FormControl>
              
              <Box>
                <Typography gutterBottom>{t('schedule.daysOff') || 'Days Off'}</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {(i18n.language === 'ar' ? dayNamesAr : dayNames).map((day, index) => {
                    const dayName = i18n.language === 'ar' ? dayNames[index] : dayNames[index];
                    return (
                      <FormControlLabel
                        key={day}
                        control={
                          <Switch
                            checked={daysOff.includes(dayName)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDaysOff([...daysOff, dayName]);
                              } else {
                                setDaysOff(daysOff.filter(d => d !== dayName));
                              }
                            }}
                          />
                        }
                        label={day}
                      />
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfigOpen(false)}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button onClick={handleSaveConfig} variant="contained">
              {t('common.save') || 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default StudySchedule;
