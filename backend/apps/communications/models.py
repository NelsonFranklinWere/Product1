from django.db import models
from django.utils import timezone
from apps.accounts.models import User


class Contact(models.Model):
    """
    Customer contacts from various platforms
    """
    business = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contacts')
    name = models.CharField(max_length=255, blank=True)
    phone_number = models.CharField(max_length=255, blank=True)  # For WhatsApp
    facebook_id = models.CharField(max_length=255, blank=True)  # For Messenger
    email = models.EmailField(blank=True)
    notes = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)  # For customer segmentation
    is_blocked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'contacts'
        unique_together = (
            ('business', 'phone_number'),
            ('business', 'facebook_id'),
        )

    def __str__(self):
        return f"{self.name or 'Unknown'} ({self.business.business_name})"

    @property
    def primary_identifier(self):
        """Get the primary contact identifier"""
        if self.phone_number:
            return self.phone_number
        elif self.facebook_id:
            return self.facebook_id
        elif self.email:
            return self.email
        return f"Contact-{self.id}"


class Conversation(models.Model):
    """
    Conversations linking contacts and messages
    """
    business = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations')
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='conversations')
    source_platform = models.CharField(
        max_length=50,
        choices=[
            ('whatsapp', 'WhatsApp'),
            ('facebook', 'Facebook Messenger'),
        ]
    )
    platform_conversation_id = models.CharField(max_length=255, blank=True)  # External platform conversation ID
    is_resolved = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    priority = models.CharField(
        max_length=20,
        choices=[
            ('low', 'Low'),
            ('normal', 'Normal'),
            ('high', 'High'),
            ('urgent', 'Urgent'),
        ],
        default='normal'
    )
    assigned_to = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_conversations'
    )
    last_message_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'conversations'
        unique_together = ['business', 'contact', 'source_platform']

    def __str__(self):
        return f"{self.contact.name} - {self.source_platform} ({self.business.business_name})"

    @property
    def unread_count(self):
        return self.messages.filter(is_read=False, direction='inbound').count()


class Message(models.Model):
    """
    Individual messages within conversations
    """
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    direction = models.CharField(
        max_length=10,
        choices=[
            ('inbound', 'Inbound'),
            ('outbound', 'Outbound'),
        ]
    )
    message_type = models.CharField(
        max_length=20,
        choices=[
            ('text', 'Text'),
            ('image', 'Image'),
            ('document', 'Document'),
            ('audio', 'Audio'),
            ('video', 'Video'),
            ('location', 'Location'),
            ('contact', 'Contact'),
            ('template', 'Template'),
        ],
        default='text'
    )
    platform_message_id = models.CharField(max_length=255, blank=True)  # External platform message ID
    is_read = models.BooleanField(default=False)
    is_delivered = models.BooleanField(default=False)
    is_failed = models.BooleanField(default=False)
    failure_reason = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)  # Store additional platform-specific data
    reply_to = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='replies'
    )

    class Meta:
        db_table = 'messages'
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.direction} - {self.text[:50]}... ({self.conversation})"


class MessageTemplate(models.Model):
    """
    Pre-defined message templates for quick responses
    """
    business = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message_templates')
    name = models.CharField(max_length=100)
    content = models.TextField()
    category = models.CharField(
        max_length=50,
        choices=[
            ('greeting', 'Greeting'),
            ('product_info', 'Product Information'),
            ('pricing', 'Pricing'),
            ('support', 'Customer Support'),
            ('payment', 'Payment Request'),
            ('follow_up', 'Follow Up'),
            ('custom', 'Custom'),
        ]
    )
    is_active = models.BooleanField(default=True)
    usage_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'message_templates'

    def __str__(self):
        return f"{self.name} ({self.business.business_name})"


class WhatsAppTemplate(models.Model):
    """
    WhatsApp Business API message templates
    """
    business = models.ForeignKey(User, on_delete=models.CASCADE, related_name='whatsapp_templates')
    template_name = models.CharField(max_length=100)  # WhatsApp template name
    template_id = models.CharField(max_length=100)  # WhatsApp template ID
    category = models.CharField(
        max_length=50,
        choices=[
            ('AUTHENTICATION', 'Authentication'),
            ('MARKETING', 'Marketing'),
            ('UTILITY', 'Utility'),
        ]
    )
    language = models.CharField(max_length=10, default='en')
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('APPROVED', 'Approved'),
            ('REJECTED', 'Rejected'),
            ('DISABLED', 'Disabled'),
        ],
        default='PENDING'
    )
    components = models.JSONField(default=list)  # Template components structure
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'whatsapp_templates'
        unique_together = ['business', 'template_name']

    def __str__(self):
        return f"{self.template_name} ({self.business.business_name})"
