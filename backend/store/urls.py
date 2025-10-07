from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views_payment import (
    PaymentMethodViewSet,
    RefundRequestViewSet,
    TransactionViewSet,
    PaymentGatewayView
)

app_name = 'store'

# Create a router for payment methods
payment_router = DefaultRouter()
payment_router.register(r'payment-methods', PaymentMethodViewSet, basename='payment-method')

# Create a router for refund requests
refund_router = DefaultRouter()
refund_router.register(r'refunds', RefundRequestViewSet, basename='refund')

# Create a router for transactions
transaction_router = DefaultRouter()
transaction_router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    # Cart endpoints
    path('cart/', views.CartDetailView.as_view(), name='cart-detail'),
    path('cart/items/', views.CartItemCreateView.as_view(), name='cart-item-list'),
    path('cart/items/<int:pk>/', views.CartItemDetailView.as_view(), name='cart-item-detail'),
    
    # Wishlist endpoints
    path('wishlist/', views.WishlistView.as_view(), name='wishlist'),
    path('wishlist/add/', views.WishlistAddView.as_view(), name='wishlist-add'),
    path('wishlist/<int:pk>/', views.WishlistRemoveView.as_view(), name='wishlist-remove'),
    
    # Order endpoints
    path('orders/', views.OrderListCreateView.as_view(), name='order-list'),
    path('orders/<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
    
    # Coupon endpoints
    path('coupons/apply/', views.CouponApplyView.as_view(), name='coupon-apply'),
    path('coupons/remove/', views.CouponRemoveView.as_view(), name='coupon-remove'),
    
    # Checkout endpoint
    path('checkout/session/', views.checkout_session, name='checkout-session'),
    
    # Payment endpoints
    path('payment/', include([
        # Payment methods
        path('', include(payment_router.urls)),
        
        # Payment gateway
        path('intent/', PaymentGatewayView.as_view(), name='payment-intent'),
        path('create-payment-method/', 
             PaymentGatewayView.as_view(http_method_names=['post']), 
             name='create-payment-method'),

        # Moyasar hosted payment flow
        path('moyasar/create/', views.moyasar_create_payment, name='moyasar-create'),
        path('moyasar/course/<int:course_id>/create/', views.moyasar_create_course_payment, name='moyasar-create-course'),
        path('moyasar/callback/', views.moyasar_callback, name='moyasar-callback'),
        path('moyasar/webhook/', views.moyasar_webhook, name='moyasar-webhook'),
        
        # Transactions
        path('transactions/summary/', 
             TransactionViewSet.as_view({'get': 'summary'}), 
             name='transaction-summary'),
    ])),
    
    # Include the transaction router URLs
    path('', include(transaction_router.urls)),
    
    # Refund endpoints
    path('orders/<int:order_pk>/', include([
        path('refund-request/', 
             RefundRequestViewSet.as_view({'post': 'create'}), 
             name='refund-request'),
    ])),
    
    # Admin refund processing endpoint
    path('refunds/<uuid:pk>/process/', 
         RefundRequestViewSet.as_view({'post': 'process'}), 
         name='process-refund'),
]
