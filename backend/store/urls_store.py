from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views_store as views

app_name = 'store'

# Create a router for store endpoints
router = DefaultRouter()
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'course-products', views.CourseProductViewSet, basename='course-product')

# Store URL patterns
urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Cart endpoints
    path('cart/', views.CartView.as_view(), name='cart'),
    path('cart/items/<int:pk>/', views.CartItemDeleteView.as_view(), name='cart-item-delete'),
    
    # Checkout and orders
    path('checkout/', views.CheckoutView.as_view(), name='checkout'),
    path('orders/', views.OrderListView.as_view(), name='order-list'),
    path('orders/<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
    
    # Coupons
    path('coupons/validate/', views.CouponValidateView.as_view(), name='coupon-validate'),
    
    # Products
    path('featured/', views.FeaturedProductsView.as_view(), name='featured-products'),
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    
    # Search
    path('search/', views.ProductSearchView.as_view(), name='product-search'),
]
