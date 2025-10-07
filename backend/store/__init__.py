default_app_config = 'store.apps.StoreConfig'

# Use lazy imports to avoid circular imports
import importlib
from django.utils.module_loading import import_string

def __getattr__(name):
    """
    Lazily import and return the requested attribute.
    This helps prevent circular imports.
    """
    model_imports = {
        # Models from models.py
        'Coupon': '.models.Coupon',
        'Cart': '.models.Cart',
        'CartItem': '.models.CartItem',
        'Wishlist': '.models.Wishlist',
        'Order': '.models.Order',
        'OrderItem': '.models.OrderItem',
        # Models from models_payment.py
        'PaymentMethod': '.models_payment.PaymentMethod',
        'RefundRequest': '.models_payment.RefundRequest',
        'Transaction': '.models_payment.Transaction',
    }
    
    if name in model_imports:
        module_path = 'store' + model_imports[name]
        return import_string(module_path)
    
    # Try to import from signals if not found in models
    if name in ['signals']:
        return importlib.import_module(f'store.{name}')
    
    raise AttributeError(f"module 'store' has no attribute '{name}'")

# Import signals at the end to avoid circular imports
# This is safe because we're not importing any models directly
import store.signals  # noqa

# Define __all__ for documentation and IDE support
__all__ = [
    # Models
    'Coupon', 'Cart', 'CartItem', 'Wishlist', 'Order', 'OrderItem',
    'PaymentMethod', 'RefundRequest', 'Transaction',
]
