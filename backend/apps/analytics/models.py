from django.db import models
from django.utils import timezone
from apps.accounts.models import User


class UsageLog(models.Model):
    """
    Track usage for billing and analytics
    """
    business = models.ForeignKey(User, on_delete=models.CASCADE, related_name='usage_logs')
    date = models.DateField()
    
    # WhatsApp usage
    whatsapp_business_initiated = models.PositiveIntegerField(default=0)
    whatsapp_user_initiated = models.PositiveIntegerField(default=0)
    whatsapp_template_messages = models.PositiveIntegerField(default=0)
    
    # Facebook usage
    facebook_messages_sent = models.PositiveIntegerField(default=0)
    facebook_messages_received = models.PositiveIntegerField(default=0)
    
    # M-Pesa usage
    mpesa_transaction_count = models.PositiveIntegerField(default=0)
    mpesa_transaction_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    mpesa_successful_transactions = models.PositiveIntegerField(default=0)
    mpesa_failed_transactions = models.PositiveIntegerField(default=0)
    
    # General usage
    conversations_created = models.PositiveIntegerField(default=0)
    messages_sent = models.PositiveIntegerField(default=0)
    messages_received = models.PositiveIntegerField(default=0)
    products_shared = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'usage_logs'
        unique_together = ['business', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.business.business_name} - {self.date}"

    @property
    def total_whatsapp_messages(self):
        return self.whatsapp_business_initiated + self.whatsapp_user_initiated

    @property
    def total_messages(self):
        return self.messages_sent + self.messages_received

    @property
    def mpesa_success_rate(self):
        if self.mpesa_transaction_count == 0:
            return 0
        return (self.mpesa_successful_transactions / self.mpesa_transaction_count) * 100


class BusinessMetrics(models.Model):
    """
    Aggregated business performance metrics
    """
    business = models.ForeignKey(User, on_delete=models.CASCADE, related_name='business_metrics')
    date = models.DateField()
    
    # Customer metrics
    new_customers = models.PositiveIntegerField(default=0)
    active_customers = models.PositiveIntegerField(default=0)
    returning_customers = models.PositiveIntegerField(default=0)
    
    # Engagement metrics
    total_conversations = models.PositiveIntegerField(default=0)
    resolved_conversations = models.PositiveIntegerField(default=0)
    average_response_time = models.DurationField(null=True, blank=True)
    
    # Sales metrics
    total_sales = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    successful_payments = models.PositiveIntegerField(default=0)
    failed_payments = models.PositiveIntegerField(default=0)
    
    # Product metrics
    products_viewed = models.PositiveIntegerField(default=0)
    products_shared = models.PositiveIntegerField(default=0)
    product_inquiries = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'business_metrics'
        unique_together = ['business', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.business.business_name} Metrics - {self.date}"

    @property
    def resolution_rate(self):
        if self.total_conversations == 0:
            return 0
        return (self.resolved_conversations / self.total_conversations) * 100

    @property
    def payment_success_rate(self):
        total_payments = self.successful_payments + self.failed_payments
        if total_payments == 0:
            return 0
        return (self.successful_payments / total_payments) * 100


class SubscriptionUsage(models.Model):
    """
    Track subscription usage against limits
    """
    business = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscription_usage')
    month = models.DateField()  # First day of the month
    
    # Current usage
    whatsapp_messages_used = models.PositiveIntegerField(default=0)
    mpesa_transactions_used = models.PositiveIntegerField(default=0)
    storage_used_mb = models.PositiveIntegerField(default=0)
    
    # Limits (based on subscription tier)
    whatsapp_messages_limit = models.PositiveIntegerField(default=0)
    mpesa_transactions_limit = models.PositiveIntegerField(default=0)
    storage_limit_mb = models.PositiveIntegerField(default=0)
    
    # Billing
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    actual_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'subscription_usage'
        unique_together = ['business', 'month']
        ordering = ['-month']

    def __str__(self):
        return f"{self.business.business_name} - {self.month.strftime('%Y-%m')}"

    @property
    def whatsapp_usage_percentage(self):
        if self.whatsapp_messages_limit == 0:
            return 0
        return (self.whatsapp_messages_used / self.whatsapp_messages_limit) * 100

    @property
    def mpesa_usage_percentage(self):
        if self.mpesa_transactions_limit == 0:
            return 0
        return (self.mpesa_transactions_used / self.mpesa_transactions_limit) * 100

    @property
    def is_over_limit(self):
        return (
            self.whatsapp_messages_used > self.whatsapp_messages_limit or
            self.mpesa_transactions_used > self.mpesa_transactions_limit or
            self.storage_used_mb > self.storage_limit_mb
        )


class APICallLog(models.Model):
    """
    Log API calls for monitoring and debugging
    """
    business = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_call_logs', null=True, blank=True)
    service = models.CharField(
        max_length=50,
        choices=[
            ('facebook', 'Facebook'),
            ('whatsapp', 'WhatsApp'),
            ('mpesa', 'M-Pesa'),
        ]
    )
    endpoint = models.CharField(max_length=255)
    method = models.CharField(max_length=10)
    status_code = models.PositiveIntegerField()
    response_time_ms = models.PositiveIntegerField()
    request_size_bytes = models.PositiveIntegerField(default=0)
    response_size_bytes = models.PositiveIntegerField(default=0)
    error_message = models.TextField(blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_call_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.service} {self.method} {self.endpoint} - {self.status_code}"

    @property
    def is_successful(self):
        return 200 <= self.status_code < 300

    @property
    def is_error(self):
        return self.status_code >= 400
