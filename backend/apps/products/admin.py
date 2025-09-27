from django.contrib import admin
from .models import Product, ProductCategory, ProductVariant, ProductShare, ProductEngagement


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'business', 'parent', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at', 'business')
    search_fields = ('name', 'description', 'business__business_name')
    ordering = ('-created_at',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'business', 'category', 'price', 'stock_quantity', 'is_active', 'created_at')
    list_filter = ('is_active', 'is_featured', 'is_available', 'is_digital', 'is_service', 'created_at', 'business')
    search_fields = ('name', 'description', 'sku', 'business__business_name')
    ordering = ('-created_at',)


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('product', 'name', 'price_modifier', 'stock_quantity', 'is_active')
    list_filter = ('is_active', 'product__business')
    search_fields = ('name', 'sku', 'product__name')
    ordering = ('product', 'name')


@admin.register(ProductShare)
class ProductShareAdmin(admin.ModelAdmin):
    list_display = ('product', 'conversation', 'shared_by', 'shared_at')
    list_filter = ('shared_at', 'product__business')
    search_fields = ('product__name', 'conversation__contact__name')
    ordering = ('-shared_at',)


@admin.register(ProductEngagement)
class ProductEngagementAdmin(admin.ModelAdmin):
    list_display = ('product', 'date', 'views', 'shares', 'inquiries', 'conversions')
    list_filter = ('date', 'product__business')
    search_fields = ('product__name',)
    ordering = ('-date',)
