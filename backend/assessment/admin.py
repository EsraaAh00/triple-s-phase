from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    Assessment, QuestionBank, AssessmentQuestions, 
    StudentSubmission, StudentAnswer, Flashcard, StudentFlashcardProgress
)


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    """Admin interface for Assessment model"""
    
    list_display = [
        'title', 'type', 'status', 'course', 'created_by', 
        'start_date', 'end_date', 'total_marks', 'questions_count', 'is_active'
    ]
    list_filter = ['type', 'status', 'course', 'created_by', 'start_date', 'end_date']
    search_fields = ['title', 'description', 'course__title']
    readonly_fields = ['created_at', 'updated_at', 'questions_count', 'total_questions_marks', 'is_active']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'type', 'status', 'course', 'created_by')
        }),
        ('Timing', {
            'fields': ('start_date', 'end_date', 'duration_minutes')
        }),
        ('Scoring', {
            'fields': ('total_marks', 'passing_marks')
        }),
        ('Settings', {
            'fields': (
                'is_randomized', 'allow_multiple_attempts', 'max_attempts',
                'show_correct_answers', 'show_results_immediately'
            )
        }),
        ('Statistics', {
            'fields': ('questions_count', 'total_questions_marks', 'is_active'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('course', 'created_by')
    
    def save_model(self, request, obj, form, change):
        if not change:  # Creating new object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(QuestionBank)
class QuestionBankAdmin(admin.ModelAdmin):
    """Admin interface for QuestionBank model"""
    
    list_display = [
        'question_text_short', 'question_type', 'difficulty_level', 
        'lesson', 'created_by', 'created_at', 'usage_count'
    ]
    list_filter = ['question_type', 'difficulty_level', 'lesson', 'lesson__module__course', 'created_by', 'created_at']
    search_fields = ['question_text', 'tags', 'lesson__title', 'lesson__module__course__title', 'created_by__username']
    readonly_fields = ['created_at', 'updated_at', 'usage_count', 'options_list', 'is_mcq']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Question Content', {
            'fields': ('question_text', 'question_type', 'difficulty_level', 'lesson')
        }),
        ('Answer Options', {
            'fields': ('options', 'correct_answer', 'explanation'),
            'description': 'For MCQ questions, provide options as JSON array'
        }),
        ('Media', {
            'fields': ('image', 'audio', 'video'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('tags', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('usage_count', 'options_list', 'is_mcq'),
            'classes': ('collapse',)
        })
    )
    
    def question_text_short(self, obj):
        """Display shortened question text"""
        return obj.question_text[:100] + '...' if len(obj.question_text) > 100 else obj.question_text
    question_text_short.short_description = 'Question Text'
    
    def usage_count(self, obj):
        """Show how many assessments use this question"""
        return obj.assessment_questions.count()
    usage_count.short_description = 'Used in Assessments'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('created_by')
    
    def save_model(self, request, obj, form, change):
        if not change:  # Creating new object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


class AssessmentQuestionsInline(admin.TabularInline):
    """Inline admin for AssessmentQuestions"""
    model = AssessmentQuestions
    extra = 0
    fields = ['question', 'marks_allocated', 'order']
    readonly_fields = ['question']


@admin.register(AssessmentQuestions)
class AssessmentQuestionsAdmin(admin.ModelAdmin):
    """Admin interface for AssessmentQuestions model"""
    
    list_display = ['assessment', 'question_short', 'marks_allocated', 'order']
    list_filter = ['assessment', 'question__question_type', 'question__difficulty_level']
    search_fields = ['assessment__title', 'question__question_text']
    readonly_fields = ['assessment', 'question']
    
    def question_short(self, obj):
        """Display shortened question text"""
        return obj.question.question_text[:50] + '...' if len(obj.question.question_text) > 50 else obj.question.question_text
    question_short.short_description = 'Question'


@admin.register(StudentSubmission)
class StudentSubmissionAdmin(admin.ModelAdmin):
    """Admin interface for StudentSubmission model"""
    
    list_display = [
        'student', 'assessment', 'status', 'attempt_number', 
        'submitted_at', 'total_score', 'percentage', 'is_passed'
    ]
    list_filter = ['status', 'is_passed', 'assessment', 'student', 'submitted_at']
    search_fields = ['student__username', 'assessment__title', 'feedback']
    readonly_fields = [
        'started_at', 'submitted_at', 'time_taken_minutes', 
        'total_score', 'percentage', 'is_passed', 'graded_at'
    ]
    date_hierarchy = 'submitted_at'
    
    fieldsets = (
        ('Submission Info', {
            'fields': ('student', 'assessment', 'status', 'attempt_number')
        }),
        ('Timing', {
            'fields': ('started_at', 'submitted_at', 'time_taken_minutes')
        }),
        ('Scoring', {
            'fields': ('total_score', 'percentage', 'is_passed')
        }),
        ('Grading', {
            'fields': ('graded_by', 'graded_at', 'feedback')
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('student', 'assessment', 'graded_by')


@admin.register(StudentAnswer)
class StudentAnswerAdmin(admin.ModelAdmin):
    """Admin interface for StudentAnswer model"""
    
    list_display = [
        'submission', 'question_short', 'is_correct', 
        'marks_obtained', 'is_auto_graded', 'answered_at'
    ]
    list_filter = ['is_correct', 'is_auto_graded', 'question__question_type', 'answered_at']
    search_fields = ['submission__student__username', 'question__question_text', 'answer_text']
    readonly_fields = ['answered_at', 'is_auto_graded']
    date_hierarchy = 'answered_at'
    
    fieldsets = (
        ('Answer Info', {
            'fields': ('submission', 'question', 'answered_at')
        }),
        ('Answer Content', {
            'fields': ('answer_text', 'selected_options')
        }),
        ('Grading', {
            'fields': ('is_correct', 'marks_obtained', 'is_auto_graded', 'time_spent_seconds')
        })
    )
    
    def question_short(self, obj):
        """Display shortened question text"""
        return obj.question.question_text[:50] + '...' if len(obj.question.question_text) > 50 else obj.question.question_text
    question_short.short_description = 'Question'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('submission', 'question')


@admin.register(Flashcard)
class FlashcardAdmin(admin.ModelAdmin):
    """Admin interface for Flashcard model"""
    
    list_display = [
        'front_text_short', 'back_text_short', 'lesson', 'related_question', 
        'created_by', 'created_at'
    ]
    list_filter = ['lesson__module__course', 'lesson', 'created_by', 'created_at']
    search_fields = ['front_text', 'back_text', 'lesson__title', 'created_by__username']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Flashcard Content', {
            'fields': ('front_text', 'back_text', 'lesson', 'related_question')
        }),
        ('Media', {
            'fields': ('front_image', 'back_image'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def front_text_short(self, obj):
        """Display shortened front text"""
        return obj.front_text[:30] + '...' if len(obj.front_text) > 30 else obj.front_text
    front_text_short.short_description = 'Front Text'
    
    def back_text_short(self, obj):
        """Display shortened back text"""
        return obj.back_text[:30] + '...' if len(obj.back_text) > 30 else obj.back_text
    back_text_short.short_description = 'Back Text'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('lesson', 'lesson__module', 'lesson__module__course', 'related_question', 'created_by')
    
    def save_model(self, request, obj, form, change):
        if not change:  # Creating new object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(StudentFlashcardProgress)
class StudentFlashcardProgressAdmin(admin.ModelAdmin):
    """Admin interface for StudentFlashcardProgress model"""
    
    list_display = [
        'student', 'flashcard_short', 'times_reviewed', 
        'correct_count', 'accuracy_rate', 'last_reviewed'
    ]
    list_filter = ['difficulty_level', 'last_reviewed', 'student']
    search_fields = ['student__username', 'flashcard__front_text']
    readonly_fields = ['times_reviewed', 'correct_count', 'last_reviewed', 'accuracy_rate']
    date_hierarchy = 'last_reviewed'
    
    fieldsets = (
        ('Progress Info', {
            'fields': ('student', 'flashcard', 'difficulty_level')
        }),
        ('Statistics', {
            'fields': ('times_reviewed', 'correct_count', 'accuracy_rate', 'last_reviewed')
        })
    )
    
    def flashcard_short(self, obj):
        """Display shortened flashcard text"""
        return obj.flashcard.front_text[:30] + '...' if len(obj.flashcard.front_text) > 30 else obj.flashcard.front_text
    flashcard_short.short_description = 'Flashcard'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('student', 'flashcard')


# Customize admin site headers
admin.site.site_header = "LMS Assessment System"
admin.site.site_title = "Assessment Admin"
admin.site.index_title = "Assessment Management"