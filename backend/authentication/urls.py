from django.urls import path
from . import views

app_name = 'authentication'

urlpatterns = [
    # تسجيل الدخول والخروج
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # الملف الشخصي
    path('profile/', views.profile_view, name='profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('profile/<int:profile_id>/', views.ProfileDetailView.as_view(), name='profile_detail'),
    
    # كلمة المرور
    path('change-password/', views.change_password, name='change_password'),
    
    # التحقق من البريد الإلكتروني
    path('check-email/', views.check_email_exists, name='check_email'),
] 
