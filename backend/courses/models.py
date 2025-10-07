from django.db import models
from django.contrib.auth import get_user_model
from django_ckeditor_5.fields import CKEditor5Field
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Count, Avg, Sum, Q

User = get_user_model()


class Category(models.Model):
    """Course categories for organizing courses"""
    name = models.CharField(max_length=255, verbose_name=_('Name'))
    slug = models.SlugField(max_length=255, unique=True, blank=True, null=True)
    description = models.TextField(blank=True, null=True, verbose_name=_('Description'))
    image = models.ImageField(upload_to='categories/', blank=True, null=True, verbose_name=_('Image'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    is_default = models.BooleanField(default=False, verbose_name=_('Is Default Category'), help_text=_('Default categories cannot be deleted'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    order = models.PositiveIntegerField(default=0, verbose_name=_('Order'))

    class Meta:
        verbose_name = _('Category')
        verbose_name_plural = _('Categories')
        ordering = ['order', 'name']

    def __str__(self):
        return self.name or _('Unnamed Category')

    def save(self, *args, **kwargs):
        if not self.slug and self.name:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            
            # Check for existing slugs and generate unique one
            while Category.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            
            self.slug = slug
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """Prevent deletion of default categories"""
        if self.is_default:
            raise models.ProtectedError(
                f"Cannot delete default category '{self.name}'. Default categories are protected.",
                self
            )
        super().delete(*args, **kwargs)

    @property
    def active_courses_count(self):
        """Return count of active, published courses in this category"""
        return self.courses.filter(is_active=True, status='published').count()
    


class Tag(models.Model):
    """Tags for categorizing and searching courses"""
    name = models.CharField(max_length=100, unique=True, verbose_name=_('Name'))
    slug = models.SlugField(max_length=100, unique=True, blank=True, null=True, verbose_name=_('Slug'))
    description = models.TextField(blank=True, null=True, verbose_name=_('Description'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Tag')
        verbose_name_plural = _('Tags')
        ordering = ['name']

    def __str__(self):
        return self.name or _('Unnamed Tag')

    def save(self, *args, **kwargs):
        if not self.slug and self.name:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            
            # Check for existing slugs and generate unique one
            while Tag.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            
            self.slug = slug
        super().save(*args, **kwargs)

    @classmethod
    def get_popular_tags(cls, limit=10):
        """Get the most popular tags based on course count"""
        return cls.objects.filter(is_active=True).annotate(
            num_courses=Count('courses')
        ).order_by('-num_courses')[:limit]


# Backward compatibility alias
Tags = Tag


class Course(models.Model):
    """Main course model that represents an online course"""
    
    LEVEL_CHOICES = [
        ('beginner', _('Beginner')),
        ('intermediate', _('Intermediate')),
        ('advanced', _('Advanced')),
    ]
    
    STATUS_CHOICES = [
        ('draft', _('Draft')),
        ('pending_review', _('Pending Review')),
        ('published', _('Published')),
        ('archived', _('Archived')),
    ]
    
    # Basic Information
    title = models.CharField(
        max_length=200, 
        verbose_name=_('Title'),
        null=True, 
        blank=True,
        default="Untitled Course"
    )
    slug = models.SlugField(max_length=200, unique=True, blank=True, null=True, verbose_name=_('Slug'))
    subtitle = models.CharField(max_length=255, blank=True, null=True, verbose_name=_('Subtitle'))
    description = CKEditor5Field(verbose_name=_('Description'))
    short_description = models.TextField(blank=True, null=True, verbose_name=_('Short Description'))
    
    # Relationships
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='courses',
        verbose_name=_('Category')
    )
    tags = models.ManyToManyField(
        Tag,
        related_name='courses',
        blank=True,
        verbose_name=_('Tags')
    )
    instructors = models.ManyToManyField(
        'users.Instructor',
        related_name='courses_taught',
        verbose_name=_('Instructors')
    )
    students = models.ManyToManyField(
        User,
        related_name='enrolled_courses',
        through='Enrollment',
        verbose_name=_('Students')
    )
    organization = models.ForeignKey(
        'users.Organization',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='courses',
        verbose_name=_('Organization')
    )
    
    # Media
    image = models.ImageField(
        upload_to='courses/images/',
        null=True,
        blank=True,
        verbose_name=_('Course Image')
    )
    promotional_video = models.URLField(
        blank=True,
        null=True,
        verbose_name=_('Promotional Video URL')
    )
    # Bunny CDN integration fields for promotional video
    bunny_promotional_video_id = models.CharField(
        _('Bunny promotional video ID'),
        max_length=100,
        blank=True,
        null=True,
        help_text=_('Bunny CDN video ID for promotional video')
    )
    bunny_promotional_video_url = models.URLField(
        _('Bunny promotional video URL'),
        blank=True,
        null=True,
        help_text=_('Direct URL to the promotional video on Bunny CDN')
    )
    syllabus_pdf = models.FileField(
        upload_to='courses/syllabus/', 
        null=True, 
        blank=True, 
        verbose_name=_('Syllabus PDF'),
        help_text=_('Upload course syllabus PDF')
    )
    materials_pdf = models.FileField(
        upload_to='courses/materials/', 
        null=True, 
        blank=True, 
        verbose_name=_('Course Materials'),
        help_text=_('Upload additional course materials PDF')
    )
    
    # Course Details
    level = models.CharField(
        max_length=20,
        choices=LEVEL_CHOICES,
        default='beginner',
        verbose_name=_('Difficulty Level')
    )
    language = models.CharField(
        max_length=50,
        default='en',
        verbose_name=_('Language')
    )
    
    # Pricing
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name=_('Price')
    )
    discount_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Discount Price')
    )
    is_free = models.BooleanField(default=False, verbose_name=_('Is Free'))
    
    # Status and Metadata
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name=_('Status')
    )
    is_complete_course = models.BooleanField(
        default=True,
        verbose_name=_('Is Complete Course'),
        help_text='Check if this is a complete course with full content. Uncheck if this is just a course announcement/preview.'
    )
    is_featured = models.BooleanField(default=False, verbose_name=_('Is Featured'))
    is_certified = models.BooleanField(default=False, verbose_name=_('Offers Certificate'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    published_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Published At'))
    
    # Statistics (denormalized for performance)
    average_rating = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)],
        verbose_name=_('Average Rating')
    )
    total_enrollments = models.PositiveIntegerField(default=0, verbose_name=_('Total Enrollments'))
    
    # SEO Fields
    meta_title = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_('Meta Title')
    )
    meta_description = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Meta Description')
    )
    
    class Meta:
        verbose_name = _('Course')
        verbose_name_plural = _('Courses')
        ordering = ['-created_at']
        permissions = [
            ('can_publish_course', 'Can publish course'),
            ('can_edit_all_courses', 'Can edit all courses'),
            ('can_view_analytics', 'Can view course analytics'),
        ]
    
    def __str__(self):
        return self.title or self.slug or str(self.id)
    
    def save(self, *args, **kwargs):
        # Set published_at when status changes to published
        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
        
        # Ensure free courses have price 0
        if self.is_free:
            self.price = 0
            self.discount_price = None
        
        # Handle course announcements - they should be free and not certified
        if not self.is_complete_course:
            self.is_free = True
            self.price = 0
            self.discount_price = None
            self.is_certified = False
        
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        from django.urls import reverse
        return reverse('course-detail', kwargs={'slug': self.slug})
    
    @property
    def current_price(self):
        """Get the current price after applying any discounts"""
        if self.is_free:
            return 0
        return self.discount_price if self.discount_price else self.price
    
    @property
    def is_course_announcement(self):
        """Check if this is a course announcement/preview"""
        return not self.is_complete_course
    
    def can_have_content(self):
        """Check if this course can have full content added"""
        return self.is_complete_course
    
    def update_statistics(self):
        """Update denormalized statistics"""
        from reviews.models import CourseReview
        
        # Update average rating
        rating_data = CourseReview.objects.filter(
            course=self,
            is_approved=True
        ).aggregate(avg_rating=Avg('rating'))
        
        self.average_rating = rating_data['avg_rating'] or 0
        
        # Update total enrollments
        self.total_enrollments = self.enrollments.filter(
            status__in=['active', 'completed']
        ).count()
        
        # Update directly in database to avoid triggering signals
        Course.objects.filter(pk=self.pk).update(
            average_rating=self.average_rating,
            total_enrollments=self.total_enrollments,
            updated_at=timezone.now()
        )
    
    def is_enrolled(self, user):
        """Check if a user is enrolled in this course"""
        if not user.is_authenticated:
            return False
        return self.enrollments.filter(
            student=user,
            status__in=['active', 'completed']
        ).exists()
    
    def get_enrollment(self, user):
        """Get a user's enrollment for this course"""
        if not user.is_authenticated:
            return None
        return self.enrollments.filter(student=user).first()
    
    def get_instructors_display(self):
        """Get formatted string of instructor names"""
        return ", ".join([str(instructor) for instructor in self.instructors.all()])
    
    def get_tags_display(self):
        """Get comma-separated list of tag names"""
        return ", ".join([tag.name for tag in self.tags.all()])
    
    # Bunny CDN integration methods
    @property
    def has_bunny_promotional_video(self):
        """Check if this course has a Bunny CDN promotional video"""
        return bool(self.bunny_promotional_video_id and self.bunny_promotional_video_url)
    
    @property
    def promotional_video_source(self):
        """Get the promotional video source type"""
        if self.has_bunny_promotional_video:
            return 'bunny'
        elif self.promotional_video:
            return 'external'
        return None
    
    def get_promotional_video_url(self):
        """Get the appropriate promotional video URL based on available sources"""
        if self.has_bunny_promotional_video:
            return self.bunny_promotional_video_url
        elif self.promotional_video:
            return self.promotional_video
        return None


class Enrollment(models.Model):
    """Tracks a user's enrollment in a course"""
    
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('active', _('Active')),
        ('completed', _('Completed')),
        ('dropped', _('Dropped')),
        ('suspended', _('Suspended')),
    ]
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='course_enrollments',
        verbose_name=_('Student')
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments',
        verbose_name=_('Course')
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        verbose_name=_('Status')
    )
    enrollment_date = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Enrollment Date')
    )
    completion_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Completion Date')
    )
    last_accessed = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Last Accessed')
    )
    progress = models.FloatField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name=_('Progress %')
    )
    is_paid = models.BooleanField(
        default=False,
        verbose_name=_('Is Paid')
    )
    payment_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Payment Amount')
    )
    payment_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Payment Date')
    )
    transaction_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_('Transaction ID')
    )
    
    class Meta:
        verbose_name = _('Enrollment')
        verbose_name_plural = _('Enrollments')
        unique_together = ('student', 'course')
        ordering = ['-enrollment_date']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.course.title}"
    
    def save(self, *args, **kwargs):
        # Update completion date if status changes to completed
        if self.status == 'completed' and not self.completion_date:
            self.completion_date = timezone.now()
        
        # Update last accessed timestamp
        self.last_accessed = timezone.now()
        
        super().save(*args, **kwargs)
        
        # Update course statistics (this now uses direct database update)
        self.course.update_statistics()
    
    def update_progress(self, new_progress):
        """
        Update the enrollment progress and handle completion
        
        Args:
            new_progress (float): New progress percentage (0-100)
        """
        if new_progress >= 100 and self.status != 'completed':
            self.status = 'completed'
            self.completion_date = timezone.now()
        
        self.progress = min(100, max(0, new_progress))  # Ensure between 0-100
        # Use direct database update to avoid triggering signals
        Enrollment.objects.filter(pk=self.pk).update(
            progress=self.progress,
            status=self.status,
            completion_date=self.completion_date,
            last_accessed=timezone.now()
        )
    
    def mark_complete(self):
        """Mark the enrollment as completed"""
        self.status = 'completed'
        self.progress = 100
        self.completion_date = timezone.now()
        # Use direct database update to avoid triggering signals
        Enrollment.objects.filter(pk=self.pk).update(
            status=self.status,
            progress=self.progress,
            completion_date=self.completion_date,
            last_accessed=timezone.now()
        )
    
    def is_active_enrollment(self):
        """Check if this is an active enrollment"""
        return self.status in ['active', 'completed']
    
    def get_certificate_eligible(self):
        """Check if this enrollment is eligible for a certificate"""
        return (
            self.status == 'completed' and 
            self.progress >= 100 and 
            self.course.is_certified
        )


@receiver(post_save, sender=Enrollment)
def update_enrollment_stats(sender, instance, created, **kwargs):
    """Update course statistics when enrollment is created or updated"""
    if created and instance.course:
        course = instance.course
        course.total_enrollments = course.enrollments.count()
        # Update directly in database to avoid triggering signals
        Course.objects.filter(pk=course.pk).update(total_enrollments=course.total_enrollments)

@receiver(post_save, sender=Course)
def update_course_slug(sender, instance, created, **kwargs):
    """Ensure course has a unique slug"""
    # Skip if instance is being deleted or if no title
    if not instance.title or not instance.title.strip():
        return
        
    # Generate slug if not provided or if title changed
    if not instance.slug or (instance.title and slugify(instance.title) != instance.slug):
        base_slug = slugify(instance.title)
        slug = base_slug
        counter = 1
        
        # Check for existing slugs and generate unique one
        while Course.objects.filter(slug=slug).exclude(pk=instance.pk).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        # Update the slug directly in the database without triggering signals
        Course.objects.filter(pk=instance.pk).update(slug=slug)
        # Update the instance in memory
        instance.slug = slug

