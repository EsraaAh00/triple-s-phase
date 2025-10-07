"""
Signals for the store app.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.apps import apps

def get_model(model_name):
    """Helper function to get models without circular imports"""
    return apps.get_model('store', model_name)

@receiver(post_save)
def update_order_totals(sender, **kwargs):
    """
    Update order totals when an order is saved.
    """
    if sender.__name__ == 'Order' and not kwargs.get('created'):
        instance = kwargs['instance']
        instance.update_totals()

@receiver(post_save)
def update_order_on_item_save(sender, **kwargs):
    """
    Update order totals when an order item is saved.
    """
    if sender.__name__ == 'OrderItem':
        instance = kwargs['instance']
        instance.order.update_totals()

@receiver(post_delete)
def update_order_on_item_delete(sender, **kwargs):
    """
    Update order totals when an order item is deleted.
    """
    if sender.__name__ == 'OrderItem':
        instance = kwargs['instance']
        instance.order.update_totals()

@receiver(post_save)
def set_default_payment_method(sender, **kwargs):
    """
    Ensure only one default payment method per user.
    """
    if sender.__name__ == 'PaymentMethod':
        instance = kwargs['instance']
        if instance.is_default:
            PaymentMethod = get_model('PaymentMethod')
            PaymentMethod.objects.filter(
                user=instance.user, 
                is_default=True
            ).exclude(id=instance.id).update(is_default=False)
