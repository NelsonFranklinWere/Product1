from django.contrib import admin
from .models import Contact, Conversation, Message, MessageTemplate, WhatsAppTemplate


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'business', 'phone_number', 'facebook_id', 'is_blocked', 'created_at')
    list_filter = ('is_blocked', 'created_at', 'business')
    search_fields = ('name', 'phone_number', 'facebook_id', 'email')
    ordering = ('-created_at',)


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('contact', 'business', 'source_platform', 'is_resolved', 'priority', 'last_message_at')
    list_filter = ('source_platform', 'is_resolved', 'is_archived', 'priority', 'created_at')
    search_fields = ('contact__name', 'contact__phone_number', 'business__business_name')
    ordering = ('-last_message_at',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'direction', 'message_type', 'is_read', 'is_delivered', 'timestamp')
    list_filter = ('direction', 'message_type', 'is_read', 'is_delivered', 'is_failed', 'timestamp')
    search_fields = ('text', 'conversation__contact__name')
    ordering = ('-timestamp',)


@admin.register(MessageTemplate)
class MessageTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'business', 'category', 'is_active', 'usage_count', 'created_at')
    list_filter = ('category', 'is_active', 'created_at', 'business')
    search_fields = ('name', 'content', 'business__business_name')
    ordering = ('-created_at',)


@admin.register(WhatsAppTemplate)
class WhatsAppTemplateAdmin(admin.ModelAdmin):
    list_display = ('template_name', 'business', 'category', 'status', 'is_active', 'created_at')
    list_filter = ('category', 'status', 'is_active', 'created_at', 'business')
    search_fields = ('template_name', 'business__business_name')
    ordering = ('-created_at',)
