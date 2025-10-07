from django.contrib import admin
from django.contrib.admin import AdminSite
from django.utils.translation import gettext_lazy as _
from django.urls import path
from django.http import HttpResponse, HttpResponseRedirect
from django.template.response import TemplateResponse
from django.db.models import Count, Sum
from django.utils.html import format_html
import json
from django.utils import timezone
from django.contrib.auth.decorators import user_passes_test
from django.contrib.admin.views.decorators import staff_member_required
from .admin_views import user_permissions, group_permissions

# CKEditor 5 configuration for admin
from django_ckeditor_5.widgets import CKEditor5Widget
from django import forms

class LMSAdminSite(AdminSite):
    # Site headers
    site_header = "نظام إدارة التعلم - LMS"
    site_title = "LMS Admin"
    index_title = "لوحة التحكم الرئيسية"
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'user-permissions/',
                self.admin_view(user_permissions),
                name='user-permissions',
            ),
            path(
                'group-permissions/',
                self.admin_view(group_permissions),
                name='group-permissions',
            ),
        ]
        return custom_urls + urls
    
    def index(self, request, extra_context=None):
        """
        Display the main admin index page with custom dashboard
        """
        extra_context = extra_context or {}
        
        # Import models here to avoid circular imports
        from users.models import Profile, Instructor, Student
        from courses.models import Course, Enrollment
        # from assignments.models import Quiz, Exam, Assignment  # Module deleted
        from meetings.models import Meeting
        # from certificates.models import Certificate  # Module deleted
        from articles.models import Article
        from notifications.models import Notification
        from django.contrib.auth.models import User
        
        # Statistics for dashboard
        stats = {
            'total_users': User.objects.count(),
            'total_students': Profile.objects.filter(status='Student').count(),
            'total_instructors': Profile.objects.filter(status='Instructor').count(),
            'total_courses': Course.objects.count(),
            'published_courses': Course.objects.filter(status='published').count(),
            'pending_courses': Course.objects.filter(status='pending').count(),
            'total_enrollments': Enrollment.objects.count(),
            'total_assignments': Assignment.objects.count(),
            'total_exams': Exam.objects.count(),
            'total_meetings': Meeting.objects.count(),
            'total_certificates': Certificate.objects.count(),
            'total_articles': Article.objects.count(),
            'unread_notifications': Notification.objects.filter(is_read=False).count(),
        }
        
        # Recent activities
        recent_courses = Course.objects.order_by('-created_at')[:5]
        recent_users = User.objects.order_by('-date_joined')[:5]
        recent_enrollments = Enrollment.objects.select_related('course', 'student').order_by('-enrollment_date')[:5]
        recent_meetings = Meeting.objects.order_by('-created_at')[:5]
        recent_certificates = Certificate.objects.order_by('-date_issued')[:5]
        
        extra_context.update({
            'stats': stats,
            'recent_courses': recent_courses,
            'recent_users': recent_users,
            'recent_enrollments': recent_enrollments,
            'recent_meetings': recent_meetings,
            'recent_certificates': recent_certificates,
            'title': 'لوحة التحكم',
        })
        
        return super().index(request, extra_context)
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('dashboard-stats/', self.admin_view(self.dashboard_stats), name='dashboard_stats'),
        ]
        return custom_urls + urls
    
    def dashboard_stats(self, request):
        """API endpoint for dashboard statistics"""
        from users.models import Profile
        from courses.models import Course, Enrollment
        # from assignments.models import Quiz, Exam, Assignment  # Module deleted
        from meetings.models import Meeting
        # from certificates.models import Certificate  # Module deleted
        from articles.models import Article
        from notifications.models import Notification
        from django.contrib.auth.models import User
        
        stats = {
            'users': {
                'total': User.objects.count(),
                'students': Profile.objects.filter(status='Student').count(),
                'instructors': Profile.objects.filter(status='Instructor').count(),
                'admins': Profile.objects.filter(status='Admin').count(),
            },
            'courses': {
                'total': Course.objects.count(),
                'published': Course.objects.filter(status='published').count(),
                'pending': Course.objects.filter(status='pending').count(),
                'draft': Course.objects.filter(status='draft').count(),
            },
            'enrollments': {
                'total': Enrollment.objects.count(),
                'active': Enrollment.objects.filter(status='active').count(),
                'completed': Enrollment.objects.filter(status='completed').count(),
            },
            'assignments': {
                'total': Assignment.objects.count(),
                'pending': Assignment.objects.filter(due_date__gt=timezone.now()).count() if 'timezone' in globals() else 0,
            },
            'meetings': {
                'total': Meeting.objects.count(),
                'upcoming': Meeting.objects.filter(start_time__gt=timezone.now()).count() if 'timezone' in globals() else 0,
            },
            'certificates': {
                'total': Certificate.objects.count(),
                'active': Certificate.objects.filter(status='active').count(),
            },
            'articles': {
                'total': Article.objects.count(),
                'published': Article.objects.filter(is_published=True).count(),
            },
            'notifications': {
                'total': Notification.objects.count(),
                'unread': Notification.objects.filter(is_read=False).count(),
            }
        }
        
        return HttpResponse(json.dumps(stats), content_type='application/json')

# Create custom admin site instance
admin_site = LMSAdminSite(name='lms_admin')

# Make it the default admin site
admin.site = admin_site
admin.sites.site = admin_site 