from django.urls import path, include
from . import views

urlpatterns = [
    # Conversations
    path('conversations/', views.ConversationListView.as_view(), name='conversation-list'),
    path('conversations/<int:pk>/', views.ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<int:pk>/messages/', views.MessageListView.as_view(), name='conversation-messages'),
    path('conversations/<int:pk>/send-message/', views.SendMessageView.as_view(), name='send-message'),
    
    # Messages
    path('messages/', views.MessageListView.as_view(), name='message-list'),
    path('messages/<int:pk>/', views.MessageDetailView.as_view(), name='message-detail'),
    path('messages/<int:pk>/mark-read/', views.MarkMessageReadView.as_view(), name='mark-message-read'),
    
    # Contacts
    path('contacts/', views.ContactListView.as_view(), name='contact-list'),
    path('contacts/<int:pk>/', views.ContactDetailView.as_view(), name='contact-detail'),
    
    # Message Templates
    path('templates/', views.MessageTemplateListView.as_view(), name='template-list'),
    path('templates/<int:pk>/', views.MessageTemplateDetailView.as_view(), name='template-detail'),
    
    # WhatsApp Templates
    path('whatsapp-templates/', views.WhatsAppTemplateListView.as_view(), name='whatsapp-template-list'),
    path('whatsapp-templates/sync/', views.SyncWhatsAppTemplatesView.as_view(), name='sync-whatsapp-templates'),
    
    # Webhooks
    path('webhooks/', include('apps.communications.webhook_urls')),
]
