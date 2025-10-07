from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError

User = get_user_model()

class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    email = serializers.EmailField(required=True)

class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation"""
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, write_only=True)
    new_password_confirm = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password_confirm": "Passwords do not match"})
        
        try:
            # Decode the uid to get the user
            uid = force_str(urlsafe_base64_decode(attrs['uid']))
            self.user = User._default_manager.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise ValidationError({"uid": "Invalid user ID"})
        
        # Check the token
        if not default_token_generator.check_token(self.user, attrs['token']):
            raise ValidationError({"token": "Invalid or expired token"})
        
        # Validate the new password
        try:
            validate_password(attrs['new_password'], self.user)
        except DjangoValidationError as e:
            raise ValidationError({"new_password": list(e.messages)})
        
        return attrs

class EmailVerificationSerializer(serializers.Serializer):
    """Serializer for email verification"""
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)

    def validate(self, attrs):
        try:
            # Decode the uid to get the user
            uid = force_str(urlsafe_base64_decode(attrs['uid']))
            self.user = User._default_manager.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise ValidationError({"uid": "Invalid user ID"})
        
        # Check the token
        if not default_token_generator.check_token(self.user, attrs['token']):
            raise ValidationError({"token": "Invalid or expired token"})
        
        return attrs

class UserDeactivationSerializer(serializers.Serializer):
    """Serializer for user deactivation"""
    password = serializers.CharField(required=True, write_only=True)
    delete_account = serializers.BooleanField(default=False, required=False)

    def validate_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Incorrect password")
        return value
