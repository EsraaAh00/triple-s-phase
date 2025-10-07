from rest_framework import generics, permissions, status, filters, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg, Count, Sum, F
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import timedelta, datetime
from django.core.paginator import Paginator

from .models import Meeting, Participant, Notification, MeetingChat, MeetingInvitation
from courses.models import Course, Enrollment
from users.models import Instructor, Profile
from .serializers import (
    MeetingDetailSerializer, MeetingCreateSerializer,
    MeetingAttendanceSerializer, MeetingInvitationSerializer,
    MeetingStatsSerializer, QuickMeetingSerializer, MeetingBasicSerializer,
    MeetingUpdateSerializer, MeetingParticipantSerializer, MeetingRegistrationSerializer,
    MeetingFilterSerializer, ParticipantSerializer, MeetingChatSerializer
)


class MeetingViewSet(viewsets.ModelViewSet):
    """إدارة الاجتماعات المباشرة"""
    queryset = Meeting.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['meeting_type', 'creator']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'start_time']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return MeetingCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return MeetingUpdateSerializer
        elif self.action == 'retrieve':
            return MeetingDetailSerializer
        return MeetingBasicSerializer

    def get_queryset(self):
        queryset = self.queryset
        user = self.request.user
        
        # For retrieve action, allow access to all meetings
        if self.action == 'retrieve':
            return queryset
        
        # Filter by user role for list actions
        if user.profile.status == 'Student':
            # Students see meetings they're registered for
            queryset = queryset.filter(participants__user=user).distinct()
        
        elif user.profile.status == 'Instructor':
            # Instructors see meetings they created or are registered for
            queryset = queryset.filter(
                Q(creator=user) | Q(participants__user=user)
            ).distinct()
        
        else:
            # Admins see all meetings
            queryset = queryset
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        now = timezone.now()
        
        if status_filter == 'live':
            # Currently happening meetings
            queryset = queryset.filter(
                start_time__lte=now,
                start_time__gt=now - timedelta(hours=1),  # Assume max 1 hour duration
                is_active=True
            )
        elif status_filter == 'upcoming':
            queryset = queryset.filter(
                start_time__gt=now,
                is_active=True
            )
        elif status_filter == 'completed':
            queryset = queryset.filter(
                start_time__lt=now - timedelta(hours=1)
            )
        
        return queryset.order_by('-start_time')
    
    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        user = request.user
        
        # For retrieve action, allow access to all meetings
        if self.action == 'retrieve':
            return
        
        # For students, check if they are participants (only for non-retrieve actions)
        if not (user.is_superuser or 
                (hasattr(user, 'profile') and user.profile.is_teacher_or_admin())):
            if not obj.participants.filter(user=user).exists():
                raise permissions.PermissionDenied("يجب التسجيل في الاجتماع للوصول إليه")
        
        # For creation/modification, check creator permissions
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            if not (user.is_superuser or 
                    (hasattr(user, 'profile') and user.profile.is_admin()) or
                    obj.creator == user):
                raise permissions.PermissionDenied("ليس لديك صلاحية لتعديل هذا الاجتماع")
    
    def perform_create(self, serializer):
        # Check if user is instructor or admin
        user = self.request.user
        if not (user.is_superuser or 
                (hasattr(user, 'profile') and user.profile.is_teacher_or_admin())):
            raise permissions.PermissionDenied("يجب أن تكون معلماً أو أدمن لإنشاء اجتماع")
        
        serializer.save(creator=self.request.user)
    
    def perform_update(self, serializer):
        """Update meeting with permission check"""
        meeting = self.get_object()
        user = self.request.user
        
        # Check permissions
        if not (meeting.creator == user or 
                user.is_superuser or 
                (hasattr(user, 'profile') and user.profile.is_admin())):
            raise permissions.PermissionDenied("ليس لديك صلاحية لتعديل هذا الاجتماع")
        
        serializer.save()
    
    def perform_destroy(self, instance):
        """Delete meeting with permission check"""
        user = self.request.user
        
        # Check permissions
        if not (instance.creator == user or 
                user.is_superuser or 
                (hasattr(user, 'profile') and user.profile.is_admin())):
            raise permissions.PermissionDenied("ليس لديك صلاحية لحذف هذا الاجتماع")
        
        instance.delete()
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """
        الانضمام للاجتماع
        """
        meeting = self.get_object()
        user = request.user
        
        # Check if meeting is available to join
        now = timezone.now()
        buffer_time = timedelta(minutes=15)  # Allow joining 15 minutes early
        end_time = meeting.start_time + meeting.duration
        
        if not ((meeting.start_time - buffer_time) <= now <= end_time):
            return Response({
                'error': 'الاجتماع غير متاح للانضمام في الوقت الحالي'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not meeting.is_active:
            return Response({
                'error': 'الاجتماع غير نشط'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user is a participant
        if not meeting.participants.filter(user=user).exists():
            return Response({
                'error': 'يجب التسجيل في الاجتماع للانضمام إليه'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if meeting is full
        current_attendees = meeting.participants.filter(
            is_attending=True
        ).count()
        
        if current_attendees >= meeting.max_participants:
            return Response({
                'error': 'الاجتماع ممتلئ'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create participant record
        participant, created = Participant.objects.get_or_create(
            meeting=meeting,
            user=user,
            defaults={
                'attendance_status': 'registered'
            }
        )
        
        # Mark attendance and update join time
        participant.is_attending = True
        participant.attendance_time = timezone.now()
        participant.attendance_status = 'present'
        participant.save()
        
        return Response({
            'message': 'تم الانضمام للاجتماع بنجاح',
            'meeting_url': meeting.zoom_link,
            'participant_id': participant.id
        })
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """
        مغادرة الاجتماع
        """
        meeting = self.get_object()
        user = request.user
        
        try:
            participant = Participant.objects.get(
                meeting=meeting,
                user=user,
                is_attending=True
            )
            
            participant.exit_time = timezone.now()
            participant.is_attending = False
            # Calculate attendance duration
            if participant.attendance_time:
                duration = participant.exit_time - participant.attendance_time
                participant.attendance_duration = duration
            participant.save()
            
            return Response({
                'message': 'تم مغادرة الاجتماع',
                'attendance_duration': str(participant.attendance_duration) if participant.attendance_duration else None
            })
        
        except Participant.DoesNotExist:
            return Response({
                'error': 'لم تنضم للاجتماع بعد'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def participants(self, request, pk=None):
        """
        قائمة المشاركين في الاجتماع
        """
        meeting = self.get_object()
        user = request.user
        
        print(f"Participants request for meeting {meeting.id} by user {user.username}")
        
        # Get all participants
        participants = meeting.participants.select_related('user__profile').all()
        print(f"Found {participants.count()} participants")
        
        # Check permissions for detailed participant info
        if (user.is_superuser or 
            (hasattr(user, 'profile') and user.profile.status == 'Instructor') or
            meeting.creator == user):
            # For teachers/admins, show detailed participant info
            serializer = ParticipantSerializer(participants, many=True)
            print("Using detailed participant serializer")
        else:
            # For students, only show basic participant info
            serializer = MeetingParticipantSerializer(participants, many=True)
            print("Using basic participant serializer")
        
        data = serializer.data
        print(f"Returning {len(data)} participants")
        return Response(data)

    @action(detail=True, methods=['get', 'post'])
    def chat(self, request, pk=None):
        """
        الدردشة في الاجتماع
        """
        meeting = self.get_object()
        user = request.user
        
        if request.method == 'GET':
            # Get chat messages
            print(f"Chat GET request for meeting {meeting.id} by user {user.username}")
            messages = MeetingChat.objects.filter(meeting=meeting).select_related('user__profile').order_by('timestamp')
            print(f"Found {messages.count()} chat messages")
            serializer = MeetingChatSerializer(messages, many=True)
            data = serializer.data
            print(f"Returning {len(data)} chat messages")
            return Response(data)
        
        elif request.method == 'POST':
            # Send a message
            print(f"Chat POST request for meeting {meeting.id} by user {user.username}")
            message_text = request.data.get('message', '').strip()
            print(f"Message text: {message_text}")
            if not message_text:
                return Response({
                    'error': 'الرسالة لا يمكن أن تكون فارغة'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user is a participant or creator
            if not (meeting.participants.filter(user=user).exists() or meeting.creator == user):
                return Response({
                    'error': 'يجب أن تكون مشاركاً في الاجتماع لإرسال رسالة'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Create chat message
            print(f"Creating chat message for meeting {meeting.id}")
            chat_message = MeetingChat.objects.create(
                meeting=meeting,
                user=user,
                message=message_text
            )
            print(f"Chat message created with ID {chat_message.id}")
            
            serializer = MeetingChatSerializer(chat_message)
            data = serializer.data
            print(f"Returning chat message data: {data}")
            return Response(data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def start_live(self, request, pk=None):
        """
        بدء الاجتماع المباشر
        """
        meeting = self.get_object()
        user = request.user
        
        # Check if user is the creator of the meeting
        if meeting.creator != user:
            return Response({
                'error': 'فقط منشئ الاجتماع يمكنه بدء الاجتماع المباشر'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if meeting is active
        if not meeting.is_active:
            return Response({
                'error': 'الاجتماع غير نشط'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if meeting is in the right time window
        now = timezone.now()
        buffer_time = timedelta(minutes=15)  # Allow starting 15 minutes early
        
        if not ((meeting.start_time - buffer_time) <= now <= meeting.start_time + meeting.duration):
            return Response({
                'error': 'الاجتماع غير متاح للبدء في الوقت الحالي'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update meeting status to live
        meeting.is_live_started = True
        meeting.live_started_at = timezone.now()
        meeting.save()
        
        return Response({
            'message': 'تم بدء الاجتماع المباشر بنجاح',
            'meeting_id': meeting.id,
            'live_started_at': meeting.live_started_at
        })
    
    @action(detail=True, methods=['post'])
    def end_live(self, request, pk=None):
        """
        إنهاء الاجتماع المباشر
        """
        meeting = self.get_object()
        user = request.user
        
        # Check if user is the creator of the meeting
        if meeting.creator != user:
            return Response({
                'error': 'فقط منشئ الاجتماع يمكنه إنهاء الاجتماع المباشر'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if meeting is live
        if not meeting.is_live_started:
            return Response({
                'error': 'الاجتماع غير مباشر'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update meeting status
        meeting.is_live_started = False
        meeting.live_ended_at = timezone.now()
        meeting.save()
        
        return Response({
            'message': 'تم إنهاء الاجتماع المباشر بنجاح',
            'meeting_id': meeting.id,
            'live_ended_at': meeting.live_ended_at
        })
    
    @action(detail=True, methods=['post'])
    def mark_attendance(self, request, pk=None):
        """
        تسجيل الحضور للاجتماع
        """
        meeting = self.get_object()
        user = request.user
        
        # Check if user is a participant
        try:
            participant = Participant.objects.get(meeting=meeting, user=user)
        except Participant.DoesNotExist:
            return Response({
                'error': 'يجب التسجيل في الاجتماع أولاً'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Mark attendance
        participant.is_attending = True
        participant.attendance_time = timezone.now()
        participant.attendance_status = 'present'
        participant.save()
        
        return Response({
            'message': 'تم تسجيل الحضور بنجاح',
            'attendance_status': 'present'
        })
    
    @action(detail=True, methods=['post'])
    def update_attendance(self, request, pk=None):
        """
        تحديث حالة الحضور للمشارك (للمعلم)
        """
        meeting = self.get_object()
        user = request.user
        
        # Check if user is the creator or admin
        if not (user.is_superuser or 
                (hasattr(user, 'profile') and user.profile.is_teacher_or_admin()) or
                meeting.creator == user):
            return Response({
                'error': 'ليس لديك صلاحية لتحديث الحضور'
            }, status=status.HTTP_403_FORBIDDEN)
        
        participant_id = request.data.get('participant_id')
        attendance_status = request.data.get('attendance_status')
        
        if not participant_id or not attendance_status:
            return Response({
                'error': 'معرف المشارك وحالة الحضور مطلوبان'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if attendance_status not in ['present', 'late', 'absent']:
            return Response({
                'error': 'حالة الحضور غير صحيحة'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            participant = Participant.objects.get(
                id=participant_id,
                meeting=meeting
            )
            
            participant.attendance_status = attendance_status
            participant.is_attending = attendance_status in ['present', 'late']
            
            if attendance_status in ['present', 'late']:
                participant.attendance_time = timezone.now()
            
            participant.save()
            
            return Response({
                'message': f'تم تحديث حالة الحضور إلى {attendance_status}',
                'participant_id': participant.id,
                'attendance_status': attendance_status
            })
            
        except Participant.DoesNotExist:
            return Response({
                'error': 'المشارك غير موجود'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def register(self, request, pk=None):
        """
        التسجيل في الاجتماع (للطلاب)
        """
        meeting = self.get_object()
        user = request.user
        
        # Check if meeting is active
        if not meeting.is_active:
            return Response({
                'error': 'الاجتماع غير نشط'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if meeting is full
        current_participants = meeting.participants.count()
        if current_participants >= meeting.max_participants:
            return Response({
                'error': 'الاجتماع ممتلئ'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user is already registered
        if meeting.participants.filter(user=user).exists():
            return Response({
                'error': 'أنت مسجل بالفعل في هذا الاجتماع'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create participant record
        participant = Participant.objects.create(
            meeting=meeting,
            user=user,
            attendance_status='registered',
            is_attending=False
        )
        
        return Response({
            'message': 'تم التسجيل في الاجتماع بنجاح',
            'participant_id': participant.id
        })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_absent_participants(request, meeting_id):
    """
    تسجيل الطلاب الغائبين تلقائياً (للمعلم)
    """
    try:
        meeting = Meeting.objects.get(id=meeting_id)
    except Meeting.DoesNotExist:
        return Response({
            'error': 'الاجتماع غير موجود'
        }, status=status.HTTP_404_NOT_FOUND)
    
    user = request.user
    
    # Check if user is the creator or admin
    if not (user.is_superuser or 
            (hasattr(user, 'profile') and user.profile.is_teacher_or_admin()) or
            meeting.creator == user):
        return Response({
            'error': 'ليس لديك صلاحية لتسجيل الغياب'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Mark all registered participants who haven't joined as absent
    now = timezone.now()
    meeting_end = meeting.start_time + meeting.duration
    
    # Only mark absent if meeting has ended or is significantly past start time
    if now > meeting.start_time + timedelta(minutes=30):
        absent_count = 0
        
        for participant in meeting.participants.filter(attendance_status='registered'):
            participant.attendance_status = 'absent'
            participant.save()
            absent_count += 1
        
        return Response({
            'message': f'تم تسجيل {absent_count} طالب كغائبين',
            'absent_count': absent_count
        })
    else:
        return Response({
            'error': 'لا يمكن تسجيل الغياب قبل انتهاء الاجتماع'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def auto_join_meeting(request, meeting_id):
    """
    انضمام تلقائي للاجتماع وتسجيل الحضور
    """
    try:
        meeting = Meeting.objects.get(id=meeting_id)
    except Meeting.DoesNotExist:
        return Response({
            'error': 'الاجتماع غير موجود'
        }, status=status.HTTP_404_NOT_FOUND)
    
    user = request.user
    
    # Check if meeting is available
    now = timezone.now()
    buffer_time = timedelta(minutes=15)  # Allow joining 15 minutes early
    end_time = meeting.start_time + meeting.duration
    
    if not ((meeting.start_time - buffer_time) <= now <= end_time):
        return Response({
            'error': 'الاجتماع غير متاح للانضمام في الوقت الحالي'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not meeting.is_active:
        return Response({
            'error': 'الاجتماع غير نشط'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if user is a participant
    if not meeting.participants.filter(user=user).exists():
        return Response({
            'error': 'يجب التسجيل في الاجتماع للانضمام إليه'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Get or create participant record
    participant, created = Participant.objects.get_or_create(
        meeting=meeting,
        user=user,
        defaults={
            'attendance_status': 'registered'
        }
    )
    
    # Check if already attended (prevent duplicate attendance)
    if participant.is_attending and participant.attendance_time:
        return Response({
            'message': 'تم تسجيل الحضور مسبقاً',
            'attendance_status': participant.attendance_status,
            'meeting_url': meeting.zoom_link,
            'participant_id': participant.id,
            'already_attended': True
        })
    
    # Auto mark attendance and update join time
    participant.is_attending = True
    participant.attendance_time = timezone.now()
    
    # Determine attendance status based on join time
    meeting_start = meeting.start_time
    current_time = timezone.now()
    
    # If joined more than 15 minutes after meeting start, mark as late
    if current_time > meeting_start + timedelta(minutes=15):
        participant.attendance_status = 'late'
    else:
        participant.attendance_status = 'present'
    
    participant.save()
    
    return Response({
        'message': 'تم الانضمام التلقائي للاجتماع وتسجيل الحضور',
        'attendance_status': participant.attendance_status,
        'meeting_url': meeting.zoom_link,
        'participant_id': participant.id
    })
    
    @action(detail=True, methods=['post'])
    def unregister(self, request, pk=None):
        """
        إلغاء التسجيل من الاجتماع (للطلاب)
        """
        meeting = self.get_object()
        user = request.user
        
        try:
            participant = Participant.objects.get(meeting=meeting, user=user)
            participant.delete()
            
            return Response({
                'message': 'تم إلغاء التسجيل من الاجتماع بنجاح'
            })
        except Participant.DoesNotExist:
            return Response({
                'error': 'أنت غير مسجل في هذا الاجتماع'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def check_registration(self, request, pk=None):
        """
        التحقق من حالة التسجيل في الاجتماع
        """
        meeting = self.get_object()
        user = request.user
        
        is_registered = meeting.participants.filter(user=user).exists()
        
        return Response({
            'is_registered': is_registered,
            'meeting_id': meeting.id
        })
    
    @action(detail=True, methods=['get'])
    def my_attendance(self, request, pk=None):
        """
        الحصول على حالة الحضور للمستخدم
        """
        meeting = self.get_object()
        user = request.user
        
        try:
            participant = Participant.objects.get(meeting=meeting, user=user)
            return Response({
                'attendance_status': participant.attendance_status,
                'joined_at': participant.joined_at,
                'left_at': participant.left_at,
                'attendance_duration': str(participant.attendance_duration) if participant.attendance_duration else None
            })
        except Participant.DoesNotExist:
            return Response({
                'attendance_status': 'not_registered',
                'joined_at': None,
                'left_at': None,
                'attendance_duration': None
            })
    
    @action(detail=True, methods=['post'])
    def send_invitations(self, request, pk=None):
        """
        إرسال دعوات للاجتماع
        """
        meeting = self.get_object()
        user = request.user
        
        # Check permissions
        if not (user.is_superuser or 
                (hasattr(user, 'profile') and user.profile.is_admin()) or
                meeting.course.instructor.profile.user == user):
            raise permissions.PermissionDenied("ليس لديك صلاحية لإرسال دعوات")
        
        # Get all enrolled students
        enrolled_students = meeting.course.enroller_user.all()
        invitations_created = 0
        
        for student in enrolled_students:
            invitation, created = MeetingInvitation.objects.get_or_create(
                meeting=meeting,
                user=student,
                defaults={
                    'sent_at': timezone.now(),
                    'is_sent': True
                }
            )
            
            if created:
                invitations_created += 1
                # Here you would integrate with email/notification service
                # send_meeting_invitation_email(student, meeting)
        
        return Response({
            'message': f'تم إرسال {invitations_created} دعوة جديدة',
            'total_invitations': invitations_created
        })
    
    @action(detail=True, methods=['get'])
    def recordings(self, request, pk=None):
        """
        تسجيلات الاجتماع
        """
        meeting = self.get_object()
        recordings = meeting.recordings.filter(is_available=True)
        serializer = MeetingRecordingSerializer(recordings, many=True)
        return Response(serializer.data)


class ParticipantViewSet(viewsets.ModelViewSet):
    """ViewSet for Participant management"""
    queryset = Participant.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['meeting', 'attendance_status']

    def get_serializer_class(self):
        return ParticipantSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_meetings(request):
    """Get current user's meetings"""
    user = request.user
    
    # Get meetings user created (for teachers/instructors)
    created_meetings = Meeting.objects.filter(creator=user)
    
    # Get meetings user is registered for (for students)
    registered_meetings = Meeting.objects.filter(participants__user=user)
    
    # Combine and remove duplicates
    all_meetings = (created_meetings | registered_meetings).distinct().order_by('-start_time')
    
    serializer = MeetingBasicSerializer(all_meetings, many=True, context={'request': request})
    return Response({
        'meetings': serializer.data,
        'total': all_meetings.count()
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def available_meetings(request):
    """Get available meetings for students to register"""
    user = request.user
    
    # Only students can see available meetings
    if not user.profile.status == 'Student':
        return Response({
            'error': 'هذا الإجراء متاح للطلاب فقط'
        }, status=status.HTTP_403_FORBIDDEN)
    
    now = timezone.now()
    
    # Get meetings that are:
    # 1. Active
    # 2. Not started yet or currently ongoing
    # 3. User is not already registered for
    # 4. Have available spots
    available_meetings = Meeting.objects.filter(
        is_active=True,
        start_time__gte=now - timedelta(hours=1)  # Include meetings that started within the last hour
    ).exclude(
        participants__user=user
    ).annotate(
        registered_count=Count('participants')
    ).filter(
        registered_count__lt=F('max_participants')
    ).order_by('start_time')
    
    serializer = MeetingBasicSerializer(available_meetings, many=True, context={'request': request})
    return Response({
        'meetings': serializer.data,
        'total': available_meetings.count()
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def joinable_meetings(request):
    """Get meetings that user can join (ongoing meetings)"""
    user = request.user
    
    now = timezone.now()
    
    # Get all active meetings that are currently ongoing
    # Include meetings that started within the last 2 hours and are still within their duration
    joinable_meetings = Meeting.objects.filter(
        is_active=True
    ).filter(
        # Currently ongoing meetings
        Q(start_time__lte=now) &
        Q(start_time__gte=now - timedelta(hours=2))  # Started within last 2 hours
    ).order_by('start_time')
    
    serializer = MeetingBasicSerializer(joinable_meetings, many=True, context={'request': request})
    return Response({
        'meetings': serializer.data,
        'total': joinable_meetings.count()
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def teaching_meetings(request):
    """Get meetings that the teacher is teaching"""
    user = request.user
    
    # Only teachers can see teaching meetings
    if not user.profile.status == 'Instructor':
        return Response({
            'error': 'هذا الإجراء متاح للمعلمين فقط'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Get meetings created by the teacher
    teaching_meetings = Meeting.objects.filter(
        creator=user
    ).order_by('-start_time')
    
    serializer = MeetingBasicSerializer(teaching_meetings, many=True, context={'request': request})
    return Response({
        'meetings': serializer.data,
        'total': teaching_meetings.count()
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def attending_meetings(request):
    """Get meetings that the user is attending"""
    user = request.user
    
    # Get meetings user is registered for
    attending_meetings = Meeting.objects.filter(
        participants__user=user,
        is_active=True
    ).order_by('-start_time')
    
    serializer = MeetingBasicSerializer(attending_meetings, many=True, context={'request': request})
    return Response({
        'meetings': serializer.data,
        'total': attending_meetings.count()
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def meeting_history(request):
    """Get user's meeting history"""
    user = request.user
    
    now = timezone.now()
    
    # Get completed meetings (started more than 1 hour ago)
    history_meetings = Meeting.objects.filter(
        participants__user=user,
        start_time__lt=now - timedelta(hours=1),
        is_active=True
    ).order_by('-start_time')
    
    serializer = MeetingBasicSerializer(history_meetings, many=True, context={'request': request})
    return Response({
        'meetings': serializer.data,
        'total': history_meetings.count()
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def meeting_invitations(request):
    """Get user's meeting invitations"""
    user = request.user
    
    # Get pending invitations
    invitations = MeetingInvitation.objects.filter(
        user=user,
        response='pending'
    ).select_related('meeting', 'meeting__creator').order_by('-created_at')
    
    serializer = MeetingInvitationSerializer(invitations, many=True, context={'request': request})
    return Response({
        'invitations': serializer.data,
        'total': invitations.count()
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def accept_invitation(request, invitation_id):
    """Accept a meeting invitation"""
    try:
        invitation = MeetingInvitation.objects.get(
            id=invitation_id,
            user=request.user,
            response='pending'
        )
    except MeetingInvitation.DoesNotExist:
        return Response({
            'error': 'الدعوة غير موجودة أو تم الرد عليها مسبقاً'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Create participant record
    Participant.objects.get_or_create(
        meeting=invitation.meeting,
        user=request.user,
        defaults={
            'attendance_status': 'registered',
            'is_attending': False
        }
    )
    
    # Update invitation
    invitation.response = 'accepted'
    invitation.responded_at = timezone.now()
    invitation.save()
    
    return Response({
        'message': 'تم قبول الدعوة بنجاح',
        'meeting_id': invitation.meeting.id
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def decline_invitation(request, invitation_id):
    """Decline a meeting invitation"""
    try:
        invitation = MeetingInvitation.objects.get(
            id=invitation_id,
            user=request.user,
            response='pending'
        )
    except MeetingInvitation.DoesNotExist:
        return Response({
            'error': 'الدعوة غير موجودة أو تم الرد عليها مسبقاً'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Update invitation
    invitation.response = 'declined'
    invitation.responded_at = timezone.now()
    invitation.save()
    
    return Response({
        'message': 'تم رفض الدعوة'
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def meeting_status(request, meeting_id):
    """Get real-time meeting status"""
    try:
        meeting = Meeting.objects.get(id=meeting_id)
    except Meeting.DoesNotExist:
        return Response({
            'error': 'الاجتماع غير موجود'
        }, status=status.HTTP_404_NOT_FOUND)
    
    now = timezone.now()
    
    # Check if user can access this meeting
    if not (request.user == meeting.creator or 
            meeting.participants.filter(user=request.user).exists()):
        return Response({
            'error': 'ليس لديك صلاحية للوصول لهذا الاجتماع'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Determine meeting status
    if meeting.start_time > now:
        status = 'upcoming'
    elif meeting.start_time <= now <= meeting.start_time + meeting.duration:
        status = 'live'
    else:
        status = 'completed'
    
    # Get participant count
    participant_count = meeting.participants.count()
    
    return Response({
        'meeting_id': meeting.id,
        'status': status,
        'participant_count': participant_count,
        'max_participants': meeting.max_participants,
        'start_time': meeting.start_time,
        'duration': meeting.duration,
        'is_active': meeting.is_active
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def meeting_analytics(request, meeting_id):
    """Get meeting analytics"""
    try:
        meeting = Meeting.objects.get(id=meeting_id)
    except Meeting.DoesNotExist:
        return Response({
            'error': 'الاجتماع غير موجود'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user is the creator
    if request.user != meeting.creator:
        return Response({
            'error': 'ليس لديك صلاحية لعرض إحصائيات هذا الاجتماع'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Get attendance statistics
    participants = meeting.participants.all()
    total_participants = participants.count()
    
    attendance_stats = {
        'total': total_participants,
        'present': participants.filter(attendance_status='present').count(),
        'absent': participants.filter(attendance_status='absent').count(),
        'late': participants.filter(attendance_status='late').count(),
        'not_marked': participants.filter(attendance_status='registered').count(),
    }
    
    if total_participants > 0:
        attendance_stats['attendance_rate'] = round(
            (attendance_stats['present'] + attendance_stats['late']) / total_participants * 100, 2
        )
    else:
        attendance_stats['attendance_rate'] = 0
    
    return Response({
        'meeting_id': meeting.id,
        'attendance_stats': attendance_stats,
        'meeting_info': {
            'title': meeting.title,
            'start_time': meeting.start_time,
            'duration': meeting.duration,
            'meeting_type': meeting.meeting_type
        }
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def meeting_attendance_report(request, meeting_id):
    """Get detailed attendance report for a meeting"""
    try:
        meeting = Meeting.objects.get(id=meeting_id)
    except Meeting.DoesNotExist:
        return Response({
            'error': 'الاجتماع غير موجود'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user is the creator
    if request.user != meeting.creator:
        return Response({
            'error': 'ليس لديك صلاحية لعرض تقرير الحضور لهذا الاجتماع'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Get all participants with their details
    participants = meeting.participants.select_related('user__profile').all()
    
    participant_data = []
    for participant in participants:
        participant_data.append({
            'id': participant.id,
            'user_id': participant.user.id,
            'name': f"{participant.user.first_name} {participant.user.last_name}",
            'email': participant.user.email,
            'attendance_status': participant.attendance_status,
            'joined_at': participant.joined_at,
            'left_at': participant.left_at
        })
    
    # Calculate statistics
    total = len(participant_data)
    present = len([p for p in participant_data if p['attendance_status'] == 'present'])
    absent = len([p for p in participant_data if p['attendance_status'] == 'absent'])
    late = len([p for p in participant_data if p['attendance_status'] == 'late'])
    not_marked = len([p for p in participant_data if p['attendance_status'] == 'registered'])
    
    attendance_rate = round((present + late) / total * 100, 2) if total > 0 else 0
    
    return Response({
        'meeting_id': meeting.id,
        'meeting_title': meeting.title,
        'meeting_date': meeting.start_time,
        'statistics': {
            'total': total,
            'present': present,
            'absent': absent,
            'late': late,
            'not_marked': not_marked,
            'attendance_rate': attendance_rate
        },
        'participants': participant_data
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def export_meeting_data(request, meeting_id):
    """Export meeting data (placeholder for PDF generation)"""
    try:
        meeting = Meeting.objects.get(id=meeting_id)
    except Meeting.DoesNotExist:
        return Response({
            'error': 'الاجتماع غير موجود'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user is the creator
    if request.user != meeting.creator:
        return Response({
            'error': 'ليس لديك صلاحية لتصدير بيانات هذا الاجتماع'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # This would typically generate a PDF file
    # For now, return a success message
    return Response({
        'message': 'تم تصدير بيانات الاجتماع بنجاح',
        'meeting_id': meeting.id,
        'export_url': f'/api/meetings/{meeting_id}/export-pdf/'  # Placeholder
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def upcoming_meetings(request):
    """Get upcoming meetings"""
    user = request.user
    now = timezone.now()
    
    # Get upcoming meetings (not started yet)
    upcoming_meetings = Meeting.objects.filter(
        start_time__gt=now,
        is_active=True
    ).order_by('start_time')
    
    serializer = MeetingBasicSerializer(upcoming_meetings, many=True, context={'request': request})
    return Response({
        'meetings': serializer.data,
        'total': upcoming_meetings.count()
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def respond_to_invitation(request, invitation_id):
    """Respond to a meeting invitation"""
    try:
        invitation = MeetingInvitation.objects.get(
            id=invitation_id,
            user=request.user,
            response='pending'
        )
    except MeetingInvitation.DoesNotExist:
        return Response({
            'error': 'الدعوة غير موجودة أو تم الرد عليها مسبقاً'
        }, status=status.HTTP_404_NOT_FOUND)
    
    response = request.data.get('response')
    if response not in ['accepted', 'declined']:
        return Response({
            'error': 'استجابة غير صحيحة'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if response == 'accepted':
        # Create participant record
        Participant.objects.get_or_create(
            meeting=invitation.meeting,
            user=request.user,
            defaults={
                'attendance_status': 'registered',
                'is_attending': False
            }
        )
    
    # Update invitation
    invitation.response = response
    invitation.responded_at = timezone.now()
    invitation.save()
    
    return Response({
        'message': f'تم {response} الدعوة بنجاح',
        'meeting_id': invitation.meeting.id
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_meetings(request):
    """Search meetings"""
    query = request.query_params.get('q', '')
    if not query:
        return Response({
            'error': 'يرجى إدخال كلمة بحث'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = request.user
    now = timezone.now()
    
    # Search in meetings user has access to
    meetings = Meeting.objects.filter(
        Q(title__icontains=query) | Q(description__icontains=query),
        is_active=True
    )
    
    # Filter by user role
    if user.profile.status == 'Student':
        meetings = meetings.filter(participants__user=user)
    elif user.profile.status == 'Instructor':
        meetings = meetings.filter(
            Q(creator=user) | Q(participants__user=user)
        )
    
    serializer = MeetingBasicSerializer(meetings, many=True, context={'request': request})
    return Response({
        'meetings': serializer.data,
        'total': meetings.count(),
        'query': query
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """Get meeting statistics for dashboard"""
    user = request.user
    now = timezone.now()
    
    if user.profile.status == 'instructor':
        # Instructor statistics
        total_meetings = Meeting.objects.filter(creator=user).count()
        upcoming_meetings = Meeting.objects.filter(creator=user, start_time__gt=now).count()
        completed_meetings = Meeting.objects.filter(creator=user, start_time__lt=now).count()
        
        # Get participants count for instructor's meetings
        total_participants = Participant.objects.filter(meeting__creator=user).count()
        
        return Response({
            'total_meetings': total_meetings,
            'upcoming_meetings': upcoming_meetings,
            'completed_meetings': completed_meetings,
            'total_participants': total_participants
        })
    
    elif user.profile.status in ['admin', 'manager']:
        # Admin statistics
        total_meetings = Meeting.objects.count()
        upcoming_meetings = Meeting.objects.filter(start_time__gt=now).count()
        completed_meetings = Meeting.objects.filter(start_time__lt=now).count()
        total_participants = Participant.objects.count()
        
        # Meeting types distribution
        meeting_types = Meeting.objects.values('meeting_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        return Response({
            'total_meetings': total_meetings,
            'upcoming_meetings': upcoming_meetings,
            'completed_meetings': completed_meetings,
            'total_participants': total_participants,
            'meeting_types': list(meeting_types)
        })
    
    else:
        # Student statistics
        registered_meetings = Meeting.objects.filter(participants__user=user).count()
        upcoming_meetings = Meeting.objects.filter(
            participants__user=user, 
            start_time__gt=now
        ).count()
        completed_meetings = Meeting.objects.filter(
            participants__user=user,
            start_time__lt=now
        ).count()
        
        return Response({
            'registered_meetings': registered_meetings,
            'upcoming_meetings': upcoming_meetings,
            'completed_meetings': completed_meetings
        })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def general_stats(request):
    """Get general meeting statistics"""
    now = timezone.now()
    
    total_meetings = Meeting.objects.count()
    live_meetings = Meeting.objects.filter(
        start_time__lte=now,
        start_time__gte=now - timezone.timedelta(hours=8)
    ).count()
    upcoming_meetings = Meeting.objects.filter(start_time__gt=now).count()
    total_participants = Participant.objects.count()
    
    # Meeting types distribution
    meeting_types = Meeting.objects.values('meeting_type').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Recent meetings
    recent_meetings = Meeting.objects.select_related('creator__profile').order_by('-created_at')[:5]
    recent_serializer = MeetingBasicSerializer(recent_meetings, many=True, context={'request': request})
    
    return Response({
        'total_meetings': total_meetings,
        'live_meetings': live_meetings,
        'upcoming_meetings': upcoming_meetings,
        'total_participants': total_participants,
        'meeting_types': list(meeting_types),
        'recent_meetings': recent_serializer.data
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_quick_meeting(request):
    """
    إنشاء اجتماع سريع
    """
    serializer = QuickMeetingSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        # Check if user is instructor
        try:
            instructor = Instructor.objects.get(profile__user=request.user)
            meeting = serializer.save(creator=request.user)
            
            # Note: Quick meetings don't have course association
            # You can add course logic here if needed
            pass
            
            response_data = MeetingDetailSerializer(meeting, context={'request': request}).data
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        except Instructor.DoesNotExist:
            return Response({
                'error': 'يجب أن تكون معلماً لإنشاء اجتماع'
            }, status=status.HTTP_403_FORBIDDEN)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def meeting_join(request, meeting_id):
    """
    الانضمام للاجتماع
    """
    try:
        meeting = Meeting.objects.get(id=meeting_id)
    except Meeting.DoesNotExist:
        return Response({
            'error': 'الاجتماع غير موجود'
        }, status=status.HTTP_404_NOT_FOUND)
    
    user = request.user
    
    # Check if meeting is available to join
    now = timezone.now()
    buffer_time = timedelta(minutes=15)  # Allow joining 15 minutes early
    end_time = meeting.start_time + meeting.duration
    
    if not ((meeting.start_time - buffer_time) <= now <= end_time):
        return Response({
            'error': 'الاجتماع غير متاح للانضمام في الوقت الحالي'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not meeting.is_active:
        return Response({
            'error': 'الاجتماع غير نشط'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if user is a participant
    if not meeting.participants.filter(user=user).exists():
        return Response({
            'error': 'يجب التسجيل في الاجتماع للانضمام إليه'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Check if meeting is full
    current_attendees = meeting.participants.filter(
        is_attending=True
    ).count()
    
    if current_attendees >= meeting.max_participants:
        return Response({
            'error': 'الاجتماع ممتلئ'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Get or create participant record
    participant, created = Participant.objects.get_or_create(
        meeting=meeting,
        user=user,
        defaults={
            'attendance_status': 'registered'
        }
    )
    
    # Mark attendance and update join time
    participant.is_attending = True
    participant.attendance_time = timezone.now()
    
    # Determine attendance status based on join time
    meeting_start = meeting.start_time
    current_time = timezone.now()
    
    # If joined more than 15 minutes after meeting start, mark as late
    if current_time > meeting_start + timedelta(minutes=15):
        participant.attendance_status = 'late'
    else:
        participant.attendance_status = 'present'
    
    participant.save()
    
    return Response({
        'message': 'تم الانضمام للاجتماع بنجاح',
        'meeting_url': meeting.zoom_link,
        'participant_id': participant.id
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def meeting_register(request, meeting_id):
    """
    التسجيل في الاجتماع (للطلاب)
    """
    try:
        meeting = Meeting.objects.get(id=meeting_id)
    except Meeting.DoesNotExist:
        return Response({
            'error': 'الاجتماع غير موجود'
        }, status=status.HTTP_404_NOT_FOUND)
    
    user = request.user
    
    # Check if meeting is active
    if not meeting.is_active:
        return Response({
            'error': 'الاجتماع غير نشط'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if meeting is full
    current_participants = meeting.participants.count()
    if current_participants >= meeting.max_participants:
        return Response({
            'error': 'الاجتماع ممتلئ'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if user is already registered
    if meeting.participants.filter(user=user).exists():
        return Response({
            'error': 'أنت مسجل بالفعل في هذا الاجتماع'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Create participant record
    participant = Participant.objects.create(
        meeting=meeting,
        user=user,
        attendance_status='registered',
        is_attending=False
    )
    
    return Response({
        'message': 'تم التسجيل في الاجتماع بنجاح',
        'participant_id': participant.id
    })
