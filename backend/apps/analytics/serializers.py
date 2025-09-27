from rest_framework import serializers
from .models import UsageLog, BusinessMetrics, SubscriptionUsage, APICallLog


class UsageLogSerializer(serializers.ModelSerializer):
    """
    Serializer for UsageLog model
    """
    total_whatsapp_messages = serializers.ReadOnlyField()
    total_messages = serializers.ReadOnlyField()
    mpesa_success_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = UsageLog
        fields = [
            'id', 'date', 'whatsapp_business_initiated', 'whatsapp_user_initiated',
            'whatsapp_template_messages', 'facebook_messages_sent', 'facebook_messages_received',
            'mpesa_transaction_count', 'mpesa_transaction_value', 'mpesa_successful_transactions',
            'mpesa_failed_transactions', 'conversations_created', 'messages_sent',
            'messages_received', 'products_shared', 'total_whatsapp_messages',
            'total_messages', 'mpesa_success_rate', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BusinessMetricsSerializer(serializers.ModelSerializer):
    """
    Serializer for BusinessMetrics model
    """
    resolution_rate = serializers.ReadOnlyField()
    payment_success_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = BusinessMetrics
        fields = [
            'id', 'date', 'new_customers', 'active_customers', 'returning_customers',
            'total_conversations', 'resolved_conversations', 'average_response_time',
            'total_sales', 'successful_payments', 'failed_payments', 'products_viewed',
            'products_shared', 'product_inquiries', 'resolution_rate', 'payment_success_rate',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SubscriptionUsageSerializer(serializers.ModelSerializer):
    """
    Serializer for SubscriptionUsage model
    """
    whatsapp_usage_percentage = serializers.ReadOnlyField()
    mpesa_usage_percentage = serializers.ReadOnlyField()
    is_over_limit = serializers.ReadOnlyField()
    
    class Meta:
        model = SubscriptionUsage
        fields = [
            'id', 'month', 'whatsapp_messages_used', 'mpesa_transactions_used',
            'storage_used_mb', 'whatsapp_messages_limit', 'mpesa_transactions_limit',
            'storage_limit_mb', 'estimated_cost', 'actual_cost', 'whatsapp_usage_percentage',
            'mpesa_usage_percentage', 'is_over_limit', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class APICallLogSerializer(serializers.ModelSerializer):
    """
    Serializer for APICallLog model
    """
    is_successful = serializers.ReadOnlyField()
    is_error = serializers.ReadOnlyField()
    
    class Meta:
        model = APICallLog
        fields = [
            'id', 'service', 'endpoint', 'method', 'status_code', 'response_time_ms',
            'request_size_bytes', 'response_size_bytes', 'error_message', 'user_agent',
            'ip_address', 'is_successful', 'is_error', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
