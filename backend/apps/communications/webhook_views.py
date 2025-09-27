import json
import logging
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from .facebook_service import FacebookMessengerService
from .whatsapp_service import WhatsAppBusinessService
from apps.payments.mpesa_service import MpesaService
from apps.accounts.models import User

logger = logging.getLogger(__name__)


@require_http_methods(["GET"])
def facebook_webhook_verify(request):
    """
    Verify Facebook Messenger webhook
    """
    try:
        verify_token = request.GET.get('hub.verify_token')
        challenge = request.GET.get('hub.challenge')
        
        facebook_service = FacebookMessengerService()
        verified_challenge = facebook_service.verify_webhook(verify_token, challenge)
        
        if verified_challenge:
            return HttpResponse(verified_challenge)
        else:
            return HttpResponse('Verification failed', status=403)
            
    except Exception as e:
        logger.error(f"Facebook webhook verification error: {e}")
        return HttpResponse('Verification failed', status=500)


@csrf_exempt
@require_http_methods(["POST"])
def facebook_webhook_callback(request):
    """
    Handle Facebook Messenger webhook callbacks
    """
    try:
        # Parse webhook data
        webhook_data = json.loads(request.body)
        
        # For now, we'll use the first business user as the recipient
        # In production, you'd determine this based on the page ID or other logic
        business_user = User.objects.filter(is_active=True).first()
        
        if not business_user:
            logger.error("No active business user found for Facebook webhook")
            return JsonResponse({'status': 'error', 'message': 'No business user found'}, status=400)
        
        # Process the webhook
        facebook_service = FacebookMessengerService()
        facebook_service.process_webhook_message(webhook_data, business_user)
        
        return JsonResponse({'status': 'success'})
        
    except json.JSONDecodeError:
        logger.error("Invalid JSON in Facebook webhook")
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        logger.error(f"Facebook webhook processing error: {e}")
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@require_http_methods(["GET"])
def whatsapp_webhook_verify(request):
    """
    Verify WhatsApp Business webhook
    """
    try:
        verify_token = request.GET.get('hub.verify_token')
        challenge = request.GET.get('hub.challenge')
        
        whatsapp_service = WhatsAppBusinessService()
        verified_challenge = whatsapp_service.verify_webhook(verify_token, challenge)
        
        if verified_challenge:
            return HttpResponse(verified_challenge)
        else:
            return HttpResponse('Verification failed', status=403)
            
    except Exception as e:
        logger.error(f"WhatsApp webhook verification error: {e}")
        return HttpResponse('Verification failed', status=500)


@csrf_exempt
@require_http_methods(["POST"])
def whatsapp_webhook_callback(request):
    """
    Handle WhatsApp Business webhook callbacks
    """
    try:
        # Parse webhook data
        webhook_data = json.loads(request.body)
        
        # For now, we'll use the first business user as the recipient
        # In production, you'd determine this based on the phone number ID or other logic
        business_user = User.objects.filter(is_active=True).first()
        
        if not business_user:
            logger.error("No active business user found for WhatsApp webhook")
            return JsonResponse({'status': 'error', 'message': 'No business user found'}, status=400)
        
        # Process the webhook
        whatsapp_service = WhatsAppBusinessService()
        whatsapp_service.process_webhook_message(webhook_data, business_user)
        
        return JsonResponse({'status': 'success'})
        
    except json.JSONDecodeError:
        logger.error("Invalid JSON in WhatsApp webhook")
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        logger.error(f"WhatsApp webhook processing error: {e}")
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def mpesa_webhook_callback(request):
    """
    Handle M-Pesa payment confirmation callbacks
    """
    try:
        # Optional IP whitelist check
        whitelist = getattr(settings, 'MPESA_IP_WHITELIST', [])
        if whitelist:
            remote_ip = request.META.get('REMOTE_ADDR') or request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip()
            if remote_ip and remote_ip not in whitelist:
                logger.warning(f"M-Pesa callback blocked: IP {remote_ip} not in whitelist")
                return JsonResponse({'ResultCode': 1, 'ResultDesc': 'Not allowed'}, status=403)

        # Parse callback data
        callback_data = json.loads(request.body)
        
        # Process the callback
        mpesa_service = MpesaService()
        # Pass headers for auditing
        result = mpesa_service.process_payment_callback({
            **callback_data,
            '_headers': {k: v for k, v in request.headers.items()}
        })
        
        if result['success']:
            return JsonResponse({
                'ResultCode': 0,
                'ResultDesc': 'Success'
            })
        else:
            return JsonResponse({
                'ResultCode': 1,
                'ResultDesc': result.get('error', 'Processing failed')
            })
        
    except json.JSONDecodeError:
        logger.error("Invalid JSON in M-Pesa callback")
        return JsonResponse({
            'ResultCode': 1,
            'ResultDesc': 'Invalid JSON'
        })
    except Exception as e:
        logger.error(f"M-Pesa callback processing error: {e}")
        return JsonResponse({
            'ResultCode': 1,
            'ResultDesc': 'Processing failed'
        })
