from rest_framework import serializers
from django.utils import timezone
from django.core.validators import MinValueValidator
from decimal import Decimal

from .models import Order
from .models_payment import PaymentMethod, RefundRequest, Transaction


class PaymentMethodSerializer(serializers.ModelSerializer):
    """Serializer for payment methods"""
    is_default = serializers.BooleanField(required=False)
    masked_number = serializers.SerializerMethodField()
    expiry_date = serializers.SerializerMethodField()
    
    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'payment_type', 'is_default', 'card_type', 'last_four',
            'expiry_month', 'expiry_year', 'masked_number', 'expiry_date',
            'billing_name', 'billing_email', 'billing_phone', 'billing_address',
            'is_verified', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'masked_number', 'expiry_date', 'is_verified',
            'created_at', 'updated_at'
        ]
    
    def get_masked_number(self, obj):
        return obj.mask_card_number()
    
    def get_expiry_date(self, obj):
        return obj.expiry_date()
    
    def validate(self, data):
        # Validate credit card details if payment type is credit/debit card
        if data.get('payment_type') in ['credit_card', 'debit_card']:
            required_fields = ['card_type', 'last_four', 'expiry_month', 'expiry_year']
            for field in required_fields:
                if field not in data:
                    raise serializers.ValidationError(
                        {field: f"This field is required for credit/debit cards."}
                    )
            
            # Validate expiry date
            if 'expiry_month' in data and 'expiry_year' in data:
                now = timezone.now()
                expiry_year = int(data['expiry_year'])
                expiry_month = int(data['expiry_month'])
                
                # Convert 2-digit year to 4-digit
                if expiry_year < 100:
                    expiry_year += 2000
                
                if expiry_year < now.year or (expiry_year == now.year and expiry_month < now.month):
                    raise serializers.ValidationError("Card has expired.")
        
        return data
    
    def create(self, validated_data):
        # Set the user from the request
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class RefundRequestSerializer(serializers.ModelSerializer):
    """Serializer for refund requests"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    order_total = serializers.DecimalField(
        source='order.total', 
        max_digits=10, 
        decimal_places=2,
        read_only=True
    )
    can_request_refund = serializers.SerializerMethodField()
    
    class Meta:
        model = RefundRequest
        fields = [
            'id', 'request_id', 'order', 'order_number', 'order_total',
            'status', 'status_display', 'reason', 'reason_display',
            'reason_details', 'amount_requested', 'amount_approved',
            'admin_notes', 'refunded_at', 'refund_reference',
            'can_request_refund', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'request_id', 'status', 'admin_notes', 'refunded_at',
            'refund_reference', 'created_at', 'updated_at', 'user'
        ]
    
    def get_can_request_refund(self, obj):
        # If this is an existing instance, check if it can be modified
        if hasattr(obj, 'id') and obj.id:
            return obj.status == 'pending'
        
        # For new instances, check if a refund can be requested
        order = obj.order if hasattr(obj, 'order') else None
        if not order:
            return False
            
        # Check if the order is eligible for a refund
        if order.status != 'completed':
            return False
            
        # Check if it's within the refund window (e.g., 30 days)
        days_since_purchase = (timezone.now() - order.created_at).days
        return days_since_purchase <= 30
    
    def validate(self, data):
        # For new refund requests
        if not self.instance:
            order = data.get('order')
            user = self.context['request'].user
            
            # Check if the order belongs to the user
            if order.user != user:
                raise serializers.ValidationError("You can only request refunds for your own orders.")
            
            # Check if the order is eligible for a refund
            if order.status != 'completed':
                raise serializers.ValidationError("Only completed orders can be refunded.")
            
            # Check if a refund request already exists for this order
            if RefundRequest.objects.filter(order=order, user=user).exists():
                raise serializers.ValidationError(
                    "A refund request already exists for this order."
                )
            
            # Validate amount_requested
            amount_requested = data.get('amount_requested', Decimal('0.00'))
            if amount_requested <= 0:
                raise serializers.ValidationError({
                    'amount_requested': 'Amount must be greater than zero.'
                })
            
            if amount_requested > order.total:
                raise serializers.ValidationError({
                    'amount_requested': 'Amount cannot exceed the order total.'
                })
        
        return data
    
    def create(self, validated_data):
        # Set the user from the request
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for transactions"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    payment_method_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_id', 'transaction_type', 'type_display',
            'order', 'order_number', 'refund_request', 'amount', 'currency',
            'status', 'status_display', 'payment_method', 'payment_method_display',
            'gateway_transaction_id', 'notes', 'processed_at', 'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id', 'transaction_id', 'status', 'gateway_transaction_id',
            'processed_at', 'created_at', 'updated_at', 'user'
        ]
    
    def get_payment_method_display(self, obj):
        if obj.payment_method:
            return str(obj.payment_method)
        return None
    
    def validate(self, data):
        # For refund transactions, ensure a refund request is provided
        if data.get('transaction_type') == 'refund' and not data.get('refund_request'):
            raise serializers.ValidationError({
                'refund_request': 'This field is required for refund transactions.'
            })
        
        # For purchase transactions, ensure an order is provided
        if data.get('transaction_type') == 'purchase' and not data.get('order'):
            raise serializers.ValidationError({
                'order': 'This field is required for purchase transactions.'
            })
        
        return data
    
    def create(self, validated_data):
        # Set the user from the request
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ProcessRefundSerializer(serializers.Serializer):
    """Serializer for processing refunds"""
    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    refund_reference = serializers.CharField(max_length=100, required=False)
    notify_customer = serializers.BooleanField(default=True)
    
    def validate(self, data):
        refund_request = self.context.get('refund_request')
        
        # Validate amount if provided
        if 'amount' in data:
            amount = data['amount']
            max_amount = refund_request.amount_approved or refund_request.amount_requested
            
            if amount > max_amount:
                raise serializers.ValidationError({
                    'amount': f'Amount cannot exceed {max_amount}.'
                })
        
        return data


class PaymentIntentSerializer(serializers.Serializer):
    """Serializer for creating a payment intent"""
    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    currency = serializers.CharField(max_length=3, default='USD')
    payment_method_id = serializers.CharField(required=False)
    save_payment_method = serializers.BooleanField(default=False)
    metadata = serializers.DictField(required=False)


class PaymentMethodCreateSerializer(serializers.Serializer):
    """Serializer for creating a payment method"""
    payment_method_id = serializers.CharField()
    is_default = serializers.BooleanField(default=False)
    billing_details = serializers.DictField(required=False)
