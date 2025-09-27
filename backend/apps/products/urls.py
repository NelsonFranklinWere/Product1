from django.urls import path
from . import views

urlpatterns = [
    # Products
    path('', views.ProductListView.as_view(), name='product-list'),
    path('<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('<int:pk>/share/', views.ShareProductView.as_view(), name='share-product'),
    path('<int:pk>/analytics/', views.ProductAnalyticsView.as_view(), name='product-analytics'),
    
    # Categories
    path('categories/', views.ProductCategoryListView.as_view(), name='product-category-list'),
    path('categories/<int:pk>/', views.ProductCategoryDetailView.as_view(), name='product-category-detail'),
    
    # Variants
    path('<int:product_id>/variants/', views.ProductVariantListView.as_view(), name='product-variant-list'),
    path('variants/<int:pk>/', views.ProductVariantDetailView.as_view(), name='product-variant-detail'),
    
    # Analytics
    path('analytics/overview/', views.ProductAnalyticsOverviewView.as_view(), name='product-analytics-overview'),
]
