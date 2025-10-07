from django.urls import path, include
from rest_framework.routers import DefaultRouter, SimpleRouter
from . import views
from .views_interaction import (
    LikeViewSet,
    BookmarkViewSet,
    ArticleRatingViewSet,
    ArticleViewViewSet,
    UserInteractionViewSet
)

# Main router for standard views
router = DefaultRouter()
router.register(r'categories', views.BookCategoryViewSet)
router.register(r'articles', views.ArticleViewSet)
router.register(r'comments', views.ArticleCommentViewSet)

# Interaction routers
interaction_router = SimpleRouter()
interaction_router.register(r'likes', LikeViewSet, basename='article-like')
interaction_router.register(r'bookmarks', BookmarkViewSet, basename='article-bookmark')
interaction_router.register(r'ratings', ArticleRatingViewSet, basename='article-rating')
interaction_router.register(r'views', ArticleViewViewSet, basename='article-view')
interaction_router.register(r'user-interactions', UserInteractionViewSet, basename='user-interaction')

urlpatterns = [
    # Standard article endpoints
    path('', include(router.urls)),
    
    # Additional article listing endpoints
    path('featured/', views.FeaturedArticlesView.as_view(), name='featured-articles'),
    path('recent/', views.RecentArticlesView.as_view(), name='recent-articles'),
    path('popular/', views.PopularArticlesView.as_view(), name='popular-articles'),

    path('search/', views.ArticleSearchView.as_view(), name='article-search'),
    
    # Interaction endpoints
    path('articles/<int:article_pk>/', include(interaction_router.urls)),
    
    # User-specific endpoints
    path('my/', include([
        path('bookmarks/', BookmarkViewSet.as_view({'get': 'list'}), name='my-bookmarks'),
        path('ratings/', ArticleRatingViewSet.as_view({
            'get': 'list',
        }), name='my-ratings'),
        path('interactions/', UserInteractionViewSet.as_view({
            'get': 'my_interactions',
        }), name='my-article-interactions'),
    ])),
]