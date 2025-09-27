import logging
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from datetime import timedelta, date
from .models import UsageLog, BusinessMetrics, SubscriptionUsage, APICallLog
from .serializers import (
    UsageLogSerializer, BusinessMetricsSerializer, 
    SubscriptionUsageSerializer, APICallLogSerializer
)

logger = logging.getLogger(__name__)


class UsageLogListView(generics.ListAPIView):
    """
    List usage logs for the business
    """
    serializer_class = UsageLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = UsageLog.objects.filter(business=self.request.user)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        return queryset.order_by('-date')


class CurrentUsageView(generics.RetrieveAPIView):
    """
    Get current usage for the business
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        try:
            today = timezone.now().date()
            
            # Get today's usage
            usage_log = UsageLog.objects.filter(
                business=request.user,
                date=today
            ).first()
            
            if not usage_log:
                # Create empty usage log for today
                usage_log = UsageLog.objects.create(
                    business=request.user,
                    date=today
                )
            
            # Get current month usage
            month_start = today.replace(day=1)
            month_usage = UsageLog.objects.filter(
                business=request.user,
                date__gte=month_start
            ).aggregate(
                total_whatsapp_messages=Sum('whatsapp_business_initiated') + Sum('whatsapp_user_initiated'),
                total_facebook_messages=Sum('facebook_messages_sent') + Sum('facebook_messages_received'),
                total_mpesa_transactions=Sum('mpesa_transaction_count'),
                total_mpesa_value=Sum('mpesa_transaction_value')
            )
            
            serializer = UsageLogSerializer(usage_log)
            return Response({
                'today': serializer.data,
                'month_total': month_usage
            })
            
        except Exception as e:
            logger.error(f"Error getting current usage: {e}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BusinessMetricsListView(generics.ListAPIView):
    """
    List business metrics
    """
    serializer_class = BusinessMetricsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = BusinessMetrics.objects.filter(business=self.request.user)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        return queryset.order_by('-date')


class CurrentMetricsView(generics.RetrieveAPIView):
    """
    Get current business metrics
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        try:
            today = timezone.now().date()
            
            # Get today's metrics
            metrics = BusinessMetrics.objects.filter(
                business=request.user,
                date=today
            ).first()
            
            if not metrics:
                # Create empty metrics for today
                metrics = BusinessMetrics.objects.create(
                    business=request.user,
                    date=today
                )
            
            # Get 7-day averages
            week_ago = today - timedelta(days=7)
            week_metrics = BusinessMetrics.objects.filter(
                business=request.user,
                date__gte=week_ago
            ).aggregate(
                avg_response_time=Avg('average_response_time'),
                avg_resolution_rate=Avg('resolution_rate'),
                avg_payment_success_rate=Avg('payment_success_rate')
            )
            
            serializer = BusinessMetricsSerializer(metrics)
            return Response({
                'today': serializer.data,
                'week_averages': week_metrics
            })
            
        except Exception as e:
            logger.error(f"Error getting current metrics: {e}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SubscriptionUsageListView(generics.ListAPIView):
    """
    List subscription usage
    """
    serializer_class = SubscriptionUsageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SubscriptionUsage.objects.filter(business=self.request.user).order_by('-month')


class CurrentSubscriptionUsageView(generics.RetrieveAPIView):
    """
    Get current subscription usage
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        try:
            current_month = timezone.now().date().replace(day=1)
            
            # Get current month usage
            subscription_usage = SubscriptionUsage.objects.filter(
                business=request.user,
                month=current_month
            ).first()
            
            if not subscription_usage:
                # Create subscription usage for current month
                subscription_usage = SubscriptionUsage.objects.create(
                    business=request.user,
                    month=current_month
                )
            
            # Calculate estimated costs
            whatsapp_cost = subscription_usage.whatsapp_messages_used * 0.005  # $0.005 per message
            mpesa_cost = subscription_usage.mpesa_transaction_value * 0.01  # 1% fee
            
            serializer = SubscriptionUsageSerializer(subscription_usage)
            return Response({
                'usage': serializer.data,
                'estimated_costs': {
                    'whatsapp': whatsapp_cost,
                    'mpesa': mpesa_cost,
                    'total': whatsapp_cost + mpesa_cost
                }
            })
            
        except Exception as e:
            logger.error(f"Error getting current subscription usage: {e}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class APICallLogListView(generics.ListAPIView):
    """
    List API call logs
    """
    serializer_class = APICallLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = APICallLog.objects.filter(business=self.request.user)
        
        # Filter by service
        service = self.request.query_params.get('service', None)
        if service:
            queryset = queryset.filter(service=service)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter == 'success':
            queryset = queryset.filter(status_code__gte=200, status_code__lt=300)
        elif status_filter == 'error':
            queryset = queryset.filter(status_code__gte=400)
        
        return queryset.order_by('-created_at')[:100]  # Limit to last 100 calls


class AnalyticsDashboardView(generics.RetrieveAPIView):
    """
    Get analytics dashboard data
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        try:
            today = timezone.now().date()
            week_ago = today - timedelta(days=7)
            month_ago = today - timedelta(days=30)
            
            # Usage summary
            today_usage = UsageLog.objects.filter(
                business=request.user,
                date=today
            ).first()
            
            week_usage = UsageLog.objects.filter(
                business=request.user,
                date__gte=week_ago
            ).aggregate(
                total_messages=Sum('messages_sent') + Sum('messages_received'),
                total_conversations=Sum('conversations_created'),
                total_mpesa_transactions=Sum('mpesa_transaction_count'),
                total_mpesa_value=Sum('mpesa_transaction_value')
            )
            
            # Business metrics
            today_metrics = BusinessMetrics.objects.filter(
                business=request.user,
                date=today
            ).first()
            
            # Recent activity
            recent_conversations = request.user.conversations.order_by('-last_message_at')[:5]
            recent_transactions = request.user.transactions.order_by('-created_at')[:5]
            
            # Performance trends
            performance_trends = []
            for i in range(7):
                date = today - timedelta(days=i)
                day_usage = UsageLog.objects.filter(
                    business=request.user,
                    date=date
                ).first()
                day_metrics = BusinessMetrics.objects.filter(
                    business=request.user,
                    date=date
                ).first()
                
                performance_trends.append({
                    'date': date.isoformat(),
                    'messages': day_usage.messages_sent + day_usage.messages_received if day_usage else 0,
                    'conversations': day_usage.conversations_created if day_usage else 0,
                    'transactions': day_usage.mpesa_transaction_count if day_usage else 0,
                    'response_rate': day_metrics.response_rate if day_metrics else 0
                })
            
            return Response({
                'today_usage': UsageLogSerializer(today_usage).data if today_usage else {},
                'week_summary': week_usage,
                'today_metrics': BusinessMetricsSerializer(today_metrics).data if today_metrics else {},
                'recent_conversations': [
                    {
                        'id': conv.id,
                        'contact_name': conv.contact.name,
                        'source_platform': conv.source_platform,
                        'last_message_at': conv.last_message_at.isoformat(),
                        'unread_count': conv.unread_count
                    }
                    for conv in recent_conversations
                ],
                'recent_transactions': [
                    {
                        'id': trans.id,
                        'amount': str(trans.amount),
                        'status': trans.status,
                        'created_at': trans.created_at.isoformat()
                    }
                    for trans in recent_transactions
                ],
                'performance_trends': performance_trends
            })
            
        except Exception as e:
            logger.error(f"Error getting analytics dashboard: {e}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
