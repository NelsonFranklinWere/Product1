from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """
    Custom User model for SME business owners
    """
    email = models.EmailField(unique=True)
    business_name = models.CharField(max_length=255)
    business_type = models.CharField(max_length=100)
    location = models.CharField(max_length=255, default='Nairobi, Kenya')
    phone_number = models.CharField(max_length=20, blank=True)
    subscription_tier = models.CharField(
        max_length=20,
        choices=[
            ('free', 'Free'),
            ('basic', 'Basic'),
            ('premium', 'Premium'),
            ('enterprise', 'Enterprise'),
        ],
        default='free'
    )
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'business_name']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.business_name} ({self.email})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.business_name


class BusinessProfile(models.Model):
    """
    Extended business profile information
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='business_profile')
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to='business_logos/', blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True)
    employee_count = models.CharField(
        max_length=20,
        choices=[
            ('1-5', '1-5 employees'),
            ('6-20', '6-20 employees'),
            ('21-50', '21-50 employees'),
            ('51-100', '51-100 employees'),
            ('100+', '100+ employees'),
        ],
        blank=True
    )
    kra_pin = models.CharField(max_length=20, blank=True)
    business_registration_number = models.CharField(max_length=50, blank=True)
    
    class Meta:
        db_table = 'business_profiles'

    def __str__(self):
        return f"{self.user.business_name} Profile"


class APIKey(models.Model):
    """
    Store API keys for external integrations
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_keys')
    service = models.CharField(
        max_length=50,
        choices=[
            ('facebook', 'Facebook'),
            ('whatsapp', 'WhatsApp'),
            ('mpesa', 'M-Pesa'),
        ]
    )
    key_name = models.CharField(max_length=100)  # e.g., "Page Access Token", "Consumer Key"
    encrypted_key = models.TextField()  # Store encrypted API keys
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'api_keys'
        unique_together = ['user', 'service', 'key_name']

    def __str__(self):
        return f"{self.user.business_name} - {self.service} - {self.key_name}"
