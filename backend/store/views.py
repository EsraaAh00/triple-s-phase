from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import serializers
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import HttpResponse
import base64
import json
import requests

from courses.models import Course
from users.models import User
from .models import Cart, CartItem, Wishlist, Order, OrderItem, Coupon
from .serializers import (
    CartSerializer, CartItemSerializer, WishlistSerializer,
    OrderSerializer, CouponSerializer, ApplyCouponSerializer,
    WishlistAddCourseSerializer
)

# Cart Views
class CartDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View to retrieve, update or clear the user's cart"""
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart


class CartItemCreateView(generics.CreateAPIView):
    """Add an item to the cart"""
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return CartItem.objects.filter(cart=cart)
    
    def perform_create(self, serializer):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        course = serializer.validated_data['course']
        
        # Check if already in cart
        cart_item = cart.items.filter(course=course).first()
        if cart_item:
            raise serializers.ValidationError("This course is already in your cart.")
        
        # Check if user is already enrolled
        if course.enrollments.filter(student=self.request.user).exists():
            raise serializers.ValidationError("You are already enrolled in this course.")
        
        serializer.save(cart=cart)


class CartItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View to update or remove a cart item"""
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return CartItem.objects.filter(cart=cart)
    
    def perform_destroy(self, instance):
        instance.delete()


# Wishlist Views
class WishlistView(generics.RetrieveAPIView):
    """View to get user's wishlist"""
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        wishlist, created = Wishlist.objects.get_or_create(user=self.request.user)
        return wishlist


class WishlistAddView(generics.CreateAPIView):
    """Add a course to wishlist"""
    serializer_class = WishlistAddCourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        course = serializer.validated_data['course']
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        wishlist.courses.add(course)
        
        return Response(
            {"detail": "Course added to wishlist"},
            status=status.HTTP_201_CREATED
        )


class WishlistRemoveView(generics.DestroyAPIView):
    """Remove a course from wishlist"""
    permission_classes = [permissions.IsAuthenticated]
    
    def destroy(self, request, *args, **kwargs):
        course_id = kwargs['pk']
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        
        try:
            course = Course.objects.get(id=course_id)
            if not wishlist.courses.filter(id=course_id).exists():
                return Response(
                    {"detail": "Course not found in wishlist"},
                    status=status.HTTP_404_NOT_FOUND
                )
                
            wishlist.courses.remove(course)
            return Response(
                {"detail": "Course removed from wishlist"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Course.DoesNotExist:
            return Response(
                {"detail": "Course not found"},
                status=status.HTTP_404_NOT_FOUND
            )


# Order Views
class OrderListCreateView(generics.ListCreateAPIView):
    """View to list and create orders"""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        cart = request.user.cart
        if not cart.items.exists():
            return Response(
                {"detail": "Your cart is empty"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create order
        order = Order.objects.create(
            user=request.user,
            status='pending',
            payment_method=request.data.get('payment_method', 'credit_card'),
            billing_email=request.data.get('billing_email', request.user.email),
            billing_name=request.data.get('billing_name', request.user.get_full_name()),
            billing_address=request.data.get('billing_address', ''),
        )
        
        # Add cart items to order
        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                course=item.course,
                price=item.course.discount_price or item.course.price
            )
        
        # Apply coupon if any
        coupon_code = request.data.get('coupon')
        if coupon_code:
            try:
                coupon = Coupon.objects.get(
                    code=coupon_code,
                    valid_from__lte=timezone.now(),
                    valid_to__gte=timezone.now(),
                    active=True
                )
                order.coupon = coupon
                order.save()
            except Coupon.DoesNotExist:
                pass
        
        # Clear the cart
        cart.items.all().delete()
        cart.update_total()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.RetrieveAPIView):
    """View to retrieve an order"""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


# Coupon Views
class CouponApplyView(generics.CreateAPIView):
    """View to apply a coupon to the cart"""
    serializer_class = ApplyCouponSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        coupon = serializer.validated_data['coupon']
        cart = request.user.cart
        
        # Apply coupon to cart
        cart.coupon = coupon
        cart.save()
        
        return Response(
            {"detail": "Coupon applied successfully"},
            status=status.HTTP_200_OK
        )


class CouponRemoveView(generics.DestroyAPIView):
    """View to remove a coupon from the cart"""
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, *args, **kwargs):
        cart = request.user.cart
        if not cart.coupon:
            return Response(
                {"detail": "No coupon applied to cart"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cart.coupon = None
        cart.save()
        
        return Response(
            {"detail": "Coupon removed successfully"},
            status=status.HTTP_200_OK
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def checkout_session(request):
    """Create a checkout session for payment"""
    cart = request.user.cart
    if not cart.items.exists():
        return Response(
            {"detail": "Your cart is empty"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # In a real implementation, integrate with a payment provider like Stripe
    # This is a simplified example
    try:
        # Create line items for the checkout session
        line_items = []
        for item in cart.items.all():
            line_items.append({
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': item.course.title,
                    },
                    'unit_amount': int((item.course.discount_price or item.course.price) * 100),  # in cents
                },
                'quantity': 1,
            })
        
        # Add coupon if any
        if cart.coupon:
            line_items.append({
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': f'Coupon: {cart.coupon.code}',
                    },
                    'unit_amount': -int(cart.coupon.discount * 100),  # negative amount for discount
                },
                'quantity': 1,
            })
        
        # In a real implementation, create a checkout session with a payment provider
        # session = stripe.checkout.Session.create(...)
        
        return Response({
            'message': 'Checkout session created successfully',
            'items': line_items,
        })
        
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def moyasar_create_payment(request):
    """Create a hosted payment with Moyasar and return the redirect URL."""
    user = request.user
    cart, created = Cart.objects.get_or_create(user=user)
    
    if not cart.items.exists():
        return Response({'detail': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

    amount = int(float(cart.total_price) * 100)  # halalas
    description = f"Order for {user.email}"
    currency = settings.MOYASAR_SETTINGS.get('CURRENCY', 'SAR')

    callback_url = settings.MOYASAR_SETTINGS.get('PUBLIC_BASE_URL', '') + '/store/payment/moyasar/callback/'

    payload = {
        'amount': amount,
        'currency': currency,
        'description': description,
        'callback_url': callback_url,
        'metadata': {
            'user_id': user.id,
        }
    }

    auth = settings.MOYASAR_SETTINGS.get('SECRET_KEY', '') + ':'
    auth_header = 'Basic ' + base64.b64encode(auth.encode()).decode()

    try:
        api_url = settings.MOYASAR_SETTINGS.get('API_BASE_URL', 'https://api.moyasar.com/v1') + '/invoices'
        resp = requests.post(
            api_url,
            headers={
                'Authorization': auth_header,
                'Content-Type': 'application/json',
            },
            json=payload,
            timeout=20
        )
        data = resp.json()
        if resp.status_code not in (200, 201):
            return Response({'detail': 'Failed to create payment', 'error': data}, status=status.HTTP_400_BAD_REQUEST)

        # Expecting 'url' for hosted page
        invoice_url = data.get('url') or data.get('source', {}).get('transaction_url')
        if not invoice_url:
            return Response({'detail': 'Payment URL not returned', 'data': data}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'url': invoice_url, 'invoice': data})
    except Exception as exc:
        return Response({'detail': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def moyasar_create_course_payment(request, course_id):
    """Create a hosted payment for a specific course with Moyasar and return the redirect URL."""
    user = request.user
    
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'detail': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user is already enrolled
    if course.enrollments.filter(student=user).exists():
        return Response({'detail': 'You are already enrolled in this course.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Calculate amount (course price + tax)
    course_price = course.discount_price if course.discount_price else course.price
    tax = float(course_price) * 0.15  # 15% tax
    total_amount = float(course_price) + tax
    amount = int(total_amount * 100)  # halalas
    
    description = f"Payment for course: {course.title}"
    currency = settings.MOYASAR_SETTINGS.get('CURRENCY', 'SAR')

    callback_url = settings.MOYASAR_SETTINGS.get('PUBLIC_BASE_URL', '') + '/store/payment/moyasar/callback/'

    payload = {
        'amount': amount,
        'currency': currency,
        'description': description,
        'callback_url': callback_url,
        'metadata': {
            'user_id': user.id,
            'course_id': course.id,
            'payment_type': 'direct_course_payment'
        }
    }

    auth = settings.MOYASAR_SETTINGS.get('SECRET_KEY', '') + ':'
    auth_header = 'Basic ' + base64.b64encode(auth.encode()).decode()

    try:
        api_url = settings.MOYASAR_SETTINGS.get('API_BASE_URL', 'https://api.moyasar.com/v1') + '/invoices'
        resp = requests.post(
            api_url,
            headers={
                'Authorization': auth_header,
                'Content-Type': 'application/json',
            },
            json=payload,
            timeout=20
        )
        data = resp.json()
        if resp.status_code not in (200, 201):
            return Response({'detail': 'Failed to create payment', 'error': data}, status=status.HTTP_400_BAD_REQUEST)

        # Expecting 'url' for hosted page
        invoice_url = data.get('url') or data.get('source', {}).get('transaction_url')
        if not invoice_url:
            return Response({'detail': 'Payment URL not returned', 'data': data}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'url': invoice_url, 'invoice': data})
    except Exception as exc:
        return Response({'detail': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def moyasar_callback(request):
    """Handle user returning from Moyasar hosted page."""
    # Get payment details from query parameters
    payment_id = request.query_params.get('payment_id')
    invoice_id = request.query_params.get('invoice_id')
    
    if payment_id or invoice_id:
        # In a real implementation, you would verify the payment with Moyasar API
        # and enroll the user in the course if payment was successful
        
        # For now, just redirect to success page
        return Response({
            'detail': 'Payment completed successfully',
            'payment_id': payment_id,
            'invoice_id': invoice_id,
            'redirect_url': '/payment/success/'
        })
    
    return Response({'detail': 'Callback received', 'query': request.query_params})


@csrf_exempt
@require_POST
def moyasar_webhook(request):
    """Webhook to receive payment status updates from Moyasar."""
    try:
        event = json.loads(request.body.decode('utf-8'))
        
        # Handle payment success
        if event.get('type') == 'payment.succeeded':
            payment_data = event.get('data', {})
            metadata = payment_data.get('metadata', {})
            
            # Check if this is a direct course payment
            if metadata.get('payment_type') == 'direct_course_payment':
                user_id = metadata.get('user_id')
                course_id = metadata.get('course_id')
                
                if user_id and course_id:
                    try:
                        user = User.objects.get(id=user_id)
                        course = Course.objects.get(id=course_id)
                        
                        # Enroll user in course
                        from courses.models import Enrollment
                        enrollment, created = Enrollment.objects.get_or_create(
                            student=user,
                            course=course,
                            defaults={
                                'status': 'active',
                                'enrolled_at': timezone.now()
                            }
                        )
                        
                        if created:
                            print(f"User {user.username} enrolled in course {course.title}")
                        else:
                            print(f"User {user.username} already enrolled in course {course.title}")
                            
                    except (User.DoesNotExist, Course.DoesNotExist) as e:
                        print(f"Error enrolling user: {e}")
        
        return HttpResponse(status=200)
    except Exception as e:
        print(f"Webhook error: {e}")
        return HttpResponse(status=400)
