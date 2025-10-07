from rest_framework import serializers
from .models import Module, Lesson, LessonResource

class ModuleSearchSerializer(serializers.ModelSerializer):
    """Serializer for module search results"""
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_slug = serializers.CharField(source='course.slug', read_only=True)
    total_lessons = serializers.SerializerMethodField()
    
    class Meta:
        model = Module
        fields = [
            'id', 'name', 'description', 'course', 'course_title', 'course_slug',
            'order', 'is_active', 'total_lessons', 'created_at', 'updated_at'
        ]
    
    def get_total_lessons(self, obj):
        return obj.lessons.count()

class LessonSearchSerializer(serializers.ModelSerializer):
    """Serializer for lesson search results"""
    module_name = serializers.CharField(source='module.name', read_only=True)
    course_title = serializers.CharField(source='module.course.title', read_only=True)
    course_slug = serializers.CharField(source='module.course.slug', read_only=True)
    resource_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'description', 'content', 'module', 'module_name',
            'course_title', 'course_slug', 'lesson_type', 'difficulty',
            'duration_minutes', 'order', 'is_active', 'is_free', 'resource_count',
            'created_at', 'updated_at'
        ]
    
    def get_resource_count(self, obj):
        return obj.resources.count()

class ResourceSearchSerializer(serializers.ModelSerializer):
    """Serializer for resource search results"""
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    module_name = serializers.CharField(source='lesson.module.name', read_only=True)
    course_title = serializers.CharField(source='lesson.module.course.title', read_only=True)
    course_slug = serializers.CharField(source='lesson.module.course.slug', read_only=True)
    file_url = serializers.SerializerMethodField()
    file_type = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()
    
    class Meta:
        model = LessonResource
        fields = [
            'id', 'title', 'description', 'resource_type', 'lesson', 'lesson_title',
            'module_name', 'course_title', 'course_slug', 'file', 'file_url',
            'file_type', 'file_size', 'url', 'is_public', 'order', 'created_at',
            'updated_at'
        ]
    
    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None
    
    def get_file_type(self, obj):
        if obj.file:
            return obj.file.name.split('.')[-1].lower()
        return None
    
    def get_file_size(self, obj):
        if obj.file:
            return obj.file.size
        return None
