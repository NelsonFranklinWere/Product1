from rest_framework import serializers
from .models import Conversation, Message, Contact, MessageTemplate, WhatsAppTemplate


class ContactSerializer(serializers.ModelSerializer):
    """
    Serializer for Contact model
    """
    name = serializers.CharField(max_length=255, allow_blank=True)
    phone_number = serializers.CharField(max_length=20, allow_blank=True)
    facebook_id = serializers.CharField(max_length=255, allow_blank=True)
    email = serializers.EmailField(allow_blank=True, required=False)
    notes = serializers.CharField(allow_blank=True, required=False)
    tags = serializers.ListField(child=serializers.CharField(max_length=50), required=False)
    class Meta:
        model = Contact
        fields = [
            'id', 'name', 'phone_number', 'facebook_id', 'email', 
            'notes', 'tags', 'is_blocked', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        # Require at least one identifier
        if not any([data.get('phone_number'), data.get('facebook_id'), data.get('email')]):
            raise serializers.ValidationError('Provide at least one identifier: phone_number, facebook_id, or email.')
        return data


class MessageSerializer(serializers.ModelSerializer):
    """
    Serializer for Message model
    """
    class Meta:
        model = Message
        fields = [
            'id', 'text', 'timestamp', 'direction', 'message_type',
            'platform_message_id', 'is_read', 'is_delivered', 'is_failed',
            'failure_reason', 'metadata', 'reply_to'
        ]
        read_only_fields = ['id', 'timestamp']


class ConversationSerializer(serializers.ModelSerializer):
    """
    Serializer for Conversation model
    """
    contact = ContactSerializer(read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    unread_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'contact', 'source_platform', 'platform_conversation_id',
            'is_resolved', 'is_archived', 'priority', 'assigned_to',
            'last_message_at', 'created_at', 'unread_count', 'messages'
        ]
        read_only_fields = ['id', 'created_at', 'last_message_at']


class MessageTemplateSerializer(serializers.ModelSerializer):
    """
    Serializer for MessageTemplate model
    """
    class Meta:
        model = MessageTemplate
        fields = [
            'id', 'name', 'content', 'category', 'is_active',
            'usage_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'usage_count', 'created_at', 'updated_at']


class WhatsAppTemplateSerializer(serializers.ModelSerializer):
    """
    Serializer for WhatsAppTemplate model
    """
    class Meta:
        model = WhatsAppTemplate
        fields = [
            'id', 'template_name', 'template_id', 'category', 'language',
            'status', 'components', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SendMessageSerializer(serializers.Serializer):
    """
    Serializer for sending messages
    """
    message = serializers.CharField(max_length=4000, allow_blank=False, trim_whitespace=True)
    message_type = serializers.ChoiceField(
        choices=['text', 'image', 'document', 'audio', 'video'],
        default='text'
    )
    reply_to = serializers.IntegerField(required=False, allow_null=True)


class ProductMessageSerializer(serializers.Serializer):
    """
    Serializer for sending product messages
    """
    product_id = serializers.IntegerField(min_value=1)


class ConversationStatsSerializer(serializers.Serializer):
    """
    Serializer for conversation statistics
    """
    total_conversations = serializers.IntegerField()
    active_conversations = serializers.IntegerField()
    resolved_conversations = serializers.IntegerField()
    unread_messages = serializers.IntegerField()
    response_rate = serializers.FloatField()
    average_response_time = serializers.DurationField()
