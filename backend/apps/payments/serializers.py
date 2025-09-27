from rest_framework import serializers
from .models import Transaction, PaymentRequest, PaymentMethod, PaymentReceipt


class TransactionSerializer(serializers.ModelSerializer):
    """
    Serializer for Transaction model
    """
    class Meta:
        model = Transaction
        fields = [
            'id', 'amount', 'currency', 'description', 'checkout_request_id',
            'merchant_request_id', 'mpesa_receipt_number', 'transaction_date',
            'phone_number', 'status', 'error_message', 'customer_name',
            'created_at', 'updated_at', 'expires_at', 'is_expired', 'is_successful'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'is_expired', 'is_successful'
        ]


class PaymentRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for PaymentRequest model
    """
    transaction = TransactionSerializer(read_only=True)
    
    class Meta:
        model = PaymentRequest
        fields = [
            'id', 'transaction', 'reason', 'due_date', 'is_urgent',
            'reminder_sent', 'reminder_count', 'last_reminder_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'reminder_sent', 'reminder_count', 'last_reminder_at',
            'created_at', 'updated_at'
        ]


class PaymentMethodSerializer(serializers.ModelSerializer):
    """
    Serializer for PaymentMethod model
    """
    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'method_type', 'is_active', 'is_default',
            'mpesa_shortcode', 'mpesa_passkey', 'bank_name',
            'account_name', 'account_number', 'config',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PaymentReceiptSerializer(serializers.ModelSerializer):
    """
    Serializer for PaymentReceipt model
    """
    transaction = TransactionSerializer(read_only=True)
    
    class Meta:
        model = PaymentReceipt
        fields = [
            'id', 'transaction', 'receipt_number', 'receipt_data',
            'pdf_url', 'is_sent', 'sent_at', 'sent_to', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class STKPushSerializer(serializers.Serializer):
    """
    Serializer for STK Push initiation
    """
    phone_number = serializers.CharField(max_length=20)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    account_reference = serializers.CharField(max_length=100, required=False)
    transaction_desc = serializers.CharField(max_length=100, default='Payment')
    conversation_id = serializers.IntegerField(required=False)
    product_id = serializers.IntegerField(required=False)


class STKPushStatusSerializer(serializers.Serializer):
    """
    Serializer for STK Push status query
    """
    checkout_request_id = serializers.CharField(max_length=255, required=False)
    transaction_id = serializers.IntegerField(required=False)


class PaymentRequestFromConversationSerializer(serializers.Serializer):
    """
    Serializer for payment request from conversation
    """
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    reason = serializers.CharField(max_length=255, default='Payment request')
    product_id = serializers.IntegerField(required=False)
