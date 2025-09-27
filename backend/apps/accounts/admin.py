from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, BusinessProfile, APIKey


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Admin interface for User model
    """
    list_display = ('email', 'business_name', 'subscription_tier', 'is_verified', 'is_active', 'created_at')
    list_filter = ('subscription_tier', 'is_verified', 'is_active', 'created_at')
    search_fields = ('email', 'business_name', 'first_name', 'last_name')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone_number')}),
        ('Business info', {'fields': ('business_name', 'business_type', 'location')}),
        ('Account status', {'fields': ('subscription_tier', 'is_verified', 'is_active', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'business_name', 'business_type'),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')


@admin.register(BusinessProfile)
class BusinessProfileAdmin(admin.ModelAdmin):
    """
    Admin interface for BusinessProfile model
    """
    list_display = ('user', 'industry', 'employee_count', 'created_at')
    list_filter = ('industry', 'employee_count', 'created_at')
    search_fields = ('user__business_name', 'user__email', 'description')
    ordering = ('-created_at',)


@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    """
    Admin interface for APIKey model
    """
    list_display = ('user', 'service', 'key_name', 'is_active', 'created_at')
    list_filter = ('service', 'is_active', 'created_at')
    search_fields = ('user__business_name', 'user__email', 'key_name')
    ordering = ('-created_at',)
