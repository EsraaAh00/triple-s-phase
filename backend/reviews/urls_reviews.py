from django.urls import path, include
from rest_framework_nested import routers
from . import views_reviews as views

app_name = 'reviews'

# Create a router for reviews
router = routers.DefaultRouter()
router.register(r'course-reviews', views.CourseReviewViewSet, basename='course-review')
router.register(r'instructor-reviews', views.InstructorReviewViewSet, basename='instructor-review')

# Course review nested routes
course_router = routers.NestedDefaultRouter(router, r'courses', lookup='course')
course_router.register(r'reviews', views.CourseReviewViewSet, basename='course-review')

# Instructor review nested routes
instructor_router = routers.NestedDefaultRouter(router, r'instructors', lookup='instructor')
instructor_router.register(r'reviews', views.InstructorReviewViewSet, basename='instructor-review')

# URL patterns
urlpatterns = [
    # Include the router URLs
    path('', include(router.urls)),
    path('', include(course_router.urls)),
    path('', include(instructor_router.urls)),
    
    # User reviews
    path('users/<int:user_id>/reviews/', views.UserReviewsView.as_view(), name='user-reviews'),
    
    # Ratings
    path('courses/<int:course_id>/rating/', views.CourseRatingView.as_view(), name='course-rating'),
    path('instructors/<int:instructor_id>/rating/', views.InstructorRatingView.as_view(), name='instructor-rating'),
    
    # Review actions
    path('reviews/<int:pk>/like/', views.LikeReviewView.as_view(), name='like-review'),
    path('reviews/<int:pk>/report/', views.ReportReviewView.as_view(), name='report-review'),
]
