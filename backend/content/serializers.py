from rest_framework import serializers
from django.db.models import Count, Avg, Sum, Max
from django.db import models
from django.utils import timezone
from courses.models import Course, Enrollment
from content.models import Module, UserProgress, ModuleProgress, Lesson, LessonResource
from users.models import User


class ModuleProgressSerializer(serializers.ModelSerializer):
    """
    Serializer for tracking module progress
    """
    module_title = serializers.CharField(source='module.title', read_only=True)
    course_title = serializers.CharField(source='module.course.title', read_only=True)
    total_lessons = serializers.SerializerMethodField()
    completed_lessons = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = ModuleProgress
        fields = [
            'id', 'user', 'module', 'module_title', 'course_title',
            'is_completed', 'completed_at', 'last_accessed', 'started_at',
            'total_lessons', 'completed_lessons', 'progress_percentage'
        ]
        read_only_fields = [
            'id', 'user', 'module_title', 'course_title', 'completed_at',
            'last_accessed', 'started_at', 'total_lessons', 'completed_lessons',
            'progress_percentage'
        ]
    
    def get_total_lessons(self, obj):
        """Get total number of lessons in the module"""
        return obj.module.lessons.count()
    
    def get_completed_lessons(self, obj):
        """Get number of completed lessons in the module"""
        return obj.module.lessons.filter(
            userprogress__user_id=obj.user.id,
            userprogress__is_completed=True
        ).count()
    
    def get_progress_percentage(self, obj):
        """Calculate progress percentage"""
        try:
            # Use the model's method if available
            if hasattr(obj, 'get_completion_percentage'):
                return obj.get_completion_percentage()
            
            # Fallback calculation based on module components
            total_components = 4  # video, pdf, notes, quiz
            if total_components == 0:
                return 0
                
            completed_components = sum([
                obj.video_watched,
                obj.pdf_viewed,
                obj.notes_read,
                obj.quiz_completed
            ])
            
            return int((completed_components / total_components) * 100)
        except Exception as e:
            print(f"Error calculating progress percentage: {e}")
            return 0


class ModuleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new module"""
    video = serializers.FileField(required=False, allow_null=True)
    pdf = serializers.FileField(required=False, allow_null=True)
    
    class Meta:
        model = Module
        fields = [
            'id', 'name', 'course', 'submodule', 'description', 'video',
            'video_duration', 'pdf', 'note', 'status', 'is_active', 'order',
            'bunny_video_id', 'bunny_video_url'
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        # Auto-assign order if not provided or conflicts
        if 'order' not in validated_data or validated_data.get('order') in [None, 0]:
            course = validated_data['course']
            max_order = Module.objects.filter(course=course).aggregate(
                max_order=models.Max('order')
            )['max_order'] or 0
            validated_data['order'] = max_order + 1
        
        return super().create(validated_data)

    def validate(self, data):
        # Auto-assign order if not provided or if it conflicts
        if 'order' in data and 'course' in data:
            if Module.objects.filter(course=data['course'], order=data['order']).exists():
                # Find the next available order
                max_order = Module.objects.filter(course=data['course']).aggregate(
                    max_order=models.Max('order')
                )['max_order'] or 0
                data['order'] = max_order + 1
        
        # Validate submodule belongs to the same course
        if data.get('submodule') and data.get('course'):
            if data['submodule'].course != data['course']:
                raise serializers.ValidationError({
                    'submodule': 'Submodule must belong to the same course'
                })
        
        return data


class ModuleBasicSerializer(serializers.ModelSerializer):
    """Basic serializer for Module model"""
    course_name = serializers.CharField(source='course.title', read_only=True)
    submodule_name = serializers.CharField(source='submodule.name', read_only=True)
    is_submodule = serializers.BooleanField(read_only=True)
    submodules_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Module
        fields = [
            'id', 'name', 'description', 'course', 'course_name', 'submodule', 'submodule_name',
            'order', 'is_active', 'created_at', 'video_duration', 'is_submodule', 'submodules_count'
        ]
        read_only_fields = ['id', 'created_at', 'course_name', 'submodule_name', 'is_submodule', 'submodules_count']


class ModuleDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Module model with user progress"""
    course_name = serializers.CharField(source='course.title', read_only=True)
    submodule_name = serializers.CharField(source='submodule.name', read_only=True)
    is_submodule = serializers.BooleanField(read_only=True)
    submodules_count = serializers.IntegerField(read_only=True)
    submodules = serializers.SerializerMethodField()
    user_progress = serializers.SerializerMethodField()
    lessons = serializers.SerializerMethodField()
    # Expose file fields so edit form can load/show existing uploads and allow updating
    video = serializers.FileField(use_url=True, required=False, allow_null=True)
    pdf = serializers.FileField(use_url=True, required=False, allow_null=True)
    
    class Meta:
        model = Module
        fields = [
            'id', 'name', 'description', 'course', 'course_name', 'submodule', 'submodule_name',
            'order', 'status', 'is_active', 'created_at', 'updated_at', 'user_progress',
            'lessons', 'video_duration', 'video', 'pdf', 'bunny_video_id', 'bunny_video_url',
            'is_submodule', 'submodules_count', 'submodules'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'submodule_name', 'is_submodule', 'submodules_count', 'submodules']

    def update(self, instance, validated_data):
        """
        Allow partial update without re-triggering file size validators when files are unchanged.
        If 'video' or 'pdf' are absent in validated_data, they won't be revalidated.
        """
        updating_video = 'video' in validated_data
        updating_pdf = 'pdf' in validated_data

        # Apply basic field updates
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # If neither file is being updated, skip heavy validation
        if not updating_video and not updating_pdf:
            instance._skip_file_validation = True
        try:
            instance.save()
        finally:
            if hasattr(instance, '_skip_file_validation'):
                delattr(instance, '_skip_file_validation')
        return instance
    
    def get_user_progress(self, obj):
        request = self.context.get('request')
        if not request or not hasattr(request, 'user'):
            return None
            
        user = request.user
        if not hasattr(user, 'is_authenticated') or not user.is_authenticated or user.is_anonymous:
            return None
            
        try:
            progress = ModuleProgress.objects.get(
                user_id=user.id,
                module=obj
            )
            # Calculate progress percentage based on completed components
            total_components = 4  # video, pdf, notes, quiz
            completed_components = sum([
                progress.video_watched,
                progress.pdf_viewed,
                progress.notes_read,
                progress.quiz_completed
            ])
            progress_percentage = (completed_components / total_components) * 100 if total_components > 0 else 0
            
            return {
                'is_completed': progress.is_completed,
                'completed_at': progress.completed_at,
                'progress_percentage': round(progress_percentage, 2),
                'video_watched': progress.video_watched,
                'pdf_viewed': progress.pdf_viewed,
                'notes_read': progress.notes_read,
                'quiz_completed': progress.quiz_completed,
                'video_progress': progress.video_progress,
                'quiz_score': progress.quiz_score,
                'status': progress.status
            }
        except ModuleProgress.DoesNotExist:
            pass
        return None
    
    def get_lessons(self, obj):
        lessons = obj.lessons.all().order_by('order')
        return LessonSerializer(lessons, many=True, context=self.context).data
    
    def get_submodules(self, obj):
        submodules = obj.submodules.all().order_by('order')
        return ModuleBasicSerializer(submodules, many=True, context=self.context).data


class LessonBasicSerializer(serializers.ModelSerializer):
    """Basic serializer for Lesson model"""
    module_title = serializers.CharField(source='module.title', read_only=True)
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'description', 'module', 'module_title',
            'order', 'is_active', 'created_at', 'duration_minutes'
        ]
        read_only_fields = ['id', 'created_at']


class LessonSerializer(serializers.ModelSerializer):
    """Serializer used for embedding lessons inside ModuleDetailSerializer"""
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'lesson_type', 'duration_minutes', 'order',
            'content', 'is_free', 'video_url', 'bunny_video_id', 'bunny_video_url',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LessonDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Lesson model with content and progress"""
    module_title = serializers.CharField(source='module.title', read_only=True)
    course_id = serializers.IntegerField(source='module.course_id', read_only=True)
    course_title = serializers.CharField(source='module.course.title', read_only=True)
    user_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'description', 'module', 'module_title', 'order',
            'is_active', 'created_at', 'updated_at', 'duration_minutes',
            'video_url', 'bunny_video_id', 'bunny_video_url', 'content', 'resources', 'course_id',
            'course_title', 'user_progress'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_user_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                progress = ModuleProgress.objects.get(
                    user_id=request.user.id,
                    module=obj.module
                )
                return {
                    'is_completed': progress.is_completed,
                    'video_watched': progress.video_watched,
                    'pdf_viewed': progress.pdf_viewed,
                    'notes_read': progress.notes_read,
                    'quiz_completed': progress.quiz_completed
                }
            except ModuleProgress.DoesNotExist:
                pass
        return None


class LessonCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating lessons"""
    class Meta:
        model = Lesson
        fields = [
            'id', 'module', 'title', 'description', 'lesson_type', 'difficulty',
            'duration_minutes', 'order', 'is_active', 'is_free', 'video_url', 
            'bunny_video_id', 'bunny_video_url', 'content'
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        # Ensure slug uniqueness per module is handled by model constraint; we can add extra checks if needed
        return attrs

    def create(self, validated_data):
        # Auto-assign order if not provided
        if 'order' not in validated_data or validated_data.get('order') in [None, 0]:
            module = validated_data['module']
            max_order = module.lessons.aggregate(max_o=Max('order')).get('max_o') or 0
            validated_data['order'] = max_order + 1
        
        # Set default values for optional fields
        if 'description' not in validated_data or validated_data['description'] is None:
            validated_data['description'] = ""
        if 'is_active' not in validated_data:
            validated_data['is_active'] = True
        if 'is_free' not in validated_data:
            validated_data['is_free'] = False
        if 'difficulty' not in validated_data:
            validated_data['difficulty'] = 'beginner'
        
        return super().create(validated_data)


class LessonResourceSerializer(serializers.ModelSerializer):
    """Serializer for lesson resources (file or URL)"""
    class Meta:
        model = LessonResource
        fields = [
            'id', 'lesson', 'title', 'description', 'resource_type', 'file', 'url',
            'is_public', 'order', 'created_at', 'updated_at', 'metadata'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'lesson': {'required': True},
            'title': {'required': True},
            'resource_type': {'required': True},
            'description': {'required': False, 'allow_blank': True},
            'file': {'required': False},
            'url': {'required': False},
            'is_public': {'required': False},
            'order': {'required': False},
            'metadata': {'required': False}
        }

    def validate(self, attrs):
        # Set default values for optional fields
        if 'metadata' not in attrs or attrs['metadata'] is None:
            attrs['metadata'] = {}
        if 'description' not in attrs or attrs['description'] is None:
            attrs['description'] = ""
        if 'is_public' not in attrs:
            attrs['is_public'] = True
        if 'order' not in attrs:
            attrs['order'] = 0
        
        # Convert string values to appropriate types
        if 'is_public' in attrs and isinstance(attrs['is_public'], str):
            attrs['is_public'] = attrs['is_public'].lower() in ['true', '1', 'yes']
        if 'order' in attrs and isinstance(attrs['order'], str):
            try:
                attrs['order'] = int(attrs['order'])
            except ValueError:
                attrs['order'] = 0
        
        file = attrs.get('file') or getattr(self.instance, 'file', None)
        url = attrs.get('url') or getattr(self.instance, 'url', None)
        
        if not file and not url:
            raise serializers.ValidationError('Either a file or URL must be provided')
        if file and url:
            raise serializers.ValidationError('Cannot have both file and URL')
        
        return attrs

    def create(self, validated_data):
        # Set default values if not provided
        if 'metadata' not in validated_data or validated_data['metadata'] is None:
            validated_data['metadata'] = {}
        if 'description' not in validated_data or validated_data['description'] is None:
            validated_data['description'] = ""
        if 'is_public' not in validated_data:
            validated_data['is_public'] = True
        if 'order' not in validated_data:
            validated_data['order'] = 0
        
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Set default values if not provided
        if 'metadata' not in validated_data or validated_data['metadata'] is None:
            validated_data['metadata'] = {}
        if 'description' not in validated_data or validated_data['description'] is None:
            validated_data['description'] = ""
        
        return super().update(instance, validated_data)


class UserProgressSerializer(serializers.ModelSerializer):
    """Serializer for user progress tracking"""
    course_title = serializers.CharField(source='course.title', read_only=True)
    module_title = serializers.CharField(source='module.title', read_only=True)
    
    class Meta:
        model = UserProgress
        fields = [
            'id', 'user', 'course', 'course_title', 'module', 'module_title',
            'video_watched', 'pdf_viewed', 'notes_read', 'quiz_completed',
            'is_completed', 'completed_at', 'created_at', 'updated_at',
            'progress_percentage'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'progress_percentage']


class ProgressUpdateSerializer(serializers.Serializer):
    """Serializer for updating user progress"""
    content_type = serializers.ChoiceField(
        choices=['video', 'pdf', 'notes', 'quiz'],
        required=True
    )
    completed = serializers.BooleanField(default=True)
    
    def validate_content_type(self, value):
        valid_types = ['video', 'pdf', 'notes', 'quiz']
        if value not in valid_types:
            raise serializers.ValidationError(
                f"Content type must be one of {', '.join(valid_types)}"
            )
        return value
    
    def save(self, user, module):
        content_type = self.validated_data['content_type']
        completed = self.validated_data['completed']
        
        # Get or create user progress for this module
        progress, created = ModuleProgress.objects.get_or_create(
            user=user,
            module=module,
            defaults={
                'video_watched': False,
                'pdf_viewed': False,
                'notes_read': False,
                'quiz_completed': False
            }
        )
        
        # Update the appropriate field
        if content_type == 'video':
            progress.video_watched = completed
        elif content_type == 'pdf':
            progress.pdf_viewed = completed
        elif content_type == 'notes':
            progress.notes_read = completed
        elif content_type == 'quiz':
            progress.quiz_completed = completed
        
        # Update completion status
        progress.update_completion_status()
        progress.save()
        
        # Update course enrollment progress
        self.update_course_progress(user, module.course)
        
        return progress
    
    def update_course_progress(self, user, course):
        """Update the overall course progress"""
        from .models import ModuleProgress
        
        # Get all modules for the course
        modules = course.modules.all()
        total_modules = modules.count()
        
        if total_modules == 0:
            return 0
        
        # Get user's progress for all modules in this course
        completed_modules = ModuleProgress.objects.filter(
            user=user,
            module__in=modules,
            is_completed=True
        ).count()
        
        # Calculate progress percentage
        progress_percentage = int((completed_modules / total_modules) * 100)
        
        # Update course enrollment progress
        enrollment = course.enrollments.filter(student=user).first()
        if enrollment:
            enrollment.progress = progress_percentage
            if progress_percentage >= 100:
                enrollment.status = 'completed'
                enrollment.completion_date = timezone.now()
            enrollment.save()
        
        return progress_percentage


class ModuleSearchSerializer(serializers.ModelSerializer):
    """Serializer for module search results"""
    course_title = serializers.CharField(source='course.title', read_only=True)
    content_type = serializers.SerializerMethodField()
    
    class Meta:
        model = Module
        fields = [
            'id', 'title', 'description', 'course', 'course_title',
            'created_at', 'updated_at', 'content_type'
        ]
        read_only_fields = ['content_type']
    
    def get_content_type(self, obj):
        return 'module'


class LessonSearchSerializer(serializers.ModelSerializer):
    """Serializer for lesson search results"""
    module_title = serializers.CharField(source='module.title', read_only=True)
    course_title = serializers.CharField(source='module.course.title', read_only=True)
    content_type = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'description', 'content', 'module', 'module_title',
            'course_title', 'created_at', 'updated_at', 'content_type'
        ]
        read_only_fields = ['content_type']
    
    def get_content_type(self, obj):
        return 'lesson'


class ResourceSearchSerializer(serializers.ModelSerializer):
    """Serializer for resource search results"""
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    module_title = serializers.CharField(source='lesson.module.title', read_only=True)
    course_title = serializers.CharField(source='lesson.module.course.title', read_only=True)
    content_type = serializers.SerializerMethodField()
    
    class Meta:
        model = LessonResource
        fields = [
            'id', 'title', 'description', 'file', 'url', 'lesson', 'lesson_title',
            'module_title', 'course_title', 'created_at', 'updated_at', 'content_type'
        ]
        read_only_fields = ['content_type']
    
    def get_content_type(self, obj):
        return 'resource'
