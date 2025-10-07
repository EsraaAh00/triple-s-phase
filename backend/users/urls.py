from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from .views_auth import (
    PasswordResetRequestView,
    PasswordResetConfirmView,
    EmailVerificationView,
    UserDeactivationView,
    ResendVerificationEmailView
)
from django.conf import settings
from django.conf.urls.static import static

# Create router (temporarily disabled until ViewSets are created)
# router = DefaultRouter()
# router.register(r'profiles', views.ProfileViewSet)
# router.register(r'teachers', views.TeacherViewSet)
# router.register(r'students', views.StudentViewSet)

app_name = 'users_api'

urlpatterns = [
    # Authentication URLs
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/debug-login/', views.debug_login, name='debug_login'),
    path('auth/create-test-user/', views.create_test_user, name='create_test_user'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/check-email/', views.check_email_exists, name='check_email'),
    
    # Password Reset
    path('auth/password/reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('auth/password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # Email Verification
    path('auth/verify-email/', EmailVerificationView.as_view(), name='verify_email'),
    path('auth/verify-email/resend/', ResendVerificationEmailView.as_view(), name='resend_verification_email'),
    path('auth/verify-email/confirm/<str:uidb64>/<str:token>/', 
         EmailVerificationView.as_view(), name='verify_email_confirm'),
    
    # Account Management
    path('auth/account/deactivate/', UserDeactivationView.as_view(), name='deactivate_account'),
    
    # Profile management
    path('profile/', views.profile_view, name='profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('profile/change-password/', views.change_password, name='change_password'),
    path('profile/<uuid:id>/', views.ProfileDetailView.as_view(), name='profile_detail'),
    
    # Lists
    path('students/', views.students_list, name='students_list'),
    
    # Dashboard
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    
    # User Management
    path('users/<int:user_id>/activate/', views.UserActivationView.as_view(), name='user-activate'),
    path('users/<int:user_id>/role/', views.UserRoleView.as_view(), name='user-role'),
    path('profile/picture/', views.ProfilePictureUploadView.as_view(), name='profile-picture-upload'),
    path('search/', views.UserSearchView.as_view(), name='user-search'),
    
    # Include router URLs (temporarily disabled)
    # path('', include(router.urls)),
]
