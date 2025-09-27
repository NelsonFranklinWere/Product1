import logging
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import get_object_or_404
from .models import User, BusinessProfile, APIKey
from .serializers import (
    UserSerializer, BusinessProfileSerializer, APIKeySerializer,
    RegisterSerializer, LoginSerializer
)

logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    """
    User registration
    """
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create user
        user = serializer.save()
        
        # Create business profile
        BusinessProfile.objects.create(user=user)
        
        # Create auth token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.CreateAPIView):
    """
    User login
    """
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        # Authenticate user
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            if user.is_active:
                login(request, user)
                token, created = Token.objects.get_or_create(user=user)
                
                return Response({
                    'user': UserSerializer(user).data,
                    'token': token.key,
                    'message': 'Login successful'
                })
            else:
                return Response(
                    {'error': 'Account is disabled'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class LogoutView(generics.DestroyAPIView):
    """
    User logout
    """
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, *args, **kwargs):
        try:
            # Delete auth token
            request.user.auth_token.delete()
            
            # Logout user
            logout(request)
            
            return Response({'message': 'Logout successful'})
            
        except Exception as e:
            logger.error(f"Error during logout: {e}")
            return Response(
                {'error': 'Logout failed'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Get and update user profile
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class BusinessProfileView(generics.RetrieveUpdateAPIView):
    """
    Get and update business profile
    """
    serializer_class = BusinessProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        profile, created = BusinessProfile.objects.get_or_create(user=self.request.user)
        return profile


class APIKeyListView(generics.ListCreateAPIView):
    """
    List and create API keys
    """
    serializer_class = APIKeySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return APIKey.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class APIKeyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete an API key
    """
    serializer_class = APIKeySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return APIKey.objects.filter(user=self.request.user)


class SettingsView(generics.RetrieveUpdateAPIView):
    """
    Get and update user settings
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        try:
            user = request.user
            business_profile, created = BusinessProfile.objects.get_or_create(user=user)
            
            return Response({
                'user': UserSerializer(user).data,
                'business_profile': BusinessProfileSerializer(business_profile).data,
                'api_keys': APIKeySerializer(
                    APIKey.objects.filter(user=user), 
                    many=True
                ).data
            })
            
        except Exception as e:
            logger.error(f"Error getting settings: {e}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def patch(self, request, *args, **kwargs):
        try:
            user = request.user
            
            # Update user fields
            user_fields = ['first_name', 'last_name', 'email', 'phone_number']
            for field in user_fields:
                if field in request.data:
                    setattr(user, field, request.data[field])
            user.save()
            
            # Update business profile
            business_profile, created = BusinessProfile.objects.get_or_create(user=user)
            business_profile_fields = [
                'description', 'website', 'logo', 'industry', 'employee_count',
                'kra_pin', 'business_registration_number'
            ]
            for field in business_profile_fields:
                if field in request.data:
                    setattr(business_profile, field, request.data[field])
            business_profile.save()
            
            return Response({
                'user': UserSerializer(user).data,
                'business_profile': BusinessProfileSerializer(business_profile).data,
                'message': 'Settings updated successfully'
            })
            
        except Exception as e:
            logger.error(f"Error updating settings: {e}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user password
    """
    try:
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not old_password or not new_password:
            return Response(
                {'error': 'Old password and new password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify old password
        if not request.user.check_password(old_password):
            return Response(
                {'error': 'Old password is incorrect'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        request.user.set_password(new_password)
        request.user.save()
        
        return Response({'message': 'Password changed successfully'})
        
    except Exception as e:
        logger.error(f"Error changing password: {e}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_business_logo(request):
    """
    Upload business logo
    """
    try:
        if 'logo' not in request.FILES:
            return Response(
                {'error': 'No logo file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        business_profile, created = BusinessProfile.objects.get_or_create(user=request.user)
        business_profile.logo = request.FILES['logo']
        business_profile.save()
        
        return Response({
            'message': 'Logo uploaded successfully',
            'logo_url': business_profile.logo.url if business_profile.logo else None
        })
        
    except Exception as e:
        logger.error(f"Error uploading logo: {e}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
