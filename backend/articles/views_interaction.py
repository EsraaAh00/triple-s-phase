from rest_framework import status, permissions, viewsets, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Count, Q
from django.utils import timezone

from .models import Article
from .models_interaction import Like, Bookmark, ArticleRating, ArticleView
from .serializers_interaction import (
    LikeSerializer,
    BookmarkSerializer,
    ArticleRatingSerializer,
    ArticleViewSerializer,
    ArticleInteractionStatsSerializer
)

class LikeViewSet(viewsets.GenericViewSet, mixins.CreateModelMixin, mixins.DestroyModelMixin):
    """
    API endpoints for managing article likes
    """
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Like.objects.filter(user=self.request.user)
    
    def create(self, request, article_pk=None):
        """Like an article"""
        article = get_object_or_404(Article, pk=article_pk)
        like, created = article.like(request.user)
        
        if not created:
            return Response(
                {"detail": "You have already liked this article."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        serializer = self.get_serializer(like)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['delete'])
    def unlike(self, request, article_pk=None):
        """Unlike an article"""
        article = get_object_or_404(Article, pk=article_pk)
        if not article.is_liked_by(request.user):
            return Response(
                {"detail": "You have not liked this article yet."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        article.unlike(request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'])
    def check_like(self, request, article_pk=None):
        """Check if the current user has liked the article"""
        article = get_object_or_404(Article, pk=article_pk)
        return Response({"liked": article.is_liked_by(request.user)})


class BookmarkViewSet(viewsets.GenericViewSet, mixins.CreateModelMixin, mixins.DestroyModelMixin):
    """
    API endpoints for managing article bookmarks
    """
    serializer_class = BookmarkSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user)
    
    def create(self, request, article_pk=None):
        """Bookmark an article"""
        article = get_object_or_404(Article, pk=article_pk)
        notes = request.data.get('notes')
        
        bookmark, created = article.add_to_bookmarks(request.user, notes)
        
        if not created:
            return Response(
                {"detail": "This article is already in your bookmarks."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        serializer = self.get_serializer(bookmark)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['delete'])
    def remove_bookmark(self, request, article_pk=None):
        """Remove an article from bookmarks"""
        article = get_object_or_404(Article, pk=article_pk)
        if not article.is_bookmarked_by(request.user):
            return Response(
                {"detail": "This article is not in your bookmarks."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        article.remove_from_bookmarks(request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'])
    def check_bookmark(self, request, article_pk=None):
        """Check if the article is bookmarked by the current user"""
        article = get_object_or_404(Article, pk=article_pk)
        return Response({"bookmarked": article.is_bookmarked_by(request.user)})
    
    def list(self, request):
        """List all bookmarks for the current user"""
        bookmarks = self.get_queryset().select_related('article')
        page = self.paginate_queryset(bookmarks)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(bookmarks, many=True)
        return Response(serializer.data)


class ArticleRatingViewSet(viewsets.GenericViewSet, mixins.CreateModelMixin, mixins.UpdateModelMixin):
    """
    API endpoints for rating articles
    """
    serializer_class = ArticleRatingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ArticleRating.objects.filter(user=self.request.user)
    
    def create(self, request, article_pk=None):
        """Rate an article"""
        article = get_object_or_404(Article, pk=article_pk)
        rating = request.data.get('rating')
        comment = request.data.get('comment')
        
        if not rating or not 1 <= int(rating) <= 5:
            return Response(
                {"rating": ["Rating must be between 1 and 5."]},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        rating_obj, created = article.rate(request.user, rating, comment)
        serializer = self.get_serializer(rating_obj)
        
        if created:
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def my_rating(self, request, article_pk=None):
        """Get the current user's rating for an article"""
        article = get_object_or_404(Article, pk=article_pk)
        rating = article.get_user_rating(request.user)
        
        if rating is None:
            return Response(
                {"detail": "You have not rated this article yet."},
                status=status.HTTP_404_NOT_FOUND
            )
            
        rating_obj = ArticleRating.objects.get(article=article, user=request.user)
        serializer = self.get_serializer(rating_obj)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request, article_pk=None):
        """Get rating statistics for an article"""
        article = get_object_or_404(Article, pk=article_pk)
        
        stats = {
            'average_rating': article.get_average_rating(),
            'rating_count': article.get_rating_count(),
            'rating_distribution': article.get_rating_distribution(),
            'user_rating': article.get_user_rating(request.user) if request.user.is_authenticated else None
        }
        
        serializer = ArticleInteractionStatsSerializer(stats)
        return Response(serializer.data)


class ArticleViewViewSet(viewsets.GenericViewSet, mixins.CreateModelMixin):
    """
    API endpoints for tracking article views
    """
    serializer_class = ArticleViewSerializer
    permission_classes = [permissions.AllowAny]  # Allow tracking views for non-authenticated users
    
    def create(self, request, article_pk=None):
        """Track a view of an article"""
        article = get_object_or_404(Article, pk=article_pk)
        
        # Only track views for published articles
        if not article.is_published:
            return Response(
                {"detail": "This article is not published."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Track the view
        view = article.track_view(request)
        serializer = self.get_serializer(view)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserInteractionViewSet(viewsets.GenericViewSet):
    """
    Combined API endpoints for user interactions with articles
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def my_interactions(self, request):
        """Get all the current user's interactions with articles"""
        user = request.user
        
        # Get liked articles
        liked_articles = Article.objects.filter(likes__user=user).values_list('id', flat=True)
        
        # Get bookmarked articles with notes
        bookmarks = Bookmark.objects.filter(user=user).select_related('article')
        bookmarked_articles = [
            {
                'article_id': b.article_id,
                'notes': b.notes,
                'created_at': b.created_at
            } for b in bookmarks
        ]
        
        # Get user's ratings
        ratings = ArticleRating.objects.filter(user=user).select_related('article')
        user_ratings = [
            {
                'article_id': r.article_id,
                'rating': r.rating,
                'comment': r.comment,
                'created_at': r.created_at,
                'updated_at': r.updated_at
            } for r in ratings
        ]
        
        return Response({
            'liked_articles': list(liked_articles),
            'bookmarked_articles': bookmarked_articles,
            'ratings': user_ratings
        })
