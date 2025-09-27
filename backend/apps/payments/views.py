import logging
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Transaction, PaymentRequest, PaymentMethod, PaymentReceipt
from .serializers import (
    TransactionSerializer, PaymentRequestSerializer, 
    PaymentMethodSerializer, PaymentReceiptSerializer
)
from .mpesa_service import MpesaService
from apps.communications.models import Conversation
from apps.products.models import Product

logger = logging.getLogger(__name__)


class TransactionListView(generics.ListCreateAPIView):
    """
    List and create transactions
    """
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Transaction.objects.filter(business=self.request.user)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(business=self.request.user)


class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a transaction
    """
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Transaction.objects.filter(business=self.request.user)


class TransactionStatusView(generics.RetrieveAPIView):
    """
    Get transaction status
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        try:
            transaction = get_object_or_404(
                Transaction,
                id=kwargs.get('pk'),
                business=request.user
            )
            
            # Query M-Pesa for latest status if transaction is pending
            if transaction.status in ['pending', 'processing']:
                mpesa_service = MpesaService()
                mpesa_service.query_stk_push_status(
                    transaction.checkout_request_id,
                    request.user
                )
                transaction.refresh_from_db()
            
            serializer = TransactionSerializer(transaction)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error getting transaction status: {e}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PaymentRequestListView(generics.ListCreateAPIView):
    """
    List and create payment requests
    """
    serializer_class = PaymentRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PaymentRequest.objects.filter(
            requested_by=self.request.user
        ).select_related('transaction', 'conversation').order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)


class PaymentRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a payment request
    """
    serializer_class = PaymentRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PaymentRequest.objects.filter(requested_by=self.request.user)


class InitiateSTKPushView(generics.CreateAPIView):
    """
    Initiate M-Pesa STK Push payment
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        try:
            phone_number = request.data.get('phone_number')
            amount = request.data.get('amount')
            account_reference = request.data.get('account_reference', '')
            transaction_desc = request.data.get('transaction_desc', 'Payment')
            conversation_id = request.data.get('conversation_id')
            product_id = request.data.get('product_id')
            
            if not phone_number or not amount:
                return Response(
                    {'error': 'Phone number and amount are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate amount
            try:
                amount = float(amount)
                if amount <= 0:
                    raise ValueError("Amount must be positive")
            except (ValueError, TypeError):
                return Response(
                    {'error': 'Invalid amount'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get conversation if provided
            conversation = None
            if conversation_id:
                conversation = get_object_or_404(
                    Conversation,
                    id=conversation_id,
                    business=request.user
                )
            
            # Get product if provided
            product = None
            if product_id:
                product = get_object_or_404(
                    Product,
                    id=product_id,
                    business=request.user
                )
            
            # Initiate STK Push
            mpesa_service = MpesaService()
            result = mpesa_service.initiate_stk_push(
                phone_number=phone_number,
                amount=amount,
                account_reference=account_reference or f"PAY-{request.user.id}",
                transaction_desc=transaction_desc,
                business_user=request.user
            )
            
            if result['success']:
                # Get the created transaction
                transaction = Transaction.objects.get(
                    checkout_request_id=result['checkout_request_id'],
                    business=request.user
                )
                
                # Link to conversation and product if provided
                if conversation:
                    transaction.conversation = conversation
                if product:
                    transaction.product = product
                transaction.save()
                
                # Create payment request if conversation is provided
                if conversation:
                    PaymentRequest.objects.create(
                        transaction=transaction,
                        requested_by=request.user,
                        conversation=conversation,
                        reason=transaction_desc
                    )
                
                serializer = TransactionSerializer(transaction)
                return Response({
                    'success': True,
                    'transaction': serializer.data,
                    'checkout_request_id': result['checkout_request_id'],
                    'customer_message': result['customer_message']
                })
            else:
                return Response(
                    {'error': result['error']}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            logger.error(f"Error initiating STK Push: {e}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class QuerySTKPushStatusView(generics.CreateAPIView):
    """
    Query M-Pesa STK Push status
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        try:
            checkout_request_id = request.data.get('checkout_request_id')
            transaction_id = request.data.get('transaction_id')
            
            if not checkout_request_id and not transaction_id:
                return Response(
                    {'error': 'Either checkout_request_id or transaction_id is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get transaction
            if transaction_id:
                transaction = get_object_or_404(
                    Transaction,
                    id=transaction_id,
                    business=request.user
                )
                checkout_request_id = transaction.checkout_request_id
            else:
                transaction = get_object_or_404(
                    Transaction,
                    checkout_request_id=checkout_request_id,
                    business=request.user
                )
            
            # Query status from M-Pesa
            mpesa_service = MpesaService()
            result = mpesa_service.query_stk_push_status(
                checkout_request_id,
                request.user
            )
            
            # Refresh transaction from database
            transaction.refresh_from_db()
            serializer = TransactionSerializer(transaction)
            
            return Response({
                'success': True,
                'transaction': serializer.data,
                'mpesa_response': result
            })
            
        except Exception as e:
            logger.error(f"Error querying STK Push status: {e}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PaymentMethodListView(generics.ListCreateAPIView):
    """
    List and create payment methods
    """
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PaymentMethod.objects.filter(business=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(business=self.request.user)


class PaymentMethodDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a payment method
    """
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PaymentMethod.objects.filter(business=self.request.user)


class PaymentReceiptView(generics.RetrieveAPIView):
    """
    Get payment receipt
    """
    serializer_class = PaymentReceiptSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PaymentReceipt.objects.filter(transaction__business=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_payment_from_conversation(request, conversation_id):
    """
    Request payment from a conversation
    """
    try:
        amount = request.data.get('amount')
        reason = request.data.get('reason', 'Payment request')
        product_id = request.data.get('product_id')
        
        if not amount:
            return Response(
                {'error': 'Amount is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get conversation
        conversation = get_object_or_404(
            Conversation,
            id=conversation_id,
            business=request.user
        )
        
        # Get contact phone number
        phone_number = conversation.contact.phone_number
        if not phone_number:
            return Response(
                {'error': 'Contact phone number not available'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get product if provided
        product = None
        if product_id:
            product = get_object_or_404(
                Product,
                id=product_id,
                business=request.user
            )
        
        # Initiate STK Push
        mpesa_service = MpesaService()
        result = mpesa_service.initiate_stk_push(
            phone_number=phone_number,
            amount=float(amount),
            account_reference=f"CONV-{conversation_id}",
            transaction_desc=reason,
            business_user=request.user
        )
        
        if result['success']:
            # Get the created transaction
            transaction = Transaction.objects.get(
                checkout_request_id=result['checkout_request_id'],
                business=request.user
            )
            
            # Link to conversation and product
            transaction.conversation = conversation
            if product:
                transaction.product = product
            transaction.save()
            
            # Create payment request
            payment_request = PaymentRequest.objects.create(
                transaction=transaction,
                requested_by=request.user,
                conversation=conversation,
                reason=reason
            )
            
            # Send notification message to customer
            if conversation.source_platform == 'whatsapp':
                from apps.communications.whatsapp_service import WhatsAppBusinessService
                service = WhatsAppBusinessService()
                message = f"💰 Payment Request\n\nAmount: KES {amount}\nReason: {reason}\n\nPlease complete the payment on your phone."
                service.send_text_message(phone_number, message, request.user)
            elif conversation.source_platform == 'facebook':
                from apps.communications.facebook_service import FacebookMessengerService
                service = FacebookMessengerService()
                message = f"💰 Payment Request\n\nAmount: KES {amount}\nReason: {reason}\n\nPlease complete the payment on your phone."
                service.send_message(conversation.contact.facebook_id, message, request.user)
            
            return Response({
                'success': True,
                'transaction_id': transaction.id,
                'checkout_request_id': result['checkout_request_id'],
                'customer_message': result['customer_message']
            })
        else:
            return Response(
                {'error': result['error']}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        logger.error(f"Error requesting payment from conversation: {e}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
