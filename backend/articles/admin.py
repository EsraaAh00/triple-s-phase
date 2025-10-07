from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.contrib.admin import SimpleListFilter
from django.db.models import Count
from django.utils.text import slugify
from .models import BookCategory, Book, Article, ArticleComment
from courses.models import Tags


class PublishedFilter(SimpleListFilter):
    title = 'حالة النشر'
    parameter_name = 'status'

    def lookups(self, request, model_admin):
        return (
            ('published', 'منشور'),
            ('draft', 'مسودة'),
            ('archived', 'مؤرشف'),
        )

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(status=self.value())
        return queryset


class FeaturedFilter(SimpleListFilter):
    title = 'المقالات المميزة'
    parameter_name = 'featured'

    def lookups(self, request, model_admin):
        return (
            ('yes', 'مميز'),
            ('no', 'عادي'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'yes':
            return queryset.filter(featured=True)
        elif self.value() == 'no':
            return queryset.filter(featured=False)
        return queryset


@admin.register(BookCategory)
class BookCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'books_count', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'description')
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('معلومات التصنيف', {
            'fields': ('name', 'description')
        }),
        ('التواريخ', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def books_count(self, obj):
        count = obj.books.count()
        if count > 0:
            url = reverse('admin:articles_book_changelist') + f'?category__id__exact={obj.id}'
            return format_html('<a href="{}">{} كتاب</a>', url, count)
        return '0 كتاب'
    books_count.short_description = 'عدد الكتب'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.prefetch_related('books')


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'author_name', 'category', 'language', 'is_available',
        'download_count', 'view_count', 'file_size_display', 'upload_date'
    )
    list_filter = ('is_available', 'category', 'language', 'upload_date')
    search_fields = ('title', 'author_name', 'description', 'isbn')
    readonly_fields = ('upload_date', 'download_count', 'view_count', 'file_size_display', 'popularity_score')
    
    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('title', 'author_name', 'category', 'description')
        }),
        ('الملفات', {
            'fields': ('book_file', 'cover_image')
        }),
        ('تفاصيل إضافية', {
            'fields': (
                ('language', 'pages_count'),
                ('isbn', 'is_available')
            )
        }),
        ('الإحصائيات', {
            'fields': ('download_count', 'view_count', 'file_size_display', 'popularity_score'),
            'classes': ('collapse',)
        }),
        ('معلومات النظام', {
            'fields': ('uploaded_by', 'upload_date'),
            'classes': ('collapse',)
        }),
    )
    
    def file_size_display(self, obj):
        return obj.get_file_size_display()
    file_size_display.short_description = 'حجم الملف'
    
    def popularity_score(self, obj):
        return f'{obj.popularity_score:,} نقطة'
    popularity_score.short_description = 'نقاط الشعبية'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('category', 'uploaded_by')


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'author', 'status_display',
        'views_count', 'comments_count', 'created_at'
    )
    list_filter = (
        PublishedFilter, 'created_at', 'updated_at', 'status'
    )
    search_fields = ('title', 'content', 'author__username', 'author__first_name', 'author__last_name')
    filter_horizontal = ('tags',)
    readonly_fields = (
        'created_at', 'updated_at', 'views_count', 'comments_count',
        'reading_time_display', 'word_count_display'
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing an existing object
            return self.readonly_fields + ('slug',)
        return self.readonly_fields
        

    
    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('title', 'slug', 'author')
        }),
        ('المحتوى', {
            'fields': ('content', 'summary', 'image')
        }),
        ('الإعدادات', {
            'fields': (
                ('status', 'featured'),
                ('allow_comments', 'meta_description')
            )
        }),
        ('الوسوم', {
            'fields': ('tags',)
        }),
        ('الإحصائيات', {
            'fields': ('views_count', 'comments_count', 'reading_time_display', 'word_count_display'),
            'classes': ('collapse',)
        }),
        ('التواريخ', {
            'fields': ('created_at', 'updated_at', 'published_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['make_featured', 'remove_featured', 'publish_articles', 'unpublish_articles']
    
    def status_display(self, obj):
        status_colors = {
            'published': ('#28a745', '✅ منشور'),
            'draft': ('#6c757d', '📝 مسودة'),
            'archived': ('#ffc107', '📦 مؤرشف'),
        }
        color, text = status_colors.get(obj.status, ('#6c757d', obj.get_status_display()))
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, text)
    status_display.short_description = 'الحالة'
    
    def featured_display(self, obj):
        if obj.featured:
            return format_html('<span style="color: #ffc107;">⭐ مميز</span>')
        return '⚪ عادي'
    featured_display.short_description = 'مميز'
    
    def comments_count(self, obj):
        count = obj.comments.filter(is_approved=True).count()
        if count > 0:
            url = reverse('admin:articles_articlecomment_changelist') + f'?article__id__exact={obj.id}'
            return format_html('<a href="{}">{} تعليق</a>', url, count)
        return '0 تعليق'
    comments_count.short_description = 'التعليقات'
    
    def reading_time_display(self, obj):
        return f'{obj.reading_time} دقيقة'
    reading_time_display.short_description = 'وقت القراءة'
    
    def word_count_display(self, obj):
        return f'{obj.word_count:,} كلمة'
    word_count_display.short_description = 'عدد الكلمات'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('author').prefetch_related('tags', 'comments')
    
    def save_model(self, request, obj, form, change):
        # تعيين المؤلف تلقائياً إذا لم يكن محدداً
        if not obj.author:
            obj.author = request.user
        # تعيين slug تلقائياً إذا لم يكن محدداً
        if not obj.slug:
            obj.slug = slugify(obj.title)
        super().save_model(request, obj, form, change)
    
    def make_featured(self, request, queryset):
        updated = queryset.update(featured=True)
        self.message_user(request, f'تم تمييز {updated} مقال.')
    make_featured.short_description = "تمييز المقالات المحددة"
    
    def remove_featured(self, request, queryset):
        updated = queryset.update(featured=False)
        self.message_user(request, f'تم إلغاء تمييز {updated} مقال.')
    remove_featured.short_description = "إلغاء تمييز المقالات المحددة"
    
    def publish_articles(self, request, queryset):
        updated = queryset.update(status='published')
        self.message_user(request, f'تم نشر {updated} مقال.')
    publish_articles.short_description = "نشر المقالات المحددة"
    
    def unpublish_articles(self, request, queryset):
        updated = queryset.update(status='draft')
        self.message_user(request, f'تم إلغاء نشر {updated} مقال.')
    unpublish_articles.short_description = "إلغاء نشر المقالات المحددة"


@admin.register(ArticleComment)
class ArticleCommentAdmin(admin.ModelAdmin):
    list_display = (
        'article_title', 'user', 'content_preview', 'approval_status',
        'replies_count', 'created_at'
    )
    list_filter = ('is_approved', 'created_at', 'article')
    search_fields = (
        'article__title', 'user__username', 'content',
        'user__first_name', 'user__last_name'
    )
    readonly_fields = ('created_at', 'updated_at', 'replies_count')
    
    fieldsets = (
        ('معلومات التعليق', {
            'fields': ('article', 'user', 'content', 'parent')
        }),
        ('الحالة', {
            'fields': ('is_approved',)
        }),
        ('الإحصائيات', {
            'fields': ('replies_count',),
            'classes': ('collapse',)
        }),
        ('التواريخ', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['approve_comments', 'disapprove_comments']
    
    def article_title(self, obj):
        url = reverse('admin:articles_article_change', args=[obj.article.id])
        return format_html('<a href="{}">{}</a>', url, obj.article.title[:30] + '...')
    article_title.short_description = 'المقال'
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'المحتوى'
    
    def approval_status(self, obj):
        if obj.is_approved:
            return format_html('<span style="color: #28a745;">✅ مقبول</span>')
        else:
            return format_html('<span style="color: #dc3545;">❌ في الانتظار</span>')
    approval_status.short_description = 'حالة الموافقة'
    
    def replies_count(self, obj):
        return f'{obj.replies.count():,}' if hasattr(obj, 'replies') else '0'
    replies_count.short_description = 'الردود'
    
    def approve_comments(self, request, queryset):
        updated = queryset.update(is_approved=True)
        self.message_user(request, f'تم قبول {updated} تعليق.')
    approve_comments.short_description = "قبول التعليقات المحددة"
    
    def disapprove_comments(self, request, queryset):
        updated = queryset.update(is_approved=False)
        self.message_user(request, f'تم رفض {updated} تعليق.')
    disapprove_comments.short_description = "رفض التعليقات المحددة"
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('article', 'user').prefetch_related('replies') 