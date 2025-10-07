from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model, login, logout
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str, force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.urls import reverse
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.shortcuts import get_object_or_404
from .serializers_auth import (
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    EmailVerificationSerializer,
    UserDeactivationSerializer
)

User = get_user_model()

class PasswordResetRequestView(APIView):
    """
    API endpoint to request a password reset email.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email, is_active=True)
        except User.DoesNotExist:
            # Don't reveal that the user doesn't exist
            return Response(
                {"detail": "If this email exists, a password reset link has been sent."},
                status=status.HTTP_200_OK
            )
        
        # Generate password reset token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Create reset URL
        reset_url = f"{settings.FRONTEND_URL}/reset-password/confirm/{uid}/{token}/"
        
        # Send email
        subject = "Reset Your Password"
        message = render_to_string('emails/password_reset_email.html', {
            'user': user,
            'reset_url': reset_url,
        })
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=message,
            fail_silently=False,
        )
        
        return Response(
            {"detail": "Password reset email has been sent."},
            status=status.HTTP_200_OK
        )

class PasswordResetConfirmView(APIView):
    """
    API endpoint to confirm password reset.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.user
        new_password = serializer.validated_data['new_password']
        
        # Set the new password
        user.set_password(new_password)
        user.save()
        
        return Response(
            {"detail": "Password has been reset successfully."},
            status=status.HTTP_200_OK
        )

class EmailVerificationView(APIView):
    """
    API endpoint to verify user's email.
    """
    permission_classes = [AllowAny]
    
    def get(self, request, uidb64, token):
        # This handles GET requests from email links
        context = {'uid': uidb64, 'token': token}
        return Response(context)
    
    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.user
        
        # Mark email as verified
        user.email_verified = True
        user.save()
        
        # Log the user in
        login(request, user)
        
        return Response(
            {"detail": "Email verified successfully."},
            status=status.HTTP_200_OK
        )

class UserDeactivationView(APIView):
    """
    API endpoint to deactivate or delete user account.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = UserDeactivationSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        delete_account = serializer.validated_data.get('delete_account', False)
        
        if delete_account:
            # Delete the user account
            user.delete()
            message = "Your account has been permanently deleted."
        else:
            # Deactivate the user account
            user.is_active = False
            user.save()
            message = "Your account has been deactivated."
        
        # Log the user out
        logout(request)
        
        return Response(
            {"detail": message},
            status=status.HTTP_200_OK
        )

class ResendVerificationEmailView(APIView):
    """
    API endpoint to resend verification email.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        if user.email_verified:
            return Response(
                {"detail": "Email is already verified."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate verification token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Create verification URL
        verify_url = f"{settings.FRONTEND_URL}/verify-email/confirm/{uid}/{token}/"
        
        # Send email
        subject = "Verify Your Email Address"
        message = render_to_string('emails/verification_email.html', {
            'user': user,
            'verify_url': verify_url,
        })
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=message,
            fail_silently=False,
        )
        
        return Response(
            {"detail": "Verification email has been sent."},
            status=status.HTTP_200_OK
        )
