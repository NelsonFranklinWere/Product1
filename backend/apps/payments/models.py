from django.db import models
from django.utils import timezone
from apps.accounts.models import User


class Transaction(models.Model):
    """
    M-Pesa transactions and payment records
    """
    business = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    conversation = models.ForeignKey(
        'communications.Conversation', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='transactions'
    )
    
    # Transaction details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='KES')
    description = models.TextField(blank=True)
    
    # M-Pesa specific fields
    checkout_request_id = models.CharField(max_length=255, unique=True)
    merchant_request_id = models.CharField(max_length=255, blank=True)
    mpesa_receipt_number = models.CharField(max_length=255, blank=True)
    transaction_date = models.DateTimeField(null=True, blank=True)
    phone_number = models.CharField(max_length=20)
    
    # Transaction status
    status = models.CharField(
        max_length=50,
        choices=[
            ('pending', 'Pending'),
            ('processing', 'Processing'),
            ('success', 'Success'),
            ('failed', 'Failed'),
            ('cancelled', 'Cancelled'),
            ('timeout', 'Timeout'),
        ],
        default='pending'
    )
    
    # M-Pesa response data
    mpesa_confirmation_data = models.JSONField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    
    # Related entities
    product = models.ForeignKey(
        'products.Product', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='transactions'
    )
    customer_name = models.CharField(max_length=255, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'transactions'
        ordering = ['-created_at']

    def __str__(self):
        return f"KES {self.amount} - {self.status} ({self.business.business_name})"

    @property
    def is_expired(self):
        if not self.expires_at:
            return False
        return timezone.now() > self.expires_at

    @property
    def is_successful(self):
        return self.status == 'success'

    @property
    def is_pending(self):
        return self.status in ['pending', 'processing']


class PaymentRequest(models.Model):
    """
    Payment requests initiated from conversations
    """
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='payment_request')
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_requests')
    conversation = models.ForeignKey('communications.Conversation', on_delete=models.CASCADE, related_name='payment_requests')
    
    # Request details
    reason = models.CharField(max_length=255)  # e.g., "Product purchase", "Service payment"
    due_date = models.DateTimeField(null=True, blank=True)
    is_urgent = models.BooleanField(default=False)
    
    # Follow-up
    reminder_sent = models.BooleanField(default=False)
    reminder_count = models.PositiveIntegerField(default=0)
    last_reminder_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payment_requests'

    def __str__(self):
        return f"Payment request for KES {self.transaction.amount} - {self.reason}"


class PaymentMethod(models.Model):
    """
    Supported payment methods for businesses
    """
    business = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_methods')
    method_type = models.CharField(
        max_length=50,
        choices=[
            ('mpesa', 'M-Pesa'),
            ('bank_transfer', 'Bank Transfer'),
            ('cash', 'Cash'),
            ('card', 'Card Payment'),
        ]
    )
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    
    # M-Pesa specific
    mpesa_shortcode = models.CharField(max_length=20, blank=True)
    mpesa_passkey = models.CharField(max_length=255, blank=True)
    
    # Bank transfer specific
    bank_name = models.CharField(max_length=100, blank=True)
    account_name = models.CharField(max_length=255, blank=True)
    account_number = models.CharField(max_length=50, blank=True)
    
    # Configuration
    config = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payment_methods'
        unique_together = ['business', 'method_type']

    def __str__(self):
        return f"{self.method_type} - {self.business.business_name}"


class PaymentReceipt(models.Model):
    """
    Generated payment receipts
    """
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='receipt')
    receipt_number = models.CharField(max_length=100, unique=True)
    receipt_data = models.JSONField(default=dict)  # Store receipt content
    pdf_url = models.URLField(blank=True)
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    sent_to = models.CharField(max_length=255, blank=True)  # Email or phone number
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payment_receipts'

    def __str__(self):
        return f"Receipt {self.receipt_number} - {self.transaction}"


class PaymentWebhook(models.Model):
    """
    Log of payment webhook calls for debugging
    """
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='webhooks')
    webhook_type = models.CharField(max_length=50)  # 'stk_push', 'confirmation', etc.
    payload = models.JSONField()
    headers = models.JSONField(default=dict)
    response_status = models.PositiveIntegerField(null=True, blank=True)
    response_body = models.TextField(blank=True)
    processed = models.BooleanField(default=False)
    error_message = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payment_webhooks'
        ordering = ['-created_at']

    def __str__(self):
        return f"Webhook {self.webhook_type} - {self.transaction.checkout_request_id}"
