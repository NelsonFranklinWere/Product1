import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from apps.accounts.models import User
from .models import Conversation, Message

logger = logging.getLogger(__name__)


class CommunicationsConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time communications
    """
    
    async def connect(self):
        self.business_id = self.scope['url_route']['kwargs']['business_id']
        self.business_group_name = f'business_{self.business_id}'
        
        # Join business group
        await self.channel_layer.group_add(
            self.business_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send recent conversations
        await self.send_recent_conversations()
    
    async def disconnect(self, close_code):
        # Leave business group
        await self.channel_layer.group_discard(
            self.business_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'send_message':
                await self.send_message(data)
            elif message_type == 'mark_read':
                await self.mark_messages_read(data)
            elif message_type == 'join_conversation':
                await self.join_conversation(data)
            elif message_type == 'typing':
                await self.send_typing_indicator(data)
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))
    
    async def send_message(self, data):
        """
        Send a message through the appropriate platform
        """
        try:
            conversation_id = data.get('conversation_id')
            message_text = data.get('message')
            message_type = data.get('message_type', 'text')
            
            # Get conversation and send message
            conversation = await self.get_conversation(conversation_id)
            if not conversation:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Conversation not found'
                }))
                return
            
            # Send message via appropriate platform
            if conversation.source_platform == 'facebook':
                from .facebook_service import FacebookMessengerService
                service = FacebookMessengerService()
                result = service.send_message(
                    conversation.contact.facebook_id,
                    message_text,
                    conversation.business
                )
            elif conversation.source_platform == 'whatsapp':
                from .whatsapp_service import WhatsAppBusinessService
                service = WhatsAppBusinessService()
                result = service.send_text_message(
                    conversation.contact.phone_number,
                    message_text,
                    conversation.business
                )
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Unsupported platform'
                }))
                return
            
            # Send confirmation to client
            await self.send(text_data=json.dumps({
                'type': 'message_sent',
                'conversation_id': conversation_id,
                'message_id': result.get('message_id', ''),
                'status': 'success'
            }))
            
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Failed to send message: {str(e)}'
            }))
    
    async def mark_messages_read(self, data):
        """
        Mark messages as read
        """
        try:
            conversation_id = data.get('conversation_id')
            message_ids = data.get('message_ids', [])
            
            await self.mark_messages_as_read(conversation_id, message_ids)
            
            await self.send(text_data=json.dumps({
                'type': 'messages_marked_read',
                'conversation_id': conversation_id,
                'message_ids': message_ids
            }))
            
        except Exception as e:
            logger.error(f"Error marking messages as read: {e}")
    
    async def join_conversation(self, data):
        """
        Join a specific conversation
        """
        try:
            conversation_id = data.get('conversation_id')
            conversation = await self.get_conversation(conversation_id)
            
            if conversation:
                # Send conversation messages
                messages = await self.get_conversation_messages(conversation_id)
                await self.send(text_data=json.dumps({
                    'type': 'conversation_joined',
                    'conversation_id': conversation_id,
                    'messages': messages
                }))
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Conversation not found'
                }))
                
        except Exception as e:
            logger.error(f"Error joining conversation: {e}")
    
    async def send_typing_indicator(self, data):
        """
        Send typing indicator
        """
        try:
            conversation_id = data.get('conversation_id')
            is_typing = data.get('is_typing', False)
            
            # Broadcast typing indicator to other clients
            await self.channel_layer.group_send(
                self.business_group_name,
                {
                    'type': 'typing_indicator',
                    'conversation_id': conversation_id,
                    'is_typing': is_typing,
                    'user_id': self.business_id
                }
            )
            
        except Exception as e:
            logger.error(f"Error sending typing indicator: {e}")
    
    async def new_message(self, event):
        """
        Handle new incoming message
        """
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'conversation_id': event['conversation_id'],
            'message': event['message']
        }))
    
    async def message_status_update(self, event):
        """
        Handle message status update (delivered, read, etc.)
        """
        await self.send(text_data=json.dumps({
            'type': 'message_status_update',
            'message_id': event['message_id'],
            'status': event['status']
        }))
    
    async def payment_notification(self, event):
        """
        Handle payment notifications (forwarded to communications socket)
        """
        await self.send(text_data=json.dumps({
            'type': 'payment_notification',
            'transaction_id': event['transaction_id'],
            'status': event['status'],
            'amount': event['amount'],
            'phone_number': event['phone_number'],
            'receipt_number': event.get('receipt_number', ''),
            'message': event.get('message', '')
        }))
    
    async def typing_indicator(self, event):
        """
        Handle typing indicator from other users
        """
        if event['user_id'] != self.business_id:  # Don't send to self
            await self.send(text_data=json.dumps({
                'type': 'typing_indicator',
                'conversation_id': event['conversation_id'],
                'is_typing': event['is_typing'],
                'user_id': event['user_id']
            }))
    
    async def send_recent_conversations(self):
        """
        Send recent conversations to client
        """
        try:
            conversations = await self.get_recent_conversations()
            await self.send(text_data=json.dumps({
                'type': 'recent_conversations',
                'conversations': conversations
            }))
        except Exception as e:
            logger.error(f"Error sending recent conversations: {e}")
    
    @database_sync_to_async
    def get_conversation(self, conversation_id):
        """
        Get conversation by ID
        """
        try:
            return Conversation.objects.select_related('contact', 'business').get(
                id=conversation_id,
                business_id=self.business_id
            )
        except Conversation.DoesNotExist:
            return None
    
    @database_sync_to_async
    def get_conversation_messages(self, conversation_id, limit=50):
        """
        Get messages for a conversation
        """
        messages = Message.objects.filter(
            conversation_id=conversation_id
        ).order_by('-timestamp')[:limit]
        
        return [
            {
                'id': msg.id,
                'text': msg.text,
                'direction': msg.direction,
                'message_type': msg.message_type,
                'timestamp': msg.timestamp.isoformat(),
                'is_read': msg.is_read,
                'is_delivered': msg.is_delivered,
                'metadata': msg.metadata
            }
            for msg in messages
        ]
    
    @database_sync_to_async
    def get_recent_conversations(self):
        """
        Get recent conversations for the business
        """
        conversations = Conversation.objects.filter(
            business_id=self.business_id
        ).select_related('contact').order_by('-last_message_at')[:20]
        
        return [
            {
                'id': conv.id,
                'contact_name': conv.contact.name or 'Unknown',
                'contact_phone': conv.contact.phone_number,
                'contact_facebook_id': conv.contact.facebook_id,
                'source_platform': conv.source_platform,
                'last_message_at': conv.last_message_at.isoformat(),
                'unread_count': conv.unread_count,
                'is_resolved': conv.is_resolved,
                'priority': conv.priority
            }
            for conv in conversations
        ]
    
    @database_sync_to_async
    def mark_messages_as_read(self, conversation_id, message_ids):
        """
        Mark messages as read
        """
        Message.objects.filter(
            id__in=message_ids,
            conversation_id=conversation_id,
            conversation__business_id=self.business_id
        ).update(is_read=True)


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for notifications
    """
    
    async def connect(self):
        self.business_id = self.scope['url_route']['kwargs']['business_id']
        self.notification_group_name = f'notifications_{self.business_id}'
        
        # Join notification group
        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave notification group
        await self.channel_layer.group_discard(
            self.notification_group_name,
            self.channel_name
        )
    
    async def payment_notification(self, event):
        """
        Handle payment notification
        """
        await self.send(text_data=json.dumps({
            'type': 'payment_notification',
            'transaction_id': event['transaction_id'],
            'status': event['status'],
            'amount': event['amount'],
            'phone_number': event['phone_number'],
            'receipt_number': event['receipt_number'],
            'message': event['message']
        }))
    
    async def new_conversation_notification(self, event):
        """
        Handle new conversation notification
        """
        await self.send(text_data=json.dumps({
            'type': 'new_conversation',
            'conversation_id': event['conversation_id'],
            'contact_name': event['contact_name'],
            'source_platform': event['source_platform'],
            'message_preview': event['message_preview']
        }))
    
    async def system_notification(self, event):
        """
        Handle system notification
        """
        await self.send(text_data=json.dumps({
            'type': 'system_notification',
            'title': event['title'],
            'message': event['message'],
            'level': event.get('level', 'info')
        }))