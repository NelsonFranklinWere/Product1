from django.contrib import admin
from .models import Transaction, PaymentRequest, PaymentMethod, PaymentReceipt, PaymentWebhook


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('business', 'amount', 'phone_number', 'status', 'created_at')
    list_filter = ('status', 'created_at', 'business')
    search_fields = ('phone_number', 'mpesa_receipt_number', 'business__business_name')
    ordering = ('-created_at',)


@admin.register(PaymentRequest)
class PaymentRequestAdmin(admin.ModelAdmin):
    list_display = ('transaction', 'requested_by', 'reason', 'is_urgent', 'created_at')
    list_filter = ('is_urgent', 'created_at', 'requested_by')
    search_fields = ('reason', 'transaction__phone_number')
    ordering = ('-created_at',)


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ('business', 'method_type', 'is_active', 'is_default', 'created_at')
    list_filter = ('method_type', 'is_active', 'is_default', 'created_at', 'business')
    search_fields = ('business__business_name', 'account_name')
    ordering = ('-created_at',)


@admin.register(PaymentReceipt)
class PaymentReceiptAdmin(admin.ModelAdmin):
    list_display = ('transaction', 'receipt_number', 'is_sent', 'created_at')
    list_filter = ('is_sent', 'created_at')
    search_fields = ('receipt_number', 'transaction__phone_number')
    ordering = ('-created_at',)


@admin.register(PaymentWebhook)
class PaymentWebhookAdmin(admin.ModelAdmin):
    list_display = ('transaction', 'webhook_type', 'response_status', 'processed', 'created_at')
    list_filter = ('webhook_type', 'response_status', 'processed', 'created_at')
    search_fields = ('transaction__checkout_request_id',)
    ordering = ('-created_at',)
