from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import dashboard_views

# Create router
router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'tags', views.TagsViewSet, basename='tag')
router.register(r'courses', views.CourseViewSet, basename='course')

app_name = 'courses_api'

urlpatterns = [
    # Public courses (no authentication required)
    path('public/', views.public_courses, name='public_courses'),
    
    # Student enrolled courses
    path('my-enrolled-courses/', views.my_enrolled_courses, name='my_enrolled_courses'),
    
    # Course tracking data
    path('course-tracking/<int:course_id>/', views.course_tracking_data, name='course_tracking_data'),
    
    # Search and filtering
    path('search/', views.course_search, name='course_search'),
    path('featured/', views.featured_courses, name='featured_courses'),
    path('popular/', views.popular_courses, name='popular_courses'),
    path('recent/', views.recent_courses, name='recent_courses'),
    
    # Statistics and dashboard
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    path('general/stats/', views.general_stats, name='general_stats'),
    
    # Teacher Dashboard APIs
    path('teacher/dashboard/stats/', dashboard_views.teacher_dashboard_stats, name='teacher_dashboard_stats'),
    path('teacher/courses/', dashboard_views.teacher_courses, name='teacher_courses'),
    path('teacher/student-progress/', dashboard_views.teacher_student_progress, name='teacher_student_progress'),
    path('teacher/recent-activity/', dashboard_views.teacher_recent_activity, name='teacher_recent_activity'),
    path('teacher/announcements/', dashboard_views.teacher_announcements, name='teacher_announcements'),
    
    # Student Dashboard APIs
    path('student/dashboard/stats/', dashboard_views.student_dashboard_stats, name='student_dashboard_stats'),
    path('student/courses/', dashboard_views.student_courses, name='student_courses'),
    path('student/achievements/', dashboard_views.student_achievements, name='student_achievements'),
    path('student/recent-activity/', dashboard_views.student_recent_activity, name='student_recent_activity'),
    path('student/upcoming-assignments/', dashboard_views.student_upcoming_assignments, name='student_upcoming_assignments'),
    path('student/upcoming-meetings/', dashboard_views.student_upcoming_meetings, name='student_upcoming_meetings'),
    
    # Include router URLs
    path('', include(router.urls)),
]
