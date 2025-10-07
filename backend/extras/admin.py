from django.contrib import admin
from django.contrib.admin import AdminSite
from django.contrib.auth.decorators import login_required, user_passes_test
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.shortcuts import render, redirect
from django.urls import reverse
from django.utils import timezone
from django.db.models import Count, Q
from django.contrib.auth import get_user_model
from courses.models import Course, Enrollment
from .models import Banner, CourseCollection
from .views import get_admin_dashboard_data
from core.admin_views import user_permissions, group_permissions
from datetime import timedelta

User = get_user_model()

class CustomAdminSite(AdminSite):
    site_header = 'إدارة منصة التعلم الإلكتروني'
    site_title = 'لوحة التحكم'
    index_title = 'الرئيسية'
    
    def get_urls(self):
        from django.urls import path
        from . import admin_views
        from core.admin_views import user_permissions, group_permissions
        
        urls = super().get_urls()
        custom_urls = [
            path('', self.admin_view(admin_views.admin_dashboard), name='index'),
            path('user-permissions/', self.admin_view(user_permissions), name='user-permissions'),
            path('user-permissions/<int:user_id>/', self.admin_view(user_permissions), name='user-permissions'),
            path('group-permissions/', self.admin_view(group_permissions), name='group-permissions'),
            path('group-permissions/<int:group_id>/', self.admin_view(group_permissions), name='group-permissions'),
        ]
        return custom_urls + urls
    
    def get_app_list(self, request, app_label=None):
        """
        Return a sorted list of all the installed apps that have been
        registered in this site.
        """
        app_dict = self._build_app_dict(request)
        
        # Sort the apps alphabetically.
        app_list = sorted(app_dict.values(), key=lambda x: x['name'].lower())
        
        # Sort the models alphabetically within each app.
        for app in app_list:
            app['models'].sort(key=lambda x: x['name'])
        
        return app_list
    
    def each_context(self, request):
        """
        Return a dictionary of variables to put in the template context for
        every page in the admin site.
        """
        context = super().each_context(request)
        context['site_header'] = self.site_header
        context['site_title'] = self.site_title
        context['site_url'] = '/'
        context['has_permission'] = request.user.is_active and request.user.is_staff
        
        # Add stats for the dashboard
        if request.path == reverse('custom_admin:index'):
            context.update({
                'total_users': User.objects.count(),
                'total_students': User.objects.filter(groups__name='Students').count(),
                'total_teachers': User.objects.filter(groups__name='Teachers').count(),
                'total_courses': Course.objects.count(),
                'total_enrollments': Enrollment.objects.count(),
            })
        
        return context

# Create an instance of our custom admin site
custom_admin_site = CustomAdminSite(name='custom_admin')

# Register all apps with the custom admin site
from django.apps import apps
from django.contrib import admin
from django.contrib.admin.sites import AlreadyRegistered

# Register all models from all apps with the custom admin site
app_models = apps.get_models()
for model in app_models:
    try:
        # Skip models that are already registered with the default admin
        if admin.site.is_registered(model):
            # Get the existing admin class
            model_admin = admin.site._registry[model].__class__
            # Register with our custom admin site
            custom_admin_site.register(model, model_admin)
    except AlreadyRegistered:
        pass


class BannerAdmin(admin.ModelAdmin):
    list_display = ('title', 'banner_type', 'is_active', 'start_date', 'end_date', 'display_order')
    list_filter = ('banner_type', 'is_active')
    search_fields = ('title', 'description')
    list_editable = ('is_active', 'display_order')
    date_hierarchy = 'start_date'
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('معلومات البانر', {
            'fields': ('title', 'description', 'image', 'url')
        }),
        ('إعدادات العرض', {
            'fields': ('banner_type', 'is_active', 'display_order')
        }),
        ('تواريخ العرض', {
            'fields': ('start_date', 'end_date')
        }),
        ('إعدادات الزر', {
            'fields': ('button_text', 'button_url'),
            'classes': ('collapse',)
        }),
        ('إعدادات التصميم', {
            'fields': ('background_color', 'text_color'),
            'classes': ('collapse',)
        }),
        ('معلومات إضافية', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class CourseCollectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_featured', 'display_order', 'course_count')
    list_filter = ('is_featured',)
    search_fields = ('name', 'description')
    list_editable = ('is_featured', 'display_order')
    readonly_fields = ('created_at', 'updated_at', 'course_count')
    prepopulated_fields = {'slug': ('name',)}
    filter_horizontal = ('courses',)
    
    fieldsets = (
        ('معلومات المجموعة', {
            'fields': ('name', 'slug', 'description')
        }),
        ('إعدادات العرض', {
            'fields': ('is_featured', 'display_order')
        }),
        ('الكورسات', {
            'fields': ('courses',)
        }),
        ('معلومات إضافية', {
            'fields': ('created_at', 'updated_at', 'course_count'),
            'classes': ('collapse',)
        }),
    )
    
    def course_count(self, obj):
        return obj.course_count()
    course_count.short_description = 'عدد الكورسات'


# Register models with the custom admin site
custom_admin_site.register(Banner, BannerAdmin)
custom_admin_site.register(CourseCollection, CourseCollectionAdmin)

# Also register with the default admin site for backward compatibility
admin.site.register(Banner, BannerAdmin)
admin.site.register(CourseCollection, CourseCollectionAdmin)
