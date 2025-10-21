from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    Assessment, QuestionBank, AssessmentQuestions, 
    StudentSubmission, StudentAnswer, Flashcard, StudentFlashcardProgress,
    QuestionBankProduct, QuestionBankProductEnrollment,
    QuestionBankChapter, QuestionBankTopic, 
    FlashcardProduct, FlashcardProductEnrollment,
    FlashcardChapter, FlashcardTopic
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
        'product', 'topic', 'created_by', 'created_at', 'usage_count'
    ]
    list_filter = ['question_type', 'difficulty_level', 'product', 'topic', 'created_by', 'created_at']
    search_fields = ['question_text', 'tags', 'product__title', 'topic__title', 'created_by__username']
    readonly_fields = ['created_at', 'updated_at', 'usage_count', 'options_list', 'is_mcq']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Question Content', {
            'fields': ('question_text', 'question_type', 'difficulty_level', 'product', 'topic')
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
        'front_text_short', 'back_text_short', 'product', 'topic', 'related_question', 
        'created_by', 'created_at'
    ]
    list_filter = ['product', 'topic', 'created_by', 'created_at']
    search_fields = ['front_text', 'back_text', 'product__title', 'topic__title', 'created_by__username']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Flashcard Content', {
            'fields': ('front_text', 'back_text', 'product', 'topic', 'related_question')
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
        return super().get_queryset(request).select_related('product', 'topic', 'related_question', 'created_by')
    
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


# Admin classes for new models
@admin.register(QuestionBankChapter)
class QuestionBankChapterAdmin(admin.ModelAdmin):
    """Admin interface for QuestionBankChapter model"""
    
    list_display = ['title', 'product', 'order', 'topics_count', 'questions_count', 'created_by', 'created_at']
    list_filter = ['product', 'created_by', 'created_at']
    search_fields = ['title', 'description', 'product__title']
    readonly_fields = ['created_at', 'updated_at', 'topics_count', 'questions_count']
    ordering = ['product', 'order', 'title']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'product', 'order', 'created_by')
        }),
        ('Statistics', {
            'fields': ('topics_count', 'questions_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(QuestionBankTopic)
class QuestionBankTopicAdmin(admin.ModelAdmin):
    """Admin interface for QuestionBankTopic model"""
    
    list_display = ['title', 'chapter', 'product', 'order', 'questions_count', 'created_by', 'created_at']
    list_filter = ['chapter', 'chapter__product', 'created_by', 'created_at']
    search_fields = ['title', 'description', 'chapter__title', 'chapter__product__title']
    readonly_fields = ['created_at', 'updated_at', 'questions_count']
    ordering = ['chapter', 'order', 'title']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'chapter', 'order', 'created_by')
        }),
        ('Statistics', {
            'fields': ('questions_count',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def product(self, obj):
        return obj.chapter.product.title if obj.chapter else '-'
    product.short_description = 'Product'


@admin.register(FlashcardChapter)
class FlashcardChapterAdmin(admin.ModelAdmin):
    """Admin interface for FlashcardChapter model"""
    
    list_display = ['title', 'product', 'order', 'topics_count', 'flashcards_count', 'created_by', 'created_at']
    list_filter = ['product', 'created_by', 'created_at']
    search_fields = ['title', 'description', 'product__title']
    readonly_fields = ['created_at', 'updated_at', 'topics_count', 'flashcards_count']
    ordering = ['product', 'order', 'title']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'product', 'order', 'created_by')
        }),
        ('Statistics', {
            'fields': ('topics_count', 'flashcards_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(FlashcardTopic)
class FlashcardTopicAdmin(admin.ModelAdmin):
    """Admin interface for FlashcardTopic model"""
    
    list_display = ['title', 'chapter', 'product', 'order', 'flashcards_count', 'created_by', 'created_at']
    list_filter = ['chapter', 'chapter__product', 'created_by', 'created_at']
    search_fields = ['title', 'description', 'chapter__title', 'chapter__product__title']
    readonly_fields = ['created_at', 'updated_at', 'flashcards_count']
    ordering = ['chapter', 'order', 'title']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'chapter', 'order', 'created_by')
        }),
        ('Statistics', {
            'fields': ('flashcards_count',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def product(self, obj):
        return obj.chapter.product.title if obj.chapter else '-'
    product.short_description = 'Product'


# Question Bank Product Admin
@admin.register(QuestionBankProduct)
class QuestionBankProductAdmin(admin.ModelAdmin):
    """Admin interface for QuestionBankProduct model"""
    
    list_display = [
        'title', 'course', 'price', 'is_free', 'status', 
        'chapters_count', 'questions_count', 'total_enrollments', 'created_by', 'created_at'
    ]
    list_filter = ['status', 'is_free', 'course', 'created_by', 'created_at']
    search_fields = ['title', 'description', 'course__title']
    readonly_fields = ['created_at', 'updated_at', 'chapters_count', 'questions_count', 'total_enrollments']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'course', 'status', 'created_by')
        }),
        ('Pricing', {
            'fields': ('price', 'is_free')
        }),
        ('Product Details', {
            'fields': ('image', 'tags')
        }),
        ('Statistics', {
            'fields': ('chapters_count', 'questions_count', 'total_enrollments'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(QuestionBankProductEnrollment)
class QuestionBankProductEnrollmentAdmin(admin.ModelAdmin):
    """Admin interface for QuestionBankProductEnrollment model"""
    
    list_display = ['student', 'product', 'enrollment_date', 'status', 'progress', 'is_paid']
    list_filter = ['status', 'is_paid', 'enrollment_date', 'product']
    search_fields = ['student__username', 'student__email', 'product__title']
    readonly_fields = ['enrollment_date', 'last_accessed']
    date_hierarchy = 'enrollment_date'
    
    fieldsets = (
        ('Enrollment Info', {
            'fields': ('student', 'product', 'status', 'enrollment_date')
        }),
        ('Progress', {
            'fields': ('progress', 'completion_date', 'last_accessed')
        }),
        ('Payment', {
            'fields': ('is_paid', 'payment_amount', 'payment_date', 'transaction_id')
        })
    )
    
    class Media:
        js = ('admin/js/admin.js',)
        css = {
            'all': ('admin/css/admin.css',)
        }


# Flashcard Product Admin
@admin.register(FlashcardProduct)
class FlashcardProductAdmin(admin.ModelAdmin):
    """Admin interface for FlashcardProduct model"""
    
    list_display = [
        'title', 'course', 'price', 'is_free', 'status', 
        'chapters_count', 'flashcards_count', 'total_enrollments', 'created_by', 'created_at'
    ]
    list_filter = ['status', 'is_free', 'course', 'created_by', 'created_at']
    search_fields = ['title', 'description', 'course__title']
    readonly_fields = ['created_at', 'updated_at', 'chapters_count', 'flashcards_count', 'total_enrollments']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'course', 'status', 'created_by')
        }),
        ('Pricing', {
            'fields': ('price', 'is_free')
        }),
        ('Product Details', {
            'fields': ('image', 'tags')
        }),
        ('Statistics', {
            'fields': ('chapters_count', 'flashcards_count', 'total_enrollments'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(FlashcardProductEnrollment)
class FlashcardProductEnrollmentAdmin(admin.ModelAdmin):
    """Admin interface for FlashcardProductEnrollment model"""
    
    list_display = ['student', 'product', 'enrollment_date', 'status', 'progress', 'is_paid']
    list_filter = ['status', 'is_paid', 'enrollment_date', 'product']
    search_fields = ['student__username', 'student__email', 'product__title']
    readonly_fields = ['enrollment_date', 'last_accessed']
    date_hierarchy = 'enrollment_date'
    
    fieldsets = (
        ('Enrollment Info', {
            'fields': ('student', 'product', 'status', 'enrollment_date')
        }),
        ('Progress', {
            'fields': ('progress', 'completion_date', 'last_accessed')
        }),
        ('Payment', {
            'fields': ('is_paid', 'payment_amount', 'payment_date', 'transaction_id')
        })
    )
    
    class Media:
        js = ('admin/js/admin.js',)
        css = {
            'all': ('admin/css/admin.css',)
        }


# Customize admin site headers
admin.site.site_header = "LMS Assessment System"
admin.site.site_title = "Assessment Admin"
admin.site.index_title = "Assessment Management"