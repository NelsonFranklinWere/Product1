from django.urls import path
from . import views

urlpatterns = [
    # Usage tracking
    path('usage/', views.UsageLogListView.as_view(), name='usage-log-list'),
    path('usage/current/', views.CurrentUsageView.as_view(), name='current-usage'),
    
    # Business metrics
    path('metrics/', views.BusinessMetricsListView.as_view(), name='business-metrics-list'),
    path('metrics/current/', views.CurrentMetricsView.as_view(), name='current-metrics'),
    
    # Subscription usage
    path('subscription-usage/', views.SubscriptionUsageListView.as_view(), name='subscription-usage-list'),
    path('subscription-usage/current/', views.CurrentSubscriptionUsageView.as_view(), name='current-subscription-usage'),
    
    # API call logs
    path('api-logs/', views.APICallLogListView.as_view(), name='api-call-log-list'),
    
    # Dashboard data
    path('dashboard/', views.AnalyticsDashboardView.as_view(), name='analytics-dashboard'),
]
