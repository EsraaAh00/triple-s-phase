from django.contrib import admin
from django.utils.html import format_html
from .models import CourseReview, ReviewReply, Comment, CommentLike


class ReviewReplyInline(admin.StackedInline):
    model = ReviewReply
    extra = 0
    readonly_fields = ['created_at', 'updated_at']
    fields = ['user', 'reply_text', 'is_approved', 'created_at', 'updated_at']


@admin.register(CourseReview)
class CourseReviewAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'course', 'user', 'rating_stars', 'is_approved',
        'created_at', 'updated_at'
    ]
    list_filter = ['is_approved', 'rating', 'created_at']
    search_fields = [
        'course__name', 'user__username', 'user__email', 'review_text'
    ]
    list_editable = ['is_approved']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [ReviewReplyInline]
    
    def rating_stars(self, obj):
        return '★' * obj.rating + '☆' * (5 - obj.rating)
    rating_stars.short_description = 'Rating'
    rating_stars.admin_order_field = 'rating'


@admin.register(ReviewReply)
class ReviewReplyAdmin(admin.ModelAdmin):
    list_display = ['id', 'review', 'user', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'created_at']
    search_fields = [
        'review__course__name', 'user__username', 'reply_text'
    ]
    list_editable = ['is_approved']
    readonly_fields = ['created_at', 'updated_at']


class CommentLikeInline(admin.TabularInline):
    model = CommentLike
    extra = 0
    readonly_fields = ['created_at']
    raw_id_fields = ['user']


class CommentReplyInline(admin.StackedInline):
    model = Comment
    extra = 0
    readonly_fields = ['created_at', 'updated_at']
    fields = ['user', 'content', 'is_active', 'created_at', 'updated_at']
    fk_name = 'parent'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'truncated_content', 'user', 'course', 'is_active',
        'is_reply', 'like_count', 'created_at'
    ]
    list_filter = ['is_active', 'created_at']
    search_fields = [
        'content', 'user__username', 'course__name', 'user__email'
    ]
    list_editable = ['is_active']
    readonly_fields = ['created_at', 'updated_at', 'like_count']
    inlines = [CommentReplyInline, CommentLikeInline]
    raw_id_fields = ['user', 'course', 'parent']
    
    def truncated_content(self, obj):
        return (
            obj.content[:50] + '...' 
            if len(obj.content) > 50 
            else obj.content
        )
    truncated_content.short_description = 'Content'
    
    def is_reply(self, obj):
        return obj.parent is not None
    is_reply.boolean = True
    is_reply.short_description = 'Is Reply?'


@admin.register(CommentLike)
class CommentLikeAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'comment', 'created_at']
    list_filter = ['created_at']
    search_fields = [
        'user__username', 'user__email', 'comment__content'
    ]
    readonly_fields = ['created_at']
    raw_id_fields = ['user', 'comment']
