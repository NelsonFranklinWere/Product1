from django.db import models
from django.utils import timezone
from apps.accounts.models import User


class ProductCategory(models.Model):
    """
    Product categories for organization
    """
    business = models.ForeignKey(User, on_delete=models.CASCADE, related_name='product_categories')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'product_categories'
        verbose_name_plural = 'Product Categories'

    def __str__(self):
        return f"{self.name} ({self.business.business_name})"


class Product(models.Model):
    """
    Digital Product Catalog for businesses
    """
    business = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    description = models.TextField()
    short_description = models.CharField(max_length=500, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='KES')
    category = models.ForeignKey(ProductCategory, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Product details
    sku = models.CharField(max_length=100, blank=True)
    unit = models.CharField(max_length=50, default='piece')  # piece, kg, liter, etc.
    is_digital = models.BooleanField(default=False)
    is_service = models.BooleanField(default=False)
    
    # Inventory
    stock_quantity = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=5)
    track_inventory = models.BooleanField(default=True)
    
    # Media
    image_url = models.URLField(blank=True)
    image_file = models.ImageField(upload_to='products/', blank=True, null=True)
    gallery = models.JSONField(default=list, blank=True)  # Additional images
    
    # Status and visibility
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    
    # SEO and marketing
    meta_title = models.CharField(max_length=255, blank=True)
    meta_description = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)
    
    # Analytics
    view_count = models.PositiveIntegerField(default=0)
    share_count = models.PositiveIntegerField(default=0)
    inquiry_count = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.business.business_name})"

    @property
    def is_low_stock(self):
        return self.track_inventory and self.stock_quantity <= self.low_stock_threshold

    @property
    def is_out_of_stock(self):
        return self.track_inventory and self.stock_quantity == 0

    def increment_view_count(self):
        self.view_count += 1
        self.save(update_fields=['view_count'])

    def increment_inquiry_count(self):
        self.inquiry_count += 1
        self.save(update_fields=['inquiry_count'])


class ProductVariant(models.Model):
    """
    Product variants (size, color, etc.)
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=100)  # e.g., "Red", "Large", "Premium"
    sku = models.CharField(max_length=100, blank=True)
    price_modifier = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Additional cost
    stock_quantity = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)  # Store variant-specific data

    class Meta:
        db_table = 'product_variants'
        unique_together = ['product', 'name']

    def __str__(self):
        return f"{self.product.name} - {self.name}"

    @property
    def final_price(self):
        return self.product.price + self.price_modifier


class ProductShare(models.Model):
    """
    Track when products are shared in conversations
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='shares')
    conversation = models.ForeignKey('communications.Conversation', on_delete=models.CASCADE, related_name='product_shares')
    shared_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='product_shares')
    shared_at = models.DateTimeField(auto_now_add=True)
    message = models.ForeignKey('communications.Message', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'product_shares'

    def __str__(self):
        return f"{self.product.name} shared in {self.conversation}"


class ProductEngagement(models.Model):
    """
    Track product engagement metrics
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='engagements')
    date = models.DateField()
    views = models.PositiveIntegerField(default=0)
    shares = models.PositiveIntegerField(default=0)
    inquiries = models.PositiveIntegerField(default=0)
    conversions = models.PositiveIntegerField(default=0)  # Actual purchases

    class Meta:
        db_table = 'product_engagements'
        unique_together = ['product', 'date']

    def __str__(self):
        return f"{self.product.name} - {self.date}"
