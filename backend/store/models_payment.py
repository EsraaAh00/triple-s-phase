from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import uuid

from .models import Order

class PaymentMethod(models.Model):
    """
    Payment methods saved by users for future purchases
    """
    PAYMENT_TYPES = [
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('paypal', 'PayPal'),
        ('bank_transfer', 'Bank Transfer'),
    ]
    
    CARD_TYPES = [
        ('visa', 'Visa'),
        ('mastercard', 'MasterCard'),
        ('amex', 'American Express'),
        ('discover', 'Discover'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payment_methods'
    )
    payment_type = models.CharField(
        max_length=20,
        choices=PAYMENT_TYPES,
        default='credit_card'
    )
    is_default = models.BooleanField(default=False)
    card_type = models.CharField(
        max_length=20,
        choices=CARD_TYPES,
        blank=True,
        null=True
    )
    last_four = models.CharField(max_length=4, blank=True, null=True)
    expiry_month = models.PositiveSmallIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(12)
        ],
        blank=True,
        null=True
    )
    expiry_year = models.PositiveSmallIntegerField(blank=True, null=True)
    billing_name = models.CharField(max_length=100, blank=True)
    billing_email = models.EmailField(blank=True)
    billing_phone = models.CharField(max_length=20, blank=True)
    billing_address = models.TextField(blank=True)
    payment_gateway_id = models.CharField(max_length=100, blank=True)  # ID from payment gateway
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_default', '-created_at']
        verbose_name = 'Payment Method'
        verbose_name_plural = 'Payment Methods'
    
    def __str__(self):
        if self.payment_type == 'credit_card' and self.card_type and self.last_four:
            return f"{self.get_card_type_display()} ending in {self.last_four}"
        return f"{self.get_payment_type_display()} - {self.id}"
    
    def save(self, *args, **kwargs):
        # Ensure only one default payment method per user
        if self.is_default:
            PaymentMethod.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)
    
    def mask_card_number(self):
        """Return a masked version of the card number for display"""
        if self.payment_type in ['credit_card', 'debit_card'] and self.last_four:
            return f"•••• •••• •••• {self.last_four}"
        return ""
    
    def expiry_date(self):
        """Return formatted expiry date"""
        if self.expiry_month and self.expiry_year:
            return f"{self.expiry_month:02d}/{self.expiry_year % 100:02d}"
        return ""


class RefundRequest(models.Model):
    """
    Model for handling refund requests
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('processed', 'Processed'),
    ]
    
    REFUND_REASONS = [
        ('not_satisfied', 'Not satisfied with the product'),
        ('not_as_described', 'Product not as described'),
        ('technical_issues', 'Technical issues'),
        ('duplicate_purchase', 'Duplicate purchase'),
        ('other', 'Other'),
    ]
    
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='refund_requests'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='refund_requests'
    )
    request_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    reason = models.CharField(
        max_length=50,
        choices=REFUND_REASONS,
        default='other'
    )
    reason_details = models.TextField(blank=True)
    amount_requested = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    amount_approved = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    admin_notes = models.TextField(blank=True)
    refunded_at = models.DateTimeField(null=True, blank=True)
    refund_reference = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Refund Request'
        verbose_name_plural = 'Refund Requests'
    
    def __str__(self):
        return f"Refund {self.request_id} - {self.get_status_display()}"
    
    def save(self, *args, **kwargs):
        # Set refunded_at timestamp when status changes to processed
        if self.status == 'processed' and not self.refunded_at:
            self.refunded_at = timezone.now()
        super().save(*args, **kwargs)
    
    def can_be_requested(self):
        """Check if a refund can be requested for this order"""
        # Add your business logic here
        # For example, only allow refunds within 30 days of purchase
        days_since_purchase = (timezone.now() - self.order.created_at).days
        return days_since_purchase <= 30 and self.order.status == 'completed'
    
    def process_refund(self, amount=None, reference=''):
        """Process the refund through the payment gateway"""
        if self.status != 'approved':
            return False, "Refund must be approved before processing"
        
        if amount is None:
            amount = self.amount_approved or self.amount_requested
        
        # Here you would integrate with your payment gateway
        # This is a placeholder for the actual implementation
        try:
            # Call payment gateway API to process refund
            # refund_response = payment_gateway.refund(
            #     order_id=self.order.payment_id,
            #     amount=amount,
            #     reference=reference or f"REFUND-{self.request_id}"
            # )
            
            # For now, we'll simulate a successful refund
            self.status = 'processed'
            self.amount_approved = amount
            self.refund_reference = reference or f"REF-{self.request_id}"
            self.save()
            
            # Update order status
            self.order.status = 'refunded'
            self.order.save(update_fields=['status'])
            
            # Send notification to user
            # send_refund_processed_email(self)
            
            return True, "Refund processed successfully"
        except Exception as e:
            return False, f"Error processing refund: {str(e)}"


class Transaction(models.Model):
    """
    Model for tracking all financial transactions
    """
    TRANSACTION_TYPES = [
        ('purchase', 'Purchase'),
        ('refund', 'Refund'),
        ('withdrawal', 'Instructor Withdrawal'),
        ('payout', 'Instructor Payout'),
        ('adjustment', 'Manual Adjustment'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    transaction_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='transactions'
    )
    order = models.ForeignKey(
        Order,
        on_delete=models.PROTECT,
        related_name='transactions',
        null=True,
        blank=True
    )
    refund_request = models.OneToOneField(
        RefundRequest,
        on_delete=models.SET_NULL,
        related_name='transaction',
        null=True,
        blank=True
    )
    transaction_type = models.CharField(
        max_length=20,
        choices=TRANSACTION_TYPES
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    currency = models.CharField(
        max_length=3,
        default='USD'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    payment_method = models.ForeignKey(
        PaymentMethod,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions'
    )
    gateway_transaction_id = models.CharField(
        max_length=100,
        blank=True
    )
    gateway_response = models.JSONField(
        null=True,
        blank=True
    )
    notes = models.TextField(blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['transaction_id']),
            models.Index(fields=['user', 'transaction_type']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_transaction_type_display()} - {self.amount} {self.currency} - {self.get_status_display()}"
    
    def save(self, *args, **kwargs):
        # Set processed_at timestamp when status changes to completed
        if self.status == 'completed' and not self.processed_at:
            self.processed_at = timezone.now()
        super().save(*args, **kwargs)
    
    def mark_as_completed(self, gateway_transaction_id='', gateway_response=None):
        """Mark the transaction as completed"""
        self.status = 'completed'
        self.gateway_transaction_id = gateway_transaction_id or self.gateway_transaction_id
        if gateway_response is not None:
            self.gateway_response = gateway_response
        self.save()
        
        # Trigger any post-completion actions
        self._post_completion_actions()
    
    def _post_completion_actions(self):
        """Perform any necessary actions after a transaction is completed"""
        if self.transaction_type == 'purchase' and self.order:
            # Mark order as completed if all items are paid
            self.order.status = 'completed'
            self.order.save(update_fields=['status'])
            
            # Enroll user in courses
            for item in self.order.items.all():
                # Enroll user in the course
                # This assumes you have an enrollment model
                # Enrollment.objects.get_or_create(
                #     user=self.user,
                #     course=item.course,
                #     order_item=item
                # )
                pass
        
        elif self.transaction_type == 'refund' and self.refund_request:
            # Update refund request status
            self.refund_request.status = 'processed'
            self.refund_request.save()
            
            # Unenroll user from courses if needed
            # Add your logic here
            pass
        
        # Send notifications, update analytics, etc.
        # send_transaction_notification(self)
