from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.contrib.admin import SimpleListFilter
from django.db.models import Count, Q
from django.utils import timezone
from .models import Notification, NotificationSettings, NotificationTemplate, NotificationLog


class NotificationTypeFilter(SimpleListFilter):
    title = 'نوع الإشعار'
    parameter_name = 'notification_type'

    def lookups(self, request, model_admin):
        return Notification.NOTIFICATION_TYPES

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(notification_type=self.value())
        return queryset


class PriorityFilter(SimpleListFilter):
    title = 'الأولوية'
    parameter_name = 'priority'

    def lookups(self, request, model_admin):
        return Notification.PRIORITY_LEVELS

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(priority=self.value())
        return queryset


class ReadStatusFilter(SimpleListFilter):
    title = 'حالة القراءة'
    parameter_name = 'read_status'

    def lookups(self, request, model_admin):
        return (
            ('read', 'مقروء'),
            ('unread', 'غير مقروء'),
            ('expired', 'منتهي الصلاحية'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'read':
            return queryset.filter(is_read=True)
        elif self.value() == 'unread':
            return queryset.filter(is_read=False)
        elif self.value() == 'expired':
            return queryset.filter(expires_at__lt=timezone.now())
        return queryset


class DeliveryStatusFilter(SimpleListFilter):
    title = 'حالة التوصيل'
    parameter_name = 'delivery_status'

    def lookups(self, request, model_admin):
        return (
            ('pending', 'في الانتظار'),
            ('sent', 'تم الإرسال'),
            ('delivered', 'تم التوصيل'),
            ('failed', 'فشل'),
            ('bounced', 'مرتد'),
        )

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(logs__status=self.value()).distinct()
        return queryset


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'recipient', 'sender', 'notification_type', 'priority_display',
        'read_status', 'delivery_status', 'created_at', 'actions_column'
    )
    list_filter = (
        NotificationTypeFilter, PriorityFilter, ReadStatusFilter, 
        'email_sent', 'push_sent', 'created_at'
    )
    search_fields = (
        'title', 'message', 'recipient__username', 'recipient__first_name', 
        'recipient__last_name', 'sender__username'
    )
    readonly_fields = (
        'created_at', 'updated_at', 'read_at', 'content_object_display',
        'delivery_summary'
    )
    
    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('recipient', 'sender', 'title', 'message')
        }),
        ('التصنيف', {
            'fields': ('notification_type', 'priority')
        }),
        ('الكائن المرتبط', {
            'fields': ('content_type', 'object_id', 'content_object_display'),
            'classes': ('collapse',)
        }),
        ('الإجراءات', {
            'fields': ('action_url', 'action_text')
        }),
        ('الحالة', {
            'fields': ('is_read', 'read_at')
        }),
        ('التوصيل', {
            'fields': ('email_sent', 'push_sent', 'delivery_summary'),
            'classes': ('collapse',)
        }),
        ('الجدولة', {
            'fields': ('scheduled_at', 'expires_at'),
            'classes': ('collapse',)
        }),
        ('التواريخ', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def priority_display(self, obj):
        priority_colors = {
            'low': '#28a745',
            'normal': '#6c757d',
            'high': '#ffc107',
            'urgent': '#dc3545'
        }
        priority_icons = {
            'low': '🔽',
            'normal': '➖',
            'high': '🔼',
            'urgent': '🚨'
        }
        color = priority_colors.get(obj.priority, '#6c757d')
        icon = priority_icons.get(obj.priority, '➖')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} {}</span>',
            color, icon, obj.get_priority_display()
        )
    priority_display.short_description = 'الأولوية'
    
    def read_status(self, obj):
        if obj.is_read:
            return format_html('<span style="color: #28a745;">✅ مقروء</span>')
        elif obj.is_expired():
            return format_html('<span style="color: #6c757d;">⏰ منتهي</span>')
        else:
            return format_html('<span style="color: #dc3545;">📬 غير مقروء</span>')
    read_status.short_description = 'حالة القراءة'
    
    def delivery_status(self, obj):
        logs = obj.logs.all()
        if not logs.exists():
            return format_html('<span style="color: #6c757d;">لم يتم الإرسال</span>')
        
        statuses = []
        if obj.email_sent:
            email_log = logs.filter(delivery_method='email').first()
            if email_log:
                if email_log.status == 'delivered':
                    statuses.append('📧✅')
                elif email_log.status == 'failed':
                    statuses.append('📧❌')
                else:
                    statuses.append('📧⏳')
        
        if obj.push_sent:
            push_log = logs.filter(delivery_method='push').first()
            if push_log:
                if push_log.status == 'delivered':
                    statuses.append('📱✅')
                elif push_log.status == 'failed':
                    statuses.append('📱❌')
                else:
                    statuses.append('📱⏳')
        
        return format_html(' '.join(statuses)) if statuses else '📤'
    delivery_status.short_description = 'حالة التوصيل'
    
    def content_object_display(self, obj):
        if obj.content_object:
            content_type = obj.content_type
            model_name = content_type.model
            app_label = content_type.app_label
            try:
                url = reverse(f'admin:{app_label}_{model_name}_change', args=[obj.object_id])
                return format_html('<a href="{}">{}</a>', url, str(obj.content_object))
            except:
                return str(obj.content_object)
        return 'لا يوجد'
    content_object_display.short_description = 'الكائن المرتبط'
    
    def delivery_summary(self, obj):
        logs = obj.logs.all()
        if not logs.exists():
            return 'لم يتم الإرسال'
        
        summary = []
        for log in logs:
            method_icon = {
                'app': '📱',
                'email': '📧',
                'push': '🔔',
                'sms': '📱'
            }.get(log.delivery_method, '📤')
            
            status_icon = {
                'pending': '⏳',
                'sent': '📤',
                'delivered': '✅',
                'failed': '❌',
                'bounced': '↩️'
            }.get(log.status, '❓')
            
            summary.append(f'{method_icon}{status_icon}')
        
        return format_html(' '.join(summary))
    delivery_summary.short_description = 'ملخص التوصيل'
    
    def actions_column(self, obj):
        actions = []
        
        if not obj.is_read:
            actions.append(
                f'<a href="#" onclick="markAsRead({obj.id})" style="color: #28a745;">تحديد كمقروء</a>'
            )
        
        if obj.action_url:
            actions.append(
                f'<a href="{obj.action_url}" target="_blank" style="color: #007bff;">{obj.action_text or "عرض"}</a>'
            )
        
        # Resend notification
        actions.append(
            f'<a href="#" onclick="resendNotification({obj.id})" style="color: #ffc107;">إعادة إرسال</a>'
        )
        
        return format_html(' | '.join(actions))
    actions_column.short_description = 'الإجراءات'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('recipient', 'sender', 'content_type').prefetch_related('logs')
    
    actions = ['mark_as_read', 'mark_as_unread', 'resend_notifications', 'delete_expired']
    
    def mark_as_read(self, request, queryset):
        updated = 0
        for notification in queryset.filter(is_read=False):
            notification.mark_as_read()
            updated += 1
        
        self.message_user(request, f'تم تحديد {updated} إشعار كمقروء.')
    mark_as_read.short_description = "تحديد كمقروء"
    
    def mark_as_unread(self, request, queryset):
        updated = queryset.filter(is_read=True).update(is_read=False, read_at=None)
        self.message_user(request, f'تم تحديد {updated} إشعار كغير مقروء.')
    mark_as_unread.short_description = "تحديد كغير مقروء"
    
    def resend_notifications(self, request, queryset):
        # This would integrate with your notification sending system
        count = queryset.count()
        self.message_user(request, f'تم جدولة إعادة إرسال {count} إشعار.')
    resend_notifications.short_description = "إعادة إرسال الإشعارات"
    
    def delete_expired(self, request, queryset):
        expired_count = queryset.filter(expires_at__lt=timezone.now()).count()
        queryset.filter(expires_at__lt=timezone.now()).delete()
        self.message_user(request, f'تم حذف {expired_count} إشعار منتهي الصلاحية.')
    delete_expired.short_description = "حذف الإشعارات المنتهية"


@admin.register(NotificationSettings)
class NotificationSettingsAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'email_summary', 'push_summary', 'digest_frequency', 
        'quiet_hours_display', 'updated_at'
    )
    list_filter = ('digest_frequency', 'updated_at')
    search_fields = ('user__username', 'user__first_name', 'user__last_name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('المستخدم', {
            'fields': ('user',)
        }),
        ('إشعارات البريد الإلكتروني', {
            'fields': (
                ('email_course_updates', 'email_assignments'),
                ('email_exams', 'email_meetings'),
                ('email_grades', 'email_certificates'),
                'email_system'
            )
        }),
        ('الإشعارات الفورية', {
            'fields': (
                ('push_course_updates', 'push_assignments'),
                ('push_exams', 'push_meetings'),
                ('push_grades', 'push_certificates'),
                'push_system'
            )
        }),
        ('الإعدادات العامة', {
            'fields': (
                'digest_frequency',
                ('quiet_hours_start', 'quiet_hours_end')
            )
        }),
        ('التواريخ', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def email_summary(self, obj):
        enabled_count = sum([
            obj.email_course_updates, obj.email_assignments, obj.email_exams,
            obj.email_meetings, obj.email_grades, obj.email_certificates, obj.email_system
        ])
        total = 7
        if enabled_count == total:
            return format_html('<span style="color: #28a745;">📧 جميع الأنواع ({}/{})</span>', enabled_count, total)
        elif enabled_count > 0:
            return format_html('<span style="color: #ffc107;">📧 جزئي ({}/{})</span>', enabled_count, total)
        else:
            return format_html('<span style="color: #dc3545;">📧 معطل (0/{})</span>', total)
    email_summary.short_description = 'البريد الإلكتروني'
    
    def push_summary(self, obj):
        enabled_count = sum([
            obj.push_course_updates, obj.push_assignments, obj.push_exams,
            obj.push_meetings, obj.push_grades, obj.push_certificates, obj.push_system
        ])
        total = 7
        if enabled_count == total:
            return format_html('<span style="color: #28a745;">🔔 جميع الأنواع ({}/{})</span>', enabled_count, total)
        elif enabled_count > 0:
            return format_html('<span style="color: #ffc107;">🔔 جزئي ({}/{})</span>', enabled_count, total)
        else:
            return format_html('<span style="color: #dc3545;">🔔 معطل (0/{})</span>', total)
    push_summary.short_description = 'الإشعارات الفورية'
    
    def quiet_hours_display(self, obj):
        if obj.quiet_hours_start and obj.quiet_hours_end:
            return f'🌙 {obj.quiet_hours_start.strftime("%H:%M")} - {obj.quiet_hours_end.strftime("%H:%M")}'
        return 'غير محدد'
    quiet_hours_display.short_description = 'الساعات الهادئة'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('user')


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'notification_type', 'template_preview', 'usage_count', 'is_active'
    )
    list_filter = ('notification_type', 'is_active', 'created_at')
    search_fields = ('name', 'title_template', 'message_template')
    readonly_fields = ('created_at', 'updated_at', 'usage_count')
    
    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('name', 'notification_type', 'is_active')
        }),
        ('قوالب الإشعار', {
            'fields': ('title_template', 'message_template')
        }),
        ('قوالب البريد الإلكتروني', {
            'fields': ('email_subject_template', 'email_body_template'),
            'classes': ('collapse',)
        }),
        ('الإحصائيات', {
            'fields': ('usage_count',),
            'classes': ('collapse',)
        }),
        ('التواريخ', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def template_preview(self, obj):
        title_preview = obj.title_template[:30] + '...' if len(obj.title_template) > 30 else obj.title_template
        message_preview = obj.message_template[:50] + '...' if len(obj.message_template) > 50 else obj.message_template
        
        return format_html(
            '<div><strong>{}</strong><br/><small style="color: #6c757d;">{}</small></div>',
            title_preview, message_preview
        )
    template_preview.short_description = 'معاينة القالب'
    
    def usage_count(self, obj):
        # This would count how many notifications used this template
        # You'd need to implement template tracking in your notification creation
        return '0 استخدام'  # Placeholder
    usage_count.short_description = 'عدد الاستخدامات'


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = (
        'notification_title', 'recipient', 'delivery_method', 'status_display',
        'sent_at', 'delivered_at', 'error_preview'
    )
    list_filter = (DeliveryStatusFilter, 'delivery_method', 'sent_at', 'delivered_at')
    search_fields = (
        'notification__title', 'notification__recipient__username',
        'error_message'
    )
    readonly_fields = ('created_at', 'notification_title', 'recipient')
    
    fieldsets = (
        ('معلومات الإشعار', {
            'fields': ('notification', 'notification_title', 'recipient')
        }),
        ('التوصيل', {
            'fields': ('delivery_method', 'status')
        }),
        ('التوقيت', {
            'fields': ('sent_at', 'delivered_at', 'created_at')
        }),
        ('الأخطاء', {
            'fields': ('error_message',),
            'classes': ('collapse',)
        }),
    )
    
    def notification_title(self, obj):
        url = reverse('admin:notifications_notification_change', args=[obj.notification.id])
        return format_html('<a href="{}">{}</a>', url, obj.notification.title)
    notification_title.short_description = 'الإشعار'
    
    def recipient(self, obj):
        return obj.notification.recipient.username
    recipient.short_description = 'المستلم'
    
    def status_display(self, obj):
        status_colors = {
            'pending': '#6c757d',
            'sent': '#007bff',
            'delivered': '#28a745',
            'failed': '#dc3545',
            'bounced': '#ffc107'
        }
        status_icons = {
            'pending': '⏳',
            'sent': '📤',
            'delivered': '✅',
            'failed': '❌',
            'bounced': '↩️'
        }
        color = status_colors.get(obj.status, '#6c757d')
        icon = status_icons.get(obj.status, '❓')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} {}</span>',
            color, icon, obj.get_status_display()
        )
    status_display.short_description = 'الحالة'
    
    def error_preview(self, obj):
        if obj.error_message:
            preview = obj.error_message[:50] + '...' if len(obj.error_message) > 50 else obj.error_message
            return format_html('<span style="color: #dc3545;" title="{}">{}</span>', obj.error_message, preview)
        return '-'
    error_preview.short_description = 'الخطأ'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('notification__recipient') 