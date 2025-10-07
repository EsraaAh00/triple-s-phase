from rest_framework import serializers
from .models import ModuleProgress, UserProgress, Lesson

class LessonCompletionSerializer(serializers.Serializer):
    """Serializer for marking a lesson as completed"""
    lesson_id = serializers.IntegerField(required=True)

class ContentTrackingSerializer(serializers.Serializer):
    """Serializer for tracking content progress"""
    lesson_id = serializers.IntegerField(required=True)
    video_progress = serializers.FloatField(required=False, min_value=0, max_value=100)
    is_completed = serializers.BooleanField(required=False, default=False)

class ModuleProgressSerializer(serializers.ModelSerializer):
    """Serializer for module progress"""
    module_title = serializers.CharField(source='module.name', read_only=True)
    total_lessons = serializers.SerializerMethodField()
    completed_lessons = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = ModuleProgress
        fields = [
            'id', 'module', 'module_title', 'status', 'is_completed',
            'video_watched', 'video_progress', 'pdf_viewed', 'quiz_completed',
            'quiz_score', 'total_lessons', 'completed_lessons', 'progress_percentage',
            'started_at', 'completed_at', 'last_accessed'
        ]
        read_only_fields = ['id', 'started_at', 'completed_at', 'last_accessed']

    def get_total_lessons(self, obj):
        return obj.module.lessons.count()

    def get_completed_lessons(self, obj):
        # This assumes you have a way to track completed lessons
        # You might need to adjust this based on your actual implementation
        return obj.module.lessons.filter(completions__user=obj.user).count()

    def get_progress_percentage(self, obj):
        return obj.get_completion_percentage()

class UserProgressSerializer(serializers.ModelSerializer):
    """Serializer for user progress in a course"""
    course_title = serializers.CharField(source='course.title', read_only=True)
    total_modules = serializers.SerializerMethodField()
    completed_modules = serializers.SerializerMethodField()
    next_lesson = serializers.SerializerMethodField()

    class Meta:
        model = UserProgress
        fields = [
            'id', 'course', 'course_title', 'status', 'overall_progress',
            'time_spent_minutes', 'total_modules', 'completed_modules',
            'next_lesson', 'enrolled_at', 'started_at', 'completed_at',
            'last_accessed'
        ]
        read_only_fields = [
            'id', 'status', 'overall_progress', 'enrolled_at',
            'started_at', 'completed_at', 'last_accessed'
        ]

    def get_total_modules(self, obj):
        return obj.course.modules.count()

    def get_completed_modules(self, obj):
        return ModuleProgress.objects.filter(
            user=obj.user,
            module__course=obj.course,
            is_completed=True
        ).count()

    def get_next_lesson(self, obj):
        # Find the next lesson the user should complete
        last_completed = obj.last_lesson_completed
        if not last_completed:
            # If no lessons completed yet, return first lesson of first module
            first_module = obj.course.modules.first()
            if first_module:
                return first_module.lessons.first().id if first_module.lessons.exists() else None
            return None
        
        # Find next lesson in the same module
        next_lesson = last_completed.module.lessons.filter(
            order__gt=last_completed.order
        ).order_by('order').first()
        
        if next_lesson:
            return next_lesson.id
        
        # If no more lessons in this module, find first lesson in next module
        next_module = obj.course.modules.filter(
            order__gt=last_completed.module.order
        ).order_by('order').first()
        
        if next_module and next_module.lessons.exists():
            return next_module.lessons.order_by('order').first().id
        
        return None
