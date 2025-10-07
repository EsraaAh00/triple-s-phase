from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, F, Sum
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import Order, OrderItem, Cart, CartItem, Coupon, Wishlist
from .serializers import (
    OrderSerializer, CartSerializer, CartItemSerializer, CouponSerializer,
    WishlistSerializer, OrderItemSerializer
)
from courses.models import Course

User = get_user_model()


class CartView(generics.RetrieveUpdateAPIView):
    """View and update user's cart"""
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        return cart
    
    def update(self, request, *args, **kwargs):
        cart = self.get_object()
        course_id = request.data.get('course_id')
        
        # Get the course
        try:
            course = Course.objects.get(id=course_id, status='published', is_active=True)
        except Course.DoesNotExist:
            return Response(
                {"detail": "Course not found or not available."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Add course to cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            course=course,
            defaults={'price': course.current_price}
        )
        
        if not created:
            return Response(
                {"detail": "Course is already in cart."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(self.get_serializer(cart).data)


class CartItemDeleteView(generics.DestroyAPIView):
    """Remove an item from the cart"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        cart = instance.cart
        cart.update_totals()
        return Response(
            {"detail": "Item removed from cart."},
            status=status.HTTP_204_NO_CONTENT
        )


class CheckoutView(APIView):
    """Process checkout and create order"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        cart = Cart.objects.get_or_create(user=request.user)[0]
        if cart.items.count() == 0:
            return Response(
                {"detail": "Your cart is empty."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Apply coupon if provided
        coupon_code = request.data.get('coupon_code')
        coupon = None
        if coupon_code:
            try:
                coupon = Coupon.objects.get(
                    code=coupon_code.upper(),
                    valid_from__lte=timezone.now(),
                    valid_to__gte=timezone.now(),
                    active=True
                )
                cart.apply_coupon(coupon)
            except Coupon.DoesNotExist:
                return Response(
                    {"detail": "Invalid or expired coupon code."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Create order
        order = Order.objects.create(
            user=request.user,
            total=cart.total,
            discount=cart.discount,
            coupon=coupon
        )
        
        # Add order items
        for item in cart.items.all():
            order.items.create(
                content_type=item.content_type,
                object_id=item.object_id,
                price=item.price,
                quantity=item.quantity
            )
        
        # Clear the cart
        cart.items.all().delete()
        cart.update_totals()
        
        # Process payment (placeholder - integrate with payment gateway)
        # payment_success = process_payment(order, request.data.get('payment_method_nonce'))
        # if not payment_success:
        #     return Response(
        #         {"detail": "Payment processing failed."},
        #         status=status.HTTP_402_PAYMENT_REQUIRED
        #     )
        
        # Mark order as paid (in a real app, this would depend on payment confirmation)
        order.status = 'paid'
        order.save()
        
        # Process order (e.g., enroll in courses, send confirmation email)
        self.process_order(order)
        
        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED
        )
    
    def process_order(self, order):
        """Process order items (e.g., enroll in courses)"""
        from courses.models import Course, Enrollment
        
        for item in order.items.all():
            if item.content_type.model == 'courseproduct':
                course = item.content_object.course
                # Enroll user in the course
                Enrollment.objects.get_or_create(
                    user=order.user,
                    course=course,
                    defaults={'status': 'active'}
                )
        
        # Send order confirmation email
        self.send_order_confirmation(order)
    
    def send_order_confirmation(self, order):
        """Send order confirmation email (placeholder)"""
        # In a real app, you would use Django's email sending functionality
        pass


class OrderListView(generics.ListAPIView):
    """List user's orders"""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status']
    ordering_fields = ['created_at', 'total']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderDetailView(generics.RetrieveAPIView):
    """Retrieve order details"""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class CouponValidateView(APIView):
    """Validate a coupon code"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        code = request.data.get('code', '').upper()
        try:
            coupon = Coupon.objects.get(
                code=code,
                valid_from__lte=timezone.now(),
                valid_to__gte=timezone.now(),
                active=True
            )
            return Response({
                'valid': True,
                'discount': str(coupon.discount),
                'discount_type': coupon.discount_type,
                'code': coupon.code
            })
        except Coupon.DoesNotExist:
            return Response({
                'valid': False,
                'message': 'Invalid or expired coupon code.'
            }, status=status.HTTP_400_BAD_REQUEST)
