import requests
import base64
import json
import logging
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
from .models import Transaction, PaymentRequest, PaymentWebhook
from apps.analytics.middleware import UsageIncrementer

logger = logging.getLogger(__name__)


class MpesaService:
    """
    Service for handling M-Pesa Daraja API interactions
    """
    
    def __init__(self, consumer_key=None, consumer_secret=None):
        self.consumer_key = consumer_key or settings.MPESA_CONSUMER_KEY
        self.consumer_secret = consumer_secret or settings.MPESA_CONSUMER_SECRET
        self.base_url = "https://sandbox.safaricom.co.ke" if settings.DEBUG else "https://api.safaricom.co.ke"
        self.access_token = None
        self.token_expires_at = None
    
    def _get_access_token(self):
        """
        Get OAuth access token from M-Pesa API
        """
        try:
            # Check if we have a valid token
            if self.access_token and self.token_expires_at and timezone.now() < self.token_expires_at:
                return self.access_token
            
            url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
            
            # Create base64 encoded credentials
            credentials = f"{self.consumer_key}:{self.consumer_secret}"
            encoded_credentials = base64.b64encode(credentials.encode()).decode()
            
            headers = {
                'Authorization': f'Basic {encoded_credentials}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            token_data = response.json()
            self.access_token = token_data['access_token']
            
            # Set token expiration (subtract 5 minutes for safety)
            expires_in = token_data.get('expires_in', 3600)
            self.token_expires_at = timezone.now() + timedelta(seconds=expires_in - 300)
            
            return self.access_token
            
        except requests.exceptions.RequestException as e:
            logger.error(f"M-Pesa OAuth error: {e}")
            raise Exception(f"Failed to get M-Pesa access token: {str(e)}")
    
    def initiate_stk_push(self, phone_number, amount, account_reference, transaction_desc, business_user):
        """
        Initiate STK Push payment request
        """
        try:
            access_token = self._get_access_token()
            
            url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            # Generate timestamp and password
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password = self._generate_password(timestamp)
            
            # Format phone number (remove + and ensure it starts with 254)
            formatted_phone = self._format_phone_number(phone_number)
            
            payload = {
                'BusinessShortCode': settings.MPESA_SHORTCODE,
                'Password': password,
                'Timestamp': timestamp,
                'TransactionType': 'CustomerPayBillOnline',
                'Amount': int(amount),
                'PartyA': formatted_phone,
                'PartyB': settings.MPESA_SHORTCODE,
                'PhoneNumber': formatted_phone,
                'CallBackURL': settings.MPESA_CALLBACK_URL,
                'AccountReference': account_reference,
                'TransactionDesc': transaction_desc
            }
            
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            
            response_data = response.json()
            
            # Create transaction record
            transaction = Transaction.objects.create(
                business=business_user,
                amount=amount,
                description=transaction_desc,
                checkout_request_id=response_data.get('CheckoutRequestID', ''),
                merchant_request_id=response_data.get('MerchantRequestID', ''),
                phone_number=formatted_phone,
                status='pending',
                expires_at=timezone.now() + timedelta(minutes=10)  # STK Push expires in 10 minutes
            )
            
            # Log webhook call
            PaymentWebhook.objects.create(
                transaction=transaction,
                webhook_type='stk_push_initiation',
                payload=payload,
                headers=dict(headers),
                response_status=response.status_code,
                response_body=response.text,
                processed=True
            )
            
            return {
                'success': True,
                'checkout_request_id': response_data.get('CheckoutRequestID'),
                'merchant_request_id': response_data.get('MerchantRequestID'),
                'customer_message': response_data.get('CustomerMessage'),
                'transaction_id': transaction.id
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"M-Pesa STK Push error: {e}")
            return {
                'success': False,
                'error': f"Failed to initiate STK Push: {str(e)}"
            }
    
    def query_stk_push_status(self, checkout_request_id, business_user):
        """
        Query STK Push transaction status
        """
        try:
            access_token = self._get_access_token()
            
            url = f"{self.base_url}/mpesa/stkpushquery/v1/query"
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password = self._generate_password(timestamp)
            
            payload = {
                'BusinessShortCode': settings.MPESA_SHORTCODE,
                'Password': password,
                'Timestamp': timestamp,
                'CheckoutRequestID': checkout_request_id
            }
            
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            
            response_data = response.json()
            
            # Update transaction status
            transaction = Transaction.objects.filter(
                checkout_request_id=checkout_request_id,
                business=business_user
            ).first()
            
            if transaction:
                result_code = response_data.get('ResultCode', 1)
                if result_code == 0:
                    transaction.status = 'success'
                    transaction.mpesa_receipt_number = response_data.get('MpesaReceiptNumber', '')
                    transaction.transaction_date = timezone.now()
                else:
                    transaction.status = 'failed'
                    transaction.error_message = response_data.get('ResultDesc', 'Transaction failed')
                
                transaction.mpesa_confirmation_data = response_data
                transaction.save()
                
                # Log usage
                if transaction.status == 'success':
                    UsageIncrementer.increment_mpesa_usage(business_user, transaction.amount, True)
                else:
                    UsageIncrementer.increment_mpesa_usage(business_user, transaction.amount, False)
            
            return response_data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"M-Pesa STK Push query error: {e}")
            raise Exception(f"Failed to query STK Push status: {str(e)}")
    
    def process_payment_callback(self, callback_data):
        """
        Process M-Pesa payment confirmation callback
        """
        try:
            # Idempotency: avoid processing the same callback twice
            body = callback_data.get('Body', {})
            stk_callback = body.get('stkCallback', {})
            checkout_request_id = stk_callback.get('CheckoutRequestID')
            result_code = stk_callback.get('ResultCode', 1)

            if not checkout_request_id:
                # Log and return
                webhook = PaymentWebhook.objects.create(
                    webhook_type='payment_confirmation',
                    payload=callback_data,
                    headers=callback_data.get('_headers', {}),
                    processed=True,
                    error_message='Missing CheckoutRequestID'
                )
                return {'success': False, 'error': 'Invalid callback data'}

            # If we already have a processed webhook for this CheckoutRequestID with same status, exit
            existing_processed = PaymentWebhook.objects.filter(
                webhook_type='payment_confirmation',
                transaction__checkout_request_id=checkout_request_id,
                processed=True
            ).first()
            if existing_processed:
                return {'success': True, 'message': 'Already processed'}
            # Log the webhook call
            webhook = PaymentWebhook.objects.create(
                webhook_type='payment_confirmation',
                payload=callback_data,
                headers=callback_data.get('_headers', {}),
                processed=False
            )
            
            # Extract transaction details
            # At this point we have checkout_request_id and result_code
            
            # Find transaction
            transaction = Transaction.objects.filter(
                checkout_request_id=checkout_request_id
            ).first()
            
            if not transaction:
                webhook.error_message = f"Transaction not found for CheckoutRequestID: {checkout_request_id}"
                webhook.processed = True
                webhook.save()
                return {'success': False, 'error': 'Transaction not found'}
            
            # Update webhook with transaction
            webhook.transaction = transaction
            webhook.save()
            
            # Process the callback
            if result_code == 0:
                # Success
                callback_metadata = stk_callback.get('CallbackMetadata', {})
                item_list = callback_metadata.get('Item', [])
                
                # Extract payment details
                payment_data = {}
                for item in item_list:
                    payment_data[item.get('Name', '')] = item.get('Value', '')
                
                transaction.status = 'success'
                transaction.mpesa_receipt_number = payment_data.get('MpesaReceiptNumber', '')
                transaction.phone_number = payment_data.get('PhoneNumber', transaction.phone_number)
                transaction.transaction_date = timezone.now()
                transaction.mpesa_confirmation_data = callback_data
                
                # Log successful payment
                UsageIncrementer.increment_mpesa_usage(transaction.business, transaction.amount, True)
                
            else:
                # Failed
                transaction.status = 'failed'
                transaction.error_message = stk_callback.get('ResultDesc', 'Payment failed')
                transaction.mpesa_confirmation_data = callback_data
                
                # Log failed payment
                UsageIncrementer.increment_mpesa_usage(transaction.business, transaction.amount, False)
            
            transaction.save()
            webhook.processed = True
            webhook.save()
            
            # Send real-time notification via WebSocket (to both notification and communications channels)
            self._send_payment_notification(transaction)
            
            return {
                'success': True,
                'transaction_id': transaction.id,
                'status': transaction.status,
                'message': 'Payment processed successfully' if result_code == 0 else 'Payment failed'
            }
            
        except Exception as e:
            logger.error(f"Error processing M-Pesa callback: {e}")
            return {'success': False, 'error': str(e)}
    
    def _generate_password(self, timestamp):
        """
        Generate M-Pesa API password
        """
        try:
            data_to_encode = f"{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}"
            encoded_string = base64.b64encode(data_to_encode.encode()).decode()
            return encoded_string
        except Exception as e:
            logger.error(f"Error generating M-Pesa password: {e}")
            raise
    
    def _format_phone_number(self, phone_number):
        """
        Format phone number for M-Pesa API
        """
        # Remove all non-digit characters
        digits_only = ''.join(filter(str.isdigit, phone_number))
        
        # Ensure it starts with 254
        if digits_only.startswith('0'):
            digits_only = '254' + digits_only[1:]
        elif not digits_only.startswith('254'):
            digits_only = '254' + digits_only
        
        return digits_only
    
    def _send_payment_notification(self, transaction):
        """
        Send real-time payment notification via WebSocket
        """
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            
            channel_layer = get_channel_layer()
            
            # Send notification to business user's channel
            async_to_sync(channel_layer.group_send)(
                f"business_{transaction.business.id}",
                {
                    'type': 'payment_notification',
                    'transaction_id': transaction.id,
                    'status': transaction.status,
                    'amount': str(transaction.amount),
                    'phone_number': transaction.phone_number,
                    'receipt_number': transaction.mpesa_receipt_number or '',
                    'message': f"Payment of KES {transaction.amount} {'successful' if transaction.status == 'success' else 'failed'}"
                }
            )
            
        except Exception as e:
            logger.error(f"Error sending payment notification: {e}")
    
    def get_transaction_status(self, transaction_id, business_user):
        """
        Get transaction status by ID
        """
        try:
            transaction = Transaction.objects.filter(
                id=transaction_id,
                business=business_user
            ).first()
            
            if not transaction:
                return {'success': False, 'error': 'Transaction not found'}
            
            return {
                'success': True,
                'transaction': {
                    'id': transaction.id,
                    'amount': str(transaction.amount),
                    'status': transaction.status,
                    'phone_number': transaction.phone_number,
                    'description': transaction.description,
                    'created_at': transaction.created_at.isoformat(),
                    'mpesa_receipt_number': transaction.mpesa_receipt_number,
                    'error_message': transaction.error_message
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting transaction status: {e}")
            return {'success': False, 'error': str(e)}
    
    def validate_callback_signature(self, callback_data, signature):
        """
        Validate M-Pesa callback signature (if implemented by Safaricom)
        """
        # This would implement signature validation if Safaricom provides it
        # For now, we'll trust the callback data
        return True
