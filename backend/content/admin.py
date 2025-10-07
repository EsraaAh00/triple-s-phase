from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Module, Lesson, UserProgress, ModuleProgress, LessonResource


class LessonInline(admin.StackedInline):
    model = Lesson
    extra = 0
    show_change_link = True
    fields = [
        'title', 'lesson_type', 'difficulty', 'order',
        'is_active', 'is_free', 'requires_completion'
    ]
    readonly_fields = ['created_at', 'updated_at']


class ModuleProgressInline(admin.StackedInline):
    model = ModuleProgress
    extra = 0
    readonly_fields = [
        'user', 'status', 'started_at', 'last_accessed', 'completed_at',
        'is_completed', 'get_completion_percentage'
    ]
    fields = [
        'user', 'status', 'started_at', 'last_accessed',
        'is_completed', 'get_completion_percentage'
    ]
    raw_id_fields = ['user']
    
    def get_completion_percentage(self, obj):
        return f"{obj.get_completion_percentage()}%"
    get_completion_percentage.short_description = 'Progress'


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'course', 'submodule', 'status', 'is_active', 'order',
        'lesson_count', 'submodules_count', 'created_at'
    ]
    list_filter = ['status', 'is_active', 'submodule', 'created_at']
    search_fields = ['name', 'description', 'course__name']
    list_editable = ['status', 'is_active', 'order']
    readonly_fields = [
        'created_at', 'updated_at', 'published_at', 'total_duration',
        'submodules_count', 'is_submodule'
    ]
    inlines = [LessonInline, ModuleProgressInline]
    filter_horizontal = ['prerequisites']
    fieldsets = [
        (None, {
            'fields': [
                'name', 'course', 'submodule', 'description', 'status', 'is_active', 'order'
            ]
        }),
        ('Content', {
            'fields': [
                'video', 'video_duration', 'pdf', 'note'
            ]
        }),
        ('Bunny CDN Video', {
            'fields': [
                'bunny_video_id', 'bunny_video_url'
            ],
            'classes': ['collapse']
        }),
        ('Relations', {
            'fields': [
                'prerequisites'
            ]
        }),
        ('Timestamps', {
            'fields': [
                'created_at', 'updated_at', 'published_at'
            ],
            'classes': ['collapse']
        }),
    ]
    
    def lesson_count(self, obj):
        return obj.lessons.count()
    lesson_count.short_description = 'Lessons'
    
    def submodules_count(self, obj):
        return obj.submodules.count()
    submodules_count.short_description = 'Submodules'


class LessonResourceInline(admin.TabularInline):
    model = LessonResource
    extra = 0
    fields = ['title', 'resource_type', 'file', 'url', 'is_public', 'order']
    readonly_fields = ['created_at']


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'module', 'lesson_type', 'difficulty', 'order',
        'is_active', 'is_free', 'requires_completion', 'resource_count', 'created_at'
    ]
    list_filter = [
        'lesson_type', 'difficulty', 'is_active', 'is_free', 'created_at'
    ]
    search_fields = [
        'title', 'description', 'content', 'module__name', 'module__course__name'
    ]
    list_editable = [
        'order', 'is_active', 'is_free', 'requires_completion'
    ]
    readonly_fields = [
        'created_at', 'updated_at', 'published_at', 'slug'
    ]
    inlines = [LessonResourceInline]
    raw_id_fields = ['module']
    fieldsets = [
        (None, {
            'fields': [
                'title', 'slug', 'module', 'description', 'content',
                'lesson_type', 'difficulty'
            ]
        }),
        ('Settings', {
            'fields': [
                'order', 'is_active', 'is_free', 'requires_completion',
                'duration_minutes', 'video_url'
            ]
        }),
        ('Bunny CDN Video', {
            'fields': [
                'bunny_video_id', 'bunny_video_url'
            ],
            'classes': ['collapse']
        }),
        ('Timestamps', {
            'fields': [
                'created_at', 'updated_at', 'published_at'
            ],
            'classes': ['collapse']
        }),
    ]
    
    def resource_count(self, obj):
        return obj.lesson_resources.count()
    resource_count.short_description = 'Resources'


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'course', 'status', 'overall_progress',
        'time_spent_minutes', 'last_accessed'
    ]
    list_filter = ['status', 'last_accessed', 'enrolled_at']
    search_fields = [
        'user__username', 'user__email', 'course__name'
    ]
    readonly_fields = [
        'enrolled_at', 'last_accessed', 'started_at', 'completed_at',
        'overall_progress', 'time_spent_minutes'
    ]
    inlines = []
    raw_id_fields = ['user', 'course', 'last_lesson_completed']


@admin.register(ModuleProgress)
class ModuleProgressAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'module', 'status', 'is_completed',
        'completion_percentage', 'last_accessed'
    ]
    list_filter = ['status', 'is_completed', 'last_accessed']
    search_fields = [
        'user__username', 'user__email', 'module__name', 'module__course__name'
    ]
    readonly_fields = [
        'started_at', 'last_accessed', 'completed_at', 'is_completed',
        'get_completion_percentage'
    ]
    raw_id_fields = ['user', 'module']
    fieldsets = [
        (None, {
            'fields': [
                'user', 'module', 'status'
            ]
        }),
        ('Progress', {
            'fields': [
                'video_watched', 'video_progress', 'video_last_position',
                'pdf_viewed', 'pdf_last_page',
                'notes_read',
                'quiz_completed', 'quiz_score'
            ]
        }),
        ('Completion', {
            'fields': [
                'is_completed', 'get_completion_percentage',
                'started_at', 'last_accessed', 'completed_at'
            ]
        }),
        ('Metadata', {
            'fields': [
                'completion_requirements', 'metadata'
            ],
            'classes': ['collapse']
        }),
    ]
    
    def completion_percentage(self, obj):
        return f"{obj.get_completion_percentage()}%"
    completion_percentage.short_description = 'Progress'
    completion_percentage.admin_order_field = 'get_completion_percentage'


@admin.register(LessonResource)
class LessonResourceAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'lesson', 'resource_type', 'is_public',
        'order', 'created_at', 'is_downloadable'
    ]
    list_filter = ['resource_type', 'is_public', 'created_at']
    search_fields = [
        'title', 'description', 'lesson__title',
        'lesson__module__name', 'lesson__module__course__name'
    ]
    list_editable = ['order', 'is_public']
    readonly_fields = [
        'created_at', 'updated_at', 'file_extension',
        'is_downloadable', 'is_external_link'
    ]
    raw_id_fields = ['lesson']
    fieldsets = [
        (None, {
            'fields': [
                'title', 'description', 'lesson', 'resource_type',
                'is_public', 'order'
            ]
        }),
        ('File/URL', {
            'fields': [
                'file', 'url', 'file_extension',
                'is_downloadable', 'is_external_link'
            ]
        }),
        ('Metadata', {
            'fields': [
                'metadata'
            ],
            'classes': ['collapse']
        }),
        ('Timestamps', {
            'fields': [
                'created_at', 'updated_at'
            ],
            'classes': ['collapse']
        }),
    ]
    
    def file_extension(self, obj):
        return obj.file_extension.upper() if obj.file_extension else 'N/A'
    file_extension.short_description = 'File Type'
