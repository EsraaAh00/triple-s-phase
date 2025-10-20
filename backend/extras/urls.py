from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .admin_views import admin_dashboard

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'banners', views.BannerViewSet, basename='banner')
router.register(r'collections', views.CourseCollectionViewSet, basename='collection')
router.register(r'privacy-policy', views.PrivacyPolicyViewSet, basename='privacy-policy')
router.register(r'terms-conditions', views.TermsAndConditionsViewSet, basename='terms-conditions')
router.register(r'refunding-faq', views.RefundingFAQViewSet, basename='refunding-faq')
router.register(r'contact-info', views.ContactInfoViewSet, basename='contact-info')
router.register(r'partnerships', views.PartnershipViewSet, basename='partnership')
router.register(r'contact-messages', views.ContactMessageViewSet, basename='contact-message')
router.register(r'card-images', views.CardImageViewSet, basename='card-image')

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
