from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404
from django.core.paginator import Paginator
from django.contrib.auth.models import User
from django_filters.rest_framework import DjangoFilterBackend
from datetime import timedelta

from .models import Notification
from courses.models import Course
from .serializers import (
    NotificationBasicSerializer, NotificationDetailSerializer, NotificationCreateSerializer,
    BulkNotificationSerializer, NotificationMarkReadSerializer, NotificationSettingsSerializer,
    NotificationFilterSerializer
)


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing notifications"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return NotificationCreateSerializer
        elif self.action == 'retrieve':
            return NotificationDetailSerializer
        return NotificationBasicSerializer
    
    def get_queryset(self):
        """Get notifications for current user"""
        return Notification.objects.filter(
            recipient=self.request.user
        ).select_related('sender__profile').order_by('-created_at')
    
    def perform_create(self, serializer):
        """Create notification with sender"""
        # Check if user can send notifications
        user = self.request.user
        if user.profile.status not in ['teacher', 'admin', 'manager']:
            raise PermissionDenied("فقط المعلمين والمديرين يمكنهم إرسال الإشعارات")
        
        serializer.save()
    
    def perform_destroy(self, instance):
        """Delete notification (only recipient can delete their notifications)"""
        if instance.recipient != self.request.user:
            raise PermissionDenied("يمكنك حذف إشعاراتك فقط")
        
        instance.delete()
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark single notification as read"""
        notification = self.get_object()
        
        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save()
        
        return Response({
            'message': 'تم تحديد الإشعار كمقروء'
        })
    
    @action(detail=True, methods=['post'])
    def mark_unread(self, request, pk=None):
        """Mark single notification as unread"""
        notification = self.get_object()
        
        if notification.is_read:
            notification.is_read = False
            notification.read_at = None
            notification.save()
        
        return Response({
            'message': 'تم تحديد الإشعار كغير مقروء'
        })
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        unread_notifications = self.get_queryset().filter(is_read=False)
        count = unread_notifications.update(
            is_read=True,
            read_at=timezone.now()
        )
        
        return Response({
            'message': f'تم تحديد {count} إشعار كمقروء',
            'marked_count': count
        })
    
    @action(detail=False, methods=['post'])
    def mark_multiple_read(self, request):
        """Mark multiple notifications as read"""
        serializer = NotificationMarkReadSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        notification_ids = serializer.validated_data['notification_ids']
        
        # Mark as read
        updated_count = Notification.objects.filter(
            id__in=notification_ids,
            recipient=request.user,
            is_read=False
        ).update(
            is_read=True,
            read_at=timezone.now()
        )
        
        return Response({
            'message': f'تم تحديد {updated_count} إشعار كمقروء',
            'marked_count': updated_count
        })
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications"""
        unread_notifications = self.get_queryset().filter(is_read=False)
        
        # Paginate
        page = request.GET.get('page', 1)
        paginator = Paginator(unread_notifications, 20)
        notifications_page = paginator.get_page(page)
        
        serializer = NotificationBasicSerializer(
            notifications_page, many=True, context={'request': request}
        )
        
        return Response({
            'notifications': serializer.data,
            'page': int(page),
            'pages': paginator.num_pages,
            'total': paginator.count
        })
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = self.get_queryset().filter(is_read=False).count()
        
        return Response({
            'unread_count': count
        })
    
    @action(detail=False, methods=['delete'])
    def delete_all_read(self, request):
        """Delete all read notifications"""
        read_notifications = self.get_queryset().filter(is_read=True)
        count = read_notifications.count()
        read_notifications.delete()
        
        return Response({
            'message': f'تم حذف {count} إشعار مقروء',
            'deleted_count': count
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_bulk_notification(request):
    """Send bulk notification to multiple users"""
    # Check permissions
    if request.user.profile.status not in ['admin', 'manager']:
        return Response({
            'error': 'فقط المديرين يمكنهم إرسال إشعارات جماعية'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = BulkNotificationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    validated_data = serializer.validated_data
    
    # Determine recipients based on type
    recipients = []
    recipient_type = validated_data['recipient_type']
    
    if recipient_type == 'all':
        recipients = User.objects.filter(is_active=True)
    elif recipient_type == 'students':
        recipients = User.objects.filter(profile__status='student', is_active=True)
    elif recipient_type == 'teachers':
        recipients = User.objects.filter(profile__status='teacher', is_active=True)
    elif recipient_type == 'course_students':
        course_id = validated_data.get('course_id')
        course = get_object_or_404(Course, id=course_id)
        recipients = course.enroller_user.filter(is_active=True)
    elif recipient_type == 'specific_users':
        recipient_ids = validated_data.get('recipient_ids', [])
        recipients = User.objects.filter(id__in=recipient_ids, is_active=True)
    
    # Create notifications
    notifications = []
    for recipient in recipients:
        notification = Notification(
            title=validated_data['title'],
            message=validated_data['message'],
            notification_type=validated_data['notification_type'],
            sender=request.user,
            recipient=recipient
        )
        notifications.append(notification)
    
    # Bulk create
    created_notifications = Notification.objects.bulk_create(notifications)
    
    return Response({
        'message': f'تم إرسال الإشعار إلى {len(created_notifications)} مستخدم',
        'recipients_count': len(created_notifications)
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_notifications(request):
    """Search notifications with filters"""
    filter_serializer = NotificationFilterSerializer(data=request.GET)
    if not filter_serializer.is_valid():
        return Response(filter_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    filters = filter_serializer.validated_data
    queryset = Notification.objects.filter(
        recipient=request.user
    ).select_related('sender__profile')
    
    # Apply filters
    if filters.get('notification_type'):
        queryset = queryset.filter(notification_type=filters['notification_type'])
    
    if filters.get('is_read') is not None:
        queryset = queryset.filter(is_read=filters['is_read'])
    
    if filters.get('date_from'):
        queryset = queryset.filter(created_at__date__gte=filters['date_from'])
    
    if filters.get('date_to'):
        queryset = queryset.filter(created_at__date__lte=filters['date_to'])
    
    if filters.get('sender_id'):
        queryset = queryset.filter(sender_id=filters['sender_id'])
    
    if filters.get('search'):
        search_term = filters['search']
        queryset = queryset.filter(
            Q(title__icontains=search_term) |
            Q(message__icontains=search_term) |
            Q(sender__profile__name__icontains=search_term)
        )
    
    # Order by creation date
    queryset = queryset.order_by('-created_at')
    
    # Paginate
    page = request.GET.get('page', 1)
    paginator = Paginator(queryset, 20)
    notifications_page = paginator.get_page(page)
    
    serializer = NotificationBasicSerializer(
        notifications_page, many=True, context={'request': request}
    )
    
    return Response({
        'notifications': serializer.data,
        'page': int(page),
        'pages': paginator.num_pages,
        'total': paginator.count,
        'filters_applied': filters
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def notification_settings(request):
    """Get or update user notification settings"""
    user = request.user
    
    if request.method == 'GET':
        # Get current settings from user profile or defaults
        settings = {
            'email_notifications': getattr(user.profile, 'email_notifications', True),
            'course_updates': getattr(user.profile, 'course_updates', True),
            'meeting_reminders': getattr(user.profile, 'meeting_reminders', True),
            'assignment_deadlines': getattr(user.profile, 'assignment_deadlines', True),
            'new_messages': getattr(user.profile, 'new_messages', True),
            'system_announcements': getattr(user.profile, 'system_announcements', True),
        }
        
        return Response(settings)
    
    elif request.method == 'POST':
        # Update settings
        serializer = NotificationSettingsSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        validated_data = serializer.validated_data
        
        # Update user profile with new settings
        profile = user.profile
        for key, value in validated_data.items():
            setattr(profile, key, value)
        profile.save()
        
        return Response({
            'message': 'تم تحديث إعدادات الإشعارات بنجاح',
            'settings': validated_data
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get notification statistics for dashboard"""
    user = request.user
    
    total_notifications = Notification.objects.filter(recipient=user).count()
    unread_notifications = Notification.objects.filter(recipient=user, is_read=False).count()
    read_notifications = total_notifications - unread_notifications
    
    # Notifications by type
    notification_types = Notification.objects.filter(
        recipient=user
    ).values('notification_type').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Recent notifications
    recent_notifications = Notification.objects.filter(
        recipient=user
    ).select_related('sender__profile').order_by('-created_at')[:5]
    recent_serializer = NotificationBasicSerializer(
        recent_notifications, many=True, context={'request': request}
    )
    
    # Weekly stats (last 7 days)
    week_ago = timezone.now() - timedelta(days=7)
    weekly_notifications = Notification.objects.filter(
        recipient=user,
        created_at__gte=week_ago
    ).count()
    
    return Response({
        'total_notifications': total_notifications,
        'unread_notifications': unread_notifications,
        'read_notifications': read_notifications,
        'weekly_notifications': weekly_notifications,
        'notification_types': list(notification_types),
        'recent_notifications': recent_serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def general_stats(request):
    """Get general notification statistics (admin only)"""
    if request.user.profile.status not in ['admin', 'manager']:
        return Response({
            'error': 'ليس لديك صلاحية لعرض هذه الإحصائيات'
        }, status=status.HTTP_403_FORBIDDEN)
    
    total_notifications = Notification.objects.count()
    unread_notifications = Notification.objects.filter(is_read=False).count()
    read_notifications = total_notifications - unread_notifications
    
    # Notifications by type
    notification_types = Notification.objects.values('notification_type').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Daily stats (last 30 days)
    stats_by_day = []
    for i in range(30):
        day = timezone.now().date() - timedelta(days=i)
        day_count = Notification.objects.filter(
            created_at__date=day
        ).count()
        stats_by_day.append({
            'date': day.isoformat(),
            'count': day_count
        })
    
    # Top notification senders
    top_senders = Notification.objects.values(
        'sender__profile__name'
    ).annotate(
        count=Count('id')
    ).order_by('-count')[:10]
    
    return Response({
        'total_notifications': total_notifications,
        'unread_notifications': unread_notifications,
        'read_notifications': read_notifications,
        'notification_types': list(notification_types),
        'daily_stats': stats_by_day,
        'top_senders': list(top_senders)
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_system_notification(request):
    """Create system-wide notification (admin only)"""
    if request.user.profile.status not in ['admin', 'manager']:
        return Response({
            'error': 'فقط المديرين يمكنهم إنشاء إشعارات النظام'
        }, status=status.HTTP_403_FORBIDDEN)
    
    title = request.data.get('title')
    message = request.data.get('message')
    
    if not title or not message:
        return Response({
            'error': 'العنوان والرسالة مطلوبان'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Get all active users
    users = User.objects.filter(is_active=True)
    
    # Create notifications
    notifications = []
    for user in users:
        notification = Notification(
            title=title,
            message=message,
            notification_type='system',
            sender=request.user,
            recipient=user
        )
        notifications.append(notification)
    
    # Bulk create
    created_notifications = Notification.objects.bulk_create(notifications)
    
    return Response({
        'message': f'تم إرسال إشعار النظام إلى {len(created_notifications)} مستخدم',
        'recipients_count': len(created_notifications)
    }, status=status.HTTP_201_CREATED) 
