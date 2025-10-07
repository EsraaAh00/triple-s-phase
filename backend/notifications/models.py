from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('course_enrollment', 'تسجيل في دورة'),
        ('assignment_due', 'موعد تسليم واجب'),
        ('exam_reminder', 'تذكير امتحان'),
        ('meeting_reminder', 'تذكير اجتماع'),
        ('grade_released', 'إعلان درجة'),
        ('certificate_issued', 'إصدار شهادة'),
        ('course_update', 'تحديث دورة'),
        ('system_announcement', 'إعلان نظام'),
        ('message', 'رسالة'),
        ('general', 'عام'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'منخفض'),
        ('normal', 'عادي'),
        ('high', 'عالي'),
        ('urgent', 'عاجل'),
    ]
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', verbose_name='المستلم')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='sent_notifications', verbose_name='المرسل')
    
    title = models.CharField(max_length=255, verbose_name='العنوان')
    message = models.TextField(verbose_name='الرسالة')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='general', verbose_name='نوع الإشعار')
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='normal', verbose_name='الأولوية')
    
    # Generic foreign key for related objects
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    is_read = models.BooleanField(default=False, verbose_name='تمت القراءة')
    read_at = models.DateTimeField(null=True, blank=True, verbose_name='وقت القراءة')
    
    # Email and push notification settings
    email_sent = models.BooleanField(default=False, verbose_name='تم إرسال بريد إلكتروني')
    push_sent = models.BooleanField(default=False, verbose_name='تم إرسال إشعار فوري')
    
    # Action button (optional)
    action_url = models.URLField(null=True, blank=True, verbose_name='رابط الإجراء')
    action_text = models.CharField(max_length=100, null=True, blank=True, verbose_name='نص الإجراء')
    
    # Scheduling
    scheduled_at = models.DateTimeField(null=True, blank=True, verbose_name='مجدول في')
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name='ينتهي في')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')
    
    class Meta:
        verbose_name = 'إشعار'
        verbose_name_plural = 'الإشعارات'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f'{self.title} - {self.recipient.username}'
    
    def mark_as_read(self):
        """تحديد الإشعار كمقروء"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
    
    def is_expired(self):
        """فحص إذا كان الإشعار منتهي الصلاحية"""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False
    
    @classmethod
    def create_notification(cls, recipient, title, message, notification_type='general', 
                          sender=None, priority='normal', content_object=None, 
                          action_url=None, action_text=None, expires_at=None):
        """إنشاء إشعار جديد"""
        notification = cls.objects.create(
            recipient=recipient,
            sender=sender,
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
            content_object=content_object,
            action_url=action_url,
            action_text=action_text,
            expires_at=expires_at
        )
        return notification
    
    @classmethod
    def bulk_notify(cls, recipients, title, message, **kwargs):
        """إرسال إشعار جماعي"""
        notifications = []
        for recipient in recipients:
            notifications.append(cls(
                recipient=recipient,
                title=title,
                message=message,
                **kwargs
            ))
        return cls.objects.bulk_create(notifications)


class NotificationSettings(models.Model):
    """إعدادات الإشعارات للمستخدمين"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_settings')
    
    # Email notifications
    email_course_updates = models.BooleanField(default=True, verbose_name='تحديثات الدورات عبر البريد')
    email_assignments = models.BooleanField(default=True, verbose_name='الواجبات عبر البريد')
    email_exams = models.BooleanField(default=True, verbose_name='الامتحانات عبر البريد')
    email_meetings = models.BooleanField(default=True, verbose_name='الاجتماعات عبر البريد')
    email_grades = models.BooleanField(default=True, verbose_name='الدرجات عبر البريد')
    email_certificates = models.BooleanField(default=True, verbose_name='الشهادات عبر البريد')
    email_system = models.BooleanField(default=True, verbose_name='إعلانات النظام عبر البريد')
    
    # Push notifications
    push_course_updates = models.BooleanField(default=True, verbose_name='تحديثات الدورات فورية')
    push_assignments = models.BooleanField(default=True, verbose_name='الواجبات فورية')
    push_exams = models.BooleanField(default=True, verbose_name='الامتحانات فورية')
    push_meetings = models.BooleanField(default=True, verbose_name='الاجتماعات فورية')
    push_grades = models.BooleanField(default=True, verbose_name='الدرجات فورية')
    push_certificates = models.BooleanField(default=True, verbose_name='الشهادات فورية')
    push_system = models.BooleanField(default=True, verbose_name='إعلانات النظام فورية')
    
    # General settings
    digest_frequency = models.CharField(
        max_length=10,
        choices=[
            ('never', 'أبداً'),
            ('daily', 'يومي'),
            ('weekly', 'أسبوعي'),
            ('monthly', 'شهري'),
        ],
        default='weekly',
        verbose_name='تكرار الملخص'
    )
    
    quiet_hours_start = models.TimeField(null=True, blank=True, verbose_name='بداية الساعات الهادئة')
    quiet_hours_end = models.TimeField(null=True, blank=True, verbose_name='نهاية الساعات الهادئة')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'إعدادات الإشعارات'
        verbose_name_plural = 'إعدادات الإشعارات'
    
    def __str__(self):
        return f'إعدادات إشعارات {self.user.username}'


class NotificationTemplate(models.Model):
    """قوالب الإشعارات"""
    name = models.CharField(max_length=255, verbose_name='اسم القالب')
    notification_type = models.CharField(max_length=20, choices=Notification.NOTIFICATION_TYPES, verbose_name='نوع الإشعار')
    
    title_template = models.CharField(max_length=255, verbose_name='قالب العنوان')
    message_template = models.TextField(verbose_name='قالب الرسالة')
    
    # Email template (optional)
    email_subject_template = models.CharField(max_length=255, null=True, blank=True, verbose_name='قالب موضوع البريد')
    email_body_template = models.TextField(null=True, blank=True, verbose_name='قالب نص البريد')
    
    is_active = models.BooleanField(default=True, verbose_name='نشط')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'قالب إشعار'
        verbose_name_plural = 'قوالب الإشعارات'
        unique_together = ('name', 'notification_type')
    
    def __str__(self):
        return f'{self.name} ({self.get_notification_type_display()})'
    
    def render_title(self, context):
        """تطبيق القالب على العنوان"""
        return self.title_template.format(**context)
    
    def render_message(self, context):
        """تطبيق القالب على الرسالة"""
        return self.message_template.format(**context)


class NotificationLog(models.Model):
    """سجل الإشعارات المرسلة"""
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='logs')
    
    delivery_method = models.CharField(
        max_length=10,
        choices=[
            ('app', 'التطبيق'),
            ('email', 'البريد الإلكتروني'),
            ('push', 'إشعار فوري'),
            ('sms', 'رسالة نصية'),
        ],
        verbose_name='طريقة التوصيل'
    )
    
    status = models.CharField(
        max_length=10,
        choices=[
            ('pending', 'في الانتظار'),
            ('sent', 'تم الإرسال'),
            ('delivered', 'تم التوصيل'),
            ('failed', 'فشل'),
            ('bounced', 'مرتد'),
        ],
        default='pending',
        verbose_name='الحالة'
    )
    
    error_message = models.TextField(null=True, blank=True, verbose_name='رسالة الخطأ')
    sent_at = models.DateTimeField(null=True, blank=True, verbose_name='وقت الإرسال')
    delivered_at = models.DateTimeField(null=True, blank=True, verbose_name='وقت التوصيل')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'سجل إشعار'
        verbose_name_plural = 'سجلات الإشعارات'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.notification.title} - {self.get_delivery_method_display()} - {self.get_status_display()}' 