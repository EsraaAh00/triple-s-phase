from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views_progress import ProgressViewSet
from .views_search import ContentSearchView
from . import views_bunny

# Create a router for the ModuleViewSet
router = DefaultRouter()
router.register(r'modules', views.ModuleViewSet, basename='module')
router.register(r'lessons', views.LessonViewSet, basename='lesson')
router.register(r'resources', views.LessonResourceViewSet, basename='resource')

# Progress tracking viewset
progress_view = ProgressViewSet.as_view({
    'get': 'user_progress',
    'post': 'track_lesson_progress'
})

urlpatterns = [
    # Include the router URLs
    path('', include(router.urls)),
    
    # Progress tracking endpoints
    path('progress/course/<int:course_id>/', progress_view, name='course-progress'),
    path('progress/course/<int:course_id>/track/', progress_view, name='track-progress'),
    path('progress/course/<int:course_id>/complete/', 
         ProgressViewSet.as_view({'post': 'complete_lesson'}), 
         name='complete-lesson'),
    path('progress/module/<int:module_id>/', 
         ProgressViewSet.as_view({'get': 'module_progress'}), 
         name='module-progress'),
    path('progress/course/<int:course_id>/modules/', 
         ProgressViewSet.as_view({'get': 'course_progress'}), 
         name='all-modules-progress'),
    
    # Search and filtering
    path('search/', ContentSearchView.as_view(), name='content-search'),
    
    # New course content APIs
    path('course/<int:course_id>/modules-with-lessons/', 
         views.CourseModulesWithLessonsViewSet.as_view({'get': 'list'}), 
         name='course-modules-with-lessons'),
    path('course/<int:course_id>/question-bank/', 
         views.CourseQuestionBankViewSet.as_view({'get': 'list'}), 
         name='course-question-bank'),
    path('course/<int:course_id>/flashcards/', 
         views.CourseFlashcardsViewSet.as_view({'get': 'list'}), 
         name='course-flashcards'),
    
    # Bunny CDN integration endpoints
    path('bunny/validate/', views_bunny.validate_bunny_video, name='validate-bunny-video'),
    path('bunny/video/<str:video_id>/', views_bunny.get_bunny_video_info, name='bunny-video-info'),
    path('bunny/embed/<str:video_id>/', views_bunny.get_bunny_embed_url_view, name='bunny-embed-url'),
    path('bunny/private/<str:video_id>/', views_bunny.get_bunny_private_url_view, name='bunny-private-url'),
    path('bunny/private-embed/<str:video_id>/', views_bunny.get_bunny_private_embed_url_view, name='bunny-private-embed-url'),
    path('modules/<int:module_id>/bunny-video/', views_bunny.update_module_bunny_video_view, name='module-bunny-video'),
    path('lessons/<int:lesson_id>/bunny-video/', views_bunny.update_lesson_bunny_video_view, name='lesson-bunny-video'),
    path('courses/<int:course_id>/bunny-promotional-video/', views_bunny.update_course_bunny_promotional_video_view, name='course-bunny-promotional-video'),
]
