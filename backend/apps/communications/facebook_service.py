import requests
import logging
from django.conf import settings
from django.utils import timezone
from .models import Contact, Conversation, Message
from apps.analytics.middleware import UsageIncrementer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)


class FacebookMessengerService:
    """
    Service for handling Facebook Messenger API interactions
    """
    
    def __init__(self, page_access_token=None):
        self.page_access_token = page_access_token or settings.FACEBOOK_PAGE_ACCESS_TOKEN
        self.api_url = "https://graph.facebook.com/v18.0"
    
    def send_message(self, recipient_id, message_text, business_user):
        """
        Send a text message via Facebook Messenger
        """
        try:
            url = f"{self.api_url}/me/messages"
            headers = {
                'Authorization': f'Bearer {self.page_access_token}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'recipient': {'id': recipient_id},
                'message': {'text': message_text},
                'messaging_type': 'RESPONSE'
            }
            
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            
            # Log usage
            UsageIncrementer.increment_facebook_usage(business_user, 'sent')
            
            # Save message to database
            self._save_outbound_message(recipient_id, message_text, business_user, response.json())
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Facebook API error: {e}")
            raise Exception(f"Failed to send Facebook message: {str(e)}")
    
    def send_template_message(self, recipient_id, template_name, parameters, business_user):
        """
        Send a template message via Facebook Messenger
        """
        try:
            url = f"{self.api_url}/me/messages"
            headers = {
                'Authorization': f'Bearer {self.page_access_token}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'recipient': {'id': recipient_id},
                'message': {
                    'attachment': {
                        'type': 'template',
                        'payload': {
                            'template_type': 'generic',
                            'elements': [{
                                'title': parameters.get('title', ''),
                                'subtitle': parameters.get('subtitle', ''),
                                'image_url': parameters.get('image_url', ''),
                                'buttons': parameters.get('buttons', [])
                            }]
                        }
                    }
                },
                'messaging_type': 'RESPONSE'
            }
            
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            
            # Log usage
            UsageIncrementer.increment_facebook_usage(business_user, 'sent')
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Facebook template API error: {e}")
            raise Exception(f"Failed to send Facebook template message: {str(e)}")
    
    def get_user_profile(self, user_id):
        """
        Get user profile information from Facebook
        """
        try:
            url = f"{self.api_url}/{user_id}"
            params = {
                'fields': 'first_name,last_name,profile_pic',
                'access_token': self.page_access_token
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Facebook profile API error: {e}")
            return None
    
    def _save_outbound_message(self, recipient_id, message_text, business_user, api_response):
        """
        Save outbound message to database
        """
        try:
            # Get or create contact
            contact, created = Contact.objects.get_or_create(
                business=business_user,
                facebook_id=recipient_id,
                defaults={'name': 'Facebook User'}
            )
            
            # Get or create conversation
            conversation, created = Conversation.objects.get_or_create(
                business=business_user,
                contact=contact,
                source_platform='facebook',
                defaults={'platform_conversation_id': recipient_id}
            )
            
            # Create message
            message = Message.objects.create(
                conversation=conversation,
                text=message_text,
                direction='outbound',
                message_type='text',
                platform_message_id=api_response.get('message_id', ''),
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
                logger.error(f"WS broadcast error (Facebook outbound): {e}")
            
        except Exception as e:
            logger.error(f"Error saving outbound Facebook message: {e}")
    
    def process_webhook_message(self, webhook_data, business_user):
        """
        Process incoming webhook message from Facebook
        """
        try:
            for entry in webhook_data.get('entry', []):
                for messaging_event in entry.get('messaging', []):
                    if 'message' in messaging_event:
                        self._process_incoming_message(messaging_event, business_user)
                    elif 'postback' in messaging_event:
                        self._process_postback(messaging_event, business_user)
                    elif 'delivery' in messaging_event:
                        self._process_delivery_confirmation(messaging_event, business_user)
                    elif 'read' in messaging_event:
                        self._process_read_receipt(messaging_event, business_user)
            
            # Log usage
            UsageIncrementer.increment_facebook_usage(business_user, 'received')
            
        except Exception as e:
            logger.error(f"Error processing Facebook webhook: {e}")
            raise
    
    def _process_incoming_message(self, messaging_event, business_user):
        """
        Process incoming message from Facebook
        """
        try:
            sender_id = messaging_event['sender']['id']
            message_data = messaging_event['message']
            
            # Get user profile
            profile = self.get_user_profile(sender_id)
            name = f"{profile.get('first_name', '')} {profile.get('last_name', '')}".strip() if profile else 'Facebook User'
            
            # Get or create contact
            contact, created = Contact.objects.get_or_create(
                business=business_user,
                facebook_id=sender_id,
                defaults={'name': name}
            )
            
            # Update contact name if we got profile info
            if profile and not contact.name:
                contact.name = name
                contact.save()
            
            # Get or create conversation
            conversation, created = Conversation.objects.get_or_create(
                business=business_user,
                contact=contact,
                source_platform='facebook',
                defaults={'platform_conversation_id': sender_id}
            )
            
            # Determine message type and content
            message_type = 'text'
            message_text = ''
            
            if 'text' in message_data:
                message_text = message_data['text']
            elif 'attachments' in message_data:
                message_type = 'attachment'
                message_text = f"[{message_data['attachments'][0]['type'].upper()}]"
            else:
                message_text = '[Unsupported message type]'
            
            # Create message
            message = Message.objects.create(
                conversation=conversation,
                text=message_text,
                direction='inbound',
                message_type=message_type,
                platform_message_id=message_data.get('mid', ''),
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
                logger.error(f"WS broadcast error (Facebook inbound): {e}")
            
        except Exception as e:
            logger.error(f"Error processing incoming Facebook message: {e}")
    
    def _process_postback(self, messaging_event, business_user):
        """
        Process postback from Facebook
        """
        try:
            sender_id = messaging_event['sender']['id']
            postback_data = messaging_event['postback']
            
            # Get or create contact
            contact, created = Contact.objects.get_or_create(
                business=business_user,
                facebook_id=sender_id,
                defaults={'name': 'Facebook User'}
            )
            
            # Get or create conversation
            conversation, created = Conversation.objects.get_or_create(
                business=business_user,
                contact=contact,
                source_platform='facebook',
                defaults={'platform_conversation_id': sender_id}
            )
            
            # Create message for postback
            Message.objects.create(
                conversation=conversation,
                text=f"[POSTBACK] {postback_data.get('title', '')} - {postback_data.get('payload', '')}",
                direction='inbound',
                message_type='postback',
                platform_message_id=messaging_event.get('timestamp', ''),
                metadata=messaging_event
            )
            
            # Update conversation timestamp
            conversation.last_message_at = timezone.now()
            conversation.save()
            
        except Exception as e:
            logger.error(f"Error processing Facebook postback: {e}")
    
    def _process_delivery_confirmation(self, messaging_event, business_user):
        """
        Process delivery confirmation from Facebook
        """
        try:
            # Update message delivery status
            for delivery in messaging_event['delivery'].get('mids', []):
                Message.objects.filter(
                    platform_message_id=delivery,
                    conversation__business=business_user
                ).update(is_delivered=True)
                
        except Exception as e:
            logger.error(f"Error processing Facebook delivery confirmation: {e}")
    
    def _process_read_receipt(self, messaging_event, business_user):
        """
        Process read receipt from Facebook
        """
        try:
            # Update message read status
            read_time = messaging_event['read'].get('watermark')
            if read_time:
                Message.objects.filter(
                    conversation__business=business_user,
                    conversation__contact__facebook_id=messaging_event['sender']['id'],
                    timestamp__lte=timezone.datetime.fromtimestamp(read_time / 1000)
                ).update(is_read=True)
                
        except Exception as e:
            logger.error(f"Error processing Facebook read receipt: {e}")
    
    def verify_webhook(self, verify_token, challenge):
        """
        Verify Facebook webhook
        """
        expected = settings.FACEBOOK_VERIFY_TOKEN or settings.FACEBOOK_APP_SECRET
        if verify_token == expected:
            return challenge
        return None
