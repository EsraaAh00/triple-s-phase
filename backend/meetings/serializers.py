from rest_framework import serializers
from .models import Meeting, Participant, Notification, MeetingChat, MeetingInvitation

from django.contrib.auth.models import User
from django.utils import timezone
from datetime import datetime, timedelta
from users.models import Profile


class MeetingBasicSerializer(serializers.ModelSerializer):
    """Serializer for basic meeting information"""
    creator_name = serializers.CharField(source='creator.profile.name', read_only=True)
    creator_image = serializers.SerializerMethodField()
    participants_count = serializers.SerializerMethodField()
    user_is_registered = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    start_time = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()
    updated_at = serializers.SerializerMethodField()
    
    class Meta:
        model = Meeting
        fields = [
            'id', 'title', 'description', 'meeting_type', 'start_time',
            'duration', 'zoom_link', 'max_participants', 'status',
            'creator_name', 'creator_image', 'participants_count', 'user_is_registered',
            'enable_screen_share', 'enable_chat', 'enable_recording', 'created_at', 'updated_at', 'is_active'
        ]
    
    def get_start_time(self, obj):
        """Format start_time as ISO string"""
        if obj.start_time:
            # Format as YYYY-MM-DDTHH:MM:SS
            return obj.start_time.strftime('%Y-%m-%dT%H:%M:%S')
        return None
    
    def get_created_at(self, obj):
        """Format created_at as ISO string"""
        if obj.created_at:
            return obj.created_at.strftime('%Y-%m-%dT%H:%M:%S')
        return None
    
    def get_updated_at(self, obj):
        """Format updated_at as ISO string"""
        if obj.updated_at:
            return obj.updated_at.strftime('%Y-%m-%dT%H:%M:%S')
        return None
    
    def get_creator_image(self, obj):
        if obj.creator.profile.image_profile:
            return obj.creator.profile.image_profile.url
        return None
    
    def get_participants_count(self, obj):
        return obj.participants.count()
    
    def get_user_is_registered(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.participants.filter(user=request.user).exists()
        return False
    
    def get_status(self, obj):
        now = timezone.now()
        if obj.start_time > now:
            return 'upcoming'
        elif obj.start_time <= now and obj.start_time + obj.duration >= now:
            return 'ongoing'
        else:
            return 'completed'


class MeetingDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed meeting information"""
    creator = serializers.SerializerMethodField()
    participants = serializers.SerializerMethodField()
    materials_url = serializers.SerializerMethodField()
    user_is_registered = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    start_time = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()
    updated_at = serializers.SerializerMethodField()
    
    class Meta:
        model = Meeting
        fields = [
            'id', 'title', 'description', 'meeting_type', 'start_time',
            'duration', 'zoom_link', 'materials_url', 'max_participants',
            'enable_screen_share', 'enable_chat', 'enable_recording',
            'creator', 'participants', 'user_is_registered', 'status',
            'can_edit', 'can_delete', 'created_at', 'updated_at', 'is_active'
        ]
    
    def get_start_time(self, obj):
        """Format start_time as ISO string"""
        if obj.start_time:
            # Format as YYYY-MM-DDTHH:MM:SS
            return obj.start_time.strftime('%Y-%m-%dT%H:%M:%S')
        return None
    
    def get_created_at(self, obj):
        """Format created_at as ISO string"""
        if obj.created_at:
            return obj.created_at.strftime('%Y-%m-%dT%H:%M:%S')
        return None
    
    def get_updated_at(self, obj):
        """Format updated_at as ISO string"""
        if obj.updated_at:
            return obj.updated_at.strftime('%Y-%m-%dT%H:%M:%S')
        return None
    
    def get_creator(self, obj):
        return {
            'id': obj.creator.id,
            'name': obj.creator.profile.name,
            'email': obj.creator.email,
            'image': obj.creator.profile.image_profile.url if obj.creator.profile.image_profile else None,
            'is_teacher': obj.creator.profile.status == 'Instructor'
        }
    
    def get_participants(self, obj):
        participants = obj.participants.select_related('user__profile')
        return [{
            'id': p.user.id,
            'name': p.user.profile.name,
            'email': p.user.email,
            'image': p.user.profile.image_profile.url if p.user.profile.image_profile else None,
            'joined_at': p.joined_at.strftime('%Y-%m-%dT%H:%M:%S') if p.joined_at else None,
            'attendance_status': p.attendance_status
        } for p in participants]
    
    def get_materials_url(self, obj):
        if obj.materials:
            return obj.materials.url
        return None
    
    def get_user_is_registered(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.participants.filter(user=request.user).exists()
        return False
    
    def get_status(self, obj):
        now = timezone.now()
        if obj.start_time > now:
            return 'upcoming'
        elif obj.start_time <= now and obj.start_time + obj.duration >= now:
            return 'ongoing'
        else:
            return 'completed'
    
    def get_can_edit(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.creator == request.user or request.user.profile.status in ['Admin', 'Manager']
        return False
    
    def get_can_delete(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.creator == request.user or request.user.profile.status in ['Admin', 'Manager']
        return False


class MeetingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating meetings"""
    
    class Meta:
        model = Meeting
        fields = [
            'title', 'description', 'meeting_type', 'start_time',
            'duration', 'zoom_link', 'materials', 'max_participants',
            'enable_screen_share', 'enable_chat', 'enable_recording'
        ]
    
    def validate_start_time(self, value):
        """Validate that start_time is in the future"""
        if value < timezone.now():
            raise serializers.ValidationError("لا يمكن إنشاء اجتماع في الماضي")
        return value
    
    def validate(self, data):
        """Validate meeting specific requirements"""
        meeting_type = data.get('meeting_type')
        zoom_link = data.get('zoom_link')
        max_participants = data.get('max_participants')
        
        if meeting_type == 'ZOOM' and not zoom_link:
            raise serializers.ValidationError({
                'zoom_link': "يجب إضافة رابط زووم للاجتماعات عن بعد"
            })
        
        if meeting_type == 'LIVE' and max_participants:
            if max_participants < 2:
                raise serializers.ValidationError({
                    'max_participants': "يجب أن يكون الحد الأقصى للمشاركين أكثر من 2"
                })
            if max_participants > 200:
                raise serializers.ValidationError({
                    'max_participants': "الحد الأقصى للمشاركين لا يمكن أن يتجاوز 200"
                })
        
        return data
    
    def create(self, validated_data):
        """Create meeting with current user as creator"""
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)


class MeetingUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating meetings"""
    
    class Meta:
        model = Meeting
        fields = [
            'title', 'description', 'meeting_type', 'start_time',
            'duration', 'zoom_link', 'materials', 'max_participants',
            'enable_screen_share', 'enable_chat', 'enable_recording'
        ]
    
    def validate_start_time(self, value):
        """Validate that start_time is in the future"""
        if value < timezone.now():
            raise serializers.ValidationError("لا يمكن تحديد وقت اجتماع في الماضي")
        return value
    
    def validate(self, data):
        """Validate meeting specific requirements"""
        meeting_type = data.get('meeting_type')
        zoom_link = data.get('zoom_link')
        max_participants = data.get('max_participants')
        
        if meeting_type == 'ZOOM' and not zoom_link:
            raise serializers.ValidationError({
                'zoom_link': "يجب إضافة رابط زووم للاجتماعات عن بعد"
            })
        
        if meeting_type == 'LIVE' and max_participants:
            if max_participants < 2:
                raise serializers.ValidationError({
                    'max_participants': "يجب أن يكون الحد الأقصى للمشاركين أكثر من 2"
                })
            if max_participants > 200:
                raise serializers.ValidationError({
                    'max_participants': "الحد الأقصى للمشاركين لا يمكن أن يتجاوز 200"
                })
        
        return data


class MeetingParticipantSerializer(serializers.ModelSerializer):
    """Serializer for meeting participants"""
    user_name = serializers.CharField(source='user.profile.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Participant
        fields = [
            'id', 'user_name', 'user_email', 'user_image',
            'joined_at', 'attendance_status'
        ]
    
    def get_user_image(self, obj):
        if obj.user.profile.image_profile:
            return obj.user.profile.image_profile.url
        return None


class MeetingRegistrationSerializer(serializers.Serializer):
    """Serializer for meeting registration"""
    meeting_id = serializers.IntegerField()
    
    def validate_meeting_id(self, value):
        """Validate meeting exists and is future"""
        try:
            meeting = Meeting.objects.get(id=value)
        except Meeting.DoesNotExist:
            raise serializers.ValidationError("الاجتماع غير موجود")
        
        if meeting.start_time < timezone.now():
            raise serializers.ValidationError("لا يمكن التسجيل في اجتماع انتهى")
        
        return value


class MeetingFilterSerializer(serializers.Serializer):
    """Serializer for filtering meetings"""
    meeting_type = serializers.ChoiceField(
        choices=Meeting.MEETING_TYPES,
        required=False,
        allow_blank=True
    )
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    is_past = serializers.BooleanField(required=False)
    search = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        """Validate date range"""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({
                'end_date': "تاريخ النهاية يجب أن يكون بعد تاريخ البداية"
            })
        
        return data


class MeetingAttendanceSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_image = serializers.ImageField(source='user.profile.image_profile', read_only=True)
    meeting_title = serializers.CharField(source='meeting.title', read_only=True)
    
    class Meta:
        model = Participant
        fields = [
            'id', 'meeting', 'meeting_title', 'user', 'user_name', 'user_image',
            'joined_at', 'left_at', 'is_attended', 'attendance_duration'
        ]
        read_only_fields = ['id', 'user', 'joined_at', 'left_at', 'attendance_duration']


class MeetingInvitationSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    meeting_title = serializers.CharField(source='meeting.title', read_only=True)
    
    class Meta:
        model = MeetingInvitation
        fields = [
            'id', 'meeting', 'meeting_title', 'user', 'user_name', 'user_email',
            'message', 'response', 'responded_at', 'created_at'
        ]
        read_only_fields = ['id', 'responded_at', 'created_at']


class MeetingRecordingSerializer(serializers.ModelSerializer):
    meeting_title = serializers.CharField(source='meeting.title', read_only=True)
    file_size = serializers.SerializerMethodField()
    
    class Meta:
        model = MeetingChat
        fields = [
            'id', 'meeting', 'meeting_title', 'title', 'description',
            'file', 'file_size', 'duration', 'created_at', 'is_available'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_file_size(self, obj):
        if obj.file:
            try:
                return obj.file.size
            except:
                return None
        return None


class MeetingStatsSerializer(serializers.Serializer):
    total_meetings = serializers.IntegerField()
    upcoming_meetings = serializers.IntegerField()
    completed_meetings = serializers.IntegerField()
    total_participants = serializers.IntegerField()
    average_attendance = serializers.FloatField()
    total_recordings = serializers.IntegerField()


class MeetingJoinSerializer(serializers.Serializer):
    meeting_id = serializers.IntegerField()
    
    def validate_meeting_id(self, value):
        try:
            meeting = Meeting.objects.get(id=value)
            return value
        except Meeting.DoesNotExist:
            raise serializers.ValidationError("الاجتماع غير موجود")


class QuickMeetingSerializer(serializers.ModelSerializer):
    """
    لإنشاء اجتماع سريع
    """
    class Meta:
        model = Meeting
        fields = [
            'title', 'description', 'meeting_type', 'duration', 'max_participants'
        ]
    
    def create(self, validated_data):
        # Set start time to now + 5 minutes
        validated_data['start_time'] = timezone.now() + timedelta(minutes=5)
        validated_data['is_active'] = True
        validated_data['creator'] = self.context['request'].user
        
        return super().create(validated_data)


class ParticipantSerializer(serializers.ModelSerializer):
    """Serializer for Participant model"""
    user_name = serializers.CharField(source='user.profile.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_image = serializers.SerializerMethodField()
    meeting_title = serializers.CharField(source='meeting.title', read_only=True)
    
    class Meta:
        model = Participant
        fields = [
            'id', 'meeting', 'meeting_title', 'user', 'user_name', 
            'user_email', 'user_image', 'joined_at', 'attendance_status'
        ]
        read_only_fields = ['id', 'joined_at']
    
    def get_user_image(self, obj):
        if obj.user.profile.image_profile:
            return obj.user.profile.image_profile.url
        return None


class MeetingChatSerializer(serializers.ModelSerializer):
    """Serializer for meeting chat messages"""
    user_name = serializers.CharField(source='user.profile.name', read_only=True)
    user_image = serializers.SerializerMethodField()
    is_teacher = serializers.SerializerMethodField()
    created_at_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = MeetingChat
        fields = [
            'id', 'meeting', 'user', 'user_name', 'user_image', 'message',
            'is_teacher', 'timestamp', 'created_at_formatted'
        ]
    
    def get_user_image(self, obj):
        if obj.user.profile.image_profile:
            return obj.user.profile.image_profile.url
        return None
    
    def get_is_teacher(self, obj):
        return obj.user.profile.status == 'Instructor'
    
    def get_created_at_formatted(self, obj):
        if obj.timestamp:
            return obj.timestamp.strftime('%H:%M')
        return None


class MeetingParticipantSerializer(serializers.ModelSerializer):
    """Serializer for meeting participants (basic info)"""
    user_name = serializers.CharField(source='user.profile.name', read_only=True)
    user_image = serializers.SerializerMethodField()
    is_teacher = serializers.SerializerMethodField()
    join_time_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = Participant
        fields = [
            'id', 'user', 'user_name', 'user_image', 'is_teacher',
            'attendance_status', 'joined_at', 'join_time_formatted'
        ]
    
    def get_user_image(self, obj):
        if obj.user.profile.image_profile:
            return obj.user.profile.image_profile.url
        return None
    
    def get_is_teacher(self, obj):
        return obj.user.profile.status == 'Instructor'
    
    def get_join_time_formatted(self, obj):
        if obj.joined_at:
            return obj.joined_at.strftime('%H:%M')
        return None
