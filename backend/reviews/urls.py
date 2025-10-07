from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    # Review endpoints
    path('courses/<int:course_id>/reviews/', views.course_reviews, name='course-reviews'),
    path('reviews/create/<int:course_id>/', views.create_review, name='create-review'),
    path('reviews/<int:pk>/', views.ReviewDetailView.as_view(), name='review-detail'),
    
    # Review Reply endpoints
    path('reviews/<int:review_id>/replies/', views.ReviewReplyListCreateView.as_view(), name='review-replies'),
    path('reviews/<int:review_id>/replies/<int:pk>/', views.ReviewReplyDetailView.as_view(), name='review-reply-detail'),
    
    # Comment endpoints
    path('courses/<int:course_id>/comments/', views.CommentListCreateView.as_view(), name='course-comments'),
    path('courses/<int:course_id>/comments/<int:pk>/', views.CommentDetailView.as_view(), name='comment-detail'),
    
    # Comment Like endpoints
    path('comments/<int:comment_id>/like/', views.CommentLikeView.as_view(), name='comment-like'),
    
    # Review Like endpoints
    path('reviews/<int:review_id>/like/', views.like_review, name='review-like'),
    
    # Course Rating endpoints
    path('courses/<int:course_id>/rating/', views.course_rating_stats, name='course-rating'),
    
    # Moderation endpoints
    path('moderate/reviews/<int:pk>/', views.ReviewModerationView.as_view(), name='moderate-review'),
    path('moderate/replies/<int:pk>/', views.ReplyModerationView.as_view(), name='moderate-reply'),
]
