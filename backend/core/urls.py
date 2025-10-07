"""LMS URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
# from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenRefreshView

# Import our custom admin site
from extras.admin import custom_admin_site
from . import views

if settings.DEBUG:
    try:
        import debug_toolbar
        debug_toolbar_available = True
    except ImportError:
        debug_toolbar_available = False

urlpatterns = [
    # Admin
    path('admin/', custom_admin_site.urls),  # Use our custom admin site
    path('django-admin/', admin.site.urls),  # Keep default admin as fallback
    
    # CKEditor 5 URLs for file uploads
    path('ckeditor5/', include('django_ckeditor_5.urls'), name='ck_editor_5_upload_file'),
    
    # API Documentation
    # path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API Routes
    path('api/assessment/', include('assessment.urls')),
    path('api/auth/', include('authentication.urls')),
    path('api/users/', include('users.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/meetings/', include('meetings.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/articles/', include('articles.urls')),
    path('api/extras/', include('extras.urls')),
    path('api/content/', include('content.urls')),  # Content app URLs
    path('api/store/', include('store.urls')),  # Store app URLs
    path('api/reviews/', include('reviews.urls')),  # Reviews app URLs
   
    
    # Legacy routes (for backward compatibility) - Commented out to avoid namespace conflicts
    # path('auth/', include('authentication.urls')),
    # path('users/', include('users.urls')),
    # path('courses/', include('courses.urls')),
    # path('assignments/', include('assignments.urls')),  # Module deleted
    # path('certificates/', include('certificates.urls')),  # Module deleted
    # path('meetings/', include('meetings.urls')),
    # path('notifications/', include('notifications.urls')),
    # path('articles/', include('articles.urls')),
    # path('extras/', include('extras.urls')),
    # path('content/', include('content.urls')),  # Content app URLs
    # path('store/', include('store.urls')),  # Store app URLs
    # path('reviews/', include('reviews.urls')),  # Reviews app URLs
    # path('permissions/', include('custom_permissions.urls')),  # Custom permissions URLs - Module deleted
    
    # Template views for legacy support (data comes from APIs)
    # path('', include('templates.urls')),  # Main pages - disabled for now
    
    # Admin interface redirects
    # path('accounts/', include('allauth.urls')),
    # path('ckeditor/', include('ckeditor_uploader.urls')),  # Temporarily disabled
    
]

# Add debug toolbar in development
if settings.DEBUG and 'debug_toolbar_available' in locals() and debug_toolbar_available:
    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),
    ]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
