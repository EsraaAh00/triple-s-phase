from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.contrib.admin import SimpleListFilter
from django.db.models import Count, Avg
from django.utils import timezone
from datetime import timedelta
from .models import Meeting, Participant, Notification, MeetingChat


class MeetingTypeFilter(SimpleListFilter):
    title = 'نوع الاجتماع'
    parameter_name = 'meeting_type'

    def lookups(self, request, model_admin):
        return (
            ('ZOOM', 'اجتماع عبر زووم'),
            ('NORMAL', 'اجتماع عادي'),
            ('LIVE', 'اجتماع مباشر'),
        )

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(meeting_type=self.value())
        return queryset


class MeetingStatusFilter(SimpleListFilter):
    title = 'حالة الاجتماع'
    parameter_name = 'status'

    def lookups(self, request, model_admin):
        return (
            ('upcoming', 'قادم'),
            ('ongoing', 'جارٍ'),
            ('past', 'منتهي'),
            ('live_active', 'مباشر نشط'),
        )

    def queryset(self, request, queryset):
        now = timezone.now()
        if self.value() == 'upcoming':
            return queryset.filter(start_time__gt=now)
        elif self.value() == 'ongoing':
            return queryset.filter(
                start_time__lte=now,
                start_time__gte=now - timedelta(hours=3)  # افتراض مدة قصوى 3 ساعات
            )
        elif self.value() == 'past':
            return queryset.filter(start_time__lt=now - timedelta(hours=3))
        elif self.value() == 'live_active':
            return queryset.filter(meeting_type='LIVE', is_live_started=True, live_ended_at__isnull=True)
        return queryset


class ParticipantInline(admin.TabularInline):
    model = Participant
    extra = 0
    fields = ('user', 'is_attending', 'attendance_time', 'exit_time', 'attendance_duration')
    readonly_fields = ('attendance_duration',)


class NotificationInline(admin.TabularInline):
    model = Notification
    extra = 0
    fields = ('notification_type', 'message', 'scheduled_time', 'sent', 'sent_at')
    readonly_fields = ('sent_at',)


@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'meeting_type', 'creator', 'start_time', 'duration_display',
        'status_display', 'participants_count', 'attendance_rate_display', 'is_active'
    )
    list_filter = (
        MeetingTypeFilter, MeetingStatusFilter, 'is_active', 'start_time', 
        'is_live_started', 'enable_recording'
    )
    search_fields = ('title', 'description', 'creator__username', 'creator__first_name', 'creator__last_name')
    inlines = [ParticipantInline, NotificationInline]
    readonly_fields = (
        'created_at', 'updated_at',
        'live_started_at', 'live_ended_at', 'meeting_room_id', 'end_time_display'
    )
    
    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('title', 'description', 'meeting_type', 'creator')
        }),
        ('التوقيت', {
            'fields': ('start_time', 'duration', 'end_time_display')
        }),
        ('الروابط والمواد', {
            'fields': ('zoom_link', 'recording_url', 'materials')
        }),
        ('إعدادات الاجتماع المباشر', {
            'fields': (
                ('max_participants', 'meeting_room_id'),
                ('enable_screen_share', 'enable_chat', 'enable_recording'),
                ('is_live_started', 'live_started_at', 'live_ended_at')
            ),
            'classes': ('collapse',)
        }),
        ('الحالة', {
            'fields': ('is_active',)
        }),
        ('الإحصائيات', {
            'fields': (),
            'classes': ('collapse',)
        }),
        ('التواريخ', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def duration_display(self, obj):
        total_seconds = int(obj.duration.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        if hours > 0:
            return f'{hours}س {minutes}د'
        return f'{minutes}د'
    duration_display.short_description = 'المدة'
    
    def end_time_display(self, obj):
        return obj.end_time
    end_time_display.short_description = 'وقت الانتهاء'
    
    def status_display(self, obj):
        now = timezone.now()
        if obj.is_ongoing:
            if obj.meeting_type == 'LIVE' and obj.is_live_started:
                return format_html('<span style="color: #dc3545; font-weight: bold;">🔴 مباشر نشط</span>')
            return format_html('<span style="color: #ffc107; font-weight: bold;">⏳ جارٍ</span>')
        elif obj.is_past:
            return format_html('<span style="color: #6c757d;">✅ منتهي</span>')
        else:
            return format_html('<span style="color: #28a745;">📅 قادم</span>')
    status_display.short_description = 'الحالة'
    
    def participants_count(self, obj):
        count = obj.participants.count()
        if count > 0:
            url = reverse('admin:meetings_participant_changelist') + f'?meeting__id__exact={obj.id}'
            return format_html('<a href="{}">{} مشارك</a>', url, count)
        return '0 مشارك'
    participants_count.short_description = 'المشاركين'
    
    def attendance_rate_display(self, obj):
        try:
            rate = obj.attendance_rate
            # Ensure rate is a numeric value
            if hasattr(rate, '__float__'):
                rate_value = float(rate)
            else:
                rate_value = 0.0
                
            if rate_value == 0:
                return '0%'
            elif rate_value >= 80:
                color = '#28a745'
            elif rate_value >= 60:
                color = '#ffc107'
            else:
                color = '#dc3545'
            formatted_rate = f"{rate_value:.1f}%"
            return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, formatted_rate)
        except (ValueError, TypeError, AttributeError):
            return '0%'
    attendance_rate_display.short_description = 'معدل الحضور'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('creator').prefetch_related('participants')
    
    actions = ['start_live_meetings', 'end_live_meetings', 'send_reminders']
    
    def start_live_meetings(self, request, queryset):
        started_count = 0
        for meeting in queryset.filter(meeting_type='LIVE', is_live_started=False):
            meeting.start_live_meeting()
            started_count += 1
        
        if started_count:
            self.message_user(request, f'تم بدء {started_count} اجتماع مباشر.')
        else:
            self.message_user(request, 'لا توجد اجتماعات مباشرة قابلة للبدء.', level='warning')
    start_live_meetings.short_description = "بدء الاجتماعات المباشرة المحددة"
    
    def end_live_meetings(self, request, queryset):
        ended_count = 0
        for meeting in queryset.filter(meeting_type='LIVE', is_live_started=True, live_ended_at__isnull=True):
            meeting.end_live_meeting()
            ended_count += 1
        
        if ended_count:
            self.message_user(request, f'تم إنهاء {ended_count} اجتماع مباشر.')
        else:
            self.message_user(request, 'لا توجد اجتماعات مباشرة نشطة.', level='warning')
    end_live_meetings.short_description = "إنهاء الاجتماعات المباشرة المحددة"
    
    def send_reminders(self, request, queryset):
        sent_count = 0
        for meeting in queryset.filter(start_time__gt=timezone.now()):
            meeting.setup_notifications()
            sent_count += 1
        
        if sent_count:
            self.message_user(request, f'تم إعداد تذكيرات لـ {sent_count} اجتماع.')
        else:
            self.message_user(request, 'لا توجد اجتماعات قادمة.', level='warning')
    send_reminders.short_description = "إرسال تذكيرات للاجتماعات المحددة"


@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = (
        'meeting_title', 'user', 'attendance_status', 'attendance_time',
        'exit_time', 'duration_display', 'attendance_percentage'
    )
    list_filter = ('is_attending', 'meeting__meeting_type', 'attendance_time')
    search_fields = (
        'meeting__title', 'user__username', 'user__first_name', 'user__last_name'
    )
    readonly_fields = ('attendance_duration',)
    
    fieldsets = (
        ('معلومات المشاركة', {
            'fields': ('meeting', 'user', 'is_attending')
        }),
        ('تفاصيل الحضور', {
            'fields': ('attendance_time', 'exit_time', 'attendance_duration')
        }),
    )
    
    def meeting_title(self, obj):
        url = reverse('admin:meetings_meeting_change', args=[obj.meeting.id])
        return format_html('<a href="{}">{}</a>', url, obj.meeting.title[:30] + '...')
    meeting_title.short_description = 'الاجتماع'
    
    def attendance_status(self, obj):
        if obj.is_attending:
            if obj.exit_time:
                return format_html('<span style="color: #28a745;">✅ حضر وغادر</span>')
            else:
                return format_html('<span style="color: #007bff;">🟢 متصل حالياً</span>')
        else:
            return format_html('<span style="color: #dc3545;">❌ لم يحضر</span>')
    attendance_status.short_description = 'حالة الحضور'
    
    def duration_display(self, obj):
        if obj.attendance_duration:
            total_seconds = int(obj.attendance_duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            if hours > 0:
                return f'{hours}س {minutes}د'
            return f'{minutes}د'
        return '-'
    duration_display.short_description = 'مدة الحضور'
    
    def attendance_percentage(self, obj):
        if obj.attendance_duration and obj.meeting.duration:
            percentage = (obj.attendance_duration.total_seconds() / obj.meeting.duration.total_seconds()) * 100
            percentage_value = float(percentage)
            if percentage_value >= 80:
                color = '#28a745'
            elif percentage_value >= 60:
                color = '#ffc107'
            else:
                color = '#dc3545'
            formatted_percentage = f"{percentage_value:.1f}%"
            return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, formatted_percentage)
        return '0%'
    attendance_percentage.short_description = 'نسبة الحضور'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('meeting', 'user')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        'meeting_title', 'notification_type', 'scheduled_time', 
        'recipients_count', 'sent_status', 'sent_at'
    )
    list_filter = ('notification_type', 'sent', 'scheduled_time', 'meeting__meeting_type')
    search_fields = ('meeting__title', 'message', 'recipients__username')
    filter_horizontal = ('recipients',)
    readonly_fields = ('sent_at', 'recipients_count')
    
    fieldsets = (
        ('معلومات الإشعار', {
            'fields': ('meeting', 'notification_type', 'message')
        }),
        ('الجدولة والإرسال', {
            'fields': ('scheduled_time', 'sent', 'sent_at')
        }),
        ('المستلمون', {
            'fields': ('recipients', 'recipients_count')
        }),
    )
    
    def meeting_title(self, obj):
        url = reverse('admin:meetings_meeting_change', args=[obj.meeting.id])
        return format_html('<a href="{}">{}</a>', url, obj.meeting.title[:30] + '...')
    meeting_title.short_description = 'الاجتماع'
    
    def recipients_count(self, obj):
        count = obj.recipients.count()
        return f'{count} مستلم'
    recipients_count.short_description = 'عدد المستلمين'
    
    def sent_status(self, obj):
        if obj.sent:
            return format_html('<span style="color: #28a745;">✅ تم الإرسال</span>')
        elif obj.scheduled_time <= timezone.now():
            return format_html('<span style="color: #dc3545;">⏰ متأخر</span>')
        else:
            return format_html('<span style="color: #6c757d;">⏳ مجدول</span>')
    sent_status.short_description = 'حالة الإرسال'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('meeting').prefetch_related('recipients')
    
    actions = ['send_notifications']
    
    def send_notifications(self, request, queryset):
        sent_count = 0
        for notification in queryset.filter(sent=False):
            notification.send()
            sent_count += 1
        
        if sent_count:
            self.message_user(request, f'تم إرسال {sent_count} إشعار.')
        else:
            self.message_user(request, 'لا توجد إشعارات قابلة للإرسال.', level='warning')
    send_notifications.short_description = "إرسال الإشعارات المحددة"


@admin.register(MeetingChat)
class MeetingChatAdmin(admin.ModelAdmin):
    list_display = ('meeting_title', 'user', 'message_preview', 'timestamp', 'is_system_message')
    list_filter = ('is_system_message', 'timestamp', 'meeting__meeting_type')
    search_fields = ('meeting__title', 'user__username', 'message')
    readonly_fields = ('timestamp',)
    
    fieldsets = (
        ('معلومات الرسالة', {
            'fields': ('meeting', 'user', 'message', 'is_system_message')
        }),
        ('التوقيت', {
            'fields': ('timestamp',)
        }),
    )
    
    def meeting_title(self, obj):
        url = reverse('admin:meetings_meeting_change', args=[obj.meeting.id])
        return format_html('<a href="{}">{}</a>', url, obj.meeting.title[:20] + '...')
    meeting_title.short_description = 'الاجتماع'
    
    def message_preview(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    message_preview.short_description = 'الرسالة'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('meeting', 'user') 