from rest_framework import serializers
from .models import Product, ProductCategory, ProductVariant, ProductShare, ProductEngagement


class ProductCategorySerializer(serializers.ModelSerializer):
    """
    Serializer for ProductCategory model
    """
    class Meta:
        model = ProductCategory
        fields = [
            'id', 'name', 'description', 'parent', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ProductVariantSerializer(serializers.ModelSerializer):
    """
    Serializer for ProductVariant model
    """
    final_price = serializers.ReadOnlyField()
    
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'name', 'sku', 'price_modifier', 'stock_quantity',
            'is_active', 'metadata', 'final_price'
        ]
        read_only_fields = ['id']


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer for Product model
    """
    category = ProductCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False)
    variants = ProductVariantSerializer(many=True, read_only=True)
    is_low_stock = serializers.ReadOnlyField()
    is_out_of_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'short_description', 'price', 'currency',
            'category', 'category_id', 'sku', 'unit', 'is_digital', 'is_service',
            'stock_quantity', 'low_stock_threshold', 'track_inventory',
            'image_url', 'image_file', 'gallery', 'is_active', 'is_featured',
            'is_available', 'meta_title', 'meta_description', 'tags',
            'view_count', 'share_count', 'inquiry_count', 'variants',
            'is_low_stock', 'is_out_of_stock', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'view_count', 'share_count', 'inquiry_count',
            'created_at', 'updated_at', 'is_low_stock', 'is_out_of_stock'
        ]

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Name is required')
        return value

    def validate_price(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError('Price must be greater than 0')
        return value


class ProductShareSerializer(serializers.ModelSerializer):
    """
    Serializer for ProductShare model
    """
    product = ProductSerializer(read_only=True)
    conversation_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = ProductShare
        fields = [
            'id', 'product', 'conversation_id', 'shared_by', 'shared_at', 'message'
        ]
        read_only_fields = ['id', 'shared_at']


class ProductEngagementSerializer(serializers.ModelSerializer):
    """
    Serializer for ProductEngagement model
    """
    class Meta:
        model = ProductEngagement
        fields = [
            'id', 'product', 'date', 'views', 'shares', 'inquiries', 'conversions'
        ]
        read_only_fields = ['id']


class ProductAnalyticsSerializer(serializers.Serializer):
    """
    Serializer for product analytics
    """
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    total_views = serializers.IntegerField()
    total_shares = serializers.IntegerField()
    total_inquiries = serializers.IntegerField()
    recent_shares = serializers.IntegerField()
    engagement_trends = serializers.ListField()
    conversion_rate = serializers.FloatField()


class ProductAnalyticsOverviewSerializer(serializers.Serializer):
    """
    Serializer for product analytics overview
    """
    total_products = serializers.IntegerField()
    active_products = serializers.IntegerField()
    low_stock_products = serializers.IntegerField()
    out_of_stock_products = serializers.IntegerField()
    total_views = serializers.IntegerField()
    total_shares = serializers.IntegerField()
    total_inquiries = serializers.IntegerField()
    top_products = serializers.ListField()
    category_distribution = serializers.ListField()
