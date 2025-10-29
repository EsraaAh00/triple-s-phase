from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse, path
from django.contrib.admin import SimpleListFilter
from django.db.models import Count, Avg
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.db.models import Q

from .models import Category, Tags, Course, Enrollment, StudySchedule, ScheduleItem

# Unregister any models that might be registered by default or other apps
try:
    admin.site.unregister(Category)
except Exception:
    pass


try:
    admin.site.unregister(Tags)
except Exception:
    pass

try:
    admin.site.unregister(Course)
except Exception:
    pass

try:
    admin.site.unregister(Enrollment)
except Exception:
    pass



class PublishedFilter(SimpleListFilter):
    title = 'حالة النشر'
    parameter_name = 'status'

    def lookups(self, request, model_admin):
        return (
            ('published', 'منشور'),
            ('pending', 'قيد الانتظار'),
            ('draft', 'مسودة'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'published':
            return queryset.filter(status='published')
        elif self.value() == 'pending':
            return queryset.filter(status='pending')
        elif self.value() == 'draft':
            return queryset.filter(status='draft')
        return queryset


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_default_display', 'course_count', 'created_at')
    list_filter = ('is_default', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    
    def is_default_display(self, obj):
        if obj.is_default:
            return format_html('<span style="color: red; font-weight: bold;">🔒 Default</span>')
        else:
            return format_html('<span style="color: green;">✓ Custom</span>')
    is_default_display.short_description = 'Type'
    is_default_display.admin_order_field = 'is_default'
    
    def course_count(self, obj):
        count = obj.courses.count()
        if count > 0:
            url = reverse('admin:courses_course_changelist') + f'?category__id__exact={obj.id}'
            return format_html('<a href="{}">{} دورة</a>', url, count)
        return '0 دورة'
    course_count.short_description = 'عدد الدورات'
    
    def has_delete_permission(self, request, obj=None):
        """Prevent deletion of default categories"""
        if obj and obj.is_default:
            return False
        return super().has_delete_permission(request, obj)
    
    def delete_selected_categories(self, request, queryset):
        """Custom delete action that excludes default categories"""
        # Filter out default categories from the queryset
        non_default_categories = queryset.filter(is_default=False)
        default_categories = queryset.filter(is_default=True)
        
        if default_categories.exists():
            default_names = ', '.join([cat.name for cat in default_categories])
            self.message_user(
                request,
                f'Cannot delete default categories: {default_names}. Only non-default categories can be deleted.',
                level='WARNING'
            )
        
        if non_default_categories.exists():
            count = non_default_categories.count()
            non_default_categories.delete()
            self.message_user(
                request,
                f'Successfully deleted {count} non-default categor{"y" if count == 1 else "ies"}.',
                level='SUCCESS'
            )
        else:
            self.message_user(
                request,
                'No non-default categories selected for deletion.',
                level='INFO'
            )
    
    delete_selected_categories.short_description = "Delete selected non-default categories"
    
    actions = ['delete_selected_categories']


@admin.register(Tags)
class TagsAdmin(admin.ModelAdmin):
    list_display = ('name', 'course_count')
    search_fields = ('name',)
    
    def course_count(self, obj):
        return obj.courses.count()
    course_count.short_description = 'عدد الدورات'

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'get_instructors', 'get_category_name', 'level', 'status', 'get_course_type', 'price', 
        'enrollment_count_display', 'created_at'
    )
    list_filter = (
        PublishedFilter, 'level', 'category', 'status', 'is_active', 'is_featured', 'is_certified', 'is_complete_course'
    )
    search_fields = ('title', 'instructors__profile__name', 'description', 'short_description')
    filter_horizontal = ('tags', 'instructors')
    readonly_fields = (
        'created_at', 'updated_at', 'enrollment_count_display', 'slug',
        'total_enrollments', 'average_rating'
    )
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title', 'slug', 'subtitle', 'description', 'short_description',
                'category', 'tags', 'instructors', 'organization'
            )
        }),
        ('Course Type', {
            'fields': ('is_complete_course',),
            'description': 'Check if this is a complete course with full content. Uncheck if this is just a course announcement/preview.'
        }),
        ('Media & Content', {
            'fields': (
                'image', 'promotional_video', 'syllabus_pdf', 'materials_pdf'
            )
        }),
        ('Course Details', {
            'fields': (
                'level', 'language', 'status', 'is_active', 'is_featured',
                'is_certified', 'is_free'
            )
        }),
        ('Pricing', {
            'fields': ('price', 'discount_price'),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('total_enrollments', 'average_rating'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_instructors(self, obj):
        instructor_names = []
        for i in obj.instructors.all():
            if hasattr(i, 'profile') and i.profile:
                name = i.profile.name or i.name or 'Unnamed Instructor'
            else:
                name = i.name or 'Unnamed Instructor'
            instructor_names.append(name)
        return ", ".join(instructor_names)
    get_instructors.short_description = 'Instructors'
    
    def get_category_name(self, obj):
        return obj.category.name if obj.category else 'N/A'
    get_category_name.short_description = 'Category'
    get_category_name.admin_order_field = 'category__name'
    
    
    def get_course_type(self, obj):
        if obj.is_complete_course:
            return format_html('<span style="color: green;">✓ Complete Course</span>')
        else:
            return format_html('<span style="color: orange;">📢 Announcement</span>')
    get_course_type.short_description = 'Course Type'
    get_course_type.admin_order_field = 'is_complete_course'
    
    def enrollment_count_display(self, obj):
        return obj.students.count()
    enrollment_count_display.short_description = 'Enrollments'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('category', 'organization') \
            .prefetch_related('tags', 'instructors', 'instructors__profile') \
            .annotate(
                enrollment_count=Count('students', distinct=True),
                avg_rating=Avg('reviews__rating')
            )
    
    def total_enrollments(self, obj):
        return obj.students.count()
    total_enrollments.short_description = 'Total Enrollments'
    
    def average_rating(self, obj):
        if hasattr(obj, 'avg_rating'):
            return f"{obj.avg_rating:.1f}/5.0" if obj.avg_rating is not None else 'N/A'
        return 'N/A'
    average_rating.short_description = 'Average Rating'

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('course', 'student_name', 'status', 'enrollment_date', 'last_accessed')
    list_filter = ('status', 'enrollment_date', 'course')
    search_fields = ('course__name', 'student__username', 'student__first_name', 'student__last_name', 'student__profile__name')
    readonly_fields = ('enrollment_date',)
    autocomplete_fields = ['student']
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('course', 'student', 'student__profile')
    
    def get_form(self, request, obj=None, **kwargs):
        """Filter student field to show only students"""
        form = super().get_form(request, obj, **kwargs)
        if 'student' in form.base_fields:
            # Filter to show only users with Student status
            form.base_fields['student'].queryset = User.objects.filter(profile__status='Student')
            form.base_fields['student'].help_text = "اكتب للبحث عن طالب - يتم عرض الطلاب فقط"
        return form
    
    def student_name(self, obj):
        """Display student name with profile info"""
        if obj.student.profile:
            return f"{obj.student.profile.name} ({obj.student.username})"
        return f"{obj.student.get_full_name() or obj.student.username}"
    student_name.short_description = 'الطالب'
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('student-autocomplete/', self.student_autocomplete, name='student_autocomplete'),
        ]
        return custom_urls + urls
    
    def student_autocomplete(self, request):
        """AJAX endpoint for student autocomplete search"""
        query = request.GET.get('q', '')
        if len(query) < 2:
            return JsonResponse({'results': []})
        
        # Search in username, first_name, last_name, and profile name
        students = User.objects.filter(
            profile__status='Student'
        ).filter(
            Q(username__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(profile__name__icontains=query)
        ).select_related('profile')[:20]
        
        results = []
        for student in students:
            display_name = student.profile.name if student.profile and student.profile.name else f"{student.get_full_name() or student.username}"
            results.append({
                'id': student.id,
                'text': f"{display_name} ({student.username})"
            })
        
        return JsonResponse({'results': results})


@admin.register(StudySchedule)
class StudyScheduleAdmin(admin.ModelAdmin):
    list_display = ('course', 'student_name', 'start_date', 'end_date', 'daily_hours', 'is_active', 'created_at')
    list_filter = ('is_active', 'daily_hours', 'created_at')
    search_fields = ('course__title', 'student__username', 'student__first_name', 'student__last_name')
    readonly_fields = ('created_at', 'updated_at', 'total_study_days', 'total_study_hours')
    date_hierarchy = 'start_date'
    
    fieldsets = (
        ('Schedule Information', {
            'fields': ('student', 'course', 'start_date', 'end_date', 'daily_hours', 'days_off', 'is_active')
        }),
        ('Statistics', {
            'fields': ('total_study_days', 'total_study_hours'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def student_name(self, obj):
        if obj.student.profile:
            return f"{obj.student.profile.name} ({obj.student.username})"
        return f"{obj.student.get_full_name() or obj.student.username}"
    student_name.short_description = 'Student'
    
    def total_study_days(self, obj):
        return obj.get_total_study_days()
    total_study_days.short_description = 'Total Study Days'
    
    def total_study_hours(self, obj):
        return obj.get_total_study_hours()
    total_study_hours.short_description = 'Total Study Hours'


@admin.register(ScheduleItem)
class ScheduleItemAdmin(admin.ModelAdmin):
    list_display = ('schedule', 'date', 'start_time', 'end_time', 'lesson_title', 'is_completed', 'order')
    list_filter = ('is_completed', 'date', 'schedule__course')
    search_fields = ('lesson_title', 'module_title', 'schedule__course__title')
    readonly_fields = ('created_at', 'updated_at', 'completed_at')
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Schedule Item', {
            'fields': ('schedule', 'date', 'start_time', 'end_time', 'hours', 'order')
        }),
        ('Content', {
            'fields': ('module_id', 'module_title', 'lesson_id', 'lesson_title')
        }),
        ('Progress', {
            'fields': ('is_completed', 'completed_at', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# Comment and SubComment admin classes moved to reviews app