from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django_ckeditor_5.fields import CKEditor5Field
from django.utils.text import slugify
from django.urls import reverse
from django.db.models import Count, Avg, Q
from django.utils import timezone
from courses.models import Tags

User = get_user_model()


class BookCategory(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="اسم التصنيف")
    description = models.TextField(blank=True, null=True, verbose_name="الوصف")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "تصنيف الكتب"
        verbose_name_plural = "تصنيفات الكتب"
        ordering = ['name']


class Book(models.Model):
    title = models.CharField(max_length=255, verbose_name="العنوان")
    author_name = models.CharField(max_length=255, verbose_name="اسم المؤلف")
    description = models.TextField(blank=True, verbose_name="الوصف")
    book_file = models.FileField(upload_to='books/', verbose_name="ملف الكتاب")
    cover_image = models.ImageField(upload_to='books/covers/', null=True, blank=True, verbose_name="صورة الغلاف")
    category = models.ForeignKey(BookCategory, on_delete=models.SET_NULL, null=True, related_name='books', verbose_name="التصنيف")
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="رفع بواسطة")
    upload_date = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الرفع")
    is_available = models.BooleanField(default=True, verbose_name="متاح")
    download_count = models.PositiveIntegerField(default=0, verbose_name="عدد التحميلات")
    view_count = models.PositiveIntegerField(default=0, verbose_name="عدد المشاهدات")
    file_size = models.PositiveIntegerField(null=True, blank=True, verbose_name="حجم الملف (بايت)")
    isbn = models.CharField(max_length=20, blank=True, null=True, verbose_name="ISBN")
    language = models.CharField(max_length=50, default='العربية', verbose_name="اللغة")
    pages_count = models.PositiveIntegerField(null=True, blank=True, verbose_name="عدد الصفحات")

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "كتاب"
        verbose_name_plural = "الكتب"
        ordering = ['-upload_date']
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['author_name']),
            models.Index(fields=['category']),
            models.Index(fields=['is_available']),
        ]

    def increment_downloads(self):
        """زيادة عدد التحميلات"""
        self.download_count += 1
        self.save(update_fields=['download_count'])

    def increment_views(self):
        """زيادة عدد المشاهدات"""
        self.view_count += 1
        self.save(update_fields=['view_count'])

    @property
    def popularity_score(self):
        """حساب نقاط الشعبية بناءً على المشاهدات والتحميلات"""
        return (self.view_count * 1) + (self.download_count * 3)

    def get_file_size_display(self):
        """عرض حجم الملف بطريقة مقروءة"""
        if not self.file_size:
            return "غير محدد"
        
        if self.file_size < 1024:
            return f"{self.file_size} بايت"
        elif self.file_size < 1024 * 1024:
            return f"{self.file_size / 1024:.1f} كيلوبايت"
        else:
            return f"{self.file_size / (1024 * 1024):.1f} ميجابايت"


class Article(models.Model):
    STATUS_CHOICES = [
        ('draft', 'مسودة'),
        ('published', 'منشور'),
        ('archived', 'مؤرشف'),
    ]
    
    title = models.CharField(max_length=255, verbose_name='العنوان')
    slug = models.SlugField(max_length=255, unique=True, blank=True, null=True, verbose_name='الرابط')
    content = CKEditor5Field(verbose_name='المحتوى')
    summary = models.TextField(blank=True, null=True, verbose_name='ملخص')
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='articles', verbose_name='الكاتب')
    tags = models.ManyToManyField(Tags, blank=True, related_name='articles', verbose_name='الوسوم')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')
    published_at = models.DateTimeField(null=True, blank=True, verbose_name='تاريخ النشر')
    image = models.ImageField(upload_to='articles/', null=True, blank=True, verbose_name='الصورة')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name='الحالة')
    views_count = models.PositiveIntegerField(default=0, verbose_name='عدد المشاهدات')
    featured = models.BooleanField(default=False, verbose_name='مميز')
    meta_description = models.CharField(max_length=160, blank=True, null=True, verbose_name='وصف SEO')
    meta_keywords = models.CharField(max_length=255, blank=True, null=True, verbose_name='كلمات مفتاحية SEO')
    allow_comments = models.BooleanField(default=True, verbose_name='السماح بالتعليقات')

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'مقالة'
        verbose_name_plural = 'المقالات'
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['featured', '-created_at']),
            models.Index(fields=['author', '-created_at']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Generate a slug if it doesn't exist
        if not self.slug:
            self.slug = slugify(self.title)
            
            # Make sure the slug is unique
            counter = 1
            original_slug = self.slug
            while Article.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        
        # Set published_at when status changes to published
        if self.status == 'published' and not self.published_at:
            from django.utils import timezone
            self.published_at = timezone.now()
        
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        """الحصول على رابط المقالة"""
        return reverse('article_detail', kwargs={'slug': self.slug})

    def increment_views(self):
        """زيادة عدد المشاهدات"""
        self.views_count += 1
        self.save(update_fields=['views_count'])

    @property
    def reading_time(self):
        """تقدير وقت القراءة بناءً على طول المحتوى"""
        # متوسط سرعة القراءة 200 كلمة في الدقيقة
        words = len(self.content.split())
        minutes = words / 200
        return max(1, round(minutes))  # على الأقل دقيقة واحدة

    @property
    def is_published(self):
        """فحص إذا كانت المقالة منشورة"""
        return self.status == 'published'

    @property
    def word_count(self):
        """عدد الكلمات في المقالة"""
        return len(self.content.split())

    def get_related_articles(self, limit=5):
        """
        الحصول على المقالات ذات الصلة
        """
        return Article.objects.filter(
            status='published'
        ).exclude(id=self.id).order_by('-published_at')[:limit]

    # Like-related methods
    def like(self, user):
        """
        Like the article if not already liked
        Returns (like_object, created)
        """
        from .models_interaction import Like
        return Like.objects.get_or_create(user=user, article=self)
    
    def unlike(self, user):
        """
        Remove like from the article
        Returns True if unliked, False if not previously liked
        """
        from .models_interaction import Like
        deleted, _ = Like.objects.filter(user=user, article=self).delete()
        return deleted > 0
    
    def is_liked_by(self, user):
        """Check if the article is liked by a specific user"""
        if not user.is_authenticated:
            return False
        return self.likes.filter(user=user).exists()
    
    # Bookmark-related methods
    def add_to_bookmarks(self, user, notes=None):
        """
        Add article to user's bookmarks
        Returns (bookmark_object, created)
        """
        from .models_interaction import Bookmark
        return Bookmark.objects.get_or_create(
            user=user, 
            article=self, 
            defaults={'notes': notes}
        )
    
    def remove_from_bookmarks(self, user):
        """
        Remove article from user's bookmarks
        Returns True if removed, False if not bookmarked
        """
        from .models_interaction import Bookmark
        deleted, _ = Bookmark.objects.filter(user=user, article=self).delete()
        return deleted > 0
    
    def is_bookmarked_by(self, user):
        """Check if the article is bookmarked by a specific user"""
        if not user.is_authenticated:
            return False
        return self.bookmarks.filter(user=user).exists()
    
    # Rating-related methods
    def rate(self, user, rating, comment=None):
        """
        Rate the article
        Returns (rating_object, created)
        """
        from .models_interaction import ArticleRating
        return ArticleRating.objects.update_or_create(
            user=user,
            article=self,
            defaults={
                'rating': rating,
                'comment': comment
            }
        )
    
    def get_average_rating(self):
        """Get the average rating of the article"""
        return self.ratings.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
    
    def get_rating_count(self):
        """Get the total number of ratings"""
        return self.ratings.count()
    
    def get_rating_distribution(self):
        """Get the distribution of ratings (count per star)"""
        return (
            self.ratings
            .values('rating')
            .annotate(count=Count('id'))
            .order_by('rating')
        )
    
    def get_user_rating(self, user):
        """Get the user's rating for this article if it exists"""
        if not user.is_authenticated:
            return None
        try:
            return self.ratings.get(user=user).rating
        except self.ratings.model.DoesNotExist:
            return None
    
    # View tracking
    def track_view(self, request):
        """Track a view of this article"""
        from .models_interaction import ArticleView
        
        # Get the user's IP address
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        ip_address = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
        
        # Create the view record
        ArticleView.objects.create(
            article=self,
            user=request.user if request.user.is_authenticated else None,
            ip_address=ip_address,
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        # Update the view count
        self.views_count = models.F('views_count') + 1
        self.save(update_fields=['views_count'])
        
        return self.views_count


class ArticleComment(models.Model):
    """تعليقات المقالات"""
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='comments', verbose_name='المقالة')
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='المستخدم')
    content = models.TextField(verbose_name='محتوى التعليق')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')
    is_approved = models.BooleanField(default=True, verbose_name='موافق عليه')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies', verbose_name='التعليق الأصلي')

    class Meta:
        ordering = ['created_at']
        verbose_name = 'تعليق المقالة'
        verbose_name_plural = 'تعليقات المقالات'

    def __str__(self):
        return f'تعليق {self.user.username} على {self.article.title}'

    @property
    def is_reply(self):
        """فحص إذا كان هذا رد على تعليق آخر"""
        return self.parent is not None
