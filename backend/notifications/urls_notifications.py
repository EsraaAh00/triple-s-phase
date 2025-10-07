from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views_notifications as views

app_name = 'notifications'

# Create a router for notification endpoints
router = DefaultRouter()
router.register(r'preferences', views.NotificationPreferenceView, basename='preference')

# Notification URL patterns
urlpatterns = [
    # Include the router URLs
    path('', include(router.urls)),
    
    # Notifications
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('unread/count/', views.UnreadNotificationCountView.as_view(), name='unread-count'),
    path('mark-as-read/', views.MarkAsReadView.as_view(), name='mark-as-read'),
    
    # Push notifications
    path('push/subscribe/', views.SubscribeToPushView.as_view(), name='push-subscribe'),
    path('push/unsubscribe/', views.UnsubscribeFromPushView.as_view(), name='push-unsubscribe'),
    
    # Admin
    path('email-logs/', views.EmailNotificationLogsView.as_view(), name='email-logs'),
    path('test/', views.TestNotificationView.as_view(), name='test-notification'),
    
    # Preferences
    path('my-preferences/', views.NotificationPreferenceView.as_view(), name='my-preferences'),
]
