from django.urls import reverse
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from ...courses.models import Course
from ..models import Cart, CartItem, Wishlist, Order, Coupon

User = get_user_model()


def create_user(**params):
    return User.objects.create_user(**params)


def create_course(**params):
    return Course.objects.create(**params)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class CartAPITests(APITestCase):
    def setUp(self):
        self.user = create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.teacher = create_user(
            username='teacher',
            email='teacher@example.com',
            password='testpass123',
            is_teacher=True
        )
        self.course = create_course(
            title='Test Course',
            description='Test Description',
            price=99.99,
            teacher=self.teacher
        )
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {get_tokens_for_user(self.user)["access"]}')
    
    def test_retrieve_cart(self):
        url = reverse('cart-detail')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['items_count'], 0)
    
    def test_add_item_to_cart(self):
        url = reverse('cart-item-list')
        data = {'course': self.course.id}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CartItem.objects.count(), 1)
        self.assertEqual(CartItem.objects.get().course, self.course)
    
    def test_remove_item_from_cart(self):
        cart = Cart.objects.create(user=self.user)
        cart_item = CartItem.objects.create(cart=cart, course=self.course, price=self.course.price)
        url = reverse('cart-item-detail', kwargs={'pk': cart_item.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(CartItem.objects.count(), 0)


class WishlistAPITests(APITestCase):
    def setUp(self):
        self.user = create_user(
            username='wishlistuser',
            email='wishlist@example.com',
            password='testpass123'
        )
        self.teacher = create_user(
            username='teacher2',
            email='teacher2@example.com',
            password='testpass123',
            is_teacher=True
        )
        self.course = create_course(
            title='Wishlist Course',
            description='Wishlist Description',
            price=49.99,
            teacher=self.teacher
        )
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {get_tokens_for_user(self.user)["access"]}')
    
    def test_add_to_wishlist(self):
        url = reverse('wishlist')
        data = {'course': self.course.id}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Wishlist.objects.get(user=self.user).courses.count(), 1)
    
    def test_remove_from_wishlist(self):
        wishlist = Wishlist.objects.create(user=self.user)
        wishlist.courses.add(self.course)
        url = reverse('wishlist-detail', kwargs={'pk': self.course.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Wishlist.objects.get(user=self.user).courses.count(), 0)


class OrderAPITests(APITestCase):
    def setUp(self):
        self.user = create_user(
            username='orderuser',
            email='order@example.com',
            password='testpass123'
        )
        self.teacher = create_user(
            username='teacher3',
            email='teacher3@example.com',
            password='testpass123',
            is_teacher=True
        )
        self.course = create_course(
            title='Order Course',
            description='Order Description',
            price=29.99,
            teacher=self.teacher
        )
        self.cart = Cart.objects.create(user=self.user)
        self.cart_item = CartItem.objects.create(
            cart=self.cart,
            course=self.course,
            price=self.course.price
        )
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {get_tokens_for_user(self.user)["access"]}')
    
    def test_create_order(self):
        url = reverse('order-list')
        data = {
            'payment_method': 'credit_card',
            'billing_email': 'test@example.com',
            'billing_name': 'Test User',
            'billing_address': '123 Test St',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(OrderItem.objects.count(), 1)
        self.assertEqual(CartItem.objects.count(), 0)
    
    def test_retrieve_order(self):
        order = Order.objects.create(
            user=self.user,
            order_number='TEST123',
            status='completed',
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
            price=self.course.price
        )
        url = reverse('order-detail', kwargs={'pk': order.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['order_number'], 'TEST123')


class CouponAPITests(APITestCase):
    def setUp(self):
        self.user = create_user(
            username='couponuser',
            email='coupon@example.com',
            password='testpass123'
        )
        self.coupon = Coupon.objects.create(
            code='TEST20',
            valid_from='2023-01-01T00:00:00Z',
            valid_to='2024-12-31T23:59:59Z',
            discount=20.00,
            active=True
        )
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {get_tokens_for_user(self.user)["access"]}')
    
    def test_apply_coupon(self):
        url = reverse('coupon-apply')
        data = {'code': 'TEST20'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['detail'], 'Coupon applied successfully')
    
    def test_remove_coupon(self):
        # First apply the coupon
        cart = Cart.objects.create(user=self.user, coupon=self.coupon)
        url = reverse('coupon-remove')
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['detail'], 'Coupon removed successfully')
        cart.refresh_from_db()
        self.assertIsNone(cart.coupon)
