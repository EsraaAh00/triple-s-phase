import apiService from './api.service';

class DashboardService {
  // إحصائيات لوحة تحكم الطالب
  async getStudentStats() {
    try {
      const response = await apiService.get('/api/courses/student/dashboard/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching student stats:', error);
      return {
        enrolledCourses: 0,
        completedLessons: 0,
        pendingAssignments: 0,
        averageGrade: 0,
        totalPoints: 0,
        learningStreak: 0,
        certificates: 0,
        recentActivity: []
      };
    }
  }

  // إحصائيات لوحة تحكم المعلم
  async getTeacherStats() {
    try {
      const response = await apiService.get('/api/courses/teacher/dashboard/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher stats:', error);
      return {
        totalCourses: 0,
        totalStudents: 0,
        totalRevenue: 0,
        averageRating: 0,
        pendingAssignments: 0,
        upcomingMeetings: 0,
        recentEnrollments: 0,
        courseProgress: []
      };
    }
  }

  // المقررات النشطة للطالب
  async getStudentCourses() {
    try {
      const response = await apiService.get('/api/courses/student/courses/');
      return response.data;
    } catch (error) {
      console.error('Error fetching student courses:', error);
      return [];
    }
  }

  // المقررات النشطة للمعلم
  async getTeacherCourses() {
    try {
      const response = await apiService.get('/api/courses/teacher/courses/');
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher courses:', error);
      return [];
    }
  }

  // النشاطات الأخيرة للطالب
  async getRecentActivity() {
    try {
      const response = await apiService.get('/api/courses/student/recent-activity/');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  // النشاطات الأخيرة للمعلم
  async getTeacherRecentActivity() {
    try {
      const response = await apiService.get('/api/courses/teacher/recent-activity/');
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher recent activity:', error);
      return [];
    }
  }

  // الواجبات القادمة للطالب
  async getUpcomingAssignments() {
    try {
      const response = await apiService.get('/api/courses/student/upcoming-assignments/');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming assignments:', error);
      return [];
    }
  }

  // المحاضرات القادمة للطالب
  async getUpcomingMeetings() {
    try {
      const response = await apiService.get('/api/courses/student/upcoming-meetings/');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming meetings:', error);
      return [];
    }
  }

  // تقدم الطلاب (للمعلم)
  async getStudentProgress() {
    try {
      const response = await apiService.get('/api/courses/teacher/student-progress/');
      return response.data;
    } catch (error) {
      console.error('Error fetching student progress:', error);
      return [];
    }
  }

  // الإنجازات للطالب
  async getAchievements() {
    try {
      const response = await apiService.get('/api/courses/student/achievements/');
      return response.data;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  // الإعلانات الأخيرة
  async getRecentAnnouncements() {
    try {
      const response = await apiService.get('/api/courses/teacher/announcements/');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent announcements:', error);
      return [];
    }
  }

  // إحصائيات بنك الأسئلة
  async getQuestionBankStats() {
    try {
      const response = await apiService.get('/api/assessment/questions/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching question bank stats:', error);
      return {
        total_questions: 0,
        questions_by_type: {},
        questions_by_difficulty: {},
        most_used_questions: []
      };
    }
  }
}

export default new DashboardService();
