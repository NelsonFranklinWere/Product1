import requests
import logging
from django.conf import settings
from django.utils import timezone
from .models import Contact, Conversation, Message, WhatsAppTemplate
from apps.analytics.middleware import UsageIncrementer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)


class WhatsAppBusinessService:
    """
    Service for handling WhatsApp Business API interactions
    """
    
    def __init__(self, access_token=None, phone_number_id=None):
        self.access_token = access_token or settings.WHATSAPP_ACCESS_TOKEN
        self.phone_number_id = phone_number_id or settings.WHATSAPP_PHONE_NUMBER_ID
        self.api_url = f"https://graph.facebook.com/v18.0/{self.phone_number_id}"
    
    def send_text_message(self, to_phone_number, message_text, business_user):
        """
        Send a text message via WhatsApp Business API
        """
        try:
            url = f"{self.api_url}/messages"
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'messaging_product': 'whatsapp',
                'to': to_phone_number,
                'type': 'text',
                'text': {'body': message_text}
            }
            
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            
            # Log usage
            UsageIncrementer.increment_whatsapp_usage(business_user, 'business_initiated')
            
            # Save message to database
            self._save_outbound_message(to_phone_number, message_text, business_user, response.json())
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"WhatsApp API error: {e}")
            raise Exception(f"Failed to send WhatsApp message: {str(e)}")
    
    def send_template_message(self, to_phone_number, template_name, parameters, business_user):
        """
        Send a template message via WhatsApp Business API
        """
        try:
            url = f"{self.api_url}/messages"
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            # Get template from database
            template = WhatsAppTemplate.objects.filter(
                business=business_user,
                template_name=template_name,
                is_active=True
            ).first()
            
            if not template:
                raise Exception(f"Template '{template_name}' not found or inactive")
            
            payload = {
                'messaging_product': 'whatsapp',
                'to': to_phone_number,
                'type': 'template',
                'template': {
                    'name': template_name,
                    'language': {'code': template.language},
                    'components': self._build_template_components(template, parameters)
                }
            }
            
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            
            # Log usage
            UsageIncrementer.increment_whatsapp_usage(business_user, 'template')
            
            # Save message to database
            self._save_outbound_message(to_phone_number, f"[TEMPLATE] {template_name}", business_user, response.json())
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"WhatsApp template API error: {e}")
            raise Exception(f"Failed to send WhatsApp template message: {str(e)}")
    
    def send_interactive_message(self, to_phone_number, message_type, content, business_user):
        """
        Send interactive message (buttons, list, etc.) via WhatsApp Business API
        """
        try:
            url = f"{self.api_url}/messages"
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'messaging_product': 'whatsapp',
                'to': to_phone_number,
                'type': message_type,
                message_type: content
            }
            
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            
            # Log usage
            UsageIncrementer.increment_whatsapp_usage(business_user, 'business_initiated')
            
            # Save message to database
            self._save_outbound_message(to_phone_number, f"[{message_type.upper()}]", business_user, response.json())
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"WhatsApp interactive API error: {e}")
            raise Exception(f"Failed to send WhatsApp interactive message: {str(e)}")
    
    def send_product_message(self, to_phone_number, product, business_user):
        """
        Send product information via WhatsApp
        """
        try:
            # Create product message content
            product_content = {
                'header': {'type': 'text', 'text': product.name},
                'body': {'type': 'text', 'text': product.short_description or product.description[:200]},
                'footer': {'type': 'text', 'text': f"KES {product.price}"},
                'action': {
                    'buttons': [
                        {
                            'type': 'reply',
                            'reply': {
                                'id': f"product_{product.id}_info",
                                'title': 'More Info'
                            }
                        },
                        {
                            'type': 'reply',
                            'reply': {
                                'id': f"product_{product.id}_buy",
                                'title': 'Buy Now'
                            }
                        }
                    ]
                }
            }
            
            return self.send_interactive_message(to_phone_number, 'interactive', product_content, business_user)
            
        except Exception as e:
            logger.error(f"Error sending WhatsApp product message: {e}")
            raise
    
    def _build_template_components(self, template, parameters):
        """
        Build template components with parameters
        """
        components = []
        
        # Add body parameters
        if template.components:
            for component in template.components:
                if component.get('type') == 'BODY':
                    body_params = parameters.get('body', [])
                    if body_params:
                        components.append({
                            'type': 'body',
                            'parameters': [{'type': 'text', 'text': str(param)} for param in body_params]
                        })
        
        return components
    
    def _save_outbound_message(self, phone_number, message_text, business_user, api_response):
        """
        Save outbound message to database
        """
        try:
            # Get or create contact
            contact, created = Contact.objects.get_or_create(
                business=business_user,
                phone_number=phone_number,
                defaults={'name': 'WhatsApp User'}
            )
            
            # Get or create conversation
            conversation, created = Conversation.objects.get_or_create(
                business=business_user,
                contact=contact,
                source_platform='whatsapp',
                defaults={'platform_conversation_id': phone_number}
            )
            
            # Create message
            message = Message.objects.create(
                conversation=conversation,
                text=message_text,
                direction='outbound',
                message_type='text',
                platform_message_id=api_response.get('messages', [{}])[0].get('id', ''),
                is_delivered=True,
                metadata=api_response
            )
            
            # Update conversation timestamp
            conversation.last_message_at = timezone.now()
            conversation.save()

            # Broadcast over WebSocket to business group
            try:
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    f"business_{business_user.id}",
                    {
                        'type': 'new_message',
                        'conversation_id': conversation.id,
                        'message': {
                            'id': message.id,
                            'text': message.text,
                            'direction': message.direction,
                            'message_type': message.message_type,
                            'timestamp': message.timestamp.isoformat(),
                            'is_read': message.is_read,
                            'is_delivered': message.is_delivered,
                            'metadata': message.metadata,
                        }
                    }
                )
            except Exception as e:
                logger.error(f"WS broadcast error (WhatsApp outbound): {e}")
            
        except Exception as e:
            logger.error(f"Error saving outbound WhatsApp message: {e}")
    
    def process_webhook_message(self, webhook_data, business_user):
        """
        Process incoming webhook message from WhatsApp
        """
        try:
            for entry in webhook_data.get('entry', []):
                for change in entry.get('changes', []):
                    if change.get('field') == 'messages':
                        for value in change.get('value', {}).get('messages', []):
                            self._process_incoming_message(value, change['value'], business_user)
                        for status in change.get('value', {}).get('statuses', []):
                            self._process_status_update(status, business_user)
            
            # Log usage
            UsageIncrementer.increment_whatsapp_usage(business_user, 'user_initiated')
            
        except Exception as e:
            logger.error(f"Error processing WhatsApp webhook: {e}")
            raise
    
    def _process_incoming_message(self, message_data, webhook_value, business_user):
        """
        Process incoming message from WhatsApp
        """
        try:
            from_phone = message_data['from']
            message_type = message_data.get('type', 'text')
            
            # Get or create contact
            contact, created = Contact.objects.get_or_create(
                business=business_user,
                phone_number=from_phone,
                defaults={'name': 'WhatsApp User'}
            )
            
            # Get or create conversation
            conversation, created = Conversation.objects.get_or_create(
                business=business_user,
                contact=contact,
                source_platform='whatsapp',
                defaults={'platform_conversation_id': from_phone}
            )
            
            # Determine message content based on type
            message_text = ''
            if message_type == 'text':
                message_text = message_data.get('text', {}).get('body', '')
            elif message_type == 'image':
                message_text = '[IMAGE]'
            elif message_type == 'document':
                message_text = '[DOCUMENT]'
            elif message_type == 'audio':
                message_text = '[AUDIO]'
            elif message_type == 'video':
                message_text = '[VIDEO]'
            elif message_type == 'location':
                location = message_data.get('location', {})
                message_text = f"[LOCATION] {location.get('name', '')} - {location.get('address', '')}"
            elif message_type == 'interactive':
                interactive = message_data.get('interactive', {})
                if 'button_reply' in interactive:
                    message_text = f"[BUTTON] {interactive['button_reply']['title']}"
                elif 'list_reply' in interactive:
                    message_text = f"[LIST] {interactive['list_reply']['title']}"
            else:
                message_text = f'[{message_type.upper()}]'
            
            # Create message
            message = Message.objects.create(
                conversation=conversation,
                text=message_text,
                direction='inbound',
                message_type=message_type,
                platform_message_id=message_data.get('id', ''),
                metadata=message_data
            )
            
            # Update conversation timestamp
            conversation.last_message_at = timezone.now()
            conversation.save()
            
            # Log general usage
            UsageIncrementer.increment_general_usage(business_user, 'message_received')

            # Broadcast over WebSocket to business group
            try:
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    f"business_{business_user.id}",
                    {
                        'type': 'new_message',
                        'conversation_id': conversation.id,
                        'message': {
                            'id': message.id,
                            'text': message.text,
                            'direction': message.direction,
                            'message_type': message.message_type,
                            'timestamp': message.timestamp.isoformat(),
                            'is_read': message.is_read,
                            'is_delivered': message.is_delivered,
                            'metadata': message.metadata,
                        }
                    }
                )
            except Exception as e:
                logger.error(f"WS broadcast error (WhatsApp inbound): {e}")
            
        except Exception as e:
            logger.error(f"Error processing incoming WhatsApp message: {e}")
    
    def _process_status_update(self, status_data, business_user):
        """
        Process status update from WhatsApp
        """
        try:
            message_id = status_data.get('id')
            status = status_data.get('status')
            
            if message_id:
                message = Message.objects.filter(
                    platform_message_id=message_id,
                    conversation__business=business_user
                ).first()
                
                if message:
                    if status == 'delivered':
                        message.is_delivered = True
                    elif status == 'read':
                        message.is_read = True
                    elif status == 'failed':
                        message.is_failed = True
                        message.failure_reason = status_data.get('errors', [{}])[0].get('title', 'Unknown error')
                    
                    message.save()
                    
        except Exception as e:
            logger.error(f"Error processing WhatsApp status update: {e}")
    
    def get_templates(self, business_user):
        """
        Get WhatsApp templates for a business
        """
        try:
            url = f"https://graph.facebook.com/v18.0/{settings.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates"
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            templates_data = response.json()
            
            # Sync templates with database
            for template_data in templates_data.get('data', []):
                WhatsAppTemplate.objects.update_or_create(
                    business=business_user,
                    template_name=template_data['name'],
                    defaults={
                        'template_id': template_data['id'],
                        'category': template_data['category'],
                        'language': template_data['language'],
                        'status': template_data['status'],
                        'components': template_data.get('components', [])
                    }
                )
            
            return templates_data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"WhatsApp templates API error: {e}")
            return None
    
    def verify_webhook(self, verify_token, challenge):
        """
        Verify WhatsApp webhook
        """
        expected = settings.WHATSAPP_VERIFY_TOKEN or settings.WHATSAPP_ACCESS_TOKEN
        if verify_token == expected:
            return challenge
        return None
