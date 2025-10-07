from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import Notification, NotificationPreference, EmailNotificationLog
from .serializers import (
    NotificationSerializer, NotificationPreferenceSerializer,
    MarkAsReadSerializer, BulkNotificationUpdateSerializer
)
from users.models import User

class NotificationListView(generics.ListAPIView):
    """List user's notifications"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['notification_type', 'is_read']
    ordering_fields = ['created_at', 'is_read']
    ordering = ['-created_at', '-is_read']
    
    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).select_related('sender', 'content_type')


class UnreadNotificationCountView(APIView):
    """Get count of unread notifications"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        return Response({'unread_count': count})


class MarkAsReadView(APIView):
    """Mark a notification as read"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = MarkAsReadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        notification_id = serializer.validated_data.get('notification_id')
        mark_all = serializer.validated_data.get('all', False)
        
        if mark_all:
            # Mark all notifications as read
            updated = Notification.objects.filter(
                user=request.user,
                is_read=False
            ).update(is_read=True, read_at=timezone.now())
            return Response({
                'status': 'success',
                'message': f'Marked {updated} notifications as read',
                'marked_all': True
            })
        
        # Mark specific notification as read
        notification = get_object_or_404(
            Notification,
            id=notification_id,
            user=request.user
        )
        
        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save(update_fields=['is_read', 'read_at'])
        
        return Response({
            'status': 'success',
            'message': 'Notification marked as read',
            'notification_id': str(notification_id)
        })


class NotificationPreferenceView(generics.RetrieveUpdateAPIView):
    """View and update user's notification preferences"""
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        preference, _ = NotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return preference


class EmailNotificationLogsView(generics.ListAPIView):
    """View email notification logs for admin"""
    serializer_class = EmailNotificationLogSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'notification_type', 'recipient']
    ordering_fields = ['sent_at', 'status']
    ordering = ['-sent_at']
    
    def get_queryset(self):
        return EmailNotificationLog.objects.select_related('recipient')


class SubscribeToPushView(APIView):
    """Subscribe to push notifications"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # In a real implementation, this would save the push subscription
        # to a model and handle the WebPush subscription
        return Response({
            'status': 'success',
            'message': 'Successfully subscribed to push notifications'
        })


class UnsubscribeFromPushView(APIView):
    """Unsubscribe from push notifications"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # In a real implementation, this would remove the push subscription
        return Response({
            'status': 'success',
            'message': 'Successfully unsubscribed from push notifications'
        })


class TestNotificationView(APIView):
    """Send a test notification (admin only)"""
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request):
        from .services import NotificationService
        
        notification_type = request.data.get('type', 'info')
        message = request.data.get('message', 'This is a test notification')
        
        # Send notification to the requesting user
        NotificationService.send_notification(
            user=request.user,
            notification_type=notification_type,
            title='Test Notification',
            message=message,
            data={'test': True}
        )
        
        return Response({
            'status': 'success',
            'message': 'Test notification sent',
            'notification_type': notification_type
        })
