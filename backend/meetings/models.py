from datetime import datetime, timedelta
from django.db import models
from django.contrib.auth.models import User
from django_ckeditor_5.fields import CKEditor5Field
from django.utils import timezone
from django.core.exceptions import ValidationError
from users.models import Organization, Instructor, Student


class Meeting(models.Model):
    MEETING_TYPES = (
        ('ZOOM', 'اجتماع عبر زووم'),
        ('NORMAL', 'اجتماع عادي'),
        ('LIVE', 'اجتماع مباشر'),
    )
    
    NOTIFICATION_TYPES = (
        ('DAY_BEFORE', 'قبل يوم'),
        ('HOUR_BEFORE', 'قبل ساعة'),
        ('CANCELLED', 'تم الإلغاء'),
        ('RESCHEDULED', 'تم إعادة الجدولة'),
    )
    
    title = models.CharField(max_length=255, verbose_name="عنوان الاجتماع")
    description = models.TextField(verbose_name="وصف الاجتماع")
    meeting_type = models.CharField(max_length=10, choices=MEETING_TYPES, verbose_name="نوع الاجتماع")
    start_time = models.DateTimeField(verbose_name="وقت البدء")
    duration = models.DurationField(default=timedelta(minutes=60), verbose_name="المدة")
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_meetings', verbose_name="منشئ الاجتماع")
    zoom_link = models.URLField(blank=True, null=True, verbose_name="رابط زووم")
    recording_url = models.URLField(blank=True, null=True, verbose_name="رابط التسجيل")
    materials = models.FileField(upload_to='meeting_materials/', blank=True, null=True, verbose_name="مواد الاجتماع")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    
    # Fields for live meetings
    meeting_room_id = models.CharField(max_length=255, blank=True, null=True, verbose_name="معرف غرفة الاجتماع")
    is_live_started = models.BooleanField(default=False, verbose_name="بدأ الاجتماع المباشر")
    live_started_at = models.DateTimeField(blank=True, null=True, verbose_name="وقت بدء الاجتماع المباشر")
    live_ended_at = models.DateTimeField(blank=True, null=True, verbose_name="وقت انتهاء الاجتماع المباشر")
    max_participants = models.IntegerField(default=50, verbose_name="الحد الأقصى للمشاركين")
    enable_screen_share = models.BooleanField(default=True, verbose_name="تمكين مشاركة الشاشة")
    enable_chat = models.BooleanField(default=True, verbose_name="تمكين الدردشة")
    enable_recording = models.BooleanField(default=False, verbose_name="تمكين التسجيل")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")
    notification_task_id = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        verbose_name = "اجتماع"
        verbose_name_plural = "الاجتماعات"
        ordering = ['-start_time']

    def __str__(self):
        return self.title

    def clean(self):
        if self.start_time and self.start_time < timezone.now():
            raise ValidationError('وقت بدء الاجتماع لا يمكن أن يكون في الماضي')

    @property
    def end_time(self):
        """حساب وقت انتهاء الاجتماع"""
        return self.start_time + self.duration

    @property
    def is_past(self):
        """فحص إذا كان الاجتماع قد انتهى"""
        return timezone.now() > self.end_time

    @property
    def is_ongoing(self):
        """فحص إذا كان الاجتماع جارٍ حالياً"""
        now = timezone.now()
        return self.start_time <= now <= self.end_time

    @property
    def attendance_rate(self):
        """حساب معدل الحضور"""
        total_participants = self.participants.count()
        if total_participants == 0:
            return 0
        attending_participants = self.participants.filter(is_attending=True).count()
        return (attending_participants / total_participants) * 100

    def get_participants(self):
        """الحصول على قائمة المشاركين"""
        return self.participants.all()

    def add_participant(self, user):
        """إضافة مشارك جديد"""
        participant, created = Participant.objects.get_or_create(
            meeting=self,
            user=user,
            defaults={
                'attendance_status': 'registered',
                'is_attending': False
            }
        )
        return participant

    def start_live_meeting(self):
        """بدء الاجتماع المباشر"""
        if not self.is_live_started:
            self.is_live_started = True
            self.live_started_at = timezone.now()
            if not self.meeting_room_id:
                import uuid
                self.meeting_room_id = str(uuid.uuid4())
            self.save(update_fields=['is_live_started', 'live_started_at', 'meeting_room_id'])
        return self.meeting_room_id

    def end_live_meeting(self):
        """إنهاء الاجتماع المباشر"""
        if self.is_live_started:
            self.live_ended_at = timezone.now()
            self.save(update_fields=['live_ended_at'])
            
            # تحديث مدة الحضور للمشاركين المتصلين
            active_participants = self.participants.filter(is_attending=True, exit_time__isnull=True)
            for participant in active_participants:
                participant.mark_exit()

    @property
    def can_join_live(self):
        """فحص إمكانية الانضمام للاجتماع المباشر"""
        if self.meeting_type != 'LIVE':
            return False
        
        now = timezone.now()
        # يمكن الانضمام قبل 15 دقيقة من الموعد المحدد وخلال مدة الاجتماع
        start_buffer = self.start_time - timedelta(minutes=15)
        end_time = self.start_time + self.duration
        
        return start_buffer <= now <= end_time and self.is_active

    @property
    def live_participants_count(self):
        """عدد المشاركين المتصلين حالياً"""
        if not self.is_live_started:
            return 0
        return self.participants.filter(
            is_attending=True,
            attendance_time__isnull=False,
            exit_time__isnull=True
        ).count()

    def setup_notifications(self):
        """إعداد الإشعارات التلقائية"""
        # إشعار قبل يوم واحد
        day_before = self.start_time - timedelta(days=1)
        if day_before > timezone.now():
            Notification.create_for_meeting(
                meeting=self,
                notification_type='DAY_BEFORE',
                message=f"تذكير: اجتماع '{self.title}' غداً في تمام الساعة {self.start_time.strftime('%H:%M')}",
                scheduled_time=day_before
            )
        
        # إشعار قبل ساعة واحدة
        hour_before = self.start_time - timedelta(hours=1)
        if hour_before > timezone.now():
            Notification.create_for_meeting(
                meeting=self,
                notification_type='HOUR_BEFORE',
                message=f"تذكير: اجتماع '{self.title}' خلال ساعة واحدة",
                scheduled_time=hour_before
            )

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # إعداد الإشعارات عند إنشاء اجتماع جديد
        if not hasattr(self, '_notifications_setup'):
            self.setup_notifications()
            self._notifications_setup = True


class Participant(models.Model):
    ATTENDANCE_STATUS_CHOICES = [
        ('registered', 'مسجل'),
        ('present', 'حاضر'),
        ('absent', 'غائب'),
        ('late', 'متأخر'),
        ('not_marked', 'غير محدد'),
    ]
    
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name='participants', verbose_name="الاجتماع")
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="المستخدم")
    is_attending = models.BooleanField(default=False, verbose_name="حاضر")
    attendance_status = models.CharField(
        max_length=20, 
        choices=ATTENDANCE_STATUS_CHOICES, 
        default='registered', 
        verbose_name="حالة الحضور"
    )
    joined_at = models.DateTimeField(null=True, blank=True, verbose_name="وقت الانضمام")
    left_at = models.DateTimeField(null=True, blank=True, verbose_name="وقت المغادرة")
    attendance_time = models.DateTimeField(null=True, blank=True, verbose_name="وقت الحضور")
    exit_time = models.DateTimeField(null=True, blank=True, verbose_name="وقت المغادرة")
    attendance_duration = models.DurationField(null=True, blank=True, verbose_name="مدة الحضور")

    class Meta:
        unique_together = ('meeting', 'user')
        verbose_name = "مشارك"
        verbose_name_plural = "المشاركون"

    def __str__(self):
        return f"{self.user.username} - {self.meeting.title}"

    def mark_attendance(self):
        """تسجيل الحضور"""
        if not self.is_attending:
            self.is_attending = True
            self.attendance_time = timezone.now()
            self.attendance_status = 'present'
            self.save(update_fields=['is_attending', 'attendance_time', 'attendance_status'])

    def mark_exit(self):
        """تسجيل المغادرة"""
        if self.is_attending and not self.exit_time:
            self.exit_time = timezone.now()
            self.is_attending = False
            if self.attendance_time:
                self.attendance_duration = self.exit_time - self.attendance_time
            self.save(update_fields=['exit_time', 'is_attending', 'attendance_duration'])

    @property
    def attendance_status_display(self):
        """حالة الحضور للعرض"""
        if self.attendance_status == 'registered':
            return "مسجل"
        elif self.attendance_status == 'present':
            return "حاضر"
        elif self.attendance_status == 'absent':
            return "غائب"
        elif self.attendance_status == 'late':
            return "متأخر"
        elif self.attendance_status == 'not_marked':
            return "غير محدد"
        else:
            return "غير محدد"


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('DAY_BEFORE', 'قبل يوم'),
        ('HOUR_BEFORE', 'قبل ساعة'),
        ('CANCELLED', 'تم الإلغاء'),
        ('RESCHEDULED', 'تم إعادة الجدولة'),
        ('CUSTOM', 'مخصص'),
    )
    
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name='notifications', verbose_name="الاجتماع")
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='CUSTOM', verbose_name="نوع الإشعار")
    message = models.TextField(verbose_name="الرسالة")
    recipients = models.ManyToManyField(User, related_name='meeting_notifications', verbose_name="المستلمون")
    scheduled_time = models.DateTimeField(verbose_name="وقت الجدولة")
    sent = models.BooleanField(default=False, verbose_name="تم الإرسال")
    sent_at = models.DateTimeField(null=True, blank=True, verbose_name="وقت الإرسال")
    is_read = models.BooleanField(default=False, verbose_name="تمت القراءة")

    class Meta:
        verbose_name = "إشعار"
        verbose_name_plural = "الإشعارات"
        ordering = ['-scheduled_time']

    def __str__(self):
        return f"{self.get_notification_type_display()} - {self.meeting.title}"

    def send(self):
        """إرسال الإشعار"""
        if not self.sent and timezone.now() >= self.scheduled_time:
            # هنا يمكن إضافة منطق إرسال الإشعارات (البريد الإلكتروني، الرسائل القصيرة، إلخ)
            # للوقت الحالي نقوم فقط بتحديث حالة الإرسال
            self.sent = True
            self.sent_at = timezone.now()
            self.save(update_fields=['sent', 'sent_at'])
            
            # يمكن إضافة منطق إرسال فعلي هنا
            # مثل: send_email_notification() أو send_push_notification()
            
            return True
        return False

    @classmethod
    def create_for_meeting(cls, meeting, notification_type, message, scheduled_time=None):
        """إنشاء إشعار لاجتماع"""
        if scheduled_time is None:
            scheduled_time = timezone.now()
        
        notification = cls.objects.create(
            meeting=meeting,
            notification_type=notification_type,
            message=message,
            scheduled_time=scheduled_time
        )
        
        # إضافة جميع المشاركين كمستلمين
        participants = meeting.participants.all()
        for participant in participants:
            notification.recipients.add(participant.user)
        
        # إضافة منشئ الاجتماع أيضاً
        notification.recipients.add(meeting.creator)
        
        return notification

    @classmethod
    def get_unread_count(cls, user):
        """الحصول على عدد الإشعارات غير المقروءة للمستخدم"""
        return cls.objects.filter(recipients=user, is_read=False, sent=True).count()


class MeetingChat(models.Model):
    """Chat messages for live meetings"""
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name='chat_messages', verbose_name="الاجتماع")
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="المستخدم")
    message = models.TextField(verbose_name="الرسالة")
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="وقت الإرسال")
    is_system_message = models.BooleanField(default=False, verbose_name="رسالة نظام")

    class Meta:
        ordering = ['timestamp']
        verbose_name = "رسالة دردشة"
        verbose_name_plural = "رسائل الدردشة"

    def __str__(self):
        return f"{self.user.username}: {self.message[:50]}..."


class MeetingInvitation(models.Model):
    """Meeting invitations for users"""
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name='invitations', verbose_name="الاجتماع")
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="المستخدم")
    message = models.TextField(blank=True, verbose_name="رسالة الدعوة")
    response = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'في الانتظار'),
            ('accepted', 'مقبول'),
            ('declined', 'مرفوض'),
        ],
        default='pending',
        verbose_name="الرد"
    )
    responded_at = models.DateTimeField(null=True, blank=True, verbose_name="وقت الرد")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")

    class Meta:
        unique_together = ('meeting', 'user')
        verbose_name = "دعوة اجتماع"
        verbose_name_plural = "دعوات الاجتماعات"
        ordering = ['-created_at']

    def __str__(self):
        return f"دعوة {self.user.username} لاجتماع {self.meeting.title}"

    def accept(self):
        """Accept the invitation"""
        self.response = 'accepted'
        self.responded_at = timezone.now()
        self.save()
        
        # Create participant record
        Participant.objects.get_or_create(
            meeting=self.meeting,
            user=self.user,
            defaults={
                'attendance_status': 'registered',
                'is_attending': False
            }
        )

    def decline(self):
        """Decline the invitation"""
        self.response = 'declined'
        self.responded_at = timezone.now()
        self.save()
