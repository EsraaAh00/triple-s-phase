from rest_framework import serializers
from .models import BookCategory, Article, ArticleComment


class BookCategorySerializer(serializers.ModelSerializer):
    articles_count = serializers.SerializerMethodField()

    class Meta:
        model = BookCategory
        fields = ['id', 'name', 'description', 'created_at', 'articles_count']
        read_only_fields = ['created_at']

    def get_articles_count(self, obj):
        return obj.articles.filter(is_published=True).count()


class ArticleCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    replies_count = serializers.SerializerMethodField()

    class Meta:
        model = ArticleComment
        fields = [
            'id', 'article', 'user', 'author_name', 'content', 
            'is_approved', 'likes_count', 'replies_count', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at', 'is_approved']

    def get_likes_count(self, obj):
        return getattr(obj, 'likes', []).count() if hasattr(obj, 'likes') else 0

    def get_author_name(self, obj):
        if obj.user:
            # Try to get name from profile first
            if hasattr(obj.user, 'profile') and obj.user.profile and obj.user.profile.name:
                return obj.user.profile.name
            # Try to get full name from user
            elif obj.user.first_name or obj.user.last_name:
                full_name = f"{obj.user.first_name or ''} {obj.user.last_name or ''}".strip()
                if full_name:
                    return full_name
            # Fallback to username
            elif obj.user.username:
                return obj.user.username
        return 'مستخدم'

    def get_replies_count(self, obj):
        return getattr(obj, 'replies', []).count() if hasattr(obj, 'replies') else 0


class ArticleSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    reading_time = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'author', 'author_name', 
            'content', 'summary', 'image', 'status', 'featured', 'allow_comments',
            'meta_description', 'meta_keywords', 'views_count', 'comments_count', 'likes_count',
            'reading_time', 'created_at', 'updated_at', 'published_at', 'tags'
        ]
        read_only_fields = ['author', 'slug', 'views_count', 'created_at', 'updated_at', 'published_at']

    def get_comments_count(self, obj):
        return obj.comments.filter(is_approved=True).count()

    def get_likes_count(self, obj):
        return getattr(obj, 'likes', []).count() if hasattr(obj, 'likes') else 0

    def get_reading_time(self, obj):
        if obj.content:
            # تقدير وقت القراءة (200 كلمة في الدقيقة)
            word_count = len(obj.content.split())
            minutes = max(1, word_count // 200)
            return minutes
        return 0

    def get_author_name(self, obj):
        if obj.author:
            # Try to get name from profile first
            if hasattr(obj.author, 'profile') and obj.author.profile and obj.author.profile.name:
                return obj.author.profile.name
            # Try to get full name from user
            elif obj.author.first_name or obj.author.last_name:
                full_name = f"{obj.author.first_name or ''} {obj.author.last_name or ''}".strip()
                if full_name:
                    return full_name
            # Fallback to username
            elif obj.author.username:
                return obj.author.username
        return 'مؤلف غير معروف'

    def get_tags(self, obj):
        return [{'id': tag.id, 'name': tag.name} for tag in obj.tags.all()]

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data) 