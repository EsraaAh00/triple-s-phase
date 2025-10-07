from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for viewsets
router = DefaultRouter()
router.register(r'', views.NotificationViewSet, basename='notification')

urlpatterns = [
    # Include router URLs for notifications at root level
    path('', include(router.urls)),
    
    # Bulk operations
    path('bulk-send/', views.send_bulk_notification, name='bulk-send-notification'),
    path('search/', views.search_notifications, name='search-notifications'),
    path('system-create/', views.create_system_notification, name='create-system-notification'),
    
    # Settings
    path('settings/', views.notification_settings, name='notification-settings'),
    
    # Statistics
    path('stats/dashboard/', views.dashboard_stats, name='notification-dashboard-stats'),
    path('stats/general/', views.general_stats, name='notification-general-stats'),
] 
