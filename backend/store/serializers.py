from rest_framework import serializers
from django.utils import timezone
from django.db import transaction
from decimal import Decimal
from courses.models import Course
from users.models import User
from .models import Cart, CartItem, Wishlist, Order, OrderItem, Coupon


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for cart items"""
    course_id = serializers.PrimaryKeyRelatedField(
        source='course',
        queryset=Course.objects.all()
    )
    course = serializers.SerializerMethodField()
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_image = serializers.ImageField(source='course.image', read_only=True)
    course_instructor = serializers.SerializerMethodField()
    course_price = serializers.DecimalField(
        source='course.price',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    course_discount_price = serializers.DecimalField(
        source='course.discount_price',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    price = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = [
            'id', 'course_id', 'course', 'course_title', 'course_image', 'course_instructor',
            'course_price', 'course_discount_price', 'price', 'added_at'
        ]
        read_only_fields = ['id', 'added_at', 'price']
    
    def get_price(self, obj):
        """Get the effective price (discount price if available, otherwise regular price)"""
        return obj.course.discount_price if obj.course.discount_price else obj.course.price
    
    def get_course(self, obj):
        """Get the full course object"""
        from courses.serializers import CourseBasicSerializer
        return CourseBasicSerializer(obj.course, context=self.context).data
    
    def get_course_instructor(self, obj):
        """Get the instructor name safely"""
        try:
            if hasattr(obj.course, 'instructors') and obj.course.instructors.exists():
                return obj.course.instructors.first().name
            elif hasattr(obj.course, 'teacher') and obj.course.teacher:
                return obj.course.teacher.profile.name if hasattr(obj.course.teacher, 'profile') else obj.course.teacher.username
            else:
                return "Unknown Instructor"
        except:
            return "Unknown Instructor"
    
    def validate_course(self, course):
        # Check if the course is already in the user's cart
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            cart, created = Cart.objects.get_or_create(user=request.user)
            if self.instance:  # For updates
                if cart.items.filter(course=course).exclude(id=self.instance.id).exists():
                    raise serializers.ValidationError("This course is already in your cart.")
            else:  # For creates
                if cart.items.filter(course=course).exists():
                    raise serializers.ValidationError("This course is already in your cart.")
        
        # Check if the user is already enrolled in the course
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            if course.enrollments.filter(student=request.user).exists():
                raise serializers.ValidationError("You are already enrolled in this course.")
        
        return course
    
    def create(self, validated_data):
        cart, created = Cart.objects.get_or_create(user=self.context['request'].user)
        course = validated_data['course']
        
        cart_item = CartItem.objects.create(
            cart=cart,
            course=course
        )
        
        return cart_item


class CartSerializer(serializers.ModelSerializer):
    """Serializer for shopping cart"""
    items = CartItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()
    tax = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = [
            'id', 'items', 'items_count', 'subtotal', 'tax', 'total',
            'coupon', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'subtotal', 'tax', 'total',
            'created_at', 'updated_at'
        ]
    
    def get_items_count(self, obj):
        return obj.items.count()
    
    def get_subtotal(self, obj):
        """Calculate subtotal from cart items"""
        total = Decimal('0.00')
        for item in obj.items.all():
            price = item.course.discount_price if item.course.discount_price else item.course.price
            total += price * item.quantity
        return total
    
    def get_tax(self, obj):
        """Calculate tax (15%)"""
        subtotal = self.get_subtotal(obj)
        return subtotal * Decimal('0.15')
    
    def get_total(self, obj):
        """Calculate total including tax"""
        subtotal = self.get_subtotal(obj)
        tax = self.get_tax(obj)
        return subtotal + tax


class WishlistCourseSerializer(serializers.ModelSerializer):
    """Serializer for courses in wishlist"""
    instructor_name = serializers.CharField(
        source='teacher.profile.name',
        read_only=True
    )
    is_in_cart = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'image', 'instructor_name',
            'price', 'discount_price', 'is_in_cart'
        ]
        read_only_fields = ['id']
    
    def get_is_in_cart(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=request.user)
            return cart.items.filter(course=obj).exists()
        return False


class WishlistSerializer(serializers.ModelSerializer):
    """Serializer for wishlist"""
    courses = WishlistCourseSerializer(many=True, read_only=True)
    courses_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Wishlist
        fields = [
            'id', 'courses', 'courses_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_courses_count(self, obj):
        return obj.courses.count()


class WishlistAddCourseSerializer(serializers.Serializer):
    """Serializer for adding course to wishlist"""
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())
    
    def validate_course(self, course):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
            
            # Check if already in wishlist
            if wishlist.courses.filter(id=course.id).exists():
                raise serializers.ValidationError("This course is already in your wishlist.")
            
            # Check if already enrolled
            if course.enrollments.filter(student=request.user).exists():
                raise serializers.ValidationError("You are already enrolled in this course.")
        
        return course


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items"""
    course_id = serializers.PrimaryKeyRelatedField(
        source='course',
        queryset=Course.objects.all()
    )
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_image = serializers.ImageField(source='course.image', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'course_id', 'course_title', 'course_image',
            'price', 'discount_amount', 'final_price', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'price', 'discount_amount', 'final_price']


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for orders"""
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    payment_method_display = serializers.CharField(
        source='get_payment_method_display',
        read_only=True
    )
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'items', 'subtotal', 'tax', 'total',
            'discount_amount', 'final_total', 'status', 'status_display',
            'payment_method', 'payment_method_display', 'payment_status',
            'billing_address', 'shipping_address', 'coupon', 'transaction_id',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'user', 'subtotal', 'tax', 'total',
            'discount_amount', 'final_total', 'status', 'payment_status',
            'transaction_id', 'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        with transaction.atomic():
            user = self.context['request'].user
            cart = user.cart
            
            if cart.items.count() == 0:
                raise serializers.ValidationError("Your cart is empty.")
            
            # Calculate order totals
            subtotal = cart.subtotal
            tax = cart.tax
            total = cart.total
            discount_amount = cart.discount_amount or Decimal('0.00')
            final_total = total - discount_amount
            
            # Create order
            order = Order.objects.create(
                user=user,
                subtotal=subtotal,
                tax=tax,
                total=total,
                discount_amount=discount_amount,
                final_total=final_total,
                status='pending',
                payment_method=validated_data.get('payment_method', 'stripe'),
                payment_status='pending',
                billing_address=validated_data.get('billing_address'),
                shipping_address=validated_data.get('shipping_address'),
                coupon=cart.coupon
            )
            
            # Create order items
            for item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    course=item.course,
                    price=item.price,
                    discount_amount=item.discount_amount or Decimal('0.00'),
                    final_price=item.final_price
                )
            
            # Clear the cart
            cart.items.all().delete()
            cart.coupon = None
            cart.discount_amount = Decimal('0.00')
            cart.save()
            
            return order


class CouponSerializer(serializers.ModelSerializer):
    """Serializer for coupons"""
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'description', 'discount_type', 'discount_value',
            'max_discount', 'min_purchase', 'valid_from', 'valid_to',
            'max_uses', 'times_used', 'is_active', 'is_valid', 'created_at'
        ]
        read_only_fields = ['id', 'times_used', 'created_at']
    
    def get_is_valid(self, obj):
        now = timezone.now()
        return (
            obj.is_active and
            obj.valid_from <= now <= obj.valid_to and
            (obj.max_uses is None or obj.times_used < obj.max_uses)
        )
    
    def validate(self, data):
        # Validate discount value based on type
        discount_type = data.get('discount_type', self.instance.discount_type if self.instance else None)
        discount_value = data.get('discount_value')
        
        if discount_value is not None:
            if discount_type == 'percentage' and not (0 < discount_value <= 100):
                raise serializers.ValidationError({
                    'discount_value': 'Percentage discount must be between 0 and 100.'
                })
            elif discount_type == 'fixed' and discount_value <= 0:
                raise serializers.ValidationError({
                    'discount_value': 'Fixed discount must be greater than 0.'
                })
        
        # Validate date range
        valid_from = data.get('valid_from')
        valid_to = data.get('valid_to')
        
        if valid_from and valid_to and valid_from >= valid_to:
            raise serializers.ValidationError({
                'valid_to': 'End date must be after start date.'
            })
        
        return data


class ApplyCouponSerializer(serializers.Serializer):
    """Serializer for applying a coupon to the cart"""
    code = serializers.CharField(max_length=50)
    
    def validate_code(self, value):
        try:
            coupon = Coupon.objects.get(code=value)
            now = timezone.now()
            
            if not coupon.is_active:
                raise serializers.ValidationError("This coupon is not active.")
            
            if now < coupon.valid_from:
                raise serializers.ValidationError("This coupon is not yet valid.")
            
            if now > coupon.valid_to:
                raise serializers.ValidationError("This coupon has expired.")
            
            if coupon.max_uses is not None and coupon.times_used >= coupon.max_uses:
                raise serializers.ValidationError("This coupon has reached its maximum usage limit.")
            
            return coupon
        except Coupon.DoesNotExist:
            raise serializers.ValidationError("Invalid coupon code.")
    
    def validate(self, data):
        request = self.context.get('request')
        cart = request.user.cart
        
        if cart.items.count() == 0:
            raise serializers.ValidationError({
                'non_field_errors': ['Your cart is empty.']
            })
        
        coupon = data['code']  # This is actually the coupon instance due to validate_code
        
        # Check minimum purchase amount
        if coupon.min_purchase and cart.subtotal < coupon.min_purchase:
            raise serializers.ValidationError({
                'non_field_errors': [
                    f'Minimum purchase amount of ${coupon.min_purchase} required for this coupon.'
                ]
            })
        
        # Check if coupon is already applied
        if cart.coupon == coupon:
            raise serializers.ValidationError({
                'non_field_errors': ['This coupon is already applied to your cart.']
            })
        
        return data
    
    def save(self):
        cart = self.context['request'].user.cart
        coupon = self.validated_data['code']  # This is the coupon instance
        
        # Calculate discount amount
        if coupon.discount_type == 'percentage':
            discount_amount = (cart.subtotal * coupon.discount_value) / 100
            if coupon.max_discount and discount_amount > coupon.max_discount:
                discount_amount = coupon.max_discount
        else:  # fixed
            discount_amount = min(coupon.discount_value, cart.subtotal)
        
        # Apply discount to cart
        cart.coupon = coupon
        cart.discount_amount = discount_amount
        cart.save()
        
        return cart
