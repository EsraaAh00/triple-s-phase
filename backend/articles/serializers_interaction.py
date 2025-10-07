from rest_framework import serializers
from django.utils import timezone
from .models import Article
from .models_interaction import Like, Bookmark, ArticleRating, ArticleView

class LikeSerializer(serializers.ModelSerializer):
    """Serializer for article likes"""
    user = serializers.PrimaryKeyRelatedField(read_only=True, default=serializers.CurrentUserDefault())
    article = serializers.PrimaryKeyRelatedField(queryset=Article.objects.all())
    
    class Meta:
        model = Like
        fields = ['id', 'user', 'article', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class BookmarkSerializer(serializers.ModelSerializer):
    """Serializer for article bookmarks"""
    user = serializers.PrimaryKeyRelatedField(read_only=True, default=serializers.CurrentUserDefault())
    article = serializers.PrimaryKeyRelatedField(queryset=Article.objects.all())
    article_title = serializers.CharField(source='article.title', read_only=True)
    article_slug = serializers.CharField(source='article.slug', read_only=True)
    article_summary = serializers.CharField(source='article.summary', read_only=True)
    article_image = serializers.ImageField(source='article.image', read_only=True)
    
    class Meta:
        model = Bookmark
        fields = [
            'id', 'user', 'article', 'notes', 'created_at', 'updated_at',
            'article_title', 'article_slug', 'article_summary', 'article_image'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        user = self.context['request'].user
        article = attrs.get('article')
        
        # Check if the article is already bookmarked by the user
        if Bookmark.objects.filter(user=user, article=article).exists():
            raise serializers.ValidationError("This article is already in your bookmarks.")
            
        return attrs


class ArticleRatingSerializer(serializers.ModelSerializer):
    """Serializer for article ratings"""
    user = serializers.PrimaryKeyRelatedField(read_only=True, default=serializers.CurrentUserDefault())
    article = serializers.PrimaryKeyRelatedField(queryset=Article.objects.all())
    user_name = serializers.CharField(source='user.username', read_only=True)
    article_title = serializers.CharField(source='article.title', read_only=True)
    
    class Meta:
        model = ArticleRating
        fields = [
            'id', 'user', 'user_name', 'article', 'article_title',
            'rating', 'comment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
    
    def validate(self, attrs):
        user = self.context['request'].user
        article = attrs.get('article')
        
        # For updates, we'll handle in the view
        if self.instance is None and ArticleRating.objects.filter(user=user, article=article).exists():
            raise serializers.ValidationError("You have already rated this article.")
            
        return attrs


class ArticleViewSerializer(serializers.ModelSerializer):
    """Serializer for article views"""
    class Meta:
        model = ArticleView
        fields = ['id', 'article', 'user', 'ip_address', 'user_agent', 'created_at']
        read_only_fields = fields


class ArticleInteractionStatsSerializer(serializers.Serializer):
    """Serializer for article interaction statistics"""
    average_rating = serializers.FloatField()
    rating_count = serializers.IntegerField()
    rating_distribution = serializers.ListField(child=serializers.DictField())
    user_rating = serializers.IntegerField(allow_null=True)
    
    def to_representation(self, instance):
        # Convert the rating distribution to a more readable format
        distribution = {}
        for item in instance['rating_distribution']:
            distribution[item['rating']] = item['count']
        
        # Ensure all possible ratings (1-5) are included with count 0 if missing
        for rating in range(1, 6):
            if rating not in distribution:
                distribution[rating] = 0
        
        # Sort the distribution by rating
        sorted_distribution = [
            {'rating': k, 'count': v} 
            for k, v in sorted(distribution.items())
        ]
        
        return {
            'average_rating': round(instance['average_rating'], 1) if instance['average_rating'] else None,
            'rating_count': instance['rating_count'],
            'rating_distribution': sorted_distribution,
            'user_rating': instance['user_rating']
        }


class UserInteractionSerializer(serializers.Serializer):
    """Serializer for user's article interactions"""
    liked_articles = serializers.ListField(child=serializers.IntegerField())
    bookmarked_articles = serializers.ListField(child=serializers.DictField())
    ratings = serializers.ListField(child=serializers.DictField())
    
    def to_representation(self, instance):
        # Format the response in a more structured way
        return {
            'liked_articles': instance.get('liked_articles', []),
            'bookmarked_articles': [
                {
                    'article_id': b.get('article_id'),
                    'notes': b.get('notes'),
                    'created_at': b.get('created_at').isoformat() if b.get('created_at') else None
                }
                for b in instance.get('bookmarked_articles', [])
            ],
            'ratings': [
                {
                    'article_id': r.get('article_id'),
                    'rating': r.get('rating'),
                    'comment': r.get('comment'),
                    'created_at': r.get('created_at').isoformat() if r.get('created_at') else None,
                    'updated_at': r.get('updated_at').isoformat() if r.get('updated_at') else None
                }
                for r in instance.get('ratings', [])
            ]
        }
