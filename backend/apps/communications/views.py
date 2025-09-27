import json
import logging
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Prefetch
from .models import Conversation, Message, Contact, MessageTemplate, WhatsAppTemplate
from .serializers import (
    ConversationSerializer, MessageSerializer, ContactSerializer,
    MessageTemplateSerializer, WhatsAppTemplateSerializer
)
from .facebook_service import FacebookMessengerService
from .whatsapp_service import WhatsAppBusinessService
from apps.analytics.middleware import UsageIncrementer

logger = logging.getLogger(__name__)


class ConversationListView(generics.ListCreateAPIView):
    """
    List and create conversations
    """
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Conversation.objects.filter(
            business=self.request.user
        ).select_related('contact').prefetch_related(
            Prefetch('messages', queryset=Message.objects.order_by('-timestamp')[:1])
        ).order_by('-last_message_at')
    
    def perform_create(self, serializer):
        serializer.save(business=self.request.user)


class ConversationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a conversation
    """
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Conversation.objects.filter(business=self.request.user)


class MessageListView(generics.ListCreateAPIView):
    """
    List messages for a conversation or all messages
    """
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        conversation_id = self.kwargs.get('pk') or self.kwargs.get('conversation_id')
        if conversation_id:
            return Message.objects.filter(
                conversation_id=conversation_id,
                conversation__business=self.request.user
            ).order_by('-timestamp')
        else:
            return Message.objects.filter(
                conversation__business=self.request.user
            ).select_related('conversation', 'conversation__contact').order_by('-timestamp')


class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a message
    """
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Message.objects.filter(conversation__business=self.request.user)


class SendMessageView(generics.CreateAPIView):
    """
    Send a message through the appropriate platform
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        try:
            conversation_id = kwargs.get('pk')
            message_text = request.data.get('message')
            message_type = request.data.get('message_type', 'text')
            
            if not message_text:
                return Response(
                    {'error': 'Message text is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get conversation
            conversation = get_object_or_404(
                Conversation,
                id=conversation_id,
                business=request.user
            )
            
            # Send message via appropriate platform
            if conversation.source_platform == 'facebook':
                service = FacebookMessengerService()
                result = service.send_message(
                    conversation.contact.facebook_id,
                    message_text,
                    request.user
                )
            elif conversation.source_platform == 'whatsapp':
                service = WhatsAppBusinessService()
                result = service.send_text_message(
                    conversation.contact.phone_number,
                    message_text,
                    request.user
                )
            else:
                return Response(
                    {'error': 'Unsupported platform'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get the created message
            message = Message.objects.filter(
                conversation=conversation,
                text=message_text,
                direction='outbound'
            ).order_by('-timestamp').first()
            
            if message:
                serializer = MessageSerializer(message)
                return Response({
                    'success': True,
                    'message': serializer.data,
                    'platform_response': result
                })
            else:
                return Response(
                    {'error': 'Message sent but not saved to database'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MarkMessageReadView(generics.UpdateAPIView):
    """
    Mark a message as read
    """
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, *args, **kwargs):
        try:
            message = get_object_or_404(
                Message,
                id=kwargs.get('pk'),
                conversation__business=request.user
            )
            
            message.is_read = True
            message.save()
            
            return Response({'success': True, 'message_id': message.id})
            
        except Exception as e:
            logger.error(f"Error marking message as read: {e}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ContactListView(generics.ListCreateAPIView):
    """
    List and create contacts
    """
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Contact.objects.filter(business=self.request.user)
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(phone_number__icontains=search) |
                Q(email__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(business=self.request.user)


class ContactDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a contact
    """
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Contact.objects.filter(business=self.request.user)


class MessageTemplateListView(generics.ListCreateAPIView):
    """
    List and create message templates
    """
    serializer_class = MessageTemplateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = MessageTemplate.objects.filter(business=self.request.user)
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(business=self.request.user)


class MessageTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a message template
    """
    serializer_class = MessageTemplateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return MessageTemplate.objects.filter(business=self.request.user)
    
    def patch(self, request, *args, **kwargs):
        template = self.get_object()
        
        # Increment usage count if template is being used
        if 'usage_count' in request.data:
            template.usage_count += 1
            template.save()
        
        return super().patch(request, *args, **kwargs)


class WhatsAppTemplateListView(generics.ListAPIView):
    """
    List WhatsApp templates
    """
    serializer_class = WhatsAppTemplateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return WhatsAppTemplate.objects.filter(business=self.request.user)


class SyncWhatsAppTemplatesView(generics.CreateAPIView):
    """
    Sync WhatsApp templates from Facebook API
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        try:
            service = WhatsAppBusinessService()
            templates_data = service.get_templates(request.user)
            
            if templates_data:
                return Response({
                    'success': True,
                    'message': f'Synced {len(templates_data.get("data", []))} templates',
                    'templates': templates_data
                })
            else:
                return Response(
                    {'error': 'Failed to sync templates'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except Exception as e:
            logger.error(f"Error syncing WhatsApp templates: {e}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_product_message(request, conversation_id):
    """
    Send a product message in a conversation
    """
    try:
        product_id = request.data.get('product_id')
        if not product_id:
            return Response(
                {'error': 'Product ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get conversation and product
        conversation = get_object_or_404(
            Conversation,
            id=conversation_id,
            business=request.user
        )
        
        from apps.products.models import Product
        product = get_object_or_404(Product, id=product_id, business=request.user)
        
        # Send product message via appropriate platform
        if conversation.source_platform == 'whatsapp':
            service = WhatsAppBusinessService()
            result = service.send_product_message(
                conversation.contact.phone_number,
                product,
                request.user
            )
        else:
            # For Facebook, send a text message with product details
            service = FacebookMessengerService()
            product_text = f"🛍️ *{product.name}*\n\n{product.short_description or product.description}\n\n💰 Price: KES {product.price}\n\nWould you like to purchase this item?"
            result = service.send_message(
                conversation.contact.facebook_id,
                product_text,
                request.user
            )
        
        # Log product share
        from apps.products.models import ProductShare
        ProductShare.objects.create(
            product=product,
            conversation=conversation,
            shared_by=request.user
        )
        
        # Increment product share count
        product.increment_inquiry_count()
        
        return Response({
            'success': True,
            'product_id': product.id,
            'platform_response': result
        })
        
    except Exception as e:
        logger.error(f"Error sending product message: {e}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
