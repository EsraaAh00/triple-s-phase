from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .admin_views import admin_dashboard

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'banners', views.BannerViewSet, basename='banner')
router.register(r'collections', views.CourseCollectionViewSet, basename='collection')

# Admin dashboard endpoints
admin_urlpatterns = [
    path('', admin_dashboard, name='admin-dashboard'),
    path('course/<int:course_id>/<str:action>/', 
         views.toggle_course_featured_status, 
         name='toggle-course-featured'),
    path('courses/bulk-<str:action>/', 
         views.bulk_update_course_status, 
         name='bulk-update-course-status'),
]

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
    path('admin/', include(admin_urlpatterns)),
]
