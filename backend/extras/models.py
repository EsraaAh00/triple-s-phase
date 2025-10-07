from django.db import models
from django.utils import timezone
from django.conf import settings
from django.core.validators import FileExtensionValidator
from courses.models import Course


class Banner(models.Model):
    """Model for managing banners on the website"""
    BANNER_TYPES = [
        ('main', 'Main Banner'),
        ('header', 'Header Banner'),
        ('sidebar', 'Sidebar Banner'),
        ('promo', 'Promotional Banner'),
        ('about_us', 'About Us Banner'),
        ('why_choose_us', 'Why Choose Us Banner'),
    ]
    
    title = models.CharField(max_length=200, verbose_name='عنوان البانر')
    description = models.TextField(blank=True, null=True, verbose_name='الوصف')
    image = models.ImageField(
        upload_to='banners/',
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp'])
        ],
        verbose_name='صورة البانر'
    )
    url = models.URLField(max_length=500, blank=True, null=True, verbose_name='رابط البانر')
    is_active = models.BooleanField(default=True, verbose_name='نشط')
    banner_type = models.CharField(
        max_length=20,
        choices=BANNER_TYPES,
        default='main',
        verbose_name='نوع البانر'
    )
    display_order = models.PositiveIntegerField(default=0, verbose_name='ترتيب العرض')
    start_date = models.DateTimeField(default=timezone.now, verbose_name='تاريخ البدء')
    end_date = models.DateTimeField(blank=True, null=True, verbose_name='تاريخ الانتهاء')
    
    # Additional fields for specific banner types
    button_text = models.CharField(max_length=100, blank=True, null=True, verbose_name='نص الزر')
    button_url = models.URLField(max_length=500, blank=True, null=True, verbose_name='رابط الزر')
    background_color = models.CharField(max_length=7, blank=True, null=True, verbose_name='لون الخلفية')
    text_color = models.CharField(max_length=7, blank=True, null=True, verbose_name='لون النص')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'بانر'
        verbose_name_plural = 'البانرات'
        ordering = ['display_order', '-created_at']
    
    def __str__(self):
        return self.title
    
    def is_active_now(self):
        """Check if the banner is currently active"""
        now = timezone.now()
        if not self.is_active:
            return False
        if self.start_date and self.start_date > now:
            return False
        if self.end_date and self.end_date < now:
            return False
        return True
    
    @classmethod
    def get_active_banners_by_type(cls, banner_type):
        """Get active banners by type"""
        return cls.objects.filter(
            banner_type=banner_type,
            is_active=True,
            start_date__lte=timezone.now()
        ).filter(
            models.Q(end_date__isnull=True) | models.Q(end_date__gte=timezone.now())
        ).order_by('display_order', '-created_at')
    
    @classmethod
    def get_header_banners(cls):
        """Get active header banners"""
        return cls.get_active_banners_by_type('header')
    
    @classmethod
    def get_main_banners(cls):
        """Get active main banners"""
        return cls.get_active_banners_by_type('main')
    
    @classmethod
    def get_about_us_banners(cls):
        """Get active about us banners"""
        return cls.get_active_banners_by_type('about_us')
    
    @classmethod
    def get_why_choose_us_banners(cls):
        """Get active why choose us banners"""
        return cls.get_active_banners_by_type('why_choose_us')


class CourseCollection(models.Model):
    """Model for grouping courses under a named collection"""
    name = models.CharField(max_length=200, verbose_name='اسم المجموعة')
    slug = models.SlugField(max_length=200, unique=True, allow_unicode=True, verbose_name='رابط المجموعة')
    description = models.TextField(blank=True, null=True, verbose_name='الوصف')
    courses = models.ManyToManyField(
        Course,
        related_name='collections',
        blank=True,
        verbose_name='الكورسات'
    )
    is_featured = models.BooleanField(default=False, verbose_name='مميز')
    display_order = models.PositiveIntegerField(default=0, verbose_name='ترتيب العرض')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'مجموعة كورسات'
        verbose_name_plural = 'مجموعات الكورسات'
        ordering = ['display_order', '-created_at']
    
    def __str__(self):
        return self.name
    
    def get_active_courses(self):
        """Return only active courses in this collection"""
        return self.courses.filter(status='published', is_active=True)
    
    def course_count(self):
        """Return count of active courses in this collection"""
        return self.get_active_courses().count()
