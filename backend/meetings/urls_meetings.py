from django.urls import path, include
from rest_framework_nested import routers
from . import views_meetings as views

app_name = 'meetings'

# Create a router for meetings
router = routers.DefaultRouter()
router.register(r'meetings', views.MeetingViewSet, basename='meeting')

# Nested router for meeting participants
meeting_router = routers.NestedDefaultRouter(router, r'meetings', lookup='meeting')
meeting_router.register(r'participants', views.MeetingParticipantViewSet, basename='participant')
meeting_router.register(r'recordings', views.MeetingRecordingViewSet, basename='recording')

# URL patterns
urlpatterns = [
    # Include the router URLs
    path('', include(router.urls)),
    path('', include(meeting_router.urls)),
    
    # Meeting actions
    path('meetings/<uuid:meeting_id>/join/', views.MeetingJoinView.as_view(), name='join-meeting'),
    path('meetings/<uuid:meeting_id>/invite/', views.MeetingInviteView.as_view(), name='invite-participants'),
    
    # User meetings
    path('my-meetings/', views.UserMeetingsView.as_view(), name='user-meetings'),
    
    # Course meetings
    path('courses/<uuid:course_id>/meetings/', views.CourseMeetingListView.as_view(), name='course-meetings'),
    
    # Webhook endpoints (for Zoom/Google Meet callbacks)
    path('webhooks/zoom/', views.ZoomWebhookView.as_view(), name='zoom-webhook'),
    path('webhooks/google-meet/', views.GoogleMeetWebhookView.as_view(), name='google-meet-webhook'),
]

# Add WebSocket URL patterns for real-time communication
websocket_urlpatterns = [
    path('ws/meetings/<uuid:meeting_id>/', views.MeetingConsumer.as_asgi()),
]
