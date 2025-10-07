from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from datetime import datetime, timedelta

from ...courses.models import Course
from ..models import Cart, CartItem, Wishlist, Order, OrderItem, Coupon

User = get_user_model()


class CartModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.course = Course.objects.create(
            title='Test Course',
            description='Test Description',
            price=99.99,
            teacher=self.user
        )
    
    def test_cart_creation(self):
        cart = Cart.objects.create(user=self.user)
        self.assertEqual(str(cart), f"Cart for {self.user.username}")
    
    def test_add_item_to_cart(self):
        cart = Cart.objects.create(user=self.user)
        cart_item = cart.add_item(self.course)
        self.assertEqual(cart.items.count(), 1)
        self.assertEqual(cart_item.course, self.course)
        self.assertEqual(cart_item.quantity, 1)
    
    def test_remove_item_from_cart(self):
        cart = Cart.objects.create(user=self.user)
        cart_item = cart.add_item(self.course)
        cart.remove_item(self.course.id)
        self.assertEqual(cart.items.count(), 0)


class WishlistModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='wishlistuser',
            email='wishlist@example.com',
            password='testpass123'
        )
        self.course = Course.objects.create(
            title='Wishlist Course',
            description='Wishlist Description',
            price=49.99,
            teacher=self.user
        )
    
    def test_add_to_wishlist(self):
        wishlist = Wishlist.objects.create(user=self.user)
        wishlist.courses.add(self.course)
        self.assertEqual(wishlist.courses.count(), 1)
        self.assertEqual(wishlist.courses.first(), self.course)


class OrderModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='orderuser',
            email='order@example.com',
            password='testpass123'
        )
        self.course = Course.objects.create(
            title='Order Course',
            description='Order Description',
            price=29.99,
            teacher=self.user
        )
    
    def test_order_creation(self):
        order = Order.objects.create(
            user=self.user,
            order_number='TEST123',
            status='pending',
            payment_method='credit_card',
            billing_email='test@example.com',
            billing_name='Test User',
            billing_address='123 Test St',
            subtotal=29.99,
            tax=2.99,
            total=32.98
        )
        OrderItem.objects.create(
            order=order,
            course=self.course,
            price=29.99
        )
        self.assertEqual(str(order), f"Order {order.order_number}")
        self.assertEqual(order.items.count(), 1)


class CouponModelTest(TestCase):
    def test_coupon_creation(self):
        coupon = Coupon.objects.create(
            code='TEST20',
            valid_from=datetime.now(),
            valid_to=datetime.now() + timedelta(days=30),
            discount=20.00,
            active=True
        )
        self.assertEqual(str(coupon), 'TEST20 (20.00% off)')
    
    def test_expired_coupon(self):
        coupon = Coupon.objects.create(
            code='EXPIRED',
            valid_from=datetime.now() - timedelta(days=30),
            valid_to=datetime.now() - timedelta(days=1),
            discount=10.00,
            active=True
        )
        self.assertFalse(coupon.is_valid())
    
    def test_inactive_coupon(self):
        coupon = Coupon.objects.create(
            code='INACTIVE',
            valid_from=datetime.now() - timedelta(days=1),
            valid_to=datetime.now() + timedelta(days=30),
            discount=15.00,
            active=False
        )
        self.assertFalse(coupon.is_valid())
