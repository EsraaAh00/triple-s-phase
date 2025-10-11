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
    
    # English fields
    title = models.CharField(max_length=200, verbose_name='Title (EN)')
    description = models.TextField(blank=True, null=True, verbose_name='Description (EN)')
    
    # Arabic fields
    title_ar = models.CharField(max_length=200, blank=True, null=True, verbose_name='العنوان (AR)')
    description_ar = models.TextField(blank=True, null=True, verbose_name='الوصف (AR)')
    
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
    button_text = models.CharField(max_length=100, blank=True, null=True, verbose_name='نص الزر (EN)')
    button_text_ar = models.CharField(max_length=100, blank=True, null=True, verbose_name='نص الزر (AR)')
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
    # English fields
    name = models.CharField(max_length=200, verbose_name='Name (EN)')
    description = models.TextField(blank=True, null=True, verbose_name='Description (EN)')
    
    # Arabic fields
    name_ar = models.CharField(max_length=200, blank=True, null=True, verbose_name='الاسم (AR)')
    description_ar = models.TextField(blank=True, null=True, verbose_name='الوصف (AR)')
    
    slug = models.SlugField(max_length=200, unique=True, allow_unicode=True, verbose_name='رابط المجموعة')
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


class PrivacyPolicy(models.Model):
    """Model for Privacy Policy page content"""
    # English fields
    title = models.CharField(max_length=200, default='Privacy Policy', verbose_name='Title (EN)')
    content = models.TextField(verbose_name='Content (EN)')
    
    # Arabic fields
    title_ar = models.CharField(max_length=200, default='سياسة الخصوصية', verbose_name='العنوان (AR)')
    content_ar = models.TextField(blank=True, null=True, verbose_name='المحتوى (AR)')
    
    is_active = models.BooleanField(default=True, verbose_name='نشط')
    last_updated = models.DateTimeField(auto_now=True, verbose_name='آخر تحديث')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'سياسة الخصوصية'
        verbose_name_plural = 'سياسات الخصوصية'
        ordering = ['-last_updated']
    
    def __str__(self):
        return f"Privacy Policy - Last Updated: {self.last_updated.strftime('%Y-%m-%d')}"


class TermsAndConditions(models.Model):
    """Model for Terms and Conditions page content"""
    # English fields
    title = models.CharField(max_length=200, default='Terms and Conditions', verbose_name='Title (EN)')
    content = models.TextField(verbose_name='Content (EN)')
    
    # Arabic fields
    title_ar = models.CharField(max_length=200, default='الشروط والأحكام', verbose_name='العنوان (AR)')
    content_ar = models.TextField(blank=True, null=True, verbose_name='المحتوى (AR)')
    
    is_active = models.BooleanField(default=True, verbose_name='نشط')
    last_updated = models.DateTimeField(auto_now=True, verbose_name='آخر تحديث')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'الشروط والأحكام'
        verbose_name_plural = 'الشروط والأحكام'
        ordering = ['-last_updated']
    
    def __str__(self):
        return f"Terms and Conditions - Last Updated: {self.last_updated.strftime('%Y-%m-%d')}"


class RefundingFAQ(models.Model):
    """Model for Refunding FAQ page content"""
    # English fields
    question = models.CharField(max_length=300, verbose_name='Question (EN)')
    answer = models.TextField(verbose_name='Answer (EN)')
    
    # Arabic fields
    question_ar = models.CharField(max_length=300, blank=True, null=True, verbose_name='السؤال (AR)')
    answer_ar = models.TextField(blank=True, null=True, verbose_name='الإجابة (AR)')
    
    display_order = models.PositiveIntegerField(default=0, verbose_name='ترتيب العرض')
    is_active = models.BooleanField(default=True, verbose_name='نشط')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'سؤال الاسترجاع'
        verbose_name_plural = 'أسئلة الاسترجاع الشائعة'
        ordering = ['display_order', '-created_at']
    
    def __str__(self):
        return self.question[:50]


class ContactInfo(models.Model):
    """Model for Contact Us page information"""
    # English fields
    title = models.CharField(max_length=200, default='Contact Us', verbose_name='Title (EN)')
    description = models.TextField(blank=True, null=True, verbose_name='Description (EN)')
    
    # Arabic fields
    title_ar = models.CharField(max_length=200, default='اتصل بنا', verbose_name='العنوان (AR)')
    description_ar = models.TextField(blank=True, null=True, verbose_name='الوصف (AR)')
    
    # Contact details
    email = models.EmailField(verbose_name='البريد الإلكتروني')
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='رقم الهاتف')
    address = models.TextField(blank=True, null=True, verbose_name='العنوان (EN)')
    address_ar = models.TextField(blank=True, null=True, verbose_name='العنوان (AR)')
    
    # Social media links
    facebook = models.URLField(max_length=200, blank=True, null=True, verbose_name='فيسبوك')
    twitter = models.URLField(max_length=200, blank=True, null=True, verbose_name='تويتر')
    instagram = models.URLField(max_length=200, blank=True, null=True, verbose_name='انستجرام')
    linkedin = models.URLField(max_length=200, blank=True, null=True, verbose_name='لينكد إن')
    youtube = models.URLField(max_length=200, blank=True, null=True, verbose_name='يوتيوب')
    
    # Working hours
    working_hours = models.TextField(blank=True, null=True, verbose_name='ساعات العمل (EN)')
    working_hours_ar = models.TextField(blank=True, null=True, verbose_name='ساعات العمل (AR)')
    
    is_active = models.BooleanField(default=True, verbose_name='نشط')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'معلومات التواصل'
        verbose_name_plural = 'معلومات التواصل'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Contact Info - {self.email}"


class Partnership(models.Model):
    """Model for Our Partnership/Partners section"""
    # English fields
    name = models.CharField(max_length=200, verbose_name='Partner Name (EN)')
    
    # Arabic fields
    name_ar = models.CharField(max_length=200, blank=True, null=True, verbose_name='اسم الشريك (AR)')
    
    # Partner logo/image
    logo = models.ImageField(
        upload_to='partnerships/',
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'svg'])
        ],
        verbose_name='شعار الشريك'
    )
    
    # Optional website link
    website = models.URLField(max_length=500, blank=True, null=True, verbose_name='موقع الشريك')
    
    # Display settings
    display_order = models.PositiveIntegerField(default=0, verbose_name='ترتيب العرض')
    is_active = models.BooleanField(default=True, verbose_name='نشط')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'شريك'
        verbose_name_plural = 'الشركاء'
        ordering = ['display_order', 'name']
    
    def __str__(self):
        return self.name


class ContactMessage(models.Model):
    """Model for storing contact form messages"""
    MESSAGE_STATUS = [
        ('new', 'New'),
        ('read', 'Read'),
        ('replied', 'Replied'),
        ('closed', 'Closed'),
    ]
    
    # Contact information
    name = models.CharField(max_length=200, verbose_name='الاسم')
    email = models.EmailField(verbose_name='البريد الإلكتروني')
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='رقم الهاتف')
    subject = models.CharField(max_length=300, verbose_name='الموضوع')
    message = models.TextField(verbose_name='الرسالة')
    
    # Status and tracking
    status = models.CharField(
        max_length=10,
        choices=MESSAGE_STATUS,
        default='new',
        verbose_name='الحالة'
    )
    is_urgent = models.BooleanField(default=False, verbose_name='عاجل')
    
    # Admin response
    admin_response = models.TextField(blank=True, null=True, verbose_name='رد الإدارة')
    admin_response_date = models.DateTimeField(blank=True, null=True, verbose_name='تاريخ الرد')
    
    # IP and user agent for tracking
    ip_address = models.GenericIPAddressField(blank=True, null=True, verbose_name='عنوان IP')
    user_agent = models.TextField(blank=True, null=True, verbose_name='معلومات المتصفح')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإرسال')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='آخر تحديث')
    
    class Meta:
        verbose_name = 'رسالة تواصل'
        verbose_name_plural = 'رسائل التواصل'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.subject} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
    
    def get_status_display_ar(self):
        """Get Arabic status display"""
        status_map = {
            'new': 'جديد',
            'read': 'مقروء',
            'replied': 'تم الرد',
            'closed': 'مغلق',
        }
        return status_map.get(self.status, self.status)
