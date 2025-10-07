from rest_framework import serializers
from django.utils import timezone
from .models import Notification
from users.models import Profile
from courses.models import Course
from django.contrib.auth.models import User


class NotificationBasicSerializer(serializers.ModelSerializer):
    """Serializer for basic notification information"""
    sender_name = serializers.CharField(source='sender.profile.name', read_only=True)
    sender_image = serializers.SerializerMethodField()
    time_since = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 'is_read',
            'sender_name', 'sender_image', 'time_since', 'created_at'
        ]
    
    def get_sender_image(self, obj):
        if obj.sender and obj.sender.profile.image_profile:
            return obj.sender.profile.image_profile.url
        return None
    
    def get_time_since(self, obj):
        """Calculate time since notification was created"""
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            return f"منذ {diff.days} يوم"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"منذ {hours} ساعة"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"منذ {minutes} دقيقة"
        else:
            return "الآن"


class NotificationDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed notification information"""
    sender = serializers.SerializerMethodField()
    recipient = serializers.SerializerMethodField()
    related_object_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 'is_read',
            'sender', 'recipient', 'related_object_details',
            'created_at', 'read_at'
        ]
    
    def get_sender(self, obj):
        if obj.sender:
            return {
                'id': obj.sender.id,
                'name': obj.sender.profile.name,
                'email': obj.sender.email,
                'image': obj.sender.profile.image_profile.url if obj.sender.profile.image_profile else None,
                'user_type': obj.sender.profile.status
            }
        return None
    
    def get_recipient(self, obj):
        return {
            'id': obj.recipient.id,
            'name': obj.recipient.profile.name,
            'email': obj.recipient.email
        }
    
    def get_related_object_details(self, obj):
        """Get details about related object based on notification type"""
        if obj.notification_type == 'course_enrollment' and obj.related_course:
            return {
                'type': 'course',
                'id': obj.related_course.id,
                'name': obj.related_course.name,
                'url': f'/courses/{obj.related_course.id}/'
            }
        elif obj.notification_type == 'meeting_invitation' and obj.related_meeting:
            return {
                'type': 'meeting',
                'id': obj.related_meeting.id,
                'title': obj.related_meeting.title,
                'url': f'/meetings/{obj.related_meeting.id}/'
            }
        elif obj.notification_type == 'assignment_due' and obj.related_assignment:
            return {
                'type': 'assignment',
                'id': obj.related_assignment.id,
                'title': obj.related_assignment.title,
                'url': f'/assignments/{obj.related_assignment.id}/'
            }
        return None


class NotificationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating notifications"""
    
    class Meta:
        model = Notification
        fields = [
            'title', 'message', 'notification_type', 'recipient',
            'related_course', 'related_meeting', 'related_assignment'
        ]
    
    def validate(self, data):
        """Validate notification data"""
        notification_type = data.get('notification_type')
        
        # Validate related objects based on type
        if notification_type == 'course_enrollment' and not data.get('related_course'):
            raise serializers.ValidationError({
                'related_course': 'مطلوب تحديد الدورة للإشعارات المتعلقة بالتسجيل'
            })
        elif notification_type == 'meeting_invitation' and not data.get('related_meeting'):
            raise serializers.ValidationError({
                'related_meeting': 'مطلوب تحديد الاجتماع للإشعارات المتعلقة بالاجتماعات'
            })
        elif notification_type == 'assignment_due' and not data.get('related_assignment'):
            raise serializers.ValidationError({
                'related_assignment': 'مطلوب تحديد الواجب للإشعارات المتعلقة بالواجبات'
            })
        
        return data
    
    def create(self, validated_data):
        """Create notification with sender"""
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)


class BulkNotificationSerializer(serializers.Serializer):
    """Serializer for sending bulk notifications"""
    title = serializers.CharField(max_length=255)
    message = serializers.CharField()
    notification_type = serializers.ChoiceField(choices=Notification.NOTIFICATION_TYPES)
    recipient_type = serializers.ChoiceField(choices=[
        ('all', 'جميع المستخدمين'),
        ('students', 'الطلاب فقط'),
        ('teachers', 'المعلمين فقط'),
        ('course_students', 'طلاب دورة محددة'),
        ('specific_users', 'مستخدمين محددين')
    ])
    recipient_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True
    )
    course_id = serializers.IntegerField(required=False)
    
    def validate(self, data):
        """Validate bulk notification data"""
        recipient_type = data.get('recipient_type')
        
        if recipient_type == 'specific_users' and not data.get('recipient_ids'):
            raise serializers.ValidationError({
                'recipient_ids': 'مطلوب تحديد المستخدمين للإشعار المحدد'
            })
        
        if recipient_type == 'course_students' and not data.get('course_id'):
            raise serializers.ValidationError({
                'course_id': 'مطلوب تحديد الدورة لإرسال إشعار لطلابها'
            })
        
        return data


class NotificationMarkReadSerializer(serializers.Serializer):
    """Serializer for marking notifications as read"""
    notification_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )
    
    def validate_notification_ids(self, value):
        """Validate notification IDs belong to current user"""
        user = self.context['request'].user
        user_notifications = Notification.objects.filter(
            recipient=user,
            id__in=value
        ).values_list('id', flat=True)
        
        invalid_ids = set(value) - set(user_notifications)
        if invalid_ids:
            raise serializers.ValidationError(
                f"الإشعارات التالية غير موجودة أو لا تخصك: {list(invalid_ids)}"
            )
        
        return value


class NotificationSettingsSerializer(serializers.Serializer):
    """Serializer for user notification preferences"""
    email_notifications = serializers.BooleanField(default=True)
    course_updates = serializers.BooleanField(default=True)
    meeting_reminders = serializers.BooleanField(default=True)
    assignment_deadlines = serializers.BooleanField(default=True)
    new_messages = serializers.BooleanField(default=True)
    system_announcements = serializers.BooleanField(default=True)
    
    def validate(self, data):
        """Validate notification settings"""
        # At least one notification type should be enabled
        notification_types = [
            'course_updates', 'meeting_reminders', 'assignment_deadlines',
            'new_messages', 'system_announcements'
        ]
        
        if not any(data.get(key, False) for key in notification_types):
            raise serializers.ValidationError(
                "يجب تفعيل نوع واحد على الأقل من الإشعارات"
            )
        
        return data


class NotificationFilterSerializer(serializers.Serializer):
    """Serializer for filtering notifications"""
    notification_type = serializers.ChoiceField(
        choices=Notification.NOTIFICATION_TYPES,
        required=False,
        allow_blank=True
    )
    is_read = serializers.BooleanField(required=False)
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    sender_id = serializers.IntegerField(required=False)
    search = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        """Validate date range"""
        date_from = data.get('date_from')
        date_to = data.get('date_to')
        
        if date_from and date_to and date_from > date_to:
            raise serializers.ValidationError({
                'date_to': "تاريخ النهاية يجب أن يكون بعد تاريخ البداية"
            })
        
        return data 
