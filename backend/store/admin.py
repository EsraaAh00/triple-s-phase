from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.utils import timezone

from .models import Cart, CartItem, Wishlist, Order, OrderItem, Coupon


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 1
    raw_id_fields = ['course']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_price', 'total_items', 'updated_at']
    list_filter = ['updated_at']
    search_fields = ['user__username', 'user__email']
    inlines = [CartItemInline]
    readonly_fields = ['total_price', 'total_items']


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['cart', 'course', 'quantity', 'total_price']
    list_filter = ['added_at']
    search_fields = ['cart__user__username', 'course__title']
    raw_id_fields = ['cart', 'course']


class WishlistCoursesInline(admin.TabularInline):
    model = Wishlist.courses.through
    extra = 1
    raw_id_fields = ['course']


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'courses_count', 'updated_at']
    list_filter = ['updated_at']
    search_fields = ['user__username', 'user__email']
    inlines = [WishlistCoursesInline]
    exclude = ['courses']
    
    def courses_count(self, obj):
        return obj.courses.count()
    courses_count.short_description = 'Number of Courses'


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['get_total_price']
    raw_id_fields = ['course']
    
    def get_total_price(self, obj):
        return obj.price * obj.quantity
    get_total_price.short_description = 'Total Price'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'order_number', 'user', 'status', 'total', 'payment_method', 'created_at'
    ]
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = [
        'order_number', 'user__username', 'user__email',
        'billing_email', 'billing_name'
    ]
    readonly_fields = [
        'order_number', 'subtotal', 'tax', 'total', 'created_at', 'updated_at'
    ]
    inlines = [OrderItemInline]
    fieldsets = [
        (None, {
            'fields': [
                'order_number', 'user', 'status', 'payment_method',
                'payment_id', 'payment_status'
            ]
        }),
        ('Billing Information', {
            'fields': [
                'billing_name', 'billing_email', 'billing_address'
            ]
        }),
        ('Totals', {
            'fields': [
                'subtotal', 'tax', 'total'
            ]
        }),
        ('Timestamps', {
            'fields': [
                'created_at', 'updated_at'
            ]
        }),
    ]


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'discount_value', 'is_active', 'is_valid', 'used_count', 'valid_until']
    list_filter = ['discount_type', 'is_active']
    search_fields = ['code', 'description']
    list_editable = ['is_active']
    readonly_fields = ['created_at', 'updated_at', 'used_count', 'is_valid', 'valid_until']
    date_hierarchy = 'valid_to'
    
    fieldsets = [
        (None, {
            'fields': [
                'code', 'description', 'is_active',
                'discount_type', 'discount_value',
                'min_purchase', 'max_uses', 'used_count',
            ]
        }),
        ('Validity', {
            'fields': [
                'valid_from', 'valid_to'
            ]
        }),
        ('Timestamps', {
            'fields': [
                'created_at', 'updated_at'
            ],
            'classes': ['collapse']
        }),
    ]
    
    def is_valid(self, obj):
        return obj.is_valid()
    is_valid.boolean = True
    is_valid.short_description = 'Is Valid'
    
    def valid_until(self, obj):
        return obj.valid_to
    valid_until.short_description = 'Valid Until'


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'course', 'price', 'created_at', 'get_order_user']
    list_filter = ['created_at']
    search_fields = [
        'order__order_number', 'course__title',
        'order__user__username', 'order__user__email'
    ]
    raw_id_fields = ['order', 'course']
    readonly_fields = ['created_at']
    
    def get_order_user(self, obj):
        return obj.order.user if obj.order and obj.order.user else None
    get_order_user.short_description = 'User'
    get_order_user.admin_order_field = 'order__user'
