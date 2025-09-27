from django.contrib import admin
from .models import UsageLog, BusinessMetrics, SubscriptionUsage, APICallLog


@admin.register(UsageLog)
class UsageLogAdmin(admin.ModelAdmin):
    list_display = ('business', 'date', 'whatsapp_business_initiated', 'whatsapp_user_initiated', 'mpesa_transaction_count')
    list_filter = ('date', 'business')
    search_fields = ('business__business_name',)
    ordering = ('-date',)


@admin.register(BusinessMetrics)
class BusinessMetricsAdmin(admin.ModelAdmin):
    list_display = ('business', 'date', 'new_customers', 'total_conversations', 'total_sales')
    list_filter = ('date', 'business')
    search_fields = ('business__business_name',)
    ordering = ('-date',)


@admin.register(SubscriptionUsage)
class SubscriptionUsageAdmin(admin.ModelAdmin):
    list_display = ('business', 'month', 'whatsapp_messages_used', 'mpesa_transactions_used', 'estimated_cost')
    list_filter = ('month', 'business')
    search_fields = ('business__business_name',)
    ordering = ('-month',)


@admin.register(APICallLog)
class APICallLogAdmin(admin.ModelAdmin):
    list_display = ('business', 'service', 'endpoint', 'method', 'status_code', 'response_time_ms', 'created_at')
    list_filter = ('service', 'method', 'status_code', 'created_at', 'business')
    search_fields = ('endpoint', 'business__business_name')
    ordering = ('-created_at',)
