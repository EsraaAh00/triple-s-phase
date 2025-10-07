import { Box, Paper, Typography, Grid, useTheme, useMediaQuery, alpha, keyframes, Avatar, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DescriptionIcon from '@mui/icons-material/Description';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';
import profileImage from '../../assets/images/profile.jpg';

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(103, 58, 183, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(103, 58, 183, 0); }
  100% { box-shadow: 0 0 0 0 rgba(103, 58, 183, 0); }
`;

// Styled Components
const DashboardCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  borderRadius: 16,
  background: theme.palette.mode === 'dark' 
    ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.default, 0.9)})`
    : `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
  boxShadow: theme.shadows[5],
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[10],
    '&::before': {
      opacity: 0.1,
      transform: 'scale(1.5)'
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${theme.palette.primary.main} 0%, transparent 70%)`,
    opacity: 0.05,
    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 0
  }
}));

// User Profile Card Component
const UserProfileCard = () => {
  const theme = useTheme();
  const { user, getUserRole } = useAuth();

  // Get user data with fallbacks
  const getUserData = () => {
    if (user) {
      return {
        name: user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : user.username || t('commonUser'),
        email: user.email || '',
        avatar: user.profile_picture || profileImage,
        role: getUserRole() === 'instructor' ? t('commonTeacher') : t('commonStudent'),
        description: user.bio || (getUserRole() === 'instructor' ? t('commonTeacherOnPlatform') : t('commonStudentOnPlatform')),
        joinDate: user.date_joined ? new Date(user.date_joined).toLocaleDateString('en-GB') : t('commonNotSpecified')
      };
    }
    return {
      name: t('commonUser'),
      email: '',
      avatar: profileImage,
      role: t('commonStudent'),
      description: t('commonStudentOnPlatform'),
      joinDate: t('commonNotSpecified')
    };
  };

  const userData = getUserData();

  return (
    <DashboardCard sx={{ 
      background: theme.palette.mode === 'dark'
        ? `linear-gradient(145deg, ${alpha(theme.palette.primary.dark, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`
        : `linear-gradient(145deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
      '&::before': {
        background: `radial-gradient(circle, ${theme.palette.primary.main} 0%, transparent 70%)`,
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Avatar 
          src={userData.avatar}
          alt={userData.name}
          sx={{ 
            width: 80, 
            height: 80,
            border: `3px solid ${theme.palette.primary.main}`,
            boxShadow: `0 4px 20px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
            animation: `${pulse} 2s infinite`
          }}
        />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
            {userData.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {userData.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={userData.role}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Chip 
              label={`انضم في ${userData.joinDate}`}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
          </Box>
        </Box>
      </Box>
    </DashboardCard>
  );
};

const StatCard = ({ title, value, icon, color = 'primary', trend, trendValue, trendLabel }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <DashboardCard 
      sx={{
        '&::before': {
          background: `radial-gradient(circle, ${theme.palette[color].main} 0%, transparent 70%)`,
        },
        '&:hover': {
          '& .stat-icon': {
            animation: `${float} 3s ease-in-out infinite`
          }
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          mb: 2 
        }}>
          <Box>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 500,
                mb: 0.5
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                background: theme.palette.mode === 'dark'
                  ? `linear-gradient(45deg, ${theme.palette[color].light}, ${theme.palette[color].main})`
                  : `linear-gradient(45deg, ${theme.palette[color].dark}, ${theme.palette[color].main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}
            >
              {value}
            </Typography>
            {trend && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                mt: 1
              }}>
                <Box 
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    px: 1,
                    py: 0.3,
                    borderRadius: 1,
                    bgcolor: trend === 'up' ? `${theme.palette.success.light}30` : `${theme.palette.error.light}30`,
                    color: trend === 'up' ? 'success.main' : 'error.main',
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }}
                >
                  {trend === 'up' ? '↑' : '↓'} {trendValue}%
                  <Typography variant="caption" sx={{ ml: 0.5, color: 'inherit' }}>
                    {trendLabel}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
          <Box 
            className="stat-icon"
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.15)} 0%, ${alpha(theme.palette[color].dark, 0.1)} 100%)`
                : `linear-gradient(135deg, ${alpha(theme.palette[color].light, 0.3)} 0%, ${alpha(theme.palette[color].main, 0.1)} 100%)`,
              color: theme.palette[color].main,
              boxShadow: `0 4px 20px 0 ${alpha(theme.palette[color].main, 0.15)}`,
              transition: 'all 0.3s ease',
              '& svg': {
                fontSize: '1.8rem'
              }
            }}
          >
            {icon}
          </Box>
        </Box>
      </Box>
    </DashboardCard>
  );
};

const DashboardSection = ({ title, subtitle, children, action, ...props }) => (
  <Box sx={{ mb: 5 }} {...props}>
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      mb: 3,
      '&::after': {
        content: '""',
        flex: 1,
        height: '1px',
        backgroundColor: 'divider',
        marginRight: 3,
        marginLeft: 3
      }
    }}>
      <Box>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700,
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(45deg, #fff, #b3b3b3)'
              : 'linear-gradient(45deg, #333, #666)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
            mb: 0.5
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && (
        <Box>
          {action}
        </Box>
      )}
    </Box>
    <Grid container spacing={3}>
      {children}
    </Grid>
  </Box>
);

// New Components for Enhanced UI
const ProgressCard = ({ title, value, color = 'primary', icon, max = 100, height = 8 }) => {
  const theme = useTheme();
  
  return (
    <DashboardCard>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="subtitle2" fontWeight={600}>
            {value}%
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Box 
              sx={{
                height,
                borderRadius: height / 2,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.grey[700], 0.5) 
                  : alpha(theme.palette.grey[300], 0.8),
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${value}%`,
                  background: theme.palette.mode === 'dark'
                    ? `linear-gradient(90deg, ${theme.palette[color].dark}, ${theme.palette[color].light})`
                    : `linear-gradient(90deg, ${theme.palette[color].light}, ${theme.palette[color].main})`,
                  borderRadius: height / 2,
                  transition: 'width 0.6s ease, background 0.3s ease',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
                    backgroundSize: '200% 100%',
                    animation: '${shimmer} 2s infinite',
                    borderRadius: height / 2,
                  }
                }}
              />
            </Box>
          </Box>
          {icon && (
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: theme.palette.mode === 'dark'
                  ? alpha(theme.palette[color].main, 0.2)
                  : alpha(theme.palette[color].light, 0.3),
                color: theme.palette[color].main,
                '& svg': {
                  fontSize: '1.2rem'
                }
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </Box>
    </DashboardCard>
  );
};

const ActivityItem = ({ icon, title, description, time, color = 'primary', unread = false }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        p: 2,
        borderRadius: 2,
        mb: 1,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          backgroundColor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.7)
            : alpha(theme.palette.grey[100], 0.7),
          transform: 'translateX(5px)',
          '&::before': {
            opacity: 1,
            width: '4px'
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: unread ? '4px' : '0',
          background: theme.palette[color].main,
          opacity: unread ? 1 : 0,
          transition: 'all 0.3s ease',
          borderTopLeftRadius: '4px',
          borderBottomLeftRadius: '4px'
        }
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.palette.mode === 'dark'
            ? alpha(theme.palette[color].main, 0.15)
            : alpha(theme.palette[color].light, 0.3),
          color: theme.palette[color].main,
          marginLeft: 2,
          flexShrink: 0,
          '& svg': {
            fontSize: '1.2rem'
          }
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', marginRight: 1 }}>
            {time}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ 
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {description}
        </Typography>
      </Box>
    </Box>
  );
};

// Announcement Card Component
const AnnouncementCard = ({ announcement }) => {
  const theme = useTheme();
  
  return (
    <DashboardCard sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar 
          src={announcement.avatar} 
          alt={announcement.author}
          sx={{ 
            width: 40, 
            height: 40,
            bgcolor: theme.palette.primary.main,
            '& .MuiSvgIcon-root': {
              fontSize: '1.2rem'
            }
          }}
        >
          {announcement.author?.[0]?.toUpperCase() || 'A'}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {announcement.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {announcement.time}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {announcement.description}
          </Typography>
          {announcement.attachments && announcement.attachments.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {announcement.attachments.map((attachment, index) => (
                <Chip 
                  key={index}
                  icon={<DescriptionIcon fontSize="small" />}
                  label={attachment.name}
                  size="small"
                  variant="outlined"
                  onClick={() => window.open(attachment.url, '_blank')}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </DashboardCard>
  );
};

export { 
  DashboardCard, 
  StatCard, 
  DashboardSection, 
  ProgressCard, 
  ActivityItem,
  AnnouncementCard,
  UserProfileCard,
  pulse 
};
