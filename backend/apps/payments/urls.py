from django.urls import path
from . import views

urlpatterns = [
    # Transactions
    path('transactions/', views.TransactionListView.as_view(), name='transaction-list'),
    path('transactions/<int:pk>/', views.TransactionDetailView.as_view(), name='transaction-detail'),
    path('transactions/<int:pk>/status/', views.TransactionStatusView.as_view(), name='transaction-status'),
    
    # Payment Requests
    path('payment-requests/', views.PaymentRequestListView.as_view(), name='payment-request-list'),
    path('payment-requests/<int:pk>/', views.PaymentRequestDetailView.as_view(), name='payment-request-detail'),
    
    # M-Pesa Operations
    path('mpesa/stk-push/', views.InitiateSTKPushView.as_view(), name='initiate-stk-push'),
    path('mpesa/query-status/', views.QuerySTKPushStatusView.as_view(), name='query-stk-push-status'),
    
    # Payment Methods
    path('payment-methods/', views.PaymentMethodListView.as_view(), name='payment-method-list'),
    path('payment-methods/<int:pk>/', views.PaymentMethodDetailView.as_view(), name='payment-method-detail'),
    
    # Receipts
    path('receipts/<int:pk>/', views.PaymentReceiptView.as_view(), name='payment-receipt'),
]
