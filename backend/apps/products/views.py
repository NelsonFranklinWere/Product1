import logging
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta
from .models import Product, ProductCategory, ProductVariant, ProductShare, ProductEngagement
from .serializers import (
    ProductSerializer, ProductCategorySerializer, ProductVariantSerializer,
    ProductShareSerializer, ProductEngagementSerializer
)
from apps.analytics.middleware import UsageIncrementer

logger = logging.getLogger(__name__)


class ProductListView(generics.ListCreateAPIView):
    """
    List and create products
    """
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Product.objects.filter(business=self.request.user)
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(sku__icontains=search)
            )
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category_id=category)
        
        # Filter by status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Filter by stock status
        stock_status = self.request.query_params.get('stock_status', None)
        if stock_status == 'low':
            queryset = queryset.filter(
                track_inventory=True,
                stock_quantity__lte=models.F('low_stock_threshold')
            )
        elif stock_status == 'out':
            queryset = queryset.filter(
                track_inventory=True,
                stock_quantity=0
            )
        
        return queryset.select_related('category').order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(business=self.request.user)


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a product
    """
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Product.objects.filter(business=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve product and increment view count
        """
        instance = self.get_object()
        instance.increment_view_count()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class ShareProductView(generics.CreateAPIView):
    """
    Share a product in a conversation
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        try:
            product = get_object_or_404(
                Product,
                id=kwargs.get('pk'),
                business=request.user
            )
            
            conversation_id = request.data.get('conversation_id')
            if not conversation_id:
                return Response(
                    {'error': 'Conversation ID is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            from apps.communications.models import Conversation
            conversation = get_object_or_404(
                Conversation,
                id=conversation_id,
                business=request.user
            )
            
            # Create product share record
            product_share = ProductShare.objects.create(
                product=product,
                conversation=conversation,
                shared_by=request.user
            )
            
            # Increment product share count
            product.increment_inquiry_count()
            
            # Log usage
            UsageIncrementer.increment_general_usage(request.user, 'product_shared')
            
            # Send product message via appropriate platform
            if conversation.source_platform == 'whatsapp':
                from apps.communications.whatsapp_service import WhatsAppBusinessService
                service = WhatsAppBusinessService()
                service.send_product_message(
                    conversation.contact.phone_number,
                    product,
                    request.user
                )
            elif conversation.source_platform == 'facebook':
                from apps.communications.facebook_service import FacebookMessengerService
                service = FacebookMessengerService()
                product_text = f"🛍️ *{product.name}*\n\n{product.short_description or product.description}\n\n💰 Price: KES {product.price}\n\nWould you like to purchase this item?"
                service.send_message(
                    conversation.contact.facebook_id,
                    product_text,
                    request.user
                )
            
            serializer = ProductShareSerializer(product_share)
            return Response({
                'success': True,
                'product_share': serializer.data
            })
            
        except Exception as e:
            logger.error(f"Error sharing product: {e}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProductAnalyticsView(generics.RetrieveAPIView):
    """
    Get product analytics
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        try:
            product = get_object_or_404(
                Product,
                id=kwargs.get('pk'),
                business=request.user
            )
            
            # Get analytics data
            shares = ProductShare.objects.filter(product=product)
            engagements = ProductEngagement.objects.filter(product=product)
            
            # Calculate metrics
            total_shares = shares.count()
            total_views = product.view_count
            total_inquiries = product.inquiry_count
            
            # Recent activity (last 30 days)
            thirty_days_ago = timezone.now() - timedelta(days=30)
            recent_shares = shares.filter(shared_at__gte=thirty_days_ago).count()
            recent_engagements = engagements.filter(date__gte=thirty_days_ago.date())
            
            # Engagement trends
            engagement_trends = []
            for i in range(7):  # Last 7 days
                date = (timezone.now() - timedelta(days=i)).date()
                day_engagement = engagements.filter(date=date).first()
                engagement_trends.append({
                    'date': date.isoformat(),
                    'views': day_engagement.views if day_engagement else 0,
                    'shares': day_engagement.shares if day_engagement else 0,
                    'inquiries': day_engagement.inquiries if day_engagement else 0
                })
            
            return Response({
                'product_id': product.id,
                'product_name': product.name,
                'total_views': total_views,
                'total_shares': total_shares,
                'total_inquiries': total_inquiries,
                'recent_shares': recent_shares,
                'engagement_trends': engagement_trends,
                'conversion_rate': (total_inquiries / total_views * 100) if total_views > 0 else 0
            })
            
        except Exception as e:
            logger.error(f"Error getting product analytics: {e}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProductCategoryListView(generics.ListCreateAPIView):
    """
    List and create product categories
    """
    serializer_class = ProductCategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ProductCategory.objects.filter(business=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(business=self.request.user)


class ProductCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a product category
    """
    serializer_class = ProductCategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ProductCategory.objects.filter(business=self.request.user)


class ProductVariantListView(generics.ListCreateAPIView):
    """
    List and create product variants
    """
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        return ProductVariant.objects.filter(
            product_id=product_id,
            product__business=self.request.user
        )
    
    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_id')
        product = get_object_or_404(
            Product,
            id=product_id,
            business=self.request.user
        )
        serializer.save(product=product)


class ProductVariantDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a product variant
    """
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ProductVariant.objects.filter(product__business=self.request.user)


class ProductAnalyticsOverviewView(generics.RetrieveAPIView):
    """
    Get overall product analytics
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        try:
            # Get all products for the business
            products = Product.objects.filter(business=request.user)
            
            # Calculate overall metrics
            total_products = products.count()
            active_products = products.filter(is_active=True).count()
            low_stock_products = products.filter(
                track_inventory=True,
                stock_quantity__lte=models.F('low_stock_threshold')
            ).count()
            out_of_stock_products = products.filter(
                track_inventory=True,
                stock_quantity=0
            ).count()
            
            # Total views, shares, inquiries
            total_views = products.aggregate(total=Sum('view_count'))['total'] or 0
            total_shares = ProductShare.objects.filter(
                product__business=request.user
            ).count()
            total_inquiries = products.aggregate(total=Sum('inquiry_count'))['total'] or 0
            
            # Top performing products
            top_products = products.order_by('-view_count')[:5]
            top_products_data = [
                {
                    'id': p.id,
                    'name': p.name,
                    'views': p.view_count,
                    'shares': p.share_count,
                    'inquiries': p.inquiry_count
                }
                for p in top_products
            ]
            
            # Category distribution
            category_stats = products.values('category__name').annotate(
                count=Count('id'),
                total_views=Sum('view_count')
            ).order_by('-count')
            
            return Response({
                'total_products': total_products,
                'active_products': active_products,
                'low_stock_products': low_stock_products,
                'out_of_stock_products': out_of_stock_products,
                'total_views': total_views,
                'total_shares': total_shares,
                'total_inquiries': total_inquiries,
                'top_products': top_products_data,
                'category_distribution': list(category_stats)
            })
            
        except Exception as e:
            logger.error(f"Error getting product analytics overview: {e}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
