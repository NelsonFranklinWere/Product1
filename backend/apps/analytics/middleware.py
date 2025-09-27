import time
import logging
from django.utils.deprecation import MiddlewareMixin
from django.db import transaction
from django.utils import timezone
from .models import UsageLog, APICallLog
from apps.accounts.models import User

logger = logging.getLogger(__name__)


class UsageTrackingMiddleware(MiddlewareMixin):
    """
    Middleware to track API usage for billing and analytics
    """
    
    def process_request(self, request):
        request._start_time = time.time()
        return None

    def process_response(self, request, response):
        if hasattr(request, '_start_time'):
            response_time = int((time.time() - request._start_time) * 1000)
            
            # Log API calls
            if request.path.startswith('/api/'):
                self._log_api_call(request, response, response_time)
        
        return response

    def _log_api_call(self, request, response, response_time):
        """
        Log API call details for monitoring
        """
        try:
            # Extract business user if authenticated
            business = None
            if hasattr(request, 'user') and request.user.is_authenticated:
                business = request.user

            # Determine service based on endpoint
            service = self._get_service_from_path(request.path)
            
            # Get client IP
            ip_address = self._get_client_ip(request)
            
            # Create API call log
            APICallLog.objects.create(
                business=business,
                service=service,
                endpoint=request.path,
                method=request.method,
                status_code=response.status_code,
                response_time_ms=response_time,
                request_size_bytes=len(request.body) if hasattr(request, 'body') else 0,
                response_size_bytes=len(response.content) if hasattr(response, 'content') else 0,
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                ip_address=ip_address,
            )
            
        except Exception as e:
            logger.error(f"Error logging API call: {e}")

    def _get_service_from_path(self, path):
        """
        Determine service based on API path
        """
        if '/webhooks/facebook' in path:
            return 'facebook'
        elif '/webhooks/whatsapp' in path:
            return 'whatsapp'
        elif '/payments/' in path or '/mpesa/' in path:
            return 'mpesa'
        else:
            return 'internal'

    def _get_client_ip(self, request):
        """
        Get client IP address
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class UsageIncrementer:
    """
    Utility class to increment usage counters
    """
    
    @staticmethod
    def increment_whatsapp_usage(business, message_type='user_initiated'):
        """
        Increment WhatsApp usage counters
        """
        try:
            today = timezone.now().date()
            usage_log, created = UsageLog.objects.get_or_create(
                business=business,
                date=today,
                defaults={
                    'whatsapp_user_initiated': 0,
                    'whatsapp_business_initiated': 0,
                    'whatsapp_template_messages': 0,
                }
            )
            
            if message_type == 'business_initiated':
                usage_log.whatsapp_business_initiated += 1
            elif message_type == 'template':
                usage_log.whatsapp_template_messages += 1
            else:
                usage_log.whatsapp_user_initiated += 1
                
            usage_log.save()
            
        except Exception as e:
            logger.error(f"Error incrementing WhatsApp usage: {e}")

    @staticmethod
    def increment_facebook_usage(business, direction='sent'):
        """
        Increment Facebook usage counters
        """
        try:
            today = timezone.now().date()
            usage_log, created = UsageLog.objects.get_or_create(
                business=business,
                date=today,
                defaults={
                    'facebook_messages_sent': 0,
                    'facebook_messages_received': 0,
                }
            )
            
            if direction == 'sent':
                usage_log.facebook_messages_sent += 1
            else:
                usage_log.facebook_messages_received += 1
                
            usage_log.save()
            
        except Exception as e:
            logger.error(f"Error incrementing Facebook usage: {e}")

    @staticmethod
    def increment_mpesa_usage(business, amount, success=True):
        """
        Increment M-Pesa usage counters
        """
        try:
            today = timezone.now().date()
            usage_log, created = UsageLog.objects.get_or_create(
                business=business,
                date=today,
                defaults={
                    'mpesa_transaction_count': 0,
                    'mpesa_transaction_value': 0,
                    'mpesa_successful_transactions': 0,
                    'mpesa_failed_transactions': 0,
                }
            )
            
            usage_log.mpesa_transaction_count += 1
            usage_log.mpesa_transaction_value += amount
            
            if success:
                usage_log.mpesa_successful_transactions += 1
            else:
                usage_log.mpesa_failed_transactions += 1
                
            usage_log.save()
            
        except Exception as e:
            logger.error(f"Error incrementing M-Pesa usage: {e}")

    @staticmethod
    def increment_general_usage(business, usage_type, count=1):
        """
        Increment general usage counters
        """
        try:
            today = timezone.now().date()
            usage_log, created = UsageLog.objects.get_or_create(
                business=business,
                date=today,
                defaults={
                    'conversations_created': 0,
                    'messages_sent': 0,
                    'messages_received': 0,
                    'products_shared': 0,
                }
            )
            
            if usage_type == 'conversation':
                usage_log.conversations_created += count
            elif usage_type == 'message_sent':
                usage_log.messages_sent += count
            elif usage_type == 'message_received':
                usage_log.messages_received += count
            elif usage_type == 'product_shared':
                usage_log.products_shared += count
                
            usage_log.save()
            
        except Exception as e:
            logger.error(f"Error incrementing general usage: {e}")
