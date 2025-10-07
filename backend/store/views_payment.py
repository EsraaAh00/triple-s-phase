from rest_framework import viewsets, status, mixins, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView

from .serializers_payment import PaymentMethodSerializer
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.utils import timezone

from .models import Order
from .models_payment import PaymentMethod, RefundRequest, Transaction
from .serializers_payment import (
    PaymentMethodSerializer,
    RefundRequestSerializer,
    TransactionSerializer,
    ProcessRefundSerializer,
    PaymentIntentSerializer,
    PaymentMethodCreateSerializer
)

class PaymentMethodViewSet(viewsets.ModelViewSet):
    """
    API endpoints for managing payment methods
    """
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """Set a payment method as default"""
        payment_method = self.get_object()
        payment_method.is_default = True
        payment_method.save()
        return Response({'status': 'default payment method set'})
    
    @action(detail=False, methods=['get'])
    def default(self, request):
        """Get the user's default payment method"""
        default_method = PaymentMethod.objects.filter(
            user=request.user, 
            is_default=True
        ).first()
        
        if not default_method:
            return Response(
                {'detail': 'No default payment method found.'},
                status=status.HTTP_404_NOT_FOUND
            )
            
        serializer = self.get_serializer(default_method)
        return Response(serializer.data)


class RefundRequestViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet
):
    """
    API endpoints for managing refund requests
    """
    serializer_class = RefundRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Regular users can only see their own refund requests
        if not self.request.user.is_staff:
            return RefundRequest.objects.filter(user=self.request.user)
        
        # Staff can see all refund requests with filtering options
        queryset = RefundRequest.objects.all()
        
        # Filter by status if provided
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param.lower())
            
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
            
        return queryset.order_by('-created_at')
    
    def get_permissions(self):
        """
        Only staff users can update refund requests
        """
        if self.action in ['update', 'partial_update', 'process']:
            return [IsAdminUser()]
        return super().get_permissions()
    
    def create(self, request, *args, **kwargs):
        # Get the order ID from the request data
        order_id = request.data.get('order')
        if not order_id:
            return Response(
                {'order': 'This field is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the order and check permissions
        order = get_object_or_404(Order, id=order_id)
        if order.user != request.user:
            return Response(
                {'detail': 'You do not have permission to request a refund for this order.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if a refund request already exists for this order
        if RefundRequest.objects.filter(order=order, user=request.user).exists():
            return Response(
                {'detail': 'A refund request already exists for this order.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate the request data
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create the refund request
        refund_request = serializer.save(
            user=request.user,
            order=order,
            status='pending'
        )
        
        # Send notification to admin
        # send_refund_request_notification(refund_request)
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """Process a refund request (admin only)"""
        refund_request = self.get_object()
        
        # Only pending refund requests can be processed
        if refund_request.status != 'pending':
            return Response(
                {'detail': 'Only pending refund requests can be processed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate the request data
        serializer = ProcessRefundSerializer(
            data=request.data,
            context={'refund_request': refund_request}
        )
        serializer.is_valid(raise_exception=True)
        
        # Process the refund
        amount = serializer.validated_data.get('amount')
        refund_reference = serializer.validated_data.get('refund_reference')
        notify_customer = serializer.validated_data.get('notify_customer', True)
        
        # Here you would typically integrate with your payment gateway
        # For now, we'll simulate a successful refund
        try:
            # Update the refund request status
            refund_request.status = 'approved'
            refund_request.amount_approved = amount or refund_request.amount_requested
            refund_request.admin_notes = f"Refund processed by {request.user.email}"
            
            if refund_reference:
                refund_request.refund_reference = refund_reference
                
            refund_request.save()
            
            # Create a transaction record
            transaction = Transaction.objects.create(
                user=refund_request.user,
                order=refund_request.order,
                refund_request=refund_request,
                transaction_type='refund',
                amount=refund_request.amount_approved,
                currency='USD',  # Get from order or settings
                status='completed',
                notes=f"Refund for order {refund_request.order.order_number}",
                gateway_transaction_id=refund_reference or f"REF-{refund_request.request_id}",
                processed_at=timezone.now()
            )
            
            # Update order status
            refund_request.order.status = 'refunded'
            refund_request.order.save()
            
            # Send notification to customer if requested
            if notify_customer:
                # send_refund_processed_notification(refund_request, transaction)
                pass
            
            return Response({
                'detail': 'Refund processed successfully.',
                'transaction_id': str(transaction.transaction_id)
            })
            
        except Exception as e:
            return Response(
                {'detail': f'Error processing refund: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TransactionViewSet(
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet
):
    """
    API endpoints for viewing transactions
    """
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Regular users can only see their own transactions
        if not self.request.user.is_staff:
            return Transaction.objects.filter(user=self.request.user)
        
        # Staff can see all transactions with filtering options
        queryset = Transaction.objects.all()
        
        # Filter by transaction type if provided
        transaction_type = self.request.query_params.get('type')
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type.lower())
            
        # Filter by status if provided
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param.lower())
            
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
            
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get a summary of the user's transactions"""
        user = request.user
        
        # Get total spent
        total_spent = Transaction.objects.filter(
            user=user,
            transaction_type='purchase',
            status='completed'
        ).aggregate(total_spent=models.Sum('amount'))['total_spent'] or 0
        
        # Get total refunds
        total_refunded = Transaction.objects.filter(
            user=user,
            transaction_type='refund',
            status='completed'
        ).aggregate(total_refunded=models.Sum('amount'))['total_refunded'] or 0
        
        # Get recent transactions
        recent_transactions = self.get_queryset()[:5]
        recent_transactions_data = self.get_serializer(recent_transactions, many=True).data
        
        return Response({
            'total_spent': total_spent,
            'total_refunded': total_refunded,
            'net_spent': total_spent - total_refunded,
            'recent_transactions': recent_transactions_data
        })


class PaymentGatewayView(APIView):
    """
    API endpoints for payment gateway integration
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, format=None):
        """Create a payment intent"""
        return self.create_payment_method(request)
    
    def create_payment_method(self, request):
        """Create a payment method for the user"""
        serializer = PaymentMethodSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        try:
            # Here you would typically create a payment method with your payment gateway
            # For example, with Stripe:
            # payment_method = stripe.PaymentMethod.create(
            #     type='card',
            #     card={
            #         'number': serializer.validated_data['card_number'],
            #         'exp_month': serializer.validated_data['exp_month'],
            #         'exp_year': serializer.validated_data['exp_year'],
            #         'cvc': serializer.validated_data['cvc'],
            #     },
            # )
            # 
            # # Attach the payment method to the customer
            # stripe.PaymentMethod.attach(
            #     payment_method.id,
            #     customer=request.user.stripe_customer_id,
            # )
            # 
            # # Save payment method details to your database
            # payment_method = PaymentMethod.objects.create(
            #     user=request.user,
            #     payment_method_id=payment_method.id,
            #     card_brand=payment_method.card.brand,
            #     last4=payment_method.card.last4,
            #     exp_month=payment_method.card.exp_month,
            #     exp_year=payment_method.card.exp_year,
            #     is_default=not request.user.payment_methods.exists()
            # )
            # 
            # return Response({
            #     'id': payment_method.id,
            #     'card_brand': payment_method.card_brand,
            #     'last4': payment_method.last4,
            #     'exp_month': payment_method.exp_month,
            #     'exp_year': payment_method.exp_year,
            #     'is_default': payment_method.is_default
            # }, status=status.HTTP_201_CREATED)
            
            # For now, return a mock response
            return Response({
                'status': 'success',
                'message': 'Payment method created successfully',
                'data': serializer.validated_data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        #         'client_secret': intent.client_secret,
        #         'payment_intent_id': intent.id,
        #         'status': intent.status
        #     })
        # except Exception as e:
        #     return Response(
        #         {'error': str(e)},
        #         status=status.HTTP_400_BAD_REQUEST
        #     )
        
        # For now, return a mock response
        return Response({
            'client_secret': 'mock_client_secret_123',
            'payment_intent_id': 'pi_mock_123',
            'status': 'requires_payment_method'
        })
    
    def _save_payment_method(self, user, payment_method):
        """Save a payment method for the user"""
        # Extract payment method details
        payment_type = payment_method.type
        card = payment_method.card
        
        # Create or update the payment method
        PaymentMethod.objects.update_or_create(
            user=user,
            payment_gateway_id=payment_method.id,
            defaults={
                'payment_type': payment_type,
                'card_type': card.brand,
                'last_four': card.last4,
                'expiry_month': card.exp_month,
                'expiry_year': card.exp_year,
                'billing_name': payment_method.billing_details.name or '',
                'billing_email': payment_method.billing_details.email or user.email,
                'billing_phone': payment_method.billing_details.phone or '',
                'billing_address': str(payment_method.billing_details.address or {}),
                'is_verified': True
            }
        )
    
    @action(detail=False, methods=['post'])
    def create_payment_method(self, request):
        """Create a payment method"""
        serializer = PaymentMethodCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Here you would typically create a payment method with your payment gateway
        # For example, with Stripe:
        # try:
        #     payment_method = stripe.PaymentMethod.retrieve(
        #         serializer.validated_data['payment_method_id']
        #     )
        #     
        #     # Save the payment method
        #     payment_method_obj = self._save_payment_method(request.user, payment_method)
        #     
        #     # Set as default if requested
        #     if serializer.validated_data.get('is_default'):
        #         payment_method_obj.is_default = True
        #         payment_method_obj.save()
        #     
        #     return Response(
        #         PaymentMethodSerializer(payment_method_obj).data,
        #         status=status.HTTP_201_CREATED
        #     )
        # except Exception as e:
        #     return Response(
        #         {'error': str(e)},
        #         status=status.HTTP_400_BAD_REQUEST
        #     )
        
        # For now, return a mock response
        return Response({
            'id': 'pm_mock_123',
            'payment_type': 'credit_card',
            'card_type': 'visa',
            'last_four': '4242',
            'expiry_month': 12,
            'expiry_year': 2025,
            'is_default': serializer.validated_data.get('is_default', False)
        }, status=status.HTTP_201_CREATED)
