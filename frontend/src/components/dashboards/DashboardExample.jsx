import React from 'react';
import { Grid, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { 
  DashboardCard, 
  StatCard, 
  DashboardSection, 
  ProgressCard, 
  ActivityItem,
  AnnouncementCard,
  UserProfileCard 
} from './DashboardLayout';
import profileImage from '../../assets/images/profile.jpg';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  VideoCall as VideoCallIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Book as BookIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

const DashboardExample = () => {
  const { t } = useTranslation();
  // Sample data
  const stats = [
    {
      title: t('dashboardTotalCourses'),
      value: '12',
      icon: <SchoolIcon />,
      color: 'primary',
      trend: 'up',
      trendValue: 15,
      trendLabel: t('dashboardFromLastMonth')
    },
    {
      title: t('dashboardCompletedAssignments'),
      value: '8',
      icon: <AssignmentIcon />,
      color: 'success',
      trend: 'up',
      trendValue: 25,
      trendLabel: t('dashboardFromLastMonth')
    },
    {
      title: t('dashboardTakenExams'),
      value: '5',
      icon: <AssessmentIcon />,
      color: 'warning',
      trend: 'up',
      trendValue: 10,
      trendLabel: t('dashboardFromLastMonth')
    },
    {
      title: 'المحاضرات الحضورية',
      value: '15',
      icon: <VideoCallIcon />,
      color: 'info',
      trend: 'down',
      trendValue: 5,
      trendLabel: t('dashboardFromLastMonth')
    }
  ];

  const progressData = [
    {
      title: 'تقدم الكورس الحالي',
      value: 75,
      color: 'primary',
      icon: <BookIcon />
    },
    {
      title: 'معدل الحضور',
      value: 90,
      color: 'success',
      icon: <ScheduleIcon />
    },
    {
      title: 'معدل الأداء',
      value: 85,
      color: 'warning',
      icon: <TrendingUpIcon />
    }
  ];

  const activities = [
    {
      icon: <AssignmentIcon />,
      title: 'تم تسليم واجب جديد',
      description: 'تم تسليم واجب مادة الرياضيات بنجاح',
      time: 'منذ ساعتين',
      color: 'success',
      unread: true
    },
    {
      icon: <AssessmentIcon />,
      title: 'امتحان جديد متاح',
      description: 'امتحان منتصف الفصل في مادة الفيزياء',
      time: 'منذ 4 ساعات',
      color: 'warning',
      unread: true
    },
    {
      icon: <VideoCallIcon />,
      title: 'محاضرة جديدة',
      description: 'محاضرة في مادة الكيمياء العضوية',
      time: 'منذ يوم',
      color: 'info',
      unread: false
    },
    {
      icon: <SchoolIcon />,
      title: 'كورس جديد متاح',
      description: 'تم إضافة كورس جديد في مادة الأحياء',
      time: 'منذ يومين',
      color: 'primary',
      unread: false
    }
  ];

  const announcements = [
    {
      title: 'إعلان مهم',
      description: 'سيتم إغلاق المنصة للصيانة يوم الجمعة من الساعة 2 صباحاً حتى 6 صباحاً',
      time: 'منذ ساعة',
      author: 'إدارة المنصة',
      avatar: profileImage,
      attachments: [
        { name: 'جدول الصيانة.pdf', url: '#' }
      ]
    },
    {
      title: 'تحديث جديد',
      description: 'تم إضافة ميزات جديدة للمنصة تشمل تحسينات في واجهة المستخدم',
      time: 'منذ يوم',
      author: 'فريق التطوير',
      avatar: profileImage
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* User Profile Section */}
      <DashboardSection title="الملف الشخصي" subtitle="معلومات المستخدم الأساسية">
        <Grid item xs={12} md={6}>
          <UserProfileCard />
        </Grid>
      </DashboardSection>

      {/* Statistics Section */}
      <DashboardSection title="الإحصائيات" subtitle="نظرة عامة على النشاط">
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </DashboardSection>

      {/* Progress Section */}
      <DashboardSection title="التقدم" subtitle="معدلات التقدم في الكورسات">
        {progressData.map((progress, index) => (
          <Grid item xs={12} md={4} key={index}>
            <ProgressCard {...progress} />
          </Grid>
        ))}
      </DashboardSection>

      {/* Recent Activities and Announcements */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <DashboardSection title="النشاطات الأخيرة" subtitle="آخر التحديثات والأنشطة">
            <Grid item xs={12}>
              <DashboardCard>
                <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                  {activities.map((activity, index) => (
                    <ActivityItem key={index} {...activity} />
                  ))}
                </Box>
              </DashboardCard>
            </Grid>
          </DashboardSection>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <DashboardSection title="الإعلانات" subtitle="آخر الإعلانات المهمة">
            <Grid item xs={12}>
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {announcements.map((announcement, index) => (
                  <AnnouncementCard key={index} announcement={announcement} />
                ))}
              </Box>
            </Grid>
          </DashboardSection>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardExample;
