from django.urls import path
from . import webhook_views

urlpatterns = [
    # Facebook Messenger webhooks
    path('facebook/verify/', webhook_views.facebook_webhook_verify, name='facebook_webhook_verify'),
    path('facebook/callback/', webhook_views.facebook_webhook_callback, name='facebook_webhook_callback'),
    
    # WhatsApp Business webhooks
    path('whatsapp/verify/', webhook_views.whatsapp_webhook_verify, name='whatsapp_webhook_verify'),
    path('whatsapp/callback/', webhook_views.whatsapp_webhook_callback, name='whatsapp_webhook_callback'),
    
    # M-Pesa webhooks
    path('mpesa/callback/', webhook_views.mpesa_webhook_callback, name='mpesa_webhook_callback'),
]