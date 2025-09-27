from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, BusinessProfile, APIKey


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model
    """
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'business_name', 'business_type', 'location', 'phone_number',
            'subscription_tier', 'is_verified', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'full_name']


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'business_name', 'business_type',
            'location', 'phone_number'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login
    """
    email = serializers.EmailField()
    password = serializers.CharField()


class BusinessProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for BusinessProfile model
    """
    class Meta:
        model = BusinessProfile
        fields = [
            'id', 'description', 'website', 'logo', 'industry', 'employee_count',
            'kra_pin', 'business_registration_number'
        ]
        read_only_fields = ['id']


class APIKeySerializer(serializers.ModelSerializer):
    """
    Serializer for APIKey model
    """
    class Meta:
        model = APIKey
        fields = [
            'id', 'service', 'key_name', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # In a real implementation, you would encrypt the API key
        # For now, we'll just store it as plain text (NOT RECOMMENDED FOR PRODUCTION)
        validated_data['encrypted_key'] = validated_data.get('encrypted_key', '')
        return super().create(validated_data)


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing password
    """
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs
