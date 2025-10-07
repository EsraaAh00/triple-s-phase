from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.contrib.admin import SimpleListFilter
from django.db.models import Count
from django.conf import settings
from .models import Profile, Organization, Instructor, Student
from django.utils import timezone
from django.http import JsonResponse
from django.urls import path
from django.shortcuts import get_object_or_404

class StatusFilter(SimpleListFilter):
    title = 'حالة المستخدم'
    parameter_name = 'profile__status'

    def lookups(self, request, model_admin):
        return (
            ('Student', 'طالب'),
            ('Instructor', 'مدرب'),
            ('Admin', 'مدير'),
            ('Organization', 'منظمة'),
        )

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(profile__status=self.value())
        return queryset


# ProfileInline removed from User admin - Profile is now managed separately
# class ProfileInline(admin.StackedInline):
#     model = Profile
#     can_delete = False
#     verbose_name_plural = 'الملف الشخصي'
#     fields = (
#         ('name', 'status'),
#         ('email', 'phone'),
#         'image_profile',
#         'shortBio',
#         'detail',
#         ('github', 'youtube'),
#         ('twitter', 'facebook'),
#         ('instagram', 'linkedin'),
#     )


class InstructorInline(admin.StackedInline):
    model = Instructor
    can_delete = False
    verbose_name_plural = 'بيانات المدرب'
    fields = (
        ('organization', 'department'),
        ('qualification', 'date_of_birth'),
        'bio',
        'research_interests'
    )
    
    def has_add_permission(self, request, obj=None):
        # Only show for instructors
        if obj and hasattr(obj, 'profile') and obj.profile.status == 'Instructor':
            return True
        return False


class StudentInline(admin.StackedInline):
    model = Student
    can_delete = False
    verbose_name_plural = 'بيانات الطالب'
    fields = ('department', 'date_of_birth')
    
    def has_add_permission(self, request, obj=None):
        # Only show for students
        if obj and hasattr(obj, 'profile') and obj.profile.status == 'Student':
            return True
        return False


# Unregister the default User admin
admin.site.unregister(User)


@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    inlines = (InstructorInline, StudentInline) if hasattr(settings, 'SHOW_ALL_INLINES') else ()
    actions = ['create_missing_instructor_student_profiles']
    def get_list_display(self, request):
        """Hide permissions from list display for non-superusers"""
        base_display = [
            'username', 'email', 'first_name', 'last_name', 
            'user_status', 'profile_image', 'is_active', 
            'courses_count', 'date_joined'
        ]
        if request.user.is_superuser:
            base_display.extend(['is_staff', 'is_superuser'])
        return base_display
    def get_list_filter(self, request):
        """Hide permissions filters for non-superusers"""
        base_filters = [StatusFilter, 'is_active', 'date_joined']
        if request.user.is_superuser:
            base_filters.extend(['is_staff', 'is_superuser'])
        return base_filters
    search_fields = ('username', 'first_name', 'last_name', 'email', 'profile__name')
    
    # Hide permissions section from user edit form
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('معلومات شخصية', {'fields': ('first_name', 'last_name', 'email')}),
        ('معلومات مهمة', {'fields': ('is_active', 'date_joined', 'last_login')}),
    )
    
    # Remove permissions fieldsets
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2'),
        }),
    )
    
    def user_status(self, obj):
        try:
            profile = obj.profile
            status_colors = {
                'Student': '#28a745',
                'Instructor': '#007bff',
                'Admin': '#dc3545'
            }
            color = status_colors.get(profile.status, '#6c757d')
            
            # إنشاء dropdown لتغيير الحالة
            status_choices = [
                ('Student', 'Student'),
                ('Instructor', 'Instructor'),
                ('Admin', 'Admin'),
            ]
            
            options = ''
            for value, label in status_choices:
                selected = 'selected' if profile.status == value else ''
                options += f'<option value="{value}" {selected}>{label}</option>'
            
            dropdown = f'''
            <select class="status-dropdown" data-user-id="{obj.id}" data-profile-id="{profile.id}" 
                    style="border: 1px solid #ddd; padding: 4px 8px; border-radius: 4px; background: white; color: {color}; font-weight: bold;">
                {options}
            </select>
            '''
            
            return format_html(dropdown)
        except Profile.DoesNotExist:
            return format_html('<span style="color: #dc3545;">لا يوجد ملف شخصي</span>')
    user_status.short_description = 'الحالة'
    
    def profile_image(self, obj):
        try:
            if obj.profile.image_profile:
                return format_html(
                    '<img src="{}" width="30" height="30" style="border-radius: 50%;" />',
                    obj.profile.image_profile.url
                )
            return '📷'
        except (Profile.DoesNotExist, ValueError):
            return '❌'
    profile_image.short_description = 'الصورة'
    
    def courses_count(self, obj):
        try:
            if obj.profile.status == 'Instructor':
                count = obj.instructor.course_set.count() if hasattr(obj, 'instructor') else 0
                if count > 0:
                    url = reverse('admin:courses_course_changelist') + f'?instructor__profile__user__id__exact={obj.id}'
                    return format_html('<a href="{}">{} دورة</a>', url, count)
                return '0 دورة'
            elif obj.profile.status == 'Student':
                count = obj.course_enrollments.count()
                if count > 0:
                    url = reverse('admin:courses_enrollment_changelist') + f'?student__id__exact={obj.id}'
                    return format_html('<a href="{}">{} دورة</a>', url, count)
                return '0 دورة'
            return '-'
        except Profile.DoesNotExist:
            return '-'
    courses_count.short_description = 'الدورات'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('profile').prefetch_related('course_enrollments')
    
    def get_fieldsets(self, request, obj=None):
        """Hide permissions for non-superusers"""
        if not request.user.is_superuser:
            # For non-superusers, show only basic fields
            return (
                (None, {'fields': ('username', 'password')}),
                ('معلومات شخصية', {'fields': ('first_name', 'last_name', 'email')}),
                ('معلومات مهمة', {'fields': ('is_active', 'date_joined', 'last_login')}),
            )
        return super().get_fieldsets(request, obj)
    
    def get_readonly_fields(self, request, obj=None):
        """Make certain fields readonly for non-superusers"""
        readonly_fields = list(super().get_readonly_fields(request, obj))
        if not request.user.is_superuser:
            readonly_fields.extend(['is_staff', 'is_superuser', 'user_permissions', 'groups'])
        return readonly_fields
    
    def get_add_fieldsets(self, request, obj=None):
        """Customize add form fieldsets"""
        if not request.user.is_superuser:
            return (
                (None, {
                    'classes': ('wide',),
                    'fields': ('username', 'password1', 'password2'),
                }),
            )
        return super().get_add_fieldsets(request, obj)
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('update-status/', self.update_user_status, name='update_user_status'),
        ]
        return custom_urls + urls
    
    def update_user_status(self, request):
        """AJAX endpoint لتحديث حالة المستخدم"""
        if request.method == 'POST':
            try:
                profile_id = request.POST.get('profile_id')
                new_status = request.POST.get('status')
                
                if not profile_id or not new_status:
                    return JsonResponse({'success': False, 'error': 'معاملات مفقودة'})
                
                profile = get_object_or_404(Profile, id=profile_id)
                old_status = profile.status
                profile.status = new_status
                profile.save()
                
                return JsonResponse({
                    'success': True, 
                    'message': f'تم تحديث الحالة من {old_status} إلى {new_status}',
                    'new_status': new_status
                })
            except Exception as e:
                return JsonResponse({'success': False, 'error': str(e)})
        
        return JsonResponse({'success': False, 'error': 'طريقة غير صحيحة'})
    
    
    def create_missing_instructor_student_profiles(self, request, queryset):
        """إنشاء بروفايلات المدربين والطلاب المفقودة"""
        instructor_count = 0
        student_count = 0
        
        for user in queryset:
            try:
                if hasattr(user, 'profile'):
                    profile = user.profile
                    
                    # إنشاء بروفايل مدرب إذا كان status = Instructor ولم يكن موجود
                    if profile.status == 'Instructor' and not hasattr(profile, 'instructor'):
                        Instructor.objects.create(
                            profile=profile,
                            bio='مدرب في المنصة',
                            qualification='مؤهل تعليمي'
                        )
                        instructor_count += 1
                    
                    # إنشاء بروفايل طالب إذا كان status = Student ولم يكن موجود
                    elif profile.status == 'Student' and not hasattr(profile, 'student'):
                        Student.objects.create(
                            profile=profile,
                            department='عام'
                        )
                        student_count += 1
                        
            except Exception as e:
                self.message_user(request, f'خطأ في إنشاء بروفايل للمستخدم {user.username}: {str(e)}', level='ERROR')
        
        message_parts = []
        if instructor_count > 0:
            message_parts.append(f'{instructor_count} بروفايل مدرب')
        if student_count > 0:
            message_parts.append(f'{student_count} بروفايل طالب')
            
        if message_parts:
            self.message_user(request, f'تم إنشاء: {", ".join(message_parts)}', level='SUCCESS')
        else:
            self.message_user(request, 'جميع البروفايلات موجودة بالفعل', level='INFO')
    
    create_missing_instructor_student_profiles.short_description = "إنشاء بروفايلات المدربين والطلاب المفقودة"

    class Media:
        js = ('admin/js/status_dropdown.js',)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'user_username', 'status', 'email', 'phone', 
        'profile_image', 'social_links', 'created_date'
    )
    list_filter = ('status', 'user__date_joined')
    search_fields = ('name', 'user__username', 'email', 'phone', 'shortBio')
    readonly_fields = ('id', 'created_date')
    actions = ['create_instructor_student_profiles']
    
    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('user', 'name', 'status', 'email', 'phone')
        }),
        ('الصورة والوصف', {
            'fields': ('image_profile', 'shortBio', 'detail')
        }),
        ('الروابط الاجتماعية', {
            'fields': (
                ('github', 'youtube'),
                ('twitter', 'facebook'),
                ('instagram', 'linkedin')
            ),
            'classes': ('collapse',)
        }),
        ('معلومات النظام', {
            'fields': ('id', 'created_date'),
            'classes': ('collapse',)
        }),
    )
    
    def user_username(self, obj):
        if obj.user:
            url = reverse('admin:auth_user_change', args=[obj.user.id])
            return format_html('<a href="{}">{}</a>', url, obj.user.username)
        return '-'
    user_username.short_description = 'اسم المستخدم'
    
    def profile_image(self, obj):
        if obj.image_profile:
            return format_html(
                '<img src="{}" width="40" height="40" style="border-radius: 50%;" />',
                obj.image_profile.url
            )
        return '📷'
    profile_image.short_description = 'الصورة'
    
    def social_links(self, obj):
        links = []
        social_fields = {
            'github': '🐙',
            'youtube': '📺',
            'twitter': '🐦',
            'facebook': '📘',
            'instagram': '📷',
            'linkedin': '💼'
        }
        
        for field, emoji in social_fields.items():
            value = getattr(obj, field)
            if value:
                links.append(f'<a href="{value}" target="_blank">{emoji}</a>')
        
        return format_html(' '.join(links)) if links else '-'
    social_links.short_description = 'الروابط الاجتماعية'
    
    def created_date(self, obj):
        return obj.user.date_joined if obj.user else None
    created_date.short_description = 'تاريخ الإنشاء'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('user')
    
    def create_instructor_student_profiles(self, request, queryset):
        """إنشاء بروفايلات المدربين والطلاب للبروفايلات المحددة"""
        instructor_count = 0
        student_count = 0
        
        for profile in queryset:
            try:
                # إنشاء بروفايل مدرب إذا كان status = Instructor ولم يكن موجود
                if profile.status == 'Instructor' and not hasattr(profile, 'instructor'):
                    Instructor.objects.create(
                        profile=profile,
                        bio='مدرب في المنصة',
                        qualification='مؤهل تعليمي'
                    )
                    instructor_count += 1
                
                # إنشاء بروفايل طالب إذا كان status = Student ولم يكن موجود
                elif profile.status == 'Student' and not hasattr(profile, 'student'):
                    Student.objects.create(
                        profile=profile,
                        department='عام'
                    )
                    student_count += 1
                    
            except Exception as e:
                self.message_user(request, f'خطأ في إنشاء بروفايل للمستخدم {profile.name}: {str(e)}', level='ERROR')
        
        message_parts = []
        if instructor_count > 0:
            message_parts.append(f'{instructor_count} بروفايل مدرب')
        if student_count > 0:
            message_parts.append(f'{student_count} بروفايل طالب')
            
        if message_parts:
            self.message_user(request, f'تم إنشاء: {", ".join(message_parts)}', level='SUCCESS')
        else:
            self.message_user(request, 'جميع البروفايلات موجودة بالفعل', level='INFO')
    
    create_instructor_student_profiles.short_description = "إنشاء بروفايلات المدربين والطلاب"


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('profile_name', 'location', 'website', 'founded_year', 'employees', 'teachers_count')
    list_filter = ('founded_year',)
    search_fields = ('profile__name', 'location', 'website')
    
    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('profile', 'location', 'website', 'founded_year', 'employees')
        }),
        ('الوصف', {
            'fields': ('description',)
        }),
    )
    
    def profile_name(self, obj):
        if obj.profile:
            url = reverse('admin:users_profile_change', args=[obj.profile.id])
            return format_html('<a href="{}">{}</a>', url, obj.profile.name)
        return '-'
    profile_name.short_description = 'اسم المنظمة'
    
    def teachers_count(self, obj):
        count = obj.instructor_set.count()
        if count > 0:
            url = reverse('admin:users_instructor_changelist') + f'?organization__id__exact={obj.id}'
            return format_html('<a href="{}">{} معلم</a>', url, count)
        return '0 معلم'
    teachers_count.short_description = 'المعلمين'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('profile').prefetch_related('instructor_set')

@admin.register(Instructor)
class InstructorAdmin(admin.ModelAdmin):
    list_display = (
        'profile_name', 'organization', 'department', 'qualification', 
        'courses_count', 'students_count', 'date_of_birth'
    )
    list_filter = ('organization', 'department', 'date_of_birth')
    search_fields = ('profile__name', 'profile__user__username', 'department', 'qualification')
    
    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('profile', 'organization', 'department', 'qualification', 'date_of_birth')
        }),
        ('السيرة الذاتية', {
            'fields': ('bio', 'research_interests')
        }),
    )
    
    def profile_name(self, obj):
        if obj.profile:
            url = reverse('admin:users_profile_change', args=[obj.profile.id])
            return format_html('<a href="{}">{}</a>', url, obj.profile.name)
        return '-'
    profile_name.short_description = 'اسم المدرب'
    
    def courses_count(self, obj):
        count = obj.courses_taught.count()
        if count > 0:
            url = reverse('admin:courses_course_changelist') + f'?instructor__id__exact={obj.id}'
            return format_html('<a href="{}">{} دورة</a>', url, count)
        return '0 دورة'
    courses_count.short_description = 'الدورات'
    
    def students_count(self, obj):
        from django.db.models import Count
        count = obj.courses_taught.aggregate(total=Count('enrollments'))['total'] or 0
        if count > 0:
            url = reverse('admin:courses_enrollment_changelist') + f'?course__instructor__id__exact={obj.id}'
            return format_html('<a href="{}">{} طالب</a>', url, count)
        return '0 طالب'
    students_count.short_description = 'الطلاب'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('profile', 'organization').prefetch_related('courses_taught', 'courses_taught__enrollments')


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('profile_name', 'department', 'date_of_birth', 'enrolled_courses', 'completed_courses')
    list_filter = ('department', 'date_of_birth')
    search_fields = ('profile__name', 'profile__user__username', 'department')
    
    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('profile', 'department', 'date_of_birth')
        }),
    )
    
    def profile_name(self, obj):
        if obj.profile:
            url = reverse('admin:users_profile_change', args=[obj.profile.id])
            return format_html('<a href="{}">{}</a>', url, obj.profile.name)
        return '-'
    profile_name.short_description = 'اسم الطالب'
    
    def enrolled_courses(self, obj):
        if obj.profile and obj.profile.user:
            count = obj.profile.user.course_enrollments.filter(status='active').count()
            if count > 0:
                url = reverse('admin:courses_enrollment_changelist') + f'?student__id__exact={obj.profile.user.id}'
                return format_html('<a href="{}">{} دورة</a>', url, count)
            return '0 دورة'
        return '-'
    enrolled_courses.short_description = 'الدورات المسجلة'
    
    def completed_courses(self, obj):
        if obj.profile and obj.profile.user:
            count = obj.profile.user.course_enrollments.filter(status='completed').count()
            return f'{count} دورة'
        return '0 دورة'
    completed_courses.short_description = 'الدورات المكتملة'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('profile__user').prefetch_related('profile__user__course_enrollments')
