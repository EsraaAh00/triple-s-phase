from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from django.db.models import Avg, Count
from django.core.validators import MinValueValidator, MaxValueValidator

class Like(models.Model):
    """
    Model to track likes on articles.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='article_likes')
    article = models.ForeignKey('Article', on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'article')
        verbose_name = 'إعجاب'
        verbose_name_plural = 'الإعجابات'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} likes {self.article.title}"

class Bookmark(models.Model):
    """
    Model to allow users to bookmark articles.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='article_bookmarks')
    article = models.ForeignKey('Article', on_delete=models.CASCADE, related_name='bookmarks')
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True, help_text='ملاحظات إضافية')
    
    class Meta:
        unique_together = ('user', 'article')
        verbose_name = 'إشارة مرجعية'
        verbose_name_plural = 'الإشارات المرجعية'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} bookmarked {self.article.title}"

class ArticleRating(models.Model):
    """
    Model to store user ratings for articles.
    """
    RATING_CHOICES = [
        (1, '1 - سيء'),
        (2, '2 - مقبول'),
        (3, '3 - جيد'),
        (4, '4 - جيد جداً'),
        (5, '5 - ممتاز'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='article_ratings')
    article = models.ForeignKey('Article', on_delete=models.CASCADE, related_name='ratings')
    rating = models.PositiveSmallIntegerField(
        choices=RATING_CHOICES,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text='التقييم من 1 إلى 5'
    )
    comment = models.TextField(blank=True, null=True, help_text='تعليق إضافي')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'article')
        verbose_name = 'تقييم المقالة'
        verbose_name_plural = 'تقييمات المقالات'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} rated {self.article.title} with {self.rating} stars"

class ArticleView(models.Model):
    """
    Model to track article views for analytics.
    """
    article = models.ForeignKey('Article', on_delete=models.CASCADE, related_name='article_views')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'مشاهدة مقالة'
        verbose_name_plural = 'مشاهدات المقالات'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"View of {self.article.title} by {self.user.username if self.user else 'Anonymous'}"
