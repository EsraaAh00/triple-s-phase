from django.db import models
from django.db.models import Max
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.validators import MinValueValidator, MaxValueValidator, FileExtensionValidator
from django.conf import settings
from django.utils.text import slugify
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.urls import reverse
import os
from urllib.parse import urlparse

User = get_user_model()

def validate_file_size(value):
    """Validate that file size is not larger than configured MAX_MODULE_FILE_MB"""
    max_mb = getattr(settings, 'MAX_MODULE_FILE_MB', 100)
    if value.size > max_mb * 1024 * 1024:
        raise ValidationError(_(f'The maximum file size that can be uploaded is {max_mb}MB'))


def module_video_upload_path(instance, filename):
    """Generate upload path for module videos"""
    return f'courses/{instance.course.id}/modules/{instance.id}/videos/{filename}'

def module_pdf_upload_path(instance, filename):
    """Generate upload path for module PDFs"""
    return f'courses/{instance.course.id}/modules/{instance.id}/pdfs/{filename}'


class Module(models.Model):
    """
    Represents a learning module within a course.
    Each module can contain multiple lessons and resources.
    """
    class ModuleStatus(models.TextChoices):
        DRAFT = 'draft', _('Draft')
        PUBLISHED = 'published', _('Published')
        ARCHIVED = 'archived', _('Archived')

    name = models.CharField(
        _('module name'),
        max_length=2000,
        help_text=_('Name of the module')
    )
    course = models.ForeignKey(
        'courses.Course',
        on_delete=models.CASCADE,
        related_name='modules',
        verbose_name=_('course')
    )
    submodule = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        related_name='submodules',
        null=True,
        blank=True,
        verbose_name=_('submodule'),
        help_text=_('Parent module if this is a submodule (optional)')
    )
    description = models.TextField(
        _('description'),
        blank=True,
        null=True,
        help_text=_('Detailed description of the module')
    )
    video = models.FileField(
        _('video file'),
        upload_to=module_video_upload_path,
        null=True,
        blank=True,
        validators=[
            FileExtensionValidator(allowed_extensions=['mp4', 'webm', 'mov']),
            validate_file_size
        ],
        help_text=_('Upload a video file (max 100MB, MP4/WebM/MOV)')
    )
    video_duration = models.PositiveIntegerField(
        _('video duration in seconds'),
        default=0,
        help_text=_('Duration of the video in seconds')
    )
    # Bunny CDN integration fields
    bunny_video_id = models.CharField(
        _('Bunny video ID'),
        max_length=100,
        blank=True,
        null=True,
        help_text=_('Bunny CDN video ID for external video hosting')
    )
    bunny_video_url = models.URLField(
        _('Bunny video URL'),
        blank=True,
        null=True,
        help_text=_('Direct URL to the video on Bunny CDN')
    )
    pdf = models.FileField(
        _('PDF file'),
        upload_to=module_pdf_upload_path,
        null=True,
        blank=True,
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf']),
            validate_file_size
        ],
        help_text=_('Upload a PDF file (max 100MB)')
    )
    note = models.TextField(
        _('instructor notes'),
        blank=True,
        null=True,
        help_text=_('Private notes for instructors')
    )
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=ModuleStatus.choices,
        default=ModuleStatus.DRAFT,
        help_text=_('Publication status of the module')
    )
    is_active = models.BooleanField(
        _('is active'),
        default=True,
        help_text=_('Designates whether this module should be treated as active')
    )
    order = models.PositiveIntegerField(
        _('order'),
        default=0,
        help_text=_('The order in which the module appears in the course')
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    published_at = models.DateTimeField(_('published at'), null=True, blank=True)
    prerequisites = models.ManyToManyField(
        'self',
        symmetrical=False,
        blank=True,
        related_name='is_prerequisite_for',
        help_text=_('Modules that must be completed before this one')
    )

    class Meta:
        verbose_name = _('module')
        verbose_name_plural = _('modules')
        ordering = ['order', 'created_at']
        unique_together = ('course', 'order')
        indexes = [
            models.Index(fields=['course', 'order']),
            models.Index(fields=['status']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.course.title} - {self.name}" if self.name else f"Module {self.id} - {self.course.title}"
        
    def clean(self):
        """Custom validation for the model"""
        if self.status == self.ModuleStatus.PUBLISHED and not self.published_at:
            self.published_at = timezone.now()
        
        if self.status == self.ModuleStatus.PUBLISHED and not self.is_active:
            raise ValidationError({
                'is_active': _('A published module must be active')
            })
        
        # Validate submodule belongs to the same course
        if self.submodule and self.submodule.course != self.course:
            raise ValidationError({
                'submodule': _('Submodule must belong to the same course')
            })
        
        # Prevent circular references
        if self.submodule and self.submodule == self:
            raise ValidationError({
                'submodule': _('A module cannot be its own submodule')
            })
    
    def save(self, *args, **kwargs):
        """Override save to ensure clean is called and order is auto-assigned.
        Skips heavy file validators for existing files when not updating file fields.
        """
        # Auto-assign order if not provided or conflicts
        if not self.order or self.order == 0:
            max_order = Module.objects.filter(course=self.course).aggregate(
                max_order=models.Max('order')
            )['max_order'] or 0
            self.order = max_order + 1
        elif Module.objects.filter(course=self.course, order=self.order).exclude(pk=self.pk).exists():
            # If order conflicts, find next available
            max_order = Module.objects.filter(course=self.course).aggregate(
                max_order=models.Max('order')
            )['max_order'] or 0
            self.order = max_order + 1
            
        skip_file_validation = kwargs.pop('skip_file_validation', False) or getattr(self, '_skip_file_validation', False)
        if skip_file_validation:
            # Only run model-level clean; avoid field validators (e.g., file size) for unchanged files
            self.clean()
        else:
            self.full_clean()
        super().save(*args, **kwargs)
        
        # Update course's updated_at timestamp
        from django.utils import timezone
        self.course.updated_at = timezone.now()
        self.course.save(update_fields=['updated_at'])
    
    def get_absolute_url(self):
        """Get URL for this module"""
        from django.urls import reverse
        return reverse('module-detail', kwargs={'pk': self.id})
    
    @property
    def total_duration(self):
        """Calculate total duration of all lessons in this module"""
        return self.lessons.aggregate(
            total=models.Sum('duration_minutes')
        )['total'] or 0
    
    @property
    def is_submodule(self):
        """Check if this module is a submodule"""
        return self.submodule is not None
    
    @property
    def parent_module(self):
        """Get the parent module if this is a submodule"""
        return self.submodule
    
    @property
    def submodules_count(self):
        """Get count of submodules"""
        return self.submodules.count()
    
    def get_all_submodules(self):
        """Get all submodules recursively"""
        submodules = list(self.submodules.all())
        for submodule in submodules:
            submodules.extend(submodule.get_all_submodules())
        return submodules
    
    @property
    def has_bunny_video(self):
        """Check if this module has a Bunny CDN video"""
        return bool(self.bunny_video_id)
    
    @property
    def video_source(self):
        """Get the video source type"""
        if self.has_bunny_video:
            return 'bunny'
        elif self.video:
            return 'uploaded'
        return None
    
    def get_video_url(self):
        """Get the appropriate video URL based on available sources"""
        if self.has_bunny_video:
            # Generate embed URL from video ID
            from content.bunny_utils import get_bunny_embed_url
            return get_bunny_embed_url(self.bunny_video_id)
        elif self.video:
            return self.video.url
        return None


class Lesson(models.Model):
    """
    Represents a single lesson within a module.
    Lessons are the primary content units that students interact with.
    """
    class LessonType(models.TextChoices):
        VIDEO = 'video', _('Video')
        ARTICLE = 'article', _('Article')
        
    class DifficultyLevel(models.TextChoices):
        BEGINNER = 'beginner', _('Beginner')
        INTERMEDIATE = 'intermediate', _('Intermediate')
        ADVANCED = 'advanced', _('Advanced')

    title = models.CharField(
        _('title'),
        max_length=200,
        help_text=_('Title of the lesson')
    )
    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name='lessons',
        verbose_name=_('module')
    )
    slug = models.SlugField(
        _('slug'),
        max_length=250,
        blank=True,
        help_text=_('A short label containing only letters, numbers, underscores or hyphens for URLs')
    )
    description = models.TextField(
        _('description'),
        blank=True,
        null=True,
        help_text=_('Brief description of the lesson')
    )
    content = models.TextField(
        _('content'),
        blank=True,
        null=True,
        help_text=_('Main content of the lesson (HTML/Text)')
    )
    lesson_type = models.CharField(
        _('lesson type'),
        max_length=20,
        choices=LessonType.choices,
        default=LessonType.ARTICLE,
        help_text=_('Type of the lesson')
    )
    difficulty = models.CharField(
        _('difficulty level'),
        max_length=20,
        choices=DifficultyLevel.choices,
        default=DifficultyLevel.BEGINNER,
        help_text=_('Difficulty level of the lesson')
    )
    video_url = models.URLField(
        _('video URL'),
        blank=True,
        null=True,
        help_text=_('URL to the video content (if any)')
    )
    # Bunny CDN integration fields
    bunny_video_id = models.CharField(
        _('Bunny video ID'),
        max_length=100,
        blank=True,
        null=True,
        help_text=_('Bunny CDN video ID for external video hosting')
    )
    bunny_video_url = models.URLField(
        _('Bunny video URL'),
        blank=True,
        null=True,
        help_text=_('Direct URL to the video on Bunny CDN')
    )
    duration_minutes = models.PositiveIntegerField(
        _('duration in minutes'),
        default=0,
        validators=[
            MinValueValidator(0, message=_('Duration cannot be negative')),
            MaxValueValidator(1440, message=_('Duration cannot be more than 24 hours'))
        ],
        help_text=_('Estimated time to complete in minutes')
    )
    order = models.PositiveIntegerField(
        _('order'),
        default=0,
        help_text=_('The order in which the lesson appears in the module')
    )
    is_active = models.BooleanField(
        _('is active'),
        default=True,
        help_text=_('Designates whether this lesson should be treated as active')
    )
    is_free = models.BooleanField(
        _('is free'),
        default=False,
        help_text=_('Designates whether this lesson is available for free')
    )
    requires_completion = models.BooleanField(
        _('requires completion'),
        default=True,
        help_text=_('If True, user must complete this lesson to proceed to the next one')
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    published_at = models.DateTimeField(_('published at'), null=True, blank=True)
    resources = models.ManyToManyField(
        'LessonResource',
        blank=True,
        related_name='lessons',
        verbose_name=_('resources'),
        help_text=_('Additional resources for this lesson')
    )

    class Meta:
        verbose_name = _('lesson')
        verbose_name_plural = _('lessons')
        ordering = ['order', 'created_at']
        unique_together = ('module', 'order')
        indexes = [
            models.Index(fields=['module', 'order']),
            models.Index(fields=['is_active']),
            models.Index(fields=['lesson_type']),
            models.Index(fields=['difficulty']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['module', 'slug'],
                name='unique_lesson_slug_per_module'
            )
        ]

    def __str__(self):
        return f"{self.module.course.title} - {self.module.name} - {self.title}" if hasattr(self, 'module') and hasattr(self.module, 'course') and hasattr(self.module.course, 'title') and hasattr(self.module, 'name') else f"Lesson {self.id}"
    
    def clean(self):
        """Custom validation for the model"""
        # Allow video lessons without a direct video_url to support file-based resources
        # Validation of having either a URL or a resource file can be handled at UI/workflow level
        # Remove invalid reference to non-existent 'status' field
    
    def save(self, *args, **kwargs):
        """Override save to ensure clean is called and slug is generated"""
        if not self.slug and self.title:
            self.slug = slugify(self.title)
            # Ensure slug is unique within the module
            original_slug = self.slug
            num = 1
            while Lesson.objects.filter(
                module=self.module,
                slug=self.slug
            ).exclude(pk=self.pk).exists():
                self.slug = f"{original_slug}-{num}"
                num += 1
                
        self.full_clean()
        super().save(*args, **kwargs)
        
        # Update module's updated_at timestamp
        self.module.updated_at = timezone.now()
        self.module.save(update_fields=['updated_at'])
    
    def get_absolute_url(self):
        """Get URL for this lesson"""
        from django.urls import reverse
        return reverse('lesson-detail', kwargs={
            'course_slug': self.module.course.slug,
            'module_slug': self.module.slug,
            'lesson_slug': self.slug
        })
    
    @property
    def next_lesson(self):
        """Get the next lesson in the module, if any"""
        return Lesson.objects.filter(
            module=self.module,
            order__gt=self.order,
            is_active=True
        ).order_by('order').first()
    
    @property
    def previous_lesson(self):
        """Get the previous lesson in the module, if any"""
        return Lesson.objects.filter(
            module=self.module,
            order__lt=self.order,
            is_active=True
        ).order_by('-order').first()
    
    @property
    def has_bunny_video(self):
        """Check if this lesson has a Bunny CDN video"""
        return bool(self.bunny_video_id)
    
    @property
    def video_source(self):
        """Get the video source type"""
        if self.has_bunny_video:
            return 'bunny'
        elif self.video_url:
            return 'external'
        return None
    
    def get_video_url(self):
        """Get the appropriate video URL based on available sources"""
        if self.has_bunny_video:
            # Generate embed URL from video ID
            from content.bunny_utils import get_bunny_embed_url
            return get_bunny_embed_url(self.bunny_video_id)
        elif self.video_url:
            return self.video_url
        return None


class UserProgress(models.Model):
    """
    Tracks a user's overall progress and engagement in a course.
    This includes completion status, time spent, and overall progress percentage.
    """
    class CompletionStatus(models.TextChoices):
        NOT_STARTED = 'not_started', _('Not Started')
        IN_PROGRESS = 'in_progress', _('In Progress')
        COMPLETED = 'completed', _('Completed')
        
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='course_progress',
        verbose_name=_('user')
    )
    course = models.ForeignKey(
        'courses.Course',
        on_delete=models.CASCADE,
        related_name='user_progress',
        verbose_name=_('course')
    )
    enrolled_at = models.DateTimeField(
        _('enrolled at'),
        auto_now_add=True,
        help_text=_('When the user enrolled in the course')
    )
    last_accessed = models.DateTimeField(
        _('last accessed'),
        auto_now=True,
        help_text=_('When the user last accessed the course')
    )
    started_at = models.DateTimeField(
        _('started at'),
        null=True,
        blank=True,
        help_text=_('When the user first accessed the course content')
    )
    completed_at = models.DateTimeField(
        _('completed at'),
        null=True,
        blank=True,
        help_text=_('When the user completed the course')
    )
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=CompletionStatus.choices,
        default=CompletionStatus.NOT_STARTED,
        help_text=_('Current status of the user in this course')
    )
    overall_progress = models.FloatField(
        _('overall progress'),
        default=0,
        validators=[
            MinValueValidator(0, message=_('Progress cannot be negative')),
            MaxValueValidator(100, message=_('Progress cannot exceed 100%'))
        ],
        help_text=_('Overall progress percentage (0-100)')
    )
    time_spent_minutes = models.PositiveIntegerField(
        _('time spent (minutes)'),
        default=0,
        help_text=_('Total time spent on the course in minutes')
    )
    last_lesson_completed = models.ForeignKey(
        'Lesson',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
        verbose_name=_('last lesson completed'),
        help_text=_('The last lesson the user completed')
    )
    notes = models.TextField(
        _('notes'),
        blank=True,
        null=True,
        help_text=_('User notes for this course')
    )

    class Meta:
        verbose_name = _('user progress')
        verbose_name_plural = _('user progress')
        unique_together = ('user', 'course')
        indexes = [
            models.Index(fields=['user', 'course']),
            models.Index(fields=['status']),
            models.Index(fields=['overall_progress']),
        ]
        ordering = ['-last_accessed']

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.email} - {self.course.title} ({self.overall_progress}%)"
    
    def clean(self):
        """Custom validation for the model"""
        if self.overall_progress < 0 or self.overall_progress > 100:
            raise ValidationError({
                'overall_progress': _('Progress must be between 0 and 100')
            })
            
        if self.completed_at and not self.started_at:
            self.started_at = self.completed_at
            
        if self.completed_at and self.status != self.CompletionStatus.COMPLETED:
            self.status = self.CompletionStatus.COMPLETED
    
    def save(self, *args, **kwargs):
        """Override save to ensure clean is called"""
        # Set default values for notes if it is None
        if self.notes is None:
            self.notes = ""
        
        self.full_clean()
        
        # Update status based on progress
        if self.overall_progress >= 100:
            self.status = self.CompletionStatus.COMPLETED
            if not self.completed_at:
                self.completed_at = timezone.now()
        elif self.overall_progress > 0:
            self.status = self.CompletionStatus.IN_PROGRESS
            if not self.started_at:
                self.started_at = timezone.now()
        else:
            self.status = self.CompletionStatus.NOT_STARTED
        
        super().save(*args, **kwargs)
    
    def update_progress(self, commit=True):
        """
        Calculate and update overall progress based on modules and lessons
        
        Args:
            commit (bool): Whether to save the model after updating progress
            
        Returns:
            float: The updated progress percentage
        """
        from django.db.models import Count, Case, When, FloatField
        
        # Calculate progress based on completed modules
        module_progress = ModuleProgress.objects.filter(
            user=self.user,
            module__course=self.course
        ).aggregate(
            total=Count('id'),
            completed=Count(Case(
                When(is_completed=True, then=1),
                output_field=FloatField()
            ))
        )
        
        if module_progress['total'] > 0:
            self.overall_progress = (module_progress['completed'] / module_progress['total']) * 100
        else:
            self.overall_progress = 0
        
        # Update status based on progress
        if self.overall_progress >= 100:
            self.status = self.CompletionStatus.COMPLETED
            if not self.completed_at:
                self.completed_at = timezone.now()
        elif self.overall_progress > 0:
            self.status = self.CompletionStatus.IN_PROGRESS
            if not self.started_at:
                self.started_at = timezone.now()
        else:
            self.status = self.CompletionStatus.NOT_STARTED
        
        if commit:
            self.save(update_fields=[
                'overall_progress', 
                'status', 
                'completed_at', 
                'started_at'
            ])
        
        return self.overall_progress
    
    def add_time_spent(self, minutes):
        """
        Add time spent on the course
        
        Args:
            minutes (int): Number of minutes to add
        """
        if minutes > 0:
            self.time_spent_minutes += minutes
            self.save(update_fields=['time_spent_minutes'])
    
    @classmethod
    def get_or_create_progress(cls, user, course):
        """
        Get or create a UserProgress instance for the given user and course
        
        Args:
            user: The user
            course: The course
            
        Returns:
            tuple: (UserProgress, created)
        """
        return cls.objects.get_or_create(
            user=user,
            course=course,
            defaults={
                'last_accessed': timezone.now(),
                'notes': ""
            }
        )

    def __str__(self):
        return f"{self.user.username}'s progress in {self.course.title}"


def lesson_resource_upload_path(instance, filename):
    """Generate upload path for lesson resources"""
    return f'courses/{instance.lesson.module.course.id}/modules/{instance.lesson.module.id}/lessons/{instance.lesson.id}/resources/{filename}'


class ModuleProgress(models.Model):
    """
    Tracks a user's progress within a specific module.
    Records completion of various module components and calculates overall progress.
    """
    class ProgressStatus(models.TextChoices):
        NOT_STARTED = 'not_started', _('Not Started')
        IN_PROGRESS = 'in_progress', _('In Progress')
        COMPLETED = 'completed', _('Completed')

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='module_progress',
        verbose_name=_('user')
    )
    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name='user_progress',
        verbose_name=_('module')
    )
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=ProgressStatus.choices,
        default=ProgressStatus.NOT_STARTED,
        help_text=_('Current status of the module progress')
    )
    started_at = models.DateTimeField(
        _('started at'),
        auto_now_add=True,
        help_text=_('When the user first accessed this module')
    )
    last_accessed = models.DateTimeField(
        _('last accessed'),
        auto_now=True,
        help_text=_('When the user last accessed this module')
    )
    completed_at = models.DateTimeField(
        _('completed at'),
        null=True,
        blank=True,
        help_text=_('When the user completed this module')
    )
    is_completed = models.BooleanField(
        _('is completed'),
        default=False,
        help_text=_('Whether the user has completed this module')
    )
    video_watched = models.BooleanField(
        _('video watched'),
        default=False,
        help_text=_('Whether the user has watched the module video')
    )
    video_progress = models.FloatField(
        _('video progress'),
        default=0,
        validators=[
            MinValueValidator(0, _('Progress cannot be negative')),
            MaxValueValidator(100, _('Progress cannot exceed 100%'))
        ],
        help_text=_('Percentage of video watched (0-100)')
    )
    video_last_position = models.FloatField(
        _('video last position'),
        default=0,
        help_text=_('Last position in seconds where the user left the video')
    )
    pdf_viewed = models.BooleanField(
        _('PDF viewed'),
        default=False,
        help_text=_('Whether the user has viewed the module PDF')
    )
    pdf_last_page = models.PositiveIntegerField(
        _('PDF last page'),
        default=1,
        help_text=_('Last page number the user viewed in the PDF')
    )
    notes_read = models.BooleanField(
        _('notes read'),
        default=False,
        help_text=_('Whether the user has read the module notes')
    )
    quiz_completed = models.BooleanField(
        _('quiz completed'),
        default=False,
        help_text=_('Whether the user has completed the module quiz')
    )
    quiz_score = models.FloatField(
        _('quiz score'),
        null=True,
        blank=True,
        validators=[
            MinValueValidator(0, _('Score cannot be negative')),
            MaxValueValidator(100, _('Score cannot exceed 100%'))
        ],
        help_text=_('Score achieved on the module quiz (0-100)')
    )
    completion_requirements = models.JSONField(
        _('completion requirements'),
        default=dict,
        blank=True,
        null=True,
        help_text=_('Structured data about completion requirements')
    )
    metadata = models.JSONField(
        _('metadata'),
        default=dict,
        blank=True,
        null=True,
        help_text=_('Additional metadata about the module progress')
    )

    class Meta:
        verbose_name = _('module progress')
        verbose_name_plural = _('module progress')
        unique_together = ('user', 'module')
        indexes = [
            models.Index(fields=['user', 'module']),
            models.Index(fields=['status']),
            models.Index(fields=['is_completed']),
            models.Index(fields=['started_at']),
        ]
        ordering = ['module__order']

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.email} - {self.module.name} ({self.status})"
    
    def clean(self):
        """Custom validation for the model"""
        if self.video_progress < 0 or self.video_progress > 100:
            raise ValidationError({
                'video_progress': _('Video progress must be between 0 and 100')
            })
            
        if self.quiz_score is not None and (self.quiz_score < 0 or self.quiz_score > 100):
            raise ValidationError({
                'quiz_score': _('Quiz score must be between 0 and 100')
            })
            
        if self.completed_at and not self.started_at:
            self.started_at = self.completed_at
    
    def save(self, *args, **kwargs):
        """Override save to ensure clean is called and status is updated"""
        # Set default values for JSON fields if they are None
        if self.completion_requirements is None:
            self.completion_requirements = {}
        if self.metadata is None:
            self.metadata = {}
        
        self.full_clean()
        
        # Update status based on completion
        if self.is_completed:
            self.status = self.ProgressStatus.COMPLETED
            if not self.completed_at:
                self.completed_at = timezone.now()
        elif any([self.video_watched, self.pdf_viewed, self.notes_read, self.quiz_completed]):
            self.status = self.ProgressStatus.IN_PROGRESS
        else:
            self.status = self.ProgressStatus.NOT_STARTED
        
        super().save(*args, **kwargs)
        
        # Update parent UserProgress and Enrollment
        try:
            user_progress = UserProgress.objects.get(
                user=self.user,
                course=self.module.course
            )
            user_progress.update_progress()
            
            # Update enrollment progress as well
            from courses.models import Enrollment
            enrollment = Enrollment.objects.filter(
                student=self.user,
                course=self.module.course
            ).first()
            if enrollment:
                enrollment.update_progress(user_progress.overall_progress)
        except UserProgress.DoesNotExist:
            pass

    def update_completion_status(self, commit=True):
        """
        Update the completion status based on the module's requirements
        
        Args:
            commit (bool): Whether to save the model after updating
            
        Returns:
            bool: Whether the module is now marked as completed
        """
        was_completed = self.is_completed
        
        # Check if all requirements are met
        requirements_met = all([
            self.video_watched,
            self.pdf_viewed,
            self.notes_read,
            self.quiz_completed
        ])
        
        self.is_completed = requirements_met
        
        if self.is_completed and not was_completed:
            self.completed_at = timezone.now()
        elif not self.is_completed:
            self.completed_at = None
        
        if commit:
            self.save(update_fields=[
                'is_completed',
                'completed_at',
                'status'
            ])
        
        return self.is_completed
    
    def mark_video_watched(self, progress=None, last_position=None, commit=True):
        """Mark the video as watched with optional progress tracking"""
        self.video_watched = True
        
        if progress is not None:
            self.video_progress = min(100, max(0, float(progress)))
        if last_position is not None:
            self.video_last_position = float(last_position)
        
        if commit:
            self.save(update_fields=[
                'video_watched',
                'video_progress',
                'video_last_position'
            ])
        
        return self.update_completion_status(commit=commit)

    def mark_pdf_viewed(self):
        """Mark PDF as viewed"""
        self.pdf_viewed = True
        self.save()

    def mark_notes_read(self):
        """Mark notes as read"""
        self.notes_read = True
        self.save()

    def mark_quiz_completed(self, score=None, commit=True):
        """
        Mark quiz as completed with optional score
        
        Args:
            score (float, optional): The score achieved (0-100)
            commit (bool): Whether to save the model
            
        Returns:
            bool: Whether the module is now marked as completed
        """
        self.quiz_completed = True
        if score is not None:
            self.quiz_score = max(0, min(100, float(score)))
            
        if commit:
            self.save(update_fields=[
                'quiz_completed',
                'quiz_score'
            ])
            
        return self.update_completion_status(commit=commit)

    @classmethod
    def get_or_create_progress(cls, user, module):
        """
        Get or create progress for user and module
        
        Args:
            user: The user
            module: The module
            
        Returns:
            tuple: (ModuleProgress, created)
        """
        progress, created = cls.objects.get_or_create(
            user=user,
            module=module,
            defaults={
                'status': cls.ProgressStatus.NOT_STARTED
            }
        )
        return progress, created

    def get_completion_percentage(self):
        """
        Calculate completion percentage for this module based on completed components
        
        Returns:
            float: Completion percentage (0-100)
        """
        total_components = 4  # video, pdf, notes, quiz
        if total_components == 0:
            return 0
            
        completed_components = sum([
            self.video_watched,
            self.pdf_viewed,
            self.notes_read,
            self.quiz_completed
        ])
        
        # If all components are completed, ensure 100% is returned
        if completed_components == total_components:
            return 100.0
            
        return round((completed_components / total_components) * 100, 2)


class LessonResource(models.Model):
    """
    Represents an additional resource for a lesson, such as downloadable files,
    external links, or supplementary materials.
    """
    class ResourceType(models.TextChoices):
        DOCUMENT = 'document', _('Document')
        PRESENTATION = 'presentation', _('Presentation')
        SPREADSHEET = 'spreadsheet', _('Spreadsheet')
        IMAGE = 'image', _('Image')
        AUDIO = 'audio', _('Audio')
        VIDEO = 'video', _('Video')
        LINK = 'link', _('External Link')
        OTHER = 'other', _('Other')
    
    title = models.CharField(
        _('title'),
        max_length=255,
        help_text=_('Name of the resource')
    )
    description = models.TextField(
        _('description'),
        blank=True,
        null=True,
        help_text=_('Brief description of the resource')
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='lesson_resources',
        verbose_name=_('lesson'),
        help_text=_('The lesson this resource belongs to')
    )
    resource_type = models.CharField(
        _('resource type'),
        max_length=20,
        choices=ResourceType.choices,
        default=ResourceType.DOCUMENT,
        help_text=_('Type of the resource')
    )
    file = models.FileField(
        _('file'),
        upload_to=lesson_resource_upload_path,
        null=True,
        blank=True,
        validators=[
            FileExtensionValidator(allowed_extensions=[
                'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx',
                'jpg', 'jpeg', 'png', 'gif', 'mp3', 'mp4', 'mov', 'webm', 'zip', 'rar',
                'txt', 'md', 'csv', 'json', 'yaml', 'html', 'css', 'js', 'py', 'ipynb'
            ]),
            validate_file_size
        ],
        help_text=_('Upload a file for this resource')
    )
    url = models.URLField(
        _('URL'),
        blank=True,
        null=True,
        help_text=_('External URL for the resource (if not uploading a file)')
    )
    is_public = models.BooleanField(
        _('is public'),
        default=True,
        help_text=_('Whether this resource is available to all users')
    )
    order = models.PositiveIntegerField(
        _('order'),
        default=0,
        help_text=_('The order in which the resource appears in the lesson')
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    metadata = models.JSONField(
        _('metadata'),
        default=dict,
        blank=True,
        null=True,
        help_text=_('Additional metadata about the resource')
    )

    class Meta:
        verbose_name = _('lesson resource')
        verbose_name_plural = _('lesson resources')
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['lesson', 'order']),
            models.Index(fields=['resource_type']),
            models.Index(fields=['is_public']),
        ]

    def __str__(self):
        return f"{self.title} ({self.get_resource_type_display()}) - {self.lesson.title}"
    
    def clean(self):
        """Custom validation for the model"""
        if not self.file and not self.url:
            raise ValidationError({
                'file': _('Either a file or URL must be provided')
            })
        
        if self.file and self.url:
            raise ValidationError({
                'file': _('Cannot have both a file and a URL')
            })
    
    def save(self, *args, **kwargs):
        """Override save to ensure default values are set"""
        # Set default values for optional fields if they are None
        if self.metadata is None:
            self.metadata = {}
        if self.description is None:
            self.description = ""
        
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        """Get URL for this resource"""
        if self.file:
            return self.file.url
        return self.url
    
    @property
    def is_downloadable(self):
        """Check if this resource is downloadable"""
        return bool(self.file)
    
    @property
    def file_extension(self):
        """Get the file extension if available"""
        if self.file:
            return os.path.splitext(self.file.name)[1].lower().lstrip('.')
        return ''
    
    @property
    def is_external_link(self):
        """Check if this is an external link"""
        return bool(self.url)
    
    @property
    def display_type(self):
        """Get display-friendly resource type"""
        if self.is_external_link:
            return _('External Link')
        return self.get_resource_type_display()
    
    @property
    def icon_class(self):
        """Get appropriate icon class for the resource type"""
        icon_map = {
            'document': 'file-text',
            'presentation': 'file-powerpoint',
            'spreadsheet': 'file-excel',
            'image': 'file-image',
            'audio': 'file-audio',
            'video': 'file-video',
            'link': 'link',
            'other': 'file',
        }
        return icon_map.get(self.resource_type, 'file')


# Signals
@receiver(post_save, sender=UserProgress)
def create_initial_module_progress(sender, instance, created, **kwargs):
    """Create ModuleProgress for all modules when UserProgress is created"""
    if created:
        for module in instance.course.modules.all():
            ModuleProgress.objects.get_or_create(
                user=instance.user,
                module=module,
                defaults={
                    'completion_requirements': {},
                    'metadata': {}
                }
            )
